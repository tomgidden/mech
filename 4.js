var Z = new Polygon([new Vector(270, 270),
					 new Vector(90, 270), // y must be equal to y of first point.
					 new Vector(70, 155),
					 new Vector(360, 100)]);

// P = Point of impact
var P = new Vector(140, Z.vs[0].y);

// Q = location at t=+1sec
var Q = new Vector(130, 220);

// Set up coefficients for how hard the thing is to translate/turn:
var tc = 1.0;
var ac = 0.5;

var testbedCursor = Q;

function myPaint () {
  $('dump').value = '';

  ctx.clearRect(0, 0, 600, 450);

  // Draw the original polygon
  Z.draw(ctx, 'black');

  // Draw the motion vector V
  var V = Q.minus(P);

  // Original position (at t=0)
  var O = P.minus(V);
  drawLine(ctx, O, Q, 'grey', 'grey');

  // Draw the start and end circles
  drawPoint(ctx, O, 'blue', 'blue');
  drawPoint(ctx, P, 'red', 'red');
  drawPoint(ctx, Q, 'cyan', 'cyan');

  var theta;

  if(V.x == 0)
	theta = Math.PI;
  else
	theta = Math.atan(V.y/V.x);

  if(theta < 0)
	theta += Math.PI;

  var phi;
  if(P.x == 0)
	phi = Math.PI/2;
  else
	phi = Math.atan(P.y/P.x);

  if(phi < 0)
	phi += Math.PI;

  var f = V.magnitude();

  var fr = -f * Math.sin(theta - phi);
  var fo = -f * Math.cos(theta - phi);

  var plength = P.magnitude();

  var T = P.scaled((fo/plength)/tc);

  var turn = Math.deg2rad * (plength*fr/ac) / 310;

  var sturn = Math.sin(turn);
  var cturn = Math.cos(turn);

  var vs = [];
  for(var i in Z.vs) {
	var U = Z.vs[i].plus(T).minus(Z.centroid);
	vs[i] = (new Vector(cturn*U.x - sturn*U.y,
						sturn*U.x + cturn*U.y)).plus(Z.centroid);
  }

  Z2 = new Polygon(vs);
  Z2.draw(ctx, 'grey');

  return;
}
