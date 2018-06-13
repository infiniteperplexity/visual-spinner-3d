let renderer;
const {
	snapto,
	socket,
	vector$spherify, sphere$vectorize,
	clone,
	round,
	LEFT,
	NODES, HEAD, GRIP, HAND, PIVOT, HELPER, BODY,
	parse, stringify
} = VS3D;
let combo = parse(json);

const NPROPS = 2;
const COLORS = ["orange","white"];

let	player = new VS3D.Player();
for (let i=0; i<NPROPS; i++) {
	player.addProp(new VS3D.Prop(), {color: COLORS[i]});
	// for now...
	player.props[i].moves = combo[i].moves;
}

let	orange = player.props[0];
let	white = player.props[1];
orange.setHandAngle(LEFT);
orange.setHeadAngle(LEFT);
white.setHandRadius(0);
white.setHeadAngle(LEFT);

function afterReactMounts() {
	renderer = new VS3D.ThreeRenderer(document.getElementById("display"));
	player.update = function(positions) {
		renderer.render(this.props, positions);
	}
	player.reset();
}