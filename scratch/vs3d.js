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
		let a = Math.acos(z/r)/UNIT;
		let b = Math.atan2(y,x)/UNIT;
		return {r: r, a: a, b: b};
	}
	// find the vector halfway between two vectors
	function vector$bisector(v1, v2) {
		let v = vector(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
		return vector$unitize(v);
	}
	// rotate a vector around an axis
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
		let {x,y,z} = vec;
		// god knows if this even right anymore...
		// if this is FLOOR or the zero vector, use the +x axis
		if (x===0 && y===0) {
			return vector(1,0,0);
		}
		// otherwise, return the intersection of this and the floor plane in the first or second quadrant
		return vector$unitize(vector(0,Math.abs(z),-x));
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
		let v = vector$rotate(plane$reference(p || WALL));
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
	function newProp(args) {
		args = args || {};
		// wait...does a prop have a plane?
		//args.plane = args.plane ||
		// set default values for node positions
		args.body = args.body || {r: TINY, a: 0, b: 0};
		args.pivot = args.pivot || {r: TINY, a: 0, b: 0};
		args.helper = args.helper || {r: TINY, a: 0, b: 0};
		args.hand = args.hand || {r: TINY, a: 0, b: 0};
		// all zeroes except for head
		args.head = args.head || {r: 1, a: 0, b: 0};
		// tweak all zeroes to TINY to avoid math errors
		args.body.r = args.body.r || TINY;
		args.pivot.r = args.pivot.r || TINY;
		args.helper.r = args.helper.r || TINY;
		args.hand.r = args.hand.r || TINY;
		args.head.r = args.head.r || TINY;
		// "arc" could represent any point along the circumference of a hoop; for poi and staff, 0 or PI are the only sensible values
		args.arc = args.arc || 0;
		// "twist" has no visible effect for poi or staff, but for hoop or fans it represents twisting the grip
		args.twist = args.twist || 0;
		// "choke" tells how far up the prop is being gripped, e.g. for poi gunslingers	
		args.choke = args.choke || 0;
		// "bend" is used mostly for plane-bending moves, and represents a tilt in the prop's plane relative to the axis of motion
		args.bend = args.bend || 0;
		return {
			nodes: [
				args.body,
				args.pivot,
				args.helper,
				args.hand,
				args.head
			],
			grip: {
				arc: angle(args.arc),
				twist: angle(args.twist),
				choke: angle(args.choke),
				bend: angle(args.bend),
			}
		}
	}


	function nodeSum(prop, node) {
		let [xs, ys, zs] = [0, 0, 0];
		for (let i=BODY; i<node; i++) {
			let {x, y, z} = sphere$vectorize(prop[i]);
			xs+=x;
			ys+=y;
			zs+=z;
		}
		return vector$spherify(vector(xs,ys,zs));
	}



	function move$sphere(args) {
		args = args || {};
		let move = {};
		for (let e of ["r","a","b","vr","va","vb","ar","aa","ab"]) {
			move[e] = args[e] || 0;
		}
		return move;
	}
	// parameterized slide
	function move$vector(args) {
		args = args || {};
		let move = {};
		for (let e of ["x","y","z","vx","vy","vz","ax","ay","az"]) {
			move[e] = args[e] || 0;
		}
		return move;
	}
	// parameterized grip shift or plane bend
	function move$grip(args) {
		args = args || {};
		let move = {};
		for (let e of ["arc","twist","choke","bend","va","vt","vc","vb","aa","at","ac","ab"]) {
			move[e] = args[e] || 0;
		}
		return move;
	}
	function move$type(move) {
		if (move.r!==undefined || move.a!==undefined || move.b!==undefined) {
			return move$sphere;
		} else if (move.x!==undefined || move.y!==undefined || move.z!==undefined) {
			return move$vector;
		} else if (move.arc!==undefined || move.twist!==undefined || move.choke!==undefined || move.bend!==undefined) {
			return move$grip;
		} else {
			throw new Error("checking type of invalid move.");
		}
	}
	// yield a new parameterized move starting at t
	function move$split(move, t) {
		if (move$type(move)===move$vector) {
			let x = move.x + move.vx*t + move.ax*t*t/2;
			let y = move.y + move.vy*t + move.ay*t*t/2;
			let z = move.z + move.vz*t + move.az*t*t/2;
			return move$vector({x: x, y: y, z: z, ...move});
		} else if (move$type(move)===move$grip) {
			let arc = move.arc + move.va*t + move.aa*t*t/2;
			let twist = move.twist + move.vt*t + move.at*t*t/2;
			let choke = move.choke + move.vc*t + move.ac*t*t/2;
			let bend = move.bend + move.vb*t + move.ab*t*t/2;
			return move$grip({arc: arc, twist: twist, choke: choke, bend: bend, ...move});
		} else if (move$type(move)===move$sphere) {
			let r = move.r + move.vr*t + move.ar*t*t/2;
			let a = move.a + move.va*t + move.aa*t*t/2;
			let b = move.b + move.vb*t + move.ab*t*t/2;
			return move$sphere({r: r, a: a, b: b, ...move});
		}
	}

	// derive position from a parameterized movement and time
	function move$spin(move, t) {
		if (move$type(move)===move$vector) {
			let x = move.x + move.vx*t + move.ax*t*t/2;
			let y = move.y + move.vy*t + move.ay*t*t/2;
			let z = move.z + move.vz*t + move.az*t*t/2;
			return vector$spherify(vector(x,y,z))
		} else if (move$type(move)===move$grip) {
			let arc = move.arc + move.va*t + move.aa*t*t/2;
			let twist = move.twist + move.vt*t + move.at*t*t/2;
			let choke = move.choke + move.vc*t + move.ac*t*t/2;
			let bend = move.bend + move.vb*t + move.ab*t*t/2;
			return {arc: arc, twist: twist, choke: choke, bend: bend};
		} else if (move$type(move)===move$sphere) {
			let r = move.r + move.vr*t + move.ar*t*t/2;
			let a = move.a + move.va*t + move.aa*t*t/2;
			let b = move.b + move.vb*t + move.ab*t*t/2;
			console.log(a);
			return sphere(r,a,b);
		}
	}

	function spin(prop, t) {
		// do it mutable for now
		for (let i=BODY; i<=HEAD; i++) {
			let {r, a, b} = prop.nodes[i];
			if (i===HEAD || i===HAND) {
				prop.nodes[i] = move$spin(move$sphere({r: r, a: a, b: b, va: 1}),t);
				console.log(prop.nodes[i].a);
			} else {
				prop.nodes[i] = move$spin(move$sphere({r: r, a: a, b: b}),t);
			}
		}
	}