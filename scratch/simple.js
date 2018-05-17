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
			return return move$sphere({r: r, a: a, b: b, ...move});
		}
	}

	// derive position from a parameterized movement and time
	function move$spin(move, t) {
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

	// so...should this have a plane?  or does the whole SimpleMove have a plane?
	function NodeSegment(args) {
		args = args || {};
		// do we want this? prolly not because it will override everything
		if (args.move) {
			this.move = clone(args.move);
			return this;
		}
		this.radius = args.radius || 0;
		this.angle = args.angle || 0;
		this.plane = VS3D.clone(args.plane) || VS3D.WALL;
		// for sliding
		if (args.slide!==undefined) {
			this.slide = args.slide;
			this.slide.angle = args.slide.angle || 0;
			this.slide.speed = args.slide.speed || 0;
			this.slide.end_speed = args.slide.end_speed || 0;
			let {x, y, z} = VS3D.angle$vectorize(this.angle, this.plane);
			let r = this.radius;
			let {vx, vy, vz} = VS3D.angle$vectorize(this.slide.angle, this.plane);
			let a = (this.slide.end_speed-this.slide.speed)/2;
			let v = this.slide.speed;
			this.move = move$vector({x:r*x,y:r*y,z:r*z,vx:v*vx,vy:v*vy,vz:v*vz,ax:a*vx,ay:a*vy,az:a*vz});
		} else if (args.arc!==undefined || args.bend!==undefined || args.choke!==undefined || args.twist!==undefined) {
			this.arc = args.arc || {};
			this.arc.angle = args.arc.angle || 0;
			this.arc.speed = args.arc.speed || 0;
			this.arc.end_speed = args.arc.end_speed || this.arc.speed;
			this.bend.angle = args.bend.angle || 0;
			this.bend.speed = args.bend.speed || 0;
			this.bend.end_speed = args.bend.end_speed || this.bend.speed;
			this.choke.radius = args.choke.radius || 0;
			this.choke.speed = args.choke.speed || 0;
			this.choke.end_speed = args.choke.end_speed || this.bend.speed;
			this.twist.angle = args.twist.angle || 0;
			this.twist.speed = args.twist.speed || 0;
			this.twist.end_speed = args.twist.end_speed || this.twist.speed;
			this.move = move$grip({
				arc: this.arc.angle, bend: this.bend.angle,
				choke: this.choke.radius, twist: this.twist.angle,
				va: this.arc.speed, vb: this.bend.speed,
				vc: this.choke.speed, vt: this.twist.speed,
				aa: (this.arc.speed-this.arc.end_speed)/2,
				ab: (this.bend.speed-this.bend.end_speed)/2,
				ac: (this.choke.speed-this.choke_speed)/2,
				at: (this.twist.speed-this.twist.end_speed)/2
			});
		} else {
			this.speed = args.speed || 0;
			this.end_speed = args.end_speed || this.speed;
			this.extend = args.extend || 0;
			this.end_extend = args.end_extend || this.extend; 
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
	NodeSegment.prototype.clone = function(args) {
		return new NodeSegment(args, ...this);
	}
	NodeSegment.prototype.spin = function(t) {
		return move$spin(this.move, t);
	}
	NodeSegment.prototype.split = function(t) {
		let node = move$spin(this.move, t);
		if (move$type(this.move)===move$sphere) {
			let {r, a, b} = node;
			// wait this is all wrong...
			return [
				this.clone(),
				new SimpleMove({radius: r, })
				move$sphere({r: r, a: a, b: b, ...this.move})
			];
		} else if (move$type(this.move)===move$vector) {
			let {x, y, z} = VS3D.vectorize(node);
			return [
				this.clone(),
				move$vector({x: x, y: y, z: z, ...this.move})
			];
		} else if (move$type(this.move)===move$grip) {
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
	}
	// wait this isn't right, is it?
	NodeSegment.prototype.align = function(node) {
		if (move$type(this.move)===move$sphere) {
			let {r, a, b} = node;
			let {vr, va, vb, ar, aa, ab} = this.move;
			return move$sphere({r: r, a: a, b: b, vr: vr+ar*t, va: va+aa*t, vb: vb+ab*t, ...this.move});
		} else if (move$type(this.move)===move$vector) {
			let {x, y, z} = VS3D.vectorize(node);
			let {vx, vy, vz, ax, ay, az} = this.move;
			return move$vector({x: x, y: y, z: z, vx: vx+ax*t, vy: vy+ay*t, vz: az*t, ...this.move});
		} else if (move$type(this.move)===move$grip) {
			let {arc, bend, choke, twist} = grip;
			return move$grip({arc: arc, bend: bend, choke: choke, twist: twist, ...this.move})
		}
	}
	function SimpleMove(args) {
		args = args || {};
		this.nodes = {
			body: NodeSegment(args.body || {}),
			pivot: NodeSegment(args.pivot || {}),
			helper: NodeSegment(args.helper || {}),
			hand: NodeSegment(args.hand || {}),
			head: NodeSegment(args.head || {speed: 1})
		};
		this.grip = NodeSegment(args.grip || {arc: {}, bend: {}, choke: {}, twist: {});
		this.beats = args.beats || 1;
	}
	SimpleMove.prototype.children = [];
	SimpleMove.prototype.ticks = function() {
		return this.beats*VS3D.BEATS;
	}
	SimpleMove.prototype.spin = function(t) {
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
	SimpleMove.prototype.split = function(t) {
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
	SimpleMove.prototype.socket = function() {
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
	SimpleMove.prototype.head = function() {
		return this;
	}
	SimpleMove.prototype.tail = function() {
		return this;
	}
	SimpleMove.prototype.align = function(prop) {
		let aligned = this.clone();
		// body, pivot, and helper don't have to align
		aligned.hand = this.nodes.hand.align(VS3D.nodeSum(prop, HAND));
		aligned.head = this.nodes.head.align(VS3D.nodeSum(prop, HEAD));
		return aligned;
	}
	SimpleMove.prototype.clone = function() {
		return new SimpleMove(this);
	}
	SimpleMove.prototype.extend = function() {
		return this.clone().align(this.socket());
	}
	SimpleMove.prototype.concat = function(move) {
		let one = this.clone();
		let two = move.align(one);
		if (two.children.length>0) {
			two.children = [one].concat(two.children);
			return two;
		} else {
			return new MoveChain([one, two]);
		}
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
	MoveChain.prototype.ticks = function() {
		let ticks = 0;
		for (let child of children) {
			ticks+=child.ticks();
		}
		return ticks;
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
	MoveChain.prototype.extend = function() {
		return this.tail().extend();
	}
	MoveChain.prototype._segmentAt = function(t) {
		let ticks = 0;
		let current = -1;
		while (ticks<t) {
			current+=1;
			ticks+=this.children[current].ticks();
		}
		return current;
	}
	MoveChain.prototype._ticksBefore = function(n) {
		let ticks = 0;
		for (let i=0; i<n; i++) {
			ticks+=this.children[i].ticks();
		}
		return ticks;
	}
	MoveChain.prototype.concat = function(move) {
		let one = this.clone();
		let two = move.clone();
		if (two.children.length>0) {
			one.children = one.children.concat(two.children);
		} lese {
			one.children.push(two);
		}
		return one;
	}
	// maybe NodeChain / GripChain?
	// maybe merge NodeSegment and GripSegment
	VS3D.NodeSegment = NodeSegment;
	VS3D.SimpleMove = SimpleMove;
	VS3D.MoveChain = MoveChain;
	return VS3D;
}(VS3D);