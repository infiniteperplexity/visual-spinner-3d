		// useful constants
	const SMALL = 0.001;
	const TINY = 0.0001;
	const UNIT = 2*Math.PI/360;
	const BODY = 0;
	const PIVOT = 1;
	const HELPER = 2;
	const HAND = 3;
	const HEAD = 4;
	const NODES = ["body","pivot","helper","hand","head"];
	// const WALL = plane(0,0,-1);
	// const WHEEL = plane(1,0,0);
	// const FLOOR = plane(0,-1,0);
	const WALL = plane(0,0,1);
	const WHEEL = plane(1,0,0);
	const FLOOR = plane(0,1,0);
	const XAXIS = vector(1,0,0);
	const YAXIS = vector(0,1,0);
	const ZAXIS = vector(0,0,1);
	const MEASURE = 4;
	const TICKS = 360;
	const BEAT = TICKS/MEASURE;
	const SPEED = 1;

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
		// adding this, trying to get it right...
		// ay = -ay;
		// az = -az;
		// let d = vector$dot(vec, vector(ax, ay, az));
		let d = vector$dot(vec, axis);
		let x = vx-d*ax;
		let y = vy-d*ay;
		let z = vz-d*az;
		return vector(x,y,z);
	}
	// calculate the angle between two vectors
	function vector$between(v1, v2) {
		let {x: x1, y: y1, z: z1} = v1;
		let {x: x2, y: y2, z: z2} = v2;
		let c = vector$magnitude(vector$cross(v1, v2));
		let d = vector$dot(v1, v2);
		return Math.atan2(c, d)/UNIT;
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
		let v = vector$project(sphere$vectorize(s),p);
		return vector$between(v,plane$reference(p));
		// this should be returning an angle, though, right?
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
		// is this necessary?
		// if (sphere.zeroish(project)) {
		// 	projected = sphere(TINY,TINY,TINY);
		// }
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
			while (past<t) {
				let ticks = m[i].beats*BEAT || 1*BEAT;
				if (past+ticks>=t) {
					return prop$spin(m[i], t-past);
				} else {
					past+=ticks;
					i=(i+1)%m.length;
				}
			}
		}
		return prop$spin(m, t);
	}

	function fit(prop, move) {
		// works on arrays of moves as well
		if (Array.isArray(move)) {
			return chain(prop, move);
		} else {
			let plane = move.p || WALL;
			let {body, pivot, helper, hand, head, grip} = prop;
			body = {r: body.r, a: sphere$planify(body, plane), p: plane};
			pivot = {r: pivot.r, a: sphere$planify(pivot, plane), p: plane};
			helper = {r: helper.r, a: sphere$planify(helper, plane), p: plane};
			hand = {r: hand.r, a: sphere$planify(hand, plane), p: plane};
			head = {r: head.r, a: sphere$planify(head, plane), p: plane};
			return {
				body: {...body, ...move.body},
				pivot: {...pivot, ...move.pivot},
				helper: {...helper, ...move.helper},
				hand: {...hand, ...move.hand},
				head: {...head, ...move.head},
				grip: {...grip, ...move.grip},
				beats: move.beats,
				p: move.p
			};
		}
	}


	function prop$spin(args, t) {
		args.body = args.body || {r: 0, a: 0, b: 0};
		args.pivot = args.pivot || {r: 0, a: 0, b: 0};
		args.helper = args.helper || {r: 0, a: 0, b: 0};
		args.hand = args.hand || {r: 0, a: 0, b: 0};
		args.head = args.head || {r: 1, a: 0, b: 0};
		args.grip = args.grip || {a: 0, b: 0, c: 0, t: 0};
		return {
			body: node$spin(args.body, t),
			pivot: node$spin(args.pivot, t),
			helper: node$spin(args.helper, t),
			hand: node$spin(args.hand, t),
			head: node$spin(args.head, t),
			grip: {a: 0, b: 0, c: 0, t: 0}
		}
	}


	function node$spin(args, t) {
		aargs = alias(args);
		let {p} = aargs;
		let {r, vr, ar} = aargs;
		let {a, va, aa} = aargs;
		//let {x0: r, v0: vr, a: ar} = solve({x0: args.r, x1: args.r1, vr: args.vr, vr1: args.vr1, a: args.ar, t: t});
		//let {x0: a, v0: va, a: aa} = solve({x0: args.ar, x1: args.a1, vr: args.va, vr1: args.va1, a: args.aa, t: t, P: args/P});
		return motion$rotate({r: parseInt(r), vr: parseInt(vr), ar: ar, a: a, va: va, aa: aa, p:p}, t);
	}

	function motion$rotate(args, t) {
		for (let e of ["r","a","vr","va","ar","aa"]) {
			args[e] = args[e] || 0;
		}
		args.p = args.p || WALL;
		let r = args.r + args.vr*t + args.ar*t*t;
		let a = args.a + args.va*t*SPEED + args.aa*t*t*SPEED*SPEED;
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
			speed1: "va1"
		}
		let vals = ["r","r1","a","a1","va","vr","va1","vr1"];
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
		console.log(args);
		let {x0, x1, v0, v1, a, t} = args;
		// where do we set defaults?
		let known = {};
		for (let arg in args) {
			known[args] = true;
		}
		console.log(known);
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
		} else {
			console.log(vals);
			throw new Error("solving method unimplemented.");
		}
		return {x0: x0, x1: x1, v0: v0, v1: v1, a: a, t: t};
	}

	function angle$solve(args) {
		let {x0, x1, v0, v1, a, t, P} = args;
		// should this default to clockwise, or to the shortest path?
		let known = {};
		for (let arg in args) {
			known[args] = true;
		}
		// solve for acceleration given starting and ending position
			// default to shortest angle
		if (known.x0 && known.x1 && known.v0 && known.t ) {
			if (P===undefined) {
				P = (Math.abs(x1-x0)*UNIT > Math.PI) ? -1 : 1;
			}
			// this isn't quite right
			x1 - Math.sign(P) + 2*Math.PI/UNIT;
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






	// now figure out chaining, and *maybe* figure out named moves
	function socket(move) {
		move.beats = move.beats || 1;
		return prop$spin(move, move.beats*BEAT-1);
	}
	// this would realign the various moves as needed
	function chain(prop, arr) {
		arr[0] = fit(prop,arr[0]);
		for (let i=1; i<arr.length; i++) {
			arr[i] = fit(socket(arr[i-1]),arr[i]);
		}
		return arr;
	}


	// should the props get wrappers? it seems that way...
	function PlayerPropWrapper(prop) {
		this.prop = prop;
		this.moves = [];
	}
	PlayerPropWrapper.prototype.addMove = function(move) {
		// check to see if it's an array?
		if (this.moves.length===0) {
			this.moves.push(fit(this.prop, move));
		} else {
			this.moves.push(fit(socket(this.moves[this.moves.length-1]), move));
		}
	}
	function Player(args) {
		this.props = args.props.map((p)=>(new PlayerPropWrapper(p))) || [];
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
		clearInterval(this.interval);
	}
	Player.prototype.addProp = function(prop) {
		this.props.push(new PlayerPropWrapper(prop));
	}
	Player.prototype.reset = function() {
		this.stop();
		this.goto(0);
	}