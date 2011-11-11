#!/usr/bin/env python
import logging
import datetime
import re
try:
  from google.appengine.api import rdbms
except:
  pass
try:
  import pymysql
except:
  pass
import settings


def get_db():
  if settings.db == 'cloudsql':
    return CloudSqlDB(
        instance_name = settings.cloudsql_instance_name,
        database_name = settings.cloudsql_database_name
    )
  elif settings.db == 'pymysql':
    return PyMySqlDB(
        host = settings.pymysql_host,
        port = settings.pymysql_port,
        user = settings.pymysql_user,
        passwd = settings.pymysql_passwd,
        db_name = settings.pymysql_db_name
    )
  else:
    raise Exception('Unknown settings.db: "%s"' % settings.db)


class MySqlDB(object):

  def read(self, sql, data=''):
    conn = self.get_connection()
    retval = None
    c = conn.cursor()
    try:
      if data:
        c.execute(sql, data)
      else:
        c.execute(sql)
      retval = c.fetchall()
    finally:
      c.close()
      conn.close()
    return retval

  def write(self, sql, data=''):
    retval = None
    conn = self.get_connection()
    c = conn.cursor()
    try:
      if data:
        c.execute(sql, data)
      else:
        c.execute(sql)
      conn.commit()
    except Exception, e:
      raise Exception(e)
    finally:
      if hasattr(c, 'lastrowid'):
        retval = c.lastrowid
      c.close()
      conn.close()
      return retval


class CloudSqlDB(MySqlDB):

  def __init__(self, instance_name, database_name):
    super(CloudSqlDB, self).__init__()
    self.google_instance_name = instance_name
    self.google_database_name = database_name

  def get_connection(self):
    return rdbms.connect(
      instance=self.google_instance_name, 
      database=self.google_database_name)


class PyMySqlDB(MySqlDB):

  def __init__(self, host, port, user, passwd, db_name):
    super(PyMySqlDB, self).__init__()
    self.host = host
    self.port = port
    self.user = user
    self.passwd = passwd
    self.db_name = db_name

  def get_connection(self):
    return pymysql.connect(
        host = self.host, 
        port = self.port,
        user = self.user,
        passwd = self.passwd,
        db = self.db_name
    )

  def truncate_tables(self):
    r = self.read('SHOW TABLES;')
    for row in r:
      sql = 'TRUNCATE TABLE %s; ' % row[0]
      self.write(sql)

  def drop_tables(self):
    r = self.read('SHOW TABLES;')
    for row in r:
      sql = 'DROP TABLE %s; ' % row[0]
      self.write(sql)
