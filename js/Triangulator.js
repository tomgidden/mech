/* Javascript Polygon Triangulator Library
 * Copyright (C) Tom Gidden, 2007.
 *
 * This code will take a Polygon and return a list of triangular
 * sub-Polygons.  The original Polygon should be simple (ie. non-crossing
 * and no holes), but not necessarily convex.  The vertices MUST be in
 * clockwise order!
 *
 * A Polygon has members 'n' (the number of vertices) and 'vs' (an array
 * of 'n' Vector objects representing vertices, with a Vector having two
 * members, 'x' and 'y').  The Polygon constructor takes a single
 * argument: an array of Vector objects which becomes 'vs'.
 */

var Triangulator = function (polygon) {
  // Creates a Triangulator object.

  // Copy the passed polygon's vertices.
  this.vs = polygon.vs.slice();

  // Store the number of vertices for efficiency.
  this.n = this.vs.length;

  // For each vertex, work out if it is convex or concave.  Also sets
  // this.concaveCount, a count of the number of concave vertices, for
  // handling the (simple) case where the polygon is convex and thus all
  // vertices are ears.
  this._calcConvexnessOfVertices();
};

Triangulator.prototype.triangulate = function (verticesOnly) {
  // The workhorse function.
  //
  // Return an array of triangles (as Polygons, or optionally as vertex
  // lists), by looping through the Triangulator, leaving an empty used
  // Triangulator at the end.  There should be 'n-2' triangles, where 'n'
  // is the number of vertices.
  var i = 0;
  var ts = new Array(this.n-2);
  var vs;

  if(verticesOnly)
	while(vs = this._triangulateNext()) {
	  ts[i++] = vs;
	}
  else
	while(vs = this._triangulateNext()) {
	  ts[i++] = new Polygon(vs);
	}
  return ts;
};

////////////////////////////////////////////////////////////////////////////
// Private functions:

Triangulator.prototype._getVertexTriangleVertices = function (j) {
  // Get the triad of vertex vectors adjacent to and including 'j'.
  if (j==0)
	return [this.vs[this.n-1],this.vs[0],this.vs[1]];
  else if (j==this.n-1)
	return [this.vs[j-1],this.vs[j],this.vs[0]];
  else
	return [this.vs[j-1],this.vs[j],this.vs[j+1]];
};

Triangulator.prototype._getVertexTriangleIndices = function (j) {
  // Get the triad of vertex indices adjacent to and including
  // 'j'. ie. [j-1, j, j+1], bound-adjusted.
  if (j==0)
	return [this.n-1, 0, 1];
  else if (j==this.n-1)
	return [j-1, j, 0];
  else
	return [j-1, j, j+1];
};

Triangulator.prototype._convexnessOfVertex = function (i) {
  // Test if a given vertex is convex.
  return (Triangulator._areaSign(this._getVertexTriangleVertices(i)) > 0);
};

Triangulator.prototype._calcConvexnessOfVertices = function () {
  // Work out convexness of all vertices, and store in 'this.cs' array as
  // boolean flags.
  var n = this.n;
  var concaveCount = this.n;
  this.cs = new Array(n);

  for(var i=0; i<n; i++) {
	// A vertex is convex if the _signed_ area of the triangle of the
	// vertex's triad is negative or zero.  This comes from the fact that
	// the polygon is described clockwise (and thus will the triad), and
	// the area calculation assumes anti-clockwise.
	if(this.cs[i] = Triangulator._areaSign(this._getVertexTriangleVertices(i)) > 0)
	  concaveCount--;
  }

  // If the count of concave vertices is zero then the polygon is
  // completely convex.  This can be handled as a special case, as all
  // vertices are ears.
  this.concaveCount = concaveCount;
};

Triangulator.prototype._vertexIsEar = function (j) {
  // Returns whether the given vertex is an ear or not.

  // If the polygon is convex, then all vertices are ears.
  if(this.concaveCount==0) return true;

  // If the vertex is concave (non-convex), then it can't be an ear.
  if(!this.cs[j]) return false;

  // Test if the vertex is a principal vertex, ie. if the diagonal
  // (j-1,j+1) does not intersect any other edge.  To do this, test if the
  // triangle formed by the vertex and its neighbours contains another
  // vertex in the polygon (then it's not a principal vertex).

  // First, find out j0 and j2. Equivalent to _getVertexTriangleIndices
  var j0=j-1, j2=j+1;
  if (j==0)
	j0 = this.n-1;
  else if (j==this.n-1)
	j2 = 0;

  // For each vertex...
  for(var i=0; i<this.n; i++) {

	// For each *other* convex vertex...
	if(this.cs[i] || i==j0 || i==j || i==j2) continue;

	// Assume the vertex 'i' is in the triangle formed by j0,j,j2.  If so,
	// the areas of the three sub-triangles formed with the given vertex
	// in the middle will all have the same sign.
	var s2A = Triangulator._areaSign([this.vs[j0], this.vs[j], this.vs[i]]);
	var s2B = Triangulator._areaSign([this.vs[j], this.vs[j2], this.vs[i]]);

	// XXX: Note, we do nothing here for the case where the area of any
	// triangle is zero, ie. vertex 'i' is on one of the lines.  This may
	// be a problem, and should be tested carefully!  Bah, screw it.

	if(s2A == s2B) {
	  // The signs of the first two are the same, so we must now test the
	  // third triangle.
	  var s2C = Triangulator._areaSign([this.vs[j2], this.vs[j0], this.vs[i]]);

	  // If all three signs are the same, then the vertex 'i' IS in the
	  // triangle.  As a result, we can now break out because we know that
	  // the vertex 'j' is NOT an ear.
	  if (s2A == s2C) return false;
	}

	// The signs of the three triangles are NOT the same, so our
	// assumption is wrong and the vertex 'i' is NOT in the triangle, so
	// we can loop to the next vertex to test.
  }

  // Otherwise, it's an ear.
  return true;
};

Triangulator.prototype._getNextEarIndex = function () {
  // Returns the index of "the next" vertex that's an ear.  Loop through
  // all vertices until an ear is found.  When found, break the loop and
  // return it.
  for(var i=0; i<this.n; i++) {
	if(this._vertexIsEar(i))
	  return i;
  }

  // If all vertices are looped and none are ears, then we have a problem.
  // The likelihood is that the polygon is not simple, either because
  // there's a hole (not supported) or that the polygon self-crosses.
  alert("No ear found. Polygon probably not simple.");
  return undefined;
};

Triangulator.prototype._triangulateNext = function () {
  // Perform the next step of the triangulation process, getting the next
  // triangle and removing it from the Triangulator.

  // If there are less than three vertices, then we're already done.
  if(this.n < 3) return undefined;

  // If there are only three vertices left, then we've got our final
  // triangle.
  if(this.n == 3) {
	// So, invalidate the whole thing.  Should really destroy it all, but
	// this should be enough.  Not really necessary, as the rest of this
	// routine should work with n=3 and then the next loop will terminate
	// because n<3, but it's worth shortcutting all the mess for this
	// termination case.
	this.cs = undefined;
	this.n = 0;
	return this.vs;
  }

  // Otherwise, get the next ear index.
  var j = this._getNextEarIndex();

  // If we can't find one, we've got a problem: see the notes in
  // getNextEarIndex above.
  if(j==undefined) return undefined;

  // Get the vertices for the ear in question, ready to return.
  var vs = this._getVertexTriangleVertices(j);

  // Remove the ear by removing the ear vertex from the Triangulator.
  this.vs.splice(j, 1);
  this.cs.splice(j, 1);
  var n = --this.n;

  // Now, we need to recalculate the convexness of the neighbouring points.
  // First, we work out the (new) indices of the two neighbours of the original j.
  var j0, j2;
  if(j==0) {
	// j was the first vertex.  As a result, the new neighbours are the
	// last vertex and the new first vertex.
	j0 = n-1;
	j2 = 0;
  }
  else if(j==n) {
	// j was the last vertex (as n is now n-1).  As a result, the new
	// neighbours are the new second-to-last vertex (n-2) and new last
	// vertex (n-1).
	j0 = n-2;
	j2 = n-1;
  }
  else {
	// j was somewhere in the middle of the list, so the new neighbours
	// are (j-1) and j.
	j0 = j-1;
	j2 = j;
  }

  // First handle 'j0', the "left-hand" neighbour.  If the convexness is
  // the same as before, nothing happens.  If there's a difference, then
  // we need to update cs[j0], and also alter the concaveCount.  Unlike
  // concave to convex, I'm not sure if there's a case where a vertex can
  // go from convex to concave with the removal of an ear, so I'll handle
  // it anyway.
  var c0 = (Triangulator._areaSign(this._getVertexTriangleVertices(j0)) > 0);
  if(this.cs[j0] != c0) {
	this.cs[j0] = c0;
	this.concaveCount += c0 ? -1 : 1;
  }

  // Then handle 'j2', the "right-hand" neighbour, in the same way.
  var c2 = (Triangulator._areaSign(this._getVertexTriangleVertices(j2)) > 0);
  if(this.cs[j2] != c2) {
	this.cs[j2] = c2;
	this.concaveCount += c2 ? -1 : 1;
  }

  // ...and return the vertices of the ear triangle.
  return vs;
};

Triangulator._areaSign = function (vs) {
  // The sign of the area of a triangle is important in detecting the
  // clockwise/anticlockwise-ness (orientation?) of a triangle.
  var a = vs[0].x*(vs[1].y-vs[2].y) +
          vs[1].x*(vs[2].y-vs[0].y) +
	      vs[2].x*(vs[0].y-vs[1].y);
  return (a<0) ? -1 : (a==0 ? 0 : 1);
};
