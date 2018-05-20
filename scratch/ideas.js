	function spin(one, two, three) {
		// need to handle arrays as well
		if (typeof(three)==="number") {
			if (one.nodes) {
				prop$spin({...one, ...two}, three);
			} else {
				node$spin({...one, ...two}, three);
			}
		} else if (typeof(two)==="number") {
			if (one.nodes) {
				prop$spin(one, two);
			} else {
				node$spin(one, two);
			}
		}
	}
	// ugh...so...in args, you'd want to name the nodes.  but in props, you'd want it as an array.
	// this "parsing" step is going to be very important...it takes the readable args, solves for the missing values, 
	// and so on.
	function prop$spin(args, t) {
		// is this where I add default nodes if they're missing?
		// wait...this needs to make a new prop...
		return newProp({
			nodes: args.nodes.map((node))
		});
		for (let node of arg.nodes) {
			node$spin({p: ...args.p, ...node}, t);
		}
	}

	function node$spin(args, t) {
		return motion$type(args)(args, t);
	}

	function motion$angle(args, t) {
		for (let e of ["r","a","vr","va","ar","aa"]) {
			args[e] = args[e] || 0;
		}
		let r = args.r + args.vr*t + args.ar*t*t;
		let a = args.a + args.va*t*SPEED + args.aa*t*t*SPEED*SPEED;
		let p = args.p || WALL;
		return {r: r, ...angle$spherify(a, p)};
	}

	function motion$vector(args, t) {
		for (let e of ["x","y","z","vx","vy","vz","ax","ay","az"]) {
			args[e] = args[e] || 0;
		}
		let x = args.x + args.vx*t + args.ax*t*t;
		let y = args.y + args.vy*t + args.ay*t*t;
		let z = args.z + args.vz*t + args.az*t*t;
		return vector(x,y,z);
	}


	function motion$defaults(args) {
		args = args || {};
		let m = {};
		if (motion$type(args)===motion$vector) {
			let m = {};
			for (let e of ["x","y","z","vx","vy","vz","ax","ay","az"]) {
				m[e] = args[e] || 0;
			}
			return m;
		} else if (motion$type(args)===motion$grip) {
			for (let e of ["arc","twist","choke","bend","va","vt","vc","vb","aa","at","ac","ab"]) {
				m[e] = args[e] || 0;
			}
		} else {
			for (let e of ["r","a","vr","va","ar","aa"]) {
				m[e] = args[e] || 0;
			}
			m.p = p || WALL;
			return m;
		}
	}
	function motion$type(m) {
		if (m.x!==undefined || m.y!==undefined || m.z!==undefined) {
			return motion$vector;
		} else if (m.arc!==undefined || m.twist!==undefined || m.choke!==undefined || m.bend!==undefined) {
			return motion$grip;
		} else if (m.r!==undefined || m.a!==undefined || m.p!==undefined) {
			return motion$angle;
		} else {
			throw new Error("checking type of invalid motion.");
		}
	}
	function motion$spin(m) {
		return motion$type(m)(m);
	}


	let node$spin = function(node, move, t) {
		let r = node.r + move.vr*t + move.ar*t*t;
		let a = node.a + move.va*t*SPEED + move.aa*t*t*SPEED*SPEED;
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