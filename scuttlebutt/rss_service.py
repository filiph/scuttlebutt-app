from datetime import datetime
import pprint
import feedparser
import logging
import string
from StringIO import StringIO
from google.appengine.api import urlfetch
from google.appengine.ext import db
from model import *
from time import mktime


class RssService(object):
  """This class does download and dispatch of tasks for feed fetching."""

  def __init__(self, taskqueue=None):
    self.taskqueue = taskqueue
  
  def dispatch(self):
    for feed in Feed.all():
      self.taskqueue.download(feed.key())
    
  def download(self, feed_id):
    feed = db.get(feed_id)
    feed_content = feedparser.parse(feed.url)
    # Fetch with urlfetch on App Engine and feed it through to feedparser.
    if not feed_content['entries']:
      try:
        fetched_feed = urlfetch.fetch(feed.url)
        if fetched_feed.status_code is 200:
          feed_content = feedparser.parse(StringIO(fetched_feed.content))
        else:
          msg = 'Could not fetch feed with name %s and url: %s' % (feed.name,                                                     feed.url)
          logging.info('Could not fetch feed with name %s and url: %s'
              % (feed.name, feed.url))
      except Exception:
        msg = 'Error: Feed with name %s has invalid url: %s' % (feed.name,
                                                                feed.url)
        logging.info(msg)
        raise Exception(msg)
      
    # Create relationship with Feed.
    pp = pprint.PrettyPrinter()
    #pp.pprint(feed_content)
    for topic in Topic.all():
      for entry in feed_content['entries']:
        if (self._match(entry['title'], topic.name) or
            self._match(entry['summary'], topic.name)):
          a = None
          articles = Article.all().filter('url = ', entry['id']).fetch(1)
          if articles:
            a = articles[0]
          else:
            a = Article()
          a.url = entry['id']
          a.feeds.append(feed.key())
          a.topics.append(topic.key())
          a.title = entry['title']
          a.summary = entry['summary']
          a.updated = datetime.fromtimestamp(mktime(entry['updated_parsed']))
          a.put()

  def _match(self, text, search_term):
    return (string.find(text.upper(), search_term.upper()) > -1)
