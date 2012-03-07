# Copyright 2011 Google Inc. All Rights Reserved.

"""Defines the ScuttlebuttService class."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

import datetime
import logging
from google.appengine.api import memcache
from model import Article
from model import Topic


class ScuttlebuttService(object):
  """Class that contains the service layer methods in the application."""

  def CreateTopic(self, topic_dict):
    """Create a new topic if it does not already exist.

    Args: topic_dict a dictionary representation of the topic to create.

    Returns:
      A topic object with the datastore assigned ID.

    Raises:
      Exception if the topic already exists or if the fields in the dictionary do
      not match fields on the object.
    """
    if 'name' not in topic_dict:
      raise Exception('Topic provided has no "name" field.')

    count = Topic.all().filter('name =', topic_dict['name']).count(2)
    if count:
      raise Exception(
          'Topic with name "%s" already exists.' % topic_dict['name'])

    topic = Topic()
    topic.name = topic_dict['name']
    topic.put()
    logging.info('Topic with name "%s" was created.' % topic.name)
    memcache.delete('topics')
    return topic

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
    articles = Article.all()
    articles.filter('topics =', topic.key())
    articles.filter('updated >=', my_min_date)
    articles.filter('updated <=', my_max_date)
    articles_list = []
    for article in articles:
      articles_list.append(article.ToDict())
    articles_list = sorted(
        articles_list, key=lambda a: a['readership'], reverse=True)
    my_offset = 0
    if offset:
      my_offset = offset
    my_limit = len(articles_list)
    if limit:
      my_limit = my_offset + limit
    return articles_list[my_offset : my_limit]

  def StringToDatetime(self, str):
    """Converts a string in the format yyyy-mm-ddTHH:MM:SS to datetime.

    Args:
      str: str The datetime in the format yyyy-mm-ddTHH:MM:SS.

    Returns:
      A datetime.datetime object.
    """
    try:
      result = datetime.datetime.strptime(str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
      result = None
    return result

  def StringToDate(self, str):
    """Converts a string in the format yyyy-mm-dd to date.

    Args:
      str: str The datetime in the format yyyy-mm-dd.

    Returns:
      A datetime.date object if the input parameter was in the right format,
      None otherwise.
    """
    try:
      return datetime.datetime.strptime(str, '%Y-%m-%d').date()
    except ValueError:
      return None

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

  def GetDailyTopicStats(self, topic_id, today):
    """Gets the daily aggregated article count.

    Args:
      topic_id: str The id of the topic to report on.
      now: datetime The present datetime (end of report)

    Returns:
      A dictionary where keys are weeks and values is the article count.
    """
    s = DailyTopicStatsAggregator(today)
    topic = Topic.get_by_id(topic_id)
    filter_statement = 'WHERE topics = :1'
    articles = Article.gql(filter_statement, topic.key())
    for article in articles:
      s.AddArticle(article)
    return s.ToDict()


class DailyTopicStatsAggregator(object):
  """Class get the aggregated article counts per week."""

  def __init__(self, today):
    self.today = today
    self.days = {}
    self.oldest_day = None

  def AddArticle(self, article):
    """Add an article to the stats.

    Articles are counted into days where the day (in datetime normalized to the
    midnight on that day) is the key and the count of articles is the value.

    Args:
      article: Article The article model object to add.
    """
    update_date = datetime.date(article.updated.year, article.updated.month, article.updated.day)
    self.days[update_date] = self.days.get(update_date, 0) + 1
    if self.oldest_day is None or update_date < self.oldest_day:
      self.oldest_day = update_date

  def ToDict(self):
    """Gives a dictionary of days and their article counts.

    The dictionary starts with the day of the earliest article and ends at today
    given at init. There are no gaps in the days (a value of 0
    is assigned).

    Returns:
      A dictionary of days and their article counts.
    """
    result = []
    current_day = self.today
    while True:
      result.append(self._GetRecord(current_day, self.days.get(current_day, 0)))
      current_day -= datetime.timedelta(days=1)
      if current_day < self.oldest_day:
        break
    return result

  def _GetRecord(self, date, count):
    """ Returns a dictionary that matches the expected JSON format.
    Args:
      date: The date entry for the record.
      count: The number of articles for that day.

    Returns:
      A dictionary for the article count for the date.
    """
    return {
        'count': count,
        'from': self._BeginningOfDayString(date),
        'to': self._EndOfDayString(date)
    }

  def _EndOfDayString(self, day):
    """Returns the formatted datetime for the end of the day."""
    temp = datetime.datetime(day.year, day.month, day.day)
    temp += datetime.timedelta(days=1)
    temp -= datetime.timedelta(seconds=1)
    return self._Format(temp)

  def _BeginningOfDayString(self, day):
    """Returns the formatted datetime for the beginning of the day."""
    return self._Format(datetime.datetime(day.year, day.month, day.day))

  def _Format(self, datetime):
    """Returns datetime in string format."""
    return datetime.strftime('%Y-%m-%dT%H:%M:%S')

