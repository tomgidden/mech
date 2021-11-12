/* Javascript geometric testbed library
 * Copyright (C) Tom Gidden, 2007.
 *
 * This code offers simple functions for experimentation with various
 * geometric ideas, using the <canvas> element.  It builds on the
 * Shapes.js and Vector.js library, and uses some functionality from
 * utils.js.
 */

var ctx;

Circle.prototype.draw = function (ctx, colour, pointcol) {
  drawCircle(ctx, this.O, this.r, colour, pointcol);
};

Line.prototype.draw = function (ctx, colour, arrowcol) {
  drawLine(ctx, this.p, this.q, colour, arrowcol);
};

Polygon.prototype.draw = function (ctx, colour, arrow) {
  for(var i=0; i<this.n; i++) {
	this.ls[i].draw(ctx, colour, arrow);
	drawPoint(ctx, this.vs[i], colour);
  }
  drawPoint(ctx, this.centroid, colour, colour);
};

Polygon.prototype.fill = function (ctx, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(this.vs[0].x, this.vs[0].y);
  for(var i=1; i<this.n; i++)
	ctx.lineTo(this.vs[i].x, this.vs[i].y);
  ctx.fill();
};

if(typeof(Triangulator) != 'undefined')
  Triangulator.prototype.draw = function (ctx, colour, arrow) {
	// Draw all triangles in the Triangulator, using the simple testbed
	// canvas API.  'ctx' is a canvas drawing handle.  'colour' is the line
	// colour to use.  'arrow' is the arrowhead colour to use, if any.
	for(var i=0; i<this.n; i++) {
	  drawLine(ctx, this.vs[i], this.vs[(i+1)%this.n], colour, arrow);
	  drawPoint(ctx, this.vs[i], colour);
	}
  };

function drawLine(ctx, p, q, colour, arrowcol) {
  ctx.strokeStyle = colour;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(q.x, q.y);
  ctx.stroke();

  if(!arrowcol) return;

  var scale = 3;
  var nx = p.y-q.y;
  var ny = q.x-p.x;
  var nm = Math.sqrt(nx*nx + ny*ny);
  nx /= nm;
  ny /= nm;

  var zx = q.x - ny*scale*2.5;
  var zy = q.y + nx*scale*2.5;

  ctx.fillStyle = arrowcol;
  ctx.beginPath();
  ctx.moveTo(q.x, q.y);
  ctx.lineTo(zx - nx*scale, zy - ny*scale);
  ctx.lineTo(zx + nx*scale, zy + ny*scale);
  ctx.fill();
}

function drawPoint(ctx, p, colour, stroke, size2, radius) {
  if(!size2) size2 = 2;
  if(!radius) radius = 5;

  if(stroke) {
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    ctx.moveTo(p.x+radius, p.y);
    ctx.arc(p.x, p.y, radius, 0, Math.PI*2, true);
    ctx.stroke();
  }

  if(colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(p.x-size2, p.y-size2, size2*2, size2*2);
  }
}

function drawCircle(ctx, p, r, colour, pointcol) {
  ctx.strokeStyle = colour;
  ctx.beginPath();
  ctx.moveTo(p.x+r, p.y);
  ctx.arc(p.x, p.y, r, 0, Math.PI*2, true);
  ctx.stroke();
  if(pointcol) drawPoint(ctx, p, pointcol);
}

////////////////////////////////////////////////////////////////////////////
// DIY testbed initiation.  Implement myPaint(), and use this to
// initialise.

var testbedFrameInterval = 0;
var testbedCursor = null;
var testbedCursorIncrement = null; // For animation

var dragging = false;
var dragradius2 = 5*5;
var draggables = [];
var draggingActive = false;

function testbedInit () {
  var c = $('c');
  ctx = c.getContext('2d');

  if(testbedFrameInterval>0) {
	setInterval('testbedIterate()', testbedFrameInterval);
	return;
  }

  myPaint();

  if(typeof(myMove)!='undefined')
	document.onmousemove = myMove;

  else if(testbedCursor instanceof Vector)
	document.onmousemove = testbedMoveCursor;
}

function testbedMoveCursor (e) {
  if(!e)
	var e = window.event;

  if(e) {
	testbedCursor.x = e.clientX;
	testbedCursor.y = e.clientY;
	myPaint();
	return true;
  }
  return false;
}

function testbedIterate () {
  // XXX: UNTESTED:  Not currently using this function
  if(typeof('myIncrement')!='undefined')
	myIncrement();

  else if(testbedCursorIncrement)
	testbedCursor.add(testbedCursorIncrement);

  myPaint();
}

////////////////////////////////////////////////////////////////////////////
// Dragging.  To activate, implement myPaint() as usual, add any
// draggable points or polygons using testbedAddDrag().


function testbedAddDrag(P) {
  if(!draggingActive)
	draggerInit();

  if(P instanceof Vector)
	// A single point was passed
	draggables[draggables.length] = P;

  else if(P instanceof Polygon) {
	// A polygon was passed, so all vertices must be added
	var j = draggables.length;
	for(var i=0; i<P.n; i++)
	  draggables[j++] = P.vs[i];
  }

  else if(P instanceof Array) {
	// An array (presumably of vectors) was passed
	var j = draggables.length;
	for(var i=0; i<P.length; i++) {
	  var V = P[i];
	  if(V instanceof Vector)
		draggables[j++] = V;
	  else
		testbedAddDrag(V);
	}
  }

  else {
	// Haven't a clue.
	alert("Can't add P to dragger");
	die;
  }
}

function draggerInit () {
  document.onmousedown = draggerDown;
  document.onmousemove = draggerMove;
  document.onmouseup = draggerUp;
  draggingActive = true;
}

function draggerMove (e) {
  if (!e) var e = window.event;

  if(dragging) {
	testbedCursor.x = e.clientX;
	testbedCursor.y = e.clientY;
	myPaint();
	return true;
  }
  return false;
}

function draggerDown (e) {
  if (!e) var e = window.event;

  if(dragging) return true;

  for(var i=0; i<draggables.length; i++) {
	var P = draggables[i];
	var dx = e.clientX-P.x;
	var dy = e.clientY-P.y;
	if(dx*dx + dy*dy < dragradius2) {
	  dragging = true;
	  testbedCursor = P;
	  P.x += dx;
	  P.y += dy;
	  myPaint();
	  return true;
	}
  }
  dragging = false;
  myPaint();
  return false;
}

function draggerUp (e) {
  if(dragging) {
	dragging = false;
	testbedCursor = null;
  }
  return true;
}
