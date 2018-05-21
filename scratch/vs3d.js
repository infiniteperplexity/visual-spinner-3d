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
	const WALL = plane(0,1,0);
	const WHEEL = plane(1,0,0);
	const FLOOR = plane(0,0,1);
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
	// convert a vector to spherical coordinates
	function vector$spherify(vec) {
		let {x, y, z} = vec;
		let r = Math.sqrt(x*x+y*y+z*z) || TINY;
		let a = (Math.acos(z/r)-Math.PI/2)/UNIT;
		let b = Math.atan2(y,x)/UNIT;
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
		let {x: x1, y: y1, z: z1} = v1;
		let {x: x2, y: y2, z: z2} = v2;
		let c = vector$magnitude(vector$cross(v1, v2));
		let d = vector$dot(v1, v2);
		return Math.atan2(c, dot)/UNIT;
	}
	// reference vector is arbitrarily defined
	function plane$reference(vec) {
		// this has been tested only for the main three planes
		let {x,y,z} = vec;
		// if this is FLOOR or the zero vector, use the +x axis
		if (x===0 && y===0) {
			return vector(1,0,0);
		}
		// otherwise, return the intersection of this and the floor plane in the first or second quadrant
		return vector$unitize(vector(Math.abs(y),0,-x));
	}

 	// compose a spherical coordinate from a scalar and two angles
	function sphere(r,a,b) {
		return {r: r, a: angle(a), b: angle(b)};
	}
	// convert a spherical coordinate into a vector
	function sphere$vectorize(s) {
		let {r, a, b} = s;
		let x = r*Math.cos(UNIT*a)*Math.sin(UNIT*b);
		let y = r*Math.sin(UNIT*a)*Math.sin(UNIT*b);
		let z = r*Math.cos(UNIT*a);
		//let z = r*Math.sin(UNIT*a)*Math.sin(UNIT*b);
		//let y = r*Math.cos(UNIT*a);
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
		args.pivot.r = args.pivot.r || 0;
		args.helper.r = args.helper.r || 0;
		args.hand.r = args.hand.r || 0;
		args.head.r = args.head.r || 0;
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

	function spin(prop, move, t) {
		//return prop$spin()
	// 	if (Array.isArray(move)) {
	// 		let tally = 0;
	// 		for (let i=1; i<move.length; i++) {
	// 			tally+=move[i].beats*BEAT;
	// 			if (t<tally || i>=move.length-1) {
	// 				return spin(prop, move[i], t+move[i].beats*BEAT-tally);
	// 			}
	// 		}
	// 	} else {

			return prop$spin(prop$merge(prop, move), t);
		// }
		//return prop$spin(move, t);
	}


	function prop$merge(prop, move) {
		return {
			body: {...prop.body, ...move.body},
			pivot: {...prop.pivot, ...move.pivot},
			helper: {...prop.helper, ...move.helper},
			hand: {...prop.hand, ...move.hand},
			head: {...prop.head, ...move.head},
			grip: {...prop.grip, ...move.grip}
		};
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
			// ,
			// grip: node$spin(args.grip, t)
		}
	}


	// this is where the problem is.

	// where does the plane and solving and stuff come in?
	function node$spin(args, t) {
		//args = rename$args(args);
		// I think we want to solve and resolve defaults here.
		//args.t = t;
		let {r, vr, ar, a, va, aa, p} = args;
		// if (motion$type(args)===motion$spin) {
			// let rargs = {x0: args.r, x1: args.r1, v0: args.extend, v1: args.extend1, t: t};
			// le
			// aargs = {x0: args.a, x1: args.a1, v0: args.speed, v1: args.speed1, spins: args.spins, t: t}
			// console.log(aargs);
			// let {x0: r, v0: vr, a: ar} = /*solve(rargs);*/ rargs;
			// let {x0: a, v0: va, a: aa} = /*angle$solve(aargs);*/ aargs;
			return motion$spin({r: r, vr: vr, ar: ar, a: a, va: va, aa: aa, p:p}, t);
		// }
	}

	function motion$spin(args, t) {
		for (let e of ["r","a","vr","va","ar","aa"]) {
			args[e] = args[e] || 0;
		}
		args.p = args.p || WALL;
		let r = args.r + args.vr*t + args.ar*t*t;
		let a = args.a + args.va*t*SPEED + args.aa*t*t*SPEED*SPEED;
		let p = args.p;
		return {...angle$spherify(a, p), r: r};
	}

// renderer.goto(prop, {head:{va: 1}}, 45)








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




	function motion$type(args) {
		// placeholder logic
		return motion$spin;
	}


	function rename$args(args) {
		let aliases = {
			radius: "r",
			r0: "r",
			radius0: "r",
			radius1: "r1",
			angle: "a",
			angle0: "a",
			a0: "a",
			angle1: "a1",
			extend0: "extend"
		}
		// ...and so on
	}

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




	// now figure out chaining, and *maybe* figure out named moves

	function move$socket(move) {
		return prop$spin(move, move.beats*BEAT-1);
	}
	// this would realign the various moves as needed
	function move$chain(arr) {
		let chain = [arr[0]];
		for (let i=1; i<arr.length; i++) {

		}
	}