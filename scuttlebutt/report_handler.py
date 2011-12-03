import logging
import os
from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from model import *


class ReportHandler(webapp.RequestHandler):
  def get(self):
    articles = Article.all().order('-updated')
    template_values = {
      'articles': articles
    }
    path = os.path.join(os.path.dirname(__file__), 'templates/report.html')
    self.response.out.write(template.render(path, template_values))


class CreateFeedHandler(webapp.RequestHandler):
  def get(self):
    f1 = Feed()
    f1.name = 'Reuters'
    f1.url = '../test_data/reuters_test_rss.xml'
    f1.put()  
    t2 = Topic()
    t2.name = 'Banana tycoon'
    t2.put()


def main():
  application = webapp.WSGIApplication([
    ('/report', ReportHandler),
    ('/create_feed', CreateFeedHandler)
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
 