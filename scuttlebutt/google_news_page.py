import logging
import re
from BeautifulSoup import BeautifulSoup

class GoogleNewsPage(object):
  def __init__(self, html):
    logging.info(len(html))
    self.article_count = 0
    soup = BeautifulSoup(html)
    element = soup.find(id="resultStats")
    if element: 
      text = element.contents[0]
      m = re.search('([\d\,]+) results', text)
      if m:
        hits = m.group(1)
        hits = re.sub(',', '', hits)
        self.article_count = int(hits)
      else:
        raise Exception('Found "resultStats" but was not able to parse text!')
    else:
      m = re.search('did not match any documents', html)
      if m:
        self.article_count = 0
      else:
        raise Exception('Was not able to parse page!')


