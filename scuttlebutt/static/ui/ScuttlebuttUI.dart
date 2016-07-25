#import('dart:html');
#import('dart:json');

bool DEBUG = false; // will be flipped automatically on testing machine's localhost
final num VERY_LARGE_NUMBER = 1000000000;
final String NOT_AVAILABLE_STRING = "N/A";

/**
 * [Table] adds some utility functions on top of the TableElement. 
 */
class Table {
  TableElement tableElement;

  Table.fromDomQuery(String domQuery) {
    tableElement = document.query(domQuery);
    if (tableElement == null)
      throw "Table element $domQuery could not be found.";
  }

  /**
    Adds a row to the table. A row is represented by a List of Strings. Each list
    element is a <td>. Its HTML content will be the string.

    E.g.: addRow(["blah"]); will create this row: "<tr><td>blah</td></tr>".

    When element in List is null, cell will contain "N/A".
   */
  Element addRow(List<String> row) {
    Element tr = new Element.tag('tr');
    row.forEach((column) {
        Element td = new Element.tag('td');
        if (column != null) {
          td.innerHTML = column;
        } else {
          td.innerHTML = NOT_AVAILABLE_STRING;
        }
        tr.elements.add(td);
    });
    tableElement.elements.add(tr);
    return tr;
  }

  /**
    Convenience function that makes a call to addRow given a JSON record.
    */
  void addData(List<Map<String,String>> data) {
    for (Map<String,String> record in data) {
      addRow(
          [
          record['title'],
          prettifyUrl(record['url']),
          prettifyDate(record['updated']),
          record.containsKey("readership") ? 
              prettifyInt(Math.parseInt(record["readership"])) 
              : "N/A"
          ]
          );
    }
  }

  /**
    Deletes all rows from the table element. (Not the header, by default.)
   */
  void reset([bool resetAllNodes=false]) {
    if (resetAllNodes) {
      tableElement.nodes.clear();
    } else {
      for (Element tr in tableElement.queryAll("tr:not(.header)")) {
        tr.remove();
      }
    }

  }
}

/**
 * A class representing one day's worth of statistics for
 * a given TopicStats.
 *
 * I.e.: day 2012-12-26 saw 5 articles about 'Android'...
 */ 
class TopicStatsDay implements Comparable {
  Date date;
  int count;
  num wowChange;
  TableCellElement td;
  // num sentiment;  // not used, but I'm leaving this here for future gen

  TopicStatsDay.fromJson(Map<String,Object> jsonData) {
    if (!jsonData.containsKey("date") || !jsonData.containsKey("count")) {
      throw "JSON data corrupt. Couldn't find keys.";
    }
    count = jsonData["count"];
    date = dateFromString(jsonData["date"]);
  }

  int compareTo(TopicStatsDay other) {
    return date.compareTo(other.date);
  }
}

/**
 * A class representing stats data for a given topic. Includes all the days
 * as TopicStatsDay objects.
 */ 
class TopicStats {
  List<TopicStatsDay> days;
  int maxCount = 0;
  num avgCount;

  TopicStats.fromJson(List<Map<String,Object>> jsonData) {
    days = new List<TopicStatsDay>();
    jsonData.forEach((Map<String,Object> jsonRecord) {
        days.add(new TopicStatsDay.fromJson(jsonRecord));
        });
    // sort days from most recent to oldest
    days.sort((TopicStatsDay a, TopicStatsDay b) => -a.compareTo(b));
    // now we compute WoW changes and MaxCount
    int absCount = 0;
    for (int i = days.length - 1; i >= 0; i--) {
      TopicStatsDay curr = days[i];
      maxCount = Math.max(maxCount, curr.count);
      absCount += curr.count;
      if (i == days.length - 1) 
        continue;  // don't compute WoW change for first available day
      TopicStatsDay prev = days[i+1];
      if (prev.count == 0) {
        if (curr.count > 0)
          curr.wowChange = VERY_LARGE_NUMBER + 1.0;
        else
          curr.wowChange = 0.0;
      } else {
        curr.wowChange = (curr.count / prev.count) - 1.0;
      }

      //print("$i-th day: count = ${curr.count}, change = ${curr.wowChange}");
    }
    avgCount = absCount / days.length;
  }
}

/**
 * [BarChart] represents the bar chart graph at the top of Articles list.
 */
class BarChart {
  ArticlesUiView articlesUiView;
  TableElement tableElement;
  SpanElement _articlesCountElement;
  SpanElement _articlesCountWowElement;
  SpanElement _articlesSentimentElement;
  SpanElement _articlesSentimentWowElement;
  InputElement articlesFromElement;
  InputElement articlesToElement;

  // A map topic_id -> stats. This allows for caching data that have 
  // already been downloaded.
  Map<int,TopicStats> topicStatsCache;   

  int currentId;
    
  int _startDragI;
  int _endDragI;

  final int MAX_DAYS = 90;  // ~3 months

  BarChart.fromDomQuery(
      String domQuery,
      [
      ArticlesUiView articlesUiView_=null,
      String countEl="#articles-count",
      String countWowEl="#articles-count-wow",
      String sentimentEl="#articles-sentiment",
      String sentimentWowEl="#articles-sentiment-wow",
      String fromEl="#articles-from",
      String toEl="#articles-to"
      ]) {
    topicStatsCache = new Map<int,TopicStats>();
    tableElement = document.query(domQuery);
    articlesUiView = articlesUiView_;

    _articlesCountElement = document.query(countEl);
    _articlesCountWowElement = document.query(countWowEl);
    _articlesSentimentElement = document.query(sentimentEl);
    _articlesSentimentWowElement = document.query(sentimentWowEl);
    articlesFromElement = document.query(fromEl);
    articlesToElement = document.query(toEl);
    
    articlesFromElement.on.blur.add((Event ev) {
      articlesUiView.fromDate = dateFromString(articlesFromElement.value);
      articlesUiView.fetchData().then((_) => articlesUiView.populateTable());
    });
    articlesToElement.on.blur.add((Event ev) {
      articlesUiView.toDate = dateFromString(articlesToElement.value);
      articlesUiView.fetchData().then((_) => articlesUiView.populateTable());
    });
  }

  String getURL(int id) {
    if (DEBUG) {
      return "/api/get_topic_stats_new_mock.json";
    } else {
      return "/api/topic_stats/$id";
    }
  }

  /**
   * Shows barchart for given [Topic] id.
   */
  void show(int id) {
    currentId = id;

    if (topicStatsCache.containsKey(id)) {
      populateChart(id);
    } else {
      fetchData(id)
      .then((_) => populateChart());;
    }
  }

  /**
   * Populates the bar chart with data. Run after you [fetchData()] first.
   * This method also makes sure the barchart is interactive and dragging
   * over it works.
   */
  void populateChart([int id_]) {
    int id = (id_ != null) ? id_ : currentId;
    TopicStats topicStats = topicStatsCache[id];

    reset();
    
    if (topicStats.days.length == 0 || topicStats.maxCount == 0)
      return;

    Element tr = new Element.tag('tr');
    for (var i = MAX_DAYS - 1; i >= 0; i--) {
      Element td = new Element.tag('td');
      Element div = new Element.tag('div');

      int percentage;
      if (i < topicStats.days.length) {
        topicStats.days[i].td = td;
        percentage = 
          (topicStats.days[i].count / topicStats.maxCount * 100).toInt();  
        div.classes.add("blue-bar");
        td.classes.add("data-available");
      } else {
        // 75 instead of 100 for esthetic purposes only
        percentage = (
            Math.random() * topicStats.avgCount / topicStats.maxCount * 75
            ).toInt();  
        div.classes.add("gray-bar");
      }
      div.style.height = "$percentage%";

      td.elements.add(div);
      tr.elements.add(td);

      td.dataAttributes = {"pos": i};

      td.on.mouseOver.add((MouseEvent e) {
        Element el = e.currentTarget;
        if (el.dataAttributes.containsKey("pos")) {
          int pos = Math.parseInt(el.dataAttributes["pos"]);
          
          if (pos > topicStats.days.length - 1) {
            updateContextual(count:"no data");
          } else {
            String countWow;
            
            if (topicStats.days[pos].wowChange != null) {
            if (topicStats.days[pos].wowChange > VERY_LARGE_NUMBER)
              countWow = "+&#8734;%";
            else
              countWow = "${topicStats.days[pos].wowChange >= 0.0 ? '+' : '-'}${(topicStats.days[pos].wowChange.abs() * 100).toInt()}%";
              
            if (_startDragI != null) {
              int min = Math.min(_startDragI, pos);
              int max = Math.max(_startDragI, pos);
              for (int j=0; j < Math.min(topicStats.days.length, MAX_DAYS); j++) {
                topicStats.days[j].td.classes.remove("selected");
                if (j >= min && j <= max)
                  topicStats.days[j].td.classes.add("selected");
              }
            }
          }
          
          updateContextual(
            count:topicStats.days[pos].count.toString(),
            countWow:countWow
            );
          }
        }
      });

      td.on.mouseDown.add((MouseEvent e) {
        Element el = e.currentTarget;
        if (el.dataAttributes.containsKey("pos")) {
          int pos = Math.parseInt(el.dataAttributes["pos"]);
          if (pos < topicStats.days.length) {
            _startDragI = pos;
          }
        }
        e.stopPropagation();
        e.preventDefault();
      });
      
      td.on.mouseUp.add((MouseEvent e) {
        Element el = e.currentTarget;
        if (el.dataAttributes.containsKey("pos")) {
          int pos = Math.parseInt(el.dataAttributes["pos"]);
          if (pos < topicStats.days.length) {
            _endDragI = pos;
            if (_startDragI == null)
              _startDragI = pos;
            articlesUiView.fromDate = topicStats.days[Math.max(_startDragI, _endDragI)].date;
            articlesUiView.toDate = topicStats.days[Math.min(_startDragI, _endDragI)].date;
            articlesUiView.fetchData().then((_) => articlesUiView.populateTable());
            updateDateRange();
            _startDragI = _endDragI = null;
          }
        }
        e.stopPropagation();
        e.preventDefault();
      });
    }

    tableElement.elements.add(tr);

    tableElement.on.mouseOut.add((MouseEvent e) {
        Element el = e.toElement;
        // check if we're actually mousing out of the table (not just a sub-element)
        if (!tableElement.contains(el)) {
          updateContextual();
          _startDragI = null;
        }      
    });
    
    updateDateRange();
  }

  /**
    * Updates the text on the left below the barchart with info about
    * the currently mouse-over'd bar.
    */ 
  void updateContextual([
      String count=NOT_AVAILABLE_STRING,
      String countWow=NOT_AVAILABLE_STRING,
      String sentiment=NOT_AVAILABLE_STRING,
      String sentimentWow=NOT_AVAILABLE_STRING
      ]) {   
    _articlesCountElement.innerHTML = count;
    _articlesCountWowElement.innerHTML = countWow;
  }

  /**
    * Update BarChart to show the currently selected date range.
    */
  void updateDateRange() {
    articlesFromElement.value = articlesUiView.fromDateShort;
    articlesToElement.value = articlesUiView.toDateShort;
    
    // show bars as selected
    TopicStats topicStats = topicStatsCache[currentId];
    if (topicStats != null && !topicStats.days.isEmpty()) {
      print("Updating date range: ${articlesUiView.fromDate} to ${articlesUiView.toDate}");
      topicStats.days.forEach((TopicStatsDay day) {
        if (day.td != null) {
          day.td.classes.remove("selected");
          if (day.date.difference(articlesUiView.fromDate).inDays >= 0
              && day.date.difference(articlesUiView.toDate).inDays <= 0)
            day.td.classes.add("selected");
        }
      });
    }
  }

  /**
   * Creates XMLHttpRequest, sends it, receives, acts on it, returns Future when done. 
   * TODO(filiph): better exception handling
   * TODO(filiph): this is not DRY, candidate for refactoring
   */
  Future<bool> fetchData(int id, [String url_=null]) {
    Completer completer = new Completer();
    articlesUiView.scuttlebuttUi.showLoader("barchart");
    
    String url = (url_ == null) ? getURL(id) : url_;
    XMLHttpRequest request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.on.load.add((event) {
        if (request.status == 404) {
          window.console.error("TOFIX: Could not retrieve $url. Maybe stats are not implemented yet?");
          print("Trying to load mock data.");
          fetchData(id, url_:"https://scuttlebutt.googleplex.com/ui/api/get_topic_stats_new_mock.json")
          .then((_) => populateChart());;
        } else {
          topicStatsCache[id] = new TopicStats.fromJson(JSON.parse(request.responseText));

          print("${topicStatsCache[id].days.length} new stats loaded for the bar chart.");

          completer.complete(true);
          articlesUiView.scuttlebuttUi.hideLoader("barchart");
        }
    });
    request.send();
    return completer.future;
  }

  void reset() {
    tableElement.nodes.clear();
  }
}

/**
 * UiView is a base class for all of the "Tabs" in the UI.
 */
class UiView {
  Table outputTable;
  DivElement divElement;
  ButtonElement mainButton;
  ScuttlebuttUi scuttlebuttUi;
  String baseUrl; // e.g. /api/articles
  String currentUrl; // e.g. /api/articles/123?limit=200 ...
  Function getUrl; // returns URL string for given parameters
  
  int currentOffset;
  int currentLimit;
  static final int LOAD_LIMIT = 20;  // articles per page/request
  
  void set visibility(bool value) {
    if (value == true) {
      divElement.style.display = "block";
      mainButton.classes.add("selected");
    } else {
      divElement.style.display = "none";
      mainButton.classes.remove("selected");
    }
  }
  
  bool get visibility() => (divElement.style.display == "block");
  
  /**
    Sends asynchronously for data, 
    returns Future with the responseText string as value.
    */
  Future<String> sendXhr(String url, String method, 
        [Map params, String debugUrl]) {
    if (params != null && params.length > 0) {
      if (method == "GET") {
        StringBuffer strBuf = new StringBuffer();
        strBuf.add(url);
        bool first = true;
        params.forEach((String key, Dynamic value) {
          if (first) {
            strBuf.add("?");
            first = false;
          } else {
            strBuf.add("&");
          }
          strBuf.add(key);
          strBuf.add("=");
          strBuf.add(value.toString());
        });
        url = strBuf.toString();
      }
    }
    
    Completer completer = new Completer();
    XMLHttpRequest request = new XMLHttpRequest();
    if (DEBUG)
      request.open("GET", debugUrl, true);
    else
      request.open(method, url, true);
    
    request.on.load.add((event) {
        if (request.status != 200) {
          scuttlebuttUi.statusMessage("Server error!");
          completer.completeException(new Exception("Server returned status code ${request.status} (${request.statusText})"));
        }
        completer.complete(request.responseText);
    });
    
    if (method == "GET")
      request.send();
    else
      request.send(JSON.stringify(params));
    
    return completer.future;
  }
}

/**
 * ArticlesUiView is the Articles tab.
 */
class ArticlesUiView extends UiView {
  BarChart barChart;
  ButtonElement _loadMoreButton;
  Map<int,List> data;
  int currentId;

  Date fromDate;
  Date toDate;

  // count number of articles that are loaded but haven't been shown yet
  // by populateTable
  int _waitingToBeShown;

  ArticlesUiView() {
    baseUrl = "/api/articles";
    data = new Map();
    barChart = new BarChart.fromDomQuery("table#articles-stats", articlesUiView_:this);
    divElement = document.query("div#articles-div");
    mainButton = document.query("button#articles-button");
    outputTable = new Table.fromDomQuery("table#articles-table");
    _loadMoreButton = document.query("button#load-more-button");
    _waitingToBeShown = 0;
    currentLimit = LOAD_LIMIT;

    _loadMoreButton.on.click.add((Event event) {
        currentOffset += LOAD_LIMIT;
        fetchData()
        .then((_) {
          populateTable(reset:false);
        });
    });
  }

  // TODO(filiph): iso has a tailing Z (as timezone) - apply on back end, then change here
  String get fromDateIso() => "${fromDate.year}-${fromDate.month < 10 ? '0' : ''}${fromDate.month}-${fromDate.day < 10 ? '0' : ''}${fromDate.day}T${fromDate.hours < 10 ? '0' : ''}${fromDate.hours}:${fromDate.minutes < 10 ? '0' : ''}${fromDate.minutes}:${fromDate.seconds < 10 ? '0' : ''}${fromDate.seconds}";
  String get toDateIso() => "${toDate.year}-${toDate.month < 10 ? '0' : ''}${toDate.month}-${toDate.day < 10 ? '0' : ''}${toDate.day}T${toDate.hours < 10 ? '0' : ''}${toDate.hours}:${toDate.minutes < 10 ? '0' : ''}${toDate.minutes}:${toDate.seconds < 10 ? '0' : ''}${toDate.seconds}";

  String get fromDateShort() => fromDateIso.substring(0, 10);
  String get toDateShort() => toDateIso.substring(0, 10);

  /**
    Shows articles for given [Topic] id. Run this the first time you want
    to show the articles.
   */
  void show(int id) {
    currentId = id;
    currentOffset = 0;

    fromDate = new Date.now().subtract(new Duration(days:7));
    toDate = new Date.now();

    if (data.containsKey(id)) {
      _waitingToBeShown = data[id].length;
      populateTable();
    } else {
      fetchData().then((_) => populateTable());
    }

    barChart.show(id);
  }
  
  /**
    * Handle the ajax request's responseText, put it into the data variable.
    */
  void actOnData(String responseText) {
    if (currentOffset == 0) 
      data[currentId] = [];
    List responseJson = JSON.parse(responseText);
    _waitingToBeShown = responseJson.length;

    if (_waitingToBeShown > 0) {
      data[currentId].addAll(responseJson);
      print("${responseJson.length} new articles loaded.");
    }
  }

  /**
   * Populates the article Table with data. If reset is false,
   * it will add to the current table instead of replacing it.
   */
  void populateTable([bool reset=true]) {
    int id = currentId;
    
    if (reset)
      outputTable.reset();

    if (_waitingToBeShown > 0) {
      outputTable.addData(data[id].getRange(data[id].length - _waitingToBeShown, _waitingToBeShown));
      _waitingToBeShown = 0;
    } else if (currentOffset == 0) {
      outputTable.addRow(["No articles", "", "", ""]);
    }
    
    visibility = true;
    barChart.updateDateRange();
  }

  /**
   * Sends XMLHttpRequest, shows loader, acts on data, hides loader, returns Future.
   * TODO(filiph): candidate for refactoring, not DRY
   */
  Future<bool> fetchData() {
    Completer completer = new Completer();
    scuttlebuttUi.showLoader("articles");
    sendXhr(
      "$baseUrl/$currentId", 
      "GET", 
      params:{
        "from": fromDateShort, "to": toDateShort,
        "offset": currentOffset, "limit": currentLimit
      }, 
      debugUrl:"/api/get_articles_mock.json"
    ).then((String responseText) {
        actOnData(responseText);
        completer.complete(true);
        scuttlebuttUi.hideLoader("articles");
      });
    return completer.future;
  }

  /**
    * Gets rid of cached data.
    */
  void refresh() {
    data = new Map();
  }
}


/**
 * Simple class for holding Topics data: name, id, etc...
 */
class Topic {
  int id;
  String name;
  String searchTerm;
  int countPastTwentyFourHours;
  int countPastSevenDays;
  num weekOnWeekChange;

  Topic.fromJson(Map<String,Object> jsonData) {
    if (!jsonData.containsKey("id") || !jsonData.containsKey("name")) {
      throw "JSON data corrupt. Couldn't find 'id' or 'name'.";
    }
    id = jsonData["id"];
    name = jsonData["name"];
    searchTerm = jsonData["searchTerm"];
    countPastTwentyFourHours = jsonData["countPastTwentyFourHours"];
    countPastSevenDays = jsonData["countPastSevenDays"];
    weekOnWeekChange = jsonData["weekOnWeekChange"];
  }
}

/**
 * TopicsUiViewView handles ajax calls and shows the data on the client 
 * for the Topics tab.
 */
class TopicsUiView extends UiView {
  List<Topic> topics;
  
  ButtonElement _createButton;
  TableRowElement _createRow;
  InputElement _nameInput;

  TopicsUiView() {
    baseUrl = "/api/topics";
    _createButton = document.query("#add-topic-button");
    divElement = document.query("div#topics-div");
    mainButton = document.query("button#topics-button");
    outputTable = new Table.fromDomQuery("table#topics-table");
    
    _createButton.on.click.add(showCreateRow);
  }
  
  /**
    * Creates the row that allows user to add new Topics.
    */ 
  void showCreateRow(Event e) {
    if (outputTable == null)
      throw "Couldn't find outputTable.";
    if (_createRow == null) {
      // create the input row (top of table)
      _createRow = outputTable.tableElement.insertRow(1);
      // create input cell
      TableCellElement nameCell = _createRow.insertCell(0);
      _nameInput = new Element.tag("input");
      _nameInput.type = "text";
      nameCell.elements.add(_nameInput);
      _nameInput.focus();
      _nameInput.on.keyPress.add((Event ev) {
        if (ev.dynamic.charCode == 13) // Enter pressed
          postNew(ev);
      });
      // create & discard buttons
      TableCellElement buttonCell = _createRow.insertCell(1);
      buttonCell.colSpan = 3;
      ButtonElement createButton = new Element.tag("button");
      createButton.text = "Create";
      buttonCell.elements.add(createButton);
      createButton.on.click.add(postNew);
      ButtonElement discardButton = new Element.tag("button");
      discardButton.text = "Discard";
      buttonCell.elements.add(discardButton);
      discardButton.on.click.add((Event ev) {
        _createRow.remove();
        _createRow = null;
      });
    }
  }
  
  
  void postNew(Event e) {
    if (_nameInput.value == "")
      return;
    print("Posting new record.");
    
    sendXhr(baseUrl, "POST", 
      params:{ "name": _nameInput.value },
      debugUrl:"/api/post_topics_mock.json"
    ).then((String responseText) {
      _createRow.remove();
      _createRow = null;
      topics = null;
      scuttlebuttUi.parseUrl();
    });
  }

  void show() {
    if (topics != null) {
      populateTable();
    } else {
      fetchData().then((_) => populateTable());
    }
  }

  /**
   * Populates the DOM with data.
   */
  void populateTable([bool reset=true]) {
    if (reset)
      outputTable.reset();
    
    for (Topic topic in topics) {
      String topicNameHtml = "${topic.name} <a class='more-actions'>&hellip;</a>";
      String wowChangeHtml;
      if (topic.weekOnWeekChange != null) {
        String changeStr;
        String changeSign;
        if (topic.weekOnWeekChange > VERY_LARGE_NUMBER) {
          changeStr = "&#8734;";  // infinity symbol
          changeSign = "+";
        } else {
          changeStr = ((topic.weekOnWeekChange)*100.0).abs().round().toString();
          changeSign = (topic.weekOnWeekChange >= 0.0) ? "+" : "-";
        }
        wowChangeHtml = "<span class=\"${(changeSign=='+'?'green':'red')}\">$changeSign$changeStr%</span>"; 
      }

      // adds a row with 4 cells: name, count for past 24h, count for past 7d,
      // and week on week change
      Element tr = outputTable.addRow(
          [ topicNameHtml, topic.countPastTwentyFourHours, 
          topic.countPastSevenDays, wowChangeHtml ]
          );
      tr.on.click.add((event) {
          scuttlebuttUi.listArticles(topic.id);
          if (window.scrollY > 400)
            window.scrollTo(0, 0);
      });
    };
    visibility = true;
  }

  /**
   * Sends XMLHttpRequest, shows loader, acts on data, hides loader, returns Future.
   * TODO(filiph): candidate for refactoring, not DRY
   */
  Future<bool> fetchData() {
    Completer completer = new Completer();
    scuttlebuttUi.showLoader("topics");
    sendXhr(baseUrl, "GET", 
      debugUrl:"/api/get_topics_mock.json"
    ).then((String responseText) {
        actOnData(responseText);
        completer.complete(true);
        scuttlebuttUi.hideLoader("topics");
      });
    return completer.future;
  }
  
  void actOnData(String responseText) {
    List<Map<String,Object>> data = JSON.parse(responseText);
    topics = new List<Topic>();
    for (Map<String,Object> record in data) {
      topics.add(new Topic.fromJson(record));
    }
    print("Topics loaded successfully.");
  }

  void refresh() {
    fetchData();
  }

  String getName(int id) {
    if (topics != null) {
      for (Topic topic in topics) {
        if (topic.id == id) {
          return topic.name;
        }
      }
    } else {
      return null; 
    }
  }
}

/**
 * Simple class for holding Sources data: name, id, url, ...
 */
class Source {
  int id;
  String name;
  String url;
  int monthlyVisitors;

  Source.fromJson(Map<String,Object> jsonData) {
    if (!jsonData.containsKey("id") || !jsonData.containsKey("name")
        || !jsonData.containsKey("url")) {
      throw "JSON data corrupt. Couldn't find 'id' or 'name' or 'url'.";
    }
    id = jsonData["id"];
    name = jsonData["name"];
    url = jsonData["url"];
    monthlyVisitors = jsonData["monthlyVisitors"];
  }
}

/**
 * SourcesUiView handles ajax calls and shows the data on the client
 * for the Sources tab.
 */
class SourcesUiView extends UiView {
  List<Source> sources;
  
  ButtonElement _createButton;
  TableRowElement _createRow;
  InputElement _nameInput;
  InputElement _urlInput;
  InputElement _visitorsInput;

  SourcesUiView() {
    baseUrl = "/api/sources";
    _createButton = document.query("#add-source-button");
    divElement = document.query("div#sources-div");
    mainButton = document.query("button#sources-button");
    outputTable = new Table.fromDomQuery("table#sources-table");
    
    _createButton.on.click.add(showCreateRow);
  }
  
  /**
    * Builds and shows the row used for posting new Sources to the backend.
    */
  void showCreateRow(Event e) {
    if (outputTable == null)
      throw "Couldn't find outputTable.";
    if (_createRow == null) {
      // create the input row (top of table)
      _createRow = outputTable.tableElement.insertRow(1);
      // create input cells
      TableCellElement nameCell = _createRow.insertCell(0);
      _nameInput = new Element.tag("input");
      _nameInput.type = "text";
      nameCell.elements.add(_nameInput);
      _nameInput.focus();
      TableCellElement urlCell = _createRow.insertCell(1);
      _urlInput = new Element.tag("input");
      _urlInput.type = "text";
      urlCell.elements.add(_urlInput);
      TableCellElement visitorsCell = _createRow.insertCell(2);
      _visitorsInput = new Element.tag("input");
      _visitorsInput.type = "text";
      visitorsCell.elements.add(_visitorsInput);

      // bind Enter 
      _nameInput.on.keyPress.add((Event ev) {
        if (ev.dynamic.charCode == 13) // Enter pressed - TODO: do we need "dynamic" ?
          _urlInput.focus();
      });
      _urlInput.on.keyPress.add((Event ev) {
        if (ev.dynamic.charCode == 13) // Enter pressed
          _visitorsInput.focus();
      });
      _visitorsInput.on.keyPress.add((Event ev) {
        if (ev.dynamic.charCode == 13) // Enter pressed
          postNew(ev);
      });
      // create & discard buttons
      TableCellElement buttonCell = _createRow.insertCell(3);
      buttonCell.colSpan = 3;
      ButtonElement createButton = new Element.tag("button");
      createButton.text = "Create";
      buttonCell.elements.add(createButton);
      createButton.on.click.add(postNew);
      ButtonElement discardButton = new Element.tag("button");
      discardButton.text = "Discard";
      buttonCell.elements.add(discardButton);
      discardButton.on.click.add((Event ev) {
        _createRow.remove();
        _createRow = null;
      });
    }
  }
  
  void postNew(Event e) {
    if (_nameInput.value == "" || _urlInput.value == "")
      return;
    print("Posting new record.");
    
    sendXhr(baseUrl, "POST", 
      params:{ 
        "name": _nameInput.value,
        "url": _urlInput.value,
        "monthlyVisitors": _visitorsInput.value
        },
      debugUrl:"/api/post_sources_mock.json"
        ).then((String responseText) {
          _createRow.remove();
          _createRow = null;
          sources = null;
          scuttlebuttUi.parseUrl();
        });
  }

  void show() {
    if (sources != null) {
      populateTable();
    } else {
      fetchData().then((_) => populateTable());
    }
  }

  /**
   * Populates the DOM with data.
   */
  void populateTable([bool reset=true]) {
    if (reset)
      outputTable.reset();
    
    for (Source source in sources) {
      String sourceNameHtml = "${source.name} <a class='more-actions'>&hellip;</a>";

      // adds a row with 4 cells: name, url, monthly visitors, num articles
      Element tr = outputTable.addRow(
          [ sourceNameHtml, prettifyUrl(source.url), 
          prettifyInt(source.monthlyVisitors), "N/A" ]
          );
      
      // TODO(filiph): TBD what to do when user click's a source?
      /*tr.on.click.add((event) {
          scuttlebuttUi.listArticles(topic.id);
          });*/
    };
    visibility = true;
  }

  /**
   * Sends XMLHttpRequest, shows loader, acts on data, hides loader, returns Future.
   * TODO(filiph): candidate for refactoring, not DRY
   */
  Future<bool> fetchData() {
    Completer completer = new Completer();
    scuttlebuttUi.showLoader("sources");
    sendXhr(baseUrl, "GET", 
      debugUrl:"/api/get_sources_mock.json"
    ).then((String responseText) {
      actOnData(responseText);
      completer.complete(true);
      scuttlebuttUi.hideLoader("sources");
    });
    return completer.future;
  }
  
  void actOnData(String responseText) {
    List<Map<String,Object>> data = JSON.parse(responseText);
    sources = new List<Source>();
    for (Map<String,Object> record in data) {
      sources.add(new Source.fromJson(record));
    }
    print("Sources loaded successfully.");
  }

  void refresh() {
    fetchData();
  }

  String getName(int id) {
    if (sources != null) {
      for (Source source in sources) {
        if (source.id == id) {
          return source.name;
        }
      }
    } else {
      return null; 
    }
  }
}


/**
 * The main app UI class.
 */
class ScuttlebuttUi {
  ArticlesUiView articlesUiView;
  TopicsUiView topicsUiView;
  SourcesUiView sourcesUiView;
  UiView currentPage;

  Element _statusMessage;
  Element _subtitle;
  ButtonElement _topicsButton;
  ButtonElement _sourcesButton;
  ButtonElement _articlesButton;
  ButtonElement _refreshButton;
  
  DivElement _loaderDiv;
  Set<String> _currentlyLoading;

  ScuttlebuttUi() {
  }

  /**
    * Initializes pointers to DOM elements. Binds events to buttons and popState.
    */
  void init() {
    articlesUiView = new ArticlesUiView();
    topicsUiView = new TopicsUiView();
    sourcesUiView = new SourcesUiView();
    
    // give context
    articlesUiView.scuttlebuttUi = topicsUiView.scuttlebuttUi 
      = sourcesUiView.scuttlebuttUi = this; 

    _statusMessage = document.query("#status");
    _subtitle = document.query("h1 span#subtitle");
    _topicsButton = document.query("#topics-button");
    _sourcesButton = document.query("#sources-button");
    _articlesButton = document.query("#articles-button");
    _refreshButton = document.query("#refresh-button");
    statusMessage("Dart is now running.");
    
    _loaderDiv = document.query("div#loader");
    _currentlyLoading = new Set<String>();

    _topicsButton.on.click.add((Event event) {
      listTopics();
    });
    
    _sourcesButton.on.click.add((Event event) {
      listSources();
    });

    _refreshButton.on.click.add((Event event) {
      articlesUiView.refresh();
      topicsUiView.refresh();
      parseUrl();
    });
    
    String landingUrl = window.location.href;
    DEBUG = landingUrl.contains("0.0.0.0") || landingUrl.contains("//localhost");   // if we're running on localhost, flip the DEBUG flag

    // history magic (getting Back button to work properly)
    window.on.popState.add((var e) {
      print("On pop state triggered.");
      parseUrl();
    });
  }

  /**
   * Parses the URL and takes care of displaying the right data.
   */
  void parseUrl([String url]) {
    if (url == null) {
      url = window.location.href;
    }

    if (url.contains("/api/topics")) {
      listTopics(pushState:false);
      return;
    } else if (url.contains("/api/sources")) {
      listSources(pushState:false);
      return;
    } else if (url.contains("/api/articles")) {
      RegExp exp = const RegExp(@"articles/([0-9]+)");
      Match match = exp.firstMatch(url);
      int id = Math.parseInt(match.group(1));
      listArticles(id, pushState:false);
      return;
    } else {
      listTopics(pushState:true);
    }
  }

  /**
    Lists all Topics.
   */
  void listTopics([bool pushState=true]) {
    if (pushState) {
      Map state = {"url" : "#/api/topics"};
      window.history.pushState(JSON.stringify(state), "Topics", "#/api/topics");
    }

    articlesUiView.visibility = false;
    sourcesUiView.visibility = false;
    topicsUiView.visibility = true;
    topicsUiView.show();
    currentPage = topicsUiView;

    _articlesButton.disabled = true;
    setPageTitle();
  }

  /**
    Lists all Sources. -- TODO(filiph): not DRY with Topics
  */
  void listSources([bool pushState=true]) {
    if (pushState) {
      Map state = {"url" : "#/api/sources"};
      window.history.pushState(JSON.stringify(state), "Sources", "#/api/sources");
    }
  
    articlesUiView.visibility = false;
    topicsUiView.visibility = false;
    sourcesUiView.visibility = true;
    sourcesUiView.show();
    currentPage = sourcesUiView;
  
    _articlesButton.disabled = true;
    setPageTitle();
  }
  
  /**
    Lists all articles for given Topic id.
   */
  void listArticles(int id, [bool pushState=true]) {
    if (pushState) {
      Map state = {"url" : "#/api/articles/$id"};
      window.history.pushState(
          JSON.stringify(state), 
          "Articles", 
          "#/api/articles/$id"
          );
    }

    topicsUiView.visibility = false;
    sourcesUiView.visibility = false;
    articlesUiView.visibility = true;
    articlesUiView.show(id);
    currentPage = articlesUiView;

    setPageTitle();
  }

  /**
    * Takes care of the "Scuttlebutt -> ____" headline. Fetches data if needed.
    */
  void setPageTitle([String str]) {
    if (str != null) {
      document.title = "$str :: Scuttlebutt";
      _subtitle.innerHTML = str;
    } else if (currentPage == topicsUiView) {
      document.title = "Scuttlebutt";
      _subtitle.innerHTML = "Topics";
    } else if (currentPage == sourcesUiView) {
      document.title = "Sources :: Scuttlebutt";
      _subtitle.innerHTML = "Sources";
    } else if (currentPage == articlesUiView) {
      /*
         Set header (h1) to correspond the to currently viewed topic.
         If data is not available on client, this calls the Ajax function
         (fetchData) with a callback to this very function.
       */
      String topicName = topicsUiView.getName(articlesUiView.currentId);
      if (topicName != null) {
        document.title = "$topicName :: Scuttlebutt";
        _subtitle.innerHTML = topicName;
      } else {
        topicsUiView.fetchData().then((_) => setPageTitle());
      }
    } else {
      throw "Unknown type of page displayed.";
    }
  }

  /**
    Shows the loader. The [name] allows to bind the request to a particular
    task. 
    */
  void showLoader([String name]) {
    _currentlyLoading.add(name);
    _loaderDiv.style.display = "block";
  }
  
  /**
    When called without arguments, it hides the loader gif.
    When called with a string, the method first ensures that no other
    task is currently running. If not, it hides the loader.
    */
  void hideLoader([String name]) {
    if (name == null) {
      _loaderDiv.style.display = "none";
    } else {
      _currentlyLoading.remove(name);
      if (_currentlyLoading.isEmpty())
        _loaderDiv.style.display = "none";
    }
  }
  
  
  /**
    Changes the contents of the _statusMessage <p> element. TODO(filiph): get rid of this or use it
   */
  void statusMessage(String message) {
    _statusMessage.innerHTML = message;
  }

}

/**
  Takes a URL and tries to prettify it in HTML (and link it). It returns
  a message (in HTML) if URL is invalid.
 */
String prettifyUrl(String rawUrl) {
  final int MAX_URI_LENGTH = 40;

  RegExp urlValidity = const RegExp(@"^https?\://([a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,4})(/\S*)?$");
  Match match = urlValidity.firstMatch(rawUrl);

  if (match == null) {
    return "<span style='border-bottom: 1px dashed black; cursor:help' title='\"$rawUrl\"'>Invalid URL</span>";
  } else {
    String domain = match.group(1);
    RegExp topTwoLevelDomainExp = new RegExp(@"[a-zA-Z0-9\-]+\.[a-zA-Z]{2,4}$");
    String topTwoLevelDomain = topTwoLevelDomainExp.stringMatch(domain);
    String uri = match.group(2);
    if (uri == null) {
      return "<a href='$rawUrl'><strong>$topTwoLevelDomain</strong></a>";
    } else {
      int uriLength = uri.length;
      if (uriLength > MAX_URI_LENGTH) {
        uri = "/...${uri.substring(uriLength - (MAX_URI_LENGTH - 4), uriLength)}";
      }
      return "<a href='$rawUrl'><strong>$topTwoLevelDomain</strong><br/>$uri</a>";
    }
  }
}

/**
  Returns a date object given any number of (even invalid) date strings.
  */
Date dateFromString(String str) {
  if (str.length == 19) // format "2011-12-26T00:00:00" - needs to add Z
    return new Date.fromString("${str}Z");   // TODO(filiph): this is a quick fix of JSON format returning ISO 8601 format without the Z. Safari complains.
  else if (str.length == 10) // format "2012-02-10"
    return new Date.fromString(str);
  else
    return new Date.fromString(str);
}

/**
  Takes a date in "YYYY-MM-DD..." format and converts to nice HTML.
  */
String prettifyDate(String rawDate) {
  final weekdayStrings = const ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  final monthStrings = const ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  Date date = dateFromString(rawDate);
  Duration diff = (new Date.now()).difference(date);
  String dateStr = "${weekdayStrings[date.weekday]}, ${monthStrings[date.month-1]} ${date.day}";
  String diffStr;
  if (diff.inDays > 30) {
    diffStr = "long ago";
  } else if (diff.inDays > 1) {
    diffStr = "${diff.inDays} days ago";
  } else if (diff.inHours > 1) {
    diffStr = "${diff.inHours} hrs ago";
  } else if (diff.inMinutes > 1) {
    diffStr = "${diff.inMinutes} mins ago";
  } else {
    diffStr = "just now";
  }

  return "$dateStr<br/>(<strong>$diffStr</strong>)";
}

/**
  Converts int to a human readable (HTMLfied) format.
  */
String prettifyInt(int i) {
  if (i >= 1000000) {
    return "<strong>${(i/1000000).toStringAsFixed(1)}</strong> M";
  }
  if (i >= 1000) {
    num kilos = (i / 1000).round();
    return "<strong>${kilos.toStringAsFixed(0)}</strong> K";
  }
  i = i - (i%10); // don't report 123, report 120 instead
  return i.toString();
}

/**
  The main program entry.
  */
void main() {
  new ScuttlebuttUi().init();
}
