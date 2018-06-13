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

let	player = new VS3D.Player();
const NPROPS = 2;
const colors = ["orange","white"];
for (let i=0; i<NPROPS; i++) {
	player.addProp(new VS3D.Prop(), {color: colors[i], nudge: i*0.75});
}
player.props[0].setHandAngle(LEFT);
player.props[0].setHeadAngle(LEFT);
player.props[1].setHandRadius(0);
player.props[1].setHeadAngle(LEFT);


function afterReactMounts() {
	renderer = new VS3D.ThreeRenderer(document.getElementById("display"));
	for (let i=0; i<NPROPS; i++) {
		let wrap = clone(player.props[i]);
		player.addProp(wrap.prop, {color: wrap.color, nudge: -wrap.nudge, alpha: 0.6};
	}
	player.update = function(positions) {
		renderer.render(this.props, positions);
	}
	player.reset();
}