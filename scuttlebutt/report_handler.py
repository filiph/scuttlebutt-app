# Copyright 2011 Google Inc. All Rights Reserved.

"""Defines handlers for manipulating Topics, Feeds, and Articles."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

import datetime
import logging
import os
import helpers
from google.appengine.api import memcache
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp import util
import simplejson
from model import Article
from model import Feed
from model import Topic
from scuttlebutt_service import ScuttlebuttService


class ArticlesHandler(webapp.RequestHandler):
  """Handler class for fetching a JSON list of Articles."""

  def get(self, topic_id):
    """Handles the HTTP Get for a article fetch call.

       The method requires a topic_id be supplied as a URL parameter.  The
       min_date and max_date are optional and will return the largest possible
       date range if left out.
    """
    s = ScuttlebuttService()
    topic_id = helpers.StringToInt(topic_id)
    from_date = helpers.GetDateParam(self.request, 'from',
        default=datetime.date.min)
    to_date = helpers.GetDateParam(self.request, 'to',
        default=datetime.date.max)
    limit = helpers.GetIntParam(self.request, 'limit', default=10000)
    offset = helpers.GetIntParam(self.request, 'offset', default=0)
    CACHE_KEY = 'get_articles_%s_%s_%s_%s_%s' % (topic_id, from_date, to_date,
        limit, offset)
    if not memcache.get(CACHE_KEY):
      logging.info('Populating cache.')
      article_list = s.GetArticles(
          topic_id=topic_id,
          min_date=from_date,
          max_date=to_date,
          limit=limit,
          offset=offset
      )
      memcache.add(CACHE_KEY, simplejson.dumps(article_list), 600)
    logging.info('Using cache.')
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(memcache.get(CACHE_KEY))


class CreateFeedHandler(webapp.RequestHandler):
  """Handler class to create a dummy Feed and Topic object."""

  def get(self):
    """Handles the HTTP Get for a Feed and Topic creation."""
    f1 = Feed()
    f1.name = 'Test_Feed'
    # Change the feed url here to create your test feed.
    f1.url = 'http://news.google.com/?output=rss'
    f1.put()
    t2 = Topic()
    # A topic of interest.
    t2.name = 'internet'
    t2.put()


class AllTopicsHandler(webapp.RequestHandler):
  """Handler class for fetching a JSON list of Topics."""

  def get(self):
    """Handles the HTTP Get for a topic fetch call."""
    CACHE_KEY = 'topics'
    if not memcache.get(CACHE_KEY):
      logging.info('Populating cache.')
      topics = Topic.all().order('name')
      topic_list = []
      for topic in topics:
        topic_list.append(topic.ToDict())
      memcache.add(CACHE_KEY, simplejson.dumps(topic_list), 600)
    logging.info('Using cache.')
    logging.info(memcache.get(CACHE_KEY))
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(memcache.get(CACHE_KEY))

  def post(self):
    """Handles the HTTP Get for creating a topic."""
    s = ScuttlebuttService()
    try:
      topic_dict = simplejson.loads(self.request.body)
      topic = s.CreateTopic(topic_dict)
      self.response.headers['Content-Type'] = 'application/json'
      self.response.out.write(simplejson.dumps(topic.ToDict()))
    except simplejson.JSONDecodeError:
      # HTTP 400 for bad syntax.
      self.response.set_status(
          400, 'Failed to create topic. Invalid JSON: %s' % self.request.body)
    except Exception, e:
      # HTTP 422 for syntactically correct but semantically wrong.
      self.response.set_status(422, 'Error creating topic: %s' % e)


class SourcesHandler(webapp.RequestHandler):
  """Handler class for fetching a JSON list of Feeds."""

  def get(self):
    """Handles the HTTP Get for a feed fetch call."""
    CACHE_KEY = 'sources'
    if not memcache.get(CACHE_KEY):
      logging.info('Populating cache.')
      feeds = Feed.all().order('name')
      feed_list = []
      for feed in feeds:
        feed_list.append(feed.ToDict())
      memcache.add(CACHE_KEY, simplejson.dumps(feed_list), 600)
    logging.info('Using cache.')
    logging.info(memcache.get(CACHE_KEY))
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(memcache.get(CACHE_KEY))

  def post(self):
    """Handles the HTTP Get for creating a feed."""
    s = ScuttlebuttService()
    try:
      feed_dict = simplejson.loads(self.request.body)
      feed = s.CreateFeed(feed_dict)
      self.response.headers['Content-Type'] = 'application/json'
      self.response.out.write(simplejson.dumps(feed.ToDict()))
    except simplejson.JSONDecodeError:
      # HTTP 400 for bad syntax.
      self.response.set_status(
          400, 'Failed to create source. Invalid JSON: %s' % self.request.body)
    except Exception, e:
      # HTTP 422 for syntactically correct but semantically wrong.
      self.response.set_status(422, 'Error creating source: %s' % e)


class TopicsHandler(webapp.RequestHandler):
  """Handler class to return aggregated topic stats per week."""

  def get(self, topic_id):
    s = ScuttlebuttService()
    today = datetime.date.today()
    CACHE_KEY = 'get_topic_stats_%s_%s' % (topic_id, today)
    if not memcache.get(CACHE_KEY):
      logging.info('Populating cache.')
      result = s.GetDailyTopicStats(int(topic_id), today)
      memcache.add(CACHE_KEY, simplejson.dumps(result), 600)
    logging.info('Using cache.')
    logging.info(memcache.get(CACHE_KEY))
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(memcache.get(CACHE_KEY))


def main():
  """Initiates main application."""
  application = webapp.WSGIApplication([
      ('/report/create_feed', CreateFeedHandler),
      ('/api/articles/(.*)', ArticlesHandler),
      ('/api/topics', AllTopicsHandler),
      ('/api/sources', SourcesHandler),
      ('/api/topic_stats/(\d+)/?', TopicsHandler),
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
