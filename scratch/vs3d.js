VS3D = function() {
	let VS3D = {};
	// useful constants
	const SMALL = VS3D.SMALL = 0.001;
	const TINY = VS3D.TINY = 0.0001;
	const UNIT = VS3D.UNIT = 2*Math.PI/360;
	const BODY = VS3D.BODY = 0;
	const PIVOT = VS3D.PIVOT = 1;
	const HELPER = VS3D.HELPER =2;
	const HAND = VS3D.HAND = 3;
	const HEAD = VS3D.HEAD = 4;
	const NODES = VS3D.NODES = ["body","pivot","helper","hand","head"];
	const WALL = VS3D.WALL = plane(0,0,1);
	const WHEEL = VS3D.WHEEL = plane(1,0,0);
	const FLOOR = VS3D.FLOOR = plane(0,1,0);
	const XAXIS = VS3D.XAXIS = vector(1,0,0);
	const YAXIS = VS3D.YAXIS = vector(0,1,0);
	const ZAXIS = VS3D.ZAXIS = vector(0,0,1);
	const MEASURE = VS3D.MEASURE = 4;
	const TICKS = VS3D.TICKS = 360;
	const BEAT = VS3D.BEAT = TICKS/MEASURE;
	const SPEED = VS3D.SPEED = 1;


	const NORTH = VS3D.NORTH = 0;
	const EAST = VS3D.EAST = 0.25*2*Math.PI/UNIT;
	const SOUTH = VS3D.SOUTH = 0.50*2*Math.PI/UNIT;
	const WEST = VS3D.WEST = 0.75*2*Math.PI/UNIT;
	const NORTHEAST = VS3D.NORTHEAST = 0.125*2*Math.PI/UNIT;
	const SOUTHEAST = VS3D.SOUTHEAST = 0.375*2*Math.PI/UNIT;
	const SOUTHWEST = VS3D.SOUTHWEST = 0.625*2*Math.PI/UNIT;
	const NORTHWEST = VS3D.NORTHWEST = 0.875*2*Math.PI/UNIT;
	const NEAR = VS3D.NEAR = 0.25*2*Math.PI/UNIT;
	const FAR = VS3D.FAR = 0.75*2*Math.PI/UNIT;
	const N = VS3D.N = NORTH;
	const E = VS3D.E = EAST;
	const S = VS3D.S = SOUTH;
	const W = VS3D.W = WEST;
	const NE = VS3D.NE = NORTHEAST;
	const SE = VS3D.SE = SOUTHEAST;
	const SW = VS3D.SW = SOUTHWEST;
	const NW = VS3D.NW = NORTHWEST;
	const TWELVE = VS3D.TWELVE = NORTH;
	const THREE = VS3D.THREE = EAST;
	const SIX = VS3D.SIX = SOUTH;
	const NINE = VS3D.NINE = WEST;
	const UP = VS3D.UP = NORTH;
	const DOWN = VS3D.DOWN = SOUTH;
	const RIGHT = VS3D.RIGHT = EAST;
	const LEFT = VS3D.LEFT = WEST;

	const CLOCKWISE = VS3D.CLOCKWISE = 1;
	const COUNTERCLOCKWISE = VS3D.COUNTERCLOCKWISE = -1;
	const CW = VS3D.CW = CLOCKWISE;
	const COUNTER = VS3D.COUNTER = COUNTERCLOCKWISE;
	const CCW = VS3D.CCW = COUNTERCLOCKWISE;
	const QUARTER = VS3D.QUARTER = 0.25*2*Math.PI/UNIT;
	const HALF = VS3D.HALF = 2*QUARTER;
	const SPLIT = VS3D.SPLIT = HALF;
	const SAME = VS3D.SAME = 0;
	const TOGETHER = VS3D.TOGETHER = 0;
	const OPPOSITE = VS3D.OPPOSITE = SPLIT;
	const TOG = VS3D.TOG = TOGETHER;
	const OPP = VS3D.OPP = OPPOSITE;
	const DIAMOND = VS3D.DIAMOND = 0;
	const BOX = VS3D.BOX = SPLIT;
	const INSPIN = VS3D.INSPIN = 1;
	const FORWARD = VS3D.FORWARD = 1;
	const ANTISPIN = VS3D.ANTISPIN = -1;
	const BACKWARD = VS3D.BACKWARD = -1;
	const NONE = VS3D.NONE = 0;

	let MoveFactory = {};

	/// immutability helper
	function clone(obj) {
	  let nobj = {...obj};
	  for (let prop in nobj) {
	    if (typeof(nobj[prop])==="object") {
	      nobj[prop] = {...clone(nobj[prop])};
	    }
	  }
	  return nobj;
	}

	function merge(obj1, obj2) {
		let nobj = clone(obj1);
		for (let prop in obj2) {
			if (typeof(obj2[prop])==="object") {
				if (typeof(nobj[prop])==="object") {
					nobj[prop] = merge(nobj[prop], obj2[prop]);
				} else if (nobj[prop]===undefined) {
					nobj[prop] = clone(obj2[prop]);
				}
			} else if (obj2[prop]!==undefined) {
				nobj[prop] = obj2[prop];
			}
		}
		return nobj;
	}

	// *** scalar functions
	function round(n, step) {
 		return Math.round(n/step)*step;
	}
	// is this scalar close enough to zero?
	function zeroish(n, delta) {
		return nearly(n, 0, delta);
	}
	// are these two scalars close enough?
	function nearly(n1, n2, delta) {
		delta = delta || TINY;
		return (Math.abs(n1-n2)<delta);
	}

	// normalize scalars into angles
	function angle(a) {
    	while (a<0) {
    		a+=(2*Math.PI/UNIT);
    	}
    	while (a>(2*Math.PI/UNIT)) {
    		a-=(2*Math.PI/UNIT);
    	}
    	return a;
	}
	// nearly, but for angles
	function angle$nearly(a1, a2, delta) {
		a1 = angle(a1);
		a2 = 
		angle(a2);
		return (nearly(a1,a2,delta) || nearly(a1+1,a2,delta) || nearly(a1,a2+1,delta));
	}
	// zeroish, but for angles
	function angle$zeroish(a, delta) {
		return angle$nearly(a, 0, delta);
	}

	// compose scalars into vector
	function vector(x,y,z) {
		return {x: x, y: y, z: z};
	}
	// nearly, but for vectors
	function vector$nearly(v1,v2,delta) {
		return (nearly(v1.x,v2.x,delta) && nearly(v1.y,v2.y,delta) && nearly(v1.z,v2.z,delta));
	}
	// zeroish, but for vectors
	function vector$zeroish(vec,delta) {
		return vector$nearly(vec,vector(0,0,0),delta);
	}
	// find the unit vector of a vector
	function vector$unitize(vec) {
		if (vector$zeroish(vec)) {
			return clone(vec);
		}
		let {x, y, z} = vec;
		let len = vector$magnitude(vec);
		return vector(x/len,y/len,z/len);
	}
	// find the magnitude of a vector
	function vector$magnitude(vec) {
		let {x, y, z} = vec;
		return Math.sqrt(x*x+y*y+z*z);
	}
	// convert a vector to intuitive-spherical coordinates
	function vector$spherify(vec) {
		let {x, y, z} = vec;
		let r = Math.sqrt(x*x+y*y+z*z) || TINY;
		let a = Math.acos(y/r)/UNIT;
		let b = Math.atan2(z,x)/UNIT;
		if (Math.abs(b)>90) {
			b = Math.sign(b)*(180-b);
			a = angle(0-a);
		}
		a = angle(a);
		b = angle(b);
		return {r: r, a: a, b: b};
	}


	// find the vector halfway between two vectors
	function vector$bisector(v1, v2) {
		let v = vector(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
		return vector$unitize(v);
	}
	// rotate a vector around an axis
	// doesn't 
	function vector$rotate(vec, ang, axis) {
		axis = axis || WALL;
		let {x, y, z} = vec;
		let {x: u, y: v, z: w} = axis;
		// the y and z axes are flipped
		v = -v;
		w = -w;
		let s = (u*x+v*y+w*z);
		let t = (u*u+v*v+w*w);
		let sq = Math.sqrt(t);
		let cs = Math.cos(ang*UNIT);
		let sn = Math.sin(ang*UNIT);
		let a = (u*s*(1-cs)+t*x*cs+sq*(v*z-w*y)*sn)/t;
		let b = (v*s*(1-cs)+t*y*cs+sq*(w*x-u*z)*sn)/t;
		let c = (w*s*(1-cs)+t*z*cs+sq*(u*y-v*x)*sn)/t;
		return vector(a,b,c);
	}
	// cross product of two vectors
	function vector$cross(v1, v2) {
		let {x: x1, y: y1, z: z1} = v1;
		let {x: x2, y: y2, z: z2} = v2;
		let x = y1*z2 - z1*y2;
		let y = z1*x2 - x1*z2;
		let z = x1*y2 - y1*x2;
		return vector(x,y,z);
	}
	// dot product of two vectors
	function vector$dot(v1, v2) {
		let {x: x1, y: y1, z: z1} = v1;
		let {x: x2, y: y2, z: z2} = v2;
		return x1*x2+y1*y2+z1*z2;
	}
	// project a vector onto the plane defined by an axis
	function vector$project(vec, axis) {
		axis = axis || WALL;
		let {x: vx, y: vy, z: vz} = vec;
		let {x: ax, y: ay, z: az} = axis;
		let d = vector$dot(vec, axis);
		let x = vx-d*ax;
		let y = vy-d*ay;
		let z = vz-d*az;
		return vector(x,y,z);
	}
	// calculate the angle between two vectors
	function vector$between(v1, v2) {
		let a = Math.acos(vector$dot(v1, v2)/(vector$magnitude(v1)*vector$magnitude(v2)))/UNIT;
		//console.log(vector$cross(v1, v2));
		//console.log(vector$cross(v2, v1));
		// // this is the hackiest thing in the world...
		// 	// ...there must be a better way to ensure a certain direction of measurement
		if (vector$nearly(v1, vector$rotate(v2, a))) {
			return a;
		} else {
			return -a;
		}
		return a;
	}
	// reference vector is arbitrarily defined
	function plane$reference(vec) {
		// this has been tested only for the main three planes
		let {x,y,z} = vec;
		// if this is WALL or the zero vector, use the +y axis
		if (x===0 && y===0) {
			return vector(0,1,0);
		}
		// otherwise, return the intersection of this and the WALL plane in the first or second quadrant
		return vector$unitize(vector(y,x,0));
	}

 	// compose a spherical coordinate from a scalar and two angles
	function sphere(r,a,b) {
		return {r: r, a: angle(a), b: angle(b)};
	}
	// convert a spherical coordinate into a vector
	function sphere$vectorize(s) {
		let {r, a, b} = s;
		let x = r*Math.sin(UNIT*a)*Math.cos(UNIT*b);
		let z = r*Math.sin(UNIT*a)*Math.sin(UNIT*b);
		let y = r*Math.cos(UNIT*a);
		return {x: x, y: y, z: z};
	}

	// nearly, but for spherical coordinates
	function sphere$nearly(s1,s2,delta) {
		let v1 = sphere$vectorize(s1);
		let v2 = sphere$vectorize(s2);
		return vector$nearly(v1,v2,delta);
	}
	// nearly, but for spherical coordinates
	function sphere$zeroish(s,delta) {
		let s2 = sphere(0,0,0);
		return sphere$nearly(s,s2,delta);
	}
	// convert a spherical coordinate to an angle in a given plane
	function sphere$planify(s, p) {
		p = p || WALL;
		if (sphere$zeroish(s)) {
			return 0;
		}
		let v = vector$project(sphere$vectorize(s),p);
		return vector$between(v,plane$reference(p));		
	}
	// vector, but aliased for clarity
	function plane(x, y, z) {
		return vector(x, y, z);
	}
	// set a particular angle from the reference vector in a plane
	function angle$vectorize(ang, p) {
		p = p || WALL;
		let v = vector$rotate(plane$reference(p), ang, p);
		return v;
	}
	function angle$spherify(ang, p) {
		return vector$spherify(angle$vectorize(ang, p));
	}
	function angle$rotate(s, ang, p) {
		p = p || WALL;
		let {r, a, b} = s;
		if (angle$zeroish(ang)) {
			return sphere(r, a, b);
		}
		r = r || TINY;
		let projected = vector$project(sphere$vectorize(s),p);
		let v = vector$unitize(vector$rotate(projected, ang, p));
		s = vector$spherify(v);
		return {r: r, ...s}
	}

	// create a new, default prop
	function Prop(args) {
		args = args || {};
		// set default values for node positions
		args.body = args.body || {r: 0, a: 0, b: 0};
		args.pivot = args.pivot || {r: 0, a: 0, b: 0};
		args.helper = args.helper || {r: 0, a: 0, b: 0};
		args.hand = args.hand || {r: 0, a: 0, b: 0};
		// all zeroes except for head
		args.head = args.head || {r: 1, a: 0, b: 0};

		// do I allow "radius", "angle", or "bearing"?
		// also, don't I need angles here?
		args.body.r = args.body.r || args.body.radius || 0;
		args.body.a = args.body.a || args.body.angle|| 0;
		args.body.b = args.body.b || args.body.bearing || 0;
		args.pivot.r = args.pivot.r || args.pivot.radius || 0;
		args.pivot.a = args.pivot.a || args.pivot.angle|| 0;
		args.pivot.b = args.pivot.b || args.pivot.bearing || 0;
		args.helper.r = args.helper.r || args.helper.radius || 0;
		args.helper.a = args.helper.a || args.helper.angle|| 0;
		args.helper.b = args.helper.b || args.helper.bearing || 0;
		args.hand.r = args.hand.r || args.hand.radius || 0;
		args.hand.a = args.hand.a || args.hand.angle|| 0;
		args.hand.b = args.hand.b || args.hand.bearing || 0;
		args.head.r = args.head.r || args.head.radius || 0;
		args.head.a = args.head.a || args.head.angle|| 0;
		args.head.b = args.head.b || args.head.bearing || 0;
		args.grip = args.grip || {a: 0, b: 0, c:0, t:0}
		return {
			body: args.body,
			pivot: args.pivot,
			helper: args.helper,
			hand: args.hand,
			head: args.head,
			grip: args.grip
		}
	}

	function Move(args) {
		args = args || {};
		let p = args.p || WALL;
		let beats = args.beats || 4;
		// set default values for node positions
		let body = merge({r: 0, a: 0, p: p}, args.body);
		let pivot = merge({r: 0, a: 0, p: p}, args.pivot);
		let helper = merge({r: 0, a: 0, p: p}, args.helper);
		let hand = merge({r: 0, a: 0, p: p}, args.hand);
		//all zeroes except for head
		let head = merge({r: 1, a: 0, p: p}, args.head);
		//do I allow "radius", "angle", or "bearing"?
		let grip = merge({a: 0, b: 0, c:0, t:0}, args.grip);
		return {
			body: body,
			pivot: pivot,
			helper: helper,
			hand: hand,
			head: head,
			grip: grip,
			p: p,
			beats: beats
		}
	}

	// given that I'm making Player, should this still overload?
	function spin(p, m, t) {
		if (typeof(m)==="number") {
			t = m;
			m = p;
		} else {
			m = fit(p, m);
		}
		if (Array.isArray(m)) {
			let past = 0;
			let i = 0;
			while (past<=t) {
				let ticks = beats(m[i])*BEAT || 1*BEAT;
				if (past+ticks>=t) {
					return spin(m[i], t-past);
				} else {
					past+=ticks;
					i=(i+1)%m.length;
				}
			}
		}
		if (Array.isArray(m)) {
			console.log("shouldn't have gotten here");
		}
		return prop$spin(m, t);
	}

	function beats(move) {
		if (Array.isArray(move)) {
			let b = 0;
			for (let m of move) {
				b+=(beats(m) || 1);
			}
			return b;
		} else {
			return (move.beats || 1);
		}
	}

	function fits(prop, move) {
		if (Array.isArray(move)) {
			return fits(prop, move[0]);
		}
		return (	sphere$nearly(node$sum(prop, HAND),node$sum(move$spherify(move), HAND))
					&& sphere$nearly(node$sum(prop, HEAD),node$sum(move$spherify(move), HEAD)));
	}

	function fit(prop, move) {
		if (Array.isArray(move)) {
			return chain(prop, move);
		} else {
			if (move.nofit) {
				return move;
			}
			let plane = move.p || WALL;
			let {body, pivot, helper, hand, head, grip} = prop;
			body = {r: body.r, a: sphere$planify(body, plane), p: plane};
			pivot = {r: pivot.r, a: sphere$planify(pivot, plane), p: plane};
			helper = {r: helper.r, a: sphere$planify(helper, plane), p: plane};
			hand = {r: hand.r, a: sphere$planify(hand, plane), p: plane};
			//console.log(hand);
			head = {r: head.r, a: sphere$planify(head, plane), p: plane};
			if (fits(prop, move)) {
				return move;
			} else {
				return refit(prop, move);
			}
		}
	}
	function node$sum(prop, n) {
		let [xs, ys, zs] = [0, 0, 0];
		for (let i=BODY; i<n; i++) {
			let {x, y, z} = sphere$vectorize(prop[NODES[i]]);
			xs+=x;
			ys+=y;
			zs+=z;
		}
		return vector$spherify(vector(xs,ys,zs));
	}

	function move$spherify(move) {
		if (Array.isArray(move)) {
			console.log("need to handle this");
		}
		let {p, body, pivot, helper, hand, head, grip, beats} = move;
		p = p || WALL;
		body = (body) ? {...angle$spherify(body.a, p), r: body.r} : sphere(0,0,0);
		pivot = (pivot) ? {...angle$spherify(pivot.a, p), r: pivot.r} : sphere(0,0,0);
		helper = (helper) ? {...angle$spherify(helper.a, p), r: helper.r} : sphere(0,0,0);
		hand = (hand) ? {...angle$spherify(hand.a, p), r: hand.r} : sphere(0,0,0);
		head = (head) ? {...angle$spherify(head.a, p), r: head.r} : sphere(1,0,0);
		return {
			body: body,
			pivot: pivot,
			helper: helper,
			hand: hand,
			head: head,
			grip: grip,
			p: p,
			beats: beats
		};
	}

	// now figure out chaining, and *maybe* figure out named moves
	function socket(move) {
		if (Array.isArray(move)) {
			return socket(move[0]);
		}
		move.beats = move.beats || 1;
		return prop$spin(move, move.beats*BEAT);
	}

	function refit(prop, move) {
		if (Array.isArray(move)) {
			console.log("need to handle refit");
		}
		let plane = move.p || WALL;
		// !!!in a perfect world, this would have a preference for keeping defaults on body, pivot, or hinge
		let {body, pivot, helper, hand, head, grip} = prop;
		body = {r: body.r, a: sphere$planify(body, plane), p: plane};
		pivot = {r: pivot.r, a: sphere$planify(pivot, plane), p: plane};
		helper = {r: helper.r, a: sphere$planify(helper, plane), p: plane};
		hand = {r: hand.r, a: sphere$planify(hand, plane), p: plane};
		head = {r: head.r, a: sphere$planify(head, plane), p: plane};
		let aligned = {
			body: merge(move.body, body),
			pivot: merge(move.pivot, pivot),
			helper: merge(move.helper,helper),
			hand: merge(move.hand, hand),
			head: merge(move.head, head),
			grip: merge(move.grip, grip),
			beats: move.beats,
			p: plane
		};
		if (move.recipe) {
			return MoveFactory.build[move.recipe](merge(aligned, move));
		}
		return aligned;
	}

	function realign(prop, move) {
		let oriented = move;
		for (let i=0; i<move.length; i++) {
			if (fits(prop, oriented)) {
				return oriented;
			} else {
				let head = oriented[0];
				let tail = oriented.slice(1);
				oriented = tail.concat(head);
			}
		}
		console.log("realignment failed");
		return move;
	}
	
	function chain(prop, arr) {
		if (Array.isArray(prop)) {
			arr = prop;
		} else {
			arr[0] = fit(prop,arr[0]);
		}
		for (let i=1; i<arr.length; i++) {
			arr[i] = fit(socket(arr[i-1]),arr[i]);
		}
		return arr;
	}


	function prop$spin(args, t) {
		let p = args.p || WALL;
		let beats = args.beats || 1;
		// why are these spheres and not planar angles?
		args.body = args.body || {r: 0, a: 0, p: p};
		args.pivot = args.pivot || {r: 0, a: 0, p: p};
		args.helper = args.helper || {r: 0, a: 0, p: p};
		args.hand = args.hand || {r: 0, a: 0, p: p};
		args.head = args.head || {r: 1, a: 0, p: p};
		args.grip = args.grip || {a: 0, b: 0, c: 0, t: 0};
		return {
			body: node$spin({beats: beats, p: p, ...args.body}, t),
			pivot: node$spin({beats: beats, p: p, ...args.pivot}, t),
			helper: node$spin({beats: beats, p: p, ...args.helper}, t),
			hand: node$spin({beats: beats, p: p, ...args.hand}, t),
			head: node$spin({beats: beats, p: p, ...args.head}, t),
			grip: {beats: beats, p: p, a: 0, b: 0, c: 0, t: 0}
		}
	}


	// okay...so, the challenge with the solver...
		// we need to put defaults in there somewhere
		// we're currently doing it in motion$rotate
		// but we need to do it before, right?
		// we could do it in the solver...
	function node$spin(args, t) {
		args = alias(args);
		let {p, beats} = args;
		let {x0: r, v0: vr, a: ar} = solve({x0: args.r, x1: args.r1, v0: args.vr, v1: args.vr1, a: args.ar, t: beats*BEAT});
		let {x0: a, v0: va, a: aa} = solve({x0: args.a, x1: args.a1, v0: args.va, v1: args.va1, a: args.aa, t: beats*BEAT, c: args.c});
		//return motion$rotate({r: parseInt(r), vr: parseInt(vr), ar: ar, a: a, va: va, aa: aa, p:p}, t);
		return motion$rotate({r: r, vr: vr, ar: ar, a: a, va: va, aa: aa, p:p}, t);

	}

	function motion$rotate(args, t) {
		for (let e of ["r","a","vr","va","ar","aa"]) {
			args[e] = args[e] || 0;
		}
		args.p = args.p || WALL;
		let r = args.r + args.vr*t + args.ar*t*t/2;
		let a = args.a + args.va*t*SPEED + args.aa*t*t*SPEED*SPEED/2;
		let p = args.p;
		return {...angle$spherify(a, p), r: r};
	}

	function motion$slide(args, t) {

	}

	function motion$grip(args, t) {

	}

	function motion$type(args) {
		// placeholder logic
		return motion$rotate;
	}


	function alias(args) {
		let aliases = {
			radius: "r",
			r0: "r",
			radius0: "r",
			radius1: "r1",
			angle: "a",
			angle0: "a",
			a0: "a",
			angle1: "a1",
			speed: "va",
			speed0: "va",
			speed1: "va1",
			units: "c",
			cycles: "c",
			loops: "c",
			petals: "c"
		}
		let vals = ["r","r1","a","a1","va","vr","va1","vr1","c","p","beats"];
		let nargs = {};
		for (let val of vals) {
			if (nargs[val]===undefined) {
				nargs[val] = args[val];
			}
		}
		for (let alias in aliases) {
			let val = aliases[alias];
			if (args[val]===undefined && args[alias]!==undefined) {
				nargs[val] = args[alias];
			}
		}
		return nargs;
	}

	function solve(args) {
		let {x0, x1, v0, v1, a, t} = args;
		// where do we set defaults?
		let known = {};
		for (let arg in args) {
			if (args[arg]!==undefined) {
				known[arg] = true;
			}
		}
		// solve for acceleration given starting and ending position
		if (known.x0 && known.x1 && known.v0 && known.t) {
			a = 2*((x0-x1)/(t*t)-v0/t);
			v1 = v0+a*t;
		// solve for end position given acceleration
		} else if (known.x0 && known.v0 && known.a && known.t) {
			x1 = x0+v0*t+a*t*t/2;
			v1 = v0+a*t;
		// solve for end position and acceleration given final position
		} else if (known.x0 && known.v0 && known.v1 && known.t) {
			a = (v1-v0)/t;
			x1 = x0+v0*t+a*t*t/2;
		// impute acceleration to zero
		} else if (known.x0 && known.v0) {
			a = 0;
			v1 = 0;
			x1 = x0+v0*t;
		} else if (known.x0 && known.x1) {
			a = 0;
			v0 = (x1-x0)/t;
			v1 = v0;
		} else if (known.x0) {
			a = 0;
			v1 = 0;
			v0 = 0;
			x1 = x0;
		} else if (!(known.x0)) {
			x0 = 0;
			x1 = 0;
			v0 = 0;
			v1 = 0;
			a = 0;
		} else {
			console.log(args);
			throw new Error("solving method unimplemented.");
		}
		return {x0: x0, x1: x1, v0: v0, v1: v1, a: a, t: t};
	}

	function angle$solve(args) {
		let {x0, x1, v0, v1, a, t, c} = args;
		// should this default to clockwise, or to the shortest path?
		let known = {};
		for (let arg in args) {
			known[args] = true;
		}
		// solve for acceleration given starting and ending position
			// default to shortest angle
		if (known.x0 && known.x1 && known.v0 && known.t ) {
			if (c===undefined) {
				c = (Math.abs(x1-x0)*UNIT > Math.PI) ? -1 : 1;
			}
			// this isn't quite right
			x1 - Math.sign(c) + 2*Math.PI/UNIT;
			// adjust x0 and x1 based on units and default
			a = 2*((x0-x1)/(t*t)-v0/t);
			v1 = v0+a*t;
		// solve for end position given acceleration
			// gives period exactly
		} else if (known.x0 && known.v0 && known.a && known.t) {
			x1 = x0+v0*t+a*t*t/2;
			v1 = v0+a*t;
		// solve for end position and acceleration given final position
			// gives period exactly
		} else if (known.x0 && known.v0 && known.v1 && known.t) {
			a = (v1-v0)/t;
			x1 = x0+v0*t+a*t*t/2;
		} else {
			console.log(vals);
			throw new Error("solving method unimplemented.");
		}
		return {x0: x0, x1: x1, v0: v0, v1: v1, a: a, t: t};
	}



	// should the props get wrappers? it seems that way...
	function PropWrapper(prop) {
		this.prop = prop;
		this.moves = [];
	}
	PropWrapper.prototype.addMove = function(move) {
		// check to see if it's an array?
		if (this.moves.length===0) {
			this.moves.push(fit(this.prop, move));
		} else {
			this.moves.push(fit(socket(this.moves[this.moves.length-1]), move));
		}
	}
	function Player(args) {
		this.props = args.props.map((p)=>(new PropWrapper(p))) || [];
		this.speed = args.speed || 10;
		this.rate = args.rate || 1;
		this.tick = 0;
	}
	// should the callback be able to take cosmetic properties?
	Player.prototype.render = function(prop) {};
	Player.prototype.goto = function(t) {
		this.tick = t;
		for (let i=0; i<this.props.length; i++) {
			this.render(spin(this.props[i].prop, this.props[i].moves, this.tick));
		}
	}
	Player.prototype.play = function() {
		this._interval = setInterval(()=>{
			for (let i=0; i<this.props.length; i++) {
				this.render(spin(this.props[i].prop, this.props[i].moves, this.tick));
			}
			this.tick+=this.rate;
		}, this.speed);
	}
	Player.prototype.stop = function() {
		clearInterval(this._interval);
	}
	Player.prototype.addProp = function(prop) {
		this.props.push(new PlayerPropWrapper(prop));
	}
	Player.prototype.reset = function() {
		this.stop();
		this.goto(0);
	}


	MoveFactory.build = {};
	MoveFactory.defaults = {
		plane: WALL,
		orient: NORTH,
		beats: 4,
		speed: 1,
		direction: CLOCKWISE
	}
	MoveFactory.recipe = function(name, defs, f) {
		MoveFactory.build[name] = (args) => {
			// may need to decompose the individual nodes and spread them
			//return f({...this.defaults, ...defs, ...args});a
			return f(merge(merge(this.defaults, defs), args));
		}
	}
	MoveFactory.variant = function(name, recipe, defs) {
		MoveFactory.build[name] = (args)=>{
			// may need to decompose the individual nodes and spread them
			return MoveFactory.build[recipe](merge(defs, args));
		}
	}


	VS3D.clone = clone;
	VS3D.merge = merge;
	VS3D.round = round;
	VS3D.zeroish = zeroish;
	VS3D.nearly = nearly;
	VS3D.angle = angle;
	VS3D.angle$nearly = angle$nearly;
	VS3D.vector = vector;
	VS3D.vector$nearly = vector$nearly;
	VS3D.vector$zeroish = vector$zeroish;
	VS3D.vector$unitize = vector$unitize;
	VS3D.vector$magnitude = vector$magnitude;
	VS3D.vector$spherify = vector$spherify;
	VS3D.vector$bisector = vector$bisector;
	VS3D.vector$rotate = vector$rotate;
	VS3D.vector$cross = vector$cross;
	VS3D.vector$dot = vector$dot;
	VS3D.vector$project = vector$project;
	VS3D.vector$between = vector$between;
	VS3D.sphere = sphere;
	VS3D.sphere$vectorize = sphere$vectorize;
	VS3D.sphere$nearly = sphere$nearly;
	VS3D.sphere$zeroish = sphere$zeroish;
	VS3D.sphere$planify = sphere$planify;
	VS3D.plane = plane;
	VS3D.plane$reference = plane$reference;
	VS3D.angle$vectorize = angle$vectorize;
	VS3D.angle$spherify = angle$spherify;
	VS3D.angle$rotate = angle$rotate;
	VS3D.Prop = Prop;
	VS3D.Move = Move;
	VS3D.spin = spin;
	VS3D.beats = beats;
	VS3D.fits = fits;
	VS3D.fit = fit;
	VS3D.node$sum = node$sum;
	VS3D.move$spherify = move$spherify;
	VS3D.socket = socket;
	VS3D.MoveFactory = MoveFactory;
	VS3D.refit = refit;
	VS3D.realign = realign;
	VS3D.chain = chain;
	VS3D.prop$spin = prop$spin;
	VS3D.node$spin = node$spin;
	VS3D.motion$rotate = motion$rotate;
	VS3D.motion$slide = motion$slide;
	VS3D.motion$grip = motion$grip;
	VS3D.motion$type = motion$type;
	VS3D.alias = alias;
	VS3D.solve = solve;
	VS3D.angle$solve = angle$solve;
	VS3D.PropWrapper = PropWrapper;
	VS3D.Player = Player;
	return VS3D;
}();