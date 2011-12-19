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
    listTopics();
  }
  
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
          this.listArticles(result['id']);
        });
      });
      statusMessage("Topics loaded successfully.");
    });
    request.send();
  }
  
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
  
  void statusMessage(String message) {
    // the HTML library defines a global "document" variable
    _statusMessage.innerHTML = message;
  }
  
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
  
  void resetOutputTable() {
    _outputTable.nodes.clear();
  }
}

void main() {
  new ScuttlebuttUI().run();
}
