let renderer, store;
const {
	dummy, fit, fits, matches, 
	angle, nearly, zeroish, vector$spherify, sphere$vectorize, sphere$planify, angle$spherify,
	clone, merge,
	round,
	BEAT,
	LEFT, RIGHT,
	NODES, HEAD, GRIP, HAND, PIVOT, HELPER, BODY,
	parse, stringify, save,
	flatten, submove, beats, spin, resolve, elapsed, cumulate,
	Prop, Move, PropWrapper
} = VS3D;

const NPROPS = 2;
const COLORS = ["red","blue"];
const ANGLES = [LEFT, RIGHT];

let	player = new VS3D.Player();
player.speed = 1;
player.rate = 1;
for (let i=0; i<NPROPS; i++) {
	let prop = player.addProp(new VS3D.Prop(), {color: COLORS[i]});
	prop.setHeadAngle(ANGLES[i]);
	prop.setHandAngle(ANGLES[i]);
}

let panelTicks = -1;
let framePanel;
function afterReactMounts() {
	renderer = new VS3D.ThreeRenderer(document.getElementById("display"), 350, 350);
	// store.dispatch({type: "SET_FRAME", frame: player.tick});
	framePanel = document.getElementById("panelTicks");
	player.update = function(positions) {
		playEngineTick(this.tick, this.props, positions);
	}
	gotoTick(-1);
	renderEngine();
	let controls = new VS3D.Controls(player);
}


