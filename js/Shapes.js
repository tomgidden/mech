/* Javascript Shape Library
 * Copyright (C) Tom Gidden, 2007.
 *
 * This code offers a library for handling some simple geometric shapes.
 */

var Circle = function (O, r) {
  this.O = O;
  this.r = r;
};

var Line = function (p, q) {
  this.p = p;
  this.q = q;
  this.pq = q.minus(p);
  this.n = Vector.normal(new Vector(this.pq.y,-this.pq.x));
  this.n50 = this.n.scaled(50);
};

var Polygon = function (vs, preventReverse) {
  // Creates a polygon from the passed array of Vectors (vertices).
  // "preventReverse", if true, keeps the vertex order.  Otherwise, the
  // vertexes are reordered if necessary to a clockwise ordering.

  this.vs = vs;
  this.n = vs.length;
  this.ls = new Array(vs.length);
  this.centroid = new Vector(0, 0);

  var area = 0;

  for(var i=0; i<this.n; i++) {
	var j = (i+1)%this.n;
	var f = vs[i].x*vs[j].y - vs[j].x*vs[i].y;
	area += f;
	this.centroid.x += (vs[i].x+vs[j].x)*f;
	this.centroid.y += (vs[i].y+vs[j].y)*f;
  }

  this.clockwise = area>=0;

  if(!preventReverse && !this.clockwise)
	this.vs.reverse();

  for(var i=0; i<this.n; i++) {
	var j = (i+1)%this.n;
	this.ls[i] = new Line(vs[i], vs[j]);
  }

  this.area = this.clockwise ? (area/2) : (-area/2);
  this.centroid.scale(1/(area*3));
};
