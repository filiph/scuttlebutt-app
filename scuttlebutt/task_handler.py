# Copyright 2011 Google Inc. All Rights Reserved.

"""Defines handlers for dispatching download tasks and downloading feed."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

from google.appengine.api import taskqueue
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from rss_service import RssService

class TaskQueueWrapper(object):
  def Download(self, feed_id):
    url = '/download?feedId=%s' % feed_id
    # Use the default queue.
    taskqueue.add(url=url, method='GET')


class DispatchHandler(webapp.RequestHandler):
  def get(self):
    s = RssService(TaskQueueWrapper())
    s.Dispatch()
    self.response.out.write('Dispatched.')

class DownloadHandler(webapp.RequestHandler):
  def get(self):
    s = RssService()
    feed_id = self.request.get('feedId')
    s.Download(feed_id)
    self.response.out.write('Downloaded.')

def main():
  application = webapp.WSGIApplication([
    ('/dispatch', DispatchHandler),
    ('/download', DownloadHandler),
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
