from google_news_page import GoogleNewsPage
from news_topic import NewsTopic


class NewsTopicStatsUpdater(object):
  
  def __init__(self, page_getter, now):
    self.page_getter = page_getter
    self.now = now
    
  def update(self):
    topics = NewsTopic.getAll()
    topics_updated = 0
    for topic in topics:
      html = self.page_getter.getPage(topic.name)
      news_page = GoogleNewsPage(html)
      topic.saveArticleCount(news_page.article_count, self.now)
      topics_updated += 1
    return topics_updated