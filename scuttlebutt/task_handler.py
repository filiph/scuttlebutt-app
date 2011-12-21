# Copyright 2011 Google Inc. All Rights Reserved.

"""Defines handlers for dispatching download tasks and downloading feed."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

from google.appengine.api import taskqueue
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from rss_service import RssService


class TaskQueueWrapper(object):
  """Wrapper around the app engine task queue."""

  def Download(self, feed_id):
    """Puts a download task into the task queue.

    Args:
      feed_id: str The id of the feed to fetch.
    """
    url = '/download?feedId=%s' % feed_id
    # Use the default queue.
    taskqueue.add(url=url, method='GET')


class DispatchHandler(webapp.RequestHandler):
  """Handler class for setting up fetch tasks."""

  def get(self):
    """Handle HTTP Get to schedule download tasks."""
    s = RssService(TaskQueueWrapper())
    s.Dispatch()
    self.response.out.write('Dispatched.')


class DownloadHandler(webapp.RequestHandler):
  """Handler class for fetching of a single feed."""

  def get(self):
    """Handle HTTP Get to download a feed."""
    s = RssService()
    feed_id = self.request.get('feedId')
    s.Download(feed_id)
    self.response.out.write('Downloaded.')


def main():
  """Initiates main application."""
  application = webapp.WSGIApplication([
      ('/dispatch', DispatchHandler),
      ('/download', DownloadHandler),
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
