var P = new Vector(100, 40);
var Q = new Vector(300, 300);
var r = 30;

var Vs = [new Vector(200,190),
		  new Vector(400,200),
		  new Vector(475,375),
		  new Vector(100,350)];

testbedAddDrag(P);
testbedAddDrag(Q);
testbedAddDrag(Vs);

function hit_point_of_circle_against_point(C, r, V, P, colour) {
  // C: Circle centre point at t=0
  // r: Circle radius
  // V: velocity of circle, ie. path from C to C' from 0<=t<=1
  // P: Point to hit

  // Draw the intersection boundary
  if(colour) drawCircle(ctx, P, r, colour);

  // Rather than calculating moving circle against point, ie. radius
  // around all points on a line against point, we can calculate line
  // against radius around point.  This is easier.
  //
  // All points on C--V-->C' are in the set [(Cx+t*Vx, Cy+t*Vy)].
  //
  // So, all points around P [x,y] at radius r satisfy Pythagoras:
  //   (x-Px)^2 + (y-Py)^2 = r*r
  //
  // So, intersections occur where:
  //   (Cx-Px+t*Vx)^2 + (Cy-Py+t*Vy)^2 = r*r
  //
  // Solve this for 't' using the quadratic formula.

  // So:
  //   |V|^2 * t^2 + 2*V.PC * t + |P|^2 + |C|^2 - 2*C.P - r*r = 0
  //
  // (ie.  a * t^2 +      b * t +                           c = 0)
  //
  // where 't' is the time of impact.  We only need to
  // solve the first (-) root, as we are only interested in
  // the first collision (ie. minimum 't')

  // Line from P to C.
  var PC = C.minus(P);

  var a = V.magnitude2();
  var b = 2*V.dot(PC);
  var c	= P.magnitude2()
	+ C.magnitude2()
	- 2*C.dot(P)
	- r*r;
  var bb4ac = b*b - 4*a*c;

  // If bb4ac is zero or negative, then there's no collision
  // in real space, so let's not bother with the square
  // root.
  if(bb4ac<=0) return null;

  var sqrtbb4ac = Math.sqrt(bb4ac);

  // 't' is the first time of impact
  var t = (-b - sqrtbb4ac) / (2*a);

  // Find the centre of the circle at the collision point.
  var X = C.plus(V.scaled(t));

  return {t:t, Xc:X, Xp:P};
}

function hit_point_of_circle_against_line(C, r, V, L, colour) {
  // C: Circle centre point at t=0
  // r: Circle radius
  // V: velocity of circle, ie. path from C to C' from 0<=t<=1
  // L: Line

  // Project the velocity onto the line's normal.  This
  // gives the magnitude of the velocity component towards
  // the line.
  var VdotLn = V.dot(L.n);

  // If V.Ln is zero or positive, then the line's normal and
  // the velocity are in the same direction, and thus the
  // circle is approaching the line from the wrong side.
  // Assuming the line is one-sided (!), this means the
  // collision is bogus, so screw it.
  if(VdotLn >= 0) return null;

  // Line's normal scaled to radius of circle.
  var rLn = L.n.scaled(r);

  // For clarity, use A and B rather than L.p and L.q
  var A = L.p;
  var B = L.q;

  // L2 is a new line parallel to L, offset by one radius in
  // the direction of L's normal.  This allows a single
  // point intersection of C against L2 to work out the
  // collision point of the circle against L.
  var A2 = A.plus(rLn);
  var B2 = B.plus(rLn);
  var L2 = new Line(A2, B2);

  // Draw the intersection boundary
  if(colour) L2.draw(ctx, colour);

  // Project C onto L2, using simple point-line projection
  // (http://mathworld.wolfram.com/Projection.html)
  var CA2 = A2.minus(C);
  var u = rLn.dot(CA2) / (r*r);
  var CXn = rLn.scaled(u);
  var Xn = CXn.plus(C);

  // Using similar triangles, the ratio of the magnitude of
  // CXn to the magnitude of the linewards component of the
  // velocity vector V is the same as the ratio of (C to the
  // real intersection point) to V.

  // So:
  //   t  = |CXn| / |L.n * V.dot(L.n)|
  //      = |rLn*u| / |L.n * V.dot(L.n)|
  //      = |L.n*r*u| / |L.n * V.dot(L.n)|
  //      = (|L.n| * r*u)  /  (|L.n| * V.dot(L.n))
  //      = r * u / V.dot(L.n)
  //      = r * (rLn.dot(CA2) / r*r) / L.n.dot(V)
  //      = (r*r * Ln.dot(CA2) / r*r) / L.n.dot(V)
  //      = L.n.dot(CA2) / L.n.dot(V)
  //
  // XXX: At this point it might be feasible to add C to
  // CA2 and V, and simplify even more.
  var t = L.n.dot(CA2) / VdotLn;

  // This ratio can now be used to scale V to find the
  // intersection point, X.
  var X = C.plus(V.scaled(t));

  // Problem is, this intersection is on the line VIA {A,B}
  // rather than the line segment FROM {A,B}.  So, we need
  // to find if X is actually between A and B.

  var AB = L.pq;
  var AX = X.minus(A);
  var XB = B.minus(X);

  // If (on L), X>A and X<B, then X is between A and B.  So,
  // find the dot products and see if it's all in the same
  // direction.

  var AXAB = AX.dot(AB);
  var XBAB = XB.dot(AB);

  // If both AXAB and XBAB are positive, then X is between A
  // and B.  If one is negative, we're outside.  If *both*
  // are negative, then something *really* strange has
  // happened, and the true location of X is left as an
  // exercise for the reader.
  var XbetweenAandB = (AXAB * XBAB) > 0;
  return {t:t, Xp:X.minus(rLn), Xc:X, doesHit:XbetweenAandB};
}



function myPaint () {
  $('dump').value = '';
  ctx.clearRect(0, 0, 600, 450);

  var Z = new Polygon(Vs);

  // Draw the polygon
  Z.draw(ctx, 'black');

  // Draw the motion vector V
  var V = Q.minus(P);
  drawLine(ctx, P, Q, 'grey', 'grey');

  // Draw the start and end circles
  drawCircle(ctx, P, r, 'blue', 'blue');
  drawCircle(ctx, Q, r, 'blue', 'blue');

  // firstImp will be the first known impact.
  var firstImp = null;

  // For each vertex in the polygon Z
  for(var i=0; i<Z.n; i++) {

	// Get the edge from this vertex to the next vertex
	var L = Z.ls[i];

	// Find the impact (if any) of the circle in motion against this edge
	var imp = hit_point_of_circle_against_line(P, r, V, L, 'cyan');

	// If there's an impact...
	if(imp)

	  // Then if the impact is within the time frame...
	  if(imp.t >= 0 && imp.t <= 1)

		// Then if the impact occurs in the edge bounds...
		if(imp.doesHit)

		  // Then if it's the first OR minimum impact found
		  if(!firstImp || imp.t < firstImp.t) {

			// Then save it,
			firstImp = imp;

			// and bypass the vertex collision step.
			continue;
		  }

	// An edge collision did not occur, so test for vertex collision.
	imp = hit_point_of_circle_against_point(P, r, V, L.p, 'cyan');

	// If there's an impact...
	if(imp)

	  // Then if the impact is within the time frame...
	  if(imp.t >= 0 && imp.t <= 1)

		// Then if it's the first OR minimum impact found
		if(!firstImp || imp.t < firstImp.t)

		  // Then save it.
		  firstImp = imp;
  }

  // If we found a collision, then draw it
  if(firstImp) {
	drawPoint(ctx, firstImp.Xp, 'red', 'red');
	drawCircle(ctx, firstImp.Xc, r, 'red');
	drawLine(ctx, firstImp.Xp, firstImp.Xc, 'red', 'red');
  }

  return;
}
