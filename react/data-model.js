let renderer, store;
const {
	dummy, fit, fits, combinate,
	angle, nearly, zeroish, vector$spherify, sphere$vectorize, sphere$planify,
	clone,
	round,
	BEAT,
	LEFT, RIGHT,
	NODES, HEAD, GRIP, HAND, PIVOT, HELPER, BODY,
	parse, stringify, save,
	flatten, submove, beats, spin, resolve,
	Prop, Move, PropWrapper
} = VS3D;
let combo = parse(json);

const NPROPS = 2;
const COLORS = ["red","blue"];
const ANGLES = [LEFT, RIGHT];

let	player = new VS3D.Player();
for (let i=0; i<NPROPS; i++) {
	let prop = player.addProp(new VS3D.Prop(), {color: COLORS[i]});
	prop.setHeadAngle(ANGLES[i]);
	prop.setHandAngle(ANGLES[i]);
}

function afterReactMounts() {
	renderer = new VS3D.ThreeRenderer(document.getElementById("display"), 350, 350);
	player.update = function(positions) {
		renderer.render(this.props, positions);
		store.dispatch({type: "gotoTick", tick: this.tick});
	}
	store.dispatch({type: "gotoTick", tick: -1});
	store.dispatch({type: "renderEngine"});
	let controls = new VS3D.Controls(player);
}


