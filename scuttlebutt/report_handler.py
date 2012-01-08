# Copyright 2011 Google Inc. All Rights Reserved.

"""Defines handlers for manipulating Topics, Feeds, and Articles."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

import os
import datetime
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp import util
from model import Article
from model import Feed
from model import Topic
from scuttlebutt_service import ScuttlebuttService
import simplejson


class GetTopicsHandler(webapp.RequestHandler):
  """Handler class for fetching a JSON list of Topics."""

  def get(self):
    """Handles the HTTP Get for a topic fetch call."""
    topics = Topic.all().order('name')
    topic_list = []
    for topic in topics:
      topic_list.append(topic.ToDict())
    json = simplejson.dumps(topic_list)
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(json)


class GetArticlesHandler(webapp.RequestHandler):
  """Handler class for fetching a JSON list of Articles."""

  def get(self):
    """Handles the HTTP Get for a article fetch call.

       The method requires a topic_id be supplied as a URL parameter.  The
       min_date and max_date are optional and will return the largest possible
       date range if left out.
    """
    s = ScuttlebuttService()
    min_date = s.StringToDatetime(self.request.get('min_date'))
    max_date = s.StringToDatetime(self.request.get('max_date'))
    limit = s.StringToInt(self.request.get('limit'))
    offset = s.StringToInt(self.request.get('offset'))
    article_list = s.GetArticles(
        topic_id=int(self.request.get('topic_id')),
        min_date=min_date,
        max_date=max_date,
        limit=limit,
        offset=offset
    )
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(simplejson.dumps(article_list))


class ReportHandler(webapp.RequestHandler):
  """Handler class for a simple view of the articles."""

  def get(self):
    """Handles the HTTP Get for a article report view."""
    articles = Article.all().order('-updated')
    template_values = {
        'articles': articles
    }
    path = os.path.join(os.path.dirname(__file__), 'templates/report.html')
    self.response.out.write(template.render(path, template_values))


class CreateFeedHandler(webapp.RequestHandler):
  """Handler class to create a dummy Feed and Topic object."""

  def get(self):
    """Handles the HTTP Get for a Feed and Topic creation."""
    f1 = Feed()
    f1.name = 'Reuters'
    f1.url = '../test_data/reuters_test_rss.xml'
    f1.put()
    t2 = Topic()
    t2.name = 'Banana tycoon'
    t2.put()


class GetTopicStatsHandler(webapp.RequestHandler):
  """Handler class to return aggregated topic stats per week."""

  def get(self):
    s = ScuttlebuttService()
    result = s.GetDailyTopicStats(
        topic_id=int(self.request.get('topic_id')),
        now=datetime.datetime.now()
    )
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(simplejson.dumps(result))


class DeleteArticlesHandler(webapp.RequestHandler):
  """Handler class to delete all articles."""

  def get(self):
    """Handle HTTP Get to delete articles."""
    articles = Article.all()
    for article in articles:
      article.delete()


class SetArticleReadershipHandler(webapp.RequestHandler):

  def get(self):
    from google.appengine.ext import db
    for article in Article.gql('ORDER BY potential_readers LIMIT 100'):
      for feed_key in article.feeds:
        try:
          feed = db.get(feed_key)
          article.potential_readers = feed.monthly_visitors
        except:
          article.potential_readers = 0
        article.put()
    zero_count = Article.gql('WHERE potential_readers = 0').count()
    valid_count = Article.gql('WHERE potential_readers > 0').count()
    null_count = Article.gql('WHERE potential_readers = null').count()
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.out.write('Articles with potential_readers=0: %d\n' % zero_count)
    self.response.out.write('Articles with potential_readers=null: %d\n' % null_count)
    self.response.out.write('Articles with potential_readers>0: %d\n' % valid_count)


def main():
  """Initiates main application."""
  application = webapp.WSGIApplication([
      ('/report/report', ReportHandler),
      ('/report/create_feed', CreateFeedHandler),
      ('/report/get_articles', GetArticlesHandler),
      ('/report/get_topics', GetTopicsHandler),
      ('/report/get_topic_stats', GetTopicStatsHandler),
      ('/report/delete_articles', DeleteArticlesHandler),
      ('/report/set_article_readerhip', SetArticleReadershipHandler),
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
