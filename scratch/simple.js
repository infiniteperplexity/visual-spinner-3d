VS3D = function(VS3D) {
	// **** elemental movements ****
	// parameterized spin
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
		if (move.x!==undefined || move.y!==undefined || move.z!==undefined) {
			return move$vector;
		} else if (move.arc!==undefined || move.twist!==undefined || move.choke!==undefined || move.bend!==undefined) {
			return move$grip;
		} else if (move.r!==undefined || move.a!==undefined || move.b!==undefined) {
			return move$sphere;
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
			return return move$sphere({r: r, a: a, b: b, ...move});
		}
	}

	// derive position from a parameterized movement and time
	function move$calculate(move, t) {
		if (move$type(move)===move$vector) {
			let x = move.x + move.vx*t + move.ax*t*t/2;
			let y = move.y + move.vy*t + move.ay*t*t/2;
			let z = move.z + move.vz*t + move.az*t*t/2;
			return VS3D.vector$spherify(VS3D.vector(x,y,z))
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
			return VS3D.sphere(r,a,b);
		}
	}


	function plane$setNode(radius, a, p) {
		p = p || WALL;
		let v = unitize(vector$rotate(reference(p));
		v = {radius: r, ...v};
		return spherify(v);
	}

	// maybe combine NodeSegment and GripSegment?
	function NodeSegment(args) {
		args = args || {};
		// for spinning
		this.speed = args.speed || 0;
		this.end_speed = args.end_speed || this.speed;
		this.extend = args.extend || 0;
		this.end_extend = args.end_extend || this.extend; 
		// for sliding
		this.angle = args.angle || 0;
		this.slide = args.slide || 0;
		this.end_slide = args.end_slide || this.slide;
		// for both
		this.plane = VS3D.clone(args.plane) || VS3D.WALL;
		// internal
		if (this.slide!==0 || this.end_slide!==0) {
			let {x, y, z} = VS3D.angle$vectorize(this.angle, this.plane);
			let a = (this.end_slide-this.slide)/2;
			let v = this.slide;
			this.move = move$vector({x:0,y:0,z:0,vx:v*x,vy:v*y,vz:v*z,ax:a*x,ay:a*y,az:a*z});
		} else {
			let vr = this.extend;
			let ar = (this.end_extend-this.extend)/2;
			// ummm...so, we're going to multiple something here...
			let {r, a, b} = VS3D.angle$spherify(this.speed, this.plane);
			let va = this.speed*a;
			let vb = this.speed*b;
			let acc = (this.end_speed-this.speed)/2;
			let aa = acc*a;
			let ab = acc*b;
			this.move = move$sphere({r:0,a:0,b:0,vr:vr,va:va,vb:vb,ar:ar,aa:aa,ab:ab});
		}
	}
	NodeSegment.prototype.clone = function() {
		return new NodeSegment(this);
	}
	NodeSegment.prototype.spin = function(t) {
		return move$spin(this.move, t);
	}
	NodeSegment.prototype.split = function(t) {
		let node = move$spin(this.move, t);
		if (move$type(this.move)===move$sphere) {
			let {r, a, b} = node;
			return [
				this.clone(),
				move$sphere({r: r, a: a, b: b, ...this.move})
			];
		} else if (move$type(this.move)===move$vector) {
			let {x, y, z} = VS3D.vectorize(node);
			return [
				this.clone(),
				move$vector({x: x, y: y, z: z, ...this.move})
			];
		}
	}
	NodeSegment.prototype.align = function(node) {
		if (move$type(this.move)===move$sphere) {
			let {r, a, b} = node;
			let {vr, va, vb, ar, aa, ab} = this.move;
			return move$sphere({r: r, a: a, b: b, vr: vr+ar*t, va: va+aa*t, vb: vb+ab*t, ...this.move});
		} else if (move$type(this.move)===move$vector) {
			let {x, y, z} = VS3D.vectorize(node);
			let {vx, vy, vz, ax, ay, az} = this.move;
			return move$vector({x: x, y: y, z: z, vx: vx+ax*t, vy: vy+ay*t, vz: az*t, ...this.move});
		}
	}
	// wait a second...choke is linear, the rest are angular
	function GripSegment(args) {
		args = args || {};
		// all these represent velocities, not positions
		this.arc = args.arc || 0;
		this.end_arc = args.end_arc || this.arc;
		this.bend = args.bend || 0;
		this.end_bend = args.end_bend || this.bend;
		this.choke = args.choke || 0;
		this.end_choke = args.end_choke || this.choke;
		this.twist = args.twist || 0;
		this.end_twist = args.end_twist || this.twist;
		this.move = move$grip({
			arc: 0, bend: 0, choke: 0, twist: 0,
			va: this.arc,vb: this.bend, vc: this.choke, vt: this.twist,
			aa: (this.end_arc-this.arc)/2, ab: (this.end_bend-this.bend)/2,
			ac: (this.end_choke-this.choke)/2, at: (this.end_twist-this.twist)/2
		});
	}
	GripSegment.prototype.clone = function() {
		return new GripSegment(this);
	}
	GripSegment.prototype.spin = function(t) {
		return move$spin(this.move, t);
	}
	GripSegment.prototype.split = function(t) {
		let {arc, bend, choke, twist} = move$spin(this.move, t);
		let {va, vb, vc, vt, aa, ab, ac, at} = this.move;
		let angle = VS3D.angle;
		return [
			this.clone(), 
			move$grip({
				arc: angle(arc), bend: angle(bend), choke: choke, twist: angle(twist),
				va: va+aa*t, vb: vb+ab*t, vb: vb+ab*t, vt: vb+at*t,
				...this.move
			})
		];
	}
	GripSegment.prototype.align = function(grip) {
		let {arc, bend, choke, twist} = grip;
		return move$grip({arc: arc, bend: bend, choke: choke, twist: twist, ...this.move})
	}
	function MoveSegment(args) {
		args = args || {};
		this.nodes = {
			body: NodeSegment(args.body || {}),
			pivot: NodeSegment(args.pivot || {}),
			helper: NodeSegment(args.helper || {}),
			hand: NodeSegment(args.hand || {}),
			head: NodeSegment(args.head || {speed: 1})
		};
		this.grip = GripSegment(args.grip || {});
		this.beats = args.beats || 1;
	}
	MoveSegment.prototype.children = [];
	MoveSegment.prototype.beats = function() {
		return this.beats;
	}
	MoveSegment.prototype.spin = function(t) {
		let grip = this.grip.spin(t);
		let args = {
			body: this.nodes.body.spin(t),
			pivot: this.nodes.pivot.spin(t),
			helper: this.nodes.helper.spin(t),
			hand: this.nodes.hand.spin(t),
			head: this.nodes.head.spin(t),
			arc: grip.arc,
			bend: grip.bend,
			choke: grip.choke,
			twist: grip.twist
		}
		return VS3D.newProp(args);
	}
	MoveSegment.prototype.split = function(t) {
		let one = this.clone();
		let two = this.clone();
		for (let n in this.nodes) {
			two.nodes[n] = this.nodes[n].split(t);
		}
		two.grip = this.grip.split(t);
		two.beats = t/VS3D.BEATS;
		one.beats = this.beats - two.beats;
		return [one,two];
	}
	MoveSegment.prototype.socket = function() {
		let grip = grip: this.grip.spin(this.beats*VS3D.BEATS);
		let args = {
			body: this.nodes.body.spin(this.beats*VS3D.BEATS),
			pivot: this.nodes.pivot.spin(this.beats*VS3D.BEATS),
			helper: this.nodes.helper.spin(this.beats*VS3D.BEATS),
			hand: this.nodes.hand.spin(this.beats*VS3D.BEATS),
			head: this.nodes.head.spin(this.beats*VS3D.BEATS),
			arc: grip.arc,
			bend: grip.bend,
			choke: grip.choke,
			twist: grip.twist
		};
		return VS3D.newProp(args);
	}
	MoveSegment.prototype.head = function() {
		return this;
	}
	MoveSegment.prototype.tail = function() {
		return this;
	}
	MoveSegment.prototype.align = function(prop) {
		let aligned = this.clone();
		// body, pivot, and helper don't have to align
		aligned.hand = this.nodes.hand.align(VS3D.nodeSum(prop, HAND));
		aligned.head = this.nodes.head.align(VS3D.nodeSum(prop, HEAD));
		return aligned;
	}
	MoveSegment.prototype.clone = function() {
		return new MoveSegment(this);
	}
	function MoveChain(arr) {
		arr = arr || [];
		this.children = arr;
		if (prop) {
			return this.align(prop);
		} else {
			return this;
		}
	}
	MoveChain.prototype.beats = function() {
		let beats = 0;
		for (let child of children) {
			beats+=child.beats;
		}
		return beats;
	}
	MoveChain.prototype.spin = function(t) {
		let n = this._segmentAt(t);
		return this.children[n].spin(t-this._ticksBefore(n));
	}
	MoveChain.prototype.split = function(t) {
		let n = this._segmentAt(t);
		t-=this._ticksBefore(n);
		let one = (n===0) ? [] : this.children.slice(0,n);
		let two = (n===this.children.length-1) ? [] : this.children.slice(n+1);
		let [end, begin] = (t===0) ? [[],[]] || this.children[n].split(t);
		one.push(end);
		two.unshift(begin);
		return [one, two];
	}
	MoveChain.prototype.socket = function() {
		return this.tail().socket();
	}
	MoveChain.prototype.head = function() {
		return this.children[0];
	}
	MoveChain.prototype.tail = function() {
		return this.children[this.children.length-1];
	}
	MoveChain.prototype.align = function(prop) {
		let aligned = this.clone();
		clone.children[0] = clone.children[0].align(prop);
		for (let i=1; i<this.children.length; i++) {
			clone.children[i] = clone.children[i].align(clone.children[i-1].socket());
		}
		return clone;
	}
	MoveChain.prototype.clone = function() {
		let arr = this.children.map((e)=>e.clone());
		return new MoveChain(arr);
	}
	MoveChain.prototype._segmentAt = function(t) {
		let ticks = 0;
		let current = -1;
		while (ticks<t) {
			current+=1;
			ticks+=this.children[current].beats*VS3D.BEATS;
		}
		return current;
	}
	MoveChain.prototype._ticksBefore = function(n) {
		let ticks = 0;
		for (let i=0; i<n; i++) {
			ticks+=this.children[i].beats*VS3D.BEATS;
		}
		return ticks;
	}
	// maybe NodeChain / GripChain?
}(VS3D);