#!/usr/bin/env python
# encoding: utf-8


class Cluster(object):
  "Holds one or more articles as they appeard in Google News search results."
  
  def __init__(self):
    pass
  
  def __str__(self):
    string = u"Name: %s\nIntro: %s\nNumber of articles: %d" % (self.name, self.intro, len(self.articles))
    return string