import os
import simplejson
from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from model import *
from scuttlebutt_service import ScuttlebuttService


class GetTopicsHandler(webapp.RequestHandler):
  def get(self):
    topics = Topic.all().order('name')
    topic_list = []
    for topic in topics:
      topic_list.append(topic.toDict())
    json = simplejson.dumps(topic_list)
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json)


class GetArticlesHandler(webapp.RequestHandler):
  def get(self):
    s = ScuttlebuttService()
    json = s.get_articles(
      topic_id = int(self.request.get('topic_id')),
      min_date = self.request.get('min_date'),
      max_date = self.request.get('max_date')
    )
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json)

    
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


class DeleteArticlesHandler(webapp.RequestHandler):
  def get(self):
    articles = Article.all()
    for article in articles:
      article.delete()
      

def main():
  application = webapp.WSGIApplication([
    ('/report/report', ReportHandler),
    ('/report/create_feed', CreateFeedHandler),
    ('/report/get_articles', GetArticlesHandler),
    ('/report/get_topics', GetTopicsHandler),
    ('/report/delete_articles', DeleteArticlesHandler)
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
 