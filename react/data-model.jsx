const UNIT = 60;
const UNITS = 5;
const HALF = UNIT/2;
let X0 = HALF*UNITS;
let Y0 = HALF*UNITS;

// registry of all props
let Props = {
  "red": newProp({head: {x: 1, y: 0}}),
  "blue": newProp({head: {x: 0, y: 1}})
};
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
let Props1 = {
	"red": vs.addProp(),
	"blue": vs.addProp()
}

Props1.red.color = "red";
Props1.blue.color = "blue";
Props1.red.hand.radius = 0;
Props1.blue.hand.radius = 0;
Props1.blue.rotateHand(vs.QUARTER);
Props1.blue.rotateProp(vs.QUARTER);
function setupCanvas() {
	vs.embedById("display");
	vs.ready();
}
setTimeout(setupCanvas,100);

