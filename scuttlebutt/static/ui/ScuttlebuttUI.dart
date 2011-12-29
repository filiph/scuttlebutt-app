#import('dart:html');
#import('dart:json');

bool DEBUG = false;

/**
  * Table.
  */
class Table {
  TableElement tableElement = null;
  
  Table(String domQuery) {
    this.tableElement= document.query(domQuery);
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
  * Articles.
  */
class Articles {
  Table outputTable = null;
  Map<int,List> data;
  ScuttlebuttUI scuttlebuttUi = null;
  int currentId = null;
  
  Articles() {
    data = new Map();
  }
  
  String getURL(int id) {
    if (DEBUG) {
      return "/report/get_articles_mock.json";
    } else {
      return "/report/get_articles?topic_id=${id}";
    }
  }
  
  /**
    * Adds articles data to the client memory.
    */
  void addData(int id, List<Map<String,Object>> inData) {
    data[id] = inData;
  }
  
  void show(int id) {
    this.currentId = id;
    if (data.containsKey(id)) {
      populateTable(id);
    } else {
      fetchData(id, thenCall:populateTable);
    }
  }
  
  /**
   * Populates the article Table with data.
   */
 void populateTable([int id_]) {
   int id = (id_ != null) ? id_ : this.currentId;
   
   this.outputTable.reset();
   data[id].forEach((result) {
     this.outputTable.addRow(
       [
        result['title'], 
        ScuttlebuttUI.prettifyUrl(result['url']), 
        ScuttlebuttUI.prettifyDate(result['updated']), 
        "N/A", 
        "N/A"
       ]
       );
   });
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
 void fetchData(int id, [Function thenCall=null]) {
   String url = getURL(id);
   XMLHttpRequest request = new XMLHttpRequest();
   request.open("GET", url, true);
   
   request.on.load.add((event) {
     data[id] = JSON.parse(request.responseText);
     print("Articles loaded successfully.");
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
  XMLHttpRequest _request = null;
  
  Topics() {
  }
  
  String getURL() {
    return "/report/get_topics";
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
    data.forEach((result) {
      String linkedName = "${result['name']}";
      Element tr = this.outputTable.addRow([linkedName, "N/A", "N/A", "N/A"]);
      tr.on.click.add((event) {
        this.scuttlebuttUi.listArticles(result['id']);
      });
    });
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
    _request = new XMLHttpRequest();
    _request.open("GET", url, true);
    
    _request.on.load.add((event) {
      data = JSON.parse(_request.responseText);
      print("Topics loaded successfully.");
      if (thenCall !== null) {
        thenCall();
      }
    });
    _request.send();
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
    
    articles.outputTable = new Table("div#articles-div table.output-table");
    topics.outputTable = new Table("div#topics-div table.output-table");
    
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
      print("Searched for topic_id in '$url' and found '${match.group(1)}'.");
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
  
  static String prettifyDate(String rawDate) {
    final weekdayStrings = const ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    final monthStrings = const ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    Date date = new Date.fromString(rawDate);
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