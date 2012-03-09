#import('dart:html');
#import('dart:json');

bool DEBUG = false; // will be flipped automatically on localhost
final num VERY_LARGE_NUMBER = 1000000000;
final String NOT_AVAILABLE_STRING = "N/A";

/**
 * Table.
 */
class Table {
  TableElement tableElement;

  Table(String domQuery) {
    this.tableElement = document.query(domQuery);
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
      this.addRow(
          [
          record['title'],
          ScuttlebuttUi.prettifyUrl(record['url']),
          ScuttlebuttUi.prettifyDate(record['updated']),
          record.containsKey("readership") ? 
              ScuttlebuttUi.prettifyInt(Math.parseInt(record["readership"])) 
              : "N/A"
          ]
          );
    }
  }

  /**
    Deletes all rows from the table element.
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
 * An class representing one day's worth of statistics for
 * a given TopicStats.
 *
 * I.e.: day 2012-12-26 saw 5 articles about 'Android'...
 */ 
class TopicStatsDay implements Comparable {
  Date date;
  int count;
  double wowChange;
  TableCellElement td;
  // double sentiment;  // not used, but I'm leaving this here for future gen

  TopicStatsDay(Map<String,Object> jsonData) {
    if (!jsonData.containsKey("date") || !jsonData.containsKey("count")) {
      throw new Exception("JSON data corrupt. Couldn't find keys.");
    }
    count = jsonData["count"];
    date = ScuttlebuttUi.dateFromString(jsonData["date"]);
  }

  int compareTo(TopicStatsDay other) {
    return date.compareTo(other.date);
  }
}

/**
 * An class representing data for a given topic. Includes all the days
 * as TopicStatsDay objects.
 */ 
class TopicStats {
  List<TopicStatsDay> days;
  int maxCount = 0;
  double avgCount;

  TopicStats(List<Map<String,Object>> jsonData) {
    days = new List<TopicStatsDay>();
    jsonData.forEach((Map<String,Object> jsonRecord) {
        days.add(new TopicStatsDay(jsonRecord));
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
 * BarChart.
 */
class BarChart {
  ArticlesUi articlesUi;
  TableElement tableElement;
  SpanElement _articlesCountElement;
  SpanElement _articlesCountWowElement;
  SpanElement _articlesSentimentElement;
  SpanElement _articlesSentimentWowElement;
  InputElement articlesFromElement;
  InputElement articlesToElement;

  // A map topic_id -> stats. This allows for caching data that has 
  // already been downloaded.
  Map<int,TopicStats> topicStatsCache;   

  int currentId;
    
  int _startDragI;
  int _endDragI;

  final int MAX_DAYS = 90;  // 3 months

  BarChart(
      String domQuery,
      [
      ArticlesUi articlesUi_=null,
      String countEl="#articles-count",
      String countWowEl="#articles-count-wow",
      String sentimentEl="#articles-sentiment",
      String sentimentWowEl="#articles-sentiment-wow",
      String fromEl="#articles-from",
      String toEl="#articles-to"
      ]) {
    topicStatsCache = new Map<int,TopicStats>();
    this.tableElement = document.query(domQuery);
    this.articlesUi = articlesUi_;

    _articlesCountElement = document.query(countEl);
    _articlesCountWowElement = document.query(countWowEl);
    _articlesSentimentElement = document.query(sentimentEl);
    _articlesSentimentWowElement = document.query(sentimentWowEl);
    articlesFromElement = document.query(fromEl);
    articlesToElement = document.query(toEl);
    
    articlesFromElement.on.blur.add((Event ev) {
      articlesUi.fromDate = ScuttlebuttUi.dateFromString(articlesFromElement.value);
      articlesUi.fetchData(thenCall:articlesUi.populateTable);
    });
    articlesToElement.on.blur.add((Event ev) {
      articlesUi.toDate = ScuttlebuttUi.dateFromString(articlesToElement.value);
      articlesUi.fetchData(thenCall:articlesUi.populateTable);
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
      fetchData(id, thenCall:populateChart);
    }
  }

  /**
   * Populates the article Table with data. If resetTable is false,
   * it will add to the current table.
   */
  void populateChart([int id_, bool resetTable=true]) {
    int id = (id_ != null) ? id_ : this.currentId;
    TopicStats topicStats = topicStatsCache[id];

    if (resetTable) reset();

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

      td.dataAttributes = {"i": i};

      td.on.mouseOver.add((MouseEvent e) {
        Element el = e.currentTarget;
        if (el.dataAttributes.containsKey("i")) {
          int i_ = Math.parseInt(el.dataAttributes["i"]);
          
          if (i_ > topicStats.days.length - 1) {
            this.updateContextual(count:"no data");
          } else {
            String countWow;
            
            if (topicStats.days[i_].wowChange != null) {
            if (topicStats.days[i_].wowChange > VERY_LARGE_NUMBER)
              countWow = "+&#8734;%";
            else
              countWow = "${topicStats.days[i_].wowChange >= 0.0 ? '+' : '-'}${(topicStats.days[i_].wowChange.abs() * 100).toInt()}%";
              
            if (_startDragI != null) {
              int min = Math.min(_startDragI, i_);
              int max = Math.max(_startDragI, i_);
              for (int j=0; j < topicStats.days.length; j++) {
                topicStats.days[j].td.classes.remove("selected");
                if (j >= min && j <= max)
                  topicStats.days[j].td.classes.add("selected");
              }
            }
          }
          
          updateContextual(
            count:topicStats.days[i_].count.toString(),
            countWow:countWow
            );
          }
        }
      });

      td.on.mouseDown.add((MouseEvent e) {
        Element el = e.currentTarget;
        if (el.dataAttributes.containsKey("i")) {
          int i_ = Math.parseInt(el.dataAttributes["i"]);
          if (i_ < topicStats.days.length) {
            _startDragI = i_;
          }
        }
        e.stopPropagation();
        e.preventDefault();
      });
      
      td.on.mouseUp.add((MouseEvent e) {
        Element el = e.currentTarget;
        if (el.dataAttributes.containsKey("i")) {
          int i_ = Math.parseInt(el.dataAttributes["i"]);
          if (i_ < topicStats.days.length) {
            _endDragI = i_;
            if (_startDragI == null)
              _startDragI = i_;
            articlesUi.fromDate = topicStats.days[Math.max(_startDragI, _endDragI)].date;
            articlesUi.toDate = topicStats.days[Math.min(_startDragI, _endDragI)].date;
            articlesUi.fetchData(thenCall:articlesUi.populateTable);
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
        // check if we're actually mousing out of the table (not just sub-element)
        if (!this.tableElement.contains(el)) {
          this.updateContextual();
          _startDragI = null;
        }      
    });
    
    updateDateRange();
  }

  void updateContextual([
      String count=NOT_AVAILABLE_STRING,
      String countWow=NOT_AVAILABLE_STRING,
      String sentiment=NOT_AVAILABLE_STRING,
      String sentimentWow=NOT_AVAILABLE_STRING
      ]) {   
    this._articlesCountElement.innerHTML = count;
    this._articlesCountWowElement.innerHTML = countWow;
  }

  void updateDateRange() {
    articlesFromElement.value = articlesUi.fromDateShort;
    articlesToElement.value = articlesUi.toDateShort;
    
    // show bars as selected
    TopicStats topicStats = topicStatsCache[currentId];
    if (topicStats != null && !topicStats.days.isEmpty()) {
      print("Updating date range: ${articlesUi.fromDate} to ${articlesUi.toDate}");
      topicStats.days.forEach((TopicStatsDay day) {
        if (day.td != null) {
          day.td.classes.remove("selected");
          if (day.date.difference(articlesUi.fromDate).inDays >= 0
              && day.date.difference(articlesUi.toDate).inDays <= 0)
            day.td.classes.add("selected");
        }
      });
    }
  }

  /**
   * Creates XMLHttpRequest
   */
  void fetchData(int id, [Function thenCall=null, String url_=null]) {
    String url = (url_ == null) ? getURL(id) : url_;
    XMLHttpRequest request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.on.load.add((event) {
        if (request.status == 404) {
        window.console.error("TOFIX: Could not retrieve $url. Maybe stats are not implemented yet?");
        print("Trying to load mock data.");
        fetchData(id, thenCall:this.populateChart, url_:"https://scuttlebutt.googleplex.com/ui/api/get_topic_stats_new_mock.json");
        } else {
        //data[id] = JSON.parse(request.responseText);
        topicStatsCache[id] = new TopicStats(JSON.parse(request.responseText));

        print("${topicStatsCache[id].days.length} new stats loaded for the bar chart.");

        if (thenCall != null) {
        thenCall();
        }
        }

        });
    request.send();
  }

  void reset() {
    tableElement.nodes.clear();
  }
}


/**
 * ArticlesUi.
 */
class ArticlesUi {
  BarChart barChart;
  Table outputTable;
  DivElement _articlesDivElement;
  ButtonElement _loadMoreButton;
  Map<int,List> data;
  ScuttlebuttUi scuttlebuttUi;
  int currentId;
  int currentOffset;

  Date fromDate;
  Date toDate;

  // count number of articles that are loaded but haven't been shown yet
  // by populateTable
  int _waitingToBeShown;

  static final int ARTICLES_LIMIT = 20;  // articles per page/request

  ArticlesUi() {
    data = new Map();
    barChart = new BarChart("table#articles-stats", articlesUi_:this);
    _articlesDivElement = document.query("div#articles-div");
    _loadMoreButton = document.query("button#load-more-button");
    _waitingToBeShown = 0;

    _loadMoreButton.on.click.add((Event event) {
        this.currentOffset += ARTICLES_LIMIT;
        this.fetchData(
          this.currentId,
          thenCall:() {
          populateTable(this.currentId, resetTable:false);
          },
          offset:this.currentOffset);
        });
  }

  // TODO: iso has a tailing Z (as timezone)
  String get fromDateIso() => "${fromDate.year}-${fromDate.month < 10 ? '0' : ''}${fromDate.month}-${fromDate.day < 10 ? '0' : ''}${fromDate.day}T${fromDate.hours < 10 ? '0' : ''}${fromDate.hours}:${fromDate.minutes < 10 ? '0' : ''}${fromDate.minutes}:${fromDate.seconds < 10 ? '0' : ''}${fromDate.seconds}";
  String get toDateIso() => "${toDate.year}-${toDate.month < 10 ? '0' : ''}${toDate.month}-${toDate.day < 10 ? '0' : ''}${toDate.day}T${toDate.hours < 10 ? '0' : ''}${toDate.hours}:${toDate.minutes < 10 ? '0' : ''}${toDate.minutes}:${toDate.seconds < 10 ? '0' : ''}${toDate.seconds}";

  String get fromDateShort() => fromDateIso.substring(0, 10);
  String get toDateShort() => toDateIso.substring(0, 10);

  String getURL(int id, [int limit=ARTICLES_LIMIT, int offset=0]) {
    if (DEBUG) {
      return "/api/get_articles_mock.json";
    } else {
      return "/api/articles/$id?from=$fromDateShort&to=$toDateShort&offset=$offset&limit=$limit";
    }
  }

  /**
    Shows articles for given [Topic] id. Run this the first time you want
    to show the articles.
   */
  void show(int id) {
    currentId = id;
    this.currentOffset = 0;

    //previously: new Date.fromEpoch(0, new TimeZone.utc());
    this.fromDate = new Date.now().subtract(new Duration(days:7));
    this.toDate = new Date.now();

    if (data.containsKey(id)) {
      _waitingToBeShown = data[id].length;
      populateTable(id);
    } else {
      fetchData(id:id, thenCall:populateTable);
    }

    this.barChart.show(id);
  }

  /**
   * Populates the article Table with data. If resetTable is false,
   * it will add to the current table.
   */
  void populateTable([int id_, bool resetTable=true]) {
    int id = (id_ != null) ? id_ : this.currentId;

    if (resetTable) this.outputTable.reset();

    if (_waitingToBeShown > 0) {
      this.outputTable.addData(data[id].getRange(data[id].length - _waitingToBeShown, _waitingToBeShown));
      _waitingToBeShown = 0;
    } else if (resetTable) {
      outputTable.addRow(["No articles", "", "", ""]);
    }
    this.visibility = true;
    
    print("Updating barChart");
    barChart.updateDateRange();
  }

  void set visibility(bool value) {
    if (value == true) {
      this._articlesDivElement.style.display = "block";
    } else {
      this._articlesDivElement.style.display = "none";
    }
  }

  /**
   * Creates XMLHttpRequest
   */
  void fetchData([int id=null, Function thenCall=null, int limit=ARTICLES_LIMIT, int offset=0]) {
    if (id == null) id = this.currentId;
    String url = getURL(id, limit:limit, offset:offset);
    print("Sending async request to '$url'.");
    XMLHttpRequest request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.on.load.add((event) {
        // get rid of all data if starting from beginning
        if (offset == 0) 
          data[id] = new List();
        List responseJson = JSON.parse(request.responseText);
        _waitingToBeShown = responseJson.length;

        if (_waitingToBeShown > 0) {
          data[id].addAll(responseJson);
          print("${responseJson.length} new articles loaded.");
        }

        if (thenCall != null) {
          thenCall();
        }
    });
    request.send();
  }

  void refresh() {
    data = new Map();
  }
}


/**
 * Simple class for holding Topics data.
 */
class Topic {
  int id;
  String name;
  String searchTerm;
  int countPastTwentyFourHours;
  int countPastSevenDays;
  double weekOnWeekChange;

  Topic(Map<String,Object> jsonData) {
    if (!jsonData.containsKey("id") || !jsonData.containsKey("name")) {
      throw new Exception("JSON data corrupt. Couldn't find 'id' or 'name'.");
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
 * TopicsUi handles ajax calls and shows the data on the client.
 */
class TopicsUi {
  Table outputTable;
  List<Topic> topics;
  ScuttlebuttUi scuttlebuttUi;
  
  ButtonElement _addButton;
  TableRowElement _addRow;
  InputElement _nameInput;
  SpanElement _addStatus;

  TopicsUi([String tableSelector]) {
    if (tableSelector != null)
      outputTable = new Table(tableSelector);
    _addButton = document.query("#add-topic-button");
    
    _addButton.on.click.add(showAddRow);
  }
  
  void showAddRow(Event e) {
    if (outputTable == null)
      throw new Exception("Couldn't find outputTable.");
    if (_addRow == null) {
      // create the input row (top of table)
      _addRow = outputTable.tableElement.insertRow(1);
      // create input cell
      TableCellElement nameCell = _addRow.insertCell(0);
      _nameInput = new Element.tag("input");
      _nameInput.type = "text";
      nameCell.elements.add(_nameInput);
      _nameInput.focus();
      _nameInput.on.keyPress.add((Event ev) {
        if (ev.dynamic.charCode == 13) // Enter pressed
          postNew(ev);
      });
      // create & discard buttons
      TableCellElement buttonCell = _addRow.insertCell(1);
      buttonCell.colSpan = 3;
      ButtonElement createButton = new Element.tag("button");
      createButton.text = "Create";
      buttonCell.elements.add(createButton);
      createButton.on.click.add(postNew);
      ButtonElement discardButton = new Element.tag("button");
      discardButton.text = "Discard";
      buttonCell.elements.add(discardButton);
      discardButton.on.click.add((Event ev) {
        _addRow.remove();
        _addRow = null;
      });
      // create status text field
      _addStatus = new Element.tag("span");
      _addStatus.classes.add("info");
      buttonCell.elements.add(_addStatus);
    }
  }
  
  void postNew(Event e) {
    if (_nameInput.value == "")
      return;
    print("Posting new record.");
    String url = "/api/topics";
    if (DEBUG)
      url = "/api/post_topics_mock.json";
    XMLHttpRequest request = new XMLHttpRequest();
    request.open(DEBUG ? "GET" : "POST", url, true);

    request.on.load.add((event) {
        if (request.status != 200) {
          window.console.error("Server returned status code ${request.status} (${request.statusText}). Cannot add new record.");
          if (_addStatus != null) {
            _addStatus.text = "SERVER ERROR (${request.status}): Could not add.";
            _addStatus.classes.add("yellow");
          }
          return;
        }
        if (DEBUG) {
          //Map<String,Dynamic> data = JSON.parse(request.responseText);
          //window.console.info(data);
          window.console.info(request);
        }
        _addRow.remove();
        _addRow = null;
        
        // TODO: show loading icon
        window.setTimeout(refresh, 2000);
        //refresh();
    });
    
    Map<String,Dynamic> sendData = {
        "name": _nameInput.value
    };
    request.send(JSON.stringify(sendData));
  }

  String getURL() {
    if (DEBUG) {
      return "/api/get_topics_mock.json";
    } else {
      return "/api/topics";
    }
  }

  void show() {
    if (topics != null) {
      populateTable();
    } else {
      fetchData(thenCall:this.populateTable);
    }
  }

  /**
   * Populates the DOM with data.
   */
  void populateTable() {
    this.outputTable.reset();
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
        wowChangeHtml = "<span class=\"${(changeSign=='+'?'green':'red')}\">\
                         $changeSign$changeStr%</span>"; 
      }

      // adds a row with 4 cells: name, count for past 24h, count for past 7d,
      // and week on week change
      Element tr = this.outputTable.addRow(
          [ topicNameHtml, topic.countPastTwentyFourHours, 
          topic.countPastSevenDays, wowChangeHtml ]
          );
      tr.on.click.add((event) {
          this.scuttlebuttUi.listArticles(topic.id);
          });
    };
    this.visibility = true;
  }

  void set visibility(bool value) {
    if (value == true) {
      this.outputTable.tableElement.style.display = "table";
    } else {
      this.outputTable.tableElement.style.display = "none";
    }
  }

  /**
   * Creates XMLHttpRequest
   */
  void fetchData([Function thenCall=null]) {
    String url = getURL();
    XMLHttpRequest request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.on.load.add((event) {
        List<Map<String,Object>> data = JSON.parse(request.responseText);
        topics = new List<Topic>();
        data.forEach((Map<String,Object> record) {
          topics.add(new Topic(record));
          });
        print("Topics loaded successfully.");
        if (thenCall != null) {
        thenCall();
        }
        });
    request.send();
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
 * The main app UI class.
 */
class ScuttlebuttUi {
  ArticlesUi articlesUi;
  TopicsUi topicsUi;
  Object currentPage;

  Element _statusMessage;
  Element _subtitle;
  ButtonElement _homeButton;
  ButtonElement _refreshButton;

  ScuttlebuttUi() {
  }

  void run() {
    // TODO(filiph): make a superclass to articlesUi and topicsUi
    articlesUi = new ArticlesUi();
    topicsUi = new TopicsUi(tableSelector:"table#topics-table");
    articlesUi.scuttlebuttUi = topicsUi.scuttlebuttUi = this; // give context

    articlesUi.outputTable = new Table("table#articles-table"); // TODO: same as topicsUI

    _statusMessage = document.query("#status");
    _subtitle = document.query("h1 span#subtitle");
    _homeButton = document.query("#topics-button");
    _refreshButton = document.query("#refresh-button");
    statusMessage("Dart is now running.");

    _homeButton.on.click.add((Event event) {
        listTopics();
        });

    _refreshButton.on.click.add((Event event) {
        articlesUi.refresh();
        topicsUi.refresh();
        parseUrl();
        });
    
    String landingUrl = window.location.href;
    DEBUG = landingUrl.contains("0.0.0.0") || landingUrl.contains(".prh.corp.google.com:8000/");   // if we're running on localhost, flip the DEBUG flag

    // history magic (getting Back button to work properly)
    window.on.popState.add((var e) {
        print("On pop state triggered.");
        //var stateStr = e.state;
        this.parseUrl();
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
      this.listTopics(pushState:false);
      return;
    } else if (url.contains("/api/articles")) {
      RegExp exp = const RegExp(@"articles/([0-9]+)");
      Match match = exp.firstMatch(url);
      int id = Math.parseInt(match.group(1));
      this.listArticles(id, pushState:false);
      return;
    } else {
      this.listTopics(pushState:true);
    }
  }

  /**
    Lists all Topics in the _outputTable.
   */
  void listTopics([bool pushState=true]) {
    if (pushState) {
      Map state = {"url" : "#/api/topics"};
      window.history.pushState(JSON.stringify(state), "Home", "#/api/topics");
    }

    articlesUi.visibility = false;
    topicsUi.show();
    currentPage = topicsUi;

    setPageTitle();
  }

  /**
    Lists all articles for given Topic id in the _outputTable.
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

    topicsUi.visibility = false;
    articlesUi.show(id);
    currentPage = articlesUi;

    setPageTitle();
  }

  void setPageTitle([String str]) {
    if (str != null) {
      document.title = "$str :: Scuttlebutt";
      _subtitle.innerHTML = str;
    } else if (currentPage == topicsUi) {
      document.title = "Scuttlebutt";
      _subtitle.innerHTML = "Home";
    } else if (currentPage == articlesUi) {
      /*
         Set header (h1) to correspond the to currently viewed topic.
         If data is not available on client, this calls the Ajax function
         (fetchData) with a callback to this very function.
       */
      String topicName = topicsUi.getName(articlesUi.currentId);
      if (topicName != null) {
        document.title = "$topicName :: Scuttlebutt";
        _subtitle.innerHTML = topicName;
      } else {
        topicsUi.fetchData(thenCall:this.setPageTitle);
      }
    } else {
      throw new Exception("Unknown type of page displayed.");
    }
  }


  /**
    Changes the contents of the _statusMessage <p> element.
   */
  void statusMessage(String message) {
    _statusMessage.innerHTML = message;
  }

  /**
    Takes a URL and tries to prettify it in HTML (and link it). It returns
    a message (in HTML) if URL is invalid.
   */
  static String prettifyUrl(String rawUrl) {
    final int MAX_URI_LENGTH = 40;

    RegExp urlValidity = const RegExp(@"^https?\://([a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,4})(/\S*)?$");
    Match match = urlValidity.firstMatch(rawUrl);

    if (match == null) {
      return "<span style='border-bottom: 1px dashed black; cursor:help' title='\"$rawUrl\"'>Invalid URL</span>";
    } else {
      String domain = match.group(1);
      RegExp topTwoLevelDomainExp = const RegExp(@"[a-zA-Z0-9\-]+\.[a-zA-Z]{2,4}$");
      String topTwoLevelDomain = topTwoLevelDomainExp.stringMatch(domain);
      String uri = match.group(2);
      if (uri == null) {
        return "<a href='$rawUrl'><strong>$topTwoLevelDomain</strong></a>";
      } else {
        int uriLength = uri.length;
        if (uriLength > MAX_URI_LENGTH) {
          uri = "/..." + uri.substring(uriLength - (MAX_URI_LENGTH - 4), uriLength);
        }
        return "<a href='$rawUrl'><strong>$topTwoLevelDomain</strong><br/>$uri</a>";
      }
    }
  }

  /**
    Returns a date object given any number of (even invalid) date strings.
    */
  static Date dateFromString(String str) {
    if (str.length == 19) // format "2011-12-26T00:00:00" - needs to add Z
      return new Date.fromString("${str}Z");   // TODO(filiph): this is a quick fix of JSON format returning ISO 8601 format without the Z. Safari complains.
    else if (str.length == 10) // format "2012-02-10"
      return new Date.fromString(str);
    else
      return new Date.fromString(str);
  }

  static String prettifyDate(String rawDate) {
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
  
  static String prettifyInt(int i) {
    if (i >= 1000000) {
      return "<strong>${(i/1000000).toStringAsFixed(1)}</strong> M";
    }
    if (i >= 1000) {
      double kilos = (i / 1000).round();
      return "<strong>${kilos.toStringAsFixed(0)}</strong> K";
    }
    i = i - (i%10); // don't report 123, report 120 instead
    return i.toString();
  }
}

void main() {
  new ScuttlebuttUi().run();
}
