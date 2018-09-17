VS3D = function() {
let VS3D = {}; //



// ********************** Constants
	// const SMALL = VS3D.SMALL = 0.001;
 //    const TINY = VS3D.TINY = 0.0001;
	const SMALL = VS3D.SMALL = 0.001;
    const TINY = VS3D.TINY = 0.0001;
	const NUDGE = VS3D.NUDGE = 0.1;
	const DIAG = VS3D.DIAG = Math.sqrt(2)/2;
	const UNIT = VS3D.UNIT = 2*Math.PI/360;

	const BODY = VS3D.BODY = 0;
	const PIVOT = VS3D.PIVOT = 1;
	const HELPER = VS3D.HELPER = 2;
	const HAND = VS3D.HAND = 3;
	const GRIP = VS3D.GRIP = 4;
	const HEAD = VS3D.HEAD = 5;
    const NODES = VS3D.NODES = ["body","pivot","helper","hand","grip","head"];
    const WALL = VS3D.WALL = plane(0,0,-1);
    const WHEEL = VS3D.WHEEL = plane(1,0,0);
    const FLOOR = VS3D.FLOOR = plane(0,-1,0);
    const XAXIS = VS3D.XAXIS = vector(1,0,0);
	const YAXIS = VS3D.YAXIS = vector(0,1,0);
	const ZAXIS = VS3D.ZAXIS = vector(0,0,-1);
	const MEASURE = VS3D.MEASURE = 4;
	const TICKS = VS3D.TICKS = 360;
	const BEAT = VS3D.BEAT = TICKS/MEASURE;
	const LINEAR = VS3D.LINEAR = 1/BEAT;
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
	const TWELFTH = Math.PI/(6*UNIT);
	const ONE = VS3D.ONE = TWELVE + TWELFTH;
	const TWO = VS3D.TWO = ONE + TWELFTH;
	const FOUR = VS3D.FOUR = THREE + TWELFTH;
	const FIVE = VS3D.FIVE = FOUR + TWELFTH;
	const SEVEN = VS3D.SEVEN = SIX + TWELFTH;
	const EIGHT = VS3D.EIGHT = SEVEN + TWELFTH;
	const TEN = VS3D.TEN = NINE + TWELFTH;
	const ELEVEN = VS3D.ELEVEN = TEN + TWELFTH;
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

	const PROBEND = VS3D.PROBEND = 3;
	const ISOBEND = VS3D.ISOBEND = 1;
	const ANTIBEND = VS3D.ANTIBEND = -1;

	const _WALL = VS3D._WALL = plane(0,0,1);
	const _WHEEL = VS3D._WHEEL = plane(-1,0,0);
	const _FLOOR = VS3D._FLOOR = plane(0,1,0);
	// diagonal planes, mostly for testing
	const WAXWH = VS3D.WAXWH = plane(WHEEL.x*DIAG,0,WALL.z*DIAG);
	const WAXwh = VS3D.WAXwh = plane(WHEEL.x*NUDGE,0,WALL.z*almost(NUDGE));
	const waXWH = VS3D.waXWH = plane(WHEEL.x*almost(NUDGE),0,WALL.z*NUDGE);;
	const WAXFL = VS3D.WAXFL = plane(0,FLOOR.y*DIAG,WALL.z*DIAG);
	const WAXfl = VS3D.WAXfl = plane(0,FLOOR.y*NUDGE,WALL.z*almost(NUDGE));
	const waXFL = VS3D.waXFL = plane(0,FLOOR.y*almost(NUDGE),WALL.z*NUDGE);
	const WHXFL = VS3D.WHXFL = plane(WHEEL.x*DIAG,FLOOR.y*DIAG,0);
	const WHXfl = VS3D.WHXfl = plane(WHEEL.x*almost(NUDGE),-NUDGE,0);
	const whXFL = VS3D.whXFL = plane(WHEEL.x*NUDGE,FLOOR.y*almost(NUDGE),0);
	const WAWHFL = VS3D.WAWHFL = plane(WHEEL.x*Math.sqrt(1/3),FLOOR.y*Math.sqrt(1/3),WALL.z*Math.sqrt(1/3));

// ****************************************************************************
// ********************** Immutability Helpers ********************************
// ****************************************************************************
	function clone(obj) {
		let nobj;
		if (typeof(obj)!=="object" || obj===null) {
			return obj;
		}
		if (Array.isArray(obj)) {
			//nobj = [...obj];
			nobj = obj.slice(0);
			for (let i=0; i<nobj.length; i++) {
				nobj[i] = clone(nobj[i]);
			}
			return nobj;
		}
		//nobj = {...obj};
		nobj = Object.assign({},obj);
		for (let prop in nobj) {
		    if (typeof(nobj[prop])==="object") {
		      	nobj[prop] = clone(nobj[prop]);
		    }
		}
		return nobj;
	}

	function merge(obj1, obj2) {
		if (!obj1) {
			return clone(obj2);
		}
		let nobj = clone(obj1);
		if (!obj2) {
			return nobj;
		}
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

// ****************************************************************************
// ********************** Math and Geometry ***********************************
// ****************************************************************************

	// *** scalar functions
	function round(n, step) {
 		return Math.round(n/step)*step;
	}
	// is this scalar close enough to zero?
	function zeroish(n, delta) {
		return nearly(n, 0, delta);
	}

	// useful for calculating complementary diagonals
	function almost(n) {
		return Math.sqrt(1-n**2);
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
    	while (a>=(2*Math.PI/UNIT)) {
    		a-=(2*Math.PI/UNIT);
    	}
    	return a;
	}
	// cleanse rounding errors for acos or asin
	function arcbounds(n) {
		return Math.min(Math.max(n,-1),+1);
	}
	// nearly, but for angles
	function angle$nearly(a1, a2, delta) {
		a1 = angle(a1);
		a2 = angle(a2);
		return (nearly(a1,a2,delta) || nearly(a1+2*Math.PI/UNIT,a2,delta) || nearly(a1,a2+2*Math.PI/UNIT,delta));
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
		// !!!TINIFY
		// let r = Math.sqrt(x*x+y*y+z*z) || TINY;
		let r = Math.sqrt(x*x+y*y+z*z);
		let a = Math.acos(arcbounds(y/r))/UNIT;
		let b = Math.atan2(z,x)/UNIT;
		if (Math.abs(b)>(0.5*Math.PI/UNIT)) {
			b = b - Math.PI/UNIT;
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
	function vector$rotate(vec, ang, axis) {
		axis = axis || WALL;
		let {x, y, z} = vec;
		let {x: u, y: v, z: w} = axis;
		//I don't think we need to flip any signs
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
		let dot = vector$dot(v1, v2);
		let mag = vector$magnitude(v1)*vector$magnitude(v2);
		return Math.acos(arcbounds(dot/mag))/UNIT;
	}

	// reference vector is arbitrarily defined
	function plane$reference(vec) {
		// this has now passed every frickin' unit test!
		let {x,y,z} = vec;
		// includes ZERO, WALL, WHEEL, and WAXWH
		if (y===0) {
			return YAXIS;
		// includes WHXFL
		} else if (z===0) {
			return ZAXIS;
		}
		// for all others, look for its two intersections with the wheel plane
		// includes WAXFL and WAWHFL
		let cross = vector$unitize(vector$cross(vec, WHEEL));
		// force positive z
		if (cross.z<0) {
			cross.z = -cross.z;
			cross.y = -cross.y;
		}
		return cross;
	}

 	// compose a spherical coordinate from a scalar and two angles
	function sphere(r,a,b) {
		return {r: r, a: angle(a), b: angle(b)};
	}
	// convert a spherical coordinate into a vector
	function sphere$vectorize(s) {
		let {r, a, b} = s;
		// !!!TINIFY
		// verified that this one is occasionally necessary???
		r = r || TINY;
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
	//convert a spherical coordinate to an angle in a given plane
	function sphere$planify(s, p) {
		p = p || WALL;
		if (sphere$zeroish(s,SMALL)) {
			return 0;
		}
		let v = vector$project(sphere$vectorize(s),p);
		let r = plane$reference(p);
		let a = vector$between(v,r);
		// really quite hacky, and might cause problems
		if (vector$nearly(vector$unitize(v), vector$unitize(vector$rotate(r, a, p)))) {
			return angle(a);
		} else {
			return angle(-a);
		}
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
		ang = angle(ang);
		// spherifying an angle to exactly zero tends to cause rounding issues
		// I have verified that these are a thing that really happens
		if (angle$nearly(ang,0,SMALL)) {
			// !!!TINIFY
			// ang = TINY;
			ang = 0;
		}
		let v = angle$vectorize(ang, p);
		let s = vector$spherify(v);
		// prevent flipping in planes with a floor component
		if (p.y!==0 && ang>Math.PI/UNIT) {
			s.a = angle(-s.a);
			s.b = angle(s.b-Math.PI/UNIT);
		// handle cusps in wall-by-wheel planes
		} else if (p.y!==0 && p.z!==0 && ang===0) {
			s.a = angle(-s.a);
			s.b = angle(s.b-Math.PI/UNIT);
		}
		return s;
	}


	function angle$rotate(s, ang, p) {
		p = p || WALL;
		let {r, a, b} = s;
		if (angle$zeroish(ang, SMALL)) {
			return sphere(r, a, b);
		}
		// !!!TINIFY
		// r = r || TINY;
		let projected = vector$project(sphere$vectorize(s),p);
		let v = vector$unitize(vector$rotate(projected, ang, p));
		s = vector$spherify(v);
		return {r: r, a: s.a, b: s.b};
	}


	// takes a bearing and a plane
	// returns the angle at the bearing between the plane and the longitude lines
	function angle$longitude(b, p, dummy) {
		p = p || WALL;
		let {x, y, z} = p;
		// needs special handling because of reference angles
		if (y && z) {
			b = angle(b-180);
		}
		let a = Math.PI-Math.acos(arcbounds(Math.cos(b*UNIT)*z - Math.sin(b*UNIT)*x));
		a/=UNIT;
		// needs special handling because of reference angles
		if (y && z) {
			a+=180;
		}
		return angle(a);
	}



// ****************************************************************************
// ********************** Data Structure Definition and Defaults **************
// ****************************************************************************

	// create a new, default prop
	function Prop(args) {
		args = args || {};
		let defaults = {
			body: {r: 0, a: 0, b: 0},
			pivot: {r: 0, a: 0, b: 0},
			helper: {r: 0, a: 0, b: 0},
			hand: {r: 1, a: 0, b: 0},
			grip: {r: 0, a: 0, b: 0},
			head: {r: 1, a: 0, b: 0},
			twist: 0
		};
		return merge(defaults, args);
	}

	function Move(args) {
		args = args || {};
		let plane = args.plane || WALL;
		let beats = (args.beats!==undefined) ? args.beats : 1;
		let body = merge({r: 0, a: 0}, args.body);
		let pivot = merge({r: 0, a: 0}, args.pivot);
		let helper = merge({r: 0, a: 0}, args.helper);
		let hand = merge({r: 1, a: 0}, args.hand);
		let twist = args.twist || 0;
		let bent = args.bent || 0;
		let vb = args.vb || 0;
		let vt = args.vt || 0;
		let grip = merge({r: 0, a: 0}, args.grip);
		let head = merge({r: 1, a: 0}, args.head);
		return {
			body: body,
			pivot: pivot,
			helper: helper,
			hand: hand,
			twist: twist,
			bent: bent,
			vt: vt,
			vb: vb,
			grip: grip,
			head: head,
			plane: plane,
			beats: beats
		}
	}

	// this would let me create a version of fit that uses two moves, not a move and a prop
	function movify(prop, p) {
		p = p || WALL;
		let move = {
			plane: p,
			twist: 0, // need to figure this part out
			vt: 0,
			bent: 0,
			vb: 0
		};
		for (let i=0; i<NODES.length; i++) {
			let node = NODES[i];
			let pnode = prop[node];
			move[node] = {a: sphere$planify(pnode, p), r: pnode.r};
		}
		return move;
	}

// ****************************************************************************
// ********************** Main Functional Pipeline for Spinning ***************
// ****************************************************************************

	// dummy is just a debugging convenience if you want to log only "real" spinning
	function spin(move, t, dummy) {
		// move = clone(move);
		if (move.recipe) {
			console.log("getting here is usually a bad thing");
			return spin(build(move, new Prop()),t,dummy);
		}
		if (Array.isArray(move)) {
			if (move.length===0) {
				return new Prop();
			}
			let past = 0;
			let i = 0;
			while (past<=t) {
				let ticks = beats(move[i])*BEAT;
				if (past+ticks>t) {
					return spin(move[i], t-past, dummy);
				} else {
					past+=ticks;
					i=(i+1)%move.length;
				}
			}
			throw new Error();
		}
		let notes = move.notes;
		let p = move.plane || WALL;
		let b = (move.beats!==undefined) ? move.beats : 1;
		let mbody = merge({r: 0, a: 0, notes: notes}, move.body);
		let mpivot = merge({r: 0, a: 0, notes: notes}, move.pivot);
		let mhelper = merge({r: 0, a: 0, notes: notes}, move.helper);
		let mhand = merge({r: 1, a: 0, notes: notes}, move.hand);
		let mtwist = move.twist || 0;
		let mbent = move.bent || 0;
		let mvt = move.vt || 0;
		let mvb = move.vb || 0;
		let mgrip = merge({r: 0, a: 0, notes: notes}, move.grip);
		let mhead = merge({r: 1, a: 0, notes: notes}, move.head);
		// !!!! these don't work in Edge
		let body = spin_node(merge({beats: b, plane: p}, mbody), t);
		let pivot = spin_node(merge({beats: b, plane: p}, mpivot), t);
		let helper = spin_node(merge({beats: b, plane: p}, mhelper), t);
		let hand = spin_node(merge({beats: b, plane: p}, mhand), t);
		let grip = spin_node(merge({beats: b, plane: p}, mgrip), t);
		let head = spin_node(merge({beats: b, plane: p}, mhead), t);
		// let body = spin_node({beats: b, plane: p, ...mbody}, t);
		// let pivot = spin_node({beats: b, plane: p, ...mpivot}, t);
		// let helper = spin_node({beats: b, plane: p, ...mhelper}, t);
		// let hand = spin_node({beats: b, plane: p, ...mhand}, t);
		// let grip = spin_node({beats: b, plane: p, ...mgrip}, t);
		// let head = spin_node({beats: b, plane: p, ...mhead}, t);
		let twist = mtwist + mvt*t*SPEED;
		let bent = mbent + mvb*t*SPEED;
		let twangle = sphere$twist(head, p, bent, move.vb);
		// let bearing = head.b;
		// // correct for cusps
		if (angle$nearly(head.a, 0) || angle$nearly(head.a, 180)) {
			let tiny = angle$spherify(head.a+1, p);
			head.b = tiny.b;
		}
		// let twangle = angle$longitude(bearing,p);
		if (bent || move.vb) {
			let headv = sphere$vectorize(head);
			let axis = vector$unitize(headv);
			let tangent = vector$cross(p, axis);
			head = vector$spherify(vector$rotate(headv,bent,tangent));
		}
		
		twist+=twangle;
		return {
			body: body,
			pivot: pivot,
			helper: helper,
			hand: hand,
			twist: twist,
			grip: grip,
			head: head
		}
	}

	// returns a prop aligned to the final frame of the move in question, or another frame
	function dummy(m, t) {
		t = (t===undefined) ? beats(m)*BEAT : t;
		return spin(m, t, "dummy");
	}

	// *** handle spinning logic for individual nodes ***
	function spin_node(args, t) {
		args = alias(args);
		let {plane, beats, m} = args;
		// explicit spin of zero codes for linear movement
		if (args.spin===0 || args.la!==undefined || args.vl!==undefined || args.vl1!==undefined || args.al!==undefined) {
			let moments = moments_linear(args);
			//return spin_linear({...moments, plane: plane}, t);
			return spin_linear(merge(moments, {plane: plane}),t);
		}
		let moments = moments_angular(args);
		//return spin_angular({...moments, plane: plane}, t);
		return spin_angular(merge(moments, {plane: plane}),t);
	}

	function spin_angular(args, t) {
		for (let e of ["r","a","vr","va","ar","aa"]) {
			args[e] = args[e] || 0;
		}
		args.plane = args.plane || WALL;
		let r = args.r + args.vr*t*SPEED/BEAT + args.ar*t*t*SPEED*SPEED/(2*BEAT);
		let a = args.a + args.va*t*SPEED + args.aa*t*t*SPEED*SPEED/(2*BEAT);
		let p = args.plane;
		let s = angle$spherify(a, p);
		s.r = r;
		// let s = {...angle$spherify(a, p), r: r};
		return s;
	}

	function spin_linear(args, t) {
		for (let e of ["r","a","la","vl","al"]) {
			args[e] = args[e] || 0;
		}
		let {x: x0, y: y0} = sphere$vectorize(sphere(args.r,args.a,0));
		let dx = Math.sin(args.la*UNIT);
		let dy = Math.cos(args.la*UNIT);
		let x1 = x0 + args.vl*dx*t*SPEED/BEAT + args.al*dx*t*t*SPEED/(2*BEAT*BEAT);
		let y1 = y0 + args.vl*dy*t*SPEED/BEAT + args.al*dy*t*t*SPEED/(2*BEAT*BEAT);
		let {r, a} = vector$spherify(vector(x1,y1,0));
		let p = args.plane;
		// let s = {...angle$spherify(a, p), r: r};
		let s = angle$spherify(a, p);
		s.r = r;
		return s;
	}

	// *** Used to easily convert parameter names ***
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
		vl0: "vl",
		spin: "spin",
		p: "plane"
	}
	function alias(args) {
		let nargs = {};
		for (let val in args) {
			if (aliases[val]) {
				nargs[aliases[val]] = args[val];  
			} else {
				nargs[val] = args[val];
			}
		}
		for (let alias in aliases) {
			let val = aliases[alias];
			if (args[val]===undefined && args[alias]!==undefined) {
				nargs[val] = args[alias];
			}
		}
		if (nargs.vl!==undefined || nargs.al!==undefined || nargs.la!==undefined) {
			nargs.spin = 0;
		}
		return nargs;
	}

	// *** Solve for positions, velocities, and accelerations ****
	function moments_angular(args) {
		args = alias(args);
		// convert radial speeds to/from more comprehensible units
		if (args.vr!==undefined) {
			args.vr/=BEAT;
		}
		if (args.vr1!==undefined) {
			args.vr1/=BEAT;
		}
		if (args.ar!==undefined) {
			args.ar/=(BEAT);
		}
		if (args.aa!==undefined) {
			args.aa/=BEAT;
		}
		let {x0: r, v0: vr, a: ar, x1: r1, v1: vr1} = solve({x0: args.r, x1: args.r1, v0: args.vr, v1: args.vr1, a: args.ar, t: args.beats*BEAT});
		let {x0: a, v0: va, a: aa, x1: a1, v1: va1, spin} = solve_angle({x0: args.a, x1: args.a1, v0: args.va, v1: args.va1, a: args.aa, spin: args.spin, t: args.beats*BEAT});
		vr*=BEAT;
		vr1*=BEAT;
		ar*=(BEAT);
		aa*=BEAT;
		return {r: r, vr: vr, ar: ar, a: a, va: va, aa: aa, r1: r1, vr1: vr1, a1: a1, va1: va1, spin: spin};
	}

	function moments_linear(args) {
		args = alias(args);
		let {a0: a, r0: r, la: la, vl0: vl, al: al, a1: a1, r1: r1, vl1: vl1} = solve_linear({a0: args.a, r0: args.r, a1: args.a1, r1: args.r1, la: args.la, vl0: args.vl, vl1: args.vl1, al: args.al, t: args.beats})
		return {a: a, r: r, la: la, vl: vl, al: al, a1: a1, r1: r1, vl1: vl1, spin: 0};
	}

	function solve(args) {
		let {x0, x1, v0, v1, a, t} = args;
		let known = {};
		for (let arg in args) {
			if (args[arg]!==undefined) {
				known[arg] = true;
			}
		}
		if (known.t && t===0) {
			if (known.x0) {
				x1 = x0;
			} else if (known.x1) {
				x0 = x1;
			} else {
				x0 = 0;
				x1 = 0;
			}
			v0 = 0;
			v1 = 0;
			a = 0;
			return {x0: x0, x1: x1, v0: v0, v1: v1, a: a, t: t};
		}
		// solve for acceleration given starting and ending position
		// this condition will also catch cases where *everything* is known
		if (known.x0 && known.x1 && known.v0 && known.t) {
			if (!known.a) {
				a = 2*((x1-x0)/(t*t)-v0/t);
			}
			if (!known.v1) {
				v1 = v0+a*t;
			}
		// solve for end position given acceleration
		} else if (known.x0 && known.v0 && known.a && known.t) {
			if (!known.x1) {
				x1 = x0+v0*t+a*t*t/2;
			}
			if (!known.v1) {
				v1 = v0+a*t;
			}
		// solve for end position and acceleration given final position
		} else if (known.x0 && known.v0 && known.v1 && known.t) {
			if (!known.a) {
				a = (v1-v0)/t;
			}
			if (!known.x1) {
				x1 = x0+v0*t+a*t*t/2;
			}
		// solve for beginning speed and acceleration given both positions and final speed
		} else if (known.x0 && known.x1 && known.v1 && known.t) {
			if (!known.a) {
				a = 2*(v1/t-(x1-x0)/(t*t));
			}
			if (!known.v0) {
				v0 = v1-a*t;
			}
		// impute acceleration to zero
		} else if (known.x0 && known.v0 && !known.a && !known.v1 && !known.x1) {
			a = 0;
			v1 = v0;
			x1 = x0+v0*t;
		} else if (known.x0 && known.x1 && !known.a && !known.v0 && !known.v1) {
			a = 0;
			v0 = (x1-x0)/t;
			v1 = v0;
		} else if (known.x0 && !known.a && !known.v0 && !known.v1 && !known.x1) {
			a = 0;
			v1 = 0;
			v0 = 0;
			x1 = x0;
		} else if (!known.x0 && !known.x1 && !known.v0 && !known.v1 && !known.a) {
			x0 = 0;
			x1 = 0;
			v0 = 0;
			v1 = 0;
			a = 0;
		} else {
			console.log(args);
			alert("solving method unimplemented");
			throw new Error("solving method unimplemented.");
		}

		return {x0: x0, x1: x1, v0: v0, v1: v1, a: a, t: t};
	}

	function solve_angle(args) {
		let {x0, x1, v0, v1, a, t, spin} = args;
		let known = {};
		for (let arg in args) {
			if (args[arg]!==undefined) {
				known[arg] = true;
			}
		}
		if (known.x0) {
			x0 = angle(x0);
			args.x0 = angle(args.x0);
		}
		if (known.x1) {
			x1 = angle(x1);
			args.x1 = angle(args.x1);
		}
		if (known.x0 && known.x1) {
			if (known.v0 && known.v1 && nearly(v0, v1) && !known.a) {
				// skip out on "spin" if we totally don't need it
				args.a = 0;
			} else if (!known.spin) {
				let trend = 0;
				if (known.v0) {
					trend+=(zeroish(v0) ? 0 : Math.sign(v0));
				}
				if (known.v1) {
					trend+=(zeroish(v1) ? 0 : Math.sign(v1));
				}
				if (known.a) {
					trend+=(zeroish(a) ? 0 : Math.sign(a));
				}
				if (trend>0) {
					spin = +1;
				} else if (trend<0) {
					spin = -1;
				} else if (nearly(x1,x0,0.1)) {
					spin = 0;
				} else if (x1>x0) {
					if ((x1-x0)*UNIT<=Math.PI) {
						spin = +1;
					} else {
						spin = -1;
					}
				} else if (x1<x0) {
					if ((x0-x1)*UNIT<=Math.PI) {
						spin = -1;
					} else {
						spin = +1;
					}
				}
				args.spin = spin;
				known.spin = true;	
			}
			// de-normalize final position based on spin argument
			if (known.spin) {
				if (x1>x0 && spin>0) {
					x1+=(2*Math.PI/UNIT)*(spin-1);
				} else if (x0>x1 && spin<0) {
					x1+=(2*Math.PI/UNIT)*(spin+1);
				} else {
					x1+=(2*Math.PI/UNIT)*spin;
				}
				args.x1 = x1;
			}
		}

		let solved = solve(args);
		if (args.spin===undefined) {
			let speed = (solved.v0+solved.v1)/2;
  			let spin = Math.sign(speed)*Math.ceil(Math.abs(speed*t/BEAT));
  			solved.spin = spin;
		} else {
			solved.spin = args.spin;
		}
		solved.x1 = angle(solved.x1);
		solved.x0 = angle(solved.x0);
		return solved;
	}

	function solve_linear(args) {
		let {a0, a1, r0, r1, la, vl0, vl1, al0, al, t} = args;
		let known = {};
		for (let arg in args) {
			if (args[arg]!==undefined) {
				known[arg] = true;
			}
		}
		// first, guess unspecified position parameters
		if (known.r0 && !known.a0 && known.a1) {
			a0 = a1;
			known.a0 = true;
		} else if (known.a0 && !known.r0 && known.r1) {
			r0 = r1;
			known.r0 = true;
		}
		if (known.r1 && !known.a1 && known.a0) {
			a1 = a0;
			known.a1 = true;
		} else if (known.a1 && !known.r1 && known.r0) {
			r1 = r0;
			known.r1 = true;
		}
		// next, convert to cartesian coordinates
		let x0, x1, y0, y1, d;
		if (known.r0 && known.a0) {
			x0 = r0*Math.cos(a0*UNIT);
			y0 = r0*Math.sin(a0*UNIT);
			known.x0 = true;
			known.y0 = true;
		}
		if (known.r1 && known.a1) {
			x1 = r1*Math.cos(a1*UNIT);
			y1 = r1*Math.sin(a1*UNIT);
			known.x1 = true;
			known.y1 = true;
		}
		// next, get the angle if we don't have it
		if (known.x0 && known.x1) {
			la = Math.atan2(y1-y0,x1-x0)/UNIT;
		} else if (!known.la) {
			throw new Error("can't solve for angle of linear motion");
		}
		// solve for distance if we can
		if (known.x0 && known.x1) {
			d = Math.sqrt((x1-x0)**2 + (y1-y0)**2);
		}
		// then pass arguments to scalar solver
		let solved = solve({x0: 0, x1: d, v0: vl0, v1: vl1, a: al, t: t});
		let d1 = solved.x1;
		vl0 = solved.v0;
		vl1 = solved.v1;
		al = solved.a;
		// solve for start and end position if necessary
		let xa = Math.cos(la*UNIT);
		let ya = Math.sin(la*UNIT);	
		if (known.x0 && !known.x1) {
			x1 = x0+xa*d1;
			y1 = y0+ya*d1;
		} else if (known.x1 && !known.x0) {
			x0 = x1-xa*d1;
			y0 = y1-ya*d1;
		}
		// finally convert back to polar
		r0 = Math.sqrt(x0*x0+y0*y0);
		r1 = Math.sqrt(x1*x1+y1*y1);
		a0 = Math.atan2(y0,x0)/UNIT;
		a1 = Math.atan2(y1,x1)/UNIT;

		// now all moments should be guaranteed
		// return {a0: a0, a1: a1, r0: r0, r1: r1, la: la, vl0: vl0/BEAT, vl1: vl1/BEAT, al: al/(BEAT*BEAT), t: t};
		return {a0: a0, a1: a1, r0: r0, r1: r1, la: la, vl0: vl0, vl1: vl1, al: al, t: t, spin: 0};
	}

	// moves?  or just node?
	function resolve(moves) {
		if (Array.isArray(moves)) {
			return moves.map(m=>resolve(m));
		}
		let nodes = {
			body: {r: 0, a: 0},
			pivot: {r: 0, a: 0},
			helper: {r: 0, a: 0},
			hand: {r: 1, a: 0},
			grip: {r: 0, a: 0},
			head: {r: 1, a: 0},
			beats: beats(moves),
			plane: moves.plane || WALL,
			bent: moves.bent || 0,
			vb: moves.vb || 0,
			twist: moves.twist || 0,
			vt: moves.vt || 0
		};
		for (let node of NODES) {
			let args = moves[node] || nodes[node];
			args = alias(args);
			args.beats = nodes.beats;
			if (args.spin===0 || args.la!==undefined || args.vl!==undefined || args.vl1!==undefined || args.al!==undefined) {
				// nodes[node] = {...moments_linear(args), plane: args.plane};
				nodes[node] = merge(moments_linear(args),{plane: args.plane});
			} else {
				// nodes[node] = {...moments_angular(args), plane: args.plane};
				nodes[node] = merge(moments_angular(args),{plane: args.plane});
			}
			for (let prop in nodes[node]) {
				if (zeroish(nodes[node][prop], SMALL)) {
					nodes[node][prop] = 0;
				}
			}
		}
		return nodes;
	}


// ****************************************************************************
// ********************** Logic to make sure moves fit together ***************
// ****************************************************************************

	function fit(move1, move2) {
		if (Array.isArray(move1)) {
			if (move1.length===0) {
				return clone(move2);
			}
			return fit(move1[move1.length-1],move2)
		}
		if (Array.isArray(move2)) {
			if (move2.length===0) {
				return [];
			}
			let fitted = clone(move2);
			fitted[0] = fit(move1, move2[0]);
			for (let i=1; i<move2.length; i++) {
				fitted[i] = fit(fitted[i-1], fitted[i]);
			}
			return fitted;
		} else {
			if (move2.recipe) {
				let built = build(move2, move1);
				console.log("building a move from a recipe");
				return built;
			}
			if (move2.nofit) {
				console.log("electing not to fit a move");
				// !!!returning the move unmodified sometimes underspecifies things
				return clone(move2);
			} else {
				let aligned = clone(move2);
				let resolved = resolve(move1);
				// !!!!won't work so well for plane breaks

				// is there a way to make this work in case of plane breaks?
				// yes...we need to check "inplane" for a and r, then use those instead of the unmodified ones	

				for (let n of NODES) {
					aligned[n] = merge({a: resolved[n].a1, r: resolved[n].r1}, aligned[n]);
				};
				if (fits(move1, aligned, 0.1)) {
					console.log("fitting by propagation only for unspecified");
					return aligned;
				}
				// let combinated = combinate(move1, move2);
				// if (combinated) {
				// 	for (let n of NODES) {
				// 		combinated[n] = merge({a: resolved[n].a1, r: resolved[n].r1}, combinated[n]);
				// 	}
				// 	console.log("fitting using recombination");
				// 	return combinated;
				// }
				console.log("basically failed to fit and kludging");
				aligned = merge(move2, move1);
				return aligned;
			}
		}
	}

	function fit_old(move1, move2) {
		if (Array.isArray(move1)) {
			if (move1.length===0) {
				return clone(move2);
			}
			return fit(move1[move1.length-1],move2)
		}
		if (Array.isArray(move2)) {
			if (move2.length===0) {
				return [];
			}
			let fitted = clone(move2);
			fitted[0] = fit(move1, move2[0]);
			for (let i=1; i<move2.length; i++) {
				fitted[i] = fit(fitted[i-1], fitted[i]);
			}
			return fitted;
		} else {
			if (move2.recipe) {
				let built = build(move2, move1);
				return built;
			}
			if (move2.nofit) {
				// !!!returning the move unmodified sometimes underspecifies things
				// return clone(move2);
				return resolve(move2);
			} else {
				let aligned = clone(move2);
				let resolved = resolve(move1);
				for (let n of NODES) {
					//!!! need to deal with plane bending
					aligned[n] = merge({a: resolved[n].a1, r: resolved[n].r1}, aligned[n]);
				};
				if (fits(move1, aligned)) {
					//console.log("MIDDLE METHOD");
					return aligned;
				}
				console.log("fitting by propagation");
				// is this actually what we want, ever?
				aligned = clone(move2);
				move2.plane = move1.plane;
				for (let n of NODES) {
					///!!! neeed to deal with plane bends
					aligned[n] = merge(aligned[n], {a: resolved[n].a1, r: resolved[n].r1});
				};
				return aligned;
			}
		}
	}



	function combinate(move1, move2) {
		console.log("I'm not so sure combinating was ever a good idea...");
		if (arguments[2]) {
			console.log("flag 1");
		}
		// skip all the recursive and recipe stuff for now
		if (fits(move1, move2)) {
			if (arguments[2]) {
				console.log("it fit");
				console.log(clone(move2));
			}
			return clone(move2);
		};
		if (arguments[2]) {
			console.log("flag 2");
		}
		let socket = dummy(move1);
		// the algorithm proper
		let diffs = {};
		for (let i=BODY; i<=GRIP; i++) {
			let node = NODES[i];
			let r0 = socket[node].r;
			let r1 = (!move2[node]) ? 0 : move2[node].r || 0;
			// doesn't handle plane breaks yet.
			diffs[node] = !nearly(r0, r1);
		}
		let deltas = Object.values(diffs).reduce((a,b)=>(a+b));
		// the algorithm only tries if there are at least two nodes<=HAND with different radii
		if (deltas>=2) {
			console.log("combinating");
			let nodes = [];
			for (let node in diffs) {
				if (diffs[node]) {
					if (move2[node] && !zeroish(move2[node].r)) {
						nodes.push(node);
					}
				}
			}
			// how many different angles will we try?
			let ANGLES = 8;
			let ANGLE = (2*Math.PI)/(UNIT*ANGLES);
			// seriously wonky magic going on here...use a string as if it were a combinatorial array
			let combos = "0".repeat(nodes.length);
			let aligned = clone(move2);
			while (combos.length<=nodes.length) {
				for (let i=0; i<combos.length; i++) {
					let node = merge({r: 0, a: 0}, move2[nodes[i]]);
					node.a = angle(node.a+ANGLE*combos[i]);
					aligned[nodes[i]] = node;
				}
				let m = dummy(aligned, 0);
				if (fits(move1, m)) {
					for (let node of nodes) {
						for (let prop of ["va","va1","vr","vr1","aa","ar","vl","al","la"]) {
							if (aligned[node][prop]!==undefined) {
								delete aligned[node][prop];
							}
						}
					}
					if (combos!=="0".repeat(nodes.length)) {
						console.log("found acceptible combination at "+combos);
						console.log(clone(nodes));
						console.log(clone(aligned));
					}
					return aligned;
				} else {
					// increment by one with radix ANGLES
					combos = parseInt(combos, ANGLES)+1;
					combos = Number(combos).toString(ANGLES);
					while (combos.length<nodes.length) {
						combos = "0"+combos;
					}
				}	
			}
		}
		return null;
	}

	// check whether the hand and head positions match
	function fits(prev, move, delta) {
		delta = delta || 0.01;
		if (Array.isArray(move)) {
			return fits(prev, move[0], delta);
		}
		let s = dummy(prev);
		let m = dummy(move, 0);
		return (sphere$nearly(	cumulate([s.body, s.pivot, s.helper, s.hand, s.grip]),
								cumulate([m.body, m.pivot, m.helper, m.hand, m.grip]),  delta)
				&& 
				sphere$nearly(s.head, m.head, delta)
				// sphere$nearly(	cumulate([s.grip, s.head]),
				// 				cumulate([m.grip, m.head]), delta)
		);
	}

	// calculate the default TWIST offset for a prop, given its head orientation, plane of motion, and bending motion
	function sphere$twist(s, p, bent, vb) {
		s = clone(s);
		p = p || WALL;
		bent = bent || 0;
		vb = vb || 0;
		let bearing = s.b;
			// correct for cusps
		if (angle$nearly(s.a, 0) || angle$nearly(s.a, 180)) {
			let tiny = angle$spherify(s.a+1, p);
			bearing = tiny.b;
			s.b = tiny.b;
		}
		let twist = angle$longitude(bearing, p);
		if (bent || vb) {
			// this part is correct; bend displays correctly
			let v = sphere$vectorize(s);
			let axis = vector$unitize(v);
			// does this meaning my cross product formula is backwards, or my brain is backwards?
			let tangent = vector$cross(p, axis);
			s = vector$spherify(vector$rotate(v,bent,tangent));
			bearing = s.b;
			if (angle(bent)>90 && angle(bent)<=270) {
				s.a = angle(-s.a);
				s.b = angle(s.b-180);
				bearing = s.b;
			}
			twist = angle$longitude(bearing, tangent);
			if (vb<0) {
				twist = angle(twist-180);
			}
		}
		return twist;
	}

	function angle$bend(a, b) {
		b = b || 0;
		if (angle$zeroish(b)) {
			return a;
		} else if (angle$nearly(b, 180)) {
			return angle(a+180);
		} else {
			return NaN;
		}
	}

	function matches(prev, move, delta) {
		delta = delta || 0.01
		if (Array.isArray(move)) {
			return matches(prev, move[0], delta);
		}
		prev = resolve(prev);
		move = resolve(move);
		for (let n of NODES) {
			// !!!need to handle planes!
			let node1 = prev[n];
			let node2 = move[n];
			if (n==="head" && vector$nearly(prev.plane, move.plane, delta) && nearly(node1.r1, node2.r, delta)) {
				if (!prev.bent && !prev.vb) {
					continue;
				}
				let bent = (prev.bent || 0) + (BEAT*prev.vb*beats(prev) || 0);
				if (angle$nearly(move.head.a, angle$bend(prev.head.a1, bent))) {
					continue;
				} else {
					return false;
				}
			} else if (!vector$nearly(prev.plane, move.plane, delta) || !nearly(node1.r1, node2.r, delta) || !angle$nearly(node1.a1, node2.a, delta)) {
				return false;
			}
		}
		return true;
	}
	// find the cumulative position of an array of nodes
	function cumulate(nodes) {
		let [xs, ys, zs] = [0, 0, 0];
		for (let node of nodes) {
			let {x, y, z} = sphere$vectorize(node);
			xs+=x;
			ys+=y;
			zs+=z;
		}
		return vector$spherify(vector(xs,ys,zs));
	}

	// rotate an array of moves to find a fit
	function realign(move, fitter) {
		let oriented = move;
		for (let i=0; i<move.length; i++) {
			if (fitter(oriented[0])) {
				return oriented;
			} else {
				console.log("realigning");
				let head = oriented[0];
				let tail = oriented.slice(1);
				oriented = tail.concat(head);
			}
		}
		console.log("realignment failed");
		alert("realignment failed");
		console.log(move);
		throw new Error("realignment failed");
		return move;
	}
	
// ****************************************************************************
// ********************** Various helper methods ******************************
// ****************************************************************************	
	function beats(move) {
		if (Array.isArray(move)) {
			let b = 0;
			for (let m of move) {
				b+=beats(m);
			}
			return b;
		} else if (move.recipe) {
			return (move.beats!==undefined) ? move.beats : 4;
		} else {
			return (move.beats!==undefined) ? move.beats : 1;
		}
	}	

	function axis(prop) {
		// so that I can later switch how this works if I misunderstood GRIP
		return vector$unitize(sphere$vectorize(prop.head));
	}

	function inplane(prop, plane, from, delta) {
	  	delta = delta || 0.01;
	  	from = from || BODY; 
	  	for (let i=from; i<NODES.length; i++) {
	    	let nodes = [];
	    	for (let j=from; j<=i; j++) {
	      		nodes.push(prop[NODES[j]]);
	    	}
	    	let s = cumulate(nodes);
	    	let v = sphere$vectorize(s);
	    	let p = vector$project(v,plane);
	    	if (!vector$nearly(v,p,delta)) {
	     		return false;
	    	}
	  	}
	  return true;
	}

	function flatten(arr) {
		let rtn = [];
		for (let i=0; i<arr.length; i++) {
			if (Array.isArray(arr[i])) {
				rtn = rtn.concat(flatten(arr[i]));
			} else {
				// preserves object identity
				rtn.push(arr[i]);
			}
		}
		return rtn;
	}

	// returns the original, not a copy
	function submove(moves, t) {
		// avoiding infinite loops
		let t1 = parseInt(t);
		if (isNaN(t1)) {
			console.log(t);
			throw new Error("non-integer passed as t");
		} else {
			t = t1;
		}
		if (Array.isArray(moves)) {
			let past = 0;
			let i = 0;
			while (past<=t) {
				let ticks = beats(moves[i])*BEAT || BEAT;
				if (past+ticks>t) {
					// if I wanted a recursive version, this is where I would do it
					return {move: moves[i], tick: t-past, index: i};
				} else {
					past+=ticks;
					i=(i+1)%moves.length;
				}
			}
		} else {
			return {move: moves, tick: t, index: 0};
		}
	}

	function elapsed(move, index) {
		if (Array.isArray(move)) {
			let past = 0;
			for (let i=0; i<index; i++) {
				past+=beats(move[i])*BEAT;
			}
			return past;
		} else {
			return 0;
		}
	}
	
// ****************************************************************************
// ********************** Tools for building prefab moves *********************
// ****************************************************************************	
	let MoveFactory = {
		defaults: {
			plane: WALL,
			orient: UP,
			spin: INSPIN,
			beats: 4,
			direction: CLOCKWISE,
			hand: {r: 1},
			head: {r: 1}
		}
	}

	function build(recipe, prev) {
		let bs = recipe.beats || 4;
		if (!prev) {
			let single = MoveFactory[recipe.recipe](recipe);
			let built = single;
			while (beats(built)<bs) {
				built = built.concat(single);
			}
			// this assumes every segment is one beat long...
			return built.slice(0,bs);
		}
		// if the move has a plane, we keep that; otherwise, we use the wall plane.
		let args = merge(prev, recipe);
		let single = MoveFactory[args.recipe](args);
		for (m of single) {
			m.notes = recipe.notes;
		}
		if (!recipe.nofit) {
			single = realign(single, (s)=>fits(prev,s));
		}
		let built = single;
		while (beats(built)<bs) {
			built = built.concat(single);
		}
		// this assumes every segment is one beat long...
		return built.slice(0,bs);
	}

	function recipe(name, defs, f) {
		MoveFactory[name] = (args) => {
			return f(merge(merge(MoveFactory.defaults, defs), args));
		}
	}
	function variant(name, recipe, defs) {
		MoveFactory[name] = (args)=>{
			return MoveFactory[recipe](merge(defs, args));
		}
	}

	// for now, no "t" argument
	function extend(move) {
		let plane = move.plane || WALL;
		let resolved = resolve(move);
		let next = movify(dummy(resolved), plane);
		for (let i=0; i<NODES.length; i++) {
			let node = NODES[i];
			// !!! essentially untested
			next[node].va = resolved[node].va1;
			next[node].vl = resolved[node].vl1;
			next[node].la = resolved[node].la;
		}
		return next;
	}

	function chain(arr) {
		for (let i=1; i<arr.length; i++) {
			let prev = arr[i-1];
			let args = arr[i];
			let fitted = merge(extend(prev), args);
			let bent = 0;
			let twist = 0;
			if (prev.bent || prev.vb) {
				bent = bent + (prev.bent || 0) + (prev.vb*beats(prev)*BEAT || 0);
				// this took a lonnng time to figure out
				// fitted.head.a = moments_angular({...prev.head, beats: beats(prev)}).a1;
				fitted.head.a = moments_angular(merge(prev.head, {beats: beats(prev)})).a1;
			}
			if (prev.twist || prev.vt) {
				twist = (prev.twist || 0) + (prev.vt*beats(prev)*BEAT || 0);
			}
			bent = angle(bent);
			twist = angle(twist);
			let extended = merge(fitted,{
				vb: (args.vb!==undefined) ? args.vb : prev.vb,
				bent: (args.bent!==undefined) ? args.bent : bent,
				vt: (args.vt!==undefined) ? args.vt : prev.vt,
				twist: (args.twist!==undefined) ? args.twist : twist
			});
			// let extended = {
			// 	...fitted,
			// 	vb: (args.vb!==undefined) ? args.vb : prev.vb,
			// 	bent: (args.bent!==undefined) ? args.bent : bent,
			// 	vt: (args.vt!==undefined) ? args.vt : prev.vt,
			// 	twist: (args.twist!==undefined) ? args.twist : twist
			// };
			arr[i] = extended;
		}
		// should it wrap around to the beginning automatically?
		return arr;
	}


// ****************************************************************************
// ********************** Object-Oriented Convenience Wrappers ****************
// ****************************************************************************
function Player(renderer) {
		if (renderer) {
			this.render = function(wrappers, positions) {
				renderer.render(wrappers, positions);
			};
		}
		this.props = [];
		this.speed = 10;
		this.rate = 1;
		this.tick = 0;
	}
	Player.prototype.addProp = function(prop, args) {
		prop = prop || new Prop();
		let wrapper = new PropWrapper(prop, args);
		this.props.push(wrapper);
		return wrapper;
	}
	Player.prototype.goto = function(t) {
		let shortest;
		for (let prop of this.props) {
			if (shortest===undefined || beats(prop.moves)*BEAT<shortest) {
				shortest = beats(prop.moves)*BEAT;
			}
		}
		if (t<0) {
			this.tick = shortest - (-t)%shortest;
		} else if (shortest===0) {
			this.tick = 0;
		} else {
			this.tick = t%shortest;
		}
		let positions = [];
		for (let prop of this.props) {
			try {
				positions.push(prop.spin(this.tick));
			} catch (e) {
				console.log("Error in player.goto");
				console.log(prop);
				throw(e);
			}
		}
		this.update(positions);
		return positions;
	}
	Player.prototype.play = function() {
		this.stop();
		this._stopped = false;
		let _play = ()=>{
			if (this._stopped) {
				return;
			}
			setTimeout(_play, this.speed);
			this.goto(this.tick+this.rate);
		}
		_play();
	};
		
	Player.prototype.animate = function() {
		this.stop();
		this._stopped = false;
		let fps = 60;
		let then, now, between;
		// let that = this;
		then = Date.now();
		let _animate = ()=>{
			if (this._stopped) {
				return;
			}
			requestAnimationFrame(_animate);
			now = Date.now();
			between = (now-then)*fps/1000;
			this.goto(this.tick+Math.round(between));
			// this.goto(this.tick+1);
			then = Date.now();
		}
		_animate();
	}

	// Player.prototype.play = Player.prototype.animate;

	Player.prototype.stop = function() {
		this._stopped = true;
		clearInterval(this._interval);
	}

	Player.prototype.reset = function() {
		this.stop();
		this.goto(0);
	}

	Player.prototype.refresh = function() {
		this.goto(this.tick);
	}

	Player.prototype.ready = function() {
		this.reset();
	}

	Player.prototype.update = function(positions) {
		// should always be overridden
		// renderer.render(this.props, positions);
	}

	function PropWrapper(prop, args) {
		args = args || {};
		this.model = args.model || "poi";
		this.color = args.color || "red";
		this.fire = args.fire || false;
		this.alpha = args.alpha || 1;
		this.nudge = args.nudge || 0;
		this.prop = prop;
		this.moves = [];
		this.fitted = null;
	}

	PropWrapper.prototype.refit = function() {
		this.fitted = fit(movify(this.prop), this.moves);
		return this.fitted;
	}
	PropWrapper.prototype.spin = function(t) {
		if (this.moves.length===0) {
			return this.prop;
		}
		if (!this.fitted) {
			this.refit();
		}
		return spin(this.fitted, t);
	}
	for (let node of NODES) {
		let nname = node[0].toUpperCase()+node.slice(1);
		PropWrapper.prototype["set"+nname+"Angle"] = function(a,p) {
			p = p || WALL;
			let s = angle$spherify(a,p);
			s.r = this.prop[node].r;
			this.prop[node] = s;
		}
		PropWrapper.prototype["set"+nname+"Radius"] = function(r) {
			this.prop[node].r = r;
		}
	}

	function Controls(player) {
		this.player = player;
		this.tick = (player) ? player.tick : 0;
		this.rate = 15;
		let controls = document.createElement("div");
		this.div = controls;
		controls.className = "vs3d-controls";
		let button;
		button = document.createElement("button");
		button.className = "vs3d-button";
		button.onclick = ()=>{
			player.play();
		}
		button.innerHTML = "Play";
		controls.appendChild(button);
		button = document.createElement("button");
		button.className = "vs3d-button";
		button.onclick = ()=>{
			player.stop();
		}
		button.innerHTML = "Pause";
		controls.appendChild(button);
		button = document.createElement("button");
		button.className = "vs3d-button";
		button.onclick = ()=>{
			player.stop();
			player.goto(player.tick-this.rate)
		};
		button.innerHTML = "-";
		controls.appendChild(button);
		let input = document.createElement("input");
		input.type = "number";
		input.className = "vs3d-number-input";
		input.value = this.tick;
		input.style.width = "80px";
		input.onchange = (e)=>{
			player.stop();
			player.goto(e.target.value)
		};
		input.oninput = input.onchange;
		controls.appendChild(input);
		button = document.createElement("button");
		button.className = "vs3d-button";
		button.onclick = ()=>{
			player.stop();
			this.player.goto(player.tick+this.rate)
		};
		button.innerHTML = "+";
		controls.appendChild(button);
		button = document.createElement("button");
		button.className = "vs3d-button";
		button.onclick = ()=>{
			player.reset();
		}
		button.innerHTML = "Reset";
		controls.appendChild(button);
	}
	Controls.prototype.update = function(t) {
		let input = this.div.querySelector(".vs3d-number-input");
		input.value = t;
	}

	let styleInserted = false;
	function Overlay(contents, suppressStyleInsertion) {
		if (styleInserted===false && !suppressStyleInsertion) {
			let overStyles = ".vs3d-overlay {color:yellow;position:absolute;width:100%;top:25px;text-align:center;} .vs3d-overlay a {color: orange} .vs3d-overlay a:visited {color: cyan}";
			let css = document.createElement("style");
			css.type = "text/css";
			if (css.styleSheet) {
				css.styleSheet.cssText = overStyles;
			} else {
				css.appendChild(document.createTextNode(overStyles));
			}
			console.log("Note: Overlay style element into header.");
			document.head.insertAdjacentElement("afterbegin",css);
			styleInserted = true;
		}
		contents = contents || [];
		if (typeof(contents)==="string") {
			this.contents = [{html: contents, beats: 1, style: ""}];
		} else if (contents.html!==undefined) {
			this.contents = [contents];
		} else if (Array.isArray(contents)) {
			this.contents = contents;
		}
		this.style = "";
		this.div = document.createElement("div");
		this.div.className = "vs3d-overlay";
		this.div.innerHTML = "";
		this._htmlCache = "";
		this._styleCache = "";
	}
	Overlay.prototype.update = function(t) {
		let contents = this.contents;
		let content;
		if (Array.isArray(contents)) {
			if (contents.length===0) {
				return;
			}
			let past = 0;
			let i = 0;
			let ticks = beats(contents[i])*BEAT || 1*BEAT;
			let TRIES = 100;
			let tries = 0;
			while (past<=t && tries<TRIES) {
				tries+=1;
			 	let ticks = beats(contents[i])*BEAT || 1*BEAT;
			 	if (past+ticks>=t) {
			 		content = contents[i];
			 		break;
			 	} else {
			 		past+=ticks;
			 		i=(i+1)%contents.length;
			 	}
			}
		}
		if (content.html!==undefined && content.html!==this._htmlCache) {
			this.div.innerHTML = content.html || "";
			this._htmlCache = content.html || "";
		} 
		if (content.style!==undefined && content.style!==this._styleCache) {	
			this.div.cssText = content.style || this.style;
		}
	}

	function TimeCoder() {
	this.RATE = 24;
		this.timecodes = [];
	}

	TimeCoder.prototype.setTime = function(t) {
		// must override
		// might need to handle bounds?
		//video.setTime(round(t, 1/this.RATE));
	}

	TimeCoder.prototype.getTime = function() {
		// must override
		// video.currentTime =
		// return video.currentTime.toFixed(3);
	}

	TimeCoder.prototype.update = function() {
		// should override
		// updateFrame;
	}

	TimeCoder.prototype.add = function() {
		let time = this.getTime();
		for (let code of this.timecodes) {
			if (nearly(code, time)) {
				return;
			} 
		}
		this.timecodes.push(time);
		this.timecodes.sort((a,b)=>{
			if (parseFloat(a)<parseFloat(b)) {
				return -1;
			} else if (parseFloat(a)>parseFloat(b)) {
				return +1;
			} else {
				return 0;
			}
		});
		this.update();
	}

	TimeCoder.prototype.remove = function() {
		let time = this.getTime();
		let i=0;
		while (i<this.timecodes.length) {
			if (nearly(this.timecodes[i], time)) {
				this.timecodes.splice(i,1);
			} else {
				i++;
			}
		}
		this.update();
	}


// ****************************************************************************
// ********************** Serialization Methods *******************************
// ****************************************************************************
	function stringify(thing) {
		return JSON.stringify(thing, function(key, value) {
			if (["a","b","bent","twist","a1","la"].includes(key)) {
				return Math.round(value);
			} else if (["x","y","z"].includes(key)) {
				return round(value,0.001);
			} else if (["r","r1"].includes(key)) {
				return round(value,0.01);
			} else if (["va","va1","vr","vr1","aa","ar","vl","vl2","al"].includes(key)) {
				return round(value,0.0001);
			} else if (key==="fitted") {
				return undefined;
			} // else if (key==="plane") {
				// do something
			//}
			 else {
				return value;
			}
		},2);
	}

	function parse(thing) {
		return JSON.parse(thing, function(key, value) {
			if (["r","r1"].includes(key)) {
				// return (value || TINY);
				return value;
			} // else if (key==="plane") {
				//do something
			//}
			 else {
				return value;
			}
		});
	}

	// removes unneeded properties from solved move
	function desolve(move) {
		if (Array.isArray(move)) {
			return move.map(desolve);
		}

		move = resolve(move);
		for (let i=0; i<NODES.length; i++) {
			let node = move[NODES[i]];
			if (!node) {
				continue;
			}
			// assume that it is fully solved
			if (node.r===node.r1 && node.vr===0 && node.vr1==0 && node.a===node.a1 && node.va===0 && node.va1==0) {
				delete move[NODES[i]];
			} else {
				if (node.r===node.r1 && node.vr===0 && node.vr1==0) {
					if (zeroish(node.r) && i!==HEAD && i!==HAND) {
						delete node.r;
					}
					delete node.r1;
					delete node.vr;
					delete node.vr1;
					delete node.ar;
				} else if (node.vr===node.vr1) {
					delete node.r1;
					delete node.vr1;
					delete node.ar;
				} else {
					delete node.r1;
					delete node.ar;
				}
				if (node.a===node.a1 && node.va===0 && node.va1==0) {
					if (zeroish(node.a)) {
						delete node.a;
					}
					delete node.a1;
					delete node.va;
					delete node.va1;
					delete node.aa;
				} else if (node.va===node.va1) {
					delete node.a1;
					delete node.va1;
					delete node.aa;
				} else {
					delete node.a1;
					delete node.aa;
				}
			}
		}
		return move;
	}

	function save(obj, fname) {
		fname = fname || "sequence.json";
		let txt = (typeof(obj)==="string") ? obj : stringify(obj); 
		let blob = new Blob([txt], {type : 'text/plain'});
		let url = window.URL.createObjectURL(blob);
		// window.open(url);
		
		let p = prompt("Enter name for saved file:",fname);
		if (p.length<5 || p.substring(p.length-5)!==".json") {
			p = p+".json";
		}
		if (p) {
			let anchor = document.createElement("a");
			anchor.download = p;
			anchor.href = url;
			anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
			document.body.appendChild(anchor);
			anchor.click();
			setTimeout(()=>{
				document.body.removeChild(anchor);
				window.URL.revokeObjectURL(url);
			}, 0);
		} 
		return p;
	}

// ****************************************************************************
// ********************** Module Exports **************************************
// ****************************************************************************

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
	// VS3D.vector$tinify = vector$tinify;
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
	// VS3D.sphere$tinify = sphere$tinify;
	VS3D.sphere$planify = sphere$planify;
	VS3D.plane = plane;
	VS3D.plane$reference = plane$reference;
	VS3D.angle$vectorize = angle$vectorize;
	VS3D.angle$spherify = angle$spherify;
	VS3D.angle$rotate = angle$rotate;
	VS3D.angle$longitude = angle$longitude;
	VS3D.Prop = Prop;
	VS3D.Move = Move;
	VS3D.movify = movify;
	VS3D.spin = spin;
	VS3D.beats = beats;
	VS3D.flatten = flatten;
	VS3D.submove = submove;
	VS3D.elapsed = elapsed;
	VS3D.fits = fits;
	VS3D.fit = fit;
	VS3D.matches = matches;
	VS3D.combinate = combinate;
	VS3D.cumulate = cumulate;
	VS3D.axis = axis;
	VS3D.inplane = inplane;
	VS3D.angle$bend = angle$bend;
	VS3D.sphere$twist = sphere$twist;
	VS3D.extend = extend;
	VS3D.dummy = dummy;
	VS3D.MoveFactory = MoveFactory;
	VS3D.recipe = recipe;
	VS3D.build = build;
	VS3D.variant = variant;
	VS3D.realign = realign;
	VS3D.chain = chain;
	VS3D.spin_node = spin_node;
	VS3D.spin_angular = spin_angular;
	VS3D.spin_linear = spin_linear;
	VS3D.alias = alias;
	VS3D.solve = solve;
	VS3D.solve_angle = solve_angle;
	VS3D.solve_linear = solve_linear;
	VS3D.resolve = resolve;
	VS3D.PropWrapper = PropWrapper;
	VS3D.Player = Player;
	VS3D.Controls = Controls;
	VS3D.Overlay = Overlay;
	VS3D.TimeCoder = TimeCoder;
	VS3D.stringify = stringify;
	VS3D.parse = parse;
	VS3D.desolve = desolve;
	VS3D.save = save;
	return VS3D;
}();



