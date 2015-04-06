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
var CW = Constants.CLOCKWISE;
var CCW = Constants.COUNTERCLOCKWISE;
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


//// "reorient" is a more aggressive version of "adjust" that will scrap and rebuild the move in different orientations


MoveFactory.prototype.defaults = function(options, defaults) {
	if (options===undefined) {options = {};}
	for (var option in options) {
		defaults[option] = options[option];
	}
	return defaults;
}

Constants.convert = function(hash) {
	var converted = {};
	for (key in hash) {
		if (typeof hash[key] === "string") {
			converted[key] = Constants[hash[key]];
		} else {
			converted[key] = hash[key];
		}
	}
	return converted;
}

MoveFactory.prototype.recipes = {};

//naming conflict with JSON!
MoveFactory.prototype.build = function(movename, options) {
	//ad hoc handling of naming conflict
	if (movename[0] === "{") {
		return MoveFactory.prototype.oldbuild(movename);
	}
	if (options===undefined) {options = {};}
	options = Constants.convert(options);
	
	var augmented = {};
	for (var option in options) {
		augmented[option] = options[option];
	}
	defaults = Constants.convert(MoveFactory.prototype.recipes[movename].defaults);
	for (var def in defaults) {
		if (augmented[def] === undefined) {
			augmented[def] = defaults[def];
		}
	}
	
	//we can run into trouble here with variants because they can't see the augmented definition of their  parent
	if (MoveFactory.prototype.recipes[movename].main) {
		defaults = Constants.convert(MoveFactory.prototype.recipes[MoveFactory.prototype.recipes[movename].main].defaults);
		for (var def in defaults) {
			if (augmented[def] === undefined) {
				augmented[def] = defaults[def];
			}
		}
	}
	var move = MoveFactory.prototype.recipes[movename](augmented);

	if (move.submoves) {
		if (augmented.phase !== undefined) {
			move.phaseBy(augmented.phase);
		}
		if (augmented.duration < 1) {
			move = move.slice(0,augmented.duration*augmented.sliceby);
		} else if (augmented.duration > 1) {
			for (var i = 1; i<augmented.duration; i+=(1/augmented.sliceby)) {
				move.add(move.submoves[augmented.sliceby*(i-1)].clone());
			}
		}
	}
	move.definition = options;
	move.definition.recipe = movename;
	return move;
}

MoveFactory.prototype.oldbuild = function(json) {
	var definition = this.parse(json);
	if (definition.recipe == undefined) {alert("undefined!");}//alert(json);}
	var move = this.build(definition.recipe,definition);
	if (definition.abrupt !== undefined) {
		move.setAbrupt(definition.abrupt);
	}
	if (definition.modify !== undefined) {
		move.modify(definition.modify);
	}
	if (definition.modify_tail !== undefined) {
		move.modifyTail(definition.modify_tail);
	}
	return move;
}

var MoveChain = VS3D.MoveChain().constructor;
var Prop = VS3D.Prop().constructor;
var MoveLink = VS3D.MoveLink().constructor;


MoveChain.prototype.align = function(element, angle) {
	for (var i = 0; i<this.submoves.length; i++) {
		if (nearly(this.head()[element].angle, angle, 0.1)) {
			return this;
		} else {
			this.startPhase(1);
		}
	}
	alert("alignment failed.");
	return this;
}


//// "reorient" is a more aggressive version of "adjust" that will scrap and rebuild the move in different orientations
MoveChain.prototype.reorient = function(target) {
	var retrn = this.adjust(target);
	// If it works to start with, don't mess with it
	if (retrn !== null) {return retrn;}
	var definition = this.definition;
	if (definition === undefined) {
		return this;
	}
	
	
	var augmented = {};
	for (var option in definition) {
		augmented[option] = definition[option];
	}
	var defaults = Constants.convert(MoveFactory.prototype.recipes[definition.recipe].defaults);
	for (var def in defaults) {
		if (augmented[def] === undefined) {
			augmented[def] = defaults[def];
		}
	}
	if (MoveFactory.prototype.recipes[definition.recipe].main) {
		defaults = Constants.convert(MoveFactory.prototype.recipes[MoveFactory.prototype.recipes[definition.recipe].main].defaults);
		for (var def in defaults) {
			if (augmented[def] === undefined) {
				augmented[def] = defaults[def];
			}
		}
	}
	definition = augmented;
	//alert(JSON.stringify(definition,null,2));
	var entry = definition.entry;
	var orient = definition.orient;
	if (entry === undefined || orient === undefined) {
		return this;
	}
	var hand;
	var prop;
	if (target instanceof Prop) {
		hand = target.handVector();
		prop = target.propVector();
	} else if (target instanceof MoveLink || target instanceof MoveChain) {
		hand = target.socket().handVector();
		prop = target.socket().propVector();
	}
	// If it doesn't work, cycle through orientations and entry angles until it works
	var redefined;

	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			definition.orient = unwind(orient+i*QUARTER);
			definition.entry = unwind(entry+j*QUARTER);
			redefined = MoveFactory.prototype.build(JSON.stringify(definition));
			if (hand.nearly(redefined.handVector(),0.05) && prop.nearly(redefined.propVector(),0.1)) {
				redefined.oneshot = this.oneshot;
				return redefined;
			}
			retrn = redefined.adjust(target);
			if (retrn !== null) {
				retrn.oneshot = this.oneshot;
				return retrn;
			}
		}
	}
	//right now there is no way to tell whether a prop should have a mode...does that mean we can't rotate through?
	//new code - tries even more aggressively to match sockets
	var mode = definition.mode || DIAMOND;
	for (var k = 0; k < 4; k++) {
		for (var i = 0; i < 4; i++) {
			for (var j = 0; j < 4; j++) {
				definition.mode = unwind(mode+k*QUARTER);
				definition.orient = unwind(orient+i*QUARTER);
				definition.entry = unwind(entry+j*QUARTER);
				redefined = MoveFactory.prototype.build(JSON.stringify(definition));
				if (hand.nearly(redefined.handVector(),0.05) && prop.nearly(redefined.propVector(),0.1)) {
					redefined.oneshot = this.oneshot;
					return redefined;
				}
				retrn = redefined.adjust(target);
				if (retrn !== null) {
					retrn.oneshot = this.oneshot;
					return retrn;
				}
			}
		}
	}
	alert(hand.toArray());
	alert(prop.toArray());
	// Otherwise fail
	this.reorientFail();
	//alert("Socketing failed (unable to align next move with end of prior move.)");
	//alert(JSON.stringify(definition,null,2));
	return null;
}

MoveFactory.recipe = function(movename, defaults, fun) {
	if (MoveFactory.prototype.recipes[movename] !== undefined) {
		alert("Tried to redefine an existing move name.  This may be an oversight.");
	}
	MoveFactory.prototype.recipes[movename] = fun;
	MoveFactory.prototype.build[movename] = function(options) {
		return MoveFactory.prototype.build(movename,options);
	}
	//MoveFactory.prototype[movename] = function(options) {
	//	return MoveFactory.prototype.build(movename,options);
	//}
	// experiment with the concept of "default defaults" that apply to all moves
	var default_defaults = {
		plane: "WALL",
		entry: "THREE",
		orient: "THREE",
		duration: 1,
		speed: 1,
		direction: "CLOCKWISE",
		pivot_angle: "THREE",
		pivot_radius: 0,
		phase: 0,
		sliceby: 4
	};
	for(key in default_defaults) {
		if (defaults[key] === undefined) {
			defaults[key] = default_defaults[key];
		}
	}
	MoveFactory.prototype.recipes[movename].defaults = defaults;
}
MoveFactory.variant = function(movename, defaults, main) {
	if (MoveFactory.prototype.recipes[movename] !== undefined) {
		alert("Tried to redefine an existing move name.  This may be an oversight.");
	}
	MoveFactory.prototype.recipes[movename] = function(options) {
		if (options===undefined) {options = {};}
		options = Constants.convert(options);
		var augmented = {};
		for (var option in options) {
			augmented[option] = options[option];
		}
		defaults = Constants.convert(MoveFactory.prototype.recipes[movename].defaults);
		for (var def in defaults) {
			if (augmented[def] === undefined) {
				augmented[def] = defaults[def];
			}
		}
		defaults = Constants.convert(MoveFactory.prototype.recipes[main].defaults);
		for (var def in defaults) {
			if (augmented[def] === undefined) {
				augmented[def] = defaults[def];
			}
		}
		var move = MoveFactory.prototype.recipes[main](augmented);
		return move;
	};
	MoveFactory.prototype.build[movename] = function(options) {
		return MoveFactory.prototype.build(movename,options);
	}
	MoveFactory.prototype.recipes[movename].defaults = defaults;
	//is this truly the best way to do it?
	MoveFactory.prototype.recipes[movename].main = main;
}

MoveFactory.recipe(
	"flower",
{
	name: "Flower",
	spin: "INSPIN",
	petals: 4,
	extend: 1,
	mode: "DIAMOND"
},
function(options) {
	var move = VS3D.MoveChain();
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
	return move;
});
MoveFactory.variant("antispin",{name: "Anti-Spin Flower", spin: "ANTISPIN"},"flower");
MoveFactory.variant("triquetra",{name: "Triquetra", petals: 3, spin: "ANTISPIN"},"flower");
MoveFactory.variant("extension",{name: "Extension", petals: 0},"flower");
MoveFactory.variant("pointiso",{name: "Point Isolation", petals: 0, mode: "BOX"},"flower");
MoveFactory.variant("drag",{name: "Drag", petals: 0, mode: "DRAG"},"flower");
MoveFactory.variant("follow",{name: "Follow", petals: 0, mode: "FOLLOW"},"flower");



MoveFactory.recipe(
	"staticspin",
{
	name: "Static Spin",
	extend: "TINY"
},
function(options) {
	var move = VS3D.MoveChain();
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
	return move;
});




MoveFactory.recipe(
	"ccap",
{
	name: "C-CAP",
	spin1: "INSPIN",
	spin2: "ANTISPIN",
	petals1: 0,
	petals2: 4,
	extend: 1
},
function(options) {
	var move = VS3D.MoveChain();
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
	return move;
});


MoveFactory.recipe(
	"pendulum",
{
	name: "Pendulum",
	spin: "INSPIN",
	orient: "SIX",
	entry: "SIX",
	extend: 1,
	// This parameter makes the hand path accelerate
	hybrid: false,
	// This parameter allows 1.5s...it should always be an odd number
	twirl: 1,
	// This parameter helps with antipendulum hybrids
	lift: 0,
	// This parameter determines how far the pendulum swings
	swing: 1
},
function(options) {
	var move = VS3D.MoveChain();
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
	move.align("hand", options.entry);
	return move;
});
MoveFactory.variant("antipendulum",{name: "Anti-Pendulum", spin: "ANTISPIN", lift: 0.5, swing: 0.75, extend: 0.5},"pendulum");
MoveFactory.variant("onepointfive",{name: "One Point Five", twirl: 3},"pendulum");


//Should figure out how to incorporate ovals into here
MoveFactory.recipe(
	"linex",
{
	name: "Linear Extension",
	spin: "INSPIN",
	petals: 0,
	extend: 1,
	mode: "DIAMOND",
	ovalness: 0
},
function(options) {
	var move = VS3D.MoveChain();
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
	segment.hand.angle = options.orient;
	segment.helper.speed = options.speed*options.direction;
	segment.helper.radius = options.ovalness;
	segment.helper.angle = options.orient;
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	segment.prop.angle = options.orient + options.direction*options.mode;
	segment.duration = 0.25;
	move.add(segment);
	move.tail().hand.radius = options.extend-options.ovalness;
	move.tail().hand.stretch = 0;
	move.tail().hand.stretch_acc = -32*(options.extend-options.ovalness);
	move.extend();
	move.tail().hand.angle = options.orient+OFFSET;
	move.tail().hand.radius = 0;
	move.tail().hand.stretch = 8*(options.extend-options.ovalness);
	move.tail().hand.stretch_acc = -32*(options.extend-options.ovalness);
	move.extend();
	move.tail().hand.angle = options.orient+OFFSET;
	move.tail().hand.radius = options.extend-options.ovalness;
	move.tail().hand.stretch = 0;
	move.tail().hand.stretch_acc = -32*(options.extend-options.ovalness);
	move.extend();
	move.tail().hand.angle = options.orient;
	move.tail().hand.radius = 0;
	move.tail().hand.stretch = 8*(options.extend-options.ovalness);
	move.tail().hand.stretch_acc = -32*(options.extend-options.ovalness);
	//do we need to do some crazy thing here?
	if (nearly(options.entry,options.orient)) {
		move.startPhase(0);
	} else if (nearly(options.entry, options.orient + QUARTER*options.direction)) {
		move.startPhase(1);
	} else if (nearly(options.entry, options.orient + OFFSET)) {
		move.startPhase(2);
	} else if (nearly(options.entry, options.orient - QUARTER*options.direction)) {
		move.startPhase(3);
	}  else {
		move.align("hand",options.entry);
	}
	return move;
});
MoveFactory.variant("lineariso",{name: "Linear Isolation", petals: 2},"linex");




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



MoveFactory.recipe(
	"isolation",
{
	name: "Isolation",
	spin: "INSPIN",
	mode: "OFFSET",
	petals: 0,
	extend: 1,
	mode: "DIAMOND"
},
function(options) {
	var move = VS3D.MoveChain();
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
		segment.prop.angle = options.entry + options.mode;
	}
	segment.duration = 0.25;
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	return move;
});
MoveFactory.variant("cateye",{name: "Cat-Eye", spin: "ANTISPIN"},"isolation");
MoveFactory.variant("unitextension",{name: "Unit Circle Extension", mode: "NOOFFSET"},"isolation");


MoveFactory.recipe(
	"toroid",
{
	name: "Toroid",
	pitch: "FORWARD",
	bend: "ISOBEND",
	harmonics: 4,
	extend: 1,
	mode: "DIAMOND"
},
function(options) {
	var move = VS3D.MoveChain();
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
	return move;
});
MoveFactory.variant("isobend",{name: "Isobend Toroid", harmonics: 4},"toroid");
MoveFactory.variant("antibend",{name: "Antibend Toroid", harmonics: 2},"toroid");
MoveFactory.variant("probend",{name: "Probend Toroid", harmonics: 1},"toroid");


MoveFactory.recipe(
	"linearisobend",
{
	name: "Linearized Iso-Bend Toroid",
	pitch: "FORWARD",
	harmonics: 4,
	mode: "DIAMOND"
},
function(options) {
	var move = VS3D.MoveChain();
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
		move.startPhase(1);
	}
	return move;
});


MoveFactory.recipe(
	"linearantibend",
{
	name: "Linearized Anti-Bend Toroid",
	pitch: "FORWARD",
	harmonics: 4,
	mode: "DIAMOND"
},
function(options) {
	var move = VS3D.MoveChain();
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
    return move;
});

MoveFactory.recipe(
	"tapedeck",
{
	name: "Tapedeck (Linearized Pro-Bend) Toroid",
	pitch: "FORWARD"
	//,mode: "DIAMOND"
},
function(options) {
    var move = VS3D.MoveChain();
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
	move.startPhase(1);
	return move;
});


MoveFactory.recipe(
	"spiral",
{
	name: "Spiral Wrap",
	extend: "TINY",
	stretch: -1
},
function(options) {
    var move = VS3D.MoveChain();
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
	segment.prop.stretch = options.stretch;
	move.add(segment);
	for (var i = 1; i<options.sliceby; i++) {
		move.extend();
	}
	return move;
});


MoveFactory.recipe(
	"toss",
{
	name: "Toss",
	speed: (2/3),
	//"height" might be better...
	gravity: 7,
	drift: 0,
	weight: 0.5
},
function(options) {
    var segment = VS3D.MoveLink();
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.helper.plane = options.plane;
	segment.pivot.plane = options.plane;
	
	segment.choke = options.weight;
	segment.helper.angle = options.entry;
	segment.helper.radius = options.weight;
	
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
	return segment;
});


MoveFactory.recipe(
	"weave",
{
	name: "Weave",
	extend: 1,
	// I'm not at all set on this way of doing things
	axis: null,
	beats: 2,
	spin: "INSPIN",
	sway: 0.5,
	bend: 0.25,
	pitch: "FORWARD"
},
function(options) {
    var move = VS3D.MoveChain();
    var segment = VS3D.MoveLink();
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	var wheelfix = 1;
	var floorfix = 0;
	if (options.axis===null) {
		if (options.plane == WALL) {
			segment.helper.plane = WHEEL;
		} else if (options.plane == WHEEL) {
			segment.helper.plane = WALL;
			wheelfix = -1;
		} else if (options.plane == FLOOR) {
			segment.helper.plane = WHEEL;
			floorfix = UNIT/4;
			wheelfix = -1;
		}
	} else {
		segment.helper.plane = options.axis;
	}
	segment.helper.angle = 0;
	segment.hand.speed = 0;
	segment.hand.radius = 0;
	segment.hand.speed = 0;
	segment.prop.angle = options.entry;
	segment.prop.speed = options.direction*options.speed*options.beats;
	segment.duration = 0.25;
	move.add(segment);
	move.tail().bend = 0;
	move.tail().bend_speed = wheelfix*2*options.bend*options.pitch;
	move.tail().bend_acc = wheelfix*-8*options.bend*options.pitch;
	move.tail().helper.angle = floorfix + ((options.pitch == FORWARD) ? SPLIT : 0);
	move.tail().helper.radius = 0;
	move.tail().helper.stretch = 8*options.sway;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.extend();
	move.tail().bend = wheelfix*0.25*UNIT*options.bend*options.pitch;
	move.tail().bend_speed = 0;
	move.tail().bend_acc = wheelfix*-8*options.bend*options.pitch;
	move.tail().helper.radius = options.sway;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.extend();
	move.tail().bend = 0;
	move.tail().bend_speed = wheelfix*-2*options.bend*options.pitch;
	move.tail().bend_acc = wheelfix*8*options.bend*options.pitch;
	move.tail().helper.angle = floorfix + ((options.pitch == FORWARD) ? 0 : SPLIT);
	move.tail().helper.radius = 0;
	move.tail().helper.stretch = 8*options.sway;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.extend();
	move.tail().bend = wheelfix*-0.25*UNIT*options.bend*options.pitch;
	move.tail().bend_speed = 0;
	move.tail().bend_acc = wheelfix*8*options.bend*options.pitch;
	move.tail().helper.radius = options.sway;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = -32*options.sway;
	return move;
});


		

MoveFactory.recipe(
	"stall",
{
	name: "Stall",
	extend: 1,
	petals: 4,
	mode: "DIAMOND",
	duration: 0.5,
	spin: "INSPIN",
	exit: false
},
function(options) {
	//only type of move to have no "orient"?
	var segment = VS3D.MoveLink();
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
	segment.hand.radius = options.extend;
	segment.hand.angle = options.entry;
	segment.prop.angle = options.entry + options.mode;
	//if (options.exit==false) {alert(segment.propVector().toArray())};
	return segment;
});


MoveFactory.recipe(
	"generic",
{
recipe: "generic",
	name: "(fully generic movement)",
	home_angle: null,
	pivot_angle: TWELVE,
	helper_angle: THREE,
	hand_angle: THREE,
	prop_angle: THREE,
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
	bend_acc: 0
},
function(options) {
	var segment = VS3D.MoveLink();
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
	//add stuff back in in a bit
	return segment;
});


MoveFactory.recipe(
	"diamond",
{
	name: "Zan's Diamond",
	extend: 1,
	spin: "INSPIN",
},
function(options) {
    var move = VS3D.MoveChain();
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
	return move;
});



MoveFactory.recipe(
	"triangle",
{
	name: "Triangle",
	extend: 1,
	spin: "INSPIN",
},
function(options) {
    var move = VS3D.MoveChain();
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
	return move;
});


MoveFactory.recipe(
	"stallchaser",
{
	name: "Stall Chaser",
	extend: 1,
	orient: "DOWN",
	direction: "COUNTERCLOCKWISE",
	speed: 4,
	spin: "INSPIN",
	variant: true // not implemented
},
function(options) {
    var move = VS3D.MoveChain();
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
	return move;
});


MoveFactory.recipe(
	"isopop",
{
	name: "Iso-Pop",
	speed: 2,
	mode: "OFFSET",
	spin: "INSPIN",
	pop: "INSPIN"
},
function(options) {
    var move = VS3D.MoveChain();
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
	segment.prop.angle = options.orient + options.mode;
	move.add(segment);
	move.extend();
	move.tail().hand.speed = 0;
	move.tail().prop.speed = options.spin*options.direction*options.speed*options.pop;
	return move;
});
MoveFactory.variant("isobreak",{name: "Iso-Break", pop: "ANTISPIN"},"isopop");


MoveFactory.recipe(
	"scap",
{
	name: "S-CAP",
	speed: 2,
	inpetals: 0,
	antipetals: 3,
	extend: 1,
	spin: "INSPIN",
},
function(options) {
    var move = VS3D.MoveChain();
	var segment = VS3D.MoveLink();
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
	return move;
});


MoveFactory.recipe(
	"fractal",
{
	name: "Third-Order (Fractal) Flower",
	spin: "INSPIN",
	helper_spin: "ANTISPIN",
	petals: 4,
	helper_petals: 4,
	extend: 0.5,
	helper_extend: 0.5,
	mode: "DIAMOND",
	helper_mode: "DIAMOND"
},
function(options) {
    var move = VS3D.MoveChain();
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
	return move;
});


return VS3D;
})(VS3D);