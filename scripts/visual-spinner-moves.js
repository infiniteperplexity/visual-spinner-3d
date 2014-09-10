MoveFactory.prototype.staticspin= function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "staticspin",
		movename: "Static Spin",
		entry: null,
		hand: THREE,
		extend: TINY,
		plane: WALL,
		direction: CLOCKWISE,
		speed: 1,
		pivot_angle: 0,
		pivot_radius: 0,
		duration: 1
	});
	var segment = new MoveLink();
	if (options.entry != null) {
		segment.hand.angle = options.entry;
	}
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	
	segment.hand.plane = options.plane;
	segment.hand.radius = options.extend;
	segment.hand.angle = options.hand;
	segment.hand.speed = 0;
	if (options.entry != null) {
		segment.prop.angle = options.entry;
	}
	segment.prop.plane = options.plane;
	segment.prop.speed = options.direction*options.speed;
	segment.duration = 0.25;
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.build = options.build;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.superman = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "superman",
		movename: "Superman",
		orient: THREE,
		plane: FLOOR,
		direction: CLOCKWISE,
		speed: 1
	});
	var segment = new MoveLink();
	segment.duration = 0.25;
	segment.prop.angle = options.orient;
	segment.prop.plane = options.plane;
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
	move.build = options.build;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.flower = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "flower",
		movename: "Flower",
		entry: null,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		petals: 4,
		extend: 1,
		speed: 1,
		mode: null,
		//mode: DIAMOND,
		pivot_angle: 0,
		pivot_radius: 0,
		duration: 1
	});
	var segment = new MoveLink();
	if (options.spin==INSPIN) {
		segment.prop.speed = (options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.speed = (options.petals-1)*options.spin*options.direction*options.speed;
	}
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;

	segment.hand.speed = options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	if (options.extend != null) {
		segment.hand.radius = options.extend;
	}
	if (options.entry != null) {
		segment.hand.angle = options.entry;
		if (options.mode != null) {
			segment.prop.angle = options.entry + options.mode;
		}
	}
	segment.duration = 0.25;
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.build = options.build;
	move.movename = options.movename;
	return move;
}
MoveFactory.prototype.antispin = function(options) {
	options.spin = ANTISPIN;
	return MoveFactory.prototype.flower(options);
}
MoveFactory.prototype.extension = function(options) {
	options.petals = 0;
	return MoveFactory.prototype.flower(options);
}
MoveFactory.prototype.pointiso = function(options) {
	options.petals = 0;
	return MoveFactory.prototype.flower(options);
}


MoveFactory.prototype.twoPropFlower = function(options) {
	options = this.defaults(options,{
		timing: SPLIT,
		hands:  SAME,
		direction: CLOCKWISE,
		entry: THREE,
		plane: WALL,
		spin: INSPIN,
		petals: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		duration: 1
	});
	var move1 = this.flower({
		entry: options.entry,
		direction: options.direction,
		plane: options.plane,
		spin: options.spin,
		petals: options.petals,
		extend: options.extend,
		speed: options.speed,
		duration: options.duration
	});
	var entry2 = (options.entry != null) ? options.entry + options.timing : null;
	var direction2;
	if (options.hands==TOGETHER) {
		direction2 = options.direction;
	} else if (options.hands==OPPOSITE) {
		direction2 = -options.direction;
	}
	var move2 = this.flower({
		entry: entry2,
		direction: direction2,
		plane: options.plane,
		spin: options.spin,
		petals: options.petals,
		extend: options.extend,
		speed: options.speed,
		duration: options.duration
	});
	var move = [move1, move2];
	return move;
}


MoveFactory.prototype.ccap = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "ccap",
		movename: "C-CAP",
		plane: WALL,
		orient: THREE,
		direction: CLOCKWISE,
		petals1: 0,
		petals2: 4,
		spin1: INSPIN,
		spin2: ANTISPIN, 
		extend: 1,
		speed: 1,
		// need to add "entry"
		duration: 1
	});
	segment = new MoveLink();
	segment.duration = 0.25;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient;
	var	speed1 = (options.spin1===INSPIN) ? options.petals1+1 : options.petals1-1;
	var speed2 = (options.spin2===INSPIN) ? options.petals2+1 : options.petals2-1;;
	move.add(segment);
	move.tail().hand.speed = options.spin1*options.speed*options.direction;
	move.tail().prop.speed = speed1*options.speed*options.direction;
	move.extend();
	move.tail().hand.speed = options.spin2*options.speed*options.direction;
	move.tail().prop.speed = speed2*options.speed*options.direction;;
	move.extend();
	move.tail().hand.speed = options.spin2*options.speed*options.direction;
	move.tail().prop.speed = speed2*options.speed*options.direction;
	move.extend();
	move.tail().hand.speed = options.spin1*options.speed*options.direction;
	move.tail().prop.speed = speed1*options.speed*options.direction;
	move.phaseBy(options.phase);
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.build = options.build;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.pendulum = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "pendulum",
		movename: "Pendulum",
		orient: SIX,
		entry: SIX,
		plane: WALL,
		direction: CLOCKWISE,
		speed: 1,
		extend: 1, 
		spin: INSPIN,
		pivot_angle: 0,
		pivot_radius: 0,
		duration: 1,
		phase: 0,
		hybrid: false,
		onepointfive: false,
		antibrid: false
	});
	
	var segment = new MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.duration = 0.25;
	segment.hand.speed = options.speed*options.direction;
	if (options.hybrid == true) {
		segment.hand.speed *= 2;
	}
	var onepointfive = (options.onepointfive == true) ? 3 : 1;
	var antibrid= (options.antibrid == true) ? 0.75 : 1;
	segment.prop.speed = 2*onepointfive*antibrid*options.speed*options.direction*options.spin;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = (options.onepointfive == true) ? options.orient + OFFSET: options.orient;
	
	var hybrid = (options.hybrid == true)  ? 8*options.direction*options.speed*options.spin : 0;
	move.add(segment);
	move.tail().prop.acc = -8*onepointfive*antibrid*options.direction*options.speed*options.spin;
	move.tail().hand.acc = -hybrid;
	move.extend();
	move.tail().prop.acc = -8*antibrid*options.direction*options.speed*options.spin;
	move.tail().hand.acc = -hybrid;
	move.extend();
	move.tail().prop.acc = 8*antibrid*options.direction*options.speed*options.spin;
	move.tail().hand.acc = hybrid;
	move.extend();
	move.tail().prop.acc = 8*onepointfive*antibrid*options.direction*options.speed*options.spin;
	move.tail().hand.acc = hybrid;
	if (options.antibrid == true) {
		move.submoves[1].pivot.stretch = -4*options.pivot_radius;
		move.submoves[2].pivot.radius -= options.pivot_radius;
		move.submoves[2].pivot.stretch = 4*options.pivot_radius;
	}
	if (options.entry != null) {
		move.align("hand", options.entry);
	}
	move.phaseBy(options.phase);
	
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.build = options.build;
	move.movename = options.movename;
	
	if (options.onepointfive === true) {
		move.definition.movename = "One Point Five";
	} else if (options.spin === ANTISPIN) {
		move.definition.movename = "Iso-Pendulum";
	}
	return move;
}

//the goofy, wobbly kind
MoveFactory.prototype.isopendulum = function(options) {
	var segment = new MoveLink();
	segment.definition = options;
	options = this.defaults(options,{
		build: "isopendulum",
		movename: "Iso-Pendulum",
		orient: SIX,
		plane: WALL,
		direction: CLOCKWISE,
		speed: 1,
		pivot_angle: 0,
		pivot_radius: 0,
		duration: 1
	});
	segment.duration = options.duration;
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.hand.plane = options.plane;
	segment.hand.radius = 0.5;
	// these look drastically too slow but we can deal with that later
	segment.hand.speed = 2*options.speed*options.direction;
	segment.hand.acc = -4*options.direction*options.speed;
	segment.prop.speed = 2*options.speed*options.direction;
	segment.prop.acc = -4*options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.prop.angle = (options.direction == CLOCKWISE) ? options.orient - QUARTER : options.orient + QUARTER;
	segment.hand.angle = segment.prop.angle + OFFSET;
	segment.build = options.build;
	segment.movename = options.movename;
	return segment;
}

MoveFactory.prototype.linex = function(options) {
	var move = new MoveChain();
	move.definition = options;
	// A linex with harmonics = 1 is a linear extension.  harmonics = 2 is a linear isolation;
	options = this.defaults(options,{
		build: "linex",
		movename: "Linear Extension",
		orient: THREE,
		//entry: THREE,
		// why didn't this work?
		direction: CLOCKWISE,
		harmonics: 1,
		duration: 1,
		speed: 1,
		plane: WALL,
		extend: 1,
		offset: 0,
		pivot_angle: 0,
		pivot_radius: 0,
		phase: 0,
		duration: 1
	});
	segment = new MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.duration = 0.25;
	segment.hand.linear_angle = options.orient;
	segment.hand.linear_speed = 0;
	segment.prop.speed = options.harmonics*options.speed*options.direction;
	segment.hand.angle = options.orient;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	//I'm not sure if I like this....
	segment.prop.angle = options.orient + options.harmonics*options.offset;
	move.add(segment);
	move.tail().hand.linear_acc = -32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = 32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = 32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = -32*options.speed;
	if (options.entry != null) {
		move.align("prop",options.entry);
	}
	move.phaseBy(options.phase);
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.build = options.build;
	move.movename = options.movename;
	if (options.harmonics == 2) {
		move.definition.movename = "Linear Isolation";
	}
	return move;
}

// haven't done much work on this yet
MoveFactory.prototype.linearfloat = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "linearfloat",
		movename: "Float",
		orient: TWELVE,
		//entry: THREE,
		direction: CLOCKWISE,
		duration: 1,
		speed: 1,
		plane: WALL,
		extend: 1,
		offset: 0,
		pivot_angle: 0,
		pivot_radius: 0,
		phase: 0,
		duration: 1
	});
	segment = new MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
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
	move.add(segment);
	move.tail().hand.linear_acc = -32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = 32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = 32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = -32*options.speed;
	if (options.entry != null) {
		move.align("prop",options.entry);
	}
	move.phaseBy(options.phase);
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.build = options.build;
	move.movename = options.movename;
	if (options.harmonics == 2) {
		move.definition.movename = "Linear Isolation";
	}
	return move;
}

MoveFactory.prototype.isolation = function(options) {
	var move = new MoveChain();
	move.definition = options;
	// A no-offset isolation is a unit-circle extension. An anti-spin isolation is a cateye;
	options = this.defaults(options,{
		build: "isolation",
		movename: "Isolation",
		entry: null,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		offset: OFFSET,
		speed: 1,
		pivot_angle: 0,
		pivot_radius: 0,
		phase: 0,
		duration: 1
	});
	var segment = new MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.hand.radius = 0.5;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.speed = options.spin*options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	if (options.entry != null) {
		segment.hand.angle = options.entry;
		segment.prop.angle = options.entry + options.offset;
	}
	segment.duration = 0.25;
	move.add(segment);
	move.extend();
	
	move.extend();
	move.extend();
	move.phaseBy(options.phase);
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.build = options.build;
	move.movename = options.movename;
	if (options.spin == ANTISPIN) {
		move.definition.movename = "Cat-Eye";
	} else if (options.offset == NOOFFSET) {
		move.definition.movename = "Unit Circle Extension";
	}
	return move;
}
MoveFactory.prototype.cateye = function(options) {
	options.spin = CATEYE;
	return MoveFactory.prototype.isolation(options);
}

MoveFactory.prototype.toroid = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "toroid",
		movename: "Toroid",
		entry: null,
		plane: WALL,
		direction: CLOCKWISE,
		pitch: FORWARD,
		spin: INSPIN,
		bend: ISOBEND,
		harmonics: 4,
		extend: 1,
		speed: 1,
		mode: null,
		//mode: DIAMOND,
		pivot_radius: 0,
		pivot_angle: 0
	});
	var segment = new MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.hand.radius = options.extend;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.speed = options.pitch*options.harmonics*options.speed;
	segment.prop.bend = options.bend*options.direction*options.speed;
	segment.prop.bend_plane = options.plane;
	// this might fail if options.orient is changed from the default
	segment.prop.plane = options.plane.reference().rotate(options.entry-QUARTER, options.plane);
	segment.hand.plane = options.plane;
	if (options.entry != null) {
		segment.hand.angle = options.entry;
		segment.prop.angle = options.entry + options.mode + QUARTER;
	}
	segment.duration = 0.25;
	var move = new MoveChain();
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	move.phaseBy(options.phase);
	if (options.duration < 1) {
		move = move.slice(0,(options.duration-0.25)*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.build = options.build;
	move.movename = options.movename;
	return move;
}

// This is a crappy excuse for a contact roll but it does demonstrate the concept
MoveFactory.prototype.contactroll = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "contactroll",
		movename: "Contact Roll",
		orient: THREE,
		//entry: THREE,
		direction: CLOCKWISE,
		harmonics: 2,
		duration: 1,
		speed: 1,
		offset: 0,
		extend: 1,
		phase: 0,
		plane: WALL
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
	segment.grip.radius = 1;
	//I'm not sure if I like this....
	segment.prop.angle = options.orient + options.offset;
	move.add(segment);
	move.tail().hand.linear_acc = -32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = 32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = 32*options.speed;
	move.extend();
	move.tail().hand.linear_acc = -32*options.speed;
	if (options.entry != null) {
		move.align("prop",options.entry);
	}
	move.phaseBy(options.phase);
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.build = options.build;
	move.movename = options.movename;
	return move;
}



//***obscure moves***
MoveFactory.prototype.fractal = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "fractal",
		movename: "Fractal",
		entry: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		pivot_spin: ANTISPIN,
		petals: 4,
		pivot_petals: 4,
		extend: 0.5,
		pivot_extend: 0.5,
		mode: DIAMOND,
		pivot_mode: DIAMOND,
		speed: 1
	});
	var segment = new MoveLink();
	if (options.spin==INSPIN) {
		segment.prop.speed = (options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.speed = (options.petals-1)*options.spin*options.direction*options.speed;
	}
	if (options.pivot_spin==INSPIN) {
		segment.hand.speed = (options.pivot_petals+1)*options.pivot_spin*options.direction*options.speed;
	} else {
		segment.hand.speed = (options.pivot_petals-1)*options.pivot_spin*options.direction*options.speed;
	}
	segment.pivot.radius = options.pivot_extend;
	segment.hand.radius = options.extend;
	segment.pivot.speed = options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.pivot.plane = options.plane;
	segment.pivot.angle = options.entry;
	segment.hand.angle = options.entry + options.pivot_mode;
	segment.prop.angle = options.entry + options.mode;
	if ((options.petals*options.pivot_petals)==0) {
		segment.duration = 1;
	} else {
		segment.duration = 1/(options.petals*options.pivot_petals);
	}
	move.add(segment);
	for (var i = 1; i<options.petals*options.pivot_petals; i++) {
		move.extend();
	}
	move.build = options.build;
	move.movename = options.movename;
	return move;
}


MoveFactory.prototype.scap = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "scap",
		movename: "S-CAP",
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
	move.build = options.build;
	move.movename = options.movename;
	return move;
}


MoveFactory.prototype.isopop = function(options) {
	var move = new MoveChain();
	move.definition = options;
	// An isopop with options.pop: ANTISPIN is an isobreak
	options = this.defaults(options,{
		build: "isopop",
		movename: "Iso-Pop",
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		pop: INSPIN,
		offset: OFFSET,
		speed: 2,
		pivot_radius: 0,
		pivot_angle: 0
	});
	var segment = new MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.duration = 1/options.speed;
	segment.hand.radius = 0.5;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.speed = options.spin*options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.offset;
	move.add(segment);
	move.extend();
	move.tail().hand.speed = 0;
	move.tail().prop.speed = options.spin*options.direction*options.speed*options.pop;
	move.build = options.build;
	move.movename = options.movename;
	if (options.spin == ANTISPIN) {
		move.movename = "Iso-Break";
	}
	return move;
}

MoveFactory.prototype.diamond = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "diamond",
		movename: "Zan's Diamond",
		entry: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		speed: 1,
		extend: 1,
		pivot_radius: 0,
		pivot_angle: 0
	});
	var segment = new MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.duration = 1/(8*options.speed);
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.entry;
	segment.hand.radius = options.extend;
	segment.prop.angle = options.entry;
	move.add(segment);
	move.tail().hand.linear_angle = options.entry + options.direction*OFFSET;
	move.tail().hand.linear_speed = 16*options.extend*options.speed;
	move.tail().prop.speed = 4*options.speed*options.direction*options.spin;
	move.extend();
	move.tail().hand.linear_angle = options.entry - options.direction*STAGGER/2;
	move.tail().hand.linear_speed = 8*Math.sqrt(2)*options.extend*options.speed;
	move.tail().prop.speed = ((-2*options.spin)+4)*options.spin*options.speed*options.direction;
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*STAGGER;
	move.tail().hand.linear_speed = 16*options.extend*options.speed;
	move.tail().prop.speed = 4*options.speed*options.direction*options.spin;
	move.extend();
	move.tail().hand.linear_angle = options.entry - options.direction*STAGGER/2;
	move.tail().hand.linear_speed = 8*Math.sqrt(2)*options.extend*options.speed;
	move.tail().prop.speed = ((2*options.spin)+4)*options.spin*options.speed*options.direction;
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*OFFSET;
	move.tail().hand.linear_speed = 16*options.extend*options.speed;
	move.tail().prop.speed = 4*options.speed*options.direction*options.spin;
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*STAGGER/2;
	move.tail().hand.linear_speed = 8*Math.sqrt(2)*options.extend*options.speed;
	move.tail().prop.speed = ((2*options.spin)+4)*options.spin*options.speed*options.direction;
	move.extend();
	move.tail().hand.linear_angle = options.entry - + options.direction*STAGGER;
	move.tail().hand.linear_speed = 16*options.extend*options.speed;
	move.tail().prop.speed = 4*options.speed*options.direction*options.spin;
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*STAGGER/2;
	move.tail().hand.linear_speed = 8*Math.sqrt(2)*options.extend*options.speed;
	move.tail().prop.speed = ((-2*options.spin)+4)*options.spin*options.speed*options.direction;
	move.build = options.build;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.triangle = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "triangle",
		movename: "Triangle",
		entry: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		speed: 1,
		extend: 1,
		pivot_radius: 0,
		pivot_angle: 0
	});
	var segment = new MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.duration = 1/(12*options.speed);
	segment.hand.radius = Math.sqrt(3)*options.extend/3;
	segment.hand.linear_speed = 12*options.extend*options.speed;
	segment.hand.angle = options.entry;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	if (options.spin==INSPIN) {
		segment.prop.angle = options.entry + options.direction*UNIT/18;
	} else {
		segment.prop.angle = options.entry - 5*UNIT*options.direction/18;
	}
	move.add(segment);
	move.tail().hand.linear_angle = options.entry + options.direction*5*UNIT/12;
	move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction/3;
	move.extend();
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*UNIT/12;
	move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction;
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*3*UNIT/4;
	move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction/3;
 	move.extend();
	move.extend();
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*5*UNIT/12;
	move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction;
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*UNIT/12;
	move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction/3;
	move.extend();
	move.extend();
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*3*UNIT/4;
	move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction;
	move.extend();
	move.tail().hand.linear_angle = options.entry + options.direction*5*UNIT/12;
	move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction/3;
	move.build = options.build;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.stallchaser = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "stallchaser",
		movename: "Stall Chaser",
		orient: DOWN,
		plane: WALL,
		direction: COUNTERCLOCKWISE,
		speed: 4,
		extend: 1,
		phase: 0,
		variant: true, //not implemented
	});
	var segment = new MoveLink();
	segment.duration = 0.5/options.speed;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.radius = options.extend;
	segment.hand.angle = options.orient + options.direction*QUARTER;
	segment.prop.angle = options.orient;
	move.add(segment);
	move.tail().hand.speed = options.direction*options.speed;
	move.tail().prop.speed = options.direction*options.speed;
	move.extend();
	move.tail().prop.speed = 2*options.direction*options.speed;
	move.extend();
	move.tail().prop.speed = options.direction*options.speed;
	move.extend();
	move.tail().hand.speed = 0;
	move.tail().prop.speed = 0;
	move.extend();
	move.tail().hand.speed = -options.direction*options.speed;
	move.tail().prop.speed = -options.direction*options.speed;
	move.extend();
	move.tail().prop.speed = -2*options.direction*options.speed;
	move.extend();
	move.tail().prop.speed = -options.direction*options.speed;
	move.extend();
	move.tail().hand.speed = 0;
	move.tail().prop.speed = 0;
	move.phaseby(options.phase);
	move.build = options.build;
	move.movename = options.movename;
	return move;
}


MoveFactory.prototype.spirograph = function(options) {
	var segment = new MoveLink();
	segment.definition = options;
	options = this.defaults(options,{
		build: "spirograph",
		movename: "(generic spirograph component)",
		entry: null,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		petals: 0,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		pivot_angle: THREE,
		pivot_radius: 0,
		duration: 1
	});
	
	if (options.spin==INSPIN) {
		segment.prop.speed = (options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.speed = (options.petals-1)*options.spin*options.direction*options.speed;
	}
	
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	
	segment.hand.speed = options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	if (options.extend != null) {
		segment.hand.radius = options.extend;
	}
	if (options.entry != null) {
		segment.hand.angle = options.entry;
		if (options.mode != null) {
			segment.prop.angle = options.entry + options.mode;
		}
	}
	segment.duration = options.duration;
	segment.build = options.build;
	segment.movename = options.movename;
	return segment;
}


MoveFactory.prototype.generic = function(options) {
	var segment = new MoveLink();
	segment.definition = options;
	options = this.defaults(options,{
		build: "generic",
		movename: "(fully generic movement)",
		pivot_entry: null,
		hand_entry: null,
		prop_entry: null,
		grip_entry: null,
		plane: WALL,
		pivot_plane: null,
		hand_plane: null,
		prop_plane: null,
		grip_plane: null,
		pivot_radius: null,
		hand_radius: null,
		prop_radius: 1,
		grip_radius: 0,
		pivot_speed: 0,
		hand_speed: 0,
		prop_speed: 0,
		grip_speed: 0,
		pivot_acc: 0,
		hand_acc: 0,
		prop_acc: 0,
		grip_acc: 0,
		pivot_linear_speed: 0,
		hand_linear_speed: 0,
		prop_linear_speed: 0,
		grip_linear_speed: 0,
		pivot_linear_angle: THREE,
		hand_linear_angle: THREE,
		prop_linear_angle: THREE,
		grip_linear_angle: THREE,
		pivot_linear_acc: 0,
		hand_linear_acc: 0,
		prop_linear_acc: 0,
		grip_linear_acc: 0,
		pivot_bend: 0,
		hand_bend: 0,
		prop_bend: 0,
		grip_bend: 0,
		pivot_bend_plane: WHEEL,
		hand_bend_plane: WHEEL,
		prop_bend_plane: WHEEL,
		grip_bend_plane: WHEEL,
		pivot_stretch: 0,
		hand_stretch: 0,
		prop_stretch: 0,
		grip_stretch: 0,
		roll: null,
		duration: 1
	});
	segment.duration = options.duration;
	segment.pivot.angle = (options.pivot_entry != null) ? options.pivot_entry : null;
	segment.pivot.plane = (options.pivot_plane != null) ? options.pivot_plane : options.plane;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.speed = options.pivot_speed;
	segment.pivot.acc = options.pivot_acc;
	segment.pivot.linear_angle = options.pivot_linear_angle;
	segment.pivot.linear_speed = options.pivot_linear_speed;
	segment.pivot.linear_acc = options.pivot_linear_acc;
	segment.pivot.bend = options.pivot_bend;
	segment.pivot.bend_plane = options.bend_plane;
	segment.pivot.stretch = options.pivot_stretch;
	segment.hand.angle = (options.hand_entry != null) ? options.hand_entry : null;
	segment.hand.plane = (options.hand_plane != null) ? options.hand_plane : options.plane;
	segment.hand.radius = options.hand_radius;
	segment.hand.speed = options.hand_speed;
	segment.hand.acc = options.hand_acc;
	segment.hand.linear_angle = options.hand_linear_angle;
	segment.hand.linear_speed = options.hand_linear_speed;
	segment.hand.linear_acc = options.hand_linear_acc;
	segment.hand.bend = options.hand_bend;
	segment.hand.bend_plane = options.bend_plane;
	segment.hand.stretch = options.hand_stretch;
	segment.prop.angle = (options.prop_entry != null) ? options.prop_entry : null;
	segment.prop.plane = (options.prop_plane != null) ? options.prop_plane : options.plane;
	segment.prop.radius = options.prop_radius;
	segment.prop.speed = options.prop_speed;
	segment.prop.acc = options.prop_acc;
	segment.prop.linear_angle = options.prop_linear_angle;
	segment.prop.linear_speed = options.prop_linear_speed;
	segment.prop.linear_acc = options.prop_linear_acc;
	segment.prop.bend = options.prop_bend;
	segment.prop.bend_plane = options.bend_plane;
	segment.prop.stretch = options.prop_stretch;
	segment.grip.angle = (options.grip_entry != null) ? options.grip_entry : null;
	segment.grip.plane = (options.grip_plane != null) ? options.grip_plane : options.plane;
	segment.grip.radius = options.grip_radius;
	segment.grip.speed = options.grip_speed;
	segment.grip.acc = options.grip_acc;
	segment.grip.linear_angle = options.grip_linear_angle;
	segment.grip.linear_speed = options.grip_linear_speed;
	segment.grip.linear_acc = options.grip_linear_acc;
	segment.grip.bend = options.grip_bend;
	segment.grip.bend_plane = options.bend_plane;
	segment.grip.stretch = options.grip_stretch;
	segment.roll = options.roll;
	segment.definition.movename = options.movename;
	segment.definition.build = options.build;
	return segment;
}
	
MoveFactory.prototype.spiralwrap = function(options) {
	var move = new MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		build: "spiralwrap",
		movename: "Spiral Wrap",
		entry: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		stretch: -1,
		extend: 0,
		speed: 1,
		duration: 1
	});
	var segment = new MoveLink();
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	// should specify an angle?
	segment.hand.radius = options.extend;
	segment.prop.radius = 1;
	segment.hand.speed = 0;
	segment.prop.speed = options.speed*options.direction;
	segment.prop.stretch = options.stretch;
	if (options.entry != null) {
		segment.prop.angle = options.entry;
	}
	segment.duration = options.duration;
	move.add(segment);
	move.extend();
	move.tail().prop.radius = 0;
	move.tail().stretch = -options.stretch;
	move.tail().speed = -options.speed*options.direction;
	move.build = options.build;
	move.movename = options.movename;
	return move;
}


MoveFactory.prototype.stallentry = function(options) {
	var segment = new MoveLink();
	segment.definition = options;
	options = this.defaults(options,{
		build: "stallentry",
		movename: "Stall Entry",
		entry: null,
		plane: WALL,
		direction: CLOCKWISE,
		spin: ANTISPIN,
		petals: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		duration: 0.5
	});
	if (options.spin==INSPIN) {
		segment.prop.speed = 2*(options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.speed = 2*(options.petals-1)*options.spin*options.direction*options.speed;
	}
	segment.prop.acc = -8*segment.prop.speed;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	if (options.extend != null) {
		segment.hand.radius = options.extend;
	}
	if (options.entry != null) {
		segment.hand.angle = options.entry;
		if (options.mode != null) {
			segment.prop.angle = options.entry + options.mode;
		}
	}
	segment.duration = options.duration;
	segment.build = options.build;
	segment.movename = options.movename;
	return segment;
}

MoveFactory.prototype.stallexit= function(options) {
	var segment = new MoveLink();
	segment.definition = options;
	options = this.defaults(options,{
		build: "stallexit",
		movename: "Stall Exit",
		entry: null,
		plane: WALL,
		direction: CLOCKWISE,
		spin: ANTISPIN,
		petals: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		duration: 0.5
	});
	if (options.spin==INSPIN) {
		segment.prop.acc = 16*(options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.acc = 16*(options.petals-1)*options.spin*options.direction*options.speed;
	}
	segment.prop.speed = 0;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	if (options.extend != null) {
		segment.hand.radius = options.extend;
	}
	if (options.entry != null) {
		segment.hand.angle = options.entry;
		if (options.mode != null) {
			segment.prop.angle = options.entry + options.mode;
		}
	}
	segment.duration = options.duration;
	segment.build = options.build;
	segment.movename = options.movename;
	return segment;
}