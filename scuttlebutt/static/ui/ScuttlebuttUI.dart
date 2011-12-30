#import('dart:html');
#import('dart:json');

bool DEBUG = false;

/**
  * Table.
  */
class Table {
  TableElement tableElement = null;
  
  Table(String domQuery) {
    this.tableElement = document.query(domQuery);
  }
  
  /**
  Adds a row to the table. A row is represented by a List of Strings. Each list element is
  a <td>. Its HTML content will be the string. 
  
  E.g.: addRow(["blah"]); will create this row: "<tr><td>blah</td></tr>".
  */
  Element addRow(List<String> row) {
    Element tr = new Element.tag('tr');
    for (var i = 0; i < row.length; i++) {
      Element td = new Element.tag('td');
      td.innerHTML = row[i];
      tr.elements.add(td);
    }

    tableElement.elements.add(tr);
    
    return tr;
  }
  
  void addData(List<Map<String,String>> data) {
    for (Map<String,String> record in data) {
      this.addRow(
        [
         record['title'], 
         ScuttlebuttUI.prettifyUrl(record['url']), 
         ScuttlebuttUI.prettifyDate(record['updated']), 
         "N/A", 
         "N/A"
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
  * BarChart.
  */
class BarChart {
  Articles articles = null;
  TableElement tableElement = null;
  SpanElement _articlesCountElement = null;
  SpanElement _articlesCountWowElement = null;
  SpanElement _articlesSentimentElement = null;
  SpanElement _articlesSentimentWowElement = null;
  InputElement articlesFromElement = null;
  InputElement articlesToElement = null;
  Map<int,List<Map<String,Dynamic>>> data = null;
  int currentId = null;
  int selectedDateRange = null;
  
  final int MAX_WEEKS = 102;  // two years
  
  BarChart(
      String domQuery,
      [
        Articles articles_=null,
        String countEl="#articles-count",
        String countWowEl="#articles-count-wow",
        String sentimentEl="#articles-sentiment",
        String sentimentWowEl="#articles-sentiment-wow",
        String fromEl="#articles-from",
        String toEl="#articles-to"
      ]) {
    data = new Map();
    this.tableElement = document.query(domQuery);
    this.articles = articles_;
    
    _articlesCountElement = document.query(countEl);
    _articlesCountWowElement = document.query(countWowEl);
    _articlesSentimentElement = document.query(sentimentEl);
    _articlesSentimentWowElement = document.query(sentimentWowEl);
    articlesFromElement = document.query(fromEl);
    articlesToElement = document.query(toEl);
  }
  
  String getURL(int id) {
    if (DEBUG) {
      return "/report/get_topic_stats_mock.json";
    } else {
      return "/report/get_topic_stats?topic_id=$id";
    }
  }
  
  /**
    Shows articles for given [Topic] id. Run this the first time you want
    to show the articles.
    */
  void show(int id) {
    this.currentId = id;
    
    if (data.containsKey(id)) {
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
   
   if (resetTable) this.reset();
   
   int maxCount = 0;
   int absoluteCount = 0;
   for (Map<String,Dynamic> record in data[id]) {
     maxCount = Math.max(record["count"], maxCount);
     absoluteCount += record["count"];
   }
   int averageCount = (absoluteCount / data[id].length).toInt();     
   
   Element tr = new Element.tag('tr');
   for (var i = MAX_WEEKS - 1; i >= 0; i--) {
     Element td = new Element.tag('td');
     Element div = new Element.tag('div');
     
     int percentage;
     if (i < data[id].length) {
       percentage = (data[id][i]["count"] / maxCount * 100).toInt();  
       div.classes.add("blue-bar");
       td.classes.add("data-available");
     } else {
       percentage = (Math.random() * averageCount / maxCount * 75).toInt();  // 75 instead of 100 for esthetic purposes only
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
         
         if (i > data[id].length - 1) {
           this.updateContextual(count:"no data");
         } else {
           String countWowStr;
           if (i < data[id].length - 1) {
             int prevCount = Math.parseInt(data[id][i+1]["count"]);
             int nowCount = Math.parseInt(data[id][i]["count"]);
             if (prevCount == 0) {
               countWowStr = nowCount > 0 ? "+&#8734;%" : "+0%";
             } else {
               int percentage = (((nowCount / prevCount) - 1) * 100).toInt();
               countWowStr = (percentage >= 0 ? "+" : "-") + percentage.abs().toString() + "%";
             }
           } else {
             countWowStr = "n/a";
           }
           
           this.updateContextual(
               count:data[id][i]["count"],
               countWow:countWowStr
               );
         }
       }
     });
     
     td.on.click.add((MouseEvent e) {
       Element el = e.currentTarget;
       if (el.dataAttributes.containsKey("i")) {
         int i = Math.parseInt(el.dataAttributes["i"]);
         if (i < data[id].length) {
           selectedDateRange = i;
           articles.fromDate = ScuttlebuttUI.dateFromString(data[id][i]["from"]);
           articles.toDate = ScuttlebuttUI.dateFromString(data[id][i]["to"]);
           articles.fetchData(thenCall:articles.populateTable);
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
     String count="n/a",
     String countWow="n/a",
     String sentiment="n/a",
     String sentimentWow="n/a"
   ]) {   
   this._articlesCountElement.innerHTML = count;
   this._articlesCountWowElement.innerHTML = countWow;
 }

 void updateDateRange() {
   //articlesFromElement.valueAsDate = articles.fromDate;
   //articlesToElement.valueAsDate = articles.toDate;
   articlesFromElement.value = articles.fromDateShort;
   articlesToElement.value = articles.toDateShort;
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
       fetchData(id, thenCall:this.populateChart, url_:"https://scuttlebutt.googleplex.com/ui/report/get_topic_stats_mock.json");
     } else {
       data[id] = JSON.parse(request.responseText);
       
       print("${data[id].length} new stats loaded for the bar chart.");
       
       if (thenCall !== null) {
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
  * Articles.
  */
class Articles {
  BarChart barChart = null;
  Table outputTable = null;
  DivElement _articlesDivElement = null;
  ButtonElement _loadMoreButton = null;
  Map<int,List> data = null;
  ScuttlebuttUI scuttlebuttUi = null;
  int currentId = null;
  int currentOffset = null;
  
  Date fromDate = null;
  Date toDate = null;
  
  int _waitingToBeShown = null;  // count number of articles that are loaded but haven't been shown yet by populateTable
  
  final int ARTICLES_LIMIT = 20;  // articles per page/request
  
  Articles() {
    data = new Map();
    barChart = new BarChart("table#articles-stats", articles_:this);
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
  String get fromDateIso() => fromDate.year.toString() + "-" + (fromDate.month < 10 ? "0" : "") + fromDate.month.toString() +"-" + (fromDate.day < 10 ? "0" : "") + fromDate.day.toString() + "T" + (fromDate.hours < 10 ? "0" : "") + fromDate.hours.toString() + ":" + (fromDate.minutes < 10 ? "0" : "") + fromDate.minutes.toString() + ":" + (fromDate.seconds < 10 ? "0" : "") + fromDate.seconds.toString();
  String get toDateIso() => toDate.year.toString() + "-" + (toDate.month < 10 ? "0" : "") + toDate.month.toString() +"-" + (toDate.day < 10 ? "0" : "") + toDate.day.toString() + "T" + (toDate.hours < 10 ? "0" : "") + toDate.hours.toString() + ":" + (toDate.minutes < 10 ? "0" : "") + toDate.minutes.toString() + ":" + (toDate.seconds < 10 ? "0" : "") + toDate.seconds.toString();
  
  String get fromDateShort() => fromDateIso.substring(0, 10);
  String get toDateShort() => toDateIso.substring(0, 10);
  
  String getURL(int id, [int limit=null, int offset=0]) {
    if (limit === null) limit = ARTICLES_LIMIT;
    if (DEBUG) {
      return "/report/get_articles_mock.json";
    } else {
      return "/report/get_articles?topic_id=$id&limit=$limit&offset=$offset&min_date=$fromDateIso&max_date=$toDateIso";
    }
  }
  
  /**
    Shows articles for given [Topic] id. Run this the first time you want
    to show the articles.
    */
  void show(int id) {
    this.currentId = id;
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
//     this.outputTable.tableElement.style.display = "block";
//     this._loadMoreButton.style.display = "block";
//     this.barChart.tableElement.style.display = "block";
     this._articlesDivElement.style.display = "block";
   } else {
//     this.outputTable.tableElement.style.display = "none";
//     this._loadMoreButton.style.display = "none";
//     this.barChart.tableElement.style.display = "none";
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
     if (offset == 0) data[id] = new List(); // get rid of all data if starting from beginning
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
  * Topics is where the topics data are stored on the client.
  */
class Topics {
  Table outputTable = null;
  List<Map<String,Object>> data = null;
  ScuttlebuttUI scuttlebuttUi = null;
  //XMLHttpRequest _request = null;
  
  Topics() {
  }
  
  String getURL() {
    if (DEBUG) {
      return "/report/get_topics_mock.json";
    } else {
      return "/report/get_topics";
    }
  }

  void show() {
    if (data !== null) {
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
    for (Map<String,Dynamic> record in data) {
      String wowChangeHtml;
      if (record.containsKey("weekOnWeekChange")) {
        double change = record["weekOnWeekChange"];
        String changeStr;
        String changeSign;
        if (change == null) {
          changeStr = "&#8734;";  // infinity symbol
          changeSign = "+";
        } else {
          changeStr = ((change - 1.0)*100.0).abs().round().toString();
          changeSign = (change >= 1.0) ? "+" : "-";
        }
        wowChangeHtml = "<span class='${(changeSign==="+"?"green":"red")}'>"+changeSign+changeStr+"%</span>"; 
      } else {
        wowChangeHtml = "N/A";
      }
      
      Element tr = this.outputTable.addRow(
        [
         record["name"], 
         record.containsKey("countPastTwentyFourHours") ? record["countPastTwentyFourHours"] : "N/A", 
         record.containsKey("countPastSevenDays") ? record["countPastSevenDays"] : "N/A", 
         wowChangeHtml 
        ]
        );
      tr.on.click.add((event) {
        this.scuttlebuttUi.listArticles(record['id']);
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
      data = JSON.parse(request.responseText);
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
    if (data !== null) {
      for (Map<String,Object> topic in data) {
        if (Math.parseInt(topic["id"]) == id) {
          return topic["name"];
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
class ScuttlebuttUI {
  Articles articles = null;
  Topics topics = null;
  Object currentPage = null;
  
  Element _statusMessage = null;
  Element _subtitle = null;
  ButtonElement _homeButton = null;
  ButtonElement _refreshButton = null; 

  ScuttlebuttUI() {
  }

  void run() {
    articles = new Articles();
    topics = new Topics();
    articles.scuttlebuttUi = topics.scuttlebuttUi = this; // give context
    
    articles.outputTable = new Table("table#articles-table");
    topics.outputTable = new Table("table#topics-table");
    
    _statusMessage = document.query("#status");
    _subtitle = document.query("h1 span#subtitle");
    _homeButton = document.query("#home-button");
    _refreshButton = document.query("#refresh-button");
    statusMessage("Dart is now running.");
    
    _homeButton.on.click.add((Event event) {
      listTopics();
    });
    
    _refreshButton.on.click.add((Event event) {
      articles.refresh();
      topics.refresh();
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
    
    if (url.contains("/report/get_topics")) {
      this.listTopics(pushState:false);
      return;
    } else if (url.contains("/report/get_articles")) {
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
      Map state = {"url" : "#/report/get_topics"};
      window.history.pushState(JSON.stringify(state), "Home", "#/report/get_topics");
    }
    
    articles.visibility = false;
    topics.show();
    currentPage = topics;
    
    setPageTitle();
  }
  
  /**
    Lists all articles for given Topic id in the _outputTable. 
   */
  void listArticles(int id, [bool pushState=true]) {
    if (pushState) {
      Map state = {"url" : "#/report/get_articles?topic_id=$id"};
      window.history.pushState(
        JSON.stringify(state), 
        "Articles", 
        "#/report/get_articles?topic_id=$id"
      );
    }
    
    topics.visibility = false;
    articles.show(id);
    currentPage = articles;
    
    setPageTitle();
  }
  
  void setPageTitle([String str]) {
    if (str !== null) {
      document.title = "$str :: Scuttlebutt";
      _subtitle.innerHTML = str;
    } else if (currentPage === topics) {
      document.title = "Scuttlebutt";
      _subtitle.innerHTML = "Home";
    } else if (currentPage === articles) {
      /* 
        Set header (h1) to correspond the to currently viewed topic. If data is not available on client,
        this calls the Ajax function (fetchData) with a callback that updates the data.
      */
      String topicName = topics.getName(articles.currentId);
      if (topicName != null) {
        document.title = "$topicName :: Scuttlebutt";
        _subtitle.innerHTML = topicName;
      } else {
        topics.fetchData(thenCall:this.setPageTitle);
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
    String diffStr = null;
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
  new ScuttlebuttUI().run();
}