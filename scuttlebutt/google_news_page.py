import logging
import re
from BeautifulSoup import BeautifulSoup
from cluster import Cluster
from article import Article

class GoogleNewsPage(object):
  def __init__(self, html):
    logging.info(len(html))
    self.article_count = 0
    soup = BeautifulSoup(html)

    # number of results
    element = soup.find(id="resultStats")
    if element: 
      text = element.contents[0]
      m = re.search('([\d\,]+) results?', text)
      if m:
        hits = m.group(1)
        hits = re.sub(',', '', hits)
        self.article_count = int(hits)
      else:
        raise Exception('Found "resultStats" tag but was not able to parse the '
                        'text in it: "%s"' % text)
    else:
      m = re.search('did not match any documents', html)
      if m:
        self.article_count = 0
      else:
        raise Exception('Was not able to parse page!')
    
    self.clusters = []
    
    # iterate over results
    list_items = soup.findAll("li", {"class":"g"})
    for li in list_items:
      # organic results seem to not include a <div class="s">, non-organic do
      if len(li.findAll("div", {"class":"s"})) > 0:
        continue;
      else:
        cluster = Cluster()
        cluster.name = li.h3.a.getText()
        
        # metadata around <span class="hpn">-</span>
        hyphens = li.findAll("span", {"class":"hpn"})
        if len(hyphens) > 0:
          cluster.mainMedium = hyphens[0].findPreviousSibling("span").getText()
        
        intro_candidates = li.findAll("div", {"class":"st"})
        if len(intro_candidates) > 0:
          cluster.intro = intro_candidates[0].getText()
        
        cluster.articles = []
        for blue_link in li.findAll("a", {"class":"l"}):
          article = Article()
          
          article.url = blue_link.attrMap['href']
          gray_spans = blue_link.findAll("span", {"class":"f xsm"})
          if len(gray_spans) > 0:
            article.medium = gray_spans[0].getText()
            gray_spans.extract() # get rid of the span so it doesn't show in article name
            
          article.name = blue_link.getText()
          cluster.articles.append(article)
        
        for green_link in li.findAll("a", {"class":"gl"}):
          if green_link.getText().find(" news articles") != -1:
            cluster.link = green_link.attrMap['href']
        
        self.clusters.append(cluster)
        logging.info(cluster)
    
    

