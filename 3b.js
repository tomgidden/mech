var P = new Vector(100, 40);
var Q = new Vector(300, 300);
var r = 30;

var Vs = [new Vector(200,190),
		  new Vector(400,200),
		  new Vector(475,375),
		  new Vector(100,350)];

testbedAddDrag([P, Q, Vs]);


function hit_point_of_circle_against_point(C0, r, V, P, colour) {
  // C0: Circle centre point at t=0
  // r: Circle radius
  // V: velocity of circle, such that C1 = C0 + V
  // P: Point to hit

  // Draw the intersection boundary
  if(colour) drawCircle(ctx, P, r, colour);

  // Rather than calculating moving circle against point, ie. radius
  // around all points on a line against point, we can calculate line
  // against radius around point.  This is easier.
  //
  // All points on C0--V-->C1 are in the set [(C0x+t*Vx, C0y+t*Vy)].
  //
  // So, all points around P [x,y] at radius r satisfy Pythagoras:
  //   (x-Px)^2 + (y-Py)^2 = r*r
  //
  // So, intersections occur where:
  //   (C0x-Px+t*Vx)^2 + (C0y-Py+t*Vy)^2 = r*r
  //
  // Solve this for 't' using the quadratic formula.

  // So:
  //   |V|^2 * t^2 + 2*V.PC0 * t + |P|^2 + |C0|^2 - 2*C0.P - r*r = 0
  //
  // (ie.  a * t^2 +       b * t +                             c = 0)
  //
  // where 't' is the time of impact.  We only need to
  // solve the first (-) root, as we are only interested in
  // the first collision (ie. minimum 't')

  // Line from P to C0.
  var PC0 = C0.minus(P);

  var a = V.magnitude2();
  var b = 2*V.dot(PC0);
  var c	= P.magnitude2()
	+ C0.magnitude2()
	- 2*C0.dot(P)
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
  var Ct = C0.plus(V.scaled(t));

  return {t:t, X:P, Ct:Ct};
}

function hit_point_of_circle_against_line(C0, r, V, L, colour) {
  // C0: Circle centre point at t=0
  // r: Circle radius
  // V: velocity of circle, such that C1 = C0 + V
  // L: Line

  var VdotLn = V.dot(L.n);
  if(VdotLn >= 0) return null;

  var A = L.p;
  var B = L.q;

  // Calculate signed distances of C0 and C1 (d0 and d1) from
  // an arbitrary point on L.  We're using A in this case.
  var d0 = C0.minus(A).dot(L.n);
  var d1 = C0.plus(V).minus(A).dot(L.n);

  // As d0 and d1 are signed, then the following tests
  // return true if C0 and C1 are on the "outside" of L,
  // which implies that the collision doesn't happen (in
  // this frame)
  if(d0 <= r || d1 >= r)
	return null;

  // (d0-r) is the total lineward distance between C0 and Ct.
  // d = |d0| + |d1| = d0 - d1


  var t = (d0 - r) / (d0 - d1);

  // Location of circle centre at collision is C0+t*V
  var Ct = C0.plus(V.scaled(t));

  // Actual collision point is X + r towards the line.
  var X = Ct.minus(L.n.scaled(r));

  // Now, test if the collision point X is within the line
  // segment.  If (on L), X>A and X<B, then X is between A
  // and B.  So, find the dot products and see if it's all
  // in the same direction.
  var AB = L.pq;
  var AX = X.minus(A);
  var XB = B.minus(X);
  var AXAB = AX.dot(AB);
  var XBAB = XB.dot(AB);

  // If both AXAB and XBAB are positive, then X is between A
  // and B.  If one is negative, we're outside.  If *both*
  // are negative, then something *really* strange has
  // happened, and the true location of X is left as an
  // exercise for the reader.
  var XbetweenAandB = (AXAB * XBAB) > 0;

  return {t:t, X:X, Ct:Ct, doesHit:XbetweenAandB};
}

function myPaint () {
  ctx.clearRect(0, 0, 600, 450);

  var Z = new Polygon(Vs);

  // Draw the polygon
  Z.draw(ctx, 'black', 'black');

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
	drawPoint(ctx, firstImp.X, 'red', 'red');
	drawCircle(ctx, firstImp.Ct, r, 'red');
	drawLine(ctx, firstImp.X, firstImp.Ct, 'red', 'red');
  }

  return;
}
