#import('dart:html');
#import('dart:json');

class ScuttlebuttUI {

  TableElement _outputTable = null;
  Element _statusMessage = null;
  
  

  ScuttlebuttUI() {
  }

  void run() {
    _statusMessage = document.query("#status");
    _outputTable = document.query("#output-table");
    statusMessage("Dart is now running.");
    resetOutputTable();
    addRow(["Fetching JSON..."]);
    
    
    // history magic (getting Back button to work properly)
    Map state = {"url" : "#/report/get_topics"};
    window.history.pushState(JSON.stringify(state), "Topics", "#/report/get_topics");
    window.on.popState.add((var e) {
      var stateStr = e.state;
      if (stateStr === null) {
        // TODO
      } else {
        Map state = JSON.parse(stateStr);
        if (state["url"] == "#/report/get_topics") {
          listTopics();
        }
      }
    });
    
    listTopics();
  }
  
  /**
    Lists all Topics in the _outputTable. 
    */
  void listTopics() {
    String url = "/report/get_topics";
    XMLHttpRequest request = new XMLHttpRequest();
    request.open("GET", url, true);
    
    request.on.load.add((event) {
      this.resetOutputTable();
      this.addRow(["<strong>Name</strong>"]);
      List<Map<String,Object>> results = JSON.parse(request.responseText);
      results.forEach((result) {
        String linkedName = "${result['name']}";
        Element tr = this.addRow([linkedName]);
        tr.on.click.add((event) {
          Map state = {"url" : "#/report/get_articles?topic_id=${result['id']}"};
          window.history.pushState(JSON.stringify(state), "Articles", "#/report/get_articles?topic_id=${result['id']}");
          this.listArticles(result['id']);
        });
      });
      statusMessage("Topics loaded successfully.");
    });
    request.send();
  }
  
  /**
    Lists all articles for given Topic id in the _outputTable. 
   */
  void listArticles(int id) {
    String url = "/report/get_articles?topic_id=${id}";
    XMLHttpRequest request = new XMLHttpRequest();
    request.open("GET", url, true);
    
    request.on.load.add((event) {
      this.resetOutputTable();
      this.addRow(["<strong>Title</strong>", "<strong>Updated</strong>", "<strong>Summary</strong>"]);
      List<Map<String,Object>> results = JSON.parse(request.responseText);
      results.forEach((result) {
        String linkedTitle = "<a href='${result['url']}'>${result['title']}</a>";
        this.addRow([linkedTitle, result['updated'], result['summary']]);
      });
      statusMessage("Articles loaded successfully.");
    });
    request.send();
  }
  
  /**
    Changes the contents of the _statusMessage <p> element.
    */ 
  void statusMessage(String message) {
    _statusMessage.innerHTML = message;
  }
  
  /**
    Adds a row to the table. A row is represented by a List of Strings. Each list element is
    a <td>. It's HTML content will be the string. 
    
    E.g.: addRow(["blah"]); will create this row: "<tr><td>blah</td></tr>".
    */
  Element addRow(List<String> row) {
    Element tr = new Element.tag('tr');
    for (var i = 0; i < row.length; i++) {
      Element td = new Element.tag('td');
      td.innerHTML = row[i];
      tr.elements.add(td);
    }

    _outputTable.elements.add(tr);
    
    return tr;
  }
  
  /**
    Deletes all rows from the _outputTable element.
    */
  void resetOutputTable() {
    _outputTable.nodes.clear();
  }
}

void main() {
  new ScuttlebuttUI().run();
}
