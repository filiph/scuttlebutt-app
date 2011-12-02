from datetime import datetime
import pprint
import feedparser
import string
from model import *
from time import mktime


class RssService(object):
  def __init__(self, taskqueue=None):
    self.taskqueue = taskqueue
  
  def dispatch(self):
    for feed in Feed.all():
      self.taskqueue.download(feed.key())
    
  def download(self, feed_id):
    feed = Feed.get(feed_id)
    feed_content = feedparser.parse(feed.url)
    # Create relationship with Feed.
    pp = pprint.PrettyPrinter()
    #pp.pprint(feed_content)
    for topic in Topic.all():
      for entry in feed_content['entries']:
        if self._match(entry['title'], topic.name) or \
           self._match(entry['summary'], topic.name):
          a = Article()
          a.feeds.append(feed.key())
          a.topics.append(topic.key())
          a.title = entry['title']
          a.summary = entry['summary']
          a.updated = datetime.fromtimestamp(mktime(entry['updated_parsed']))
          a.put()

  def _match(self, text, search_term):
    return (string.find(text.upper(), search_term.upper()) > -1)
