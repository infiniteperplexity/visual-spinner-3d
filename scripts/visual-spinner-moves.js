VS3D = (function (VS3D) {

//Bring all Constants into the current namespace, for convenience
var Constants = VS3D.Constants;
var UNIT = Constants.UNIT;
var BEAT = Constants.BEAT;
var SPEED = Constants.SPEED;
// Constants used to prevent rounding errors
var TINY = Constants.TINY;
var SMALLISH = Constants.SMALLISH;
// Constants referring to the five spherical prop elements
var HOME = Constants.HOME;
var PIVOT = Constants.PIVOT;
var HELPER = Constants.HELPER
var HAND = Constants.HAND;
var PROP = Constants.PROP;
var ELEMENTS = Constants.ELEMENTS;
// Constants referring to directions
var TWELVE = Constants.TWELVE;
var THREE = Constants.THREE;
var SIX = Constants.SIX;
var NINE = Constants.NINE;
var ONETHIRTY = Constants.ONETHIRTY;
var FOURTHIRTY = Constants.FOURTHIRTY;
var SEVENTHIRTY = Constants.SEVENTHIRTY;
var TENTHIRTY = Constants.TENTHIRTY;
var NEAR = Constants.NEAR;
var FAR = Constants.FAR;
var DOWN = Constants.DOWN;
var UP = Constants.UP;
var HALF = Constants.HALF;
var QUARTER = Constants.QUARTER;
var THIRD = Constants.THIRD;
var STAGGER = Constants.STAGGER;
// Constants referring to planes and axes
var XAXIS = Constants.XAXIS;
var ZAXIS = Constants.ZAXIS;
var YAXIS = Constants.YAXIS;
var WALL = Constants.WALL;
var WHEEL = Constants.WHEEL;
var FLOOR = Constants.FLOOR;
// Constants used to parameterize moves
var SAME = Constants.SAME;
var SPLIT = Constants.SPLIT;
var TOGETHER = Constants.TOGETHER;
var OPPOSITE = Constants.OPPOSITE;
var DIAMOND = Constants.DIAMOND;
var BOX = Constants.BOX;
var DRAG = Constants.DRAG;
var FOLLOW = Constants.FOLLOW;
var NOOFFSET = Constants.NOOFFSET;
var OFFSET = Constants.OFFSET;
var CLOCKWISE = Constants.CLOCKWISE;
var COUNTERCLOCKWISE = Constants.COUNTERCLOCKWISE;
var INSPIN = Constants.INSPIN;
var NOSPIN = Constants.NOSPIN;
var ANTISPIN = Constants.ANTISPIN;
var CATEYE = Constants.CATEYE;
var FORWARD = Constants.FORWARD;
var BACKWARD = Constants.BACKWARD;
var PROBEND = Constants.PROBEND; 
var ISOBEND = Constants.ISOBEND;
var ANTIBEND = Constants.ANTIBEND;
var STATIC = Constants.STATIC;
var CONTACT = Constants.CONTACT;
var GUNSLINGER = Constants.GUNSLINGER;	

var MoveFactory = VS3D.MoveFactory().constructor;
var unwind = VS3D.Utilities.unwind;
var nearly = VS3D.Utilities.nearly;

"use strict";
///Fixes...get rid of most nulls...
///But make entry typically null and rely on orient more
MoveFactory.prototype.staticspin= function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "staticspin",
		movename: "Static Spin",
		entry: THREE,
		orient: THREE,
		extend: TINY,
		plane: WALL,
		direction: CLOCKWISE,
		speed: 1,
		pivot_angle: 0,
		pivot_radius: 0,
		duration: 1,
		sliceby: 4
	});
	var segment = VS3D.MoveLink();
	segment.hand.angle = options.entry;
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	
	segment.hand.plane = options.plane;
	segment.hand.radius = options.extend;
	segment.hand.angle = options.orient;
	segment.hand.speed = 0;
	segment.prop.angle = options.entry;
	segment.prop.plane = options.plane;
	segment.prop.speed = options.direction*options.speed;
	segment.duration = 1/options.sliceby;
	move.add(segment);
	for (var i = 1; i<options.sliceby; i++) {
		move.extend();
	}
	if (options.duration < 1) {
		move = move.slice(0,options.duration*options.sliceby);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=(1/options.sliceby)) {
			move.add(move.submoves[options.sliceby*(i-1)].clone());
		}
	}
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.superman = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "superman",
		movename: "Superman",
		orient: THREE,
		plane: FLOOR,
		direction: CLOCKWISE,
		speed: 1
	});
	var segment = VS3D.MoveLink();
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
	move.recipe = options.recipe;
	move.movename = options.movename;
	move.definition.recipe = options.recipe;
	return move;
}

MoveFactory.prototype.flower = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "flower",
		movename: "Flower",
		entry: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		petals: 4,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		orient: THREE,
		pivot_angle: 0,
		pivot_radius: 0,
		duration: 1,
		sliceby: 4
	});
	var segment = VS3D.MoveLink();
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
	segment.hand.radius = options.extend;
	
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + options.direction*options.mode;
	segment.duration = 1/options.sliceby;
	move.add(segment);
	for (var i = 1; i<options.sliceby; i++) {
		move.extend();
	}
	move.align("hand", options.entry);
	if (options.duration < 1) {
		move = move.slice(0,options.duration*options.sliceby);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=(1/options.sliceby)) {
			move.add(move.submoves[options.sliceby*(i-1)].clone());
		}
	}
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
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
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "ccap",
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
	var segment = VS3D.MoveLink();
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
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.pendulum = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "pendulum",
		movename: "Pendulum",
		orient: SIX,
		entry: SIX,
		plane: WALL,
		direction: CLOCKWISE,
		speed: 1,
		extend: 1, 
		spin: INSPIN,
		pivot_angle: TWELVE,
		pivot_radius: 0,
		duration: 1,
		phase: 0,
		// governs whether the hand path is "pendulous" or not
		hybrid: false,
		// should usally be odd, 1 = pendulum, 3 = one-point-five
		twirl: 1,
		// lift = 1 for antibrid pendulums
		lift: 0,
		// swing = 0.75 for antibrid pendulums
		swing: 1
	});
	var segment = VS3D.MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.helper.angle = TWELVE;
	segment.helper.radius = options.lift;
	segment.helper.plane = options.plane;
	segment.helper.speed = 0;
	segment.duration = 0.25;
	segment.hand.speed = options.speed*options.direction;
	segment.prop.speed = 2*options.twirl*options.swing*options.speed*options.direction*options.spin;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + ((options.twirl-1)%4)*QUARTER;
	if (options.hybrid == true) {
		segment.hand.speed *= 2;
	}
	var hybrid = (options.hybrid == true) ? 8*options.direction*options.speed*options.spin : 0;
	move.add(segment);
	move.tail().prop.acc = -8*options.twirl*options.swing*options.direction*options.speed*options.spin;
	move.tail().hand.acc = -hybrid;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = 0;
	move.extend();
	move.tail().prop.acc = -8*options.swing*options.direction*options.speed*options.spin;
	move.tail().hand.acc = -hybrid;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = 32*options.lift;
	move.extend();
	move.tail().prop.acc = 8*options.swing*options.direction*options.speed*options.spin;
	move.tail().hand.acc = hybrid;
	move.tail().helper.stretch = -8*options.lift;
	move.tail().helper.radius = 2*options.lift;
	move.tail().helper.stretch_acc = 32*options.lift;
	move.extend();
	move.tail().prop.acc = 8*options.twirl*options.swing*options.direction*options.speed*options.spin;
	move.tail().hand.acc = hybrid;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = 0;
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
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.definition.movename = options.movename;
	move.definition.orient = options.orient || SIX;
	return move;
}
// try doing the extra pivot with helper instead of pivot
MoveFactory.prototype.antipendulum = function(options) {
	options = this.defaults(options,{
		recipe: "antipendulum",
		movename: "Anti-Pendulum",
		lift: 0.5,
		swing: 0.75,
		spin: ANTISPIN,
		extend: 0.5
	});	
	return MoveFactory.prototype.pendulum(options);
}

MoveFactory.prototype.onepointfive = function(options) {
	options = this.defaults(options,{
		recipe: "onepointfive",
		movename: "One Point Five",
		twirl: 3
	});
	return MoveFactory.prototype.pendulum(options);
}


//the goofy, wobbly kind
MoveFactory.prototype.isopendulum = function(options) {
	var segment = VS3D.MoveLink();
	segment.definition = options;
	options = this.defaults(options,{
		recipe: "isopendulum",
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
	segment.recipe = options.recipe;
	segment.definition.recipe = options.recipe;
	segment.movename = options.movename;
	return segment;
}

// This move could possibly be re-done using "helper"
MoveFactory.prototype.oval = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "oval",
		movename: "Linear Isolation",
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		petals: 2,
		major: 1,
		minor: 0.5,
		speed: 1,
		mode: DIAMOND,
		entry: THREE,
		orient: THREE,
		pivot_angle: 0,
		pivot_radius: 0,
		duration: 1
	});
	var segment = VS3D.MoveLink();
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
	segment.hand.angle = options.orient;
	if (options.mode != null) {
		segment.prop.angle = options.orient + options.direction*options.mode;
	}
	segment.duration = 0.25;
	move.add(segment);
	move.tail().hand.radius = options.major;
	move.tail().hand.stretch = -(options.major-options.minor)*8;
	move.tail().hand.stretch_acc = (options.major-options.minor)*32;
	move.extend();
	move.tail().hand.radius = options.minor;
	move.tail().hand.stretch = 0;
	move.tail().hand.stretch_acc = (options.major-options.minor)*32;
	move.extend();
	move.tail().hand.radius = options.major;
	move.tail().hand.stretch = -(options.major-options.minor)*8;
	move.tail().hand.stretch_acc = (options.major-options.minor)*32;
	move.extend();
	move.tail().hand.radius = options.minor;
	move.tail().hand.stretch = 0;
	move.tail().hand.stretch_acc = (options.major-options.minor)*32;
	if (options.entry != null) {
		move.align("hand",options.entry);
	}
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.linex = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "linex",
		movename: "Linear Extension",
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		petals: 0,
		extend: 1,
		speed: 1,
		mode: DIAMOND,
		entry: THREE,
		orient: THREE,
		pivot_angle: 0,
		pivot_radius: 0,
		duration: 1
	});
	var segment = VS3D.MoveLink();
	if (options.spin==INSPIN) {
		segment.prop.speed = (options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.speed = (options.petals-1)*options.spin*options.direction*options.speed;
	}
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;

	segment.hand.speed = 0;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.prop.angle = options.orient + options.direction*options.mode;
	segment.duration = 0.25;
	move.add(segment);
	move.tail().hand.angle = options.orient;
	move.tail().hand.radius = options.extend;
	move.tail().hand.stretch = 0;
	move.tail().hand.stretch_acc = -32;
	move.extend();
	move.tail().hand.angle = options.orient+OFFSET;
	move.tail().hand.radius = 0;
	move.tail().hand.stretch = 8;
	move.tail().hand.stretch_acc = -32;
	move.extend();
	move.tail().hand.angle = options.orient+OFFSET;
	move.tail().hand.radius = options.extend;
	move.tail().hand.stretch = 0;
	move.tail().hand.stretch_acc = -32;
	move.extend();
	move.tail().hand.angle = options.orient;
	move.tail().hand.radius = 0;
	move.tail().hand.stretch = 8;
	move.tail().hand.stretch_acc = -32;
	//do we need to do some crazy thing here?
	if (options.entry != null) {
		if (nearly(options.entry,options.orient)) {
			move.phaseBy(0);
		} else if (nearly(options.entry, options.orient + QUARTER*options.direction)) {
			move.phaseBy(1);
		} else if (nearly(options.entry, options.orient + OFFSET)) {
			move.phaseBy(2);
		} else if (nearly(options.entry, options.orient - QUARTER*options.direction)) {
			move.phaseBy(3);
		}  else {
			move.align("hand",options.entry);
		}
	}
	if (options.duration < 1) {
		move = move.slice(0,options.duration*4);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=0.25) {
			move.add(move.submoves[4*(i-1)].clone());
		}
	}
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}


MoveFactory.prototype.old_linex = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	// A linex with harmonics = 1 is a linear extension.  harmonics = 2 is a linear isolation;
	options = this.defaults(options,{
		recipe: "linex",
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
		phase: 0
	});
	segment = VS3D.MoveLink();
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
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	if (options.harmonics == 2) {
		move.definition.movename = "Linear Isolation";
	}
	return move;
}

// haven't done much work on this yet
MoveFactory.prototype.linearfloat = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "linearfloat",
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
		phase: 0
	});
	segment = VS3D.MoveLink();
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
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	if (options.harmonics == 2) {
		move.definition.movename = "Linear Isolation";
	}
	return move;
}

//It's kind of odd that cat-eyes don't have an "orient" argument...
MoveFactory.prototype.isolation = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	// A no-offset isolation is a unit-circle extension. An anti-spin isolation is a cateye;
	options = this.defaults(options,{
		recipe: "isolation",
		movename: "Isolation",
		orient: THREE,
		entry: THREE,
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
	var segment = VS3D.MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.hand.radius = 0.5;
	segment.hand.speed = options.direction*options.speed;
	segment.prop.speed = options.spin*options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	// ???handle cateyes?
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
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
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
        var move = VS3D.MoveChain();
        move.definition = options;
        options = this.defaults(options,{
                recipe: "toroid",
                movename: "Toroid",
                entry: THREE,
                plane: WALL,
                direction: CLOCKWISE,
                pitch: FORWARD,
                bend: ISOBEND,
                harmonics: 4,
                extend: 1,
                speed: 1,
                mode: DIAMOND,
                orient: THREE,
                pivot_angle: 0,
                pivot_radius: 0,
                duration: 1,
                sliceby: 4
        });
        var segment = VS3D.MoveLink();
        segment.prop.speed = options.bend*options.direction*options.speed;
        segment.bend_speed = options.harmonics*options.pitch*options.speed;
        segment.pivot.angle = options.pivot_angle;
        segment.pivot.radius = options.pivot_radius;
        segment.pivot.plane = options.plane;
        segment.pivot.speed = 0;

        segment.hand.speed = options.direction*options.speed;
        segment.prop.plane = options.plane;
        segment.hand.plane = options.plane;
        segment.hand.radius = options.extend;
       
        segment.hand.angle = options.orient;
        segment.prop.angle = options.orient;
        segment.bend = options.direction*options.mode;
        segment.duration = 1/options.sliceby;
        move.add(segment);
        for (var i = 1; i<options.sliceby; i++) {
               move.extend();
        }
        move.align("hand", options.entry);
        if (options.duration < 1) {
                move = move.slice(0,options.duration*options.sliceby);
        } else if (options.duration > 1) {
                for (var i = 1; i<options.duration; i+=(1/options.sliceby)) {
                        move.add(move.submoves[options.sliceby*(i-1)].clone());
                }
        }
        move.recipe = options.recipe;
        move.definition.recipe = options.recipe;
        move.movename = options.movename;
        return move;
}

MoveFactory.prototype.isobend = function(options) {
        var move = VS3D.MoveChain();
        move.definition = options;
        options = this.defaults(options,{
                recipe: "isobend",
                movename: "Linearized Iso-Bend Toroid",
                entry: THREE,
                plane: WALL,
                direction: CLOCKWISE,
                pitch: FORWARD,
                harmonics: 4,
                speed: 1,
		mode: DIAMOND,
                orient: THREE,
                pivot_angle: 0,
                pivot_radius: 0
        });
	var segment = VS3D.MoveLink();
	segment.pivot.radius = options.pivot_radius;
    segment.pivot.plane = options.plane;
	segment.pivot.angle = options.pivot_angle;
    segment.pivot.speed = 0;
	
	segment.prop.bend = 0;
	segment.bend_speed = options.harmonics*options.pitch*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.prop.speed = 0;
	segment.hand.radius = 1;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + OFFSET;
	segment.duration = 1 / (2*options.harmonics);
	move.add(segment);
	move.extend();
	for (var i = 1; i < options.harmonics; i++) {
		move.extend();
		move.tail().hand.angle = unwind(options.orient + i*options.direction*UNIT/options.harmonics);
		move.tail().prop.angle = unwind(options.orient + OFFSET + i*options.direction*UNIT/options.harmonics);
		move.extend();
	}
	move.align("hand", options.entry);
	if (options.mode == DIAMOND) {
		//does this require fixing the definition?
		move.phaseBy(1);
	}
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.antibend = function(options) {
        var move = VS3D.MoveChain();
        move.definition = options;
        options = this.defaults(options,{
                recipe: "antibend",
                movename: "Linearized Anti-Bend Toroid",
                entry: THREE,
                plane: WALL,
                direction: CLOCKWISE,
                pitch: FORWARD,
                harmonics: 4,
                speed: 1,
                orient: THREE,
		mode: DIAMOND,
                pivot_angle: 0,
                pivot_radius: 0
        });
        var segment = VS3D.MoveLink();
        segment.pivot.radius = options.pivot_radius;
        segment.pivot.plane = options.plane;
        segment.pivot.angle = options.pivot_angle;
        segment.pivot.speed = 0;
        var orient = options.orient;
	var entry = options.entry;
	if (options.mode==DIAMOND) {
		orient += SPLIT*options.direction/options.harmonics;
		entry += SPLIT*options.direction/options.harmonics;
	}
        segment.prop.bend = 0;
        segment.bend_speed = 0.5*options.harmonics*options.pitch*options.speed;
        segment.prop.plane = options.plane;
        segment.hand.plane = options.plane;
        segment.prop.speed = 0;
        // what a mess!
        if (options.harmonics === 3) {
                segment.hand.radius = 1/Math.sqrt(3);
        } else if (options.harmonics === 4) {
                segment.hand.radius = 1;
        } else if (options.harmonics === 5) {
                segment.hand.radius = 4/3;
        } else if (options.harmonics === 6) {
                segment.hand.radius = 7/4;
        }
        segment.hand.angle = orient;
        segment.prop.angle = orient - QUARTER*options.direction;
        segment.duration = 1 / options.harmonics;
        move.add(segment);
        for (var i = 1; i < options.harmonics; i++) {
                move.extend();
                move.tail().hand.angle = unwind(orient + i*options.direction*UNIT/options.harmonics);
                move.tail().prop.angle = unwind(orient + ((i%2==0) ? -1 : 1)*QUARTER*options.direction + i*options.direction*UNIT/options.harmonics);
        }
        move.align("hand", entry);
        move.recipe = options.recipe;
        move.definition.recipe = options.recipe;
        move.movename = options.movename;
        return move;
}

MoveFactory.prototype.pentagram = function(options) {
        var move = VS3D.MoveChain();
        move.definition = options;
        options = this.defaults(options,{
                recipe: "pentagram",
                movename: "Linearized Anti-Bend Toroid",
                entry: THREE,
                plane: WALL,
                direction: CLOCKWISE,
                pitch: FORWARD,
                harmonics: 4,
                speed: 1,
                orient: THREE,
		mode: DIAMOND,
                pivot_angle: 0,
                pivot_radius: 0
        });
        var segment = VS3D.MoveLink();
        segment.pivot.radius = options.pivot_radius;
        segment.pivot.plane = options.plane;
        segment.pivot.angle = options.pivot_angle;
        segment.pivot.speed = 0;
        var orient = options.orient;
	var entry = options.entry;
	if (options.mode==DIAMOND) {
		orient += SPLIT*options.direction/options.harmonics;
		entry += SPLIT*options.direction/options.harmonics;
	}
        segment.prop.bend = 0;
        segment.bend_speed = 0.5*options.harmonics*options.pitch*options.speed;
        segment.prop.plane = options.plane;
        segment.hand.plane = options.plane;
        segment.prop.speed = 0;
        // what a mess!
	segment.hand.radius = 0.35;

        segment.hand.angle = orient;
        segment.prop.angle = orient - QUARTER*options.direction;
        segment.duration = 1 / options.harmonics;
        move.add(segment);
        for (var i = 1; i < options.harmonics; i++) {
                move.extend();
                move.tail().hand.angle = unwind(orient + 2*i*options.direction*UNIT/options.harmonics);
                move.tail().prop.angle = unwind(orient + ((i%2==0) ? -1 : 1)*QUARTER*options.direction + 2*i*options.direction*UNIT/options.harmonics);
        }
        move.align("hand", entry);
        move.recipe = options.recipe;
        move.definition.recipe = options.recipe;
        move.movename = options.movename;
        return move;
}


MoveFactory.prototype.tapedeck = function(options) {
        var move = VS3D.MoveChain();
        move.definition = options;
        options = this.defaults(options,{
                recipe: "tapedeck",
                movename: "Tapedeck (Linearized Pro-Bend) Toroid",
                entry: THREE,
                plane: WALL,
                direction: CLOCKWISE,
                pitch: FORWARD,
                speed: 1,
                orient: THREE,
                pivot_angle: 0,
                pivot_radius: 0
        });
        var segment = VS3D.MoveLink();
        segment.pivot.radius = options.pivot_radius;
        segment.pivot.plane = options.plane;
        segment.pivot.angle = options.pivot_angle;
        segment.pivot.speed = 0;
       
        // until someone invents something new, the four-lobe version is the only one that exists
        options.harmonics = 4;
        segment.bend = 0;
        segment.prop.plane = options.plane;
        segment.hand.plane = options.plane;
        segment.hand.radius = 1;
        segment.hand.angle = options.orient;
        segment.prop.angle = options.orient - options.direction*QUARTER;
        segment.duration = 0.5 / options.harmonics;
       
        segment.prop.speed = 0.5*options.direction*options.harmonics*options.pitch*options.speed;
        segment.bend_speed = 0;
        move.add(segment);
	move.extend();
        for (var i = 1; i < options.harmonics; i++) {
                move.extend();
                segment = move.tail();
                segment.bend = 0;
                segment.hand.angle = unwind(options.orient + i*options.direction*UNIT/options.harmonics);
                segment.prop.angle = segment.hand.angle - options.direction*QUARTER;
                segment.prop.speed = (i%2==0) ? 0.5*options.direction*options.harmonics*options.pitch*options.speed : 0;
                segment.bend_speed = (i%2==1) ? 0.5*options.direction*options.harmonics*options.pitch*options.speed : 0;
		if (i==3) {segment.bend_speed = -segment.bend_speed;}
		move.extend();
	}
        move.align("hand", options.entry);
		move.phaseBy(1);
        move.recipe = options.recipe;
        move.definition.recipe = options.recipe;
        move.movename = options.movename;
        return move;
}

//***obscure moves***
MoveFactory.prototype.fractal = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "fractal",
		movename: "Fractal",
		entry: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
		helper_spin: ANTISPIN,
		petals: 4,
		helper_petals: 4,
		extend: 0.5,
		helper_extend: 0.5,
		mode: DIAMOND,
		helper_mode: DIAMOND,
		speed: 1
	});
	var segment = VS3D.MoveLink();
	if (options.spin==INSPIN) {
		segment.prop.speed = (options.petals+1)*options.spin*options.direction*options.speed;
	} else {
		segment.prop.speed = (options.petals-1)*options.spin*options.direction*options.speed;
	}
	if (options.helper_spin==INSPIN) {
		segment.hand.speed = (options.helper_petals+1)*options.helper_spin*options.direction*options.speed;
	} else {
		segment.hand.speed = (options.helper_petals-1)*options.helper_spin*options.direction*options.speed;
	}
	segment.helper.radius = options.helper_extend;
	segment.hand.radius = options.extend;
	segment.helper.speed = options.direction*options.speed;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.helper.plane = options.plane;
	segment.helper.angle = options.entry;
	segment.hand.angle = options.entry + options.helper_mode;
	segment.prop.angle = options.entry + options.mode;
	if ((options.petals*options.helper_petals)==0) {
		segment.duration = 1;
	} else {
		segment.duration = 1/(options.petals*options.helper_petals);
	}
	move.add(segment);
	for (var i = 1; i<options.petals*options.helper_petals; i++) {
		move.extend();
	}
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}


MoveFactory.prototype.scap = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "scap",
		movename: "S-CAP",
		plane: WALL,
		orient: THREE,
		direction: CLOCKWISE,
		inpetals: 0,
		antipetals: 3, 
		extend: 1,
		speed: 2,
	});
	segment = VS3D.MoveLink();
	segment.duration = 0.25;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient;
	segment.helper.radius = options.extend;
	move.add(segment);
	move.tail().hand.speed = options.speed*options.direction;
	move.tail().prop.speed = (options.inpetals+1)*options.speed*options.direction;
	move.tail().helper.angle = options.orient;
	move.extend();
	move.tail().hand.speed = -options.speed*options.direction;
	move.tail().prop.speed = (options.antipetals-1)*options.speed*options.direction;
	move.tail().helper.angle = options.orient+OFFSET;
	move.tail().hand.angle = options.orient;
	move.extend();
	move.tail().hand.speed = options.speed*options.direction;
	move.tail().prop.speed = (options.inpetals+1)*options.speed*options.direction;
	move.tail().helper.angle = options.orient+OFFSET;
	move.extend();
	move.tail().hand.speed = -options.speed*options.direction;
	move.tail().prop.speed = (options.antipetals-1)*options.speed*options.direction;
	move.tail().helper.angle = options.orient;
	move.tail().hand.angle = options.orient + OFFSET;
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}


MoveFactory.prototype.isopop = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	// An isopop with options.pop: ANTISPIN is an isobreak
	options = this.defaults(options,{
		recipe: "isopop",
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
	var segment = VS3D.MoveLink();
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
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	if (options.spin == ANTISPIN) {
		move.movename = "Iso-Break";
	}
	return move;
}

MoveFactory.prototype.diamond = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "diamond",
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
	var segment = VS3D.MoveLink();
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
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.triangle = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "triangle",
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
	var segment = VS3D.MoveLink();
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
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.stallchaser = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "stallchaser",
		movename: "Stall Chaser",
		orient: DOWN,
		plane: WALL,
		direction: COUNTERCLOCKWISE,
		speed: 4,
		extend: 1,
		phase: 0,
		variant: true, //not implemented
	});
	var segment = VS3D.MoveLink();
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
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}

MoveFactory.prototype.generic = function(options) {
	var segment = VS3D.MoveLink();
	segment.definition = options;
	options = this.defaults(options,{
		recipe: "generic",
		movename: "(fully generic movement)",
		// I think I can get away with being lazy and not adding defaults for "helper"
		home_angle: null,
		pivot_angle: TWELVE,
		helper_angle: THREE,
		hand_angle: THREE,
		prop_angle: THREE,
		plane: WALL,
		home_plane: null,
		pivot_plane: null,
		helper_plane: null,
		hand_plane: null,
		prop_plane: null,
		home_radius: null,
		pivot_radius: 0,
		helper_radius: 0,
		hand_radius: 0,
		prop_radius: 1,
		home_speed: 0,
		pivot_speed: 0,
		helper_speed: 0,
		hand_speed: 0,
		prop_speed: 0,
		home_acc: 0,
		pivot_acc: 0,
		helper_acc: 0,
		hand_acc: 0,
		prop_acc: 0,
		home_linear_speed: 0,
		pivot_linear_speed: 0,
		helper_linear_speed: 0,
		hand_linear_speed: 0,
		prop_linear_speed: 0,
		home_linear_angle: THREE,
		pivot_linear_angle: THREE,
		helper_linear_angle: THREE,
		hand_linear_angle: THREE,
		prop_linear_angle: THREE,
		home_linear_acc: 0,
		pivot_linear_acc: 0,
		helper_linear_acc: 0,
		hand_linear_acc: 0,
		prop_linear_acc: 0,
		home_stretch: 0,
		pivot_stretch: 0,
		helper_stretch: 0,
		hand_stretch: 0,
		prop_stretch: 0,
		home_stretch_acc: 0,
		pivot_stretch_acc: 0,
		helper_stretch_acc: 0,
		hand_stretch_acc: 0,
		prop_stretch_acc: 0,
		twist: null,
		twist_speed: 0,
		grip: 0,
		grip_speed: 0,
		choke: 0,
		choke_speed: 0, 
		bend: 0,
		bend_speed: 0,
		bend_acc: 0,
		duration: 1
	});
	segment.duration = options.duration;
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.plane = (options.pivot_plane != null) ? options.pivot_plane : options.plane;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.speed = options.pivot_speed;
	segment.pivot.acc = options.pivot_acc;
	segment.pivot.linear_angle = options.pivot_linear_angle;
	segment.pivot.linear_speed = options.pivot_linear_speed;
	segment.pivot.linear_acc = options.pivot_linear_acc;
	segment.pivot.stretch = options.pivot_stretch;
	segment.pivot.stretch_acc = options.pivot_stretch_acc;
	segment.helper.angle = options.helper_angle;
	segment.helper.plane = (options.helper_plane != null) ? options.helper_plane : options.plane;
	segment.helper.radius = options.helper_radius;
	segment.helper.speed = options.helper_speed;
	segment.helper.acc = options.helper_acc;
	segment.helper.linear_angle = options.helper_linear_angle;
	segment.helper.linear_speed = options.helper_linear_speed;
	segment.helper.linear_acc = options.helper_linear_acc;
	segment.helper.stretch = options.helper_stretch;
	segment.helper.stretch_acc = options.helper_stretch_acc;
	segment.hand.angle = options.hand_angle;
	segment.hand.plane = (options.hand_plane != null) ? options.hand_plane : options.plane;
	segment.hand.radius = options.hand_radius;
	segment.hand.speed = options.hand_speed;
	segment.hand.acc = options.hand_acc;
	segment.hand.linear_angle = options.hand_linear_angle;
	segment.hand.linear_speed = options.hand_linear_speed;
	segment.hand.linear_acc = options.hand_linear_acc;
	segment.hand.stretch = options.hand_stretch;
	segment.hand.stretch_acc = options.hand_stretch_acc;
	segment.prop.angle = options.prop_angle;
	segment.prop.plane = (options.prop_plane != null) ? options.prop_plane : options.plane;
	segment.prop.radius = options.prop_radius;
	segment.prop.speed = options.prop_speed;
	segment.prop.acc = options.prop_acc;
	segment.prop.linear_angle = options.prop_linear_angle;
	segment.prop.linear_speed = options.prop_linear_speed;
	segment.prop.linear_acc = options.prop_linear_acc;
	segment.prop.stretch = options.prop_stretch;
	segment.prop.stretch_acc = options.prop_stretch_acc;
	segment.twist = options.twist;
	segment.twist_speed = options.twist_speed;
	segment.grip = options.grip;
	segment.grip_speed = options.grip_speed;
	segment.choke = options.choke;
	segment.choke_speed = options.choke_speed;
	segment.bend = options.bend;
	segment.bend_speed = options.bend_speed;
	segment.bend_acc = options.bend_acc;
	segment.movename = options.movename;
	segment.recipe = options.recipe;
	segment.definition.recipe = options.recipe;
	//add stuff back in in a bit
	return segment;
}

MoveFactory.prototype.spiral = function(options) {
	var move = VS3D.MoveChain();
	move.definition = options;
	options = this.defaults(options,{
		recipe: "spiral",
		movename: "Spiral Wrap",
		entry: null,
		orient: THREE,
		extend: TINY,
		plane: WALL,
		direction: CLOCKWISE,
		speed: 1,
		stretch: -1,
		pivot_angle: 0,
		pivot_radius: 0,
		duration: 1,
		sliceby: 4
	});
	var segment = VS3D.MoveLink();
	if (options.entry != null) {
		segment.hand.angle = options.entry;
	}
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	
	segment.hand.plane = options.plane;
	segment.hand.radius = options.extend;
	segment.hand.angle = options.orient;
	segment.hand.speed = 0;
	if (options.entry != null) {
		segment.prop.angle = options.entry;
	}
	segment.prop.plane = options.plane;
	segment.prop.speed = options.direction*options.speed;
	segment.duration = 1/options.sliceby;
	segment.prop.stretch = options.stretch;
	//not sure if I like this...
	//if (segment.prop.stretch > 0) {
	//	segment.prop.radius -= options.stretch;
	//}
	move.add(segment);
	for (var i = 1; i<options.sliceby; i++) {
		move.extend();
	}
	if (options.duration < 1) {
		move = move.slice(0,options.duration*options.sliceby);
	} else if (options.duration > 1) {
		for (var i = 1; i<options.duration; i+=(1/options.sliceby)) {
			move.add(move.submoves[options.sliceby*(i-1)].clone());
		}
	}
	move.recipe = options.recipe;
	move.definition.recipe = options.recipe;
	move.movename = options.movename;
	return move;
}


MoveFactory.prototype.stall = function(options) {
	var segment = VS3D.MoveLink();
	segment.definition = options;
	options = this.defaults(options,{
		recipe: "stall",
		movename: "Stall",
		exit: false,
		entry: THREE,
		plane: WALL,
		direction: CLOCKWISE,
		spin: INSPIN,
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
	var exit = (options.exit == true) ? -1 : 1;
	segment.prop.acc = -exit*segment.prop.speed/options.duration;
	segment.hand.acc = -exit*2*options.speed*options.direction/options.duration;
	segment.prop.speed = (options.exit == true) ? 0 : segment.prop.speed;
	segment.hand.speed = options.direction*options.speed;
	segment.hand.speed = (options.exit == true) ? 0 : 2*segment.hand.speed;
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
	segment.recipe = options.recipe;
	segment.definition.recipe = options.recipe;
	segment.movename = options.movename;
	return segment;
}


MoveFactory.prototype.toss = function(options) {
	var segment = VS3D.MoveLink();
	segment.definition = options;
	options = this.defaults(options,{
		recipe: "toss",
		movename: "Vertical Toss",
		speed: 2,
		duration: 1,
		gravity: 50,
		direction: CLOCKWISE,
		orient: NINE,
		entry: NINE,
		extend: 0,
		plane: WALL,
		pivot_radius: 0,
		pivot_angle: THREE,
		drift: 0
	});
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.helper.plane = options.plane;
	segment.pivot.plane = options.plane;
	
	segment.hand.speed = 0;
	segment.prop.speed = options.direction*options.speed;
	
	segment.hand.angle = options.orient;
	segment.hand.radius = options.extend;
	segment.prop.angle = options.entry;
	segment.helper.linear_angle = TWELVE;
	segment.helper.linear_speed = 0.5*options.gravity*options.duration;
	segment.helper.linear_acc = -options.gravity;
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.linear_angle = THREE;
	segment.pivot.linear_speed = options.drift;
	segment.duration = options.duration;
	segment.movename = options.movename;
	segment.definition.recipe = options.recipe;
	segment.recipe = options.recipe;
	return segment;
}

return VS3D;
})(VS3D);