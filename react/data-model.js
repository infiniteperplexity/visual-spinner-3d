let renderer;
const {
	snapto,
	vector$spherify, sphere$vectorize,
	clone,
	round,
	LEFT,
	NODES, HEAD, GRIP, HAND, PIVOT, HELPER, BODY
} = VS3D;


let	player = new VS3D.Player();
let	orange = player.addProp(new VS3D.Prop({hand: {a: LEFT}, head: {a: LEFT}}), {color: "orange"});
let	white = player.addProp(new VS3D.Prop({hand: {r: 0}, head: {a: LEFT}}), {color: "white"});

let reactProps = {
	"orange": clone(player.props[0].prop),
	"white": clone(player.props[1].prop)
};

function afterReactMounts() {
	renderer = new VS3D.ThreeRenderer(document.getElementById("display"));
	player.update = function(positions) {
		renderer.render(this.props, positions);
	}
	player.reset();
}