let move$sphere = function({})

let node$spin = function(node, move, t) {
	let r = node.r + move.vr*t + move.ar*t*t;
	let a = node.a + move.va*t*SPEED + move.aa*t*t*SPEED*SPEED;
	let b = node.b + move.vb*t*SPEED + move.ab*t*t*SPEED*SPEED;
	return sphere(r, a, b);
}

// solve for unknown scalar moments
let solve = function(args) {
	let {x0, x1, v0, v1, a, t} = args;
	let known = {};
	for (let arg in args) {
		known[args] = true;
	}
	if (known.x0 && known.x1 && known.v0 && known.t) {
		a = 2*((x0-x1)/(t*t)-v0/t);
		v1 = v0+a*t;
	} else if (known.x0 && known.v0 && known.a && known.t) {
		x1 = x0+v0*t+a*t*t/2;
		v1 = v0+a*t;
	} else if (known.x0 && known.v0 && known.v1 && known.t) {
		a = (v1-v0)/t;
		x1 = x0+v0*t+a*t*t/2;
	} else {
		console.log(vals);
		throw new Error("solving method unimplemented.");
	}
	return {x0: x0, x1: x1, v0: v0, v1: v1, a: a, t: t};
}

function nodeMove(args) {
	let plane = args.plane || WALL;
	let beats = args.beats || 1;
	let ticks = args.beats*BEAT;
	if ()
}
function SimpleMove(args) {
	this.plane = args.plane || WALL;
	this.beats = args.beats || 1;
	this.nodes = [];
	for (let i=BODY; i<=HEAD; i++) {
		let node = args[node]
		if (i===HEAD) {
			node.radius = (node.radius===undefined) ? 1 : node.radius;
		}
		this.nodes.push(nodeMove(node);
	}
	this.grip = {arc: 0, bend: 0, choke: 0, twist: 0};
}

args = args || {};
		this.plane = args.plane || VS3D.WALL;
		this.beats = args.beats || 1;
		let ticks = this.beats*VS3D.BEATS;
		this.nodes = {};
		for (let n of VS3D.NODES) {
			let node = args[n] || {};
			this.nodes[n] = newNode({plane: this.plane, beats: this.beats, ...node});
		}
		let grip = args.grip || {arc: {}, bend: {}, choke: {}, twist: {}};
		this.grip = newNode({plane: this.plane, beats: this.beats, ...grip});
}















// solve for unknown angular moments
let angle$solve = function(args) {
	// these are tricky because they have +/- spins
	// ...and there's no obvious default spins...it could be either +1 or -1
	// unless we want to assume it's always the shortest path...which will usually be right
	let {x0, x1, v0, v1, a, t, spins} = args;
	let known = {};
	for (let arg in args) {
		known[args] = true;
	}
	if (known.x0 && known.x1 && known.v0 && known.t) {
		a = 2*((x0-x1)/(t*t)-v0/t);
		v1 = v0+a*t;
	} else if (known.x0 && known.v0 && known.a && known.t) {
		x1 = x0+v0*t+a*t*t/2;
		v1 = v0+a*t;
	} else if (known.x0 && known.v0 && known.v1 && known.t) {
		a = (v1-v0)/t;
		x1 = x0+v0*t+a*t*t/2;
	} else {
		console.log(vals);
		throw new Error("solving method unimplemented.");
	}
	return {x0: x0, x1: x1, v0: v0, v1: v1, a: a, t: t};
}