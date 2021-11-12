
// Number of steps on each axis in the approximation.
var jSteps = 20;
var kSteps = 20;


// Both algorithms from Experiments 6d are functionized, and also
// parameterised on the rotation point (O) rather than using the
// triangle's own centroid.  This allows use of the polygon's
// centre-of-gravity instead, the use of which is what we're verifying.

function triangleMMI_exact(T, O) {
  var PP0 = T.vs[0].minus(O);
  var PP1 = T.vs[1].minus(O);
  var PP2 = T.vs[2].minus(O);
  return (PP0.dot(PP0) + PP0.dot(PP1) + PP0.dot(PP2) +
		  PP1.dot(PP1) + PP1.dot(PP2) + PP2.dot(PP2))*T.area/6;
};

function triangleMMI_approx(T, O) {
  // Get points from triangle
  var P0 = T.vs[0];
  var P1 = T.vs[1];
  var P2 = T.vs[2];

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

  // If VAB is the triangle base, then H is the triangle height vector.
  var H = VAB.perpendicular().normal();

  // By projecting against VAC, we not only scale to the altitude of the
  // triangle, but we also point the vector in the correct direction
  // (towards VAB from PC)
  H.scale(-H.dot(VAC));

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
	  // m*r*r.  r is the distance between the point Q and the chosen
	  // rotation axis point (O).  Since we need r*r, we don't actually
	  // need to calculate r as such, so can use Pythagoras without the
	  // square root.
	  //
	  // For the time being, 'm' is 1 although it's actually 1/count, but
	  // we haven't got 'count' yet, so just sum it up for now and we'll
	  // divide up later.
	  var D = Q.minus(O);
	  Ia += D.x*D.x + D.y*D.y;

	  // Count this particle
	  count++;

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
  return Ia * T.area / count;
}



////////////////////////////////////////////////////////////////////////////
// Experiment code:

// The vertices of the polygon
var Vs = [
		  new Vector(400, 400),
		  new Vector(300, 50),
		  new Vector(150, 175),
		  new Vector(100, 50),
		  new Vector( 50, 75),
		  new Vector( 50, 200),
		  new Vector( 70, 160),
		  new Vector(100, 150),
		  new Vector(150, 280),
		  new Vector(50, 300)
		  ];

testbedAddDrag(Vs);



function myPaint () {
  // The polygon to be divided
  var Z = new Polygon(Vs);

  // Triangulation of the polygon is performed by a Triangulator.
  var T = new Triangulator(Z);

  // Get the triangles that make up this polygon
  var Ts = T.triangulate();

  // Clear the canvas
  ctx.clearRect(0, 0, 600, 450);

  // Draw the background of the polygon
  Z.fill(ctx, 'white');

  // Calculate approximate and exact MMIs around the polygon's centroid
  var Ia=0, Ie=0;
  for(var i=0; i<Ts.length; i++) {
	Ts[i].draw(ctx, 'red');
	Ia += triangleMMI_approx(Ts[i], Z.centroid);
	Ie += triangleMMI_exact(Ts[i], Z.centroid);
  }

  // Draw the outline of the polygon
  Z.draw(ctx, 'black', 'black');

  $('Ia').value = Ia;
  $('Ie').value = Ie;
  $('IaIe').value = 100*Ia/Ie;

  return;
}

