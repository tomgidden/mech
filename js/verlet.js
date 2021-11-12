/* Javascript Verlet Integration Particle System
 * Copyright (C) Tom Gidden, 2006.
 */


var Particle = function (x, y, mass) {
  this.x = x;
  this.y = y;
  this.ox = x;
  this.oy = y;
  this.m = mass;
};

Particle.prototype.accum = function (model) {
  // Gravity
  this.fx = 0;
  this.fy = model.gravity[1] * this.m;

  // Friction
  var vx = this.x - this.ox;
  var vy = this.y - this.oy;
  this.fx -= vx * model.friction;
  this.fy -= vy * model.friction;
};

Particle.prototype.integrate = function (step) {
  var x = this.x;
  var y = this.y;

  this.x += (x - this.ox) + this.fx * step * step;
  this.y += (y - this.oy) + this.fy * step * step;

  this.ox = x;
  this.oy = y;
};

Particle.prototype.draw = function (model) {
  if(!this.e) {
	this.e = document.createElement('div');
	this.e.className = 'particle';
	model.e.appendChild(this.e);
  }
  if(this.x != this.ox || this.y != this.oy) {
	this.e.style.left = (this.x-3)+'px';
	this.e.style.top = (this.y-3)+'px';
  }
};


var Spring = function (p, q, length) {
  this.p = p;
  this.q = q;

  if(length>0)
	this.l = length;
  else {
	var dx = q.x - p.x;
	var dy = q.y - p.y;
	this.l = Math.sqrt(dx*dx + dy*dy);
  }
};

Spring.prototype.accum = function (model) {
  var x = this.p.x;
  var y = this.p.y;
  var dx = this.q.x - x;
  var dy = this.q.y - y;
  var distance = Math.sqrt(dx*dx + dy*dy);
  var ux = dx/distance;
  var uy = dy/distance;
  var displacement = distance - this.l;
  this.p.fx += ux * model.k * displacement;
  this.p.fy += uy * model.k * displacement;
  this.q.fx -= ux * model.k * displacement;
  this.q.fy -= uy * model.k * displacement;
};


var Stick = function (p, q, length) {
  this.p = p;
  this.q = q;

  if(length>0)
	this.l = length;
  else {
	var dx = q.x - p.x;
	var dy = q.y - p.y;
	this.l = Math.sqrt(dx*dx + dy*dy);
  }
};

Stick.prototype.constrain = function (model) {
  var x = this.p.x;
  var y = this.p.y;
  var dx = this.q.x - x;
  var dy = this.q.y - y;
  var distance = Math.sqrt(dx*dx + dy*dy);

  // if (distance < this.l) return;

  var fraction = (distance - this.l) / distance / 2;
  this.p.x = x + dx * fraction;
  this.p.y = y + dy * fraction;
  this.q.x = x + dx * (1 - fraction);
  this.q.y = y + dy * (1 - fraction);
};

Stick.prototype.draw = function (model) {
};


var String = function (p, q, length) {
  this.p = p;
  this.q = q;
  this.l = length;
};

String.prototype.constrain = function (model) {
  var x = this.p.x;
  var y = this.p.y;
  var dx = this.q.x - x;
  var dy = this.q.y - y;
  var distance = Math.sqrt(dx*dx + dy*dy);

  if (distance < this.l) return;

  var fraction = (distance - this.l) / distance / 2;
  this.p.x = x + dx * fraction;
  this.p.y = y + dy * fraction;
  this.q.x = x + dx * (1 - fraction);
  this.q.y = y + dy * (1 - fraction);
};


var OffsetSpring = function (p, q, dx, dy) {
  this.p = p;
  this.q = q;
  this.dx = dx;
  this.dy = dy;
  this.l = length;
};

OffsetSpring.prototype.accum = function (model) {
  var mx = (this.p.x + this.q.x) / 2;
  var my = (this.p.y + this.q.y) / 2;
  var dx = (mx - this.dx / 2) - this.p.x;
  var dy = (my - this.dy / 2) - this.p.y;

  this.a.fx += dx * model.k;
  this.a.fy += dy * model.k;
  this.b.fx -= dx * model.k;
  this.b.fy -= dy * model.k;
};


var Spacer = function (p, q, length) {
  this.p = p;
  this.q = q;
  this.l = length;
};

Spacer.prototype.constrain = function (model) {
  var x = this.p.x;
  var y = this.p.y;
  var dx = this.q.x - x;
  var dy = this.q.y - y;
  var distance = Math.sqrt(dx*dx + dy*dy);

  if (distance < this.l) return;

  var fraction = (distance - this.l) / distance / 2;
  this.p.x = x + dx * fraction;
  this.p.y = y + dy * fraction;
  this.q.x = x + dx * (1 - fraction);
  this.q.y = y + dy * (1 - fraction);
};


var Anchor = function (p, x, y) {
  this.p = p;
  this.x = x;
  this.y = y;
};

Anchor.prototype.constrain = function (model) {
  if (this.p == null) return;
  this.p.x = this.x;
  this.p.y = this.y;
};


var Offset = function (ps, dx, dy) {
  this.ps = ps;
  this.dx = dx;
  this.dy = dy;
};

Offset.prototype.constrain = function (model) {
  var x = 0;
  var y = 0;
  for (var i in this.ps) {
	x += this.ps[i].x;
	y += this.ps[i].y;
  }

  x = x / this.ps.length - this.dx * (this.ps.length - 1) / 2;
  y = y / this.ps.length - this.dy * (this.ps.length - 1) / 2;

  for (var i in this.ps) {
	this.ps[i].x = x + this.dx * i;
	this.ps[i].y = y + this.dy * i;
  }
};


var Model = function () {
  this.things = [];
  this.particles = [];
  this.spacers = [];
  this.strings = [];
  this.sticks = [];
  this.springs = [];
  this.anchors = [];
  this.polygons = [];
  this.offsets = [];
  this.offsetsprings = [];
  this.gravity = [0, +$('gravity').value];
  this.friction = +$('friction').value;
  this.elasticity = +$('elasticity').value;
  this.constrain_iterations = +$('iter').value;
  this.e = $('canvas');
};

Model.prototype.accum = function () {
  for (var i in this.particles)
	this.particles[i].accum(this);

  //  for (var i in this.springs)
  //	this.springs[i].accum(this);

  //  for (var i in this.offsetsprings)
  //	this.offsetsprings[i].accum(this);
};

Model.prototype.constrain = function () {
  for (var i in this.anchors)
	this.anchors[i].constrain(model);

  //  for (var i in this.strings)
  //	this.strings[i].constrain(model);

  //  for (var i in this.spacers)
  //	this.spacers[i].constrain(model);

  for (var i in this.sticks)
	this.sticks[i].constrain(model);

  //  for (var i in this.offsets)
  //	this.offsets[i].constrain(model);

  for (var i in this.polygons)
	this.polygons[i].constrain(model);
};

Model.prototype.step = function (delta_t, main_iters) {
  this.accum();

  for (var i in this.particles)
	this.particles[i].integrate(delta_t);

  for (var i=0; i<this.constrain_iterations; i++)
	this.constrain();

  this.theta += delta_t;
};

Model.prototype.draw = function () {
  for(var i in this.polygons)
	this.polygons[i].draw(this);

  for(var i in this.things)
	this.things[i].draw(model);

  //  for(var i in this.sticks)
  //	this.sticks[i].draw(model);
};

Model.prototype.nearest = function (x, y) {
  var closest = null;
  var d = 0;
  for (var i in this.particles) {
	var p = this.particles[i];
	var dx = p.x - x;
	var dy = p.y - y;
	var distance = Math.sqrt(dx*dx + dy*dy);
	if (closest == null || distance < d) {
	  d = distance;
	  closest = p;
	}
  }
  return closest;
};

var Polygon = function (vertices) {
  this.enclosing = false;
  this.n = vertices.length;
  this.vs = vertices;
  this.normals = new Array(this.n);

  var dx, dy, l, i, j;

  for(var i=0; i<this.n; i++) {
	j = (i+1) % this.n;
	dx = vertices[i][0] - vertices[j][0];
	dy = vertices[i][1] - vertices[j][1];
	l = Math.sqrt(dx*dx + dy*dy);
	this.normals[i] = [-dy / l, dx / l];
  }
};

Polygon.prototype.draw = function (model) {
  if(!this.e) {
	this.e = document.createElement('div');
	this.e.className = 'polygon';
	this.es = [];
	model.e.appendChild(this.e);

	for(var i=0; i<this.n; i++) {
	  this.es[i] = document.createElement('div');
	  this.es[i].className = 'polypoint';
	  this.e.appendChild(this.es[i]);
	}

	/// Note: this should be outside the if(!this.e) if the polygon points
	/// are moving.  By having it in the if() this only executes on the
	/// first frame.
	for(var i=0; i<this.n; i++) {
	  this.es[i].style.left = (this.vs[i][0]-3)+'px';
	  this.es[i].style.top = (this.vs[i][1]-3)+'px';
	}
  }
};

Polygon.prototype.constrain = function (model) {
  for(var i in model.particles) {
	if(this.contains(model.particles[i]))
	  this.reflect(model.particles[i], model.elasticity);
  }
};

Polygon.prototype.contains = function (p) {
  // This algorithm works for convex polygons with vertices specified in
  // clockwise manner.  For each edge, tt compares the vector 'dx/dy'
  // (from the edge's first vertex to the particle p) to the normal of the
  // edge.  If the dot product is positive (ie. they're both in the same
  // direction within +/- 90 degrees) then the particle is on the
  // normal-facing side of that edge.  If this is true of any particular
  // edge of a convex polygon, then the particle must be outside the
  // entire polygon, as by definition the normal of a convex polygon's
  // edge cannot point into the polygon.
  //
  // 'enclosing' is usually false... an 'enclosing=true' polygon is a
  // negative-space polygon where all particles must be inside the polygon
  // rather than outside.  This allows the creation of rooms.
  // Unfortunately, this is less useful than it sounds as it doesn't allow
  // concave polygons which would allow useful doors.  Easier to use a
  // bounding-box and then add wedge polygons.
  var dx, dy;

  for(var i=0; i<this.n; i++) {
	var v = this.vs[i];
	dx = p.x - v[0];
	dy = p.y - v[1];

	if(this.normals[i][0]*dx + this.normals[i][1]*dy >= 0)
	  return this.enclosing;
  }

  return !this.enclosing;

  /*
  // The above algorithm wasn't working... turns out because
  // all the normals were pointing the wrong way.  Before I
  // figured that out, I decided to change the algorithm to
  // the standard even-odd crossing rule based on a fixed
  // 'y'.  I then figured out the vertex thing.  My brain
  // hurts.
  //
  var c = false;
  var i=0, j=this.n-1;
  for (; i<this.n; j=i++) {
	if(((this.vs[i][1]<=p.y) && (p.y<this.vs[j][1])) ||
	   ((this.vs[j][1]<=p.y) && (p.y<this.vs[i][1])))
	  if(p.x < (this.vs[j][0]-this.vs[i][0]) * (p.y - this.vs[i][1]) / (this.vs[j][1] - this.vs[i][0]) + this.vs[i][0])
		c = !c;
  }
  return c;
  */
};


Polygon.prototype.reflect = function (p, elasticity) {
  var distance = -1000;
  var d;
  var edge, normal;

  for(var i=0; i<this.n; i++) {
	d = (this.normals[i][0]*(p.x - this.vs[i][0]) +
		 this.normals[i][1]*(p.y - this.vs[i][1]));

	if(d > distance) {
	  distance = d;
	  edge = i;
	  normal = this.normals[i];
	}
  }

  p.x -= (1 + elasticity) * distance * normal[0];
  p.y -= (1 + elasticity) * distance * normal[1];

  distance = (normal[0] * (p.ox - this.vs[edge][0]) +
			  normal[1] * (p.oy - this.vs[edge][1]));

  p.ox -= (1 + elasticity) * distance * normal[0];
  p.oy -= (1 + elasticity) * distance * normal[1];
};


var Thing = function () {
  this.ps = [];
  this.ss = [];
};

Thing.prototype.draw = function(model, particles) {
  if(!this.e) {
	this.e = document.createElement('div');
	this.e.className = 'thing';
	model.e.appendChild(this.e);
  }
  var x0=10000, y0=10000, x1=-10000, y1=-10000;
  var n = this.ps.length;
  for(var i=0; i<n; i++) {
	var p = this.ps[i];
	if(p.x>x1) x1 = p.x;
	if(p.x<x0) x0 = p.x;
	if(p.y>y1) y1 = p.y;
	if(p.y<y0) y0 = p.y;
  }
  this.e.style.left = x0+'px';
  this.e.style.top = y0+'px';
  this.e.style.width = (x1-x0)+'px';
  this.e.style.height = (y1-y0)+'px';

  if(particles)
	for(var i in this.ps)
	  this.ps[i].draw(model);
};

Thing.prototype.addToModel = function (model) {
  for(var i=0; i<this.ps.length; i++)
	model.particles.push(this.ps[i]);

  for(var i=0; i<this.ss.length; i++)
	model.sticks.push(this.ss[i]);

  model.things.push(this);
};


var Ball = function (x, y, r, s) {
  this.ps = new Array(s);
  this.ss = [];
  var ang = Math.PI * 2 / s;

  for(var i=0; i<s; i++) {
	var px = x + Math.sin(ang*i) * r;
	var py = y + Math.cos(ang*i) * r;
	this.ps[i] = new Particle(px, py, 1);
  }

  for(var i=0; i<s; i++) {
	var j=(i+1) % s;
	this.ss.push(new Stick(this.ps[i], this.ps[j], 0));
	for(var k=0; k<i; k++)
	  this.ss.push(new Stick(this.ps[i], this.ps[k], 0));
  }
};

Ball.prototype = new Thing;

Ball.prototype.draw = function(model) {
  if(!this.e) {
	Thing.prototype.draw.call(this, model, true);
	this.e.className = 'ball';
  } else {
	Thing.prototype.draw.call(this, model, true);
  }
};


var Box = function (vs) {
  var s = vs.length;
  this.ps = new Array(s);
  this.ss = [];

  var x=0, y=0;
  for(var i=0; i<s; i++) {
	x += vs[i][0];
	y += vs[i][1];
	this.ps[i] = new Particle(vs[i][0], vs[i][1], 1);
  }

  this.ss.push(new Stick(this.ps[0], this.ps[1], 0));
  this.ss.push(new Stick(this.ps[0], this.ps[2], 0));
  this.ss.push(new Stick(this.ps[1], this.ps[2], 0));
  this.ss.push(new Stick(this.ps[1], this.ps[3], 0));
  this.ss.push(new Stick(this.ps[2], this.ps[3], 0));
  this.ss.push(new Stick(this.ps[3], this.ps[0], 0));
};

Box.prototype = new Thing;

Box.prototype.draw = function(model) {
  if(!this.e) {
	Thing.prototype.draw.call(this, model, true);
	this.e.className = 'box';
  } else {
	Thing.prototype.draw.call(this, model, true);
  }
};

