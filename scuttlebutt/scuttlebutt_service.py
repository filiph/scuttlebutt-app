# Copyright 2011 Google Inc. All Rights Reserved.

"""Defines the ScuttlebuttService class."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

import datetime
import simplejson
from model import *


class ScuttlebuttService(object):
  """Class that contains the service layer methods in the application."""

  def get_articles(self, topic_id, min_date=None, max_date=None):
    """Get a list of articles in JSON representation matching the topic.

    Articles returned from this method contains the given topic and has an
    updated date that is within min_date and max_date inclusive.  If a dates are
    not included, the largest possible range is used.

    Args:
      topic_id int The id (human readable) of the topic to get articles for.
      [optional]
      min_date datetime The earliest article updated time to include in the
          list.
      max_date_datetime The latest article updated time to include in the list.
    Returns:
      A JSON string for the list of articles that has the given topic."""
    my_min_date = min_date
    if not my_min_date:
      my_min_date = datetime.datetime.min
    my_max_date = max_date
    if not my_max_date:
      my_max_date = datetime.datetime.max
    topic = Topic.get_by_id(topic_id)
    filter_statement = 'WHERE topics = :1 AND updated >= :2 AND updated <= :3'
    articles = Article.gql(filter_statement, topic.key(), my_min_date, my_max_date)
    articles_list = []
    for article in articles:
      articles_list.append(article.ToDict())
    return simplejson.dumps(articles_list)
