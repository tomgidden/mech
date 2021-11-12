/* Javascript Polygon Mass Moment of Inertia Library
 * Copyright (C) Tom Gidden, 2007.
 *
 * This code adds functionality to the Polygon class in Shapes.js to
 * figure out the mass moment of inertia.  It uses the Triangulator.js
 * library to achieve this goal.
 */

Polygon.prototype._triangulate = function (force) {
  // This (private) function returns a list of triangles that make up the
  // Polygon.  Since the method used by Triangulator is not very scalable,
  // it should be used sparingly.

  // If the polygon has already been triangulated, and force was not
  // requested, then just return the cached triangles.
  if(this.Ts && !force) return this.Ts;

  // If the polygon is already three-sided just return it.
  if(this.n <= 3) return this;

  // Create a Triangulator object for this polygon
  var T = new Triangulator(this);

  // ...and use it, cacheing the results
  this.Ts = T.triangulate();

  // ...and return the result
  return this.Ts;
};

Polygon.prototype.massMomentOfInertia = function (force) {
  // Calculates the mass moment of inertia around the centroid, by
  // dividing up into triangles and summing the MMIs of those.  If
  // desired, the "centroid" could be relocated to a pivot point instead
  // to simulate a "hinge"

  // If already calculated, and "force" was not requested, then just
  // return the result.
  if(this.MMI && !force) return this.MMI;

  // If the polygon has less than three points, then forget it
  if(this.n < 3) {
	alert('MMI calculation not supported on a point or rod');
	die;
  }

  // If the polygon is a triangle, then just run the MMI calculation
  // directly.
  if(this.n == 3) {
	var PP0 = this.vs[0].minus(this.centroid);
	var PP1 = this.vs[1].minus(this.centroid);
	var PP2 = this.vs[2].minus(this.centroid);
	this.MMI = (PP0.dot(PP0) + PP0.dot(PP1) + PP0.dot(PP2) +
				PP1.dot(PP1) + PP1.dot(PP2) + PP2.dot(PP2))*this.area/6;
	return this.MMI;
  }

  // Otherwise, we need to triangulate.
  var Ts = this.Ts = this._triangulate();

  // ...and then perform the calculation for each triangle in turn
  this.MMI = 0;
  for(var i=0; i<Ts.length; i++) {
	var T = Ts[i];
	var PP0 = T.vs[0].minus(this.centroid);
	var PP1 = T.vs[1].minus(this.centroid);
	var PP2 = T.vs[2].minus(this.centroid);
	this.MMI += (PP0.dot(PP0) + PP0.dot(PP1) + PP0.dot(PP2) +
				 PP1.dot(PP1) + PP1.dot(PP2) + PP2.dot(PP2))*T.area/6;
  }

  // Note: that was an optimisation of:
  //   for(var i=0; i<Ts.length; i++)
  // 	this.MMI += Ts[i].massMomentOfInertia();
  // Admittedly, this *might* cache better, although I can't see a common
  // case where the triangle had an MMI precalculated, but the polygon
  // didn't... at least, not at the moment.

  return this.MMI;
};
