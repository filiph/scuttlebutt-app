# Copyright 2012 Google Inc. All Rights Reserved.

"""Defines handlers for manipulating Topics, Feeds, and Articles."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util


class RedirectHandler(webapp.RequestHandler):
  """Redirects the user to the main interface page"""

  def get(self):
    self.redirect("/ui/ScuttlebuttUI.html")


def main():
  """Initiates main application."""
  application = webapp.WSGIApplication([
      ('/', RedirectHandler),
  ], debug=True)
  util.run_wsgi_app(application)


if __name__ == '__main__':
  main()
