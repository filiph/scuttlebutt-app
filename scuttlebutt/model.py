from google.appengine.ext import db


class Feed(db.Model):
  name = db.StringProperty()
  url = db.StringProperty()
  
  
class Topic(db.Model):
  name = db.StringProperty()

  def toDict(self):
    d = {}
    d['name'] = self.name
    d['id'] = int(self.key().id())
    return d
  
class Article(db.Model):
  url = db.StringProperty()
  title = db.StringProperty()
  summary = db.TextProperty()
  updated = db.DateTimeProperty()
  topics = db.ListProperty(db.Key)
  feeds = db.ListProperty(db.Key)

  def toDict(self):
    d = {}
    d['url'] = self.url
    d['title'] = self.title
    d['summary'] = self.summary
    d['updated'] = self.updated.isoformat()
    d['id'] = int(self.key().id())
    return d