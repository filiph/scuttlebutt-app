import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from import NewsTopicStatsUpdater


class UpdateNewsTopicsHandler(webapp.RequestHandler):
  def get(self):
    updater = NewsTopicStatsUpdater(page_getter=getter, today=JAN1)
    topics_updated = updater.update()
    logging.info('%d topics updated' % topics_updated)
    self.response.headers['Content-Type'] = 'text/plain;charset=utf-8'
    self.response.out.write('%d topics updated' % topics_updated)


def main():
  application = webapp.WSGIApplication([
    ('/update_news_topics', UpdateNewsTopicsHandler), 
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
 