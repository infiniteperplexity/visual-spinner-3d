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

MoveFactory.prototype.defaults = function(options, defaults) {
	if (options===undefined) {options = {};}
	for (var option in options) {
		defaults[option] = options[option];
	}
	return defaults;
}

Constants.convert = function(hash) {
	var cvar onverted = {};
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

MoveFactory.prototype.build = function(movename, options) {
	//we could through an underscore in there to prevent accidental access
	if (options===undefined) {options = {};}
	var augmented = {};
	for (var option in options) {
		augmented[option] = options[option];
	}
	defaults = Constants.convert(oveFactory.prototype.build.movename.defaults);
	for (var def in defaults) {
		if (augmented[def] === undefined) {
			augmented[def] = defaults[def];
		}
	}
	var move = MoveFactory.recipes[movename](augmented);
	
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
	
	move.definition = options;
	move.definition.recipe = movename;
	
	return move;
}
MoveFactory.prototype.recipe = function(movename, defaults, main) {
	MoveFactory.prototype.recipes.movename = fun(movename, defaults);
	MoveFactory.prototype.recipes.movename.defaults = defaults;
}
MoveFactory.prototype.variant = function(movename, defaults, main) {
	MoveFactory.prototype.recipes.movename = function(options) {
		if (options===undefined) {options = {};}
		var augmented = {};
		for (var option in options) {
			augmented[option] = options[option];
		}
		defaults = Constants.convert(oveFactory.prototype.build.movename.defaults);
		for (var def in defaults) {
			if (augmented[def] === undefined) {
				augmented[def] = defaults[def];
			}
		}
		var move = MoveFactory.prototype.recipes["main"](options);
		move.definition.recipe = movename;
		return move;
	};
	MoveFactory.prototype.recipes.movename.defaults = defaults;
}



MoveFactory.recipe(
	"flower",
{
	name: "Flower",
	entry: "THREE",
	plane: "WALL",
	direction: "CLOCKWISE",
	spin: "INSPIN",
	petals: 4,
	extend: 1,
	speed: 1,
	mode: "DIAMOND",
	orient: "THREE",
	pivot_angle: 0,
	pivot_radius: 0,
	duration: 1,
	sliceby: 4
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
MoveFactory.variant("antispin",{name: "Anti-Spin Flower", spin: ANTISPIN},"flower");
MoveFactory.variant("extension",{name: "Extension", petals: 0},"flower");

return VS3D;
})(VS3D);