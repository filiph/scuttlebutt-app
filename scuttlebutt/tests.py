import sys
import unittest
from google_news_page import GoogleNewsPage
class Test_Adder(unittest.TestCase):

  def test_add(self):
    """ Tests that the Adder class adds correctly. """
    from adder import Adder
    a = Adder()
    expected_result = 5
    actual_result = a.add(2, 3)
    self.assertEqual(expected_result, actual_result)

class GetArticleNumber(unittest.TestCase):
 
  def testScrapeArticleNumber(self):
    file = open('../test_data/google_plus_test.html', 'r')
    html = file.read()
    page = GoogleNewsPage(html)
    self.assertEqual(9120, page.articles)
    
  def testScrapeZeroResults(self):
    file = open('../test_data/google_plus_zero_results_test.html', 'r')
    html = file.read()
    page = GoogleNewsPage(html)
    self.assertEqual(0, page.articles)

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
