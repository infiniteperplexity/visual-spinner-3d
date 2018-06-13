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
let	orange = player.addProp(new VS3D.Prop({hand: {a: LEFT}, head: {a: LEFT}}), {color: "orange", alpha: 0.6, nudged: 0.1});
let	white = player.addProp(new VS3D.Prop({hand: {r: 0}, head: {a: LEFT}}), {color: "white", alpha: 0.6});

let reactProps = {
	"orange": clone(player.props[0].prop),
	"white": clone(player.props[1].prop)
};

let reactMoves = {
	"orange": combo[0].moves,
	"white": combo[1].moves
}

function afterReactMounts() {
	renderer = new VS3D.ThreeRenderer(document.getElementById("display"));
	player.update = function(positions) {
		renderer.render(this.props, positions);
	}
	player.reset();
}