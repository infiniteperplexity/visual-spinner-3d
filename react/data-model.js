let renderer, store;
const {
	snapto,
	socket, fit,
	vector$spherify, sphere$vectorize, sphere$planify,
	clone,
	round,
	BEAT,
	LEFT, RIGHT,
	NODES, HEAD, GRIP, HAND, PIVOT, HELPER, BODY,
	parse, stringify,
	flatten, submove, beats, spin, resolve,
	Prop, Move
} = VS3D;
let combo = parse(json);

const NPROPS = 2;
// const COLORS = ["orange","white"];
const COLORS = ["red","blue"];
const ANGLES = [LEFT, RIGHT];

let	player = new VS3D.Player();
for (let i=0; i<NPROPS; i++) {
	let prop = player.addProp(new VS3D.Prop(), {color: COLORS[i]});
	prop.setHeadAngle(ANGLES[i]);
	prop.setHandAngle(ANGLES[i]);
	// player.props[i].moves = combo[i].moves;
	prop.moves = [resolve(fit(prop.prop, new Move()))]
}

// let	orange = player.props[0];
// let	white = player.props[1];
// orange.setHandAngle(LEFT);
// orange.setHeadAngle(LEFT);
// white.setHandRadius(0);
// white.setHeadAngle(LEFT);

function afterReactMounts() {
	renderer = new VS3D.ThreeRenderer(document.getElementById("display"));
	player.update = function(positions) {
		renderer.render(this.props, positions);
	}
	store.dispatch({type: "gotoTick", tick: 0});
	store.dispatch({type: "renderEngine"});
	let controls = new VS3D.Controls(player);
	//renderer.div.appendChild(controls.div);
}


