MoveFactory.prototype.staticspin= function(options) {
	options = this.defaults(options,{
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		speed: 1,
	});
	var segment = new MoveLink();
	segment.duration = 0.125;
	segment.prop.angle = options.orient;
	segment.prop.plane = options.plane;
	segment.prop.speed = options.direction*options.speed;
	var move = new MoveChain();
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	return move;
}

MoveFactory.prototype.superman= function(options) {
	options = this.defaults(options,{
		orient: THREE,
		plane: FLOOR,
		direction: CLOCKWISE,
		speed: 1,
	});
	var segment = new MoveLink();
	segment.duration = 0.25;
	segment.prop.angle = options.orient;
	segment.prop.plane = options.plane;
	var move = new MoveChain();
	move.add(segment);
	move.tail().prop.speed = 2*options.speed*options.direction;
	//move.tail().prop.acc = -16*options.speed*options.direction;
	move.extend();
	move.tail().prop.speed = -2*options.speed*options.direction;
	//move.tail().prop.acc = -16*options.speed*options.direction;
	move.extend();
	move.tail().prop.speed = -2*options.speed*options.direction;
	//move.tail().prop.acc = 16*options.speed*options.direction;
	move.extend();
	move.tail().prop.speed = 2*options.speed*options.direction;
	//move.tail().prop.acc = 16*options.speed*options.direction;
	return move;
}

MoveFactory.prototype.flower = function(options) {
	options = this.defaults(options,{
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		petals: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND
	});
	var segment = new MoveLink();
	segment.duration = 0.25;
	if (options.spin==INSPIN) {
		segment.prop.speed = (options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.speed = (options.petals-1)*options.spin*options.direction*options.speed;
	}
	segment.hand.radius = options.extend;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.mode;
	// this is a bit kludgy but we need it until we have a better system for phasing
	var move = new MoveChain();
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	return move;
}

MoveFactory.prototype.ccap = function(options) {
	options = this.defaults(options,{
		plane: WALL,
		orient: THREE,
		direction: CLOCKWISE,
		inpetals: 0,
		antipetals: 4, 
		extend: 1,
		speed: 1,
	});
	segment = new MoveLink();
	segment.duration = 0.25;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient;
	move = new MoveChain();
	move.add(segment);
	move.tail().hand.speed = options.speed*options.direction;
	move.tail().prop.speed = (options.inpetals+1)*options.speed*options.direction;
	move.extend();
	move.tail().hand.speed = -options.speed*options.direction;
	move.tail().prop.speed = (options.antipetals-1)*options.speed*options.direction;;
	move.extend();
	move.tail().hand.speed = -options.speed*options.direction;
	move.tail().prop.speed = (options.antipetals-1)*options.speed*options.direction;
	move.extend();
	move.tail().hand.speed = options.speed*options.direction;
	move.tail().prop.speed = (options.inpetals+1)*options.speed*options.direction;
	return move;
}


MoveFactory.prototype.pendulum = function(options) {
	options = this.defaults(options,{
		orient: DOWN,
		plane: WALL,
		direction: CLOCKWISE,
		extend: 1, 
		spin: INSPIN,
		speed: 1
	});
	var segment = new MoveLink();
	segment.duration = 0.25;
	segment.hand.speed = options.speed*options.direction;
	segment.prop.speed = 2*options.speed*options.direction;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient;
	var move = new MoveChain();
	move.add(segment);
	move.tail().prop.acc = -8*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = -8*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = 8*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = 8*options.speed*options.spin;
	return move;
}


MoveFactory.prototype.onepointfive = function(options) {
	options = this.defaults(options,{
		orient: DOWN,
		plane: WALL,
		direction: CLOCKWISE,
		extend: 1, 
		spin: INSPIN,
		speed: 1
	});
	var segment = new MoveLink();
	segment.duration = 0.25;
	segment.hand.speed = options.speed*options.direction;
	segment.prop.speed = 6*options.speed*options.direction;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + OFFSET;
	var move = new MoveChain();
	move.add(segment);
	move.tail().prop.acc = -24*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = -8*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = 8*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = 24*options.speed*options.spin;
}

MoveFactory.prototype.scap = function(options) {
	options = this.defaults(options,{
		plane: WALL,
		orient: THREE,
		direction: CLOCKWISE,
		inpetals: 0,
		antipetals: 3, 
		extend: 1,
		speed: 2,
	});
	segment = new MoveLink();
	segment.duration = 0.25;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient;
	segment.pivot.radius = options.extend;
	move = new MoveChain();
	move.add(segment);
	move.tail().hand.speed = options.speed*options.direction;
	move.tail().prop.speed = (options.inpetals+1)*options.speed*options.direction;
	move.tail().pivot.angle = options.orient;
	move.extend();
	move.tail().hand.speed = -options.speed*options.direction;
	move.tail().prop.speed = (options.antipetals-1)*options.speed*options.direction;
	move.tail().pivot.angle = options.orient+OFFSET;
	move.tail().hand.angle = options.orient;
	move.extend();
	move.tail().hand.speed = options.speed*options.direction;
	move.tail().prop.speed = (options.inpetals+1)*options.speed*options.direction;
	move.tail().pivot.angle = options.orient+OFFSET;
	move.extend();
	move.tail().hand.speed = -options.speed*options.direction;
	move.tail().prop.speed = (options.antipetals-1)*options.speed*options.direction;
	move.tail().pivot.angle = options.orient;
	move.tail().hand.angle = options.orient + OFFSET;
	return move;
}

MoveFactory.prototype.linex = function(options) {
	// A linex with harmonics = 1 is a linear extension.  harmonics = 2 is a linear isolation;
	options = this.defaults(options,{
		orient: THREE,
		direction: CLOCKWISE,
		harmonics: 1,
		duration: 1,
		speed: 1,
		plane: WALL,
		extend: 1,
		offset: 0
	});
	segment = new MoveLink();
	segment.duration = 0.25;
	segment.hand.linear_angle = options.orient;
	segment.hand.linear_speed = 0;
	segment.prop.speed = options.harmonics*options.speed*options.direction;
	segment.hand.angle = options.orient;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	//I'm not sure if I like this....
	segment.prop.angle = options.orient + options.offset;
	move = new MoveChain();
	move.add(segment);
	move.tail().hand.linear_acc = -32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = 32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = 32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = -32*options.speed;
	return move;
}


MoveFactory.prototype.isolation = function(options) {
	// A no-offset isolation is a unit-circle extension. An anti-spin isolation is a cateye;
	options = this.defaults(options,{
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		offset: OFFSET,
		speed: 1
	});
	var segment = new MoveLink();
	segment.duration = 0.25;
	segment.hand.radius = 0.5;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.speed = options.spin*options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.offset;
	// this is lame and kludgy
	var move = new MoveChain();
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	return move;
}

MoveFactory.prototype.toroid = function(options) {
	options = this.defaults(options,{
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		bend: ISOBEND,
		harmonics: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND
	});
	var segment = new MoveLink();
	segment.duration = 0.25;
	segment.hand.radius = options.extend;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.speed = FORWARD*options.harmonics*options.speed;
	segment.prop.bend = options.bend*options.direction*options.speed;
	segment.prop.bend_plane = options.plane;
	// this might fail if options.orient is changed from the default
	segment.prop.plane = options.plane.reference().rotate(options.orient-QUARTER, options.plane);
	//segment.prop.plane = options.plane.reference().rotate(options.orient-QUARTER, options.plane);
	segment.hand.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.mode + QUARTER;
	var move = new MoveChain();
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	return move;
}