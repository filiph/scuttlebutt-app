# Copyright 2011 Google Inc. All Rights Reserved.

"""Defines the ScuttlebuttService class."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

import datetime
from model import Article
from model import Topic
import simplejson


class ScuttlebuttService(object):
  """Class that contains the service layer methods in the application."""

  def GetArticles(self, topic_id, min_date=None, max_date=None, limit=None,
                  offset=None):
    """Get a list of articles in JSON representation matching the topic.

    Articles returned from this method contains the given topic and has an
    updated date that is within min_date and max_date inclusive.  If a dates are
    not included, the largest possible range is used.  Results are ordered by
    the updated time on the article in descending order.

    Args:
      topic_id: int The id (human readable) of the topic to get articles for.
      [optional]
      min_date: datetime The earliest article updated time to include in the
          list.
      max_date: datetime The latest article updated time to include in the list.
      limit: int The number of results to return.
      offset: int Results returned are shifted by offset.
    Returns:
      A JSON string for the list of articles that has the given topic.
    """
    my_min_date = min_date
    if not my_min_date:
      my_min_date = datetime.datetime.min
    my_max_date = max_date
    if not my_max_date:
      my_max_date = datetime.datetime.max
    topic = Topic.get_by_id(topic_id)
    filter_statement = ('WHERE topics = :1 AND updated >= :2 AND updated <= :3 '
                        'ORDER BY updated DESC')
    if limit:
      filter_statement += ' LIMIT %s' % limit
    if offset:
      filter_statement += ' OFFSET %s' % offset

    articles = Article.gql(filter_statement, topic.key(), my_min_date,
                           my_max_date)
    articles_list = []
    for article in articles:
      articles_list.append(article.ToDict())
    return simplejson.dumps(articles_list)

  def StringToDatetime(self, str):
    """Converts a string in the format yyyy-mm-ddTHH:MM:SS to datetime.

    Args:
      str: str The datetime in the format yyyy-mm-ddTHH:MM:SS.

    Returns:
      A datetime object.
    """
    try:
      result = datetime.datetime.strptime(str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
      result = None
    return result

  def StringToInt(self, str):
    """Converts a string in an int.

    Args:
      str: str The string to convert to int.

    Returns:
      A int for the string.
    """
    try:
      result = int(str)
    except ValueError:
      result = None
    return result
