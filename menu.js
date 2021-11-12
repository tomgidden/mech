var menuChoices = [
				   ['index.html','Index'],
				   ['1.html','1: Circle in poly test'],
				   ['2.html','2: Circle/Line collision'],
				   ['3a.html','3a: Poly/Circle collision #1'],
				   ['3b.html','3b: Poly/Circle collision #2'],
				   ['4.html','4: Oliver\'s collision test'],
				   ['5.html','5: Triangulation of poly'],
				   ['6a.html','6a: Tri MMI Incorrect bh^3/36 comparison'],
				   ['6b.html','6b: Tri MMI Correct method'],
				   ['6c.html','6c: Tri MMI point-based approx'],
				   ['6d.html','6d: Tri MMI formula/approx comparison'],
				   ['7.html','7: Poly MMI formula/approx comparison'],
				   ['8.html','8: Poly collision forces']
				   ];


////////////////////////////////////////////////////////////////////////////

var menuElement;

function menuLoad() {
  menuElement = $('menu');
  var here = '';
  if(document.location.href.match(/([^\/]+\.html)/))
	here = RegExp.$1;
  for(var i in menuChoices) {
	var opt = document.createElement('option');
	opt.value = menuChoices[i][0];
	opt.text = menuChoices[i][1];
	opt.selected = (here == opt.value);
	menuElement.appendChild(opt);
  }
  menuElement.onchange = menuChange;
}

function menuChange (e) {
  document.location = menuElement.options[menuElement.selectedIndex].value;
}

menuLoad();
