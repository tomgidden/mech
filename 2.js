var A = new Vector(100, 200);
var B = new Vector(400, 275);

var P = new Vector(250, 50);                   // Circle centre at t=0
var Q = new Vector(450, 400);                  // Circle centre at t=1
var r = 30;                                    // Circle radius
var e = 1;									   // Elasticity

testbedAddDrag([A, B, P, Q]);

function myPaint () {
  ctx.clearRect(0, 0, 600, 450);

  // L is a line from A to B
  var L = new Line(A, B);
  drawLine(ctx, A, B, 'black', 'black');
  drawPoint(ctx, A, 'black');
  drawLine(ctx, A, A.plus(L.n50), 'cyan', 'cyan');
  drawLine(ctx, B, B.plus(L.n50), 'lime', 'lime');

  // P is the position of the circle at t=0
  drawPoint(ctx, P, 'black', null);
  drawCircle(ctx, P, r, 'black');

  // Q is the position of the circle at t=1
  drawPoint(ctx, Q, 'grey', null);
  drawCircle(ctx, Q, r, 'grey');

  // PQ is the line of motion from t=0 to t=1
  var PQ = new Line(P, Q);
  drawLine(ctx, P, Q, 'black', 'black');

  // v is the vector of motion from t=0 to t=1
  var v = Q.minus(P);

  // vn is the projection of PQ onto L's normal. ie. Component of velocity
  // towards the line.
  var vnmag = L.n.dot(v);
  var vn = L.n.scaled(vnmag);

  // S is the projection of Q onto L's normal.
  var S = P.plus(vn);
  drawLine(ctx, P, S, 'green', 'green');
  drawLine(ctx, S, Q, 'green', 'green');

  // LnS is the line's normal scaled to the radius of the circle (r)
  var LnS = L.n.scaled(r);

  // L2 is a new line parallel to L, offset by one radius towards P
  var L2 = new Line(A.plus(LnS), B.plus(LnS));
  drawPoint(ctx, L2.p, '#aaa');
  drawLine(ctx, L2.p, L2.q, '#aaa', '#aaa');

  // Projection of P onto L2
  var LnSmag2 = r*r;
  var uP = (((L2.p.x - P.x) * LnS.x) + ((L2.p.y - P.y) * LnS.y)) / LnSmag2;
  var a = new Vector(uP*LnS.x, uP*LnS.y);
  var PL2 = P.plus(a);
  drawPoint(ctx, PL2, 'green', 'green');

  // tt = time of impact, calculated using similar triangles.
  var tt = a.magnitude() / vn.magnitude();

  // Centre of circle at t=tt
  var C = P.plus(v.scaled(tt));
  drawPoint(ctx, C, 'red', 'red');

  // If 0<tt<1, then collision occurs in specified timeframe
  if(tt>0 && tt<1) {

	// Draw the collision circle at t=tt
	drawCircle(ctx, C, r, 'red');

	// U is the displacement vector from t=0 to t=tt
	var U = C.minus(Q);

	// U2 is the constraint displacement vector
	var U2 = L2.n.scaled((1+e)*U.dot(L2.n));
	drawLine(ctx, C, C.plus(U2), 'red', 'red');

	// D is the new centre where t=1, ie. Q reflected in L2
	var D = Q.plus(U2);

	// E is the new centre where t=0, ie. P reflected in L2
	var W = C.minus(P);
	var W2 = L2.n.scaled((1+e)*W.dot(L2.n));
	var E = P.plus(W2);

	drawCircle(ctx, D, r, 'blue');
	drawLine(ctx, C, D, 'blue', 'blue');
	drawPoint(ctx, D, 'blue');

	drawCircle(ctx, E, r, 'grey');
	drawLine(ctx, E, C, 'grey', 'grey');
	drawPoint(ctx, E, 'grey');
  }

  $('dump').value = 'time of impact = '+tt;
  return;
}
