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
  void reset() {
    tableElement.nodes.clear();
  }
}

/**
  * Articles.
  */
class Articles {
  Table outputTable = null;
  Map<int,List> data;
  ScuttlebuttUI scuttlebuttUi = null;
  
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
    if (data.containsKey(id)) {
      populateTable(id);
    } else {
      fetchData(id);
    }
  }
  
  /**
   * Populates the DOM with data.
   */
 void populateTable(int id) {
   this.outputTable.reset();
   data[id].forEach((result) {
     String linkedTitle = "<a href='${result['url']}'>${result['title']}</a>";
     this.outputTable.addRow([linkedTitle, result['updated'], result['summary']]);
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
 void fetchData(int id) {
   String url = getURL(id);
   XMLHttpRequest request = new XMLHttpRequest();
   request.open("GET", url, true);
   
   request.on.load.add((event) {
     data[id] = JSON.parse(request.responseText);
     print("Articles loaded successfully.");
     populateTable(id);
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
  
  Topics() {
  }
  
  String getURL() {
    return "/report/get_topics";
  }

  void show() {
    if (data !== null) {
      populateTable();
    } else {
      fetchData();
    }
  }
  
  /**
    * Populates the DOM with data.
    */
  void populateTable() {
    this.outputTable.reset();
    data.forEach((result) {
      String linkedName = "${result['name']}";
      Element tr = this.outputTable.addRow([linkedName]);
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
  void fetchData() {
    String url = getURL();
    XMLHttpRequest request = new XMLHttpRequest();
    request.open("GET", url, true);
    
    request.on.load.add((event) {
      data = JSON.parse(request.responseText);
      print("Topics loaded successfully.");
      populateTable();
    });
    request.send();
  }
  
  void refresh() {
    fetchData();
  }
  
}

/**
  * The main app UI class.
  */
class ScuttlebuttUI {
  Articles articles = null;
  Topics topics = null;
  
  Element _statusMessage = null;
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
    
    //this.parseUrl();
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
  }
  
  /**
    Lists all articles for given Topic id in the _outputTable. 
   */
  void listArticles(int id, [bool pushState=true]) {
    if (pushState) {
      Map state = {"url" : "#/report/get_articles?topic_id=$id"};
      window.history.pushState(JSON.stringify(state), "Articles", "#/report/get_articles?topic_id=$id");
    }
    
    topics.visibility = false;
    articles.show(id);
  }
  
  /**
    Changes the contents of the _statusMessage <p> element.
    */ 
  void statusMessage(String message) {
    _statusMessage.innerHTML = message;
  }
}

void main() {
  new ScuttlebuttUI().run();
}