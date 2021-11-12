
var P0 = new Vector(200, 100);
var P1 = new Vector(400, 250);
var P2 = new Vector(150, 300);

testbedAddDrag([P0, P1, P2]);

// Number of steps on each axis in the approximation.
var jSteps = 20;
var kSteps = 20;

function myPaint () {

  // Clear the canvas
  ctx.clearRect(0, 0, 600, 450);

  // Create a new polygon from the vertices.  Note, 'true' prevents the
  // Polygon from reordering the vertex order to clockwise, which can
  // seriously screw up since we're changing one of the vertices directly.
  var T = new Polygon([P0, P1, P2], true);

  // Draw the triangle's centroid
  drawPoint(ctx, T.centroid, 'black');

  // Find the longest side.  This is to work out which side is the best
  // basis for the grid.

  // Create the edge vectors
  var V01 = P1.minus(P0);
  var V02 = P2.minus(P0);
  var V12 = P2.minus(P1);

  // Calculate the length of the sides
  var mV01 = V01.magnitude();
  var mV02 = V02.magnitude();
  var mV12 = V12.magnitude();

  // Find the biggest side, PA->PB.  PC is the third point which is the
  // "apex" of the triangle if PA->PB is the base.
  var PA, PB, PC, VAB, VAC, VBC;
  if(mV01 > mV02 && mV01 > mV12) {
	PA = P0;
	PB = P1;
	PC = P2;
  }
  else if(mV02 > mV01 && mV02 > mV12) {
	PA = P2;
	PB = P0;
	PC = P1;
  }
  else {
	PA = P1;
	PB = P2;
	PC = P0;
  }

  // These are actually just V01, V02 and V12 (or their inverses) but it's
  // easier and clearer to recalculate.
  var VAB = PB.minus(PA);
  var VAC = PC.minus(PA);
  var VBC = PC.minus(PB);

  // Draw the edges of our triangle.  The base (VAB) is drawn with an
  // arrowhead.  The other sides go from the base to the apex.
  drawLine(ctx, PA, PB, 'black', 'black');
  drawLine(ctx, PA, PC, 'black');
  drawLine(ctx, PB, PC, 'black');

  // If VAB is the triangle base, then H is the triangle height vector.
  var H = VAB.perpendicular().normal();

  // By projecting against VAC, we not only scale to the altitude of the
  // triangle, but we also point the vector in the correct direction
  // (towards VAB from PC)
  H.scale(-H.dot(VAC));

  // Draw the height vector
  drawLine(ctx, PC, PC.plus(H), 'magenta', 'magenta');

  // Vector increments.  Dj is added per point, and Dk is added per
  // row of points.  As we're working from VAB towards C, we need to
  // invert the height vector before scaling.
  var Dj = VAB.scaled(1/jSteps);
  var Dk = H.scaled(-1/kSteps);

  var edgeFunc = function (v2, v1, p) {
	// edgeFunc for a given edge (v1, v2) and a point (p), returns negatives
	// for points to the 'left' of the edge, and positive for points to the
	// 'right'.  If edge functions for all edges in a 2D triangle return the
	// same sign for a point, then the point is in the triangle.
	var d = v2.minus(v1);
	return (p.x - v1.x)*d.y - (p.y - v1.y)*d.x;
  }

  // Q is the current point being considered in the summation
  var Q = PA.plus(Dj.plus(Dk).scaled(0.5));

  // Ia (I-approx) is the sum of all the individual moments of inertia of
  // the points.  HOWEVER, this will not be scaled correctly in terms of
  // the mass (ie. area) of the triangle.
  var Ia = 0;

  // Total number of points actually summed in Ia
  var count = 0;

  // j and k are iteration counters, equal to coordinates in the grid
  // space.
  var j, k;
  for(k=1; k<=kSteps; k++) {
	for(j=1; j<=jSteps; j++) {

	  // If all the edge functions return the same sign for Q, then the
	  // point is in the triangle.  Otherwise, "continue", ie. bypass the
	  // rest of this iteration.
	  if(edgeFunc(PA, PB, Q)>=0) {
		if((edgeFunc(PB, PC, Q)<0) || (edgeFunc(PC, PA, Q)<0)) {
		  Q.add(Dj);
		  continue;
		}
	  }
	  else if((edgeFunc(PB, PC, Q)>=0) || (edgeFunc(PC, PA, Q)>=0)) {
		Q.add(Dj);
		continue;
	  }

	  // We've found a point in the triangle, so sum it into Ia using
	  // m*r*r.  r is the distance between the point Q and the centroid of
	  // the triangle.  Since we need r*r, we don't actually need to
	  // calculate r as such, so can use Pythagoras without the square
	  // root.
	  //
	  // For the time being, 'm' is 1 although it's actually 1/count, but
	  // we haven't got 'count' yet, so just sum it up for now and we'll
	  // divide up later.
	  var D = Q.minus(T.centroid);
	  Ia += D.x*D.x + D.y*D.y;

	  // Count this particle
	  count++;

	  // Plot it
	  drawPoint(ctx, Q, 'grey');

	  // Move onto the next particle
	  Q.add(Dj);
	}

	// Move onto the next row, by "carriage return" (VAB), and then "line
	// feed" (Dk)
	Q.sub(VAB);
	Q.add(Dk);
  }

  // Scale down the summed "I" by the number of particles and scale up by
  // the mass, ie. the area of the triangle.
  Ia *= T.area / count;
  $('Ia').value = Math.round(Ia);

  // Now we can visualise this as a disc of radius ra: Ia = T.area*ra^2,
  // so ra^2 = Ia/T.area.
  var ra = Math.sqrt(2*Ia/T.area);
  drawCircle(ctx, T.centroid, ra, 'grey');

  // Just out of interest, the angle theta(ACB):
  var aACB = Math.acos(VAC.normal().dot(VBC.normal())) / Math.deg2rad;
  $('aACB').value = Math.round(aACB);


  // To compare we calculate some discs centred on the centroid.  The mass
  // moment of inertia of a disc is mr^2/2.  Since we are working in 2D
  // and constant density, we can say that mass = area, and more
  // specifically, T.area.


  // To get an lower bound, we now calculate the mass moment of inertia of
  // a circle sitting totally within the triangle, centred on the centroid
  // of the triangle.  Since it's centred on the centroid, it's not
  // (necessarily or likely to be) the incircle.  The mass moment of
  // inertia MUST be more than this, surely?

  // Find distances between the centroid and the three edges
  var rC01 = Math.abs(V01.perpendicular().normal().dot(P0.minus(T.centroid)));
  var rC02 = Math.abs(V02.perpendicular().normal().dot(P0.minus(T.centroid)));
  var rC12 = Math.abs(V12.perpendicular().normal().dot(P1.minus(T.centroid)));

  // Find the smallest one
  var rmin = rC01<rC12 ? (rC02<rC01 ? rC02 : rC01) : (rC02<rC12 ? rC02 : rC12);

  // Calculate the mass moment of inertia for this (red) circle
  var Ir = T.area * rmin * rmin / 2;
  drawCircle(ctx, T.centroid, rmin, 'red');
  $('Ir').value = Math.round(Ir);
  $('IaIr').value = Math.round(100*Ia/Ir);


  // Here we calculate the mass moment of inertia of a disc with equal
  // area to the triangle.  Since the triangle will extend outside the
  // disc, it should be higher, but then again, it extends in.  Anyway, I
  // would expect that an equilateral triangle will have a mass moment of
  // inertia in the same rough scale as this disc.
  var ravg = Math.sqrt(T.area / Math.PI);
  var Ig = T.area * ravg * ravg / 2;
  drawCircle(ctx, T.centroid, ravg, 'green');
  $('Ig').value = Math.round(Ig);
  $('IaIg').value = Math.round(100*Ia/Ig);


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
  drawCircle(ctx, T.centroid, rmax, 'blue');
  $('Ib').value = Math.round(Ib);
  $('IaIb').value = Math.round(100*Ia/Ib);

  return;
}


