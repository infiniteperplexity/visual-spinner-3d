MoveFactory.prototype.staticspin= function(options) {
	options = this.defaults(options,{
		build: "staticspin",
		movename: "Static Spin",
		orient: THREE,
		extend: TINY,
		plane: WALL,
		direction: CLOCKWISE,
		speed: 1,
	});
	var segment = new MoveLink();
	segment.hand.angle = options.orient;
	segment.hand.plane = options.plane;
	segment.hand.radius = options.extend;
	segment.hand.speed = 0;
	segment.prop.angle = options.orient;
	segment.prop.plane = options.plane;
	segment.prop.speed = options.direction*options.speed;
	var move = new MoveChain();
	move.add(segment);
	move.movename = "static spin";
	move.definition = options;
	return move;
}

MoveFactory.prototype.superman= function(options) {
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
	move.definition = options;
	return move;
}

MoveFactory.prototype.flower = function(options) {
	options = this.defaults(options,{
		build: "flower",
		movename: "Flower",
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		petals: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		pivot: undefined
	});
	var segment = new MoveLink();
	if (options.spin==INSPIN) {
		segment.prop.speed = (options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.speed = (options.petals-1)*options.spin*options.direction*options.speed;
	}
	if (options.pivot!==undefined) {
		segment.pivot.angle = options.pivot;
		segment.pivot.radius = 0.5;
		segment.pivot.plane = options.plane;
		segment.pivot.speed = 0;
	}
	segment.hand.radius = options.extend;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.mode;
	segment.duration = 0.25;
	var move = new MoveChain();
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	move.definition = options;
	return move;
}

MoveFactory.prototype.petal = function(options) {
	options = this.defaults(options,{
		build: "petal",
		movename: "(flower)",
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		petals: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		pivot: undefined,
		duration: undefined
	});
	var segment = new MoveLink();
	if (options.spin==INSPIN) {
		segment.prop.speed = (options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.speed = (options.petals-1)*options.spin*options.direction*options.speed;
	}
	if (options.pivot!==undefined) {
		segment.pivot.angle = options.pivot;
		segment.pivot.radius = 0.5;
		segment.pivot.plane = options.plane;
		segment.pivot.speed = 0;
	}
	segment.hand.radius = options.extend;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.mode;
	if (options.duration===undefined) {
		if (options.petals==0) {
			segment.duration = options.duration;
		} else {
			segment.duration = 1/options.petals;
		}
	} else {
		segment.duration = options.duration;
	}
	segment.definition = options;
	return segment;
}


MoveFactory.prototype.twoPropFlower = function(options) {
	options = this.defaults(options,{
		timing: SPLIT,
		mode:  TOGETHER,
		direction: CLOCKWISE,
		orient: THREE,
		plane: WALL,
		spin: INSPIN,
		petals: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		duration: 1
	});
	var move1 = this.petal({
		orient: options.orient,
		direction: options.direction,
		plane: options.plane,
		spin: options.spin,
		petals: options.petals,
		extend: options.extend,
		speed: options.speed,
		mode: options.mode,
		duration: options.duration
	});
	var orient2 = options.orient + options.timing;
	var direction2;
	if (options.mode==TOGETHER) {
		direction2 = options.direction;
	} else if (options.mode==OPPOSITE) {
		direction2 = -options.direction;
	}
	var move2 = this.petal({
		orient: orient2,
		direction: direction2,
		plane: options.plane,
		spin: options.spin,
		petals: options.petals,
		extend: options.extend,
		speed: options.speed,
		mode: options.mode,
		duration: options.duration
	});
	var move = [move1, move2];
	//var name_petals = ["zero","one","two","three","four","five","six"][petals];
	//var name_timing = (options.timing==SPLIT)?:";
	return move;
}


MoveFactory.prototype.ccap = function(options) {
	options = this.defaults(options,{
		build: "ccap",
		movename: "C-CAP",
		plane: WALL,
		orient: THREE,
		direction: CLOCKWISE,
		inpetals: 0,
		antipetals: 4, 
		extend: 1,
		speed: 1,
		phase: 0,
		duration: 1
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
	move.phaseBy(options.phase);
	if (options.duration < 1) {
		move = move.split(options.duration*this.getDuration())[0];
	}
	move.definition = options;
	return move;
}

MoveFactory.prototype.pendulum = function(options) {
	options = this.defaults(options,{
		build: "pendulum",
		movename: "Pendulum",
		orient: SIX,
		plane: WALL,
		direction: CLOCKWISE,
		speed: 1,
		extend: 1, 
		spin: INSPIN,
		pivot: undefined,
		duration: 1,
		phase: 0
	});
	var segment = new MoveLink();
	if (options.pivot!==undefined) {
		segment.pivot.angle = options.pivot;
		segment.pivot.radius = 0.5;
		segment.pivot.plane = options.plane;
		segment.pivot.speed = 0;
	}
	segment.duration = 0.25;
	segment.hand.speed = options.speed*options.direction;
	segment.prop.speed = 2*options.speed*options.direction*options.spin;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient;
	var move = new MoveChain();
	move.add(segment);
	move.tail().prop.acc = -8*options.direction*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = -8*options.direction*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = 8*options.direction*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = 8*options.direction*options.speed*options.spin;
	move.phaseBy(options.phase);
	if (options.duration < 1) {
		move = move.split(options.duration*this.getDuration())[0];
	}
	move.definition = options;
	if (options.spin === ANTISPIN) {
		move.definition.movename = "Iso-Pendulum";
	}
	return move;
}


MoveFactory.prototype.onepointfive = function(options) {
	options = this.defaults(options,{
		build: "onepointfive",
		movename: "1.5",
		orient: DOWN,
		plane: WALL,
		direction: CLOCKWISE,
		extend: 1, 
		spin: INSPIN,
		speed: 1,
		pivot: undefined,
		phase: 0,
		duration: 1
	});
	var segment = new MoveLink();
	if (options.pivot!==undefined) {
		segment.pivot.angle = options.pivot;
		segment.pivot.radius = 0.5;
		segment.pivot.plane = options.plane;
		segment.pivot.speed = 0;
	}
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
	move.tail().prop.acc = -24*options.direction*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = -8*options.direction*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = 8*options.direction*options.speed*options.spin;
	move.extend();
	move.tail().prop.acc = 24*options.direction*options.speed*options.spin;
	move.phaseBy(options.phase);
	if (options.duration < 1) {
		move = move.split(options.duration*this.getDuration())[0];
	}
	move.definition = options;
	return move;
}

MoveFactory.prototype.linex = function(options) {
	// A linex with harmonics = 1 is a linear extension.  harmonics = 2 is a linear isolation;
	options = this.defaults(options,{
		build: "linex",
		movename: "Linear Extension",
		orient: THREE,
		direction: CLOCKWISE,
		harmonics: 1,
		duration: 1,
		speed: 1,
		plane: WALL,
		extend: 1,
		offset: 0,
		pivot: undefined,
		phase: 0,
		duration: 1
	});
	segment = new MoveLink();
	if (options.pivot!==undefined) {
		segment.pivot.angle = options.pivot;
		segment.pivot.radius = 0.5;
		segment.pivot.plane = options.plane;
		segment.pivot.speed = 0;
	}
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
	if (options.duration < 1) {
		move = move.split(options.duration*this.getDuration())[0];
	}
	move.phaseBy(options.phase);
	move.definition = options;
	if (options.harmonics == 2) {
		move.definition.movename = "Linear Isolation";
	}
	return move;
}


MoveFactory.prototype.isolation = function(options) {
	// A no-offset isolation is a unit-circle extension. An anti-spin isolation is a cateye;
	options = this.defaults(options,{
		build: "isolation",
		movename: "Isolation",
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		offset: OFFSET,
		speed: 1,
		pivot: undefined,
		phase: 0
	});
	var segment = new MoveLink();
	if (options.pivot!==undefined) {
		segment.pivot.angle = options.pivot;
		segment.pivot.radius = 0.5;
		segment.pivot.plane = options.plane;
		segment.pivot.speed = 0;
	}
	segment.hand.radius = 0.5;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.speed = options.spin*options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.offset;
	segment.duration = 0.25;
	var move = new MoveChain();
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	move.phaseBy(options.phase);
	move.definition = options;
	if (options.spin == ANTISPIN) {
		move.definition.movename = "Cat-Eye";
	} else if (options.offset == NOOFFSET) {
		move.definition.movename = "Unit Circle Extension";
	}
	return move;
}

MoveFactory.prototype.toroid = function(options) {
	options = this.defaults(options,{
		build: "toroid",
		movename: "Toroid",
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		pitch: FORWARD,
		spin: INSPIN,
		bend: ISOBEND,
		harmonics: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		pivot: undefined
	});
	var segment = new MoveLink();
	if (options.pivot!==undefined) {
		segment.pivot.angle = options.pivot;
		segment.pivot.radius = 0.5;
		segment.pivot.plane = options.plane;
		segment.pivot.speed = 0;
	}
	segment.hand.radius = options.extend;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.speed = options.pitch*options.harmonics*options.speed;
	segment.prop.bend = options.bend*options.direction*options.speed;
	segment.prop.bend_plane = options.plane;
	// this might fail if options.orient is changed from the default
	segment.prop.plane = options.plane.reference().rotate(options.orient-QUARTER, options.plane);
	segment.hand.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.mode + QUARTER;
	//if (options.harmonics==0) {
		segment.duration = 1;
	//} else {
	//	segment.duration = 1/options.harmonics;
	//}
	var move = new MoveChain();
	move.add(segment);
	//for (var i = 1; i<options.harmonics; i++) {
	//	move.extend();
	//}
	move.definition = options;
	return move;
}

//***obscure moves***
MoveFactory.prototype.fractal = function(options) {
	options = this.defaults(options,{
		orient: THREE,
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
	segment.pivot.angle = options.orient;
	segment.hand.angle = options.orient + options.pivot_mode;
	segment.prop.angle = options.orient + options.mode;
	if ((options.petals*options.pivot_petals)==0) {
		segment.duration = 1;
	} else {
		segment.duration = 1/(options.petals*options.pivot_petals);
	}
	var move = new MoveChain();
	move.add(segment);
	for (var i = 1; i<options.petals*options.pivot_petals; i++) {
		move.extend();
	}
	return move;
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


MoveFactory.prototype.isopop = function(options) {
	// An isopop with options.pop: ANTISPIN is an isobreak
	options = this.defaults(options,{
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		pop: INSPIN,
		offset: OFFSET,
		speed: 2,
		pivot: undefined
	});
	var segment = new MoveLink();
	if (options.pivot!==undefined) {
		segment.pivot.angle = options.pivot;
		segment.pivot.radius = 0.5;
		segment.pivot.plane = options.plane;
		segment.pivot.speed = 0;
	}
	segment.duration = 1/options.speed;
	segment.hand.radius = 0.5;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.speed = options.spin*options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.offset;
	var move = new MoveChain();
	move.add(segment);
	move.extend();
	move.tail().hand.speed = 0;
	move.tail().prop.speed = options.spin*options.direction*options.speed*options.pop;
	return move;
}

MoveFactory.prototype.diamond = function(options) {
	options = this.defaults(options,{
		orient: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		speed: 1,
		extend: 1,
		pivot: undefined
	});
	var segment = new MoveLink();
	segment.duration = 1/(8*options.speed);
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.hand.radius = options.extend;
	segment.prop.angle = options.orient;
	var move = new MoveChain();
	move.add(segment);
	move.tail().hand.linear_angle = options.orient + options.direction*OFFSET;
	move.tail().hand.linear_speed = 16*options.extend*options.speed;
	move.tail().prop.speed = 4*options.speed*options.direction*options.spin;
	move.extend();
	move.tail().hand.linear_angle = options.orient - options.direction*STAGGER/2;
	move.tail().hand.linear_speed = 8*Math.sqrt(2)*options.extend*options.speed;
	move.tail().prop.speed = ((-2*options.spin)+4)*options.spin*options.speed*options.direction;
	move.extend();
	move.tail().hand.linear_angle = options.orient + options.direction*STAGGER;
	move.tail().hand.linear_speed = 16*options.extend*options.speed;
	move.tail().prop.speed = 4*options.speed*options.direction*options.spin;
	move.extend();
	move.tail().hand.linear_angle = options.orient - options.direction*STAGGER/2;
	move.tail().hand.linear_speed = 8*Math.sqrt(2)*options.extend*options.speed;
	move.tail().prop.speed = ((2*options.spin)+4)*options.spin*options.speed*options.direction;
	move.extend();
	move.tail().hand.linear_angle = options.orient + options.direction*OFFSET;
	move.tail().hand.linear_speed = 16*options.extend*options.speed;
	move.tail().prop.speed = 4*options.speed*options.direction*options.spin;
	move.extend();
	move.tail().hand.linear_angle = options.orient + options.direction*STAGGER/2;
	move.tail().hand.linear_speed = 8*Math.sqrt(2)*options.extend*options.speed;
	move.tail().prop.speed = ((2*options.spin)+4)*options.spin*options.speed*options.direction;
	move.extend();
	move.tail().hand.linear_angle = options.orient - + options.direction*STAGGER;
	move.tail().hand.linear_speed = 16*options.extend*options.speed;
	move.tail().prop.speed = 4*options.speed*options.direction*options.spin;
	move.extend();
	move.tail().hand.linear_angle = options.orient + options.direction*STAGGER/2;
	move.tail().hand.linear_speed = 8*Math.sqrt(2)*options.extend*options.speed;
	move.tail().prop.speed = ((-2*options.spin)+4)*options.spin*options.speed*options.direction;
	return move;
}

MoveFactory.prototype.triangle = function(options) {
        options = this.defaults(options,{
                orient: THREE,
                plane: WALL,
                direction: CLOCKWISE,
                spin: INSPIN,
                speed: 1,
                extend: 1,
                pivot: undefined
        });
        var segment = new MoveLink();
        segment.duration = 1/(12*options.speed);
        segment.hand.radius = Math.sqrt(3)*options.extend/3;
        segment.hand.linear_speed = 12*options.extend*options.speed;
        segment.hand.angle = options.orient;
        segment.hand.plane = options.plane;
        segment.prop.plane = options.plane;
        if (options.spin==INSPIN) {
                segment.prop.angle = options.orient + options.direction*UNIT/18;
        } else {
                segment.prop.angle = options.orient - 5*UNIT*options.direction/18;
        }
        var move = new MoveChain();
        move.add(segment);
        move.tail().hand.linear_angle = options.orient + options.direction*5*UNIT/12;
        move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction/3;
        move.extend();
        move.extend();
        move.tail().hand.linear_angle = options.orient + options.direction*UNIT/12;
        move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction;
        move.extend();
        move.tail().hand.linear_angle = options.orient + options.direction*3*UNIT/4;
        move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction/3;
        move.extend();
        move.extend();
        move.extend();
        move.tail().hand.linear_angle = options.orient + options.direction*5*UNIT/12;
        move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction;
        move.extend();
        move.tail().hand.linear_angle = options.orient + options.direction*UNIT/12;
        move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction/3;
        move.extend();
        move.extend();
        move.extend();
        move.tail().hand.linear_angle = options.orient + options.direction*3*UNIT/4;
        move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction;
        move.extend();
        move.tail().hand.linear_angle = options.orient + options.direction*5*UNIT/12;
        move.tail().prop.speed = (6*options.spin+2)*options.speed*options.direction/3;
        return move;
}

MoveFactory.prototype.stallchaser = function(options) {
        options = this.defaults(options,{
		orient: DOWN,
                plane: WALL,
                direction: COUNTERCLOCKWISE,
                speed: 4,
                extend: 1,
		phase: 0,
		variant: true, //not implemented
                pivot: undefined
        });
        var segment = new MoveLink();
        segment.duration = 0.5/options.speed;
        segment.hand.plane = options.plane;
        segment.prop.plane = options.plane;
        segment.hand.radius = options.extend;
        segment.hand.angle = options.orient + options.direction*QUARTER;
        segment.prop.angle = options.orient;
        var move = new MoveChain();
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
        return move;
}


