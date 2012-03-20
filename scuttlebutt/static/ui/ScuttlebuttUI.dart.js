//  ********** Library dart:core **************
//  ********** Natives dart:core **************
function $defProp(obj, prop, value) {
  Object.defineProperty(obj, prop,
      {value: value, enumerable: false, writable: true, configurable: true});
}
Function.prototype.bind = Function.prototype.bind ||
  function(thisObj) {
    var func = this;
    var funcLength = func.$length || func.length;
    var argsLength = arguments.length;
    if (argsLength > 1) {
      var boundArgs = Array.prototype.slice.call(arguments, 1);
      var bound = function() {
        // Prepend the bound arguments to the current arguments.
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, boundArgs);
        return func.apply(thisObj, newArgs);
      };
      bound.$length = Math.max(0, funcLength - (argsLength - 1));
      return bound;
    } else {
      var bound = function() {
        return func.apply(thisObj, arguments);
      };
      bound.$length = funcLength;
      return bound;
    }
  };
function $throw(e) {
  // If e is not a value, we can use V8's captureStackTrace utility method.
  // TODO(jmesserly): capture the stack trace on other JS engines.
  if (e && (typeof e == 'object') && Error.captureStackTrace) {
    // TODO(jmesserly): this will clobber the e.stack property
    Error.captureStackTrace(e, $throw);
  }
  throw e;
}
$defProp(Object.prototype, '$index', function(i) {
  $throw(new NoSuchMethodException(this, "operator []", [i]));
});
$defProp(Array.prototype, '$index', function(index) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i];
});
$defProp(String.prototype, '$index', function(i) {
  return this[i];
});
$defProp(Object.prototype, '$setindex', function(i, value) {
  $throw(new NoSuchMethodException(this, "operator []=", [i, value]));
});
$defProp(Array.prototype, '$setindex', function(index, value) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i] = value;
});
function $add$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'string') {
    var str = (y == null) ? 'null' : y.toString();
    if (typeof(str) != 'string') {
      throw new Error("calling toString() on right hand operand of operator " +
      "+ did not return a String");
    }
    return x + str;
  } else if (typeof(x) == 'object') {
    return x.$add(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator +", [y]));
  }
}

function $add$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x + y;
  return $add$complex$(x, y);
}
function $div$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$div(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator /", [y]));
  }
}
function $div$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x / y;
  return $div$complex$(x, y);
}
function $eq$(x, y) {
  if (x == null) return y == null;
  return (typeof(x) != 'object') ? x === y : x.$eq(y);
}
// TODO(jimhug): Should this or should it not match equals?
$defProp(Object.prototype, '$eq', function(other) {
  return this === other;
});
function $gte$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$gte(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator >=", [y]));
  }
}
function $gte$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x >= y;
  return $gte$complex$(x, y);
}
function $lt$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$lt(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator <", [y]));
  }
}
function $lt$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x < y;
  return $lt$complex$(x, y);
}
function $mod$(x, y) {
  if (typeof(x) == 'number') {
    if (typeof(y) == 'number') {
      var result = x % y;
      if (result == 0) {
        return 0;  // Make sure we don't return -0.0.
      } else if (result < 0) {
        if (y < 0) {
          return result - y;
        } else {
          return result + y;
        }
      }
      return result;
    } else {
      $throw(new IllegalArgumentException(y));
    }
  } else if (typeof(x) == 'object') {
    return x.$mod(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator %", [y]));
  }
}
function $ne$(x, y) {
  if (x == null) return y != null;
  return (typeof(x) != 'object') ? x !== y : !x.$eq(y);
}
function $sub$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'object') {
    return x.$sub(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator -", [y]));
  }
}
function $sub$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x - y;
  return $sub$complex$(x, y);
}
function $truncdiv$(x, y) {
  if (typeof(x) == 'number') {
    if (typeof(y) == 'number') {
      if (y == 0) $throw(new IntegerDivisionByZeroException());
      var tmp = x / y;
      return (tmp < 0) ? Math.ceil(tmp) : Math.floor(tmp);
    } else {
      $throw(new IllegalArgumentException(y));
    }
  } else if (typeof(x) == 'object') {
    return x.$truncdiv(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator ~/", [y]));
  }
}
// ********** Code for Object **************
$defProp(Object.prototype, "get$dynamic", function() {
  "use strict"; return this;
});
$defProp(Object.prototype, "noSuchMethod", function(name, args) {
  $throw(new NoSuchMethodException(this, name, args));
});
$defProp(Object.prototype, "add$1", function($0) {
  return this.noSuchMethod("add", [$0]);
});
$defProp(Object.prototype, "clear$0", function() {
  return this.noSuchMethod("clear", []);
});
$defProp(Object.prototype, "is$Collection", function() {
  return false;
});
$defProp(Object.prototype, "is$Duration", function() {
  return false;
});
$defProp(Object.prototype, "is$List", function() {
  return false;
});
$defProp(Object.prototype, "is$Map", function() {
  return false;
});
$defProp(Object.prototype, "is$Map_dart_core_String$Dynamic", function() {
  return false;
});
$defProp(Object.prototype, "is$RegExp", function() {
  return false;
});
$defProp(Object.prototype, "is$_SecretHtmlDocumentImpl", function() {
  return false;
});
$defProp(Object.prototype, "is$html_Element", function() {
  return false;
});
$defProp(Object.prototype, "remove$0", function() {
  return this.noSuchMethod("remove", []);
});
// ********** Code for IndexOutOfRangeException **************
function IndexOutOfRangeException(_index) {
  this._index = _index;
}
IndexOutOfRangeException.prototype.is$IndexOutOfRangeException = function(){return true};
IndexOutOfRangeException.prototype.toString = function() {
  return ("IndexOutOfRangeException: " + this._index);
}
// ********** Code for IllegalAccessException **************
function IllegalAccessException() {

}
IllegalAccessException.prototype.toString = function() {
  return "Attempt to modify an immutable object";
}
// ********** Code for NoSuchMethodException **************
function NoSuchMethodException(_receiver, _functionName, _arguments, _existingArgumentNames) {
  this._receiver = _receiver;
  this._functionName = _functionName;
  this._arguments = _arguments;
  this._existingArgumentNames = _existingArgumentNames;
}
NoSuchMethodException.prototype.is$NoSuchMethodException = function(){return true};
NoSuchMethodException.prototype.toString = function() {
  var sb = new StringBufferImpl("");
  for (var i = (0);
   i < this._arguments.get$length(); i++) {
    if (i > (0)) {
      sb.add(", ");
    }
    sb.add(this._arguments.$index(i));
  }
  if (null == this._existingArgumentNames) {
    return $add$($add$(("NoSuchMethodException : method not found: '" + this._functionName + "'\n"), ("Receiver: " + this._receiver + "\n")), ("Arguments: [" + sb + "]"));
  }
  else {
    var actualParameters = sb.toString();
    sb = new StringBufferImpl("");
    for (var i = (0);
     i < this._existingArgumentNames.get$length(); i++) {
      if (i > (0)) {
        sb.add(", ");
      }
      sb.add(this._existingArgumentNames.$index(i));
    }
    var formalParameters = sb.toString();
    return $add$($add$($add$("NoSuchMethodException: incorrect number of arguments passed to ", ("method named '" + this._functionName + "'\nReceiver: " + this._receiver + "\n")), ("Tried calling: " + this._functionName + "(" + actualParameters + ")\n")), ("Found: " + this._functionName + "(" + formalParameters + ")"));
  }
}
// ********** Code for ClosureArgumentMismatchException **************
function ClosureArgumentMismatchException() {

}
ClosureArgumentMismatchException.prototype.toString = function() {
  return "Closure argument mismatch";
}
// ********** Code for ObjectNotClosureException **************
function ObjectNotClosureException() {

}
ObjectNotClosureException.prototype.toString = function() {
  return "Object is not closure";
}
// ********** Code for IllegalArgumentException **************
function IllegalArgumentException(arg) {
  this._arg = arg;
}
IllegalArgumentException.prototype.is$IllegalArgumentException = function(){return true};
IllegalArgumentException.prototype.toString = function() {
  return ("Illegal argument(s): " + this._arg);
}
// ********** Code for StackOverflowException **************
function StackOverflowException() {

}
StackOverflowException.prototype.toString = function() {
  return "Stack Overflow";
}
// ********** Code for BadNumberFormatException **************
function BadNumberFormatException(_s) {
  this._s = _s;
}
BadNumberFormatException.prototype.toString = function() {
  return ("BadNumberFormatException: '" + this._s + "'");
}
// ********** Code for NullPointerException **************
function NullPointerException() {

}
NullPointerException.prototype.toString = function() {
  return "NullPointerException";
}
// ********** Code for NoMoreElementsException **************
function NoMoreElementsException() {

}
NoMoreElementsException.prototype.toString = function() {
  return "NoMoreElementsException";
}
// ********** Code for EmptyQueueException **************
function EmptyQueueException() {

}
EmptyQueueException.prototype.toString = function() {
  return "EmptyQueueException";
}
// ********** Code for UnsupportedOperationException **************
function UnsupportedOperationException(_message) {
  this._message = _message;
}
UnsupportedOperationException.prototype.toString = function() {
  return ("UnsupportedOperationException: " + this._message);
}
// ********** Code for IntegerDivisionByZeroException **************
function IntegerDivisionByZeroException() {

}
IntegerDivisionByZeroException.prototype.is$IntegerDivisionByZeroException = function(){return true};
IntegerDivisionByZeroException.prototype.toString = function() {
  return "IntegerDivisionByZeroException";
}
// ********** Code for dart_core_Function **************
Function.prototype.to$call$0 = function() {
  this.call$0 = this._genStub(0);
  this.to$call$0 = function() { return this.call$0; };
  return this.call$0;
};
Function.prototype.call$0 = function() {
  return this.to$call$0()();
};
function to$call$0(f) { return f && f.to$call$0(); }
Function.prototype.to$call$1 = function() {
  this.call$1 = this._genStub(1);
  this.to$call$1 = function() { return this.call$1; };
  return this.call$1;
};
Function.prototype.call$1 = function($0) {
  return this.to$call$1()($0);
};
function to$call$1(f) { return f && f.to$call$1(); }
Function.prototype.to$call$2 = function() {
  this.call$2 = this._genStub(2);
  this.to$call$2 = function() { return this.call$2; };
  return this.call$2;
};
Function.prototype.call$2 = function($0, $1) {
  return this.to$call$2()($0, $1);
};
function to$call$2(f) { return f && f.to$call$2(); }
// ********** Code for FutureNotCompleteException **************
function FutureNotCompleteException() {

}
FutureNotCompleteException.prototype.toString = function() {
  return "Exception: future has not been completed";
}
// ********** Code for FutureAlreadyCompleteException **************
function FutureAlreadyCompleteException() {

}
FutureAlreadyCompleteException.prototype.toString = function() {
  return "Exception: future already completed";
}
// ********** Code for Math **************
Math.parseInt = function(str) {
    var match = /^\s*[+-]?(?:(0[xX][abcdefABCDEF0-9]+)|\d+)\s*$/.exec(str);
    if (!match) $throw(new BadNumberFormatException(str));
    var isHex = !!match[1];
    var ret = parseInt(str, isHex ? 16 : 10);
    if (isNaN(ret)) $throw(new BadNumberFormatException(str));
    return ret;
}
Math.min = function(a, b) {
  if (a == b) return a;
    if (a < b) {
      if (isNaN(b)) return b;
      else return a;
    }
    if (isNaN(a)) return a;
    else return b;
}
Math.max = function(a, b) {
  return (a >= b) ? a : b;
}
// ********** Code for Strings **************
function Strings() {}
Strings.join = function(strings, separator) {
  return StringBase.join(strings, separator);
}
// ********** Code for top level **************
function print$(obj) {
  return _print(obj);
}
function _print(obj) {
  if (typeof console == 'object') {
    if (obj) obj = obj.toString();
    console.log(obj);
  } else if (typeof write === 'function') {
    write(obj);
    write('\n');
  }
}
function _toDartException(e) {
  function attachStack(dartEx) {
    // TODO(jmesserly): setting the stack property is not a long term solution.
    var stack = e.stack;
    // The stack contains the error message, and the stack is all that is
    // printed (the exception's toString() is never called).  Make the Dart
    // exception's toString() be the dominant message.
    if (typeof stack == 'string') {
      var message = dartEx.toString();
      if (/^(Type|Range)Error:/.test(stack)) {
        // Indent JS message (it can be helpful) so new message stands out.
        stack = '    (' + stack.substring(0, stack.indexOf('\n')) + ')\n' +
                stack.substring(stack.indexOf('\n') + 1);
      }
      stack = message + '\n' + stack;
    }
    dartEx.stack = stack;
    return dartEx;
  }

  if (e instanceof TypeError) {
    switch(e.type) {
      case 'property_not_function':
      case 'called_non_callable':
        if (e.arguments[0] == null) {
          return attachStack(new NullPointerException());
        } else {
          return attachStack(new ObjectNotClosureException());
        }
        break;
      case 'non_object_property_call':
      case 'non_object_property_load':
        return attachStack(new NullPointerException());
        break;
      case 'undefined_method':
        var mname = e.arguments[0];
        if (typeof(mname) == 'string' && (mname.indexOf('call$') == 0
            || mname == 'call' || mname == 'apply')) {
          return attachStack(new ObjectNotClosureException());
        } else {
          // TODO(jmesserly): fix noSuchMethod on operators so we don't hit this
          return attachStack(new NoSuchMethodException('', e.arguments[0], []));
        }
        break;
    }
  } else if (e instanceof RangeError) {
    if (e.message.indexOf('call stack') >= 0) {
      return attachStack(new StackOverflowException());
    }
  }
  return e;
}
//  ********** Library dart:coreimpl **************
// ********** Code for ListFactory **************
ListFactory = Array;
$defProp(ListFactory.prototype, "is$List", function(){return true});
$defProp(ListFactory.prototype, "is$Collection", function(){return true});
ListFactory.ListFactory$from$factory = function(other) {
  var list = [];
  for (var $$i = other.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    list.add$1(e);
  }
  return list;
}
$defProp(ListFactory.prototype, "get$length", function() { return this.length; });
$defProp(ListFactory.prototype, "set$length", function(value) { return this.length = value; });
$defProp(ListFactory.prototype, "add", function(value) {
  this.push(value);
});
$defProp(ListFactory.prototype, "addAll", function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var item = $$i.next();
    this.add(item);
  }
});
$defProp(ListFactory.prototype, "clear", function() {
  this.set$length((0));
});
$defProp(ListFactory.prototype, "removeLast", function() {
  return this.pop();
});
$defProp(ListFactory.prototype, "last", function() {
  return this.$index(this.get$length() - (1));
});
$defProp(ListFactory.prototype, "getRange", function(start, length) {
      if (length == 0) return [];
      if (length < 0) throw new IllegalArgumentException('length');
      if (start < 0 || start + length > this.length)
        throw new IndexOutOfRangeException(start);
      return this.slice(start, start + length);
    
});
$defProp(ListFactory.prototype, "isEmpty", function() {
  return this.get$length() == (0);
});
$defProp(ListFactory.prototype, "iterator", function() {
  return new ListIterator(this);
});
$defProp(ListFactory.prototype, "toString", function() {
  return Collections.collectionToString(this);
});
$defProp(ListFactory.prototype, "add$1", ListFactory.prototype.add);
$defProp(ListFactory.prototype, "clear$0", ListFactory.prototype.clear);
// ********** Code for ListIterator **************
function ListIterator(array) {
  this._array = array;
  this._pos = (0);
}
ListIterator.prototype.hasNext = function() {
  return this._array.get$length() > this._pos;
}
ListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._array.$index(this._pos++);
}
// ********** Code for ImmutableList **************
/** Implements extends for Dart classes on JavaScript prototypes. */
function $inherits(child, parent) {
  if (child.prototype.__proto__) {
    child.prototype.__proto__ = parent.prototype;
  } else {
    function tmp() {};
    tmp.prototype = parent.prototype;
    child.prototype = new tmp();
    child.prototype.constructor = child;
  }
}
$inherits(ImmutableList, ListFactory);
function ImmutableList(length) {
  Array.call(this, length);
}
ImmutableList.ImmutableList$from$factory = function(other) {
  return _constList(other);
}
ImmutableList.prototype.get$length = function() {
  return this.length;
}
ImmutableList.prototype.set$length = function(length) {
  $throw(const$0008);
}
ImmutableList.prototype.$setindex = function(index, value) {
  $throw(const$0008);
}
ImmutableList.prototype.sort = function(compare) {
  $throw(const$0008);
}
ImmutableList.prototype.add = function(element) {
  $throw(const$0008);
}
ImmutableList.prototype.addAll = function(elements) {
  $throw(const$0008);
}
ImmutableList.prototype.clear = function() {
  $throw(const$0008);
}
ImmutableList.prototype.removeLast = function() {
  $throw(const$0008);
}
ImmutableList.prototype.toString = function() {
  return Collections.collectionToString(this);
}
ImmutableList.prototype.add$1 = ImmutableList.prototype.add;
ImmutableList.prototype.clear$0 = ImmutableList.prototype.clear;
// ********** Code for ImmutableMap **************
function ImmutableMap(keyValuePairs) {
  this._internal = _map(keyValuePairs);
}
ImmutableMap.prototype.is$Map = function(){return true};
ImmutableMap.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
ImmutableMap.prototype.$index = function(key) {
  return this._internal.$index(key);
}
ImmutableMap.prototype.get$length = function() {
  return this._internal.get$length();
}
ImmutableMap.prototype.forEach = function(f) {
  this._internal.forEach(f);
}
ImmutableMap.prototype.getKeys = function() {
  return this._internal.getKeys();
}
ImmutableMap.prototype.containsKey = function(key) {
  return this._internal.containsKey(key);
}
ImmutableMap.prototype.$setindex = function(key, value) {
  $throw(const$0008);
}
ImmutableMap.prototype.clear = function() {
  $throw(const$0008);
}
ImmutableMap.prototype.remove = function(key) {
  $throw(const$0008);
}
ImmutableMap.prototype.toString = function() {
  return Maps.mapToString(this);
}
ImmutableMap.prototype.clear$0 = ImmutableMap.prototype.clear;
// ********** Code for JSSyntaxRegExp **************
function JSSyntaxRegExp(pattern, multiLine, ignoreCase) {
  JSSyntaxRegExp._create$ctor.call(this, pattern, $add$(($eq$(multiLine, true) ? "m" : ""), ($eq$(ignoreCase, true) ? "i" : "")));
}
JSSyntaxRegExp._create$ctor = function(pattern, flags) {
  this.re = new RegExp(pattern, flags);
      this.pattern = pattern;
      this.multiLine = this.re.multiline;
      this.ignoreCase = this.re.ignoreCase;
}
JSSyntaxRegExp._create$ctor.prototype = JSSyntaxRegExp.prototype;
JSSyntaxRegExp.prototype.is$RegExp = function(){return true};
JSSyntaxRegExp.prototype.firstMatch = function(str) {
  var m = this._exec(str);
  return m == null ? null : new MatchImplementation(this.pattern, str, this._matchStart(m), this.get$_lastIndex(), m);
}
JSSyntaxRegExp.prototype._exec = function(str) {
  return this.re.exec(str);
}
JSSyntaxRegExp.prototype._matchStart = function(m) {
  return m.index;
}
JSSyntaxRegExp.prototype.get$_lastIndex = function() {
  return this.re.lastIndex;
}
JSSyntaxRegExp.prototype.stringMatch = function(str) {
  var match = this.firstMatch(str);
  return null == match ? null : match.group((0));
}
// ********** Code for MatchImplementation **************
function MatchImplementation(pattern, str, _start, _end, _groups) {
  this.pattern = pattern;
  this.str = str;
  this._start = _start;
  this._end = _end;
  this._groups = _groups;
}
MatchImplementation.prototype.group = function(group) {
  return this._groups.$index(group);
}
MatchImplementation.prototype.$index = function(group) {
  return this._groups.$index(group);
}
// ********** Code for NumImplementation **************
NumImplementation = Number;
NumImplementation.prototype.$negate = function() {
  'use strict'; return -this;
}
NumImplementation.prototype.remainder = function(other) {
  'use strict'; return this % other;
}
NumImplementation.prototype.isNaN = function() {
  'use strict'; return isNaN(this);
}
NumImplementation.prototype.isNegative = function() {
  'use strict'; return this == 0 ? (1 / this) < 0 : this < 0;
}
NumImplementation.prototype.abs = function() {
  'use strict'; return Math.abs(this);
}
NumImplementation.prototype.round = function() {
  'use strict'; return Math.round(this);
}
NumImplementation.prototype.hashCode = function() {
  'use strict'; return this & 0x1FFFFFFF;
}
NumImplementation.prototype.toInt = function() {
    'use strict';
    if (isNaN(this)) $throw(new BadNumberFormatException("NaN"));
    if ((this == Infinity) || (this == -Infinity)) {
      $throw(new BadNumberFormatException("Infinity"));
    }
    var truncated = (this < 0) ? Math.ceil(this) : Math.floor(this);
    if (truncated == -0.0) return 0;
    return truncated;
}
NumImplementation.prototype.toDouble = function() {
  'use strict'; return this + 0;
}
NumImplementation.prototype.toStringAsFixed = function(fractionDigits) {
  'use strict'; return this.toFixed(fractionDigits);
}
NumImplementation.prototype.compareTo = function(other) {
  var thisValue = this.toDouble();
  if (thisValue < other) {
    return (-1);
  }
  else if (thisValue > other) {
    return (1);
  }
  else if (thisValue == other) {
    if (thisValue == (0)) {
      var thisIsNegative = this.isNegative();
      var otherIsNegative = other.isNegative();
      if ($eq$(thisIsNegative, otherIsNegative)) return (0);
      if (thisIsNegative) return (-1);
      return (1);
    }
    return (0);
  }
  else if (this.isNaN()) {
    if (other.isNaN()) {
      return (0);
    }
    return (1);
  }
  else {
    return (-1);
  }
}
// ********** Code for DurationImplementation **************
function DurationImplementation(days, hours, minutes, seconds, milliseconds) {
  this.inMilliseconds = days * (86400000) + hours * (3600000) + minutes * (60000) + seconds * (1000) + milliseconds;
}
DurationImplementation.prototype.is$Duration = function(){return true};
DurationImplementation.prototype.get$inMilliseconds = function() { return this.inMilliseconds; };
DurationImplementation.prototype.get$inDays = function() {
  return $truncdiv$(this.inMilliseconds, (86400000));
}
DurationImplementation.prototype.get$inHours = function() {
  return $truncdiv$(this.inMilliseconds, (3600000));
}
DurationImplementation.prototype.get$inMinutes = function() {
  return $truncdiv$(this.inMilliseconds, (60000));
}
DurationImplementation.prototype.get$inSeconds = function() {
  return $truncdiv$(this.inMilliseconds, (1000));
}
DurationImplementation.prototype.$eq = function(other) {
  if (!(other && other.is$Duration())) return false;
  return this.inMilliseconds == other.get$inMilliseconds();
}
DurationImplementation.prototype.hashCode = function() {
  return this.inMilliseconds.hashCode();
}
DurationImplementation.prototype.compareTo = function(other) {
  return this.inMilliseconds.compareTo(other.inMilliseconds);
}
DurationImplementation.prototype.toString = function() {
  function threeDigits(n) {
    if (n >= (100)) return ("" + n);
    if (n > (10)) return ("0" + n);
    return ("00" + n);
  }
  function twoDigits(n) {
    if (n >= (10)) return ("" + n);
    return ("0" + n);
  }
  if (this.inMilliseconds < (0)) {
    var duration = new DurationImplementation((0), (0), (0), (0), -this.inMilliseconds);
    return ("-" + duration);
  }
  var twoDigitMinutes = twoDigits(this.get$inMinutes().remainder((60)));
  var twoDigitSeconds = twoDigits(this.get$inSeconds().remainder((60)));
  var threeDigitMs = threeDigits(this.inMilliseconds.remainder((1000)));
  return ("" + this.get$inHours() + ":" + twoDigitMinutes + ":" + twoDigitSeconds + "." + threeDigitMs);
}
// ********** Code for ExceptionImplementation **************
function ExceptionImplementation(msg) {
  this._msg = msg;
}
ExceptionImplementation.prototype.toString = function() {
  return (null == this._msg) ? "Exception" : ("Exception: " + this._msg);
}
// ********** Code for Collections **************
function Collections() {}
Collections.collectionToString = function(c) {
  var result = new StringBufferImpl("");
  Collections._emitCollection(c, result, new Array());
  return result.toString();
}
Collections._emitCollection = function(c, result, visiting) {
  visiting.add(c);
  var isList = !!(c && c.is$List());
  result.add(isList ? "[" : "{");
  var first = true;
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(e, result, visiting);
  }
  result.add(isList ? "]" : "}");
  visiting.removeLast();
}
Collections._emitObject = function(o, result, visiting) {
  if (!!(o && o.is$Collection())) {
    if (Collections._containsRef(visiting, o)) {
      result.add(!!(o && o.is$List()) ? "[...]" : "{...}");
    }
    else {
      Collections._emitCollection(o, result, visiting);
    }
  }
  else if (!!(o && o.is$Map())) {
    if (Collections._containsRef(visiting, o)) {
      result.add("{...}");
    }
    else {
      Maps._emitMap(o, result, visiting);
    }
  }
  else {
    result.add($eq$(o) ? "null" : o);
  }
}
Collections._containsRef = function(c, ref) {
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if ((null == e ? null == (ref) : e === ref)) return true;
  }
  return false;
}
// ********** Code for FutureImpl **************
function FutureImpl() {
  this._listeners = new Array();
  this._exceptionHandlers = new Array();
  this._isComplete = false;
  this._exceptionHandled = false;
}
FutureImpl.prototype.get$value = function() {
  if (!this.get$isComplete()) {
    $throw(new FutureNotCompleteException());
  }
  if (null != this._exception) {
    $throw(this._exception);
  }
  return this._value;
}
FutureImpl.prototype.get$isComplete = function() {
  return this._isComplete;
}
FutureImpl.prototype.get$hasValue = function() {
  return this.get$isComplete() && null == this._exception;
}
FutureImpl.prototype.then = function(onComplete) {
  if (this.get$hasValue()) {
    onComplete(this.get$value());
  }
  else if (!this.get$isComplete()) {
    this._listeners.add(onComplete);
  }
  else if (!this._exceptionHandled) {
    $throw(this._exception);
  }
}
FutureImpl.prototype._complete = function() {
  this._isComplete = true;
  if (null != this._exception) {
    var $$list = this._exceptionHandlers;
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var handler = $$i.next();
      if (handler.call$1(this._exception)) {
        this._exceptionHandled = true;
        break;
      }
    }
  }
  if (this.get$hasValue()) {
    var $$list = this._listeners;
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var listener = $$i.next();
      listener.call$1(this.get$value());
    }
  }
  else {
    if (!this._exceptionHandled && this._listeners.get$length() > (0)) {
      $throw(this._exception);
    }
  }
}
FutureImpl.prototype._setValue = function(value) {
  if (this._isComplete) {
    $throw(new FutureAlreadyCompleteException());
  }
  this._value = value;
  this._complete();
}
FutureImpl.prototype._setException = function(exception) {
  if (null == exception) {
    $throw(new IllegalArgumentException(null));
  }
  if (this._isComplete) {
    $throw(new FutureAlreadyCompleteException());
  }
  this._exception = exception;
  this._complete();
}
// ********** Code for CompleterImpl **************
function CompleterImpl() {
  this._futureImpl = new FutureImpl();
}
CompleterImpl.prototype.get$future = function() {
  return this._futureImpl;
}
CompleterImpl.prototype.complete = function(value) {
  this._futureImpl._setValue(value);
}
CompleterImpl.prototype.completeException = function(exception) {
  this._futureImpl._setException(exception);
}
// ********** Code for HashMapImplementation **************
function HashMapImplementation() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation.prototype.is$Map = function(){return true};
HashMapImplementation.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
HashMapImplementation._computeLoadLimit = function(capacity) {
  return $truncdiv$((capacity * (3)), (4));
}
HashMapImplementation._firstProbe = function(hashCode, length) {
  return hashCode & (length - (1));
}
HashMapImplementation._nextProbe = function(currentProbe, numberOfProbes, length) {
  return (currentProbe + numberOfProbes) & (length - (1));
}
HashMapImplementation.prototype._probeForAdding = function(key) {
  var hash = HashMapImplementation._firstProbe(key.hashCode(), this._keys.get$length());
  var numberOfProbes = (1);
  var initialHash = hash;
  var insertionIndex = (-1);
  while (true) {
    var existingKey = this._keys.$index(hash);
    if (null == existingKey) {
      if (insertionIndex < (0)) return hash;
      return insertionIndex;
    }
    else if ($eq$(existingKey, key)) {
      return hash;
    }
    else if ((insertionIndex < (0)) && ((null == const$0000 ? null == (existingKey) : const$0000 === existingKey))) {
      insertionIndex = hash;
    }
    hash = HashMapImplementation._nextProbe(hash, numberOfProbes++, this._keys.get$length());
  }
}
HashMapImplementation.prototype._probeForLookup = function(key) {
  var hash = HashMapImplementation._firstProbe(key.hashCode(), this._keys.get$length());
  var numberOfProbes = (1);
  var initialHash = hash;
  while (true) {
    var existingKey = this._keys.$index(hash);
    if (null == existingKey) return (-1);
    if ($eq$(existingKey, key)) return hash;
    hash = HashMapImplementation._nextProbe(hash, numberOfProbes++, this._keys.get$length());
  }
}
HashMapImplementation.prototype._ensureCapacity = function() {
  var newNumberOfEntries = this._numberOfEntries + (1);
  if (newNumberOfEntries >= this._loadLimit) {
    this._grow(this._keys.get$length() * (2));
    return;
  }
  var capacity = this._keys.get$length();
  var numberOfFreeOrDeleted = capacity - newNumberOfEntries;
  var numberOfFree = numberOfFreeOrDeleted - this._numberOfDeleted;
  if (this._numberOfDeleted > numberOfFree) {
    this._grow(this._keys.get$length());
  }
}
HashMapImplementation._isPowerOfTwo = function(x) {
  return ((x & (x - (1))) == (0));
}
HashMapImplementation.prototype._grow = function(newCapacity) {
  var capacity = this._keys.get$length();
  this._loadLimit = HashMapImplementation._computeLoadLimit(newCapacity);
  var oldKeys = this._keys;
  var oldValues = this._values;
  this._keys = new Array(newCapacity);
  this._values = new Array(newCapacity);
  for (var i = (0);
   i < capacity; i++) {
    var key = oldKeys.$index(i);
    if (null == key || (null == key ? null == (const$0000) : key === const$0000)) {
      continue;
    }
    var value = oldValues.$index(i);
    var newIndex = this._probeForAdding(key);
    this._keys.$setindex(newIndex, key);
    this._values.$setindex(newIndex, value);
  }
  this._numberOfDeleted = (0);
}
HashMapImplementation.prototype.clear = function() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  var length = this._keys.get$length();
  for (var i = (0);
   i < length; i++) {
    this._keys.$setindex(i);
    this._values.$setindex(i);
  }
}
HashMapImplementation.prototype.$setindex = function(key, value) {
  var $0;
  this._ensureCapacity();
  var index = this._probeForAdding(key);
  if ((null == this._keys.$index(index)) || ((($0 = this._keys.$index(index)) == null ? null == (const$0000) : $0 === const$0000))) {
    this._numberOfEntries++;
  }
  this._keys.$setindex(index, key);
  this._values.$setindex(index, value);
}
HashMapImplementation.prototype.$index = function(key) {
  var index = this._probeForLookup(key);
  if (index < (0)) return null;
  return this._values.$index(index);
}
HashMapImplementation.prototype.remove = function(key) {
  var index = this._probeForLookup(key);
  if (index >= (0)) {
    this._numberOfEntries--;
    var value = this._values.$index(index);
    this._values.$setindex(index);
    this._keys.$setindex(index, const$0000);
    this._numberOfDeleted++;
    return value;
  }
  return null;
}
HashMapImplementation.prototype.isEmpty = function() {
  return this._numberOfEntries == (0);
}
HashMapImplementation.prototype.get$length = function() {
  return this._numberOfEntries;
}
HashMapImplementation.prototype.forEach = function(f) {
  var length = this._keys.get$length();
  for (var i = (0);
   i < length; i++) {
    var key = this._keys.$index(i);
    if ((null != key) && ((null == key ? null != (const$0000) : key !== const$0000))) {
      f(key, this._values.$index(i));
    }
  }
}
HashMapImplementation.prototype.getKeys = function() {
  var list = new Array(this.get$length());
  var i = (0);
  this.forEach(function _(key, value) {
    list.$setindex(i++, key);
  }
  );
  return list;
}
HashMapImplementation.prototype.containsKey = function(key) {
  return (this._probeForLookup(key) != (-1));
}
HashMapImplementation.prototype.toString = function() {
  return Maps.mapToString(this);
}
HashMapImplementation.prototype.clear$0 = HashMapImplementation.prototype.clear;
// ********** Code for HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair **************
$inherits(HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair, HashMapImplementation);
function HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.is$Map = function(){return true};
HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
// ********** Code for HashMapImplementation_dart_core_String$dart_core_String **************
$inherits(HashMapImplementation_dart_core_String$dart_core_String, HashMapImplementation);
function HashMapImplementation_dart_core_String$dart_core_String() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation_dart_core_String$dart_core_String.prototype.is$Map = function(){return true};
HashMapImplementation_dart_core_String$dart_core_String.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
// ********** Code for HashMapImplementation_int$TopicStats **************
$inherits(HashMapImplementation_int$TopicStats, HashMapImplementation);
function HashMapImplementation_int$TopicStats() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation_int$TopicStats.prototype.is$Map = function(){return true};
HashMapImplementation_int$TopicStats.prototype.is$Map_dart_core_String$Dynamic = function(){return false};
// ********** Code for HashSetImplementation **************
function HashSetImplementation() {
  this._backingMap = new HashMapImplementation();
}
HashSetImplementation.prototype.is$Collection = function(){return true};
HashSetImplementation.prototype.clear = function() {
  this._backingMap.clear();
}
HashSetImplementation.prototype.add = function(value) {
  this._backingMap.$setindex(value, value);
}
HashSetImplementation.prototype.remove = function(value) {
  if (!this._backingMap.containsKey(value)) return false;
  this._backingMap.remove(value);
  return true;
}
HashSetImplementation.prototype.addAll = function(collection) {
  var $this = this; // closure support
  collection.forEach(function _(value) {
    $this.add(value);
  }
  );
}
HashSetImplementation.prototype.forEach = function(f) {
  this._backingMap.forEach(function _(key, value) {
    f(key);
  }
  );
}
HashSetImplementation.prototype.filter = function(f) {
  var result = new HashSetImplementation();
  this._backingMap.forEach(function _(key, value) {
    if (f(key)) result.add(key);
  }
  );
  return result;
}
HashSetImplementation.prototype.isEmpty = function() {
  return this._backingMap.isEmpty();
}
HashSetImplementation.prototype.get$length = function() {
  return this._backingMap.get$length();
}
HashSetImplementation.prototype.iterator = function() {
  return new HashSetIterator(this);
}
HashSetImplementation.prototype.toString = function() {
  return Collections.collectionToString(this);
}
HashSetImplementation.prototype.add$1 = HashSetImplementation.prototype.add;
HashSetImplementation.prototype.clear$0 = HashSetImplementation.prototype.clear;
// ********** Code for HashSetImplementation_dart_core_String **************
$inherits(HashSetImplementation_dart_core_String, HashSetImplementation);
function HashSetImplementation_dart_core_String() {
  this._backingMap = new HashMapImplementation_dart_core_String$dart_core_String();
}
HashSetImplementation_dart_core_String.prototype.is$Collection = function(){return true};
// ********** Code for HashSetIterator **************
function HashSetIterator(set_) {
  this._nextValidIndex = (-1);
  this._entries = set_._backingMap._keys;
  this._advance();
}
HashSetIterator.prototype.hasNext = function() {
  var $0;
  if (this._nextValidIndex >= this._entries.get$length()) return false;
  if ((($0 = this._entries.$index(this._nextValidIndex)) == null ? null == (const$0000) : $0 === const$0000)) {
    this._advance();
  }
  return this._nextValidIndex < this._entries.get$length();
}
HashSetIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  var res = this._entries.$index(this._nextValidIndex);
  this._advance();
  return res;
}
HashSetIterator.prototype._advance = function() {
  var length = this._entries.get$length();
  var entry;
  var deletedKey = const$0000;
  do {
    if (++this._nextValidIndex >= length) break;
    entry = this._entries.$index(this._nextValidIndex);
  }
  while ((null == entry) || ((null == entry ? null == (deletedKey) : entry === deletedKey)))
}
// ********** Code for _DeletedKeySentinel **************
function _DeletedKeySentinel() {

}
// ********** Code for KeyValuePair **************
function KeyValuePair(key, value) {
  this.key = key;
  this.value = value;
}
KeyValuePair.prototype.get$value = function() { return this.value; };
KeyValuePair.prototype.set$value = function(value) { return this.value = value; };
// ********** Code for LinkedHashMapImplementation **************
function LinkedHashMapImplementation() {
  this._map = new HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair();
  this._list = new DoubleLinkedQueue_KeyValuePair();
}
LinkedHashMapImplementation.prototype.is$Map = function(){return true};
LinkedHashMapImplementation.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
LinkedHashMapImplementation.prototype.$setindex = function(key, value) {
  if (this._map.containsKey(key)) {
    this._map.$index(key).get$element().set$value(value);
  }
  else {
    this._list.addLast(new KeyValuePair(key, value));
    this._map.$setindex(key, this._list.lastEntry());
  }
}
LinkedHashMapImplementation.prototype.$index = function(key) {
  var entry = this._map.$index(key);
  if (null == entry) return null;
  return entry.get$element().get$value();
}
LinkedHashMapImplementation.prototype.remove = function(key) {
  var entry = this._map.remove(key);
  if (null == entry) return null;
  entry.remove();
  return entry.get$element().get$value();
}
LinkedHashMapImplementation.prototype.getKeys = function() {
  var list = new Array(this.get$length());
  var index = (0);
  this._list.forEach(function _(entry) {
    list.$setindex(index++, entry.key);
  }
  );
  return list;
}
LinkedHashMapImplementation.prototype.forEach = function(f) {
  this._list.forEach(function _(entry) {
    f(entry.key, entry.value);
  }
  );
}
LinkedHashMapImplementation.prototype.containsKey = function(key) {
  return this._map.containsKey(key);
}
LinkedHashMapImplementation.prototype.get$length = function() {
  return this._map.get$length();
}
LinkedHashMapImplementation.prototype.clear = function() {
  this._map.clear();
  this._list.clear();
}
LinkedHashMapImplementation.prototype.toString = function() {
  return Maps.mapToString(this);
}
LinkedHashMapImplementation.prototype.clear$0 = LinkedHashMapImplementation.prototype.clear;
// ********** Code for Maps **************
function Maps() {}
Maps.mapToString = function(m) {
  var result = new StringBufferImpl("");
  Maps._emitMap(m, result, new Array());
  return result.toString();
}
Maps._emitMap = function(m, result, visiting) {
  visiting.add(m);
  result.add("{");
  var first = true;
  m.forEach((function (k, v) {
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(k, result, visiting);
    result.add(": ");
    Collections._emitObject(v, result, visiting);
  })
  );
  result.add("}");
  visiting.removeLast();
}
// ********** Code for DoubleLinkedQueueEntry **************
function DoubleLinkedQueueEntry(e) {
  this._element = e;
}
DoubleLinkedQueueEntry.prototype._link = function(p, n) {
  this._next = n;
  this._previous = p;
  p._next = this;
  n._previous = this;
}
DoubleLinkedQueueEntry.prototype.prepend = function(e) {
  new DoubleLinkedQueueEntry(e)._link(this._previous, this);
}
DoubleLinkedQueueEntry.prototype.remove = function() {
  this._previous._next = this._next;
  this._next._previous = this._previous;
  this._next = null;
  this._previous = null;
  return this._element;
}
DoubleLinkedQueueEntry.prototype._asNonSentinelEntry = function() {
  return this;
}
DoubleLinkedQueueEntry.prototype.previousEntry = function() {
  return this._previous._asNonSentinelEntry();
}
DoubleLinkedQueueEntry.prototype.get$element = function() {
  return this._element;
}
DoubleLinkedQueueEntry.prototype.remove$0 = DoubleLinkedQueueEntry.prototype.remove;
// ********** Code for DoubleLinkedQueueEntry_KeyValuePair **************
$inherits(DoubleLinkedQueueEntry_KeyValuePair, DoubleLinkedQueueEntry);
function DoubleLinkedQueueEntry_KeyValuePair(e) {
  this._element = e;
}
DoubleLinkedQueueEntry_KeyValuePair.prototype.remove$0 = DoubleLinkedQueueEntry_KeyValuePair.prototype.remove;
// ********** Code for _DoubleLinkedQueueEntrySentinel **************
$inherits(_DoubleLinkedQueueEntrySentinel, DoubleLinkedQueueEntry);
function _DoubleLinkedQueueEntrySentinel() {
  DoubleLinkedQueueEntry.call(this, null);
  this._link(this, this);
}
_DoubleLinkedQueueEntrySentinel.prototype.remove = function() {
  $throw(const$0002);
}
_DoubleLinkedQueueEntrySentinel.prototype._asNonSentinelEntry = function() {
  return null;
}
_DoubleLinkedQueueEntrySentinel.prototype.get$element = function() {
  $throw(const$0002);
}
_DoubleLinkedQueueEntrySentinel.prototype.remove$0 = _DoubleLinkedQueueEntrySentinel.prototype.remove;
// ********** Code for _DoubleLinkedQueueEntrySentinel_KeyValuePair **************
$inherits(_DoubleLinkedQueueEntrySentinel_KeyValuePair, _DoubleLinkedQueueEntrySentinel);
function _DoubleLinkedQueueEntrySentinel_KeyValuePair() {
  DoubleLinkedQueueEntry_KeyValuePair.call(this, null);
  this._link(this, this);
}
// ********** Code for DoubleLinkedQueue **************
function DoubleLinkedQueue() {
  this._sentinel = new _DoubleLinkedQueueEntrySentinel();
}
DoubleLinkedQueue.prototype.is$Collection = function(){return true};
DoubleLinkedQueue.prototype.addLast = function(value) {
  this._sentinel.prepend(value);
}
DoubleLinkedQueue.prototype.add = function(value) {
  this.addLast(value);
}
DoubleLinkedQueue.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    this.add(e);
  }
}
DoubleLinkedQueue.prototype.lastEntry = function() {
  return this._sentinel.previousEntry();
}
DoubleLinkedQueue.prototype.get$length = function() {
  var counter = (0);
  this.forEach(function _(element) {
    counter++;
  }
  );
  return counter;
}
DoubleLinkedQueue.prototype.isEmpty = function() {
  var $0;
  return ((($0 = this._sentinel._next) == null ? null == (this._sentinel) : $0 === this._sentinel));
}
DoubleLinkedQueue.prototype.clear = function() {
  this._sentinel._next = this._sentinel;
  this._sentinel._previous = this._sentinel;
}
DoubleLinkedQueue.prototype.forEach = function(f) {
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    f(entry._element);
    entry = nextEntry;
  }
}
DoubleLinkedQueue.prototype.filter = function(f) {
  var other = new DoubleLinkedQueue();
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    if (f(entry._element)) other.addLast(entry._element);
    entry = nextEntry;
  }
  return other;
}
DoubleLinkedQueue.prototype.iterator = function() {
  return new _DoubleLinkedQueueIterator(this._sentinel);
}
DoubleLinkedQueue.prototype.toString = function() {
  return Collections.collectionToString(this);
}
DoubleLinkedQueue.prototype.add$1 = DoubleLinkedQueue.prototype.add;
DoubleLinkedQueue.prototype.clear$0 = DoubleLinkedQueue.prototype.clear;
// ********** Code for DoubleLinkedQueue_KeyValuePair **************
$inherits(DoubleLinkedQueue_KeyValuePair, DoubleLinkedQueue);
function DoubleLinkedQueue_KeyValuePair() {
  this._sentinel = new _DoubleLinkedQueueEntrySentinel_KeyValuePair();
}
DoubleLinkedQueue_KeyValuePair.prototype.is$Collection = function(){return true};
DoubleLinkedQueue_KeyValuePair.prototype.clear$0 = DoubleLinkedQueue_KeyValuePair.prototype.clear;
// ********** Code for _DoubleLinkedQueueIterator **************
function _DoubleLinkedQueueIterator(_sentinel) {
  this._sentinel = _sentinel;
  this._currentEntry = this._sentinel;
}
_DoubleLinkedQueueIterator.prototype.hasNext = function() {
  var $0;
  return (($0 = this._currentEntry._next) == null ? null != (this._sentinel) : $0 !== this._sentinel);
}
_DoubleLinkedQueueIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  this._currentEntry = this._currentEntry._next;
  return this._currentEntry.get$element();
}
// ********** Code for StringBufferImpl **************
function StringBufferImpl(content) {
  this.clear();
  this.add(content);
}
StringBufferImpl.prototype.get$length = function() {
  return this._length;
}
StringBufferImpl.prototype.add = function(obj) {
  var str = obj.toString();
  if (null == str || str.isEmpty()) return this;
  this._buffer.add(str);
  this._length = this._length + str.length;
  return this;
}
StringBufferImpl.prototype.addAll = function(objects) {
  for (var $$i = objects.iterator(); $$i.hasNext(); ) {
    var obj = $$i.next();
    this.add(obj);
  }
  return this;
}
StringBufferImpl.prototype.clear = function() {
  this._buffer = new Array();
  this._length = (0);
  return this;
}
StringBufferImpl.prototype.toString = function() {
  if (this._buffer.get$length() == (0)) return "";
  if (this._buffer.get$length() == (1)) return this._buffer.$index((0));
  var result = StringBase.concatAll(this._buffer);
  this._buffer.clear();
  this._buffer.add(result);
  return result;
}
StringBufferImpl.prototype.add$1 = StringBufferImpl.prototype.add;
StringBufferImpl.prototype.clear$0 = StringBufferImpl.prototype.clear;
// ********** Code for StringBase **************
function StringBase() {}
StringBase.join = function(strings, separator) {
  if (strings.get$length() == (0)) return "";
  var s = strings.$index((0));
  for (var i = (1);
   i < strings.get$length(); i++) {
    s = $add$($add$(s, separator), strings.$index(i));
  }
  return s;
}
StringBase.concatAll = function(strings) {
  return StringBase.join(strings, "");
}
// ********** Code for StringImplementation **************
StringImplementation = String;
StringImplementation.prototype.get$length = function() { return this.length; };
StringImplementation.prototype.startsWith = function(other) {
    'use strict';
    if (other.length > this.length) return false;
    return other == this.substring(0, other.length);
}
StringImplementation.prototype.isEmpty = function() {
  return this.length == (0);
}
StringImplementation.prototype.contains = function(pattern, startIndex) {
  'use strict'; return this.indexOf(pattern, startIndex) >= 0;
}
StringImplementation.prototype.split_ = function(pattern) {
  if ((typeof(pattern) == 'string')) return this._split(pattern);
  if (!!(pattern && pattern.is$RegExp())) return this._splitRegExp(pattern);
  $throw("String.split(Pattern) unimplemented.");
}
StringImplementation.prototype._split = function(pattern) {
  'use strict'; return this.split(pattern);
}
StringImplementation.prototype._splitRegExp = function(pattern) {
  'use strict'; return this.split(pattern.re);
}
StringImplementation.prototype.hashCode = function() {
      'use strict';
      var hash = 0;
      for (var i = 0; i < this.length; i++) {
        hash = 0x1fffffff & (hash + this.charCodeAt(i));
        hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
        hash ^= hash >> 6;
      }

      hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
      hash ^= hash >> 11;
      return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
}
StringImplementation.prototype.compareTo = function(other) {
  'use strict'; return this == other ? 0 : this < other ? -1 : 1;
}
// ********** Code for DateImplementation **************
DateImplementation.now$ctor = function() {
  this.timeZone = new TimeZoneImplementation.local$ctor();
  this.value = DateImplementation._now();
  this._asJs();
}
DateImplementation.now$ctor.prototype = DateImplementation.prototype;
DateImplementation.fromEpoch$ctor = function(value, timeZone) {
  this.value = value;
  this.timeZone = timeZone;
}
DateImplementation.fromEpoch$ctor.prototype = DateImplementation.prototype;
function DateImplementation() {}
DateImplementation.DateImplementation$fromString$factory = function(formattedString) {
  var re = const$0004;
  var match = re.firstMatch(formattedString);
  if (null != match) {
    function parseIntOrZero(matched) {
      if (null == matched || matched == "") return (0);
      return Math.parseInt(matched);
    }
    var years = Math.parseInt(match.$index((1)));
    var month = Math.parseInt(match.$index((2)));
    var day = Math.parseInt(match.$index((3)));
    var hours = parseIntOrZero(match.$index((4)));
    var minutes = parseIntOrZero(match.$index((5)));
    var seconds = parseIntOrZero(match.$index((6)));
    var addOneMillisecond = false;
    var milliseconds = parseIntOrZero(match.$index((7)));
    if (milliseconds != (0)) {
      if (match.$index((7)).length == (1)) {
        milliseconds *= (100);
      }
      else if (match.$index((7)).length == (2)) {
        milliseconds *= (10);
      }
      else if (match.$index((7)).length == (3)) {
      }
      else if (match.$index((7)).length == (4)) {
        addOneMillisecond = (($mod$(milliseconds, (10))) >= (5));
        milliseconds = $truncdiv$(milliseconds, (10));
      }
      else {
        addOneMillisecond = (($mod$(milliseconds, (100))) >= (50));
        milliseconds = $truncdiv$(milliseconds, (100));
      }
      if (addOneMillisecond && milliseconds < (999)) {
        addOneMillisecond = false;
        milliseconds++;
      }
    }
    var isUtc = (null != match.$index((8))) && (match.$index((8)) != "");
    var timezone = isUtc ? const$0005 : new TimeZoneImplementation.local$ctor();
    var epochValue = DateImplementation._valueFromDecomposed(years, month, day, hours, minutes, seconds, milliseconds, isUtc);
    if (null == epochValue) {
      $throw(new IllegalArgumentException(formattedString));
    }
    if (addOneMillisecond) epochValue++;
    return new DateImplementation.fromEpoch$ctor(epochValue, timezone);
  }
  else {
    $throw(new IllegalArgumentException(formattedString));
  }
}
DateImplementation.prototype.get$value = function() { return this.value; };
DateImplementation.prototype.get$timeZone = function() { return this.timeZone; };
DateImplementation.prototype.$eq = function(other) {
  if (!((other instanceof DateImplementation))) return false;
  return (this.value == other.get$value()) && ($eq$(this.timeZone, other.get$timeZone()));
}
DateImplementation.prototype.compareTo = function(other) {
  return this.value.compareTo(other.value);
}
DateImplementation.prototype.get$year = function() {
  return this.isUtc() ? this._asJs().getUTCFullYear() :
      this._asJs().getFullYear();
}
DateImplementation.prototype.get$month = function() {
  return this.isUtc() ? this._asJs().getUTCMonth() + 1 :
        this._asJs().getMonth() + 1;
}
DateImplementation.prototype.get$day = function() {
  return this.isUtc() ? this._asJs().getUTCDate() :
        this._asJs().getDate();
}
DateImplementation.prototype.get$hours = function() {
  return this.isUtc() ? this._asJs().getUTCHours() :
        this._asJs().getHours();
}
DateImplementation.prototype.get$minutes = function() {
  return this.isUtc() ? this._asJs().getUTCMinutes() :
        this._asJs().getMinutes();
}
DateImplementation.prototype.get$seconds = function() {
  return this.isUtc() ? this._asJs().getUTCSeconds() :
        this._asJs().getSeconds();
}
DateImplementation.prototype.get$milliseconds = function() {
  return this.isUtc() ? this._asJs().getUTCMilliseconds() :
      this._asJs().getMilliseconds();
}
DateImplementation.prototype.get$weekday = function() {
      var day = this.isUtc() ? this._asJs().getUTCDay() : this._asJs().getDay();
      return (day + 6) % 7;
}
DateImplementation.prototype.isUtc = function() {
  return this.timeZone.isUtc;
}
DateImplementation.prototype.get$isUtc = function() {
  return this.isUtc.bind(this);
}
DateImplementation.prototype.toString = function() {
  function fourDigits(n) {
    var absN = n.abs();
    var sign = n < (0) ? "-" : "";
    if (absN >= (1000)) return ("" + n);
    if (absN >= (100)) return ("" + sign + "0" + absN);
    if (absN >= (10)) return ("" + sign + "00" + absN);
    if (absN >= (1)) return ("" + sign + "000" + absN);
  }
  function threeDigits(n) {
    if (n >= (100)) return ("" + n);
    if (n > (10)) return ("0" + n);
    return ("00" + n);
  }
  function twoDigits(n) {
    if (n >= (10)) return ("" + n);
    return ("0" + n);
  }
  var y = fourDigits(this.get$year());
  var m = twoDigits(this.get$month());
  var d = twoDigits(this.get$day());
  var h = twoDigits(this.get$hours());
  var min = twoDigits(this.get$minutes());
  var sec = twoDigits(this.get$seconds());
  var ms = threeDigits(this.get$milliseconds());
  if (this.timeZone.isUtc) {
    return ("" + y + "-" + m + "-" + d + " " + h + ":" + min + ":" + sec + "." + ms + "Z");
  }
  else {
    return ("" + y + "-" + m + "-" + d + " " + h + ":" + min + ":" + sec + "." + ms);
  }
}
DateImplementation.prototype.add = function(duration) {
  return new DateImplementation.fromEpoch$ctor(this.value + duration.inMilliseconds, this.timeZone);
}
DateImplementation.prototype.subtract = function(duration) {
  return new DateImplementation.fromEpoch$ctor(this.value - duration.inMilliseconds, this.timeZone);
}
DateImplementation.prototype.difference = function(other) {
  return new DurationImplementation((0), (0), (0), (0), this.value - other.value);
}
DateImplementation._valueFromDecomposed = function(years, month, day, hours, minutes, seconds, milliseconds, isUtc) {
  var jsMonth = month - 1;
    var date = new Date(0);
    if (isUtc) {
      date.setUTCFullYear(years, jsMonth, day);
      date.setUTCHours(hours, minutes, seconds, milliseconds);
    } else {
      date.setFullYear(years, jsMonth, day);
      date.setHours(hours, minutes, seconds, milliseconds);
    }
    var value = date.valueOf();
    if (isNaN(value)) return (void 0);
    return value;
}
DateImplementation._now = function() {
  return new Date().valueOf();
}
DateImplementation.prototype._asJs = function() {
    if (!this.date) {
      this.date = new Date(this.value);
    }
    return this.date;
}
DateImplementation.prototype.add$1 = DateImplementation.prototype.add;
// ********** Code for TimeZoneImplementation **************
TimeZoneImplementation.utc$ctor = function() {
  this.isUtc = true;
}
TimeZoneImplementation.utc$ctor.prototype = TimeZoneImplementation.prototype;
TimeZoneImplementation.local$ctor = function() {
  this.isUtc = false;
}
TimeZoneImplementation.local$ctor.prototype = TimeZoneImplementation.prototype;
function TimeZoneImplementation() {}
TimeZoneImplementation.prototype.$eq = function(other) {
  if (!((other instanceof TimeZoneImplementation))) return false;
  return $eq$(this.isUtc, other.get$isUtc());
}
TimeZoneImplementation.prototype.toString = function() {
  if (this.isUtc) return "TimeZone (UTC)";
  return "TimeZone (Local)";
}
TimeZoneImplementation.prototype.get$isUtc = function() { return this.isUtc; };
// ********** Code for _ArgumentMismatchException **************
$inherits(_ArgumentMismatchException, ClosureArgumentMismatchException);
function _ArgumentMismatchException(_message) {
  this._dart_coreimpl_message = _message;
  ClosureArgumentMismatchException.call(this);
}
_ArgumentMismatchException.prototype.toString = function() {
  return ("Closure argument mismatch: " + this._dart_coreimpl_message);
}
// ********** Code for _FunctionImplementation **************
_FunctionImplementation = Function;
_FunctionImplementation.prototype._genStub = function(argsLength, names) {
      // Fast path #1: if no named arguments and arg count matches.
      var thisLength = this.$length || this.length;
      if (thisLength == argsLength && !names) {
        return this;
      }

      var paramsNamed = this.$optional ? (this.$optional.length / 2) : 0;
      var paramsBare = thisLength - paramsNamed;
      var argsNamed = names ? names.length : 0;
      var argsBare = argsLength - argsNamed;

      // Check we got the right number of arguments
      if (argsBare < paramsBare || argsLength > thisLength ||
          argsNamed > paramsNamed) {
        return function() {
          $throw(new _ArgumentMismatchException(
            'Wrong number of arguments to function. Expected ' + paramsBare +
            ' positional arguments and at most ' + paramsNamed +
            ' named arguments, but got ' + argsBare +
            ' positional arguments and ' + argsNamed + ' named arguments.'));
        };
      }

      // First, fill in all of the default values
      var p = new Array(paramsBare);
      if (paramsNamed) {
        p = p.concat(this.$optional.slice(paramsNamed));
      }
      // Fill in positional args
      var a = new Array(argsLength);
      for (var i = 0; i < argsBare; i++) {
        p[i] = a[i] = '$' + i;
      }
      // Then overwrite with supplied values for optional args
      var lastParameterIndex;
      var namesInOrder = true;
      for (var i = 0; i < argsNamed; i++) {
        var name = names[i];
        a[i + argsBare] = name;
        var j = this.$optional.indexOf(name);
        if (j < 0 || j >= paramsNamed) {
          return function() {
            $throw(new _ArgumentMismatchException(
              'Named argument "' + name + '" was not expected by function.' +
              ' Did you forget to mark the function parameter [optional]?'));
          };
        } else if (lastParameterIndex && lastParameterIndex > j) {
          namesInOrder = false;
        }
        p[j + paramsBare] = name;
        lastParameterIndex = j;
      }

      if (thisLength == argsLength && namesInOrder) {
        // Fast path #2: named arguments, but they're in order and all supplied.
        return this;
      }

      // Note: using Function instead of 'eval' to get a clean scope.
      // TODO(jmesserly): evaluate the performance of these stubs.
      var f = 'function(' + a.join(',') + '){return $f(' + p.join(',') + ');}';
      return new Function('$f', 'return ' + f + '').call(null, this);
    
}
// ********** Code for top level **************
function _constList(other) {
    other.__proto__ = ImmutableList.prototype;
    return other;
}
function _map(itemsAndKeys) {
  var ret = new LinkedHashMapImplementation();
  for (var i = (0);
   i < itemsAndKeys.get$length(); ) {
    ret.$setindex(itemsAndKeys.$index(i++), itemsAndKeys.$index(i++));
  }
  return ret;
}
function _constMap(itemsAndKeys) {
  return new ImmutableMap(itemsAndKeys);
}
//  ********** Library html **************
// ********** Code for _EventTargetImpl **************
$defProp(Object.prototype, '$typeNameOf', (function() {
  function constructorNameWithFallback(obj) {
    var constructor = obj.constructor;
    if (typeof(constructor) == 'function') {
      // The constructor isn't null or undefined at this point. Try
      // to grab hold of its name.
      var name = constructor.name;
      // If the name is a non-empty string, we use that as the type
      // name of this object. On Firefox, we often get 'Object' as
      // the constructor name even for more specialized objects so
      // we have to fall through to the toString() based implementation
      // below in that case.
      if (typeof(name) == 'string' && name && name != 'Object') return name;
    }
    var string = Object.prototype.toString.call(obj);
    return string.substring(8, string.length - 1);
  }

  function chrome$typeNameOf() {
    var name = this.constructor.name;
    if (name == 'Window') return 'DOMWindow';
    return name;
  }

  function firefox$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    if (name == 'Document') return 'HTMLDocument';
    if (name == 'XMLDocument') return 'Document';
    return name;
  }

  function ie$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    // IE calls both HTML and XML documents 'Document', so we check for the
    // xmlVersion property, which is the empty string on HTML documents.
    if (name == 'Document' && this.xmlVersion) return 'Document';
    if (name == 'Document') return 'HTMLDocument';
    return name;
  }

  // If we're not in the browser, we're almost certainly running on v8.
  if (typeof(navigator) != 'object') return chrome$typeNameOf;

  var userAgent = navigator.userAgent;
  if (/Chrome|DumpRenderTree/.test(userAgent)) return chrome$typeNameOf;
  if (/Firefox/.test(userAgent)) return firefox$typeNameOf;
  if (/MSIE/.test(userAgent)) return ie$typeNameOf;
  return function() { return constructorNameWithFallback(this); };
})());
function $dynamic(name) {
  var f = Object.prototype[name];
  if (f && f.methods) return f.methods;

  var methods = {};
  if (f) methods.Object = f;
  function $dynamicBind() {
    // Find the target method
    var obj = this;
    var tag = obj.$typeNameOf();
    var method = methods[tag];
    if (!method) {
      var table = $dynamicMetadata;
      for (var i = 0; i < table.length; i++) {
        var entry = table[i];
        if (entry.map.hasOwnProperty(tag)) {
          method = methods[entry.tag];
          if (method) break;
        }
      }
    }
    method = method || methods.Object;
    var proto = Object.getPrototypeOf(obj);
    if (!proto.hasOwnProperty(name)) {
      $defProp(proto, name, method);
    }

    return method.apply(this, Array.prototype.slice.call(arguments));
  };
  $dynamicBind.methods = methods;
  $defProp(Object.prototype, name, $dynamicBind);
  return methods;
}
if (typeof $dynamicMetadata == 'undefined') $dynamicMetadata = [];
$dynamic("_addEventListener").EventTarget = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _NodeImpl **************
$dynamic("get$nodes").Node = function() {
  var list = this.get$_childNodes();
  list.set$_parent(this);
  return list;
}
$dynamic("remove").Node = function() {
  if ($ne$(this.get$parent())) {
    var parent = this.get$parent();
    parent._removeChild(this);
  }
  return this;
}
$dynamic("replaceWith").Node = function(otherNode) {
  try {
    var parent = this.get$parent();
    parent._replaceChild(otherNode, this);
  } catch (e) {
    e = _toDartException(e);
  }
  ;
  return this;
}
$dynamic("get$_attributes").Node = function() {
  return this.attributes;
}
$dynamic("get$_childNodes").Node = function() {
  return this.childNodes;
}
$dynamic("get$parent").Node = function() {
  return this.parentNode;
}
$dynamic("get$text").Node = function() {
  return this.textContent;
}
$dynamic("set$text").Node = function(value) {
  this.textContent = value;
}
$dynamic("_appendChild").Node = function(newChild) {
  return this.appendChild(newChild);
}
$dynamic("_removeChild").Node = function(oldChild) {
  return this.removeChild(oldChild);
}
$dynamic("_replaceChild").Node = function(newChild, oldChild) {
  return this.replaceChild(newChild, oldChild);
}
$dynamic("remove$0").Node = function() {
  return this.remove();
};
// ********** Code for _ElementImpl **************
$dynamic("is$html_Element").Element = function(){return true};
$dynamic("get$attributes").Element = function() {
  if (null == this._elementAttributeMap) {
    this._elementAttributeMap = new ElementAttributeMap._wrap$ctor(this);
  }
  return this._elementAttributeMap;
}
$dynamic("get$elements").Element = function() {
  return new _ChildrenElementList._wrap$ctor(this);
}
$dynamic("queryAll").Element = function(selectors) {
  return new _FrozenElementList._wrap$ctor(this._querySelectorAll(selectors));
}
$dynamic("get$classes").Element = function() {
  if (null == this._cssClassSet) {
    this._cssClassSet = new _CssClassSet(this);
  }
  return this._cssClassSet;
}
$dynamic("get$dataAttributes").Element = function() {
  if (null == this._dataAttributes) {
    this._dataAttributes = new _DataAttributeMap(this.get$attributes());
  }
  return this._dataAttributes;
}
$dynamic("set$dataAttributes").Element = function(value) {
  var dataAttributes = this.get$dataAttributes();
  dataAttributes.clear();
  var $$list = value.getKeys();
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var key = $$i.next();
    dataAttributes.$setindex(key, value.$index(key));
  }
}
$dynamic("get$on").Element = function() {
  return new _ElementEventsImpl(this);
}
$dynamic("get$_children").Element = function() {
  return this.children;
}
$dynamic("get$_className").Element = function() {
  return this.className;
}
$dynamic("set$_className").Element = function(value) {
  this.className = value;
}
$dynamic("get$_firstElementChild").Element = function() {
  return this.firstElementChild;
}
$dynamic("set$innerHTML").Element = function(value) { return this.innerHTML = value; };
$dynamic("get$style").Element = function() { return this.style; };
$dynamic("get$click").Element = function() {
  return this.click.bind(this);
}
$dynamic("_getAttribute").Element = function(name) {
  return this.getAttribute(name);
}
$dynamic("_hasAttribute").Element = function(name) {
  return this.hasAttribute(name);
}
$dynamic("query").Element = function(selectors) {
  return this.querySelector(selectors);
}
$dynamic("_querySelectorAll").Element = function(selectors) {
  return this.querySelectorAll(selectors);
}
$dynamic("_removeAttribute").Element = function(name) {
  this.removeAttribute(name);
}
$dynamic("_setAttribute").Element = function(name, value) {
  this.setAttribute(name, value);
}
// ********** Code for _HTMLElementImpl **************
// ********** Code for _AbstractWorkerImpl **************
$dynamic("_addEventListener").AbstractWorker = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _AnchorElementImpl **************
$dynamic("is$html_Element").HTMLAnchorElement = function(){return true};
$dynamic("get$name").HTMLAnchorElement = function() { return this.name; };
// ********** Code for _AnimationImpl **************
$dynamic("get$name").WebKitAnimation = function() { return this.name; };
// ********** Code for _EventImpl **************
$dynamic("get$currentTarget").Event = function() {
  return _FixHtmlDocumentReference(this.get$_currentTarget());
}
$dynamic("get$_currentTarget").Event = function() {
  return this.currentTarget;
}
// ********** Code for _AnimationEventImpl **************
// ********** Code for _AnimationListImpl **************
$dynamic("get$length").WebKitAnimationList = function() { return this.length; };
// ********** Code for _AppletElementImpl **************
$dynamic("is$html_Element").HTMLAppletElement = function(){return true};
$dynamic("set$height").HTMLAppletElement = function(value) { return this.height = value; };
$dynamic("get$name").HTMLAppletElement = function() { return this.name; };
// ********** Code for _AreaElementImpl **************
$dynamic("is$html_Element").HTMLAreaElement = function(){return true};
// ********** Code for _ArrayBufferImpl **************
// ********** Code for _ArrayBufferViewImpl **************
// ********** Code for _AttrImpl **************
$dynamic("get$name").Attr = function() { return this.name; };
$dynamic("get$value").Attr = function() { return this.value; };
$dynamic("set$value").Attr = function(value) { return this.value = value; };
// ********** Code for _AudioBufferImpl **************
$dynamic("get$length").AudioBuffer = function() { return this.length; };
// ********** Code for _AudioNodeImpl **************
// ********** Code for _AudioSourceNodeImpl **************
// ********** Code for _AudioBufferSourceNodeImpl **************
// ********** Code for _AudioChannelMergerImpl **************
// ********** Code for _AudioChannelSplitterImpl **************
// ********** Code for _AudioContextImpl **************
// ********** Code for _AudioDestinationNodeImpl **************
// ********** Code for _MediaElementImpl **************
$dynamic("is$html_Element").HTMLMediaElement = function(){return true};
// ********** Code for _AudioElementImpl **************
$dynamic("is$html_Element").HTMLAudioElement = function(){return true};
// ********** Code for _AudioParamImpl **************
$dynamic("get$name").AudioParam = function() { return this.name; };
$dynamic("get$value").AudioParam = function() { return this.value; };
$dynamic("set$value").AudioParam = function(value) { return this.value = value; };
// ********** Code for _AudioGainImpl **************
// ********** Code for _AudioGainNodeImpl **************
// ********** Code for _AudioListenerImpl **************
// ********** Code for _AudioPannerNodeImpl **************
// ********** Code for _AudioProcessingEventImpl **************
// ********** Code for _BRElementImpl **************
$dynamic("is$html_Element").HTMLBRElement = function(){return true};
// ********** Code for _BarInfoImpl **************
// ********** Code for _BaseElementImpl **************
$dynamic("is$html_Element").HTMLBaseElement = function(){return true};
// ********** Code for _BaseFontElementImpl **************
$dynamic("is$html_Element").HTMLBaseFontElement = function(){return true};
// ********** Code for _BeforeLoadEventImpl **************
// ********** Code for _BiquadFilterNodeImpl **************
// ********** Code for _BlobImpl **************
// ********** Code for _BlobBuilderImpl **************
// ********** Code for _BodyElementImpl **************
$dynamic("is$html_Element").HTMLBodyElement = function(){return true};
$dynamic("get$on").HTMLBodyElement = function() {
  return new _BodyElementEventsImpl(this);
}
// ********** Code for _EventsImpl **************
function _EventsImpl(_ptr) {
  this._ptr = _ptr;
}
_EventsImpl.prototype.get$_ptr = function() { return this._ptr; };
_EventsImpl.prototype.$index = function(type) {
  return this._get(type.toLowerCase());
}
_EventsImpl.prototype._get = function(type) {
  return new _EventListenerListImpl(this._ptr, type);
}
// ********** Code for _ElementEventsImpl **************
$inherits(_ElementEventsImpl, _EventsImpl);
function _ElementEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_ElementEventsImpl.prototype.get$blur = function() {
  return this._get("blur");
}
_ElementEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
_ElementEventsImpl.prototype.get$keyPress = function() {
  return this._get("keypress");
}
_ElementEventsImpl.prototype.get$mouseDown = function() {
  return this._get("mousedown");
}
_ElementEventsImpl.prototype.get$mouseOut = function() {
  return this._get("mouseout");
}
_ElementEventsImpl.prototype.get$mouseOver = function() {
  return this._get("mouseover");
}
_ElementEventsImpl.prototype.get$mouseUp = function() {
  return this._get("mouseup");
}
// ********** Code for _BodyElementEventsImpl **************
$inherits(_BodyElementEventsImpl, _ElementEventsImpl);
function _BodyElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
_BodyElementEventsImpl.prototype.get$blur = function() {
  return this._get("blur");
}
// ********** Code for _ButtonElementImpl **************
$dynamic("is$html_Element").HTMLButtonElement = function(){return true};
$dynamic("get$name").HTMLButtonElement = function() { return this.name; };
$dynamic("get$value").HTMLButtonElement = function() { return this.value; };
$dynamic("set$value").HTMLButtonElement = function(value) { return this.value = value; };
// ********** Code for _CharacterDataImpl **************
$dynamic("get$length").CharacterData = function() { return this.length; };
// ********** Code for _TextImpl **************
// ********** Code for _CDATASectionImpl **************
// ********** Code for _CSSRuleImpl **************
// ********** Code for _CSSCharsetRuleImpl **************
// ********** Code for _CSSFontFaceRuleImpl **************
// ********** Code for _CSSImportRuleImpl **************
// ********** Code for _CSSKeyframeRuleImpl **************
// ********** Code for _CSSKeyframesRuleImpl **************
$dynamic("get$name").WebKitCSSKeyframesRule = function() { return this.name; };
// ********** Code for _CSSMatrixImpl **************
// ********** Code for _CSSMediaRuleImpl **************
// ********** Code for _CSSPageRuleImpl **************
// ********** Code for _CSSValueImpl **************
// ********** Code for _CSSPrimitiveValueImpl **************
// ********** Code for _CSSRuleListImpl **************
$dynamic("get$length").CSSRuleList = function() { return this.length; };
// ********** Code for _CSSStyleDeclarationImpl **************
$dynamic("get$length").CSSStyleDeclaration = function() { return this.length; };
$dynamic("set$display").CSSStyleDeclaration = function(value) {
  this.setProperty("display", value, "");
}
$dynamic("set$height").CSSStyleDeclaration = function(value) {
  this.setProperty("height", value, "");
}
// ********** Code for _CSSStyleRuleImpl **************
// ********** Code for _StyleSheetImpl **************
// ********** Code for _CSSStyleSheetImpl **************
// ********** Code for _CSSValueListImpl **************
$dynamic("get$length").CSSValueList = function() { return this.length; };
// ********** Code for _CSSTransformValueImpl **************
// ********** Code for _CSSUnknownRuleImpl **************
// ********** Code for _CanvasElementImpl **************
$dynamic("is$html_Element").HTMLCanvasElement = function(){return true};
$dynamic("set$height").HTMLCanvasElement = function(value) { return this.height = value; };
// ********** Code for _CanvasGradientImpl **************
// ********** Code for _CanvasPatternImpl **************
// ********** Code for _CanvasPixelArrayImpl **************
$dynamic("is$List").CanvasPixelArray = function(){return true};
$dynamic("is$Collection").CanvasPixelArray = function(){return true};
$dynamic("get$length").CanvasPixelArray = function() { return this.length; };
$dynamic("$index").CanvasPixelArray = function(index) {
  return this[index];
}
$dynamic("$setindex").CanvasPixelArray = function(index, value) {
  this[index] = value
}
$dynamic("iterator").CanvasPixelArray = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").CanvasPixelArray = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").CanvasPixelArray = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").CanvasPixelArray = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").CanvasPixelArray = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").CanvasPixelArray = function() {
  return this.length == (0);
}
$dynamic("sort").CanvasPixelArray = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").CanvasPixelArray = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").CanvasPixelArray = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").CanvasPixelArray = function($0) {
  return this.add($0);
};
// ********** Code for _CanvasRenderingContextImpl **************
// ********** Code for _CanvasRenderingContext2DImpl **************
// ********** Code for _ClientRectImpl **************
// ********** Code for _ClientRectListImpl **************
$dynamic("get$length").ClientRectList = function() { return this.length; };
// ********** Code for _ClipboardImpl **************
// ********** Code for _CloseEventImpl **************
// ********** Code for _CommentImpl **************
// ********** Code for _UIEventImpl **************
$dynamic("get$charCode").UIEvent = function() { return this.charCode; };
// ********** Code for _CompositionEventImpl **************
// ********** Code for _ConsoleImpl **************
_ConsoleImpl = (typeof console == 'undefined' ? {} : console);
_ConsoleImpl.get$count = function() {
  return this.count.bind(this);
}
// ********** Code for _ContentElementImpl **************
$dynamic("is$html_Element").HTMLContentElement = function(){return true};
// ********** Code for _ConvolverNodeImpl **************
// ********** Code for _CoordinatesImpl **************
// ********** Code for _CounterImpl **************
// ********** Code for _CryptoImpl **************
// ********** Code for _CustomEventImpl **************
// ********** Code for _DListElementImpl **************
$dynamic("is$html_Element").HTMLDListElement = function(){return true};
// ********** Code for _DOMApplicationCacheImpl **************
$dynamic("_addEventListener").DOMApplicationCache = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _DOMExceptionImpl **************
$dynamic("get$name").DOMException = function() { return this.name; };
// ********** Code for _DOMFileSystemImpl **************
$dynamic("get$name").DOMFileSystem = function() { return this.name; };
// ********** Code for _DOMFileSystemSyncImpl **************
$dynamic("get$name").DOMFileSystemSync = function() { return this.name; };
// ********** Code for _DOMFormDataImpl **************
// ********** Code for _DOMImplementationImpl **************
// ********** Code for _DOMMimeTypeImpl **************
// ********** Code for _DOMMimeTypeArrayImpl **************
$dynamic("get$length").DOMMimeTypeArray = function() { return this.length; };
// ********** Code for _DOMParserImpl **************
// ********** Code for _DOMPluginImpl **************
$dynamic("get$length").DOMPlugin = function() { return this.length; };
$dynamic("get$name").DOMPlugin = function() { return this.name; };
// ********** Code for _DOMPluginArrayImpl **************
$dynamic("get$length").DOMPluginArray = function() { return this.length; };
// ********** Code for _DOMSelectionImpl **************
// ********** Code for _DOMTokenListImpl **************
$dynamic("get$length").DOMTokenList = function() { return this.length; };
$dynamic("add$1").DOMTokenList = function($0) {
  return this.add($0);
};
// ********** Code for _DOMSettableTokenListImpl **************
$dynamic("get$value").DOMSettableTokenList = function() { return this.value; };
$dynamic("set$value").DOMSettableTokenList = function(value) { return this.value = value; };
// ********** Code for _DOMURLImpl **************
// ********** Code for _DataTransferItemImpl **************
// ********** Code for _DataTransferItemListImpl **************
$dynamic("get$length").DataTransferItemList = function() { return this.length; };
$dynamic("add$1").DataTransferItemList = function($0) {
  return this.add($0);
};
$dynamic("clear$0").DataTransferItemList = function() {
  return this.clear();
};
// ********** Code for _DataViewImpl **************
// ********** Code for _DatabaseImpl **************
// ********** Code for _DatabaseSyncImpl **************
// ********** Code for _WorkerContextImpl **************
// ********** Code for _DedicatedWorkerContextImpl **************
// ********** Code for _DelayNodeImpl **************
// ********** Code for _DeprecatedPeerConnectionImpl **************
// ********** Code for _DetailsElementImpl **************
$dynamic("is$html_Element").HTMLDetailsElement = function(){return true};
// ********** Code for _DeviceMotionEventImpl **************
// ********** Code for _DeviceOrientationEventImpl **************
// ********** Code for _DirectoryElementImpl **************
$dynamic("is$html_Element").HTMLDirectoryElement = function(){return true};
// ********** Code for _EntryImpl **************
$dynamic("get$name").Entry = function() { return this.name; };
// ********** Code for _DirectoryEntryImpl **************
// ********** Code for _EntrySyncImpl **************
$dynamic("get$name").EntrySync = function() { return this.name; };
$dynamic("remove$0").EntrySync = function() {
  return this.remove();
};
// ********** Code for _DirectoryEntrySyncImpl **************
// ********** Code for _DirectoryReaderImpl **************
// ********** Code for _DirectoryReaderSyncImpl **************
// ********** Code for _DivElementImpl **************
$dynamic("is$html_Element").HTMLDivElement = function(){return true};
// ********** Code for _DocumentImpl **************
$dynamic("is$html_Element").HTMLHtmlElement = function(){return true};
$dynamic("get$on").HTMLHtmlElement = function() {
  return new _DocumentEventsImpl(this.get$_jsDocument());
}
$dynamic("set$title").HTMLHtmlElement = function(value) {
  this.parentNode.title = value;
}
$dynamic("_createElement").HTMLHtmlElement = function(tagName) {
  return this.parentNode.createElement(tagName);
}
$dynamic("get$_jsDocument").HTMLHtmlElement = function() {
  return this.parentNode;
}
$dynamic("get$parent").HTMLHtmlElement = function() {
  return null;
}
// ********** Code for _SecretHtmlDocumentImpl **************
$dynamic("is$_SecretHtmlDocumentImpl").HTMLDocument = function(){return true};
$dynamic("get$_documentElement").HTMLDocument = function() {
  return this.documentElement;
}
// ********** Code for _DocumentEventsImpl **************
$inherits(_DocumentEventsImpl, _ElementEventsImpl);
function _DocumentEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
_DocumentEventsImpl.prototype.get$blur = function() {
  return this._get("blur");
}
_DocumentEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
_DocumentEventsImpl.prototype.get$keyPress = function() {
  return this._get("keypress");
}
_DocumentEventsImpl.prototype.get$mouseDown = function() {
  return this._get("mousedown");
}
_DocumentEventsImpl.prototype.get$mouseOut = function() {
  return this._get("mouseout");
}
_DocumentEventsImpl.prototype.get$mouseOver = function() {
  return this._get("mouseover");
}
_DocumentEventsImpl.prototype.get$mouseUp = function() {
  return this._get("mouseup");
}
// ********** Code for FilteredElementList **************
function FilteredElementList(node) {
  this._childNodes = node.get$nodes();
  this._node = node;
}
FilteredElementList.prototype.is$List = function(){return true};
FilteredElementList.prototype.is$Collection = function(){return true};
FilteredElementList.prototype.get$_filtered = function() {
  return ListFactory.ListFactory$from$factory(this._childNodes.filter((function (n) {
    return !!(n && n.is$html_Element());
  })
  ));
}
FilteredElementList.prototype.get$first = function() {
  var $$list = this._childNodes;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    if (!!(node && node.is$html_Element())) {
      return node;
    }
  }
  return null;
}
FilteredElementList.prototype.forEach = function(f) {
  this.get$_filtered().forEach(f);
}
FilteredElementList.prototype.$setindex = function(index, value) {
  this.$index(index).replaceWith(value);
}
FilteredElementList.prototype.add = function(value) {
  this._childNodes.add(value);
}
FilteredElementList.prototype.get$add = function() {
  return this.add.bind(this);
}
FilteredElementList.prototype.addAll = function(collection) {
  collection.forEach(this.get$add());
}
FilteredElementList.prototype.sort = function(compare) {
  $throw(const$0012);
}
FilteredElementList.prototype.clear = function() {
  this._childNodes.clear();
}
FilteredElementList.prototype.removeLast = function() {
  var last = this.last();
  if ($ne$(last)) {
    last.remove$0();
  }
  return last;
}
FilteredElementList.prototype.filter = function(f) {
  return this.get$_filtered().filter(f);
}
FilteredElementList.prototype.isEmpty = function() {
  return this.get$_filtered().isEmpty();
}
FilteredElementList.prototype.get$length = function() {
  return this.get$_filtered().get$length();
}
FilteredElementList.prototype.$index = function(index) {
  return this.get$_filtered().$index(index);
}
FilteredElementList.prototype.iterator = function() {
  return this.get$_filtered().iterator();
}
FilteredElementList.prototype.getRange = function(start, length) {
  return this.get$_filtered().getRange(start, length);
}
FilteredElementList.prototype.last = function() {
  return this.get$_filtered().last();
}
FilteredElementList.prototype.add$1 = FilteredElementList.prototype.add;
FilteredElementList.prototype.clear$0 = FilteredElementList.prototype.clear;
// ********** Code for _DocumentFragmentImpl **************
$dynamic("is$html_Element").DocumentFragment = function(){return true};
$dynamic("get$elements").DocumentFragment = function() {
  if (this._elements == null) {
    this._elements = new FilteredElementList(this);
  }
  return this._elements;
}
$dynamic("queryAll").DocumentFragment = function(selectors) {
  return new _FrozenElementList._wrap$ctor(this._querySelectorAll(selectors));
}
$dynamic("set$innerHTML").DocumentFragment = function(value) {
  this.get$nodes().clear();
  var e = _ElementFactoryProvider.Element$tag$factory("div");
  e.set$innerHTML(value);
  var nodes = ListFactory.ListFactory$from$factory(e.get$nodes());
  this.get$nodes().addAll(nodes);
}
$dynamic("get$parent").DocumentFragment = function() {
  return null;
}
$dynamic("get$classes").DocumentFragment = function() {
  return new HashSetImplementation_dart_core_String();
}
$dynamic("get$dataAttributes").DocumentFragment = function() {
  return const$0011;
}
$dynamic("set$dataAttributes").DocumentFragment = function(value) {
  $throw(new UnsupportedOperationException("Data attributes can't be set for document fragments."));
}
$dynamic("get$style").DocumentFragment = function() {
  return _ElementFactoryProvider.Element$tag$factory("div").get$style();
}
$dynamic("focus").DocumentFragment = function() {

}
$dynamic("click").DocumentFragment = function() {

}
$dynamic("get$click").DocumentFragment = function() {
  return this.click.bind(this);
}
$dynamic("get$on").DocumentFragment = function() {
  return new _ElementEventsImpl(this);
}
$dynamic("query").DocumentFragment = function(selectors) {
  return this.querySelector(selectors);
}
$dynamic("_querySelectorAll").DocumentFragment = function(selectors) {
  return this.querySelectorAll(selectors);
}
// ********** Code for _DocumentTypeImpl **************
$dynamic("get$name").DocumentType = function() { return this.name; };
// ********** Code for _DynamicsCompressorNodeImpl **************
// ********** Code for _EXTTextureFilterAnisotropicImpl **************
// ********** Code for _ChildrenElementList **************
_ChildrenElementList._wrap$ctor = function(element) {
  this._childElements = element.get$_children();
  this._html_element = element;
}
_ChildrenElementList._wrap$ctor.prototype = _ChildrenElementList.prototype;
function _ChildrenElementList() {}
_ChildrenElementList.prototype.is$List = function(){return true};
_ChildrenElementList.prototype.is$Collection = function(){return true};
_ChildrenElementList.prototype._toList = function() {
  var output = new Array(this._childElements.get$length());
  for (var i = (0), len = this._childElements.get$length();
   i < len; i++) {
    output.$setindex(i, this._childElements.$index(i));
  }
  return output;
}
_ChildrenElementList.prototype.get$first = function() {
  return this._html_element.get$_firstElementChild();
}
_ChildrenElementList.prototype.forEach = function(f) {
  var $$list = this._childElements;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    f(element);
  }
}
_ChildrenElementList.prototype.filter = function(f) {
  var output = [];
  this.forEach((function (element) {
    if (f(element)) {
      output.add$1(element);
    }
  })
  );
  return new _FrozenElementList._wrap$ctor(output);
}
_ChildrenElementList.prototype.isEmpty = function() {
  return this._html_element.get$_firstElementChild() == null;
}
_ChildrenElementList.prototype.get$length = function() {
  return this._childElements.get$length();
}
_ChildrenElementList.prototype.$index = function(index) {
  return this._childElements.$index(index);
}
_ChildrenElementList.prototype.$setindex = function(index, value) {
  this._html_element._replaceChild(value, this._childElements.$index(index));
}
_ChildrenElementList.prototype.add = function(value) {
  this._html_element._appendChild(value);
  return value;
}
_ChildrenElementList.prototype.iterator = function() {
  return this._toList().iterator();
}
_ChildrenElementList.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    this._html_element._appendChild(element);
  }
}
_ChildrenElementList.prototype.sort = function(compare) {
  $throw(const$0012);
}
_ChildrenElementList.prototype.getRange = function(start, length) {
  return new _FrozenElementList._wrap$ctor(_Lists.getRange(this, start, length, []));
}
_ChildrenElementList.prototype.clear = function() {
  this._html_element.set$text("");
}
_ChildrenElementList.prototype.removeLast = function() {
  var last = this.last();
  if ($ne$(last)) {
    this._html_element._removeChild(last);
  }
  return last;
}
_ChildrenElementList.prototype.last = function() {
  return this._html_element.lastElementChild;
}
_ChildrenElementList.prototype.add$1 = _ChildrenElementList.prototype.add;
_ChildrenElementList.prototype.clear$0 = _ChildrenElementList.prototype.clear;
// ********** Code for _FrozenElementList **************
_FrozenElementList._wrap$ctor = function(_nodeList) {
  this._nodeList = _nodeList;
}
_FrozenElementList._wrap$ctor.prototype = _FrozenElementList.prototype;
function _FrozenElementList() {}
_FrozenElementList.prototype.is$List = function(){return true};
_FrozenElementList.prototype.is$Collection = function(){return true};
_FrozenElementList.prototype.get$first = function() {
  return this._nodeList.$index((0));
}
_FrozenElementList.prototype.forEach = function(f) {
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var el = $$i.next();
    f(el);
  }
}
_FrozenElementList.prototype.filter = function(f) {
  var out = new _ElementList([]);
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var el = $$i.next();
    if (f(el)) out.add$1(el);
  }
  return out;
}
_FrozenElementList.prototype.isEmpty = function() {
  return this._nodeList.isEmpty();
}
_FrozenElementList.prototype.get$length = function() {
  return this._nodeList.get$length();
}
_FrozenElementList.prototype.$index = function(index) {
  return this._nodeList.$index(index);
}
_FrozenElementList.prototype.$setindex = function(index, value) {
  $throw(const$0003);
}
_FrozenElementList.prototype.add = function(value) {
  $throw(const$0003);
}
_FrozenElementList.prototype.iterator = function() {
  return new _FrozenElementListIterator(this);
}
_FrozenElementList.prototype.addAll = function(collection) {
  $throw(const$0003);
}
_FrozenElementList.prototype.sort = function(compare) {
  $throw(const$0003);
}
_FrozenElementList.prototype.getRange = function(start, length) {
  return new _FrozenElementList._wrap$ctor(this._nodeList.getRange(start, length));
}
_FrozenElementList.prototype.clear = function() {
  $throw(const$0003);
}
_FrozenElementList.prototype.removeLast = function() {
  $throw(const$0003);
}
_FrozenElementList.prototype.last = function() {
  return this._nodeList.last();
}
_FrozenElementList.prototype.add$1 = _FrozenElementList.prototype.add;
_FrozenElementList.prototype.clear$0 = _FrozenElementList.prototype.clear;
// ********** Code for _FrozenElementListIterator **************
function _FrozenElementListIterator(_list) {
  this._html_index = (0);
  this._html_list = _list;
}
_FrozenElementListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._html_list.$index(this._html_index++);
}
_FrozenElementListIterator.prototype.hasNext = function() {
  return this._html_index < this._html_list.get$length();
}
// ********** Code for _ListWrapper **************
function _ListWrapper() {}
_ListWrapper.prototype.is$List = function(){return true};
_ListWrapper.prototype.is$Collection = function(){return true};
_ListWrapper.prototype.iterator = function() {
  return this._html_list.iterator();
}
_ListWrapper.prototype.forEach = function(f) {
  return this._html_list.forEach(f);
}
_ListWrapper.prototype.filter = function(f) {
  return this._html_list.filter(f);
}
_ListWrapper.prototype.isEmpty = function() {
  return this._html_list.isEmpty();
}
_ListWrapper.prototype.get$length = function() {
  return this._html_list.get$length();
}
_ListWrapper.prototype.$index = function(index) {
  return this._html_list.$index(index);
}
_ListWrapper.prototype.$setindex = function(index, value) {
  this._html_list.$setindex(index, value);
}
_ListWrapper.prototype.add = function(value) {
  return this._html_list.add(value);
}
_ListWrapper.prototype.addAll = function(collection) {
  return this._html_list.addAll(collection);
}
_ListWrapper.prototype.sort = function(compare) {
  return this._html_list.sort(compare);
}
_ListWrapper.prototype.clear = function() {
  return this._html_list.clear();
}
_ListWrapper.prototype.removeLast = function() {
  return this._html_list.removeLast();
}
_ListWrapper.prototype.last = function() {
  return this._html_list.last();
}
_ListWrapper.prototype.getRange = function(start, length) {
  return this._html_list.getRange(start, length);
}
_ListWrapper.prototype.get$first = function() {
  return this._html_list.$index((0));
}
_ListWrapper.prototype.add$1 = _ListWrapper.prototype.add;
_ListWrapper.prototype.clear$0 = _ListWrapper.prototype.clear;
// ********** Code for _ListWrapper_Element **************
$inherits(_ListWrapper_Element, _ListWrapper);
function _ListWrapper_Element(_list) {
  this._html_list = _list;
}
_ListWrapper_Element.prototype.is$List = function(){return true};
_ListWrapper_Element.prototype.is$Collection = function(){return true};
_ListWrapper_Element.prototype.add$1 = _ListWrapper_Element.prototype.add;
_ListWrapper_Element.prototype.clear$0 = _ListWrapper_Element.prototype.clear;
// ********** Code for _ElementList **************
$inherits(_ElementList, _ListWrapper_Element);
function _ElementList(list) {
  _ListWrapper_Element.call(this, list);
}
_ElementList.prototype.is$List = function(){return true};
_ElementList.prototype.is$Collection = function(){return true};
_ElementList.prototype.filter = function(f) {
  return new _ElementList(_ListWrapper_Element.prototype.filter.call(this, f));
}
_ElementList.prototype.getRange = function(start, length) {
  return new _ElementList(_ListWrapper_Element.prototype.getRange.call(this, start, length));
}
// ********** Code for ElementAttributeMap **************
ElementAttributeMap._wrap$ctor = function(_element) {
  this._html_element = _element;
}
ElementAttributeMap._wrap$ctor.prototype = ElementAttributeMap.prototype;
function ElementAttributeMap() {}
ElementAttributeMap.prototype.is$Map = function(){return true};
ElementAttributeMap.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
ElementAttributeMap.prototype.containsKey = function(key) {
  return this._html_element._hasAttribute(key);
}
ElementAttributeMap.prototype.$index = function(key) {
  return this._html_element._getAttribute(key);
}
ElementAttributeMap.prototype.$setindex = function(key, value) {
  this._html_element._setAttribute(key, value);
}
ElementAttributeMap.prototype.remove = function(key) {
  this._html_element._removeAttribute(key);
}
ElementAttributeMap.prototype.clear = function() {
  var attributes = this._html_element.get$_attributes();
  for (var i = attributes.get$length() - (1);
   i >= (0); i--) {
    this.remove(attributes.$index(i).get$name());
  }
}
ElementAttributeMap.prototype.forEach = function(f) {
  var attributes = this._html_element.get$_attributes();
  for (var i = (0), len = attributes.get$length();
   i < len; i++) {
    var item = attributes.$index(i);
    f(item.get$name(), item.get$value());
  }
}
ElementAttributeMap.prototype.getKeys = function() {
  var attributes = this._html_element.get$_attributes();
  var keys = new Array(attributes.get$length());
  for (var i = (0), len = attributes.get$length();
   i < len; i++) {
    keys.$setindex(i, attributes.$index(i).get$name());
  }
  return keys;
}
ElementAttributeMap.prototype.get$length = function() {
  return this._html_element.get$_attributes().length;
}
ElementAttributeMap.prototype.clear$0 = ElementAttributeMap.prototype.clear;
// ********** Code for _ElementTimeControlImpl **************
// ********** Code for _ElementTraversalImpl **************
// ********** Code for _EmbedElementImpl **************
$dynamic("is$html_Element").HTMLEmbedElement = function(){return true};
$dynamic("set$height").HTMLEmbedElement = function(value) { return this.height = value; };
$dynamic("get$name").HTMLEmbedElement = function() { return this.name; };
// ********** Code for _EntityImpl **************
// ********** Code for _EntityReferenceImpl **************
// ********** Code for _EntryArrayImpl **************
$dynamic("get$length").EntryArray = function() { return this.length; };
// ********** Code for _EntryArraySyncImpl **************
$dynamic("get$length").EntryArraySync = function() { return this.length; };
// ********** Code for _ErrorEventImpl **************
// ********** Code for _EventExceptionImpl **************
$dynamic("get$name").EventException = function() { return this.name; };
// ********** Code for _EventSourceImpl **************
$dynamic("_addEventListener").EventSource = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _EventListenerListImpl **************
function _EventListenerListImpl(_ptr, _type) {
  this._ptr = _ptr;
  this._type = _type;
}
_EventListenerListImpl.prototype.get$_ptr = function() { return this._ptr; };
_EventListenerListImpl.prototype.add = function(listener, useCapture) {
  this._add(listener, useCapture);
  return this;
}
_EventListenerListImpl.prototype._add = function(listener, useCapture) {
  this._ptr._addEventListener(this._type, listener, useCapture);
}
_EventListenerListImpl.prototype.add$1 = function($0) {
  return this.add(to$call$1($0), false);
};
// ********** Code for _FieldSetElementImpl **************
$dynamic("is$html_Element").HTMLFieldSetElement = function(){return true};
$dynamic("get$name").HTMLFieldSetElement = function() { return this.name; };
// ********** Code for _FileImpl **************
$dynamic("get$name").File = function() { return this.name; };
// ********** Code for _FileEntryImpl **************
// ********** Code for _FileEntrySyncImpl **************
// ********** Code for _FileErrorImpl **************
// ********** Code for _FileExceptionImpl **************
$dynamic("get$name").FileException = function() { return this.name; };
// ********** Code for _FileListImpl **************
$dynamic("get$length").FileList = function() { return this.length; };
// ********** Code for _FileReaderImpl **************
// ********** Code for _FileReaderSyncImpl **************
// ********** Code for _FileWriterImpl **************
$dynamic("get$length").FileWriter = function() { return this.length; };
// ********** Code for _FileWriterSyncImpl **************
$dynamic("get$length").FileWriterSync = function() { return this.length; };
// ********** Code for _Float32ArrayImpl **************
var _Float32ArrayImpl = {};
$dynamic("is$List").Float32Array = function(){return true};
$dynamic("is$Collection").Float32Array = function(){return true};
$dynamic("get$length").Float32Array = function() { return this.length; };
$dynamic("$index").Float32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float32Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Float32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Float32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Float32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").Float32Array = function() {
  return this.length == (0);
}
$dynamic("sort").Float32Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Float32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").Float32Array = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").Float32Array = function($0) {
  return this.add($0);
};
// ********** Code for _Float64ArrayImpl **************
var _Float64ArrayImpl = {};
$dynamic("is$List").Float64Array = function(){return true};
$dynamic("is$Collection").Float64Array = function(){return true};
$dynamic("get$length").Float64Array = function() { return this.length; };
$dynamic("$index").Float64Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float64Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float64Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float64Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Float64Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Float64Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Float64Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").Float64Array = function() {
  return this.length == (0);
}
$dynamic("sort").Float64Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Float64Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").Float64Array = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").Float64Array = function($0) {
  return this.add($0);
};
// ********** Code for _FontElementImpl **************
$dynamic("is$html_Element").HTMLFontElement = function(){return true};
// ********** Code for _FormElementImpl **************
$dynamic("is$html_Element").HTMLFormElement = function(){return true};
$dynamic("get$length").HTMLFormElement = function() { return this.length; };
$dynamic("get$name").HTMLFormElement = function() { return this.name; };
// ********** Code for _FrameElementImpl **************
$dynamic("is$html_Element").HTMLFrameElement = function(){return true};
$dynamic("get$name").HTMLFrameElement = function() { return this.name; };
// ********** Code for _FrameSetElementImpl **************
$dynamic("is$html_Element").HTMLFrameSetElement = function(){return true};
$dynamic("get$on").HTMLFrameSetElement = function() {
  return new _FrameSetElementEventsImpl(this);
}
// ********** Code for _FrameSetElementEventsImpl **************
$inherits(_FrameSetElementEventsImpl, _ElementEventsImpl);
function _FrameSetElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
_FrameSetElementEventsImpl.prototype.get$blur = function() {
  return this._get("blur");
}
// ********** Code for _GeolocationImpl **************
// ********** Code for _GeopositionImpl **************
// ********** Code for _HRElementImpl **************
$dynamic("is$html_Element").HTMLHRElement = function(){return true};
// ********** Code for _HTMLAllCollectionImpl **************
$dynamic("get$length").HTMLAllCollection = function() { return this.length; };
// ********** Code for _HTMLCollectionImpl **************
$dynamic("is$List").HTMLCollection = function(){return true};
$dynamic("is$Collection").HTMLCollection = function(){return true};
$dynamic("get$length").HTMLCollection = function() { return this.length; };
$dynamic("$index").HTMLCollection = function(index) {
  return this[index];
}
$dynamic("$setindex").HTMLCollection = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").HTMLCollection = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").HTMLCollection = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").HTMLCollection = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").HTMLCollection = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").HTMLCollection = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").HTMLCollection = function() {
  return this.get$length() == (0);
}
$dynamic("sort").HTMLCollection = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").HTMLCollection = function() {
  return this.$index(this.get$length() - (1));
}
$dynamic("getRange").HTMLCollection = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").HTMLCollection = function($0) {
  return this.add($0);
};
// ********** Code for _HTMLOptionsCollectionImpl **************
$dynamic("is$List").HTMLOptionsCollection = function(){return true};
$dynamic("is$Collection").HTMLOptionsCollection = function(){return true};
$dynamic("get$length").HTMLOptionsCollection = function() {
  return this.length;
}
// ********** Code for _HashChangeEventImpl **************
// ********** Code for _HeadElementImpl **************
$dynamic("is$html_Element").HTMLHeadElement = function(){return true};
// ********** Code for _HeadingElementImpl **************
$dynamic("is$html_Element").HTMLHeadingElement = function(){return true};
// ********** Code for _HighPass2FilterNodeImpl **************
// ********** Code for _HistoryImpl **************
$dynamic("get$length").History = function() { return this.length; };
// ********** Code for _HtmlElementImpl **************
$dynamic("is$html_Element").IntentionallyInvalid = function(){return true};
// ********** Code for _IDBAnyImpl **************
// ********** Code for _IDBCursorImpl **************
// ********** Code for _IDBCursorWithValueImpl **************
$dynamic("get$value").IDBCursorWithValue = function() { return this.value; };
// ********** Code for _IDBDatabaseImpl **************
$dynamic("get$name").IDBDatabase = function() { return this.name; };
// ********** Code for _IDBDatabaseErrorImpl **************
// ********** Code for _IDBDatabaseExceptionImpl **************
$dynamic("get$name").IDBDatabaseException = function() { return this.name; };
// ********** Code for _IDBFactoryImpl **************
// ********** Code for _IDBIndexImpl **************
$dynamic("get$name").IDBIndex = function() { return this.name; };
$dynamic("get$count").IDBIndex = function() {
  return this.count.bind(this);
}
// ********** Code for _IDBKeyImpl **************
// ********** Code for _IDBKeyRangeImpl **************
// ********** Code for _IDBObjectStoreImpl **************
$dynamic("get$name").IDBObjectStore = function() { return this.name; };
$dynamic("get$count").IDBObjectStore = function() {
  return this.count.bind(this);
}
$dynamic("add$1").IDBObjectStore = function($0) {
  return this.add($0);
};
$dynamic("clear$0").IDBObjectStore = function() {
  return this.clear();
};
// ********** Code for _IDBRequestImpl **************
// ********** Code for _IDBTransactionImpl **************
// ********** Code for _IDBVersionChangeEventImpl **************
// ********** Code for _IDBVersionChangeRequestImpl **************
// ********** Code for _IFrameElementImpl **************
$dynamic("is$html_Element").HTMLIFrameElement = function(){return true};
$dynamic("set$height").HTMLIFrameElement = function(value) { return this.height = value; };
$dynamic("get$name").HTMLIFrameElement = function() { return this.name; };
// ********** Code for _ImageDataImpl **************
// ********** Code for _ImageElementImpl **************
$dynamic("is$html_Element").HTMLImageElement = function(){return true};
$dynamic("set$height").HTMLImageElement = function(value) { return this.height = value; };
$dynamic("get$name").HTMLImageElement = function() { return this.name; };
// ********** Code for _InputElementImpl **************
$dynamic("is$html_Element").HTMLInputElement = function(){return true};
$dynamic("get$on").HTMLInputElement = function() {
  return new _InputElementEventsImpl(this);
}
$dynamic("get$name").HTMLInputElement = function() { return this.name; };
$dynamic("get$value").HTMLInputElement = function() { return this.value; };
$dynamic("set$value").HTMLInputElement = function(value) { return this.value = value; };
// ********** Code for _InputElementEventsImpl **************
$inherits(_InputElementEventsImpl, _ElementEventsImpl);
function _InputElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
// ********** Code for _Int16ArrayImpl **************
var _Int16ArrayImpl = {};
$dynamic("is$List").Int16Array = function(){return true};
$dynamic("is$Collection").Int16Array = function(){return true};
$dynamic("get$length").Int16Array = function() { return this.length; };
$dynamic("$index").Int16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int16Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int16Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int16Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").Int16Array = function() {
  return this.length == (0);
}
$dynamic("sort").Int16Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Int16Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").Int16Array = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").Int16Array = function($0) {
  return this.add($0);
};
// ********** Code for _Int32ArrayImpl **************
var _Int32ArrayImpl = {};
$dynamic("is$List").Int32Array = function(){return true};
$dynamic("is$Collection").Int32Array = function(){return true};
$dynamic("get$length").Int32Array = function() { return this.length; };
$dynamic("$index").Int32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").Int32Array = function() {
  return this.length == (0);
}
$dynamic("sort").Int32Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Int32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").Int32Array = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").Int32Array = function($0) {
  return this.add($0);
};
// ********** Code for _Int8ArrayImpl **************
var _Int8ArrayImpl = {};
$dynamic("is$List").Int8Array = function(){return true};
$dynamic("is$Collection").Int8Array = function(){return true};
$dynamic("get$length").Int8Array = function() { return this.length; };
$dynamic("$index").Int8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int8Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int8Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int8Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").Int8Array = function() {
  return this.length == (0);
}
$dynamic("sort").Int8Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Int8Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").Int8Array = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").Int8Array = function($0) {
  return this.add($0);
};
// ********** Code for _JavaScriptAudioNodeImpl **************
// ********** Code for _JavaScriptCallFrameImpl **************
// ********** Code for _KeyboardEventImpl **************
// ********** Code for _KeygenElementImpl **************
$dynamic("is$html_Element").HTMLKeygenElement = function(){return true};
$dynamic("get$name").HTMLKeygenElement = function() { return this.name; };
// ********** Code for _LIElementImpl **************
$dynamic("is$html_Element").HTMLLIElement = function(){return true};
$dynamic("get$value").HTMLLIElement = function() { return this.value; };
$dynamic("set$value").HTMLLIElement = function(value) { return this.value = value; };
// ********** Code for _LabelElementImpl **************
$dynamic("is$html_Element").HTMLLabelElement = function(){return true};
// ********** Code for _LegendElementImpl **************
$dynamic("is$html_Element").HTMLLegendElement = function(){return true};
// ********** Code for _LinkElementImpl **************
$dynamic("is$html_Element").HTMLLinkElement = function(){return true};
// ********** Code for _MediaStreamImpl **************
// ********** Code for _LocalMediaStreamImpl **************
// ********** Code for _LocationImpl **************
// ********** Code for _LowPass2FilterNodeImpl **************
// ********** Code for _MapElementImpl **************
$dynamic("is$html_Element").HTMLMapElement = function(){return true};
$dynamic("get$name").HTMLMapElement = function() { return this.name; };
// ********** Code for _MarqueeElementImpl **************
$dynamic("is$html_Element").HTMLMarqueeElement = function(){return true};
$dynamic("set$height").HTMLMarqueeElement = function(value) { return this.height = value; };
// ********** Code for _MediaControllerImpl **************
// ********** Code for _MediaElementAudioSourceNodeImpl **************
// ********** Code for _MediaErrorImpl **************
// ********** Code for _MediaListImpl **************
$dynamic("is$List").MediaList = function(){return true};
$dynamic("is$Collection").MediaList = function(){return true};
$dynamic("get$length").MediaList = function() { return this.length; };
$dynamic("$index").MediaList = function(index) {
  return this[index];
}
$dynamic("$setindex").MediaList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").MediaList = function() {
  return new _FixedSizeListIterator_dart_core_String(this);
}
$dynamic("add").MediaList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").MediaList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").MediaList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").MediaList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").MediaList = function() {
  return this.length == (0);
}
$dynamic("sort").MediaList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").MediaList = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").MediaList = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").MediaList = function($0) {
  return this.add($0);
};
// ********** Code for _MediaQueryListImpl **************
// ********** Code for _MediaQueryListListenerImpl **************
// ********** Code for _MediaStreamEventImpl **************
// ********** Code for _MediaStreamListImpl **************
$dynamic("get$length").MediaStreamList = function() { return this.length; };
// ********** Code for _MediaStreamTrackImpl **************
// ********** Code for _MediaStreamTrackListImpl **************
$dynamic("get$length").MediaStreamTrackList = function() { return this.length; };
// ********** Code for _MemoryInfoImpl **************
// ********** Code for _MenuElementImpl **************
$dynamic("is$html_Element").HTMLMenuElement = function(){return true};
// ********** Code for _MessageChannelImpl **************
// ********** Code for _MessageEventImpl **************
// ********** Code for _MessagePortImpl **************
$dynamic("_addEventListener").MessagePort = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _MetaElementImpl **************
$dynamic("is$html_Element").HTMLMetaElement = function(){return true};
$dynamic("get$name").HTMLMetaElement = function() { return this.name; };
// ********** Code for _MetadataImpl **************
// ********** Code for _MeterElementImpl **************
$dynamic("is$html_Element").HTMLMeterElement = function(){return true};
$dynamic("get$value").HTMLMeterElement = function() { return this.value; };
$dynamic("set$value").HTMLMeterElement = function(value) { return this.value = value; };
// ********** Code for _ModElementImpl **************
$dynamic("is$html_Element").HTMLModElement = function(){return true};
// ********** Code for _MouseEventImpl **************
// ********** Code for _MutationEventImpl **************
// ********** Code for _NamedNodeMapImpl **************
$dynamic("is$List").NamedNodeMap = function(){return true};
$dynamic("is$Collection").NamedNodeMap = function(){return true};
$dynamic("get$length").NamedNodeMap = function() { return this.length; };
$dynamic("$index").NamedNodeMap = function(index) {
  return this[index];
}
$dynamic("$setindex").NamedNodeMap = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").NamedNodeMap = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NamedNodeMap = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").NamedNodeMap = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").NamedNodeMap = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").NamedNodeMap = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").NamedNodeMap = function() {
  return this.length == (0);
}
$dynamic("sort").NamedNodeMap = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").NamedNodeMap = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").NamedNodeMap = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").NamedNodeMap = function($0) {
  return this.add($0);
};
// ********** Code for _NavigatorImpl **************
// ********** Code for _NavigatorUserMediaErrorImpl **************
// ********** Code for _NodeFilterImpl **************
// ********** Code for _NodeIteratorImpl **************
// ********** Code for _ListWrapper_Node **************
$inherits(_ListWrapper_Node, _ListWrapper);
function _ListWrapper_Node(_list) {
  this._html_list = _list;
}
_ListWrapper_Node.prototype.is$List = function(){return true};
_ListWrapper_Node.prototype.is$Collection = function(){return true};
_ListWrapper_Node.prototype.add$1 = _ListWrapper_Node.prototype.add;
_ListWrapper_Node.prototype.clear$0 = _ListWrapper_Node.prototype.clear;
// ********** Code for _NodeListWrapper **************
$inherits(_NodeListWrapper, _ListWrapper_Node);
function _NodeListWrapper(list) {
  _ListWrapper_Node.call(this, list);
}
_NodeListWrapper.prototype.is$List = function(){return true};
_NodeListWrapper.prototype.is$Collection = function(){return true};
_NodeListWrapper.prototype.filter = function(f) {
  return new _NodeListWrapper(this._html_list.filter(f));
}
_NodeListWrapper.prototype.getRange = function(start, length) {
  return new _NodeListWrapper(this._html_list.getRange(start, length));
}
// ********** Code for _NodeListImpl **************
$dynamic("is$List").NodeList = function(){return true};
$dynamic("is$Collection").NodeList = function(){return true};
$dynamic("set$_parent").NodeList = function(value) { return this._parent = value; };
$dynamic("iterator").NodeList = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NodeList = function(value) {
  this._parent._appendChild(value);
}
$dynamic("addAll").NodeList = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    this._parent._appendChild(node);
  }
}
$dynamic("removeLast").NodeList = function() {
  var last = this.last();
  if ($ne$(last)) {
    this._parent._removeChild(last);
  }
  return last;
}
$dynamic("clear").NodeList = function() {
  this._parent.set$text("");
}
$dynamic("$setindex").NodeList = function(index, value) {
  this._parent._replaceChild(value, this.$index(index));
}
$dynamic("forEach").NodeList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").NodeList = function(f) {
  return new _NodeListWrapper(_Collections.filter(this, [], f));
}
$dynamic("isEmpty").NodeList = function() {
  return this.length == (0);
}
$dynamic("sort").NodeList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").NodeList = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").NodeList = function(start, length) {
  return new _NodeListWrapper(_Lists.getRange(this, start, length, []));
}
$dynamic("get$length").NodeList = function() { return this.length; };
$dynamic("$index").NodeList = function(index) {
  return this[index];
}
$dynamic("add$1").NodeList = function($0) {
  return this.add($0);
};
$dynamic("clear$0").NodeList = function() {
  return this.clear();
};
// ********** Code for _NodeSelectorImpl **************
// ********** Code for _NotationImpl **************
// ********** Code for _NotificationImpl **************
// ********** Code for _NotificationCenterImpl **************
// ********** Code for _OESStandardDerivativesImpl **************
// ********** Code for _OESTextureFloatImpl **************
// ********** Code for _OESVertexArrayObjectImpl **************
// ********** Code for _OListElementImpl **************
$dynamic("is$html_Element").HTMLOListElement = function(){return true};
// ********** Code for _ObjectElementImpl **************
$dynamic("is$html_Element").HTMLObjectElement = function(){return true};
$dynamic("set$height").HTMLObjectElement = function(value) { return this.height = value; };
$dynamic("get$name").HTMLObjectElement = function() { return this.name; };
// ********** Code for _OfflineAudioCompletionEventImpl **************
// ********** Code for _OperationNotAllowedExceptionImpl **************
$dynamic("get$name").OperationNotAllowedException = function() { return this.name; };
// ********** Code for _OptGroupElementImpl **************
$dynamic("is$html_Element").HTMLOptGroupElement = function(){return true};
// ********** Code for _OptionElementImpl **************
$dynamic("is$html_Element").HTMLOptionElement = function(){return true};
$dynamic("get$value").HTMLOptionElement = function() { return this.value; };
$dynamic("set$value").HTMLOptionElement = function(value) { return this.value = value; };
// ********** Code for _OutputElementImpl **************
$dynamic("is$html_Element").HTMLOutputElement = function(){return true};
$dynamic("get$name").HTMLOutputElement = function() { return this.name; };
$dynamic("get$value").HTMLOutputElement = function() { return this.value; };
$dynamic("set$value").HTMLOutputElement = function(value) { return this.value = value; };
// ********** Code for _OverflowEventImpl **************
// ********** Code for _PageTransitionEventImpl **************
// ********** Code for _ParagraphElementImpl **************
$dynamic("is$html_Element").HTMLParagraphElement = function(){return true};
// ********** Code for _ParamElementImpl **************
$dynamic("is$html_Element").HTMLParamElement = function(){return true};
$dynamic("get$name").HTMLParamElement = function() { return this.name; };
$dynamic("get$value").HTMLParamElement = function() { return this.value; };
$dynamic("set$value").HTMLParamElement = function(value) { return this.value = value; };
// ********** Code for _PerformanceImpl **************
// ********** Code for _PerformanceNavigationImpl **************
// ********** Code for _PerformanceTimingImpl **************
// ********** Code for _PointImpl **************
// ********** Code for _PopStateEventImpl **************
// ********** Code for _PositionErrorImpl **************
// ********** Code for _PreElementImpl **************
$dynamic("is$html_Element").HTMLPreElement = function(){return true};
// ********** Code for _ProcessingInstructionImpl **************
// ********** Code for _ProgressElementImpl **************
$dynamic("is$html_Element").HTMLProgressElement = function(){return true};
$dynamic("get$value").HTMLProgressElement = function() { return this.value; };
$dynamic("set$value").HTMLProgressElement = function(value) { return this.value = value; };
// ********** Code for _ProgressEventImpl **************
// ********** Code for _QuoteElementImpl **************
$dynamic("is$html_Element").HTMLQuoteElement = function(){return true};
// ********** Code for _RGBColorImpl **************
// ********** Code for _RangeImpl **************
// ********** Code for _RangeExceptionImpl **************
$dynamic("get$name").RangeException = function() { return this.name; };
// ********** Code for _RealtimeAnalyserNodeImpl **************
// ********** Code for _RectImpl **************
// ********** Code for _SQLErrorImpl **************
// ********** Code for _SQLExceptionImpl **************
// ********** Code for _SQLResultSetImpl **************
// ********** Code for _SQLResultSetRowListImpl **************
$dynamic("get$length").SQLResultSetRowList = function() { return this.length; };
// ********** Code for _SQLTransactionImpl **************
// ********** Code for _SQLTransactionSyncImpl **************
// ********** Code for _SVGElementImpl **************
$dynamic("is$html_Element").SVGElement = function(){return true};
$dynamic("get$classes").SVGElement = function() {
  if (null == this._cssClassSet) {
    this._cssClassSet = new _AttributeClassSet(this.get$_ptr());
  }
  return this._cssClassSet;
}
$dynamic("get$elements").SVGElement = function() {
  return new FilteredElementList(this);
}
$dynamic("set$elements").SVGElement = function(value) {
  var elements = this.get$elements();
  elements.clear$0();
  elements.addAll(value);
}
$dynamic("set$innerHTML").SVGElement = function(svg) {
  var container = _ElementFactoryProvider.Element$tag$factory("div");
  container.set$innerHTML(("<svg version=\"1.1\">" + svg + "</svg>"));
  this.set$elements(container.get$elements().get$first().get$elements());
}
// ********** Code for _SVGAElementImpl **************
$dynamic("is$html_Element").SVGAElement = function(){return true};
// ********** Code for _SVGAltGlyphDefElementImpl **************
$dynamic("is$html_Element").SVGAltGlyphDefElement = function(){return true};
// ********** Code for _SVGTextContentElementImpl **************
$dynamic("is$html_Element").SVGTextContentElement = function(){return true};
// ********** Code for _SVGTextPositioningElementImpl **************
$dynamic("is$html_Element").SVGTextPositioningElement = function(){return true};
// ********** Code for _SVGAltGlyphElementImpl **************
$dynamic("is$html_Element").SVGAltGlyphElement = function(){return true};
// ********** Code for _SVGAltGlyphItemElementImpl **************
$dynamic("is$html_Element").SVGAltGlyphItemElement = function(){return true};
// ********** Code for _SVGAngleImpl **************
$dynamic("get$value").SVGAngle = function() { return this.value; };
$dynamic("set$value").SVGAngle = function(value) { return this.value = value; };
// ********** Code for _SVGAnimationElementImpl **************
$dynamic("is$html_Element").SVGAnimationElement = function(){return true};
// ********** Code for _SVGAnimateColorElementImpl **************
$dynamic("is$html_Element").SVGAnimateColorElement = function(){return true};
// ********** Code for _SVGAnimateElementImpl **************
$dynamic("is$html_Element").SVGAnimateElement = function(){return true};
// ********** Code for _SVGAnimateMotionElementImpl **************
$dynamic("is$html_Element").SVGAnimateMotionElement = function(){return true};
// ********** Code for _SVGAnimateTransformElementImpl **************
$dynamic("is$html_Element").SVGAnimateTransformElement = function(){return true};
// ********** Code for _SVGAnimatedAngleImpl **************
// ********** Code for _SVGAnimatedBooleanImpl **************
// ********** Code for _SVGAnimatedEnumerationImpl **************
// ********** Code for _SVGAnimatedIntegerImpl **************
// ********** Code for _SVGAnimatedLengthImpl **************
// ********** Code for _SVGAnimatedLengthListImpl **************
// ********** Code for _SVGAnimatedNumberImpl **************
// ********** Code for _SVGAnimatedNumberListImpl **************
// ********** Code for _SVGAnimatedPreserveAspectRatioImpl **************
// ********** Code for _SVGAnimatedRectImpl **************
// ********** Code for _SVGAnimatedStringImpl **************
// ********** Code for _SVGAnimatedTransformListImpl **************
// ********** Code for _SVGCircleElementImpl **************
$dynamic("is$html_Element").SVGCircleElement = function(){return true};
// ********** Code for _SVGClipPathElementImpl **************
$dynamic("is$html_Element").SVGClipPathElement = function(){return true};
// ********** Code for _SVGColorImpl **************
// ********** Code for _SVGComponentTransferFunctionElementImpl **************
$dynamic("is$html_Element").SVGComponentTransferFunctionElement = function(){return true};
// ********** Code for _SVGCursorElementImpl **************
$dynamic("is$html_Element").SVGCursorElement = function(){return true};
// ********** Code for _SVGDefsElementImpl **************
$dynamic("is$html_Element").SVGDefsElement = function(){return true};
// ********** Code for _SVGDescElementImpl **************
$dynamic("is$html_Element").SVGDescElement = function(){return true};
// ********** Code for _SVGDocumentImpl **************
$dynamic("is$html_Element").SVGDocument = function(){return true};
// ********** Code for _CssClassSet **************
function _CssClassSet(_element) {
  this._html_element = _element;
}
_CssClassSet.prototype.is$Collection = function(){return true};
_CssClassSet.prototype.toString = function() {
  return this._formatSet(this._read());
}
_CssClassSet.prototype.iterator = function() {
  return this._read().iterator();
}
_CssClassSet.prototype.forEach = function(f) {
  this._read().forEach(f);
}
_CssClassSet.prototype.filter = function(f) {
  return this._read().filter(f);
}
_CssClassSet.prototype.isEmpty = function() {
  return this._read().isEmpty();
}
_CssClassSet.prototype.get$length = function() {
  return this._read().get$length();
}
_CssClassSet.prototype.add = function(value) {
  this._modify((function (s) {
    return s.add$1(value);
  })
  );
}
_CssClassSet.prototype.remove = function(value) {
  var s = this._read();
  var result = s.remove(value);
  this._write(s);
  return result;
}
_CssClassSet.prototype.addAll = function(collection) {
  this._modify((function (s) {
    return s.addAll(collection);
  })
  );
}
_CssClassSet.prototype.clear = function() {
  this._modify((function (s) {
    return s.clear$0();
  })
  );
}
_CssClassSet.prototype._modify = function(f) {
  var s = this._read();
  f(s);
  this._write(s);
}
_CssClassSet.prototype._read = function() {
  var s = new HashSetImplementation_dart_core_String();
  var $$list = this._className().split_(" ");
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var name = $$i.next();
    var trimmed = name.trim();
    if (!trimmed.isEmpty()) {
      s.add(trimmed);
    }
  }
  return s;
}
_CssClassSet.prototype._className = function() {
  return this._html_element.get$_className();
}
_CssClassSet.prototype._write = function(s) {
  this._html_element.set$_className(this._formatSet(s));
}
_CssClassSet.prototype._formatSet = function(s) {
  var list = ListFactory.ListFactory$from$factory(s);
  return Strings.join(list, " ");
}
_CssClassSet.prototype.add$1 = _CssClassSet.prototype.add;
_CssClassSet.prototype.clear$0 = _CssClassSet.prototype.clear;
// ********** Code for _AttributeClassSet **************
$inherits(_AttributeClassSet, _CssClassSet);
function _AttributeClassSet(element) {
  _CssClassSet.call(this, element);
}
_AttributeClassSet.prototype._className = function() {
  return this._html_element.get$attributes().$index("class");
}
_AttributeClassSet.prototype._write = function(s) {
  this._html_element.get$attributes().$setindex("class", this._formatSet(s));
}
// ********** Code for _SVGElementInstanceImpl **************
$dynamic("_addEventListener").SVGElementInstance = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _SVGElementInstanceListImpl **************
$dynamic("get$length").SVGElementInstanceList = function() { return this.length; };
// ********** Code for _SVGEllipseElementImpl **************
$dynamic("is$html_Element").SVGEllipseElement = function(){return true};
// ********** Code for _SVGExceptionImpl **************
$dynamic("get$name").SVGException = function() { return this.name; };
// ********** Code for _SVGExternalResourcesRequiredImpl **************
// ********** Code for _SVGFEBlendElementImpl **************
$dynamic("is$html_Element").SVGFEBlendElement = function(){return true};
// ********** Code for _SVGFEColorMatrixElementImpl **************
$dynamic("is$html_Element").SVGFEColorMatrixElement = function(){return true};
// ********** Code for _SVGFEComponentTransferElementImpl **************
$dynamic("is$html_Element").SVGFEComponentTransferElement = function(){return true};
// ********** Code for _SVGFECompositeElementImpl **************
$dynamic("is$html_Element").SVGFECompositeElement = function(){return true};
// ********** Code for _SVGFEConvolveMatrixElementImpl **************
$dynamic("is$html_Element").SVGFEConvolveMatrixElement = function(){return true};
// ********** Code for _SVGFEDiffuseLightingElementImpl **************
$dynamic("is$html_Element").SVGFEDiffuseLightingElement = function(){return true};
// ********** Code for _SVGFEDisplacementMapElementImpl **************
$dynamic("is$html_Element").SVGFEDisplacementMapElement = function(){return true};
// ********** Code for _SVGFEDistantLightElementImpl **************
$dynamic("is$html_Element").SVGFEDistantLightElement = function(){return true};
// ********** Code for _SVGFEDropShadowElementImpl **************
$dynamic("is$html_Element").SVGFEDropShadowElement = function(){return true};
// ********** Code for _SVGFEFloodElementImpl **************
$dynamic("is$html_Element").SVGFEFloodElement = function(){return true};
// ********** Code for _SVGFEFuncAElementImpl **************
$dynamic("is$html_Element").SVGFEFuncAElement = function(){return true};
// ********** Code for _SVGFEFuncBElementImpl **************
$dynamic("is$html_Element").SVGFEFuncBElement = function(){return true};
// ********** Code for _SVGFEFuncGElementImpl **************
$dynamic("is$html_Element").SVGFEFuncGElement = function(){return true};
// ********** Code for _SVGFEFuncRElementImpl **************
$dynamic("is$html_Element").SVGFEFuncRElement = function(){return true};
// ********** Code for _SVGFEGaussianBlurElementImpl **************
$dynamic("is$html_Element").SVGFEGaussianBlurElement = function(){return true};
// ********** Code for _SVGFEImageElementImpl **************
$dynamic("is$html_Element").SVGFEImageElement = function(){return true};
// ********** Code for _SVGFEMergeElementImpl **************
$dynamic("is$html_Element").SVGFEMergeElement = function(){return true};
// ********** Code for _SVGFEMergeNodeElementImpl **************
$dynamic("is$html_Element").SVGFEMergeNodeElement = function(){return true};
// ********** Code for _SVGFEMorphologyElementImpl **************
$dynamic("is$html_Element").SVGFEMorphologyElement = function(){return true};
// ********** Code for _SVGFEOffsetElementImpl **************
$dynamic("is$html_Element").SVGFEOffsetElement = function(){return true};
// ********** Code for _SVGFEPointLightElementImpl **************
$dynamic("is$html_Element").SVGFEPointLightElement = function(){return true};
// ********** Code for _SVGFESpecularLightingElementImpl **************
$dynamic("is$html_Element").SVGFESpecularLightingElement = function(){return true};
// ********** Code for _SVGFESpotLightElementImpl **************
$dynamic("is$html_Element").SVGFESpotLightElement = function(){return true};
// ********** Code for _SVGFETileElementImpl **************
$dynamic("is$html_Element").SVGFETileElement = function(){return true};
// ********** Code for _SVGFETurbulenceElementImpl **************
$dynamic("is$html_Element").SVGFETurbulenceElement = function(){return true};
// ********** Code for _SVGFilterElementImpl **************
$dynamic("is$html_Element").SVGFilterElement = function(){return true};
// ********** Code for _SVGStylableImpl **************
// ********** Code for _SVGFilterPrimitiveStandardAttributesImpl **************
// ********** Code for _SVGFitToViewBoxImpl **************
// ********** Code for _SVGFontElementImpl **************
$dynamic("is$html_Element").SVGFontElement = function(){return true};
// ********** Code for _SVGFontFaceElementImpl **************
$dynamic("is$html_Element").SVGFontFaceElement = function(){return true};
// ********** Code for _SVGFontFaceFormatElementImpl **************
$dynamic("is$html_Element").SVGFontFaceFormatElement = function(){return true};
// ********** Code for _SVGFontFaceNameElementImpl **************
$dynamic("is$html_Element").SVGFontFaceNameElement = function(){return true};
// ********** Code for _SVGFontFaceSrcElementImpl **************
$dynamic("is$html_Element").SVGFontFaceSrcElement = function(){return true};
// ********** Code for _SVGFontFaceUriElementImpl **************
$dynamic("is$html_Element").SVGFontFaceUriElement = function(){return true};
// ********** Code for _SVGForeignObjectElementImpl **************
$dynamic("is$html_Element").SVGForeignObjectElement = function(){return true};
// ********** Code for _SVGGElementImpl **************
$dynamic("is$html_Element").SVGGElement = function(){return true};
// ********** Code for _SVGGlyphElementImpl **************
$dynamic("is$html_Element").SVGGlyphElement = function(){return true};
// ********** Code for _SVGGlyphRefElementImpl **************
$dynamic("is$html_Element").SVGGlyphRefElement = function(){return true};
// ********** Code for _SVGGradientElementImpl **************
$dynamic("is$html_Element").SVGGradientElement = function(){return true};
// ********** Code for _SVGHKernElementImpl **************
$dynamic("is$html_Element").SVGHKernElement = function(){return true};
// ********** Code for _SVGImageElementImpl **************
$dynamic("is$html_Element").SVGImageElement = function(){return true};
// ********** Code for _SVGLangSpaceImpl **************
// ********** Code for _SVGLengthImpl **************
$dynamic("get$value").SVGLength = function() { return this.value; };
$dynamic("set$value").SVGLength = function(value) { return this.value = value; };
// ********** Code for _SVGLengthListImpl **************
$dynamic("clear$0").SVGLengthList = function() {
  return this.clear();
};
// ********** Code for _SVGLineElementImpl **************
$dynamic("is$html_Element").SVGLineElement = function(){return true};
// ********** Code for _SVGLinearGradientElementImpl **************
$dynamic("is$html_Element").SVGLinearGradientElement = function(){return true};
// ********** Code for _SVGLocatableImpl **************
// ********** Code for _SVGMPathElementImpl **************
$dynamic("is$html_Element").SVGMPathElement = function(){return true};
// ********** Code for _SVGMarkerElementImpl **************
$dynamic("is$html_Element").SVGMarkerElement = function(){return true};
// ********** Code for _SVGMaskElementImpl **************
$dynamic("is$html_Element").SVGMaskElement = function(){return true};
// ********** Code for _SVGMatrixImpl **************
// ********** Code for _SVGMetadataElementImpl **************
$dynamic("is$html_Element").SVGMetadataElement = function(){return true};
// ********** Code for _SVGMissingGlyphElementImpl **************
$dynamic("is$html_Element").SVGMissingGlyphElement = function(){return true};
// ********** Code for _SVGNumberImpl **************
$dynamic("get$value").SVGNumber = function() { return this.value; };
$dynamic("set$value").SVGNumber = function(value) { return this.value = value; };
// ********** Code for _SVGNumberListImpl **************
$dynamic("clear$0").SVGNumberList = function() {
  return this.clear();
};
// ********** Code for _SVGPaintImpl **************
// ********** Code for _SVGPathElementImpl **************
$dynamic("is$html_Element").SVGPathElement = function(){return true};
// ********** Code for _SVGPathSegImpl **************
// ********** Code for _SVGPathSegArcAbsImpl **************
// ********** Code for _SVGPathSegArcRelImpl **************
// ********** Code for _SVGPathSegClosePathImpl **************
// ********** Code for _SVGPathSegCurvetoCubicAbsImpl **************
// ********** Code for _SVGPathSegCurvetoCubicRelImpl **************
// ********** Code for _SVGPathSegCurvetoCubicSmoothAbsImpl **************
// ********** Code for _SVGPathSegCurvetoCubicSmoothRelImpl **************
// ********** Code for _SVGPathSegCurvetoQuadraticAbsImpl **************
// ********** Code for _SVGPathSegCurvetoQuadraticRelImpl **************
// ********** Code for _SVGPathSegCurvetoQuadraticSmoothAbsImpl **************
// ********** Code for _SVGPathSegCurvetoQuadraticSmoothRelImpl **************
// ********** Code for _SVGPathSegLinetoAbsImpl **************
// ********** Code for _SVGPathSegLinetoHorizontalAbsImpl **************
// ********** Code for _SVGPathSegLinetoHorizontalRelImpl **************
// ********** Code for _SVGPathSegLinetoRelImpl **************
// ********** Code for _SVGPathSegLinetoVerticalAbsImpl **************
// ********** Code for _SVGPathSegLinetoVerticalRelImpl **************
// ********** Code for _SVGPathSegListImpl **************
$dynamic("clear$0").SVGPathSegList = function() {
  return this.clear();
};
// ********** Code for _SVGPathSegMovetoAbsImpl **************
// ********** Code for _SVGPathSegMovetoRelImpl **************
// ********** Code for _SVGPatternElementImpl **************
$dynamic("is$html_Element").SVGPatternElement = function(){return true};
// ********** Code for _SVGPointImpl **************
// ********** Code for _SVGPointListImpl **************
$dynamic("clear$0").SVGPointList = function() {
  return this.clear();
};
// ********** Code for _SVGPolygonElementImpl **************
$dynamic("is$html_Element").SVGPolygonElement = function(){return true};
// ********** Code for _SVGPolylineElementImpl **************
$dynamic("is$html_Element").SVGPolylineElement = function(){return true};
// ********** Code for _SVGPreserveAspectRatioImpl **************
// ********** Code for _SVGRadialGradientElementImpl **************
$dynamic("is$html_Element").SVGRadialGradientElement = function(){return true};
// ********** Code for _SVGRectImpl **************
$dynamic("set$height").SVGRect = function(value) { return this.height = value; };
// ********** Code for _SVGRectElementImpl **************
$dynamic("is$html_Element").SVGRectElement = function(){return true};
// ********** Code for _SVGRenderingIntentImpl **************
// ********** Code for _SVGSVGElementImpl **************
$dynamic("is$html_Element").SVGSVGElement = function(){return true};
// ********** Code for _SVGScriptElementImpl **************
$dynamic("is$html_Element").SVGScriptElement = function(){return true};
// ********** Code for _SVGSetElementImpl **************
$dynamic("is$html_Element").SVGSetElement = function(){return true};
// ********** Code for _SVGStopElementImpl **************
$dynamic("is$html_Element").SVGStopElement = function(){return true};
// ********** Code for _SVGStringListImpl **************
$dynamic("clear$0").SVGStringList = function() {
  return this.clear();
};
// ********** Code for _SVGStyleElementImpl **************
$dynamic("is$html_Element").SVGStyleElement = function(){return true};
// ********** Code for _SVGSwitchElementImpl **************
$dynamic("is$html_Element").SVGSwitchElement = function(){return true};
// ********** Code for _SVGSymbolElementImpl **************
$dynamic("is$html_Element").SVGSymbolElement = function(){return true};
// ********** Code for _SVGTRefElementImpl **************
$dynamic("is$html_Element").SVGTRefElement = function(){return true};
// ********** Code for _SVGTSpanElementImpl **************
$dynamic("is$html_Element").SVGTSpanElement = function(){return true};
// ********** Code for _SVGTestsImpl **************
// ********** Code for _SVGTextElementImpl **************
$dynamic("is$html_Element").SVGTextElement = function(){return true};
// ********** Code for _SVGTextPathElementImpl **************
$dynamic("is$html_Element").SVGTextPathElement = function(){return true};
// ********** Code for _SVGTitleElementImpl **************
$dynamic("is$html_Element").SVGTitleElement = function(){return true};
// ********** Code for _SVGTransformImpl **************
// ********** Code for _SVGTransformListImpl **************
$dynamic("clear$0").SVGTransformList = function() {
  return this.clear();
};
// ********** Code for _SVGTransformableImpl **************
// ********** Code for _SVGURIReferenceImpl **************
// ********** Code for _SVGUnitTypesImpl **************
// ********** Code for _SVGUseElementImpl **************
$dynamic("is$html_Element").SVGUseElement = function(){return true};
// ********** Code for _SVGVKernElementImpl **************
$dynamic("is$html_Element").SVGVKernElement = function(){return true};
// ********** Code for _SVGViewElementImpl **************
$dynamic("is$html_Element").SVGViewElement = function(){return true};
// ********** Code for _SVGZoomAndPanImpl **************
// ********** Code for _SVGViewSpecImpl **************
// ********** Code for _SVGZoomEventImpl **************
// ********** Code for _ScreenImpl **************
// ********** Code for _ScriptElementImpl **************
$dynamic("is$html_Element").HTMLScriptElement = function(){return true};
// ********** Code for _ScriptProfileImpl **************
// ********** Code for _ScriptProfileNodeImpl **************
// ********** Code for _SelectElementImpl **************
$dynamic("is$html_Element").HTMLSelectElement = function(){return true};
$dynamic("get$length").HTMLSelectElement = function() { return this.length; };
$dynamic("get$name").HTMLSelectElement = function() { return this.name; };
$dynamic("get$value").HTMLSelectElement = function() { return this.value; };
$dynamic("set$value").HTMLSelectElement = function(value) { return this.value = value; };
// ********** Code for _ShadowElementImpl **************
$dynamic("is$html_Element").HTMLShadowElement = function(){return true};
// ********** Code for _ShadowRootImpl **************
$dynamic("is$html_Element").ShadowRoot = function(){return true};
$dynamic("set$innerHTML").ShadowRoot = function(value) { return this.innerHTML = value; };
// ********** Code for _SharedWorkerImpl **************
// ********** Code for _SharedWorkerContextImpl **************
$dynamic("get$name").SharedWorkerContext = function() { return this.name; };
// ********** Code for _SourceElementImpl **************
$dynamic("is$html_Element").HTMLSourceElement = function(){return true};
// ********** Code for _SpanElementImpl **************
$dynamic("is$html_Element").HTMLSpanElement = function(){return true};
// ********** Code for _SpeechGrammarImpl **************
// ********** Code for _SpeechGrammarListImpl **************
$dynamic("get$length").SpeechGrammarList = function() { return this.length; };
// ********** Code for _SpeechInputEventImpl **************
// ********** Code for _SpeechInputResultImpl **************
// ********** Code for _SpeechInputResultListImpl **************
$dynamic("get$length").SpeechInputResultList = function() { return this.length; };
// ********** Code for _SpeechRecognitionAlternativeImpl **************
// ********** Code for _SpeechRecognitionErrorImpl **************
// ********** Code for _SpeechRecognitionEventImpl **************
// ********** Code for _SpeechRecognitionResultImpl **************
$dynamic("get$length").SpeechRecognitionResult = function() { return this.length; };
// ********** Code for _SpeechRecognitionResultListImpl **************
$dynamic("get$length").SpeechRecognitionResultList = function() { return this.length; };
// ********** Code for _StorageImpl **************
$dynamic("get$length").Storage = function() { return this.length; };
$dynamic("clear$0").Storage = function() {
  return this.clear();
};
// ********** Code for _StorageEventImpl **************
// ********** Code for _StorageInfoImpl **************
// ********** Code for _StyleElementImpl **************
$dynamic("is$html_Element").HTMLStyleElement = function(){return true};
// ********** Code for _StyleMediaImpl **************
// ********** Code for _StyleSheetListImpl **************
$dynamic("is$List").StyleSheetList = function(){return true};
$dynamic("is$Collection").StyleSheetList = function(){return true};
$dynamic("get$length").StyleSheetList = function() { return this.length; };
$dynamic("$index").StyleSheetList = function(index) {
  return this[index];
}
$dynamic("$setindex").StyleSheetList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").StyleSheetList = function() {
  return new _FixedSizeListIterator_html_StyleSheet(this);
}
$dynamic("add").StyleSheetList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").StyleSheetList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").StyleSheetList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").StyleSheetList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").StyleSheetList = function() {
  return this.length == (0);
}
$dynamic("sort").StyleSheetList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").StyleSheetList = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").StyleSheetList = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").StyleSheetList = function($0) {
  return this.add($0);
};
// ********** Code for _TableCaptionElementImpl **************
$dynamic("is$html_Element").HTMLTableCaptionElement = function(){return true};
// ********** Code for _TableCellElementImpl **************
$dynamic("is$html_Element").HTMLTableCellElement = function(){return true};
$dynamic("set$height").HTMLTableCellElement = function(value) { return this.height = value; };
// ********** Code for _TableColElementImpl **************
$dynamic("is$html_Element").HTMLTableColElement = function(){return true};
// ********** Code for _TableElementImpl **************
$dynamic("is$html_Element").HTMLTableElement = function(){return true};
// ********** Code for _TableRowElementImpl **************
$dynamic("is$html_Element").HTMLTableRowElement = function(){return true};
// ********** Code for _TableSectionElementImpl **************
$dynamic("is$html_Element").HTMLTableSectionElement = function(){return true};
// ********** Code for _TextAreaElementImpl **************
$dynamic("is$html_Element").HTMLTextAreaElement = function(){return true};
$dynamic("get$name").HTMLTextAreaElement = function() { return this.name; };
$dynamic("get$value").HTMLTextAreaElement = function() { return this.value; };
$dynamic("set$value").HTMLTextAreaElement = function(value) { return this.value = value; };
// ********** Code for _TextEventImpl **************
// ********** Code for _TextMetricsImpl **************
// ********** Code for _TextTrackImpl **************
// ********** Code for _TextTrackCueImpl **************
$dynamic("get$text").TextTrackCue = function() { return this.text; };
// ********** Code for _TextTrackCueListImpl **************
$dynamic("get$length").TextTrackCueList = function() { return this.length; };
// ********** Code for _TextTrackListImpl **************
$dynamic("get$length").TextTrackList = function() { return this.length; };
// ********** Code for _TimeRangesImpl **************
$dynamic("get$length").TimeRanges = function() { return this.length; };
// ********** Code for _TitleElementImpl **************
$dynamic("is$html_Element").HTMLTitleElement = function(){return true};
// ********** Code for _TouchImpl **************
// ********** Code for _TouchEventImpl **************
// ********** Code for _TouchListImpl **************
$dynamic("is$List").TouchList = function(){return true};
$dynamic("is$Collection").TouchList = function(){return true};
$dynamic("get$length").TouchList = function() { return this.length; };
$dynamic("$index").TouchList = function(index) {
  return this[index];
}
$dynamic("$setindex").TouchList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").TouchList = function() {
  return new _FixedSizeListIterator_html_Touch(this);
}
$dynamic("add").TouchList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").TouchList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").TouchList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").TouchList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").TouchList = function() {
  return this.length == (0);
}
$dynamic("sort").TouchList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").TouchList = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").TouchList = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").TouchList = function($0) {
  return this.add($0);
};
// ********** Code for _TrackElementImpl **************
$dynamic("is$html_Element").HTMLTrackElement = function(){return true};
// ********** Code for _TrackEventImpl **************
// ********** Code for _TransitionEventImpl **************
// ********** Code for _TreeWalkerImpl **************
// ********** Code for _UListElementImpl **************
$dynamic("is$html_Element").HTMLUListElement = function(){return true};
// ********** Code for _Uint16ArrayImpl **************
var _Uint16ArrayImpl = {};
$dynamic("is$List").Uint16Array = function(){return true};
$dynamic("is$Collection").Uint16Array = function(){return true};
$dynamic("get$length").Uint16Array = function() { return this.length; };
$dynamic("$index").Uint16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint16Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint16Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint16Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").Uint16Array = function() {
  return this.length == (0);
}
$dynamic("sort").Uint16Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Uint16Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").Uint16Array = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").Uint16Array = function($0) {
  return this.add($0);
};
// ********** Code for _Uint32ArrayImpl **************
var _Uint32ArrayImpl = {};
$dynamic("is$List").Uint32Array = function(){return true};
$dynamic("is$Collection").Uint32Array = function(){return true};
$dynamic("get$length").Uint32Array = function() { return this.length; };
$dynamic("$index").Uint32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").Uint32Array = function() {
  return this.length == (0);
}
$dynamic("sort").Uint32Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Uint32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").Uint32Array = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").Uint32Array = function($0) {
  return this.add($0);
};
// ********** Code for _Uint8ArrayImpl **************
var _Uint8ArrayImpl = {};
$dynamic("is$List").Uint8Array = function(){return true};
$dynamic("is$Collection").Uint8Array = function(){return true};
$dynamic("get$length").Uint8Array = function() { return this.length; };
$dynamic("$index").Uint8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint8Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint8Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint8Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("isEmpty").Uint8Array = function() {
  return this.length == (0);
}
$dynamic("sort").Uint8Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("last").Uint8Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("getRange").Uint8Array = function(start, length) {
  return _Lists.getRange(this, start, length, []);
}
$dynamic("add$1").Uint8Array = function($0) {
  return this.add($0);
};
// ********** Code for _Uint8ClampedArrayImpl **************
var _Uint8ClampedArrayImpl = {};
$dynamic("is$List").Uint8ClampedArray = function(){return true};
$dynamic("is$Collection").Uint8ClampedArray = function(){return true};
// ********** Code for _UnknownElementImpl **************
$dynamic("is$html_Element").HTMLUnknownElement = function(){return true};
// ********** Code for _ValidityStateImpl **************
// ********** Code for _VideoElementImpl **************
$dynamic("is$html_Element").HTMLVideoElement = function(){return true};
$dynamic("set$height").HTMLVideoElement = function(value) { return this.height = value; };
// ********** Code for _WaveShaperNodeImpl **************
// ********** Code for _WebGLActiveInfoImpl **************
$dynamic("get$name").WebGLActiveInfo = function() { return this.name; };
// ********** Code for _WebGLBufferImpl **************
// ********** Code for _WebGLCompressedTextureS3TCImpl **************
// ********** Code for _WebGLContextAttributesImpl **************
// ********** Code for _WebGLContextEventImpl **************
// ********** Code for _WebGLDebugRendererInfoImpl **************
// ********** Code for _WebGLDebugShadersImpl **************
// ********** Code for _WebGLFramebufferImpl **************
// ********** Code for _WebGLLoseContextImpl **************
// ********** Code for _WebGLProgramImpl **************
// ********** Code for _WebGLRenderbufferImpl **************
// ********** Code for _WebGLRenderingContextImpl **************
// ********** Code for _WebGLShaderImpl **************
// ********** Code for _WebGLTextureImpl **************
// ********** Code for _WebGLUniformLocationImpl **************
// ********** Code for _WebGLVertexArrayObjectOESImpl **************
// ********** Code for _WebKitCSSRegionRuleImpl **************
// ********** Code for _WebKitNamedFlowImpl **************
// ********** Code for _WebSocketImpl **************
$dynamic("_addEventListener").WebSocket = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _WheelEventImpl **************
// ********** Code for _WindowImpl **************
$dynamic("get$on").DOMWindow = function() {
  return new _WindowEventsImpl(this);
}
$dynamic("get$length").DOMWindow = function() { return this.length; };
$dynamic("get$name").DOMWindow = function() { return this.name; };
$dynamic("_addEventListener").DOMWindow = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _WindowEventsImpl **************
$inherits(_WindowEventsImpl, _EventsImpl);
function _WindowEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_WindowEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
_WindowEventsImpl.prototype.get$mouseDown = function() {
  return this._get("mousedown");
}
_WindowEventsImpl.prototype.get$mouseOut = function() {
  return this._get("mouseout");
}
_WindowEventsImpl.prototype.get$mouseOver = function() {
  return this._get("mouseover");
}
_WindowEventsImpl.prototype.get$mouseUp = function() {
  return this._get("mouseup");
}
_WindowEventsImpl.prototype.get$popState = function() {
  return this._get("popstate");
}
// ********** Code for _WorkerImpl **************
// ********** Code for _WorkerLocationImpl **************
// ********** Code for _WorkerNavigatorImpl **************
// ********** Code for _XMLHttpRequestImpl **************
$dynamic("get$on").XMLHttpRequest = function() {
  return new _XMLHttpRequestEventsImpl(this);
}
$dynamic("_addEventListener").XMLHttpRequest = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _XMLHttpRequestEventsImpl **************
$inherits(_XMLHttpRequestEventsImpl, _EventsImpl);
function _XMLHttpRequestEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_XMLHttpRequestEventsImpl.prototype.get$load = function() {
  return this._get("load");
}
// ********** Code for _XMLHttpRequestExceptionImpl **************
$dynamic("get$name").XMLHttpRequestException = function() { return this.name; };
// ********** Code for _XMLHttpRequestProgressEventImpl **************
// ********** Code for _XMLHttpRequestUploadImpl **************
$dynamic("_addEventListener").XMLHttpRequestUpload = function(type, listener, useCapture) {
  this.addEventListener(type, listener, useCapture);
}
// ********** Code for _XMLSerializerImpl **************
// ********** Code for _XPathEvaluatorImpl **************
// ********** Code for _XPathExceptionImpl **************
$dynamic("get$name").XPathException = function() { return this.name; };
// ********** Code for _XPathExpressionImpl **************
// ********** Code for _XPathNSResolverImpl **************
// ********** Code for _XPathResultImpl **************
// ********** Code for _XSLTProcessorImpl **************
// ********** Code for _XMLHttpRequestFactoryProvider **************
function _XMLHttpRequestFactoryProvider() {}
_XMLHttpRequestFactoryProvider.XMLHttpRequest$factory = function() {
  return new XMLHttpRequest();
}
// ********** Code for _DataAttributeMap **************
function _DataAttributeMap(_attributes) {
  this._attributes = _attributes;
}
_DataAttributeMap.prototype.is$Map = function(){return true};
_DataAttributeMap.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
_DataAttributeMap.prototype.containsKey = function(key) {
  return this._attributes.containsKey(this._attr(key));
}
_DataAttributeMap.prototype.$index = function(key) {
  return this._attributes.$index(this._attr(key));
}
_DataAttributeMap.prototype.$setindex = function(key, value) {
  this._attributes.$setindex(this._attr(key), value);
}
_DataAttributeMap.prototype.remove = function(key) {
  return this._attributes.remove(this._attr(key));
}
_DataAttributeMap.prototype.clear = function() {
  var $$list = this.getKeys();
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var key = $$i.next();
    this.remove(key);
  }
}
_DataAttributeMap.prototype.forEach = function(f) {
  var $this = this; // closure support
  this._attributes.forEach((function (key, value) {
    if ($this._matches(key)) {
      f($this._strip(key), value);
    }
  })
  );
}
_DataAttributeMap.prototype.getKeys = function() {
  var $this = this; // closure support
  var keys = new Array();
  this._attributes.forEach((function (key, value) {
    if ($this._matches(key)) {
      keys.add$1($this._strip(key));
    }
  })
  );
  return keys;
}
_DataAttributeMap.prototype.get$length = function() {
  return this.getKeys().get$length();
}
_DataAttributeMap.prototype._attr = function(key) {
  return ("data-" + key);
}
_DataAttributeMap.prototype._matches = function(key) {
  return key.startsWith("data-");
}
_DataAttributeMap.prototype._strip = function(key) {
  return key.substring((5));
}
_DataAttributeMap.prototype.clear$0 = _DataAttributeMap.prototype.clear;
// ********** Code for _Collections **************
function _Collections() {}
_Collections.forEach = function(iterable, f) {
  for (var $$i = iterable.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    f(e);
  }
}
_Collections.filter = function(source, destination, f) {
  for (var $$i = source.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (f(e)) destination.add(e);
  }
  return destination;
}
// ********** Code for _ElementFactoryProvider **************
function _ElementFactoryProvider() {}
_ElementFactoryProvider.Element$tag$factory = function(tag) {
  return get$$_document()._createElement(tag);
}
// ********** Code for _VariableSizeListIterator **************
function _VariableSizeListIterator() {}
_VariableSizeListIterator.prototype.hasNext = function() {
  return this._html_array.get$length() > this._html_pos;
}
_VariableSizeListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._html_array.$index(this._html_pos++);
}
// ********** Code for _FixedSizeListIterator **************
$inherits(_FixedSizeListIterator, _VariableSizeListIterator);
function _FixedSizeListIterator() {}
_FixedSizeListIterator.prototype.hasNext = function() {
  return this._html_length > this._html_pos;
}
// ********** Code for _VariableSizeListIterator_dart_core_String **************
$inherits(_VariableSizeListIterator_dart_core_String, _VariableSizeListIterator);
function _VariableSizeListIterator_dart_core_String(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_dart_core_String **************
$inherits(_FixedSizeListIterator_dart_core_String, _FixedSizeListIterator);
function _FixedSizeListIterator_dart_core_String(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_dart_core_String.call(this, array);
}
// ********** Code for _VariableSizeListIterator_int **************
$inherits(_VariableSizeListIterator_int, _VariableSizeListIterator);
function _VariableSizeListIterator_int(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_int **************
$inherits(_FixedSizeListIterator_int, _FixedSizeListIterator);
function _FixedSizeListIterator_int(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_int.call(this, array);
}
// ********** Code for _VariableSizeListIterator_num **************
$inherits(_VariableSizeListIterator_num, _VariableSizeListIterator);
function _VariableSizeListIterator_num(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_num **************
$inherits(_FixedSizeListIterator_num, _FixedSizeListIterator);
function _FixedSizeListIterator_num(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_num.call(this, array);
}
// ********** Code for _VariableSizeListIterator_html_Node **************
$inherits(_VariableSizeListIterator_html_Node, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Node(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_html_Node **************
$inherits(_FixedSizeListIterator_html_Node, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Node(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Node.call(this, array);
}
// ********** Code for _VariableSizeListIterator_html_StyleSheet **************
$inherits(_VariableSizeListIterator_html_StyleSheet, _VariableSizeListIterator);
function _VariableSizeListIterator_html_StyleSheet(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_html_StyleSheet **************
$inherits(_FixedSizeListIterator_html_StyleSheet, _FixedSizeListIterator);
function _FixedSizeListIterator_html_StyleSheet(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_StyleSheet.call(this, array);
}
// ********** Code for _VariableSizeListIterator_html_Touch **************
$inherits(_VariableSizeListIterator_html_Touch, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Touch(array) {
  this._html_array = array;
  this._html_pos = (0);
}
// ********** Code for _FixedSizeListIterator_html_Touch **************
$inherits(_FixedSizeListIterator_html_Touch, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Touch(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Touch.call(this, array);
}
// ********** Code for _Lists **************
function _Lists() {}
_Lists.getRange = function(a, start, length, accumulator) {
  if (length < (0)) $throw(new IllegalArgumentException("length"));
  if (start < (0)) $throw(new IndexOutOfRangeException(start));
  var end = start + length;
  if (end > a.get$length()) $throw(new IndexOutOfRangeException(end));
  for (var i = start;
   i < end; i++) {
    accumulator.add(a.$index(i));
  }
  return accumulator;
}
// ********** Code for top level **************
var _cachedWindow;
var _cachedDocument;
function _init() {
  $globals._cachedDocument = get$$_document();
  $globals._cachedWindow = get$$_window();
  var element = _ElementFactoryProvider.Element$tag$factory("body");
  element.set$innerHTML("f");
  if (element.get$text() == "") {
    $globals._cachedWindow.console.error("Cannot import dart:html and dart:dom within the same application.");
    $throw(new UnsupportedOperationException("Cannot import dart:html and dart:dom within the same application."));
  }
}
function get$$window() {
  if ($globals._cachedWindow == null) {
    _init();
  }
  return $globals._cachedWindow;
}
function get$$_window() {
  return window;
}
function get$$document() {
  if ($globals._cachedDocument == null) {
    _init();
  }
  return $globals._cachedDocument;
}
function get$$_document() {
  return window.document.documentElement;
}
var _cachedBrowserPrefix;
function _FixHtmlDocumentReference(eventTarget) {
  if (!!(eventTarget && eventTarget.is$_SecretHtmlDocumentImpl())) {
    var secretDocument = eventTarget;
    return secretDocument.get$_documentElement();
  }
  else {
    return eventTarget;
  }
}
var _pendingRequests;
var _pendingMeasurementFrameCallbacks;
//  ********** Library json **************
// ********** Code for _JSON **************
_JSON = JSON;
// ********** Code for json_JSON **************
function json_JSON() {}
json_JSON.parse = function(str) {
  return _JSON.parse(str, (function (_, obj) {
    var keys = _jsKeys(obj);
    if ($eq$(keys)) return obj;
    var map = new HashMapImplementation();
    for (var $$i = keys.iterator(); $$i.hasNext(); ) {
      var key = $$i.next();
      map.$setindex(key, _getValue(obj, key));
    }
    return map;
  })
  );
}
json_JSON.stringify = function(value) {
  return _JSON.stringify(value, (function (_, obj) {
    if (_directToJson(obj)) return obj;
    if (!!(obj && obj.is$Map_dart_core_String$Dynamic())) {
      var map = obj;
      obj = new Object();
      map.forEach((function (k, v) {
        return _setValue(obj, k, v);
      })
      );
      return obj;
    }
    $throw(new IllegalArgumentException(("cannot convert \"" + value + "\" to JSON")));
  })
  );
}
// ********** Code for top level **************
function _getValue(obj, key) {
  return obj[key]
}
function _setValue(obj, key, value) {
  obj[key] = value
}
function _directToJson(obj) {
  return typeof obj != 'object' || obj == null || obj instanceof Array
}
function _jsKeys(obj) {
  if (obj != null && typeof obj == 'object' && !(obj instanceof Array)) {
  return Object.keys(obj);
  }
  return null;
}
//  ********** Library ScuttlebuttUI **************
// ********** Code for Table **************
function Table(domQuery) {
  this.tableElement = get$$document().query(domQuery);
}
Table.prototype.addRow = function(row) {
  var tr = _ElementFactoryProvider.Element$tag$factory("tr");
  row.forEach((function (column) {
    var td = _ElementFactoryProvider.Element$tag$factory("td");
    if ($ne$(column)) {
      td.set$innerHTML(column);
    }
    else {
      td.set$innerHTML("N/A");
    }
    tr.get$elements().add(td);
  })
  );
  this.tableElement.get$elements().add(tr);
  return tr;
}
Table.prototype.addData = function(data) {
  for (var $$i = data.iterator(); $$i.hasNext(); ) {
    var record = $$i.next();
    this.addRow([record.$index("title"), ScuttlebuttUi.prettifyUrl(record.$index("url")), ScuttlebuttUi.prettifyDate(record.$index("updated")), record.containsKey("readership") ? ScuttlebuttUi.prettifyInt(Math.parseInt(record.$index("readership"))) : "N/A"]);
  }
}
Table.prototype.reset = function(resetAllNodes) {
  if (resetAllNodes) {
    this.tableElement.get$nodes().clear();
  }
  else {
    var $$list = this.tableElement.queryAll("tr:not(.header)");
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var tr = $$i.next();
      tr.remove();
    }
  }
}
// ********** Code for TopicStatsDay **************
function TopicStatsDay(jsonData) {
  if (!jsonData.containsKey("date") || !jsonData.containsKey("count")) {
    $throw(new ExceptionImplementation("JSON data corrupt. Couldn't find keys."));
  }
  this.count = jsonData.$index("count");
  this.date = ScuttlebuttUi.dateFromString(jsonData.$index("date"));
}
TopicStatsDay.prototype.get$date = function() { return this.date; };
TopicStatsDay.prototype.get$count = function() { return this.count; };
TopicStatsDay.prototype.get$wowChange = function() { return this.wowChange; };
TopicStatsDay.prototype.get$td = function() { return this.td; };
TopicStatsDay.prototype.set$td = function(value) { return this.td = value; };
TopicStatsDay.prototype.compareTo = function(other) {
  return this.date.compareTo(other.date);
}
// ********** Code for TopicStats **************
function TopicStats(jsonData) {
  var $this = this; // closure support
  this.maxCount = (0);
  this.days = new Array();
  jsonData.forEach((function (jsonRecord) {
    $this.days.add(new TopicStatsDay(jsonRecord));
  })
  );
  this.days.sort((function (a, b) {
    return -a.compareTo(b);
  })
  );
  var absCount = (0);
  for (var i = this.days.get$length() - (1);
   i >= (0); i--) {
    var curr = this.days.$index(i);
    this.maxCount = Math.max(this.maxCount, curr.count);
    absCount += curr.count;
    if (i == this.days.get$length() - (1)) continue;
    var prev = this.days.$index(i + (1));
    if (prev.count == (0)) {
      if (curr.count > (0)) curr.wowChange = (1000000001.0);
      else curr.wowChange = (0.0);
    }
    else {
      curr.wowChange = (curr.count / prev.count) - (1.0);
    }
  }
  this.avgCount = absCount / this.days.get$length();
}
TopicStats.prototype.get$days = function() { return this.days; };
// ********** Code for BarChart **************
function BarChart(domQuery, articlesUiView_, countEl, countWowEl, sentimentEl, sentimentWowEl, fromEl, toEl) {
  var $this = this; // closure support
  this.MAX_DAYS = (90);
  this.topicStatsCache = new HashMapImplementation_int$TopicStats();
  this.tableElement = get$$document().query(domQuery);
  this.articlesUiView = articlesUiView_;
  this._articlesCountElement = get$$document().query(countEl);
  this._articlesCountWowElement = get$$document().query(countWowEl);
  this._articlesSentimentElement = get$$document().query(sentimentEl);
  this._articlesSentimentWowElement = get$$document().query(sentimentWowEl);
  this.articlesFromElement = get$$document().query(fromEl);
  this.articlesToElement = get$$document().query(toEl);
  this.articlesFromElement.get$on().get$blur().add((function (ev) {
    $this.articlesUiView.fromDate = ScuttlebuttUi.dateFromString($this.articlesFromElement.value);
    $this.articlesUiView.fetchData().then((function (done) {
      return $this.articlesUiView.populateTable(true);
    })
    );
  })
  , false);
  this.articlesToElement.get$on().get$blur().add((function (ev) {
    $this.articlesUiView.toDate = ScuttlebuttUi.dateFromString($this.articlesToElement.value);
    $this.articlesUiView.fetchData().then((function (done) {
      return $this.articlesUiView.populateTable(true);
    })
    );
  })
  , false);
}
BarChart.prototype.getURL = function(id) {
  if ($globals.DEBUG) {
    return "/api/get_topic_stats_new_mock.json";
  }
  else {
    return ("/api/topic_stats/" + id);
  }
}
BarChart.prototype.show = function(id) {
  var $this = this; // closure support
  this.currentId = id;
  if (this.topicStatsCache.containsKey(id)) {
    this.populateChart(id);
  }
  else {
    this.fetchData(id).then((function (done) {
      return $this.populateChart();
    })
    );
    ;
  }
}
BarChart.prototype.populateChart = function(id_) {
  var $this = this; // closure support
  var id = (id_ != null) ? id_ : this.currentId;
  var topicStats = this.topicStatsCache.$index(id);
  this.reset();
  if (topicStats.days.get$length() == (0)) return;
  var tr = _ElementFactoryProvider.Element$tag$factory("tr");
  for (var i = this.MAX_DAYS - (1);
   $gte$(i, (0)); i = $sub$(i, (1))) {
    var td = _ElementFactoryProvider.Element$tag$factory("td");
    var div = _ElementFactoryProvider.Element$tag$factory("div");
    var percentage = null;
    if ($lt$(i, topicStats.days.get$length())) {
      topicStats.days.$index(i).set$td(td);
      percentage = ($div$(topicStats.days.$index(i).get$count(), topicStats.maxCount) * (100)).toInt();
      div.get$classes().add("blue-bar");
      td.get$classes().add("data-available");
    }
    else {
      percentage = (Math.random() * topicStats.avgCount / topicStats.maxCount * (75)).toInt();
      div.get$classes().add("gray-bar");
    }
    div.get$style().set$height(("" + percentage + "%"));
    td.get$elements().add(div);
    tr.get$elements().add(td);
    td.set$dataAttributes(_map(["i", i]));
    td.get$on().get$mouseOver().add((function (e) {
      var el = e.get$currentTarget();
      if (el.get$dataAttributes().containsKey("i")) {
        var i_ = Math.parseInt(el.get$dataAttributes().$index("i"));
        if (i_ > topicStats.days.get$length() - (1)) {
          $this.updateContextual("no data", "N/A", "N/A", "N/A");
        }
        else {
          var countWow;
          if (topicStats.days.$index(i_).get$wowChange() != null) {
            if (topicStats.days.$index(i_).get$wowChange() > (1000000000)) countWow = "+&#8734;%";
            else countWow = ("" + (topicStats.days.$index(i_).get$wowChange() >= (0.0) ? "+" : "-") + (topicStats.days.$index(i_).get$wowChange().abs() * (100)).toInt() + "%");
            if ($this._startDragI != null) {
              var min = Math.min($this._startDragI, i_);
              var max = Math.max($this._startDragI, i_);
              for (var j = (0);
               j < Math.min(topicStats.days.get$length(), $this.MAX_DAYS); j++) {
                topicStats.days.$index(j).get$td().get$classes().remove("selected");
                if (j >= min && j <= max) topicStats.days.$index(j).get$td().get$classes().add("selected");
              }
            }
          }
          $this.updateContextual(topicStats.days.$index(i_).get$count().toString(), countWow, "N/A", "N/A");
        }
      }
    })
    , false);
    td.get$on().get$mouseDown().add((function (e) {
      var el = e.get$currentTarget();
      if (el.get$dataAttributes().containsKey("i")) {
        var i_ = Math.parseInt(el.get$dataAttributes().$index("i"));
        if (i_ < topicStats.days.get$length()) {
          $this._startDragI = i_;
        }
      }
      e.stopPropagation();
      e.preventDefault();
    })
    , false);
    td.get$on().get$mouseUp().add((function (e) {
      var $0;
      var el = e.get$currentTarget();
      if (el.get$dataAttributes().containsKey("i")) {
        var i_ = Math.parseInt(el.get$dataAttributes().$index("i"));
        if (i_ < topicStats.days.get$length()) {
          $this._endDragI = i_;
          if ($this._startDragI == null) $this._startDragI = i_;
          $this.articlesUiView.fromDate = topicStats.days.$index(Math.max($this._startDragI, $this._endDragI)).get$date();
          $this.articlesUiView.toDate = topicStats.days.$index(Math.min($this._startDragI, $this._endDragI)).get$date();
          $this.articlesUiView.fetchData().then((function (done) {
            return $this.articlesUiView.populateTable(true);
          })
          );
          $this.updateDateRange();
          $this._startDragI = ($this._endDragI = ($0 = null), $0);
        }
      }
      e.stopPropagation();
      e.preventDefault();
    })
    , false);
  }
  this.tableElement.get$elements().add(tr);
  this.tableElement.get$on().get$mouseOut().add((function (e) {
    var el = e.toElement;
    if (!$this.tableElement.contains(el)) {
      $this.updateContextual("N/A", "N/A", "N/A", "N/A");
      $this._startDragI = null;
    }
  })
  , false);
  this.updateDateRange();
}
BarChart.prototype.updateContextual = function(count, countWow, sentiment, sentimentWow) {
  this._articlesCountElement.set$innerHTML(count);
  this._articlesCountWowElement.set$innerHTML(countWow);
}
BarChart.prototype.updateDateRange = function() {
  var $this = this; // closure support
  this.articlesFromElement.value = this.articlesUiView.get$fromDateShort();
  this.articlesToElement.value = this.articlesUiView.get$toDateShort();
  var topicStats = this.topicStatsCache.$index(this.currentId);
  if (topicStats != null && !topicStats.days.isEmpty()) {
    print$(("Updating date range: " + this.articlesUiView.fromDate + " to " + this.articlesUiView.toDate));
    topicStats.days.forEach((function (day) {
      if (day.td != null) {
        day.td.get$classes().remove("selected");
        if (day.date.difference($this.articlesUiView.fromDate).get$inDays() >= (0) && day.date.difference($this.articlesUiView.toDate).get$inDays() <= (0)) day.td.get$classes().add("selected");
      }
    })
    );
  }
}
BarChart.prototype.fetchData = function(id, url_) {
  var $this = this; // closure support
  var completer = new CompleterImpl();
  var url = (url_ == null) ? this.getURL(id) : url_;
  var request = _XMLHttpRequestFactoryProvider.XMLHttpRequest$factory();
  request.open("GET", url, true);
  request.get$on().get$load().add((function (event) {
    if (request.status == (404)) {
      get$$window().console.error(("TOFIX: Could not retrieve " + url + ". Maybe stats are not implemented yet?"));
      print$("Trying to load mock data.");
      $this.fetchData(id, "https://scuttlebutt.googleplex.com/ui/api/get_topic_stats_new_mock.json").then((function (done) {
        return $this.populateChart();
      })
      );
      ;
    }
    else {
      $this.topicStatsCache.$setindex(id, new TopicStats(json_JSON.parse(request.responseText)));
      print$(("" + $this.topicStatsCache.$index(id).get$days().get$length() + " new stats loaded for the bar chart."));
      completer.complete(true);
    }
  })
  , false);
  request.send();
  return completer.get$future();
}
BarChart.prototype.reset = function() {
  this.tableElement.get$nodes().clear();
}
// ********** Code for UiView **************
function UiView() {

}
UiView.prototype.set$visibility = function(value) {
  if ($eq$(value, true)) {
    this.divElement.get$style().set$display("block");
    this.mainButton.get$classes().add("selected");
  }
  else {
    this.divElement.get$style().set$display("none");
    this.mainButton.get$classes().remove("selected");
  }
}
UiView.prototype.sendXhr = function(url, method, params, debugUrl) {
  var $this = this; // closure support
  if (params != null && params.get$length() > (0)) {
    if (method == "GET") {
      var strBuf = new StringBufferImpl("");
      strBuf.add(url);
      var first = true;
      params.forEach((function (key, value) {
        if (first) {
          strBuf.add("?");
          first = false;
        }
        else strBuf.add("&");
        strBuf.add(key);
        strBuf.add("=");
        strBuf.add(value.toString());
      })
      );
      url = strBuf.toString();
    }
  }
  var completer = new CompleterImpl();
  var request = _XMLHttpRequestFactoryProvider.XMLHttpRequest$factory();
  if ($globals.DEBUG) request.open("GET", debugUrl, true);
  else request.open(method, url, true);
  request.get$on().get$load().add((function (event) {
    if (request.status != (200)) {
      $this.scuttlebuttUi.statusMessage("Server error!");
      completer.completeException(new ExceptionImplementation(("Server returned status code " + request.status + " (" + request.statusText + ")")));
    }
    completer.complete(request.responseText);
  })
  , false);
  if (method == "GET") request.send();
  else request.send(json_JSON.stringify(params));
  return completer.get$future();
}
// ********** Code for ArticlesUiView **************
$inherits(ArticlesUiView, UiView);
function ArticlesUiView() {
  var $this = this; // closure support
  UiView.call(this);
  this.baseUrl = "/api/articles";
  this.data = new HashMapImplementation();
  this.barChart = new BarChart("table#articles-stats", this, "#articles-count", "#articles-count-wow", "#articles-sentiment", "#articles-sentiment-wow", "#articles-from", "#articles-to");
  this.divElement = get$$document().query("div#articles-div");
  this.mainButton = get$$document().query("button#articles-button");
  this.outputTable = new Table("table#articles-table");
  this._loadMoreButton = get$$document().query("button#load-more-button");
  this._waitingToBeShown = (0);
  this.currentLimit = (20);
  this._loadMoreButton.get$on().get$click().add$1((function (event) {
    $this.currentOffset = $this.currentOffset + (20);
    $this.fetchData().then((function (done) {
      $this.populateTable(false);
    })
    );
  })
  );
}
ArticlesUiView.prototype.get$fromDateIso = function() {
  return ("" + this.fromDate.get$year() + "-" + (this.fromDate.get$month() < (10) ? "0" : "") + this.fromDate.get$month() + "-" + (this.fromDate.get$day() < (10) ? "0" : "") + this.fromDate.get$day() + "T" + (this.fromDate.get$hours() < (10) ? "0" : "") + this.fromDate.get$hours() + ":" + (this.fromDate.get$minutes() < (10) ? "0" : "") + this.fromDate.get$minutes() + ":" + (this.fromDate.get$seconds() < (10) ? "0" : "") + this.fromDate.get$seconds());
}
ArticlesUiView.prototype.get$toDateIso = function() {
  return ("" + this.toDate.get$year() + "-" + (this.toDate.get$month() < (10) ? "0" : "") + this.toDate.get$month() + "-" + (this.toDate.get$day() < (10) ? "0" : "") + this.toDate.get$day() + "T" + (this.toDate.get$hours() < (10) ? "0" : "") + this.toDate.get$hours() + ":" + (this.toDate.get$minutes() < (10) ? "0" : "") + this.toDate.get$minutes() + ":" + (this.toDate.get$seconds() < (10) ? "0" : "") + this.toDate.get$seconds());
}
ArticlesUiView.prototype.get$fromDateShort = function() {
  return this.get$fromDateIso().substring((0), (10));
}
ArticlesUiView.prototype.get$toDateShort = function() {
  return this.get$toDateIso().substring((0), (10));
}
ArticlesUiView.prototype.show = function(id) {
  var $this = this; // closure support
  this.currentId = id;
  this.currentOffset = (0);
  this.fromDate = new DateImplementation.now$ctor().subtract(new DurationImplementation((7), (0), (0), (0), (0)));
  this.toDate = new DateImplementation.now$ctor();
  if (this.data.containsKey(id)) {
    this._waitingToBeShown = this.data.$index(id).get$length();
    this.populateTable(true);
  }
  else {
    this.fetchData().then((function (done) {
      return $this.populateTable(true);
    })
    );
  }
  this.barChart.show(id);
}
ArticlesUiView.prototype.actOnData = function(responseText) {
  if (this.currentOffset == (0)) this.data.$setindex(this.currentId, new Array());
  var responseJson = json_JSON.parse(responseText);
  this._waitingToBeShown = responseJson.get$length();
  if (this._waitingToBeShown > (0)) {
    this.data.$index(this.currentId).addAll(responseJson);
    print$(("" + responseJson.get$length() + " new articles loaded."));
  }
}
ArticlesUiView.prototype.populateTable = function(reset) {
  var id = this.currentId;
  if (reset) this.outputTable.reset(false);
  if (this._waitingToBeShown > (0)) {
    this.outputTable.addData(this.data.$index(id).getRange(this.data.$index(id).get$length() - this._waitingToBeShown, this._waitingToBeShown));
    this._waitingToBeShown = (0);
  }
  else if (this.currentOffset == (0)) {
    this.outputTable.addRow(["No articles", "", "", ""]);
  }
  this.set$visibility(true);
  this.barChart.updateDateRange();
}
ArticlesUiView.prototype.fetchData = function() {
  var $this = this; // closure support
  var completer = new CompleterImpl();
  this.sendXhr(("" + this.baseUrl + "/" + this.currentId), "GET", _map(["from", this.get$fromDateShort(), "to", this.get$toDateShort(), "offset", this.currentOffset, "limit", this.currentLimit]), "/api/get_articles_mock.json").then((function (responseText) {
    $this.actOnData(responseText);
    completer.complete(true);
  })
  );
  return completer.get$future();
}
ArticlesUiView.prototype.refresh = function() {
  this.data = new HashMapImplementation();
}
// ********** Code for Topic **************
function Topic(jsonData) {
  if (!jsonData.containsKey("id") || !jsonData.containsKey("name")) {
    $throw(new ExceptionImplementation("JSON data corrupt. Couldn't find 'id' or 'name'."));
  }
  this.id = jsonData.$index("id");
  this.name = jsonData.$index("name");
  this.searchTerm = jsonData.$index("searchTerm");
  this.countPastTwentyFourHours = jsonData.$index("countPastTwentyFourHours");
  this.countPastSevenDays = jsonData.$index("countPastSevenDays");
  this.weekOnWeekChange = jsonData.$index("weekOnWeekChange");
}
Topic.prototype.get$name = function() { return this.name; };
// ********** Code for TopicsUiView **************
$inherits(TopicsUiView, UiView);
function TopicsUiView() {
  UiView.call(this);
  this.baseUrl = "/api/topics";
  this._createButton = get$$document().query("#add-topic-button");
  this.divElement = get$$document().query("div#topics-div");
  this.mainButton = get$$document().query("button#topics-button");
  this.outputTable = new Table("table#topics-table");
  this._createButton.get$on().get$click().add$1(this.get$showCreateRow());
}
TopicsUiView.prototype.showCreateRow = function(e) {
  var $this = this; // closure support
  if (this.outputTable == null) $throw(new ExceptionImplementation("Couldn't find outputTable."));
  if (this._createRow == null) {
    this._createRow = this.outputTable.tableElement.insertRow((1));
    var nameCell = this._createRow.insertCell((0));
    this._nameInput = _ElementFactoryProvider.Element$tag$factory("input");
    this._nameInput.type = "text";
    nameCell.get$elements().add(this._nameInput);
    this._nameInput.focus();
    this._nameInput.get$on().get$keyPress().add((function (ev) {
      if (ev.get$dynamic().get$charCode() == (13)) $this.postNew(ev);
    })
    , false);
    var buttonCell = this._createRow.insertCell((1));
    buttonCell.colSpan = (3);
    var createButton = _ElementFactoryProvider.Element$tag$factory("button");
    createButton.set$text("Create");
    buttonCell.get$elements().add(createButton);
    createButton.get$on().get$click().add$1(this.get$postNew());
    var discardButton = _ElementFactoryProvider.Element$tag$factory("button");
    discardButton.set$text("Discard");
    buttonCell.get$elements().add(discardButton);
    discardButton.get$on().get$click().add$1((function (ev) {
      $this._createRow.remove();
      $this._createRow = null;
    })
    );
  }
}
TopicsUiView.prototype.get$showCreateRow = function() {
  return this.showCreateRow.bind(this);
}
TopicsUiView.prototype.postNew = function(e) {
  var $this = this; // closure support
  if (this._nameInput.value == "") return;
  print$("Posting new record.");
  this.sendXhr(this.baseUrl, "POST", _map(["name", this._nameInput.value]), "/api/post_topics_mock.json").then((function (responseText) {
    $this._createRow.remove();
    $this._createRow = null;
    $this.topics = null;
    $this.scuttlebuttUi.parseUrl();
  })
  );
}
TopicsUiView.prototype.get$postNew = function() {
  return this.postNew.bind(this);
}
TopicsUiView.prototype.show = function() {
  var $this = this; // closure support
  if (this.topics != null) {
    this.populateTable(true);
  }
  else {
    this.fetchData().then((function (done) {
      return $this.populateTable(true);
    })
    );
  }
}
TopicsUiView.prototype.populateTable = function(reset) {
  var $this = this; // closure support
  if (reset) this.outputTable.reset(false);
  var $$list = this.topics;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var topic = $$i.next();
    var topicNameHtml = ("" + topic.name + " <a class='more-actions'>&hellip;</a>");
    var wowChangeHtml = null;
    if (topic.weekOnWeekChange != null) {
      var changeStr = null;
      var changeSign = null;
      if (topic.weekOnWeekChange > (1000000000)) {
        changeStr = "&#8734;";
        changeSign = "+";
      }
      else {
        changeStr = ((topic.weekOnWeekChange) * (100.0)).abs().round().toString();
        changeSign = (topic.weekOnWeekChange >= (0.0)) ? "+" : "-";
      }
      wowChangeHtml = ("<span class=\"" + (changeSign == "+" ? "green" : "red") + "\">" + changeSign + changeStr + "%</span>");
    }
    var tr = this.outputTable.addRow([topicNameHtml, topic.countPastTwentyFourHours, topic.countPastSevenDays, wowChangeHtml]);
    tr.get$on().get$click().add$1((function (topic, event) {
      $this.scuttlebuttUi.listArticles(topic.id, true);
    }).bind(null, topic)
    );
  }
  ;
  this.set$visibility(true);
}
TopicsUiView.prototype.fetchData = function() {
  var $this = this; // closure support
  var completer = new CompleterImpl();
  this.sendXhr(this.baseUrl, "GET", null, "/api/get_topics_mock.json").then((function (responseText) {
    $this.actOnData(responseText);
    completer.complete(true);
  })
  );
  return completer.get$future();
}
TopicsUiView.prototype.actOnData = function(responseText) {
  var data = json_JSON.parse(responseText);
  this.topics = new Array();
  for (var $$i = data.iterator(); $$i.hasNext(); ) {
    var record = $$i.next();
    this.topics.add(new Topic(record));
  }
  print$("Topics loaded successfully.");
}
TopicsUiView.prototype.refresh = function() {
  this.fetchData();
}
TopicsUiView.prototype.getName = function(id) {
  if (this.topics != null) {
    var $$list = this.topics;
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var topic = $$i.next();
      if (topic.id == id) {
        return topic.name;
      }
    }
  }
  else {
    return null;
  }
}
// ********** Code for Source **************
function Source(jsonData) {
  if (!jsonData.containsKey("id") || !jsonData.containsKey("name") || !jsonData.containsKey("url")) {
    $throw(new ExceptionImplementation("JSON data corrupt. Couldn't find 'id' or 'name' or 'url'."));
  }
  this.id = jsonData.$index("id");
  this.name = jsonData.$index("name");
  this.url = jsonData.$index("url");
  this.monthlyVisitors = jsonData.$index("monthlyVisitors");
}
Source.prototype.get$name = function() { return this.name; };
// ********** Code for SourcesUiView **************
$inherits(SourcesUiView, UiView);
function SourcesUiView() {
  UiView.call(this);
  this.baseUrl = "/api/sources";
  this._createButton = get$$document().query("#add-source-button");
  this.divElement = get$$document().query("div#sources-div");
  this.mainButton = get$$document().query("button#sources-button");
  this.outputTable = new Table("table#sources-table");
  this._createButton.get$on().get$click().add$1(this.get$showCreateRow());
}
SourcesUiView.prototype.showCreateRow = function(e) {
  var $this = this; // closure support
  if (this.outputTable == null) $throw(new ExceptionImplementation("Couldn't find outputTable."));
  if (this._createRow == null) {
    this._createRow = this.outputTable.tableElement.insertRow((1));
    var nameCell = this._createRow.insertCell((0));
    this._nameInput = _ElementFactoryProvider.Element$tag$factory("input");
    this._nameInput.type = "text";
    nameCell.get$elements().add(this._nameInput);
    this._nameInput.focus();
    var urlCell = this._createRow.insertCell((1));
    this._urlInput = _ElementFactoryProvider.Element$tag$factory("input");
    this._urlInput.type = "text";
    urlCell.get$elements().add(this._urlInput);
    var visitorsCell = this._createRow.insertCell((2));
    this._visitorsInput = _ElementFactoryProvider.Element$tag$factory("input");
    this._visitorsInput.type = "text";
    visitorsCell.get$elements().add(this._visitorsInput);
    this._nameInput.get$on().get$keyPress().add((function (ev) {
      if (ev.get$dynamic().get$charCode() == (13)) $this._urlInput.focus();
    })
    , false);
    this._urlInput.get$on().get$keyPress().add((function (ev) {
      if (ev.get$dynamic().get$charCode() == (13)) $this._visitorsInput.focus();
    })
    , false);
    this._visitorsInput.get$on().get$keyPress().add((function (ev) {
      if (ev.get$dynamic().get$charCode() == (13)) $this.postNew(ev);
    })
    , false);
    var buttonCell = this._createRow.insertCell((3));
    buttonCell.colSpan = (3);
    var createButton = _ElementFactoryProvider.Element$tag$factory("button");
    createButton.set$text("Create");
    buttonCell.get$elements().add(createButton);
    createButton.get$on().get$click().add$1(this.get$postNew());
    var discardButton = _ElementFactoryProvider.Element$tag$factory("button");
    discardButton.set$text("Discard");
    buttonCell.get$elements().add(discardButton);
    discardButton.get$on().get$click().add$1((function (ev) {
      $this._createRow.remove();
      $this._createRow = null;
    })
    );
  }
}
SourcesUiView.prototype.get$showCreateRow = function() {
  return this.showCreateRow.bind(this);
}
SourcesUiView.prototype.postNew = function(e) {
  var $this = this; // closure support
  if (this._nameInput.value == "" || this._urlInput.value == "") return;
  print$("Posting new record.");
  this.sendXhr(this.baseUrl, "POST", _map(["name", this._nameInput.value, "url", this._urlInput.value, "monthlyVisitors", this._visitorsInput.value]), "/api/post_sources_mock.json").then((function (responseText) {
    $this._createRow.remove();
    $this._createRow = null;
    $this.sources = null;
    $this.scuttlebuttUi.parseUrl();
  })
  );
}
SourcesUiView.prototype.get$postNew = function() {
  return this.postNew.bind(this);
}
SourcesUiView.prototype.show = function() {
  var $this = this; // closure support
  if (this.sources != null) {
    this.populateTable(true);
  }
  else {
    this.fetchData().then((function (done) {
      return $this.populateTable(true);
    })
    );
  }
}
SourcesUiView.prototype.populateTable = function(reset) {
  if (reset) this.outputTable.reset(false);
  var $$list = this.sources;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var source = $$i.next();
    var sourceNameHtml = ("" + source.name + " <a class='more-actions'>&hellip;</a>");
    var tr = this.outputTable.addRow([sourceNameHtml, ScuttlebuttUi.prettifyUrl(source.url), ScuttlebuttUi.prettifyInt(source.monthlyVisitors), "N/A"]);
  }
  ;
  this.set$visibility(true);
}
SourcesUiView.prototype.fetchData = function() {
  var $this = this; // closure support
  var completer = new CompleterImpl();
  this.sendXhr(this.baseUrl, "GET", null, "/api/get_sources_mock.json").then((function (responseText) {
    $this.actOnData(responseText);
    completer.complete(true);
  })
  );
  return completer.get$future();
}
SourcesUiView.prototype.actOnData = function(responseText) {
  var data = json_JSON.parse(responseText);
  this.sources = new Array();
  for (var $$i = data.iterator(); $$i.hasNext(); ) {
    var record = $$i.next();
    this.sources.add(new Source(record));
  }
  print$("Sources loaded successfully.");
}
// ********** Code for ScuttlebuttUi **************
function ScuttlebuttUi() {

}
ScuttlebuttUi.prototype.run = function() {
  var $this = this; // closure support
  var $0, $1;
  this.articlesUiView = new ArticlesUiView();
  this.topicsUiView = new TopicsUiView();
  this.sourcesUiView = new SourcesUiView();
  this.articlesUiView.scuttlebuttUi = (this.topicsUiView.scuttlebuttUi = ($1 = (this.sourcesUiView.scuttlebuttUi = ($0 = this), $0)), $1);
  this._statusMessage = get$$document().query("#status");
  this._subtitle = get$$document().query("h1 span#subtitle");
  this._topicsButton = get$$document().query("#topics-button");
  this._sourcesButton = get$$document().query("#sources-button");
  this._articlesButton = get$$document().query("#articles-button");
  this._refreshButton = get$$document().query("#refresh-button");
  this.statusMessage("Dart is now running.");
  this._topicsButton.get$on().get$click().add$1((function (event) {
    $this.listTopics(true);
  })
  );
  this._sourcesButton.get$on().get$click().add$1((function (event) {
    $this.listSources(true);
  })
  );
  this._refreshButton.get$on().get$click().add$1((function (event) {
    $this.articlesUiView.refresh();
    $this.topicsUiView.refresh();
    $this.parseUrl();
  })
  );
  var landingUrl = get$$window().location.href;
  $globals.DEBUG = landingUrl.contains("0.0.0.0") || landingUrl.contains(".prh.corp.google.com:8000/");
  get$$window().get$on().get$popState().add((function (e) {
    print$("On pop state triggered.");
    $this.parseUrl();
  })
  , false);
}
ScuttlebuttUi.prototype.parseUrl = function(url) {
  if (url == null) {
    url = get$$window().location.href;
  }
  if (url.contains("/api/topics")) {
    this.listTopics(false);
    return;
  }
  else if (url.contains("/api/sources")) {
    this.listSources(false);
    return;
  }
  else if (url.contains("/api/articles")) {
    var exp = const$0013;
    var match = exp.firstMatch(url);
    var id = Math.parseInt(match.group((1)));
    this.listArticles(id, false);
    return;
  }
  else {
    this.listTopics(true);
  }
}
ScuttlebuttUi.prototype.listTopics = function(pushState) {
  if (pushState) {
    var state = _map(["url", "#/api/topics"]);
    get$$window().history.pushState(json_JSON.stringify(state), "Topics", "#/api/topics");
  }
  this.articlesUiView.set$visibility(false);
  this.sourcesUiView.set$visibility(false);
  this.topicsUiView.set$visibility(true);
  this.topicsUiView.show();
  this.currentPage = this.topicsUiView;
  this._articlesButton.disabled = true;
  this.setPageTitle();
}
ScuttlebuttUi.prototype.listSources = function(pushState) {
  if (pushState) {
    var state = _map(["url", "#/api/sources"]);
    get$$window().history.pushState(json_JSON.stringify(state), "Sources", "#/api/sources");
  }
  this.articlesUiView.set$visibility(false);
  this.topicsUiView.set$visibility(false);
  this.sourcesUiView.set$visibility(true);
  this.sourcesUiView.show();
  this.currentPage = this.sourcesUiView;
  this._articlesButton.disabled = true;
  this.setPageTitle();
}
ScuttlebuttUi.prototype.listArticles = function(id, pushState) {
  if (pushState) {
    var state = _map(["url", ("#/api/articles/" + id)]);
    get$$window().history.pushState(json_JSON.stringify(state), "Articles", ("#/api/articles/" + id));
  }
  this.topicsUiView.set$visibility(false);
  this.sourcesUiView.set$visibility(false);
  this.articlesUiView.set$visibility(true);
  this.articlesUiView.show(id);
  this.currentPage = this.articlesUiView;
  this.setPageTitle();
}
ScuttlebuttUi.prototype.setPageTitle = function(str) {
  var $this = this; // closure support
  if (str != null) {
    get$$document().set$title(("" + str + " :: Scuttlebutt"));
    this._subtitle.set$innerHTML(str);
  }
  else if ($eq$(this.currentPage, this.topicsUiView)) {
    get$$document().set$title("Scuttlebutt");
    this._subtitle.set$innerHTML("Topics");
  }
  else if ($eq$(this.currentPage, this.sourcesUiView)) {
    get$$document().set$title("Sources :: Scuttlebutt");
    this._subtitle.set$innerHTML("Sources");
  }
  else if ($eq$(this.currentPage, this.articlesUiView)) {
    var topicName = this.topicsUiView.getName(this.articlesUiView.currentId);
    if (topicName != null) {
      get$$document().set$title(("" + topicName + " :: Scuttlebutt"));
      this._subtitle.set$innerHTML(topicName);
    }
    else {
      this.topicsUiView.fetchData().then((function (done) {
        return $this.setPageTitle();
      })
      );
    }
  }
  else {
    $throw(new ExceptionImplementation("Unknown type of page displayed."));
  }
}
ScuttlebuttUi.prototype.statusMessage = function(message) {
  this._statusMessage.set$innerHTML(message);
}
ScuttlebuttUi.prettifyUrl = function(rawUrl) {
  var MAX_URI_LENGTH = (40);
  var urlValidity = const$0007;
  var match = urlValidity.firstMatch(rawUrl);
  if (match == null) {
    return ("<span style='border-bottom: 1px dashed black; cursor:help' title='\"" + rawUrl + "\"'>Invalid URL</span>");
  }
  else {
    var domain = match.group((1));
    var topTwoLevelDomainExp = new JSSyntaxRegExp("[a-zA-Z0-9\\-]+\\.[a-zA-Z]{2,4}$");
    var topTwoLevelDomain = topTwoLevelDomainExp.stringMatch(domain);
    var uri = match.group((2));
    if (uri == null) {
      return ("<a href='" + rawUrl + "'><strong>" + topTwoLevelDomain + "</strong></a>");
    }
    else {
      var uriLength = uri.length;
      if (uriLength > MAX_URI_LENGTH) {
        uri = $add$("/...", uri.substring(uriLength - (MAX_URI_LENGTH - (4)), uriLength));
      }
      return ("<a href='" + rawUrl + "'><strong>" + topTwoLevelDomain + "</strong><br/>" + uri + "</a>");
    }
  }
}
ScuttlebuttUi.dateFromString = function(str) {
  if (str.length == (19)) return DateImplementation.DateImplementation$fromString$factory(("" + str + "Z"));
  else if (str.length == (10)) return DateImplementation.DateImplementation$fromString$factory(str);
  else return DateImplementation.DateImplementation$fromString$factory(str);
}
ScuttlebuttUi.prettifyDate = function(rawDate) {
  var weekdayStrings = const$0009;
  var monthStrings = const$0010;
  var date = ScuttlebuttUi.dateFromString(rawDate);
  var diff = (new DateImplementation.now$ctor()).difference(date);
  var dateStr = ("" + weekdayStrings.$index(date.get$weekday()) + ", " + monthStrings.$index(date.get$month() - (1)) + " " + date.get$day());
  var diffStr;
  if (diff.get$inDays() > (30)) {
    diffStr = "long ago";
  }
  else if (diff.get$inDays() > (1)) {
    diffStr = ("" + diff.get$inDays() + " days ago");
  }
  else if (diff.get$inHours() > (1)) {
    diffStr = ("" + diff.get$inHours() + " hrs ago");
  }
  else if (diff.get$inMinutes() > (1)) {
    diffStr = ("" + diff.get$inMinutes() + " mins ago");
  }
  else {
    diffStr = "just now";
  }
  return ("" + dateStr + "<br/>(<strong>" + diffStr + "</strong>)");
}
ScuttlebuttUi.prettifyInt = function(i) {
  if (i >= (1000000)) {
    return ("<strong>" + (i / (1000000)).toStringAsFixed((1)) + "</strong> M");
  }
  if (i >= (1000)) {
    var kilos = (i / (1000)).round();
    return ("<strong>" + kilos.toStringAsFixed((0)) + "</strong> K");
  }
  i = i - ($mod$(i, (10)));
  return i.toString();
}
// ********** Code for top level **************
function main() {
  new ScuttlebuttUi().run();
}
// 258 dynamic types.
// 307 types
// 25 !leaf
function $dynamicSetMetadata(inputTable) {
  // TODO: Deal with light isolates.
  var table = [];
  for (var i = 0; i < inputTable.length; i++) {
    var tag = inputTable[i][0];
    var tags = inputTable[i][1];
    var map = {};
    var tagNames = tags.split('|');
    for (var j = 0; j < tagNames.length; j++) {
      map[tagNames[j]] = true;
    }
    table.push({tag: tag, tags: tags, map: map});
  }
  $dynamicMetadata = table;
}
(function(){
  var v0/*SVGTextPositioningElement*/ = 'SVGTextPositioningElement|SVGAltGlyphElement|SVGTRefElement|SVGTSpanElement|SVGTextElement';
  var v1/*SVGAnimationElement*/ = 'SVGAnimationElement|SVGAnimateColorElement|SVGAnimateElement|SVGAnimateMotionElement|SVGAnimateTransformElement|SVGSetElement';
  var v2/*SVGComponentTransferFunctionElement*/ = 'SVGComponentTransferFunctionElement|SVGFEFuncAElement|SVGFEFuncBElement|SVGFEFuncGElement|SVGFEFuncRElement';
  var v3/*SVGGradientElement*/ = 'SVGGradientElement|SVGLinearGradientElement|SVGRadialGradientElement';
  var v4/*SVGTextContentElement*/ = [v0/*SVGTextPositioningElement*/,'SVGTextContentElement|SVGTextPathElement'].join('|');
  var v5/*HTMLHtmlElement*/ = 'HTMLHtmlElement|SVGDocument';
  var v6/*HTMLMediaElement*/ = 'HTMLMediaElement|HTMLAudioElement|HTMLVideoElement';
  var v7/*SVGElement*/ = [v1/*SVGAnimationElement*/,v2/*SVGComponentTransferFunctionElement*/,v3/*SVGGradientElement*/,v4/*SVGTextContentElement*/,'SVGElement|SVGAElement|SVGAltGlyphDefElement|SVGAltGlyphItemElement|SVGCircleElement|SVGClipPathElement|SVGCursorElement|SVGDefsElement|SVGDescElement|SVGEllipseElement|SVGFEBlendElement|SVGFEColorMatrixElement|SVGFEComponentTransferElement|SVGFECompositeElement|SVGFEConvolveMatrixElement|SVGFEDiffuseLightingElement|SVGFEDisplacementMapElement|SVGFEDistantLightElement|SVGFEDropShadowElement|SVGFEFloodElement|SVGFEGaussianBlurElement|SVGFEImageElement|SVGFEMergeElement|SVGFEMergeNodeElement|SVGFEMorphologyElement|SVGFEOffsetElement|SVGFEPointLightElement|SVGFESpecularLightingElement|SVGFESpotLightElement|SVGFETileElement|SVGFETurbulenceElement|SVGFilterElement|SVGFontElement|SVGFontFaceElement|SVGFontFaceFormatElement|SVGFontFaceNameElement|SVGFontFaceSrcElement|SVGFontFaceUriElement|SVGForeignObjectElement|SVGGElement|SVGGlyphElement|SVGGlyphRefElement|SVGHKernElement|SVGImageElement|SVGLineElement|SVGMPathElement|SVGMarkerElement|SVGMaskElement|SVGMetadataElement|SVGMissingGlyphElement|SVGPathElement|SVGPatternElement|SVGPolygonElement|SVGPolylineElement|SVGRectElement|SVGSVGElement|SVGScriptElement|SVGStopElement|SVGStyleElement|SVGSwitchElement|SVGSymbolElement|SVGTitleElement|SVGUseElement|SVGVKernElement|SVGViewElement'].join('|');
  var v8/*UIEvent*/ = 'UIEvent|CompositionEvent|KeyboardEvent|MouseEvent|SVGZoomEvent|TextEvent|TouchEvent|WheelEvent';
  var v9/*CharacterData*/ = 'CharacterData|Comment|Text|CDATASection';
  var v10/*DocumentFragment*/ = 'DocumentFragment|ShadowRoot';
  var v11/*Element*/ = [v5/*HTMLHtmlElement*/,v6/*HTMLMediaElement*/,v7/*SVGElement*/,'Element|HTMLElement|HTMLAnchorElement|HTMLAppletElement|HTMLAreaElement|HTMLBRElement|HTMLBaseElement|HTMLBaseFontElement|HTMLBodyElement|HTMLButtonElement|HTMLCanvasElement|HTMLContentElement|HTMLDListElement|HTMLDetailsElement|HTMLDirectoryElement|HTMLDivElement|HTMLEmbedElement|HTMLFieldSetElement|HTMLFontElement|HTMLFormElement|HTMLFrameElement|HTMLFrameSetElement|HTMLHRElement|HTMLHeadElement|HTMLHeadingElement|IntentionallyInvalid|HTMLIFrameElement|HTMLImageElement|HTMLInputElement|HTMLKeygenElement|HTMLLIElement|HTMLLabelElement|HTMLLegendElement|HTMLLinkElement|HTMLMapElement|HTMLMarqueeElement|HTMLMenuElement|HTMLMetaElement|HTMLMeterElement|HTMLModElement|HTMLOListElement|HTMLObjectElement|HTMLOptGroupElement|HTMLOptionElement|HTMLOutputElement|HTMLParagraphElement|HTMLParamElement|HTMLPreElement|HTMLProgressElement|HTMLQuoteElement|HTMLScriptElement|HTMLSelectElement|HTMLShadowElement|HTMLSourceElement|HTMLSpanElement|HTMLStyleElement|HTMLTableCaptionElement|HTMLTableCellElement|HTMLTableColElement|HTMLTableElement|HTMLTableRowElement|HTMLTableSectionElement|HTMLTextAreaElement|HTMLTitleElement|HTMLTrackElement|HTMLUListElement|HTMLUnknownElement'].join('|');
  var v12/*AbstractWorker*/ = 'AbstractWorker|SharedWorker|Worker';
  var v13/*Node*/ = [v9/*CharacterData*/,v10/*DocumentFragment*/,v11/*Element*/,'Node|Attr|HTMLDocument|DocumentType|Entity|EntityReference|Notation|ProcessingInstruction'].join('|');
  var table = [
    // [dynamic-dispatch-tag, tags of classes implementing dynamic-dispatch-tag]
    ['AbstractWorker', v12/*AbstractWorker*/]
    , ['AudioParam', 'AudioParam|AudioGain']
    , ['CSSValueList', 'CSSValueList|WebKitCSSTransformValue']
    , ['CharacterData', v9/*CharacterData*/]
    , ['DOMTokenList', 'DOMTokenList|DOMSettableTokenList']
    , ['HTMLHtmlElement', v5/*HTMLHtmlElement*/]
    , ['DocumentFragment', v10/*DocumentFragment*/]
    , ['HTMLMediaElement', v6/*HTMLMediaElement*/]
    , ['SVGAnimationElement', v1/*SVGAnimationElement*/]
    , ['SVGComponentTransferFunctionElement', v2/*SVGComponentTransferFunctionElement*/]
    , ['SVGGradientElement', v3/*SVGGradientElement*/]
    , ['SVGTextPositioningElement', v0/*SVGTextPositioningElement*/]
    , ['SVGTextContentElement', v4/*SVGTextContentElement*/]
    , ['SVGElement', v7/*SVGElement*/]
    , ['Element', v11/*Element*/]
    , ['Entry', 'Entry|DirectoryEntry|FileEntry']
    , ['EntrySync', 'EntrySync|DirectoryEntrySync|FileEntrySync']
    , ['UIEvent', v8/*UIEvent*/]
    , ['Event', [v8/*UIEvent*/,'Event|WebKitAnimationEvent|AudioProcessingEvent|BeforeLoadEvent|CloseEvent|CustomEvent|DeviceMotionEvent|DeviceOrientationEvent|ErrorEvent|HashChangeEvent|IDBVersionChangeEvent|MediaStreamEvent|MessageEvent|MutationEvent|OfflineAudioCompletionEvent|OverflowEvent|PageTransitionEvent|PopStateEvent|ProgressEvent|XMLHttpRequestProgressEvent|SpeechInputEvent|SpeechRecognitionEvent|StorageEvent|TrackEvent|WebKitTransitionEvent|WebGLContextEvent'].join('|')]
    , ['Node', v13/*Node*/]
    , ['EventTarget', [v12/*AbstractWorker*/,v13/*Node*/,'EventTarget|DOMApplicationCache|EventSource|MessagePort|Notification|SVGElementInstance|WebSocket|DOMWindow|XMLHttpRequest|XMLHttpRequestUpload'].join('|')]
    , ['HTMLCollection', 'HTMLCollection|HTMLOptionsCollection']
    , ['Uint8Array', 'Uint8Array|Uint8ClampedArray']
  ];
  $dynamicSetMetadata(table);
})();
//  ********** Globals **************
function $static_init(){
  $globals.DEBUG = false;
}
var const$0000 = Object.create(_DeletedKeySentinel.prototype, {});
var const$0001 = Object.create(NoMoreElementsException.prototype, {});
var const$0002 = Object.create(EmptyQueueException.prototype, {});
var const$0003 = Object.create(UnsupportedOperationException.prototype, {_message: {"value": "", writeable: false}});
var const$0004 = new JSSyntaxRegExp("^([+-]?\\d?\\d\\d\\d\\d)-?(\\d\\d)-?(\\d\\d)(?:[ T](\\d\\d)(?::?(\\d\\d)(?::?(\\d\\d)(?:.(\\d{1,5}))?)?)? ?([zZ])?)?$");
var const$0005 = Object.create(TimeZoneImplementation.prototype, {isUtc: {"value": true, writeable: false}});
var const$0007 = new JSSyntaxRegExp("^https?\\://([a-zA-Z0-9\\-\\.]+\\.[a-zA-Z]{2,4})(/\\S*)?$");
var const$0008 = Object.create(IllegalAccessException.prototype, {});
var const$0009 = ImmutableList.ImmutableList$from$factory(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
var const$0010 = ImmutableList.ImmutableList$from$factory(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
var const$0011 = _constMap([]);
var const$0012 = Object.create(UnsupportedOperationException.prototype, {_message: {"value": "TODO(jacobr): should we impl?", writeable: false}});
var const$0013 = new JSSyntaxRegExp("articles/([0-9]+)");
var $globals = {};
$static_init();
main();
