/* Javascript Vector Library
 * Copyright (C) Tom Gidden, 2006.
 */

Math.deg2rad = Math.PI / 180.0;

var Vector = function (x, y) {
  // Object constructor.
  this.x = x;
  this.y = y;
};

Vector.prototype.alert = function () {
  alert(this.x+","+this.y);
};

Vector.clone = function (a) {
  // Clone an object.
  return new Vector(a.x, a.y);
};

Vector.prototype.clone = function () {
  // Clone this object.
  return new Vector(this.x, this.y);
};

Vector.dot = function (a, b) {
  // Returns (a . b), the dot product of vectors 'a' and 'b'
  return a.x * b.x + a.y * b.y;
};

Vector.prototype.dot = function (that) {
  // Returns (this . that), the dot product of vectors 'this' and 'that'
  return this.x*that.x + this.y*that.y;
};

Vector.perpdot = function (a, b) {
  // Returns (ap . b), the perp-dot product of vectors 'a' and 'b'
  return a.x * b.y - a.y * b.x;
};

Vector.prototype.perpdot = function (that) {
  // Returns (thisp . that), the perp-dot product of vectors 'this' and 'that'
  return this.x*that.y - this.y*that.x;
};

Vector.equals = function (a, b) {
  // Returns if 'a' numerically equals 'b'
  return a.x==b.x && a.y==b.y;
};

Vector.prototype.equals = function (that) {
  // Returns if 'this' numerically equals 'that'
  return this.x==that.x && this.y==that.y;
};

Vector.add = function (a, b) {
  // Returns (a + b) as a new vector.
  return new Vector(a.x + b.x, a.y + b.y);
};

Vector.prototype.plus = function (that) {
  // Returns (this + that) as a new vector.
  return new Vector(this.x+that.x, this.y+that.y);
};

Vector.prototype.add = function (that) {
  // Adds 'that' to 'this' and returns modified 'this'.
  this.x += that.x;
  this.y += that.y;
  return this;
};

Vector.sub = function (a, b) {
  // Returns (a - b) as a new vector.
  return new Vector(a.x-b.x, a.y-b.y);
};

Vector.prototype.minus = function (that) {
  // Returns (this - that) as a new vector.
  return new Vector(this.x-that.x, this.y-that.y);
};

Vector.prototype.sub = function (that) {
  // Subtracts 'that' from 'this' and returns modified 'this'.
  this.x -= that.x;
  this.y -= that.y;
  return this;
};

Vector.distance = function (a, b) {
  // Distance between two vectors (points)
  var dx = b.x - a.x;
  var dy = b.y - a.y;
  return Math.sqrt(dx*dx + dy*dy);
};

Vector.prototype.distance = function (that) {
  // Distance between this vector (point) and another.
  var dx = that.x - this.x;
  var dy = that.y - this.y;
  return Math.sqrt(dx*dx + dy*dy);
};

Vector.magnitude2 = function (a) {
  // Squared magnitude of a vector.
  return a.x*a.x + a.y*a.y;
};

Vector.prototype.magnitude2 = function () {
  // Squared magnitude of this vector.
  return this.x * this.x + this.y * this.y;
};

Vector.magnitude = function (a) {
  // Magnitude of a vector.
  return Math.sqrt(a.x * a.x + a.y * a.y);
};

Vector.prototype.magnitude = function () {
  // Magnitude of this vector.
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.scale = function (a, factor) {
  // Returns a copy of "a" scaled by "factor".
  return new Vector(a.x*factor, a.y*factor);
};

Vector.prototype.scaled = function (factor) {
  // Returns a copy of this vector scaled by "factor".
  return new Vector(this.x*factor, this.y*factor);
};

Vector.prototype.scale = function (factor) {
  // Scales this vector, and returns modified "this".
  this.x *= factor;
  this.y *= factor;
  return this;
};

Vector.perpendicular = function (a) {
  // Returns a perpendicular vector to 'a'
  return new Vector(-a.y, a.x);
};

Vector.prototype.perpendicular = function () {
  // Returns a vector perpendicular to this vector
  return new Vector(-this.y, this.x);
};

Vector.normal = function (a) {
  // Returns a normalized (magnitude=1) copy of "a"
  var mag = a.magnitude();
  if(!mag) return a;
  return new Vector(a.x / mag, a.y / mag);
};

Vector.prototype.normal = function () {
  // Returns a normalized (magnitude=1) copy of this vector.
  var mag = this.magnitude();
  if(!mag) return this;
  return new Vector(this.x / mag, this.y / mag);
};

Vector.prototype.normalize = function () {
  // Normalizes (sets magnitude=1) this vector and returns it.
  var mag = this.magnitude();
  if(!mag) return this;

  this.x /= mag;
  this.y /= mag;
  return this;
};
