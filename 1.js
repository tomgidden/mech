
var poly = new Polygon([new Vector(200, 150),
                        new Vector(400, 200),
                        new Vector(500, 300),
                        new Vector(100, 325)], true);

var o = new Vector(100, 10);                   // Circle centre
var r = 40;                                    // Circle radius
var d = new Vector(2, 4);                      // Animation delta

testbedCursor = o;


function closestPointOnLineToPoint (p, q, r) {
  // XXX: No longer used?

  var pq = q.minus(p);           // This could be cached.
  var pqmag2 = pq.magnitude2();  // This could be cached.
  var rp = p.minus(r);

  var u = rp.dot(pq) / pqmag2;

  return [new Vector(p.x + u*pq.x, p.y + u*pq.y), u];
}

function doesLineIntersectCircle (p, q, o, r) {
  // XXX: This function is rewritten and explained better in
  // experiment3.js

  var pq = q.minus(p);
  var op = p.minus(o);
  var a = pq.magnitude2();
  var b = 2*pq.dot(op);
  var c = o.magnitude2()
	+ p.magnitude2()
	- 2*o.dot(p)
	- r*r;
  var bb4ac = b*b - 4*a*c;

  var sqrtbb4ac = Math.sqrt(bb4ac);

  var u1 = (-b + sqrtbb4ac)/(2*a);
  var u  = -b / (2*a);
  var u2 = (-b - sqrtbb4ac)/(2*a);

  return [p.plus(pq.scaled(u1)),
		  p.plus(pq.scaled(u)),
		  p.plus(pq.scaled(u2)),
		  u1, u, u2];
}

Polygon.prototype.draw = function () {
  // Override.. we don't need the normal stuff, but we do want normals.
  for(var i=0; i<this.n; i++) {
    var l = this.ls[i];
    drawLine(ctx, l.p, l.q, 'black', 'black');
    drawLine(ctx, l.p, l.p.plus(l.n50), 'cyan', 'cyan');
    drawLine(ctx, l.q, l.q.plus(l.n50), 'magenta', 'magenta');
  }
};

function myPaint () {
  ctx.clearRect(0, 0, 600, 450);

  poly.draw();

  drawPoint(ctx, o, 'blue', 'black');

  var collidesWithLine = false;
  var allNegative = true;

  for(var i=0; i<poly.ls.length; i++) {
    var l = poly.ls[i];

    var ss = doesLineIntersectCircle(l.p, l.q, o, r);
    if(ss==null)
      allNegative = false;
    else {
      var os = o.minus(ss[1]);
      var dp = os.dot(l.n);

      if(dp>0) allNegative = false;

      if(ss[3]>0 && ss[3]<1) collidesWithLine = true;
      if(ss[5]>0 && ss[5]<1) collidesWithLine = true;

	  if(!isNaN(ss[3])) drawPoint(ctx, ss[0], 'red', ss[3]<0?'red':ss[3]>1?'blue':'black');
	  if(!isNaN(ss[5])) drawPoint(ctx, ss[2], 'blue', ss[5]<0?'red':ss[5]>1?'blue':'black');

	  drawPoint(ctx, ss[1], 'black', ss[4]<0?'red':ss[4]>1?'blue':'black');
      drawLine(ctx, o, ss[1], dp<0 ? 'red' : 'blue', dp<0 ? 'red' : 'blue');
    }
  }

  if(allNegative)
    if(collidesWithLine)
      drawCircle(ctx, o, r, 'magenta');
    else
      drawCircle(ctx, o, r, 'red');
  else
    if(collidesWithLine)
      drawCircle(ctx, o, r, 'cyan');
    else
      drawCircle(ctx, o, r, 'black');
}

