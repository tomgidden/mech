
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
  drawPoint(ctx, T.centroid, 'black', 'black');

  // For the purposes of this experiment, the triangle is actually broken
  // up into three sub-triangles.  However, as shown later in 6d, this is
  // unnecessary.
  /*
	From: http://www.physicsforums.com/showpost.php?p=212538

	I=\frac{M_{P}}{6A_{P}}\sum_{i=1}^{M}A_{T,i}(\vec{T
	}_{i,1}^{2}+\vec{T}_{i,1}\cdot\vec{T}_{i,2}+\vec{T
	}_{i,1}\cdot\vec{T}_{i,3}+\vec{T}_{i,2}\cdot\vec{T
	}_{i,3}+\vec{T}_{i,2}^{2}+\vec{T}_{i,3}^{2})
  */

  var T01 = new Polygon([T.centroid, P0, P1]);
  var T12 = new Polygon([T.centroid, P1, P2]);
  var T20 = new Polygon([T.centroid, P2, P0]);

  T01.draw(ctx, 'red');
  T12.draw(ctx, 'green');
  T20.draw(ctx, 'blue');

  var foo = function (T) {
	//  var I = (T0.dot(T0) + T1.dot(T1) + T2.dot(T2) +
	//			T0.dot(T1) + T0.dot(T2) + T1.dot(T2))/6;
	var PP1 = T.vs[1].minus(T.vs[0]);
	var PP2 = T.vs[2].minus(T.vs[0]);
	var I = PP1.dot(PP1) + PP1.dot(PP2) + PP2.dot(PP2);
	return T.area*I;
  };

  var Io = (foo(T01) + foo(T12) + foo(T20))/6;
  dumpString('Io='+Io);

  // For comparison:
  var ro = Math.sqrt(2*Io/T.area);
  drawCircle(ctx, T.centroid, ro, 'grey');


  // To compare we calculate some discs centred on the centroid.  The mass
  // moment of inertia of a disc is mr^2/2.  Since we are working in 2D
  // and constant density, we can say that mass = area, and more
  // specifically, T.area.

  // To get an lower bound, we now calculate the mass moment of inertia of
  // a circle sitting totally within the triangle, centred on the centroid
  // of the triangle.  Since it's centred on the centroid, it's not
  // (necessarily or likely to be) the incircle.  The mass moment of
  // inertia MUST be more than this, surely?

  // Create the edge vectors
  var V01 = P1.minus(P0);
  var V02 = P2.minus(P0);
  var V12 = P2.minus(P1);


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


