
var P0 = new Vector(200, 100);
var P1 = new Vector(400, 250);
var P2 = new Vector(150, 300);

testbedAddDrag([P0, P1, P2]);

function myPaint () {
  // Clear the debug area
  $('dump').value = '';

  // Clear the canvas
  ctx.clearRect(0, 0, 600, 450);

  // Create a new polygon from the vertices.  Note, 'true' prevents the
  // Polygon from reordering the vertex order to clockwise, which can
  // seriously screw up since we're changing one of the vertices directly.
  var T = new Polygon([P0, P1, P2], true);

  // Draw the triangle's centre of gravity.  We'll draw the edges later
  drawPoint(ctx, T.centroid, 'black');

  // Create the edge vectors
  var V01 = P1.minus(P0);
  var V02 = P2.minus(P0);
  var V12 = P2.minus(P1);

  // And draw them in the correct positions
  drawLine(ctx, P0, P0.plus(V01), 'red', 'red');
  drawLine(ctx, P0, P0.plus(V02), 'green', 'green');
  drawLine(ctx, P1, P1.plus(V12), 'blue', 'blue');

  // 'N' is the normal vector from P0 to the base (P1-P2)
  var N = V12.perpendicular().normal();

  // 'h' is the 'altitude' of the triangle, ie. the height if (P1-P2) is the base.
  var h = N.dot(V02);

  // 'H' is the base's normal vector scaled by the altitude, ie. the
  // plumbline from P0 to the base.
  var H = N.scaled(h);
  drawLine(ctx, P0, P0.plus(H), 'magenta', 'magenta');

  // 'P' is the point at the base below P0
  var P = P0.plus(H);
  drawPoint(ctx, P, 'magenta', 'magenta');

  // A is the part of the base from P1 to P.
  var A = P.minus(P1);
  drawLine(ctx, P1.minus(N.scaled(10)), P1.minus(N.scaled(10)).plus(A), 'cyan', 'cyan');

  // B is the base.
  var B = V12;
  drawLine(ctx, P1.minus(N.scaled(20)), P1.minus(N.scaled(20)).plus(B), 'orange', 'orange');

  var T0 = P0.minus(T.centroid);
  var T1 = P1.minus(T.centroid);
  var T2 = P2.minus(T.centroid);

  var Io = (T0.dot(T0) + T1.dot(T1) + T2.dot(T2) +
			T0.dot(T1) + T0.dot(T2) + T1.dot(T2))/6;
  dumpString('Io='+Io);

  // Working absolutely...
  var a = Math.abs(A.magnitude());
  var b = Math.abs(B.magnitude());
  h = Math.abs(h);

  // To calculate the mass moment of inertia of the triangle, using
  // bh^3/36.  I don't think this is right. The alternative given in
  // <http://lab.polygonal.de/2006/08/17/calculating-the-moment-of-inertia-of-a-convex-polygon/>
  // is (bhhh-bbha+bha+bhhh)/36, which I believe is the area moment of
  // inertia.  Without the absolutes above, both of these go negative,
  // which doesn't seem right!
  var It = b*h*h*h/36;
  dumpString('It='+It);


  // To compare we calculate some discs centred on the centroid.  The mass
  // moment of inertia of a disc is mr^2/2.  Since we are working in 2D
  // and constant density, we can say that mass = area, and more
  // specifically, T.area.


  // To get an lower bound, we now calculate the mass moment of inertia of
  // a circle sitting totally within the triangle, centred on the centroid
  // of the triangle.  Since it's centred on the centroid, it's not
  // (necessarily or likely to be) the incircle.  The mass moment of
  // inertia MUST be more than this, surely?

  // ALSO, this value turns out to OFTEN be the same or similar to
  // bh^3/36, as calculated above (for 'It') which seems suspiciously
  // coincidental.

  // Find distances between the centroid and the three edges
  var rC01 = Math.abs(V01.perpendicular().normal().dot(P0.minus(T.centroid)));
  var rC02 = Math.abs(V02.perpendicular().normal().dot(P0.minus(T.centroid)));
  var rC12 = Math.abs(V12.perpendicular().normal().dot(P1.minus(T.centroid)));

  // Find the smallest one
  var rmin = rC01<rC12 ? (rC02<rC01 ? rC02 : rC01) : (rC02<rC12 ? rC02 : rC12);

  // Calculate the mass moment of inertia for this (red) circle
  var Ir = T.area * rmin * rmin / 2;
  drawCircle(ctx, T.centroid, rmin, '#f99' /*pale red*/);
  dumpString('Ir='+Ir);


  // Here we calculate the mass moment of inertia of a disc with equal
  // area to the triangle.  Since the triangle will extend outside the
  // disc, it should be higher, but then again, it extends in.  Anyway, I
  // would expect that an equilateral triangle will have a mass moment of
  // inertia in the same rough scale as this disc.
  var ravg = Math.sqrt(T.area / Math.PI);
  var Ig = T.area * ravg * ravg / 2;
  drawCircle(ctx, T.centroid, ravg, '#9f9' /*pale green*/);
  dumpString('Ig='+Ig);

  // To get an upper bound, we now calculate the mass moment of inertia of
  // the enclosing circle, centred on the centroid of the triangle.  The
  // mass moment of inertia MUST be less than this.

  // Work out the radii from centroid to vertices
  var r0 = P0.minus(T.centroid).magnitude();
  var r1 = P1.minus(T.centroid).magnitude();
  var r2 = P2.minus(T.centroid).magnitude();

  // Find the largest one
  var rmax = r0>r1 ? (r2>r0 ? r2 : r0) : (r2>r1 ? r2 : r1);

  // Calculate the mass moment of inertia for this circle
  var Ib = T.area * rmax * rmax / 2;
  drawCircle(ctx, T.centroid, rmax, '#99f' /*pale blue*/);
  dumpString('Ib='+Ib);


  return;
}


