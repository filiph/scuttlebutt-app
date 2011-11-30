#!/usr/bin/env python
# encoding: utf-8

import logging


class Article(object):
  def __init__(self):
    pass
    
  def __str__(self):
    return "\"%s\" (%s)" % (self.name, self.url)