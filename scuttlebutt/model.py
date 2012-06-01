# Copyright 2011 Google Inc. All Rights Reserved.

"""Define classes for model objects in the Scuttlebutt application."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

from google.appengine.ext import db


class Feed(db.Model):
  """Represents an RSS Feed."""
  name = db.StringProperty()
  url = db.StringProperty()
  monthly_visitors = db.IntegerProperty(indexed=False)

  @property
  def articles(self):
    """Get articles for that feed."""
    return Article.gql('WHERE feeds = :1', self.key())

  def ToDict(self):
    """Returns a dictionary representation of the object."""
    d = {}
    d['name'] = self.name
    d['url'] = self.url
    d['monthlyVisitors'] = self.monthly_visitors
    d['id'] = int(self.key().id())
    return d

class Topic(db.Model):
  """Represents a topic of interest.

  This can be the name of product that the application should pay attention
  (i.e. Google Chrome).
  """
  name = db.StringProperty()
  countPastSevenDays = db.IntegerProperty(indexed=False)
  countPastTwentyFourHours = db.IntegerProperty(indexed=False)
  weekOnWeekChange = db.FloatProperty(indexed=False)

  def ToDict(self):
    """Returns a dictionary representation of the object."""
    d = {}
    d['name'] = self.name
    d['countPastSevenDays'] = self.countPastSevenDays
    d['countPastTwentyFourHours'] = self.countPastTwentyFourHours
    d['weekOnWeekChange'] = self.weekOnWeekChange
    d['id'] = int(self.key().id())
    return d


class Article(db.Model):
  """Represents an article extracted from a feed."""
  url = db.StringProperty()
  title = db.StringProperty()
  potential_readers = db.IntegerProperty()
  summary = db.TextProperty(indexed=False)
  updated = db.DateTimeProperty()
  topics = db.ListProperty(db.Key)
  feeds = db.ListProperty(db.Key)

  def ToDict(self):
    """Returns a dictionary representation of the object."""
    d = {}
    d['url'] = self.url
    d['title'] = self.title
    d['updated'] = self.updated.isoformat()
    d['id'] = int(self.key().id())
    d['readership'] = self.potential_readers
    d['source_id'] = int(self.feeds[0].id())
    return d
