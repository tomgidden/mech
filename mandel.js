
function iter(x, y) {
  var max=64;
  var iter=max;
  var sx=x;
  var sy=y;
  while (--iter) {
    var r=x*x;
    var s=y*y;
    if ((r+s)>4) break;
    var y = sy+2*x*y;
    var x = sx+r-s;
  }
  return (max-iter)/max;
}

var hD='0123456789ABCDEF';
function dec2hex(d) {
  var h = hD.substr(d&15,1);
  while (d>15) {
    d>>=4;
    h=hD.substr(d&15,1)+h;
  }
  return h;
}

function myPaint () {
  ctx.clearRect(0, 0, 600, 450);

  var vy = 0;
  for (y=1.5;y>=-1.5;y-=0.005, vy++) {
	var vx = 0;
    var mystr="";
    var it=0;
    for (x=-1.5;x<=1.5;x+=0.005, vx++) {
      it=iter(x,y)*255;
	  ctx.fillStyle = 'rgb('+Math.floor(it)+','+Math.floor((it%128)*2)+','+Math.floor((it%64)*4)+')';
	  ctx.fillRect(vx, vy, 1, 1);
    }
  }
  return;
}
