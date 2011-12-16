# Copyright 2011 Google Inc. All Rights Reserved.

"""Tests for the service classes."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

import datetime
import unittest
import pymock
import feedparser
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.ext import testbed
from model import *
from rss_service import RssService
from scuttlebutt_service import ScuttlebuttService


class RssServiceTests(pymock.PyMockTestCase):
  """Tests for RssService."""

  def setUp(self):
    """Set up for App Engine service stubs and PyMock."""
    super(RssServiceTests, self).setUp()

    # Create test bed and service stubs.
    self.testbed = testbed.Testbed()
    self.testbed.activate()
    self.testbed.init_datastore_v3_stub()
    self.testbed.init_urlfetch_stub()

  def tearDown(self):
    """Clean up testbed and pymock."""
    super(RssServiceTests, self).tearDown()
    self.testbed.deactivate()

  def testInvalidFeedUrlRaisesException(self):
    """Test that the service raises an exception with an invalid feed URL."""
    f1 = Feed()
    f1.name = 'Reuters'
    f1.url = 'some_bad_url'
    f1.put()
    s = RssService()
    self.assertRaises(Exception, s.download, f1.key())

  def testDispatch(self):
    """Test that RssService dispatches tasks."""
    f1 = Feed()
    f1.name = 'Reuters'
    f1.url = 'http://reuters.com/rss.xml'
    f1.put()
    f2 = Feed()
    f2.name = 'USA Today'
    f2.url = 'http://usatoday.com/rss.xml'
    f2.put()
    taskqueue = self.mock()
    # Set expectations.
    taskqueue.download(f1.key())
    taskqueue.download(f2.key())
    # Run test.
    self.replay()
    s = RssService(taskqueue)
    s.dispatch()
    # Validate.
    self.verify()

  def testDownload(self):
    """Test a feed download."""
    f1 = Feed()
    f1.name = 'Reuters'
    f1.url = '../test_data/reuters_test_rss.xml'
    f1.put()

    t1 = Topic()
    t1.name = 'christa Wolf'
    t1.put()

    t2 = Topic()
    t2.name = 'Banana tycoon'
    t2.put()

    s = RssService()
    s.download(f1.key())
    articles = Article.all().order('-title').fetch(limit=1000)
    self.assertEqual(2, len(articles))
    # Examine first article.
    self.assertEqual('German author Christa Wolf dies at 82', articles[0].title)
    self.assertTrue(t1.key() in articles[0].topics)
    self.assertFalse(t2.key() in articles[0].topics)
    self.assertTrue(f1.key() in articles[0].feeds)
    self.assertEqual(datetime.datetime(2011,12,1,14,6,7), articles[0].updated)
    self.assertEqual(('http://www.reuters.com/article/2011/12/01/'
                      'us-germany-christawolf-idUSTRE7B00YS20111201?'
                      'feedType=RSS&feedName=artsNews'), articles[0].url)
    # Examine second article.
    self.assertEqual('Banana tycoon shakes up Russian ballet',
                     articles[1].title)
    self.assertTrue(t2.key() in articles[1].topics)
    self.assertFalse(t1.key() in articles[1].topics)
    self.assertTrue(f1.key() in articles[1].feeds)
    self.assertEqual(datetime.datetime(2011,12,1,16,9,57), articles[1].updated)
    self.assertEqual(('http://www.reuters.com/article/2011/12/01/'
                      'us-russia-mikhailovsky-interview-idUSTRE7B01OX20111201?'
                      'feedType=RSS&feedName=artsNews'), articles[1].url)

  def testDownloadTwice(self):
    """Test calling download twice does not create duplicate articles."""
    f1 = Feed()
    f1.name = 'Reuters'
    f1.url = '../test_data/reuters_test_rss.xml'
    f1.put()

    t1 = Topic()
    t1.name = 'christa Wolf'
    t1.put()

    t2 = Topic()
    t2.name = 'Banana tycoon'
    t2.put()

    s = RssService()
    s.download(f1.key())
    s.download(f1.key())
    articles = Article.all().order('-title').fetch(limit=1000)
    self.assertEqual(2, len(articles))
    self.assertEqual(1, len(articles[0].feeds))
    self.assertEqual(1, len(articles[1].feeds))


class ModelTests(unittest.TestCase):
  """Tests for model class methods."""

  def testTurnTopicToJson(self):
    """Test that a topic can return its dict representation."""
    topic = Topic()
    topic.name = "Chrome"
    topic.put()
    self.assertEquals({'name': 'Chrome', 'id': 1}, topic.ToDict())


class ScuttlebuttServiceTests(unittest.TestCase):
  """Test methods for ScuttlebuttService."""

  def setUp(self):
    """Initialize test bed and service stubs."""
    self.testbed = testbed.Testbed()
    self.testbed.activate()
    self.testbed.init_datastore_v3_stub()
    self.testbed.init_urlfetch_stub()

  def tearDown(self):
    """clean up test bed."""
    self.testbed.deactivate()

  def testGetArticles(self):
    """Test that the service returns a list of articles in JSON."""
    JAN1 = datetime.datetime(2012, 1, 1)
    JAN15 = datetime.datetime(2012, 1, 15)
    JAN31 = datetime.datetime(2012, 1, 31)
    t = Topic()
    t.name = 'News'
    t.put()
    f = Feed()
    f.name = 'Reuters'
    f.url = 'http://reuters.com'
    f.put()
    a1 = Article()
    a1.url = 'http://reuters.com/5'
    a1.title = 'News!'
    a1.summary = 'Something happened'
    a1.updated = JAN15
    a1.topics.append(t.key())
    a1.feeds.append(f.key())
    a1.put()
    s = ScuttlebuttService()
    expected_json = ('[{"url": "http://reuters.com/5", '
                     '"updated": "2012-01-15T00:00:00", '
                     '"summary": "Something happened", '
                     '"id": 3, "title": "News!"}]')
    actual_json = s.get_articles(
        topic_id = t.key().id(),
        min_date = JAN1,
        max_date = JAN31
    )
    self.assertEqual(expected_json, actual_json)

  def testMultipleArticles(self):
    """Test that the service returns articles within date range."""
    JAN1 = datetime.datetime(2012, 1, 1)
    JAN15 = datetime.datetime(2012, 1, 15)
    JAN31 = datetime.datetime(2012, 1, 31)
    FEB1 = datetime.datetime(2012, 2, 1)
    t = Topic()
    t.name = 'News'
    t.put()
    f = Feed()
    f.name = 'Reuters'
    f.url = 'http://reuters.com'
    f.put()
    a1 = Article()
    a1.url = 'http://reuters.com/1'
    a1.title = 'News 1!'
    a1.summary = 'Something happened 1'
    a1.updated = JAN15
    a1.topics.append(t.key())
    a1.feeds.append(f.key())
    a1.put()
    a2 = Article()
    a2.url = 'http://reuters.com/2'
    a2.title = 'News 2!'
    a2.summary = 'Something happened 2'
    a2.updated = FEB1
    a2.topics.append(t.key())
    a2.feeds.append(f.key())
    a2.put()
    s = ScuttlebuttService()
    # Specify start and end dates, get one article.
    expected_json = ('[{"url": "http://reuters.com/1", '
                     '"updated": "2012-01-15T00:00:00", '
                     '"summary": "Something happened 1", '
                     '"id": 3, "title": "News 1!"}]')
    actual_json = s.get_articles(
        topic_id = t.key().id(),
        min_date = JAN1,
        max_date = JAN31
    )
    self.assertEqual(expected_json, actual_json)
    # Specify no dates, get all articles.
    expected_json = (
        '[{"url": "http://reuters.com/1", '
        '"updated": "2012-01-15T00:00:00", '
        '"summary": "Something happened 1", '
        '"id": 3, "title": "News 1!"}, '
        '{"url": "http://reuters.com/2", '
        '"updated": "2012-02-01T00:00:00", '
        '"summary": "Something happened 2", '
        '"id": 4, "title": "News 2!"}]'
    )
    actual_json = s.get_articles(
        topic_id = t.key().id()
    )
    self.assertEqual(expected_json, actual_json)
