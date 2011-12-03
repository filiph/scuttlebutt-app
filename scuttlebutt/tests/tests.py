import sys
import datetime
import pprint
import unittest
import urllib2
import pymock
import feedparser
from google.appengine.ext import db
from google.appengine.ext import testbed
from model import *
from rss_service import RssService


class RssServiceTests(pymock.PyMockTestCase):

  def setUp(self):
    super(RssServiceTests, self).setUp()
    
    # Create test bed and service stubs.
    self.testbed = testbed.Testbed()
    self.testbed.activate()
    self.testbed.init_datastore_v3_stub()
    
  def tearDown(self):
    super(RssServiceTests, self).tearDown()
    self.testbed.deactivate()

  def testDispatch(self):
    f1 = Feed()
    f1.name = 'Reuters'
    f1.url = db.Link('http://reuters.com/rss.xml')
    f1.put()
    f2 = Feed()
    f2.name = 'USA Today'
    f2.url = db.Link('http://usatoday.com/rss.xml')
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
    pass

  def testDownload(self):
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
    self.assertEqual('http://www.reuters.com/article/2011/12/01/us-germany-christawolf-idUSTRE7B00YS20111201?feedType=RSS&feedName=artsNews', articles[0].url)
    # Examine second article.
    self.assertEqual('Banana tycoon shakes up Russian ballet', articles[1].title)
    self.assertTrue(t2.key() in articles[1].topics)
    self.assertFalse(t1.key() in articles[1].topics)
    self.assertTrue(f1.key() in articles[1].feeds)
    self.assertEqual(datetime.datetime(2011,12,1,16,9,57), articles[1].updated)
    self.assertEqual('http://www.reuters.com/article/2011/12/01/us-russia-mikhailovsky-interview-idUSTRE7B01OX20111201?feedType=RSS&feedName=artsNews', articles[1].url)


  def testDownloadTwice(self):
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
    
  
# Handler
#get(self):
#  s = RssService(TaskQueueWrapper())
#  s.dispatch()


#class TaskQueueWrapper():
#
#  def download(self, feed_url):
#    url = '/download?feed=%s' % urllib.quote(feed_url)
#    taskqueue.add(url)
  
