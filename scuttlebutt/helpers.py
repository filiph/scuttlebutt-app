# Copyright 2012 Google Inc. All Rights Reserved.

"""Static helper methods."""

__author__ = ('momander@google.com (Martin Omander)',
              'shamjeff@google.com (Jeff Sham)')

import re
import datetime


def StringToInt(str):
  """Converts a string in an int.

  Args:
    str: str The string to convert to int.

  Returns:
    A int for the string, None if it can't be converted.
  """
  try:
    result = int(str)
  except ValueError:
    result = None
  return result

def GetStringParam(request, param, default=None):
  if request.get(param) is not None:
    return request.get(param)
  else:
    if default:
      return default
    else:
      raise Exception(
        'Expected request parameter "%s" but did not find it' % param)

def GetDateParam(request, param, default=None):
  retval = None
  s = GetStringParam(request, param, str(default))
  m = re.search('(\\d\\d\\d\\d)-(\\d\\d)-(\\d\\d)', s)
  if m:
    retval = datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
  else:
    if default:
      retval = default
    else:
      raise Exception('Parameter "%s=%s" is not on yyyy-mm-dd format' % (param, s))
  return retval

def GetIntParam(request, param, default=None):
  retval = None
  s = GetStringParam(request, param, str(default))
  m = re.search('(\\d+)', s)
  if m:
    retval = int(m.group(1))
  else:
    if default is not None:
      retval = default
    else:
      raise Exception('Parameter "%s=%s" is not on int format' % (param, s))
  return retval
