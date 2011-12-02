from google.appengine.ext import db


class Feed(db.Model):
  name = db.StringProperty()
  url = db.StringProperty()
  
  
class Topic(db.Model):
  name = db.StringProperty()
  
  
class Article(db.Model):
  id = db.StringProperty()
  title = db.StringProperty()
  summary = db.TextProperty()
  updated = db.DateTimeProperty()
  topics = db.ListProperty(db.Key)
  feeds = db.ListProperty(db.Key)

