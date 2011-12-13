import datetime
import simplejson
from model import *


class ScuttlebuttService(object):
  def get_articles(self, topic_id, min_date=None, max_date=None):
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
      articles_list.append(article.toDict())
    return simplejson.dumps(articles_list)