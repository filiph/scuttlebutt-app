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

  def GetTopicStats(self, topic_id, now):
    s = TopicStatsAggregator(now)
    topic = Topic.get_by_id(topic_id)
    filter_statement = 'WHERE topics = :1'
    articles = Article.gql(filter_statement, topic.key())
    for article in articles:
      s.AddArticle(article)
    return s.ToDict()



class TopicStatsAggregator(object):

  def __init__(self, now):
    self.now = now
    # The week's Monday is the key. The data is a dict of article count, sentiment, etc.
    self.weeks = {}
    self.oldest_monday = None

  def AddArticle(self, article):
    monday = self._GetMonday(article.updated)
    if self.oldest_monday is None or monday < self.oldest_monday:
      self.oldest_monday = monday
    if monday in self.weeks:
      self.weeks[monday]['count'] += 1
    else:
      self.weeks[monday] = {'count': 1,
                            'from': monday.strftime('%Y-%m-%dT%H:%M:%S'),
                            'to': self._EndOfWeek(monday).strftime('%Y-%m-%dT%H:%M:%S')}

  def _EndOfWeek(self, monday):
    return monday + datetime.timedelta(days=7) - datetime.timedelta(seconds=1)

  def _GetMonday(self, search_date):
    result = search_date - datetime.timedelta(days=search_date.weekday())
    d = result.date()
    return datetime.datetime(d.year, d.month, d.day)

  def ToDict(self):
    result = []
    current_monday = self.oldest_monday
    while True:
      if current_monday in self.weeks:
        result.append(self.weeks[current_monday])
      else:
        result.append({'count': 0,
                       'from': current_monday.strftime('%Y-%m-%dT%H:%M:%S'),
                       'to': self._EndOfWeek(current_monday).strftime('%Y-%m-%dT%H:%M:%S')})
      current_monday = current_monday + datetime.timedelta(days=7)
      if current_monday > self.now:
        break
    sorted_result = sorted(result, key=lambda week:week['to'], reverse=True)
    return sorted_result





