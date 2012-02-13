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
  
  void addData(List<Map<String,String>> data) {
    for (Map<String,String> record in data) {
      this.addRow(
        [
         record['title'], 
         ScuttlebuttUi.prettifyUrl(record['url']), 
         ScuttlebuttUi.prettifyDate(record['updated']), 
         record.containsKey("readership") ? record["readership"] : "N/A",  
         record.containsKey("sentiment") ? record["sentiment"] : "N/A"
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
  * An class representing one week's worth of statistics for
  * a given TopicStats.
  *
  * I.e.: week 2011-12-26 to 2012-12-26 saw 5 articles about 'Android'...
  */ 
class TopicStatsWeek implements Comparable {
  Date from;
  Date to;
  int count;
  double wowChange;
  // double sentiment;  // not used, but I'm leaving this here for future gen
  
  TopicStatsWeek(Map<String,Object> jsonData) {
    if (!jsonData.containsKey("from") || !jsonData.containsKey("to") 
        || !jsonData.containsKey("count")) {
      throw new Exception("JSON data corrupt. Couldn't find keys.");
    }
    count = jsonData["count"];
    from = ScuttlebuttUi.dateFromString(jsonData["from"]);
    to = ScuttlebuttUi.dateFromString(jsonData["to"]);
  }
  
  int compareTo(TopicStatsWeek other) {
    return from.compareTo(other.from);
  }
}

/**
 * An class representing data for a given topic. Includes all the weeks
 * as TopicStatsWeek objects.
 */ 
class TopicStats {
  List<TopicStatsWeek> weeks;
  int maxCount = 0;
  double avgCount;
  
  TopicStats(List<Map<String,Object>> jsonData) {
    weeks = new List<TopicStatsWeek>();
    jsonData.forEach((Map<String,Object> jsonRecord) {
      weeks.add(new TopicStatsWeek(jsonRecord));
    });
    // now we compute WoW changes and MaxCount
    weeks.sort((TopicStatsWeek a, TopicStatsWeek b) => a.compareTo(b));
    int absCount = 0;
    for (int i = 0; i < weeks.length; i++) {
      TopicStatsWeek curr = weeks[i];
      maxCount = Math.max(maxCount, curr.count);
      absCount += curr.count;
      if (i == 0) continue;
      TopicStatsWeek prev = weeks[i-1];
      if (prev.count == 0) {
        if (curr.count > 0)
          curr.wowChange = VERY_LARGE_NUMBER + 1.0;
        else
          curr.wowChange = 0.0;
      } else {
        curr.wowChange = curr.count / prev.count;
      }
    }
    avgCount = absCount / weeks.length;
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
  int selectedDateRange;
  
  final int MAX_WEEKS = 102;  // two years
  
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
  }
  
  String getURL(int id) {
    if (DEBUG) {
      return "/api/get_topic_stats_mock.json";
    } else {
      return "/api/get_topic_stats?topic_id=$id";
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
   for (var i = MAX_WEEKS - 1; i >= 0; i--) {
     Element td = new Element.tag('td');
     Element div = new Element.tag('div');
     
     int percentage;
     if (i < topicStats.weeks.length) {
       percentage = 
         (topicStats.weeks[i].count / topicStats.maxCount * 100).toInt();  
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
         int i = Math.parseInt(el.dataAttributes["i"]);
         
         if (i > topicStats.weeks.length - 1) {
           this.updateContextual(count:"no data");
         } else {
           String countWow;

           if (topicStats.weeks[i].wowChange > VERY_LARGE_NUMBER)
             countWow = "+&#8734;%";
           else
             countWow = "${topicStats.weeks[i].wowChange >= 0.0 ? '+' : '-'}\
${(topicStats.weeks[i].wowChange.abs() * 100).toInt()}%";
             
           updateContextual(
               count:topicStats.weeks[i].count.toString(),
               countWow:countWow
               );
         }
       }
     });
     
     td.on.click.add((MouseEvent e) {
       Element el = e.currentTarget;
       if (el.dataAttributes.containsKey("i")) {
         int i = Math.parseInt(el.dataAttributes["i"]);
         if (i < topicStats.weeks.length) {
           selectedDateRange = i;
           articlesUi.fromDate = topicStats.weeks[i].from;
           articlesUi.toDate = topicStats.weeks[i].to;
           articlesUi.fetchData(thenCall:articlesUi.populateTable);
           updateDateRange();
         }
       }
     });
   }
   this.tableElement.elements.add(tr);
   
   this.tableElement.on.mouseOut.add((MouseEvent e) {
     Element el = e.toElement; 
     if (!this.tableElement.contains(el)) {
       this.updateContextual();
     }
   });
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
   //articlesFromElement.valueAsDate = articlesUi.fromDate;
   //articlesToElement.valueAsDate = articlesUi.toDate;
   articlesFromElement.value = articlesUi.fromDateShort;
   articlesToElement.value = articlesUi.toDateShort;
 }
 
 /**
   * Creates XMLHttpRequest
   */
 void fetchData(int id, [Function thenCall=null, String url_=null]) {
   String url = (url_ === null) ? getURL(id) : url_;
   XMLHttpRequest request = new XMLHttpRequest();
   request.open("GET", url, true);
   
   request.on.load.add((event) {
     if (request.status == 404) {
       window.console.error("TOFIX: Could not retrieve $url. Maybe stats are not implemented yet?");
       print("Trying to load mock data.");
       fetchData(id, thenCall:this.populateChart, url_:"https://scuttlebutt.googleplex.com/ui/api/get_topic_stats_mock.json");
     } else {
       //data[id] = JSON.parse(request.responseText);
       topicStatsCache[id] = new TopicStats(JSON.parse(request.responseText));
       
       print("${topicStatsCache[id].weeks.length} new stats loaded for the bar chart.");
       
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
  
  final int ARTICLES_LIMIT = 20;  // articles per page/request
  
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
  
  String getURL(int id, [int limit=null, int offset=0]) {
    if (limit === null) limit = ARTICLES_LIMIT;
    if (DEBUG) {
      return "/api/get_articles_mock.json";
    } else {
      return "/api/get_articles?topic_id=$id&limit=$limit&offset=$offset&min_date=$fromDateIso&max_date=$toDateIso";
    }
  }
  
  /**
    Shows articles for given [Topic] id. Run this the first time you want
    to show the articles.
    */
  void show(int id) {
    currentId = id;
    this.currentOffset = 0;
    
    this.fromDate = new Date.fromEpoch(0, new TimeZone.utc()); 
    this.toDate = new Date.now();
    
    this.barChart.articlesFromElement.value = this.fromDate.toString().substring(0, 10);
    this.barChart.articlesToElement.value = this.toDate.toString().substring(0, 10);
    
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
   }

   this.visibility = true;
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
 void fetchData([int id=null, Function thenCall=null, int limit=null, int offset=0]) {
   if (id == null) id = this.currentId;
   String url = getURL(id, limit:limit, offset:offset);
   XMLHttpRequest request = new XMLHttpRequest();
   request.open("GET", url, true);
   
   request.on.load.add((event) {
     // get rid of all data if starting from beginning
     if (offset == 0) data[id] = new List(); 
     List responseJson = JSON.parse(request.responseText);
     _waitingToBeShown = responseJson.length; 
     
     if (_waitingToBeShown > 0) {
       data[id].addAll(responseJson);
       print("${responseJson.length} new articles loaded.");
     }
     
     if (thenCall !== null) {
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
  
  TopicsUi() {
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
          [ topic.name, topic.countPastTwentyFourHours, 
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
      this.outputTable.tableElement.style.display = "block";
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
      if (thenCall !== null) {
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
    articlesUi = new ArticlesUi();
    topicsUi = new TopicsUi();
    articlesUi.scuttlebuttUi = topicsUi.scuttlebuttUi = this; // give context
    
    articlesUi.outputTable = new Table("table#articles-table");
    topicsUi.outputTable = new Table("table#topics-table");
    
    _statusMessage = document.query("#status");
    _subtitle = document.query("h1 span#subtitle");
    _homeButton = document.query("#home-button");
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
    DEBUG = landingUrl.contains("0.0.0.0");   // if we're running on localhost, flip the DEBUG flag 
    
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
    if (url === null) {
      url = window.location.href;
    }
    
    if (url.contains("/api/topics")) {
      this.listTopics(pushState:false);
      return;
    } else if (url.contains("/api/get_articles")) {
      RegExp exp = const RegExp(@"topic_id=([0-9]+)");
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
      Map state = {"url" : "#/api/get_articles?topic_id=$id"};
      window.history.pushState(
        JSON.stringify(state), 
        "Articles", 
        "#/api/get_articles?topic_id=$id"
      );
    }
    
    topicsUi.visibility = false;
    articlesUi.show(id);
    currentPage = articlesUi;
    
    setPageTitle();
  }
  
  void setPageTitle([String str]) {
    if (str !== null) {
      document.title = "$str :: Scuttlebutt";
      _subtitle.innerHTML = str;
    } else if (currentPage === topicsUi) {
      document.title = "Scuttlebutt";
      _subtitle.innerHTML = "Home";
    } else if (currentPage === articlesUi) {
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
    
    if (match === null) {
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
  
  static Date dateFromString(String str) {
    return new Date.fromString(str+"Z");  // TODO(filiph): this is a quick fix of JSON format returning ISO 8601 format without the Z. Safari complains.
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
}

void main() {
  new ScuttlebuttUi().run();
}
