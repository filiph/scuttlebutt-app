# Copyright 2011 Google Inc. All Rights Reserved.

"""Defines handlers for dispatching download tasks and downloading feed."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

import datetime
import logging
from google.appengine.api import taskqueue
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.db import Error
from google.appengine.ext.webapp import util
from model import Article
from rss_service import RssService


class TaskQueueWrapper(object):
  """Wrapper around the app engine task queue."""

  def Download(self, feed_id):
    """Puts a download task into the task queue.

    Args:
      feed_id: str The id of the feed to fetch.
    """
    url = '/task/download?feedId=%s' % feed_id
    # Use the default queue.
    taskqueue.add(url=url, method='GET', queue_name='download')


class DispatchHandler(webapp.RequestHandler):
  """Handler class for setting up fetch tasks."""

  def get(self):
    """Handle HTTP Get to schedule download tasks."""
    s = RssService(TaskQueueWrapper())
    s.Dispatch()
    self.response.out.write('Dispatched.')


class DownloadHandler(webapp.RequestHandler):
  """Handler class for fetching of a single feed."""

  def get(self):
    """Handle HTTP Get to download a feed."""
    s = RssService()
    feed_id = int(self.request.get('feedId'))
    s.Download(feed_id)
    self.response.out.write('Downloaded.')


class ComputeStatsHandler(webapp.RequestHandler):
  """Handler class for computing Topic stats."""

  def get(self):
    s = RssService()
    s.ComputeTopicStats(now=datetime.datetime.now())
    self.response.out.write('OK.')


class DeleteArticlesHandler(webapp.RequestHandler):
  """Handler class to delete all articles."""

  def get(self):
    """Handle HTTP Get to delete articles."""
    articles = Article.all()
    for article in articles:
      article.delete()


class SetReadershipForAllArticlesHandler(webapp.RequestHandler):
  """Handler class to set readership for articles."""

  def get(self):
    """Handle HTTP Get set readership for articles."""
    jobs_dispatched = 0
    for article in Article.all():
      url = '/task/set_article_readerhip?article_id=%s' % article.key().id()
      taskqueue.add(url=url, method='GET')
      jobs_dispatched += 1
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.out.write(
        'Dispatched updates for %d articles' % jobs_dispatched)


class SetArticleReadershipHandler(webapp.RequestHandler):
  """Handler class to set readership for an article."""

  def get(self):
    """Handle HTTP Get set readership for an article."""
    article_id = int(self.request.get('article_id'))
    article = Article.get_by_id(article_id)
    max_visitors = 0
    for feed_key in article.feeds:
      try:
        feed = db.get(feed_key)
        if feed.monthly_visitors > max_visitors:
          max_visitors = feed.monthly_visitors
      except Error:
        logging.info('Could not get feed with key: %s', feed_key)
    article.potential_readers = max_visitors
    article.put()
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.out.write(
        'Set potential_readers=%s for article %s' % (max_visitors, article_id))


def main():
  """Initiates main application."""
  application = webapp.WSGIApplication([
      ('/task/dispatch', DispatchHandler),
      ('/task/download', DownloadHandler),
      ('/task/compute_stats', ComputeStatsHandler),
      ('/task/delete_articles', DeleteArticlesHandler),
      ('/task/set_readership_for_all_articles',
       SetReadershipForAllArticlesHandler),
      ('/task/set_article_readership', SetArticleReadershipHandler),
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
