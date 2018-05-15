const UNIT = 60;
const UNITS = 5;
const HALF = UNIT/2;
let X0 = HALF*UNITS;
let Y0 = HALF*UNITS;

// registry of all props

// Node structure of Props
let NODES = [0,1,2/*,3,4*/], [BODY,/*PIVOT,HELPER,*/HAND,HEAD] = NODES;

// factory function for new props
function newProp({body={x:0, y:0},/*pivot={x:0, y:0},helper={x:0,y:0},*/hand={x:0,y:0}, head={x:1,y:1}}) {
  return [
    {x: body.x*UNIT, y: body.y*UNIT},
//    {x: pivot.x*UNIT, y: pivot.y*UNIT},
//    {x: helper.x*UNIT, y: helper.y*UNIT},
    {x: hand.x*UNIT, y: hand.y*UNIT},
    {x: head.x*UNIT, y: head.y*UNIT}
  ];
}


let vs = VS3D.VisualSpinnerWidget();
let VProps = {
	"red": vs.addProp(),
	"blue": vs.addProp()
}

VProps.red.color = "red";
VProps.blue.color = "blue";
VProps.red.hand.radius = 0;
VProps.blue.hand.radius = 0;
VProps.blue.rotateHand(vs.QUARTER);
VProps.blue.rotateProp(vs.QUARTER);
function setupCanvas() {
	vs.embedById("display");
	vs.ready();
}
setTimeout(setupCanvas,100);

function round(n, step) {
  return Math.round(n/step)*step;
}

function vector2sphere(x,y,z,precision) {
	let r = Math.sqrt(x*x+y*y+z*z);
	let zz = Math.acos(z/r);
	let a = Math.atan2(y,z);
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
	return sphere2vector(radius, zenith, azimuth, 0.001);
}

let Props = {
  "red": newProp({hand: node2vector(VProps.red.hand), head: node2vector(VProps.red.prop)}),
  "blue": newProp({hand: node2vector(VProps.blue.hand), head: node2vector(VProps.blue.prop)})
};