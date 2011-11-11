import datetime
import sys
import unittest
import urllib2
import pymock
import dbutil
from google_news_page import GoogleNewsPage
from news_topic import NewsTopic
from news_topic_stats_updater import NewsTopicStatsUpdater
import settings

settings.db='pymysql'


def createDataModel():
  db = dbutil.get_db()
  db.drop_tables()
  db.write('''
    CREATE TABLE news_topic (
      id INT AUTO_INCREMENT NOT NULL,
      name varchar(255) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE(name)
    );
  ''')
  db.write('''
    CREATE TABLE news_topic_stats (
      term_id INT NOT NULL,
      date DATE NOT NULL,
      article_count INT NOT NULL,
      PRIMARY KEY (term_id, date)
    );
  ''')



class FetchPageTests(unittest.TestCase):
  
  def testSimpleFetch(self):
    url = 'https://www.google.com/search?tbm=nws&q=google+plus'
    html = urllib2.urlopen(url)
    page = GoogleNewsPage(html)
    self.assertTrue(page.article_count>0)


class NewsTopicTests(unittest.TestCase):

  def setUp(self):
    createDataModel()
  
  def testReadWrite(self):
    n1 = NewsTopic(name='google chrome')
    n1.save()
    n2 = NewsTopic.getByName('google chrome')
    self.assertEqual(n1, n2)
    n2.name = 'google chrome browser'
    n2.save()
    n3 = NewsTopic.getByName('google chrome browser')
    self.assertEqual(n2, n3)
    
  def testGetArticleCountNone(self):
    JAN1 = datetime.datetime(2012, 1, 1)
    n1 = NewsTopic(name='google chrome')
    self.assertEqual(None, n1.getArticleCount(JAN1))
  
  def testGetArticleCount(self):
    JAN1 = datetime.datetime(2012, 1, 1)
    JAN2 = datetime.datetime(2012, 1, 2)
    n1 = NewsTopic(name='google chrome')
    n1.save()
    n1.saveArticleCount(2, JAN1) 
    n2 = NewsTopic.getByName(n1.name)
    self.assertEqual(2, n2.getArticleCount(JAN1))
    self.assertEqual(None, n2.getArticleCount(JAN2))

  def testSetArticleCountBeforeSave(self):
    JAN1 = datetime.datetime(2012, 1, 1)
    n1 = NewsTopic(name='google chrome')
    self.assertRaises(Exception, n1.saveArticleCount,(2, JAN1))

  def testGetAll(self):
    n1 = NewsTopic(name='google plus')
    n1.save()
    n2 = NewsTopic(name='google chrome')
    n2.save()    
    topics = NewsTopic.getAll()
    self.assertEqual(2, len(topics))
    self.assertEqual(n2, topics[0])
    self.assertEqual(n1, topics[1])


class FetcherTests(pymock.PyMockTestCase):

  def setUp(self):
    super(FetcherTests, self).setUp()
    
  def tearDown(self):
    super(FetcherTests, self).tearDown()
    
  def testInvokeFetches(self):
    createDataModel()
    JAN1 = datetime.datetime(2012,1,1)
    
    # Prepare test data.
    n1 = NewsTopic(name='google chrome')
    n1.save()
    n2 = NewsTopic(name='google plus')
    n2.save()

    file_1 = open('../test_data/google_chrome_test.html', 'r')
    html_1 = file_1.read()
    file_1.close()

    file_2 = open('../test_data/google_plus_test.html', 'r')
    html_2 = file_2.read()
    file_2.close()
    
    # Set expectations.
    getter = self.mock()
    self.expectAndReturn(getter.getPage('google chrome'), html_1)
    self.expectAndReturn(getter.getPage('google plus'), html_2)
    
    # Run test.
    self.replay()
    updater = NewsTopicStatsUpdater(page_getter=getter, today=JAN1)
    updater.update()
    
    # Verify behavior.
    self.verify()
    
    # Verify data results.
    self.assertEqual(2990, n1.getArticleCount(JAN1))
    self.assertEqual(9120, n2.getArticleCount(JAN1))
    
    
class GoogleNewsPageTests(unittest.TestCase):
 
  def testScrapeArticleNumber(self):
    file = open('../test_data/google_plus_test.html', 'r')
    html = file.read()
    file.close()
    page = GoogleNewsPage(html)
    self.assertEqual(9120, page.article_count)
    
  def testScrapeZeroResults(self):
    file = open('../test_data/google_plus_zero_results_test.html', 'r')
    html = file.read()
    file.close()
    page = GoogleNewsPage(html)
    self.assertEqual(0, page.article_count)

  def testScrapeInvalidFormat(self):
    self.assertRaises(Exception, GoogleNewsPage, '')
    
""" When run without parameters like this:
      python tests.py
    all unit tests in this file are run.

    When run with one parameter like this:
      python tests.py Test_Adder
    all unit tests in the Test_Adder case are run.

    When run with two parameters like this:
      python tests.py Test_Adder test_add
    only the method test_add within Test_Adder is run.
"""
if __name__ == '__main__':
  if len(sys.argv) == 2:
    test = eval("%s" % (sys.argv[1]))
    my_suite = unittest.TestLoader().loadTestsFromTestCase(test)
    unittest.TextTestRunner().run(my_suite)
  elif len(sys.argv) == 3:
    my_suite = unittest.TestSuite()
    test = eval("%s('%s')" % (sys.argv[1], sys.argv[2]))
    my_suite.addTest(test)
    unittest.TextTestRunner().run(my_suite)
  else:
    unittest.main()
