import dbutil


class NewsTopic(object):

  @staticmethod
  def getAll():
    sql = '''
      SELECT  id, name
      FROM    news_topic
      ORDER BY name;
    '''
    r = dbutil.get_db().read(sql)
    retval = []
    for row in r:
      retval.append(NewsTopic(row[0], row[1]))
    return retval
    
  @staticmethod
  def getByName(name):
    sql = '''
      SELECT  id, name
      FROM    news_topic
      WHERE   name=%s;
    '''
    data = (name, )
    r = dbutil.get_db().read(sql, data)
    retval = None
    for row in r:
      retval = NewsTopic(row[0], row[1])
    return retval

  def __init__(self, id=None, name=None):
    self.id = id
    self.name = name
    
  def __cmp__(self, other):
    retval = -1
    if self.id == other.id and self.name == other.name:
      retval = 0
    return retval
  
  def save(self):
    if self.getByName(self.name):
      sql = '''
        UPDATE  news_topic
        SET     name=%s
        WHERE   id=%s;
      '''
      data = (self.name, self.id)
      dbutil.get_db().write(sql, data)
    else:
      sql = '''
        INSERT INTO news_topic
                    (name)
        VALUES      (%s);
      '''
      data = (self.name, )
      self.id = dbutil.get_db().write(sql, data)

  def getArticleCount(self, datetime):
    sql = '''
      SELECT  article_count
      FROM    news_topic_stats
      WHERE   term_id=%s
      AND     datetime=%s;
    '''
    data = (self.id, datetime)
    r = dbutil.get_db().read(sql, data)
    retval = None
    for row in r:
      retval = row[0]
    return retval
    
  def saveArticleCount(self, count, datetime):
    if self.id is None:
      raise Exception('Call save() before saveArticleCount()')
    if self.getArticleCount(datetime) is None:
      sql = '''
        INSERT INTO news_topic_stats
                    (term_id, datetime, article_count)
        VALUES      (%s, %s, %s);
      '''
      data = (self.id, datetime, count)
      dbutil.get_db().write(sql, data)
    else:
      sql = '''
        UPDATE  news_topic_stats
        SET     article_count=%s
        WHERE   term_id=%s
        AND     datetime=%s;
      '''
      data = (count, self.id, datetime)
      dbutil.get_db().write(sql, data)
