import logging
import urllib
import urllib2

class PageGetter(object):
  
  def urlForTopic(self, topic):
    url_template = 'https://www.google.com/search?tbm=nws&q=%s' 
    return url_template % urllib.quote_plus(topic)
    
  def getPage(self, topic):
    logging.info('Getting page for %s' % topic)
    logging.info('Fetching URL: %s' % self.urlForTopic(topic))
    return self._get_page(self.urlForTopic(topic))
    
  def _get_page(self, url):
    logging.debug(url)
    opener = urllib2.build_opener()
    opener.addheaders = [
        ('User-agent', 
          ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.5; rv:2.0.1)'
          'Gecko/20100101 Firefox/4.0.1 GTBA')
        )
    ]
    response = opener.open(url)
    html = response.read()
    return html
  