import sys
import unittest

class Test_Addition(unittest.TestCase):

  def setUp(self):
    pass
  
  def test_addition(self):
    self.assertEqual(4, 2+2)


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
