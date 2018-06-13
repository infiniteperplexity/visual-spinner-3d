let renderer;
const {clone, LEFT} = VS3D;


let	player = new VS3D.Player();
let	orange = player.addProp(new VS3D.Prop({hand: {a: LEFT}, head: {a: LEFT}}), {color: "orange"});
let	white = player.addProp(new VS3D.Prop({hand: {r: 0}, head: {a: LEFT}}), {color: "white"});

let reactProps = [
	clone(player.props.prop[0]),
	clone(player.props.prop[1])
];

function onLoad() {
	renderer = new VS3D.ThreeRenderer(document.getElementById("display"));
	player.update = function(positions) {
		renderer.render(this.props, positions);
	}
}