import re
from BeautifulSoup import BeautifulSoup

class GoogleNewsPage(object):
  def __init__(self, html):
    self.articles = 0
    soup = BeautifulSoup(html)
    element = soup.find(id="resultStats")
    if element: 
      text = element.contents[0]
      m = re.search('About ([\d\,]+) results', text)
      if m:
        hits = m.group(1)
        hits = re.sub(',', '', hits)
        self.articles = int(hits)
      else:
        raise Exception('Found "resultStats" but was not able to parse text!')
    else:
      m = re.search('did not match any documents', html)
      if m:
        self.articles = 0
      else:
        raise Exception('Was not able to parse page!')


