# Copyright 2011 Google Inc. All Rights Reserved.

"""Tests for the service classes."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

import datetime
import unittest
import feedparser
from google.appengine.ext import testbed
from model import Article
from model import Feed
from model import Topic
from rss_service import RssService
import pymock
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
    self.assertRaises(Exception, s.Download, f1.key().id())

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
    taskqueue.Download(f1.key().id())
    taskqueue.Download(f2.key().id())
    # Run test.
    self.replay()
    s = RssService(taskqueue)
    s.Dispatch()
    # Validate.
    self.verify()

  def testDownload(self):
    """Test a feed download."""
    f1 = Feed()
    f1.name = 'Reuters'
    f1.monthly_visitors = 35000000
    f1.url = '../test_data/reuters_test_rss.xml'
    f1.put()

    t1 = Topic()
    t1.name = 'christa Wolf'
    t1.put()

    t2 = Topic()
    t2.name = 'Banana tycoon'
    t2.put()

    s = RssService()
    s.Download(f1.key().id())
    articles = Article.all().order('-title').fetch(limit=1000)
    self.assertEqual(2, len(articles))
    # Examine first article.
    self.assertEqual('German author Christa Wolf dies at 82', articles[0].title)
    self.assertEqual(35000000, articles[0].potential_readers)
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
    self.assertEqual(35000000, articles[1].potential_readers)
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
    s.Download(f1.key().id())
    s.Download(f1.key().id())
    articles = Article.all().order('-title').fetch(limit=1000)
    self.assertEqual(2, len(articles))
    self.assertEqual(1, len(articles[0].feeds))
    self.assertEqual(1, len(articles[1].feeds))

  def testComputeTopicStatsSimple(self):
    JAN15_NOON = datetime.datetime(2012, 1, 15, 12)
    JAN15_1PM = datetime.datetime(2012, 1, 15, 13)
    t = Topic()
    t.name = 'Chrome'
    t.put()

    a1 = Article()
    a1.url = 'http://reuters.com/1'
    a1.title = 'News 1!'
    a1.summary = 'Something happened 1'
    a1.updated = JAN15_NOON
    a1.topics.append(t.key())
    a1.put()

    s = RssService()
    s.ComputeTopicStats(JAN15_1PM)

    topics = Topic.all().filter('name =', t.name)
    t = topics[0]
    self.assertEquals(1, t.countPastSevenDays)
    self.assertEquals(1, t.countPastTwentyFourHours)
    self.assertEquals(None, t.weekOnWeekChange)

  def testComputeTopicStatsWithZeroWeeklyChange(self):
    JAN15_NOON = datetime.datetime(2012, 1, 15, 12)
    JAN8_NOON = datetime.datetime(2012, 1, 8, 12)
    JAN15_1PM = datetime.datetime(2012, 1, 15, 13)
    t = Topic()
    t.name = 'Chrome'
    t.put()

    a1 = Article()
    a1.url = 'http://reuters.com/1'
    a1.title = 'News 1!'
    a1.summary = 'Something happened 1'
    a1.updated = JAN15_NOON
    a1.topics.append(t.key())
    a1.put()
    a2 = Article()
    a2.url = 'http://reuters.com/2'
    a2.title = 'News 2!'
    a2.summary = 'Something happened 2'
    a2.updated = JAN8_NOON
    a2.topics.append(t.key())
    a2.put()

    s = RssService()
    s.ComputeTopicStats(JAN15_1PM)

    topics = Topic.all().filter('name =', t.name)
    t = topics[0]
    self.assertEquals(1, t.countPastSevenDays)
    self.assertEquals(1, t.countPastTwentyFourHours)
    self.assertEquals(0, t.weekOnWeekChange)

  def testComputeTopicStatsWithWeeklyChange(self):
    JAN15_NOON = datetime.datetime(2012, 1, 15, 12)
    JAN8_NOON = datetime.datetime(2012, 1, 8, 12)
    JAN15_1PM = datetime.datetime(2012, 1, 15, 13)
    t = Topic()
    t.name = 'Chrome'
    t.put()

    a1 = Article()
    a1.url = 'http://reuters.com/1'
    a1.title = 'News 1!'
    a1.summary = 'Something happened 1'
    a1.updated = JAN15_NOON
    a1.topics.append(t.key())
    a1.put()
    for x in xrange(3):
      a2 = Article()
      a2.url = 'http://reuters.com/%s' % x
      a2.title = 'News!'
      a2.summary = 'Something happened'
      a2.updated = JAN8_NOON
      a2.topics.append(t.key())
      a2.put()

    s = RssService()
    s.ComputeTopicStats(JAN15_1PM)

    topics = Topic.all().filter('name =', t.name)
    t = topics[0]
    self.assertEquals(1, t.countPastSevenDays)
    self.assertEquals(1, t.countPastTwentyFourHours)
    self.assertAlmostEqual(-0.666, t.weekOnWeekChange, 0.001)


class ModelTests(unittest.TestCase):
  """Tests for model class methods."""

  def setUp(self):
    """Set up for App Engine service stubs."""
    self.testbed = testbed.Testbed()
    self.testbed.activate()
    self.testbed.init_datastore_v3_stub()

  def tearDown(self):
    """Clean up testbed."""
    self.testbed.deactivate()

  def testTurnTopicToJson(self):
    """Test that a topic can return its dict representation."""
    topic = Topic()
    topic.name = 'Chrome'
    topic.countPastTwentyFourHours = 2
    topic.weekOnWeekChange = 0.3333
    topic.countPastSevenDays = 12
    topic.put()
    expected_dict = {'id': 1,
                     'countPastTwentyFourHours': 2,
                     'name': 'Chrome',
                     'weekOnWeekChange': 0.3333,
                     'countPastSevenDays': 12}
    self.assertEquals(expected_dict, topic.ToDict())


class ScuttlebuttServiceTests(unittest.TestCase):
  """Test methods for ScuttlebuttService."""

  def setUp(self):
    """Initialize test bed and service stubs."""
    self.testbed = testbed.Testbed()
    self.testbed.activate()
    self.testbed.init_datastore_v3_stub()

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
    a1.potential_readers = 1200
    a1.topics.append(t.key())
    a1.feeds.append(f.key())
    a1.put()
    s = ScuttlebuttService()
    expected_list = [{"url": "http://reuters.com/5",
                     "readership": 1200,
                     "updated": "2012-01-15T00:00:00",
                     "summary": "Something happened",
                     "id": 3, "title": "News!"}]
    actual_list = s.GetArticles(
        topic_id=t.key().id(),
        min_date=JAN1,
        max_date=JAN31
    )
    self.assertEqual(expected_list, actual_list)

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
    a1.potential_readers = 12000
    a1.topics.append(t.key())
    a1.feeds.append(f.key())
    a1.put()
    a2 = Article()
    a2.url = 'http://reuters.com/2'
    a2.title = 'News 2!'
    a2.summary = 'Something happened 2'
    a2.updated = FEB1
    a2.potential_readers = 45000
    a2.topics.append(t.key())
    a2.feeds.append(f.key())
    a2.put()
    s = ScuttlebuttService()
    # Specify start and end dates, get one article.
    expected_list = [{"url": "http://reuters.com/1",
                     "readership": 12000,
                     "updated": "2012-01-15T00:00:00",
                     "summary": "Something happened 1",
                     "id": 3, "title": "News 1!"}]
    actual_list = s.GetArticles(
        topic_id=t.key().id(),
        min_date=JAN1,
        max_date=JAN31
    )
    self.assertEqual(expected_list, actual_list)
    # Specify no dates, get all articles.
    expected_list = [{"url": "http://reuters.com/2",
                    "readership": 45000,
                    "updated": "2012-02-01T00:00:00",
                    "summary": "Something happened 2",
                    "id": 4, "title": "News 2!"},
                    {"url": "http://reuters.com/1",
                    "readership": 12000,
                    "updated": "2012-01-15T00:00:00",
                    "summary": "Something happened 1",
                    "id": 3, "title": "News 1!"}]
    actual_list = s.GetArticles(
        topic_id=t.key().id()
    )
    self.assertEqual(expected_list, actual_list)

  def testGetArticlesWithLimit(self):
    """Test that the service limits results."""
    JAN1 = datetime.datetime(2012, 1, 1)
    JAN15 = datetime.datetime(2012, 1, 15)
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
    a1.updated = JAN1
    a1.potential_readers = 12000
    a1.topics.append(t.key())
    a1.feeds.append(f.key())
    a1.put()
    a2 = Article()
    a2.url = 'http://reuters.com/2'
    a2.title = 'News 2!'
    a2.summary = 'Something happened 2'
    a2.potential_readers = 25000000
    a2.updated = JAN15
    a2.topics.append(t.key())
    a2.feeds.append(f.key())
    a2.put()
    expected_list = [{"url": "http://reuters.com/2",
                    "readership": 25000000,
                    "updated": "2012-01-15T00:00:00",
                    "summary": "Something happened 2",
                    "id": 4, "title": "News 2!"}]
    # Specify limit of 1.
    s = ScuttlebuttService()
    actual_list = s.GetArticles(
        topic_id=t.key().id(),
        limit=1
    )
    self.assertEqual(expected_list, actual_list)

  def testArticlesWithOffset(self):
    """Test that the service returns articles shifted by offset."""
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
    a1.potential_readers = 1200
    a1.topics.append(t.key())
    a1.feeds.append(f.key())
    a1.put()
    a2 = Article()
    a2.url = 'http://reuters.com/2'
    a2.title = 'News 2!'
    a2.summary = 'Something happened 2'
    a2.updated = FEB1
    a2.potential_readers = 29000
    a2.topics.append(t.key())
    a2.feeds.append(f.key())
    a2.put()
    s = ScuttlebuttService()
    # Specify start and end dates, get one article.
    expected_list = [{'url': 'http://reuters.com/1',
                     'readership': 1200,
                     'updated': '2012-01-15T00:00:00',
                     'summary': 'Something happened 1',
                     'id': 3, 'title': 'News 1!'}]
    actual_list = s.GetArticles(
        topic_id=t.key().id(),
        min_date=JAN1,
        max_date=JAN31
    )
    self.assertEqual(expected_list, actual_list)
    # Expect 1 result because of offset.
    expected_list = [{'url': 'http://reuters.com/1',
                     'readership': 1200,
                     'updated': '2012-01-15T00:00:00',
                     'summary': 'Something happened 1',
                     'id': 3, 'title': 'News 1!'}]
    actual_list = s.GetArticles(
        topic_id=t.key().id(),
        limit=1,
        offset=1
    )
    self.assertEqual(expected_list, actual_list)

  def testStringToDate(self):
    """Test that the string to date function works for simple case."""
    s = ScuttlebuttService()
    expected_date = datetime.datetime(2012, 1, 1, 23, 59, 59)
    actual_date = s.StringToDatetime('2012-01-01T23:59:59')
    self.assertEqual(expected_date, actual_date)

  def testStringToDateWithInvalidFormat(self):
    """Test that invalid date formats returns None."""
    s = ScuttlebuttService()
    actual_date = s.StringToDatetime('2012 01 01')
    self.assertEqual(None, actual_date)

  def testStringToDateWithInvalidDate(self):
    """Test invalid dates return None."""
    s = ScuttlebuttService()
    actual_date = s.StringToDatetime('2012-22-01T00:00:00')
    self.assertEqual(None, actual_date)

  def testGetDailyTopicStats(self):
    """Test that we can get daily aggregated article counts."""
    DEC1_NOON = datetime.datetime(2011, 12, 1, 12)
    DEC2_NOON = datetime.datetime(2011, 12, 2, 12)
    DEC2 = datetime.date(2011, 12, 2)
    DEC2_3PM = datetime.datetime(2011, 12, 2, 15)
    t = Topic()
    t.name = 'Chrome'
    t.put()
    a1 = Article()
    a1.updated = DEC1_NOON
    a1.topics.append(t.key())
    a1.put()
    a2 = Article()
    a2.updated = DEC1_NOON
    a2.topics.append(t.key())
    a2.put()
    a3 = Article()
    a3.updated = DEC2_NOON
    a3.topics.append(t.key())
    a3.put()
    a4 = Article()
    a4.updated = DEC2_NOON
    a4.topics.append(t.key())
    a4.put()
    s = ScuttlebuttService()
    result = s.GetDailyTopicStats(topic_id=t.key().id(), today=DEC2)
    expected = [
        {
          "from" : "2011-12-02T00:00:00",
          "to" : "2011-12-02T23:59:59",
          "count" : 2,
        },
        {
          "from" : "2011-12-01T00:00:00",
          "to" : "2011-12-01T23:59:59",
          "count" : 2,
        }
    ]
    self.assertEqual(expected, result)
