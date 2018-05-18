let VS3D = function() {
	let VS3D = {};
	// helpful constants
	const SMALL = VS3D.SMALL = 0.001;
	const TINY = VS3D.TINY = 0.0001;
	const UNIT = VS3D.UNIT = 2*Math.PI/360;
	const HEAD = VS3D.HEAD = 4;
	const HAND = VS3D.HAND = 3;
	const HELPER = VS3D.HELPER = 2;
	const PIVOT = VS3D.PIVOT = 1;
	const BODY = VS3D.BODY = 0;
	const NODES = VS3D.NODES = ["body","pivot","helper","hand","head"];
	const WALL = VS3D.WALL = plane(0,1,0);
	const WHEEL = VS3D.WHEEL = plane(1,0,0);
	const FLOOR = VS3D.FLOOR = plane(0,0,1);
	const BEATS = 90;

	// immutability helper
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
    		a+=1;
    	}
    	while (a>1) {
    		a-=1;
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
	function unitize(vec) {
		if (vector$zeroish(vec)) {
			return clone(vec);
		}
		let {x, y, z} = vec;
		let len = magnitude(vec);
		return vector(x/len,y/len,z/len);
	}
	// find the magnitude of a vector
	function magnitude(vec) {
		let {x, y, z} = vec;
		return Math.sqrt(x*x+y*y+z*z);
	}
	// convert a vector to spherical coordinates
	function spherify(vec) {
		let {x, y, z} = vec;
		let r = Math.sqrt(x*x+y*y+z*z) || TINY;
		let a = Math.acos(z/r)/UNIT;
		let b = Math.atan2(y,x)/UNIT;
		return {r: r, a: a, b: b};
	}
	// find the vector halfway between two vectors
	function bisector(v1, v2) {
		let v = vector(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z);
		return vector.unitize(v);
	}
	// rotate a vector around an axis
	function vector$rotate(v, a, axis) {
		axis = axis || WALL;
		let {x, y, z} = v;
		let {u, v, w} = axis;
		let s = (u*x+v*y+w*z);
		let t = (u*u+v*v+w*w);
		let sq = Math.sqrt(t);
		let cs = Math.cos(a*UNIT);
		let sn = Math.sin(a*UNIT);
		let a = (u*s*(1-cs)+t*x*cs+sq*(v*z-w*y)*sn)/t;
		let b = (v*s*(1-cs)+t*y*cs+sq*(w*x-u*z)*sn)/t;
		let c = (w*s*(1-cs)+t*z*cs+sq*(u*y-v*x)*sn)/t;
		return vector(a,b,c);
	}
	// cross product of two vectors
	function cross = function(v1, v2) {
		let {x1, y1, z1} = v1;
		let {x2, y2, z2} = v2;
		let x = y1*z2 - z1*y2;
		let y = z1*x2 - x1*z2;
		let z = x1*y2 - y1*x2;
		return vector(x,y,z);
	}
	// dot product of two vectors
	function dot = function(v1, v2) {
		let {x1, y1, z1} = v1;
		let {x2, y2, z2} = v2;
		return x1*x2+y1*y2+z1*z2;
	}
	// project a vector onto the plane defined by an axis
	function project = function(vec, axis) {
		axis = axis || WALL;
		let {vx, vy, vz} = vec;
		let {ax, ay, az} = axis;
		let d = dot(vec, axis);
		let x = vx-d*ax;
		let y = vy-d*ay;
		let z = vz-d*az;
		return vector(x,y,z);
	}
	// calculate the angle between two vectors
	function between = function(v1, v2) {
		let {x1, y1, z1} = v1;
		let {x2, y2, z2} = v2;
		let c = magnitude(cross(v1, v2));
		let d = dot(v1, v2);
		return Math.atan2(c, dot)/UNIT;
	}
	// reference vector is arbitrarily defined
	function reference = function(vec) {
		let {x,y,z} = vec;
		// god knows if this even right anymore...
		// if this is FLOOR or the zero vector, use the +x axis
		if (x===0 && y===0) {
			return vector(1,0,0);
		}
		// otherwise, return the intersection of this and the floor plane in the first or second quadrant
		return unitize(vector(0,Math.abs(z),-x));
	}

 	// compose a spherical coordinate from a scalar and two angles
	function sphere(r,a,b) {
		return {r: r, a: angle(a), b: angle(b)};
	}
	// convert a spherical coordinate into a vector
	function vectorize(s) {
		let {r, a, b} = s;
		let x = r*Math.cos(UNIT*a)*Math.sin(UNIT*b);
		let y = r*Math.sin(UNIT*a)*Math.sin(UNIT*b);
		let z = r*Math.cos(UNIT*a);
		return {x: x, y: y, z: z};
	}
	// nearly, but for spherical coordinates
	function sphere$nearly(s1,s2,delta) {
		let v1 = vectorize(s1);
		let v2 = vectorize(s2);
		return vector$nearly(v1,v2,delta);
	}
	// nearly, but for spherical coordinates
	function sphere$zeroish(s,delta) {
		let s2 = sphere(0,0,0);
		return sphere$nearly(s,s2,delta);
	}
	// convert a spherical coordinate to an angle in a given plane
	function planify(s, p) {
		p = p || WALL;
		let v = project(vectorize(s),p);
		return between(v,reference(p));
	}
	// vector, but aliased for clarity
	function plane(x, y, z) {
		return vector(x, y, z);
	}
	// set a particular angle from the reference vector in a plane
	function angle$vectorize(ang, p) {
		let v = vector$rotate(reference(p || WALL);
		return v;
	}
	function angle$spherify(ang, p) {
		return spherify(angle$vectorize(ang, p));
	}
	function angle$rotate(s, ang, p) {
		p = p || WALL;
		let {r, a, b} = s;
		if (angle$zeroish(ang)) {
			return sphere(r, a, b);
		}
		r = r || TINY;
		let projected = project(vectorize(s),p);
		// is this necessary?
		// if (sphere.zeroish(project)) {
		// 	projected = sphere(TINY,TINY,TINY);
		// }
		let v = unitize(vector$rotate(projected, ang, p));
		s = spherify(v);
		return {r: r, ...s}
	}
	// create a new prop
	function newProp(args) {
		args = args || {};
		// set default values for node positions
		args.home = args.home || {r: TINY, a: 0, b: 0};
		args.pivot = args.pivot || {r: TINY, a: 0, b: 0};
		args.helper = args.helper || {r: TINY, a: 0, b: 0};
		args.hand = args.hand || {r: TINY, a: 0, b: 0};
		// all zeroes except for head
		args.head = args.head || {r: 1, a: 0, b: 0};
		// tweak all zeroes to TINY to avoid math errors
		args.home.r = args.home.r || TINY;
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
			nodes: {
				body: args.body,
				pivot: args.pivot,
				helper: args.helper,
				hand: args.hand,
				head: args.head
			},
			grip: {
				arc: angle(args.arc),
				twist: angle(args.twist),
				choke: angle(args.choke),
				bend: angle(args.bend),
			}
		}
	}
	// some all nodes from home to the chosen node
	function nodeSum = function(prop, node) {
		let [xs, ys, zs] = [0, 0, 0];
		for (let i=BODY; i<node; i++) {
			let {x, y, z} = sphere$vectorize(prop[i]);
			xs+=x;
			ys+=y;
			zs+=z;
		}
		return vector$spherify(vector(xs,ys,zs));
	}


	VS3D.clone = clone;
	VS3D.round = round;
	VS3D.zeroish = zeroish;
	VS3D.nearly = nearly;
	VS3D.angle = angle;
	VS3D.angle$nearly = angle$nearly;
	VS3D.angle$zeroish = angle$zeroish;
	VS3D.angle$vectorize = angle$vectorize;
	VS3D.angle$spherify = angle$spherify;
	VS3D.angle$rotate = angle$rotate;
	VS3D.vector = vector;
	VS3D.vector$nearly = vector$nearly;
	VS3D.vector$zeroish = vector$zeroish;
	VS3D.vector$unitize = unitize;
	VS3D.vector$magnitude = magnitude;
	VS3D.vector$spherify = spherify;
	VS3D.vector$bisector = bisector;
	VS3D.vector$between = between;
	VS3D.vector$project = project;
	VS3D.vector$cross = cross;
	VS3D.vector$dot = dot;
	VS3D.vector$between = between;
	VS3D.vector$rotate = vector$rotate;
	VS3D.sphere = sphere;
	VS3D.sphere$nearly = sphere$nearly;
	VS3D.sphere$zeroish = sphere$zeroish;
	VS3D.sphere$vectorize = vectorize;
	VS3D.sphere$planify = planify;
	VS3D.plane = plane;
	VS3D.plane$reference = reference;
	VS3D.newProp = newProp;
	VS3D.nodeSum = nodeSum;

	return VS3D;
}();