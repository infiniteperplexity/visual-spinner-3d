const UNIT = 60;
const UNITS = 5;
const HALF = UNIT/2;
let X0 = HALF*UNITS;
let Y0 = HALF*UNITS;

// Node structure of Props
let NODES = [0,1,2/*,3,4*/], [BODY,/*PIVOT,HELPER,*/HAND,HEAD] = NODES;

let vs = VS3D.VisualSpinnerWidget();
let Props = {
	"orange": vs.addProp(),
	"white": vs.addProp()
}

Props.orange.color = "orange";
Props.white.color = "white";
Props.orange.hand.radius = 0;
Props.white.hand.radius = 0;
Props.white.rotateHand(vs.QUARTER);
Props.white.rotateProp(vs.QUARTER);
function setupCanvas() {
	vs.embedById("display");
	vs.ready();
}
setTimeout(setupCanvas,100);

function round(n, step) {
  return Math.round(n/step)*step;
}

function vector2sphere(x,y,z,precision) {
	let r = Math.sqrt(x*x+y*y+z*z) || vs.TINY;
	let zz = Math.acos(z/r);
	let a = Math.atan2(y,x);
	if (precision) {
		r = round(r,precision);
	}
	return {r: r, z: zz, a: a};
}

function sphere2vector(r,z,a,precision) {
	let x = r*Math.cos(a)*Math.sin(z);
	let y = r*Math.sin(a)*Math.sin(z);
	let zz = r*Math.cos(z);
	if (precision) {
		x=round(x,precision);
		y=round(y,precision);
		zz=round(zz,precision);
	}
	return {x: x, y: y, z: zz};
}


function node2vector(node) {
  let {radius, zenith, azimuth} = node;
  return sphere2vector(UNIT*radius, zenith, azimuth, 1);
}

// should bypass this and do it in the store directly
// this should probably be a orangeux action (store.dispatch)

// manually update the VS3D interface
function vs3dUpdate() {
	// store.getState()
	// extract rza values from the orangeux store
	// set hand zenith, radius for each prop
	// do we need to trigger a re-render manually?
}