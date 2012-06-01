# Copyright 2011 Google Inc. All Rights Reserved.

"""Defines the RssService class used to fetch feeds.

  Use the dispatch method to queue up a set of download tasks.
  Use the download method to fetch and store articles from a feed.
"""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

from datetime import datetime
from datetime import timedelta
import logging
import string
from StringIO import StringIO
from time import mktime
import feedparser
from google.appengine.api import urlfetch
from google.appengine.ext import db
from model import Article
from model import Feed
from model import Topic


class RssService(object):
  """This class does download and dispatch of tasks for feed fetching."""

  def __init__(self, taskqueue=None):
    """Initialize the service."""
    self.taskqueue = taskqueue

  def Dispatch(self):
    """Creates a download task for each feed in the datastore."""
    for feed in Feed.all():
      self.taskqueue.Download(feed.key().id())

  def Download(self, feed_id):
    """Creates a download task for each feed in the datastore.

    Args:
      feed_id: str The id for the feed to fetch.
    """
    feed = Feed.get_by_id(feed_id)
    feed_content = feedparser.parse(feed.url)
    found_articles = False
    for topic in Topic.all():
      for entry in feed_content['entries']:
        found_articles = True
        if (self._Match(entry['title'], topic.name) or
            self._Match(entry['summary'], topic.name)):
          # Create a new Article, or update existing one.
          a = None
          articles = Article.all().filter('url = ', entry['link']).fetch(1)
          if articles:
            a = articles[0]
          else:
            a = Article()
          # Tie the article to the feed it was downloaded from.
          if feed.key() not in a.feeds:
            a.feeds.append(feed.key())
          if topic.key() not in a.topics:
            a.topics.append(topic.key())
          # Set other article properties, and save it.
          a.url = entry['link']
          a.title = entry['title']
          a.summary = entry['summary']
          a.potential_readers = feed.monthly_visitors
          a.updated = datetime.fromtimestamp(mktime(entry['updated_parsed']))
          a.put()
          logging.info('Saved article with title %s.', a.title)
    if not found_articles:
      logging.warn('Found no articles!')

  def ComputeTopicStats(self, now):
    """Fetch aggregated stats for all topics.

    Args:
        now: datetime Current point in time to calculate stats for.
    """
    a_week_ago = now - timedelta(days=7)
    twenty_four_hours_ago = now - timedelta(days=1)
    two_weeks_ago = now - timedelta(days=14)
    for topic in Topic.all():
      filter_statement = 'WHERE topics = :1 AND updated >= :2 AND updated <= :3'

      topic.countPastSevenDays = Article.gql(
          filter_statement, topic.key(), a_week_ago, now).count()
      topic.countPastTwentyFourHours = Article.gql(
          filter_statement, topic.key(), twenty_four_hours_ago, now).count()
      last_weeks_count = Article.gql(
          filter_statement, topic.key(), two_weeks_ago, a_week_ago).count()

      if last_weeks_count is 0:
        topic.weekOnWeekChange = None
        if topic.countPastSevenDays is 0:
          topic.weekOnWeekChange = 0.0
      else:
        topic.weekOnWeekChange = (1.0 * (topic.countPastSevenDays -
                                         last_weeks_count)) / last_weeks_count

      topic.put()

  def _Match(self, text, search_term):
    """Looks for match of search_term in text.

    Args:
      text: str The text to find match in.
      search_term: str The string to match.

    Returns:
      True if a match is found.
    """
    return string.find(text.upper(), search_term.upper()) > -1
