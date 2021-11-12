/* Javascript Miscellaneous Utils
 * Copyright (C) Tom Gidden, 2006.
 */

// A lot of this stuff is taken from the inspired, yet unusable
// prototype.js
function $() {
  var elements = new Array();

  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (typeof element == 'string')
      element = document.getElementById(element);

    if (arguments.length == 1)
      return element;

    elements.push(element);
  }

  return elements;
}

function dumpString (str) {
  $('dump').value += str+"\n";
}

function dumpObject (obj) {
  var str = '[';
  for (var i in obj) {
	str += "'"+i+"':"+obj[i]+",";
  }
  $('dump').value += str.substr(0,str.length-1)+"]\n";
}

/*
// Taken from: http://phrogz.net/JS/Classes/OOPinJS2.html
Function.prototype.extends = function(parent) {
  if(parent.constructor == Function) {
	this.prototype = new parent;
	this.prototype.constructor = this;
	this.prototype.parent = parent.prototype;
  } else {
	this.prototype = parent;
	this.prototype.constructor = this;
	this.prototype.parent = parent;
  }
  return this;
};
*/
