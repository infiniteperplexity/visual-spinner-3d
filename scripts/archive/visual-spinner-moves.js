//how exactly do we feed defaults into moves?  Do we need to actively consume the arguments?

VS3D = (function (VS3D) {

//Bring all Constants into the current namespace, for convenience
var Constants = VS3D.Constants;
var UNIT = Constants.UNIT;
var BEAT = Constants.BEAT;
var SPEED = Constants.SPEED;
// Constants used to prevent rounding errors
var TINY = Constants.TINY;
var SMALL = Constants.SMALL;
// Constants referring to the five spherical prop elements
var HOME = Constants.HOME;
var PIVOT = Constants.PIVOT;
var HELPER = Constants.HELPER;
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
var NONE = Constants.NONE;
var NOBEND = Constants.NOBEND;
var PROBEND = Constants.PROBEND;
var ISOBEND = Constants.ISOBEND;
var ANTIBEND = Constants.ANTIBEND;
var STATIC = Constants.STATIC;
var CONTACT = Constants.CONTACT;
var GUNSLINGER = Constants.GUNSLINGER;

var MoveFactory = VS3D.MoveFactory().constructor;
var MoveChain = VS3D.MoveChain().constructor;
var MoveLink = VS3D.MoveLink().constructor;
var Prop = VS3D.Prop().constructor;
var Vector = VS3D.Vector().constructor;
var unwind = VS3D.Utilities.unwind;
var nearly = VS3D.Utilities.nearly;

"use strict";

Prop.prototype.defineMoves = function(def) {
	this.emptyMoves();
	var move;
	for (var i = 0; i<def.moves.length; i++) {
		move = MoveFactory.prototype.build(def.moves[i].recipe, def.moves[i]);
		this.addMove(move);
	}
}
Prop.prototype.definePosition = function(def) {
	for (var i = HOME; i<=PROP; i++) {
		if (def[ELEMENTS[i]]===undefined) {
			this[ELEMENTS[i]].azimuth = 0;
			this[ELEMENTS[i]].zenith = QUARTER;
			if (i===PROP) {
				this.prop.radius = 1;
			} else {
				this[ELEMENTS[i]].radius = 0;
			}
		} else {
			if (def[ELEMENTS[i]].radius===undefined) {
				if (i===PROP) {
					this.prop.radius = 1;
				} else {
					this[ELEMENTS[i]].radius = 0;
				}
			} else {
				this[ELEMENTS[i]].radius = def[ELEMENTS[i]].radius;
			}
			if (def[ELEMENTS[i]].zenith===undefined) {
				this[ELEMENTS[i]].zenith = QUARTER;
			} else {
				this[ELEMENTS[i]].zenith = def[ELEMENTS[i]].zenith;
			}
			if (def[ELEMENTS[i]].azimuth===undefined) {
				this[ELEMENTS[i]].azimuth = 0;
			} else {
				this[ELEMENTS[i]].azimuth = def[ELEMENTS[i]].azimuth;
			}
		}
	}
	this.twist = def.twist || 0;
	this.grip = def.grip || 0;
	this.choke = def.choke || 0;
	this.bend = def.bend || 0;
	//need to implement
	//this.axis = Vector.define(def.axis) || WALL;
	this.name = def.name || undefined;
	this.propType = def.propType;
	this.color = def.color || "red";
	this.fire = def.fire || false;
}

//should we add a "sparsify" parameter?
Prop.prototype.stringify = function() {
	var def = {}
	var e;
	for (var i = HOME; i<=PROP; i++) {
		e = {};
		if (i==PROP) {
			if (this.prop.radius !== 1) {
				e.radius = this.prop.radius;
			}
		} else {
			// what about negative radius?
			if (this[ELEMENTS[i]].radius > TINY) {
				e.radius = this[ELEMENTS[i]].radius;
			}
		}
		if (this[ELEMENTS[i]].zenith != QUARTER) {
			e.zenith = this[ELEMENTS[i]].zenith;
		}
		if (this[ELEMENTS[i]].azimuth > TINY) {
			e.azimuth = this[ELEMENTS[i]].azimuth;
		}
		if (e.radius !== undefined || e.zenith !== undefined || e.azimuth !== undefined) {
			def[ELEMENTS[i]] = Constants.stringify(e);
		}
	}
	if (this.twist !== 0) {
		def.twist = this.twist;
	}
	if (this.choke !== 0) {
		def.choke = this.choke;
	}
	if (this.bend !== 0) {
		def.bend = this.bend;
	}
	if (this.grip !== 0) {
		def.grip = this.grip;
	}
	if (this.axis !== undefined && !this.axis.nearly(WALL)) {
		def.axis = this.axis
	}
	if (this.name !== undefined) {
		def.name = this.name;
	}
	if (this.propType !== "poi") {
		def.propType = this.propType;
	}
	if (this.color !== "red") {
		def.color = this.color;
	}
	if (this.fire !== false) {
		def.fire = this.fire;
	}
	def = Constants.stringify(def);
	def.moves = [];
	for (var i = 0; i<this.move.submoves.length; i++) {
		def.moves[i] = MoveFactory.prototype.sparsify(this.move.submoves[i].definition);
	}
	return JSON.stringify(def,null,2);
}
//takes JSONized Prop (optionally sparse, optionally constantized) and returns valid definition
Prop.prototype.parseProp = function(json) {
	var def = JSON.parse(json);
	//for (var i = HOME; i<=PROP; i++) {
	//	if (def[ELEMENTS[i]] === undefined) {
	//		if (i==PROP) {
	//			def.prop === {radius: 1, zenith: QUARTER, azimuth: TINY};
	//		} else {
	//			def[ELEMENTS[i]] = {radius: TINY, zenith: QUARTER, azimuth: TINY};
	//		}
	//	}
	//}
	def = Constants.parse(def);
	return def;
}

//Takes an associative array with numeric values and returns an associative array with some values converted to text
Constants.stringify = function(def) {
	for (option in def) {
		//etc
		if (	option==="entry"
				|| option==="orient"
				|| option==="azimuth"
				|| option==="zenith"
				|| option==="grip"
				|| option==="twist"
				|| option==="bend"
				|| option.substr(-6,6)==="_angle") {
			if (nearly(def[option],THREE)) {
				def[option]="THREE";
			} else if (nearly(def[option],SIX)) {
				def[option]="SIX";
			} else if (nearly(def[option],NINE)) {
				def[option]="NINE";
			} else if (nearly(def[option],TWELVE)) {
				def[option]="TWELVE";
			} else if (nearly(def[option],ONETHIRTY)) {
				def[option]="ONETHIRTY";
			} else if (nearly(def[option],FOURTHIRTY)) {
				def[option]="FOURTHIRTY";
			} else if (nearly(def[option],SEVENTHIRTY)) {
				def[option]="SEVENTHIRTY";
			} else if (nearly(def[option],TENTHIRTY)) {
				def[option]="TENTHIRTY";
			}
		}
		if (option==="mode") {
			if (nearly(def[option],BOX)) {
				def[option]="BOX";
			} else if (nearly(def[option],DIAMOND)) {
				def[option]="DIAMOND";
			} else if (nearly(def[option],DRAG)) {
				def[option]="DRAG";
			} else if (nearly(def[option],FOLLOW)) {
				def[option]="FOLLOW";
			}
		}
		if (option==="axis" || option.substr(-5,5)==="plane") {
			if (def[option] && WALL.nearly(def[option])) {
				def[option] = "WALL";
			} else if (def[option] && WHEEL.nearly(def[option])) {
				def[option] = "WHEEL";
			} else if (def[option] && FLOOR.nearly(def[option])) {
				def[option] = "FLOOR";
			}
		}
		if (def[option] === TINY) {
			def[option] = "TINY";
		}
		else if (def[option] === SMALL) {
			def[option] = "SMALL";
		} else if (nearly(def[option],0)) {
			def[option] = 0;
		}
	}
	return def;
}
//Takes an associative array that may contain converted text values and converts them back to numbers
Constants.parse = function(hash) {
	var converted = {};
	for (key in hash) {
		if(key==="home" || key==="pivot" || key==="helper" || key==="hand" || key==="prop") {
			converted[key] = this.parse(hash[key]);
		}
		//this apparently is a thing that can happen...
		else if(hash[key] === null) {
			converted[key] = null;
		} else if (typeof hash[key] === "string" && Constants[hash[key]] !== undefined) {
				converted[key] = Constants[hash[key]];
		//there might be a better way of doing this...
		} else if (hash[key].x !== undefined && hash[key].y !== undefined && hash[key].z !== undefined) {
			converted[key] = Vector.define(hash[key]);
		} else {
			converted[key] = hash[key];
		}
	}
	return converted;
};



//is this method even needed? for now, yes, until we have constant cleaning on build...
MoveFactory.prototype.parse = function(json) {
	var def = JSON.parse(json);
	return MoveFactory.prototype.build(def.recipe,def);
}

MoveChain.prototype.stringify = function() {
	var def = MoveFactory.prototype.sparsify(this);
	return JSON.stringify(def,null,2);
}
MoveLink.prototype.stringify = function () {
	return MoveChain.prototype.stringify.call(this);
}
MoveFactory.prototype.sparsify = function(def) {
	if (def===undefined) {
		return {};
	}
	var defaults = MoveFactory.prototype.recipes[def.recipe].defaults;
	defaults.recipe = def.recipe;
	defaults = MoveFactory.prototype.augment(defaults);
	for (key in defaults) {
		if(key==="axis" || key.substr(-5,5)==="plane") {
			if (def[key]!==undefined && defaults[key]!==undefined) {
				if (nearly(def[key].x,nearly(defaults[key].x)) && nearly(def[key].y,nearly(defaults[key].y) && nearly(def[key].z,nearly(defaults[key].z)))) {
					def[key] = undefined;
				}
			}
		}
		else if (def[key]==defaults[key] || nearly(def[key],defaults[key])) {
			def[key] = undefined;
		}
	}
	def = Constants.stringify(def);
	def.recipe = defaults.recipe;
	return def;
}

function isValidJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

MoveFactory.prototype.augment = function(def) {
	if (def===undefined) {
		def = {};
	}
	var augmented = {};
	var defaults;
	if (MoveFactory.prototype.recipes[def.recipe]===undefined) {
		alert(def.recipe);
	}
	if (MoveFactory.prototype.recipes[def.recipe].main) {
		defaults = MoveFactory.prototype.recipes[MoveFactory.prototype.recipes[def.recipe].main].defaults;
		for (var d in defaults) {
			augmented[d] = defaults[d];
		}
	}
	defaults = MoveFactory.prototype.recipes[def.recipe].defaults;
	for (var d in defaults) {
		augmented[d] = defaults[d];
	}
	for (var option in def) {
		augmented[option] = def[option];
	}
	return augmented;
}

MoveFactory.prototype.recipes = {};

MoveFactory.prototype.build = function(movename, options) {
	if (options===undefined) {options = {};}
	options = Constants.parse(options);
	options.recipe = movename;
	var augmented = MoveFactory.prototype.augment(options);
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
	//experimental code...might make lots of other stuff obsolete
	var various = ["choke","grip","twist","bend","pivot_radius","pivot_angle"];
	for (var i=0; i<various.length; i++) {
		if (options[various[i]] !== undefined && MoveFactory.prototype.recipes[movename].defaults[various[i]] === undefined) {
			if (move.submoves) {
				for (var j=0; j<move.submoves.length; j++) {
					move.submoves[j][various[i]] = options[various[i]];
				}
			} else {
				move[various[i]] = options[various[i]];
			}
		}
	}
	//end experimental code
	if (augmented.abrupt !== undefined) {
		move.setAbrupt(augmented.abrupt);
	}
	if (augmented.modify !== undefined) {
		move.modify(augmented.modify);
	}
	if (augmented.modify_tail !== undefined) {
		move.modifyTail(augmented.modify_tail);
	}
	move.definition = options;
	move.definition.recipe = movename;
	return move;
}

var MoveChain = VS3D.MoveChain().constructor;
var Prop = VS3D.Prop().constructor;
var MoveLink = VS3D.MoveLink().constructor;


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
		twist: 0,
		grip: 0,
		choke: 0,
		bend: 0,
		phase: 0,
		sliceby: 4
	};
	for(key in default_defaults) {
		if (defaults[key] === undefined) {
			defaults[key] = default_defaults[key];
		}
	}
	MoveFactory.prototype.recipes[movename].defaults = Constants.parse(defaults);
}
MoveFactory.variant = function(movename, defaults, main) {
	if (MoveFactory.prototype.recipes[movename] !== undefined) {
		alert("Tried to redefine an existing move name.  This may be an oversight.");
	}
	MoveFactory.prototype.recipes[movename] = function(options) {
		if (options===undefined) {options = {};}
		//options = Constants.parse(options);
		var augmented = {};
		for (var option in options) {
			augmented[option] = options[option];
		}
		MoveFactory.prototype.recipes[movename].defaults;
		for (var def in defaults) {
			if (augmented[def] === undefined) {
				augmented[def] = defaults[def];
			}
		}
		defaults = MoveFactory.prototype.recipes[main].defaults;
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
	MoveFactory.prototype.recipes[movename].defaults = Constants.parse(defaults);
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
MoveFactory.variant("rtype",{name: "R-Type", petals: -1, mode: "BOX"},"flower");



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
	// under certain parameters, pendulums align badly and need tweaking
	if ((options.hybrid == true || options.extend < SMALL) && nearly(options.entry,TWELVE)) {
		move.align("hand",SIX);
	} else {
		move.align("hand", options.entry);
	}
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

MoveFactory.recipe(
	"isolation",
{
	name: "Isolation",
	spin: "INSPIN",
	mode: "OFFSET",
	petals: 0,
	extend: 1
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
MoveFactory.variant("helix",{name: "Helical Flower", bend: NOBEND, harmonics: 4},"toroid");
MoveFactory.variant("antibend",{name: "Antibend Toroid", bend: ANTIBEND, harmonics: 2},"toroid");
MoveFactory.variant("probend",{name: "Probend Toroid", bend: PROBEND, harmonics: 1},"toroid");


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
	"pentagram",
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
    return move;
});


MoveFactory.recipe(
	"tapedeck",
{
	name: "Tapedeck (Linearized Pro-Bend) Toroid",
	pitch: "FORWARD"
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
	segment.duration = options.duration/options.sliceby;
	segment.prop.stretch = options.stretch;
	move.add(segment);
	move.extend();
	move.extend();
	move.extend();
	move.align("prop", options.entry);
	//for (var i = 1; i<options.sliceby; i++) {
	//	move.extend();
	//}
	return move;
});


MoveFactory.recipe(
	"toss",
{
	name: "Toss",
	//"height" is a rough measure
	height: 2,
	drift: 0,
	weight: 0.5,
	extend: 0
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
	// Is using actual G just a coincidence that it looks right???
	segment.helper.linear_speed = 4.9*options.speed*options.height*options.duration;
	segment.helper.linear_acc = -9.8*options.speed*options.height;
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
	extend: 0,
	// I'm not at all set on this way of doing things
	//axle: WHEEL,
	harmonics: 2,
	spin: "INSPIN",
	sway: 0.5,
	lean: 0.25,
	pitch: "FORWARD",
	mode: "DIAMOND"
},
function(options) {
    var move = VS3D.MoveChain();
    var segment = VS3D.MoveLink();
	segment.prop.plane = options.plane;
	segment.hand.plane = options.plane;
	var wheelfix = 1;
	var floorfix = 0;
	//if (options.axle===null) {
	if (options.plane.nearly(WALL)) {
		segment.helper.plane = WHEEL;
	} else if (options.plane.nearly(WHEEL)) {
		segment.helper.plane = WALL;
		wheelfix = -1;
	} else if (options.plane.nearly(FLOOR)) {
		segment.helper.plane = WHEEL;
		floorfix = UNIT/4;
		wheelfix = -1;
	}
	//} else {
	//	segment.helper.plane = options.axis;
	//}
	segment.helper.angle = 0;
	segment.hand.speed = options.speed*options.direction*options.spin;
	segment.hand.radius = options.extend;
	segment.hand.angle = options.entry;
	segment.prop.angle = options.orient + options.direction*options.mode;
	segment.prop.angle = options.entry;
	segment.prop.speed = options.direction*options.speed*options.harmonics;
	segment.duration = 0.25;
	move.add(segment);
	move.tail().bend = 0;
	move.tail().bend_speed = wheelfix*2*options.lean*options.pitch;
	move.tail().bend_acc = wheelfix*-8*options.lean*options.pitch;
	move.tail().helper.angle = floorfix + ((options.pitch == FORWARD) ? SPLIT : 0);
	move.tail().helper.radius = 0;
	move.tail().helper.stretch = 8*options.sway;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.extend();
	move.tail().bend = wheelfix*0.25*UNIT*options.lean*options.pitch;
	move.tail().bend_speed = 0;
	move.tail().bend_acc = wheelfix*-8*options.lean*options.pitch;
	move.tail().helper.radius = options.sway;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.extend();
	move.tail().bend = 0;
	move.tail().bend_speed = wheelfix*-2*options.lean*options.pitch;
	move.tail().bend_acc = wheelfix*8*options.lean*options.pitch;
	move.tail().helper.angle = floorfix + ((options.pitch == FORWARD) ? 0 : SPLIT);
	move.tail().helper.radius = 0;
	move.tail().helper.stretch = 8*options.sway;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.extend();
	move.tail().bend = wheelfix*-0.25*UNIT*options.lean*options.pitch;
	move.tail().bend_speed = 0;
	move.tail().bend_acc = wheelfix*8*options.lean*options.pitch;
	move.tail().helper.radius = options.sway;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = -32*options.sway;
	return move;
});


MoveFactory.recipe(
	"superman",
{
	name: "Superman",
	extend: 0,
	spin: "INSPIN",
	sway: 0.5,
	pitch: "FORWARD",
	mode: "DIAMOND"
},
function(options) {
    var move = VS3D.MoveChain();
    var segment = VS3D.MoveLink();
	segment.prop.plane = FLOOR;
	segment.hand.plane = options.plane;
	segment.helper.plane = options.plane;
	//var wheelfix = 1;
	//var floorfix = 0;
	//if (options.plane.nearly(WALL)) {
//		segment.helper.plane = WHEEL;
//	} else if (options.plane.nearly(WHEEL)) {
//		segment.helper.plane = WALL;
//		wheelfix = -1;
//	} else if (options.plane.nearly(FLOOR)) {
//		segment.helper.plane = WHEEL;
//		floorfix = UNIT/4;
//		wheelfix = -1;
//	}
	segment.helper.angle = 0;
	segment.hand.speed = options.speed*options.direction*options.spin;
	segment.hand.radius = options.extend;
	segment.hand.angle = options.entry;
	segment.prop.angle = options.orient;
	segment.duration = 0.25;
	move.add(segment);
	move.tail().helper.angle = ((options.pitch == FORWARD) ? 0 : SPLIT);
	move.tail().helper.radius = 0;
	move.tail().helper.stretch = 8*options.sway;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.tail().prop.speed = 2*options.pitch*options.speed;
	move.extend();
	move.tail().helper.radius = options.sway;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.tail().prop.speed = -2*options.pitch*options.speed;
	move.extend();
	move.tail().helper.angle = ((options.pitch == FORWARD) ? SPLIT : 0);
	move.tail().helper.radius = 0;
	move.tail().helper.stretch = 8*options.sway;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.tail().prop.speed = -2*options.pitch*options.speed;
	move.extend();
	move.tail().helper.radius = options.sway;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = -32*options.sway;
	move.tail().prop.speed = 2*options.pitch*options.speed;
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
	segment.duration = options.duration;
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
	"snake",
{
	name: "Snake",
	speed: 3,
	direction: "CLOCKWISE"
},
function(options) {
    var move = VS3D.MoveChain();
	var segment = VS3D.MoveLink();
	segment.duration = 1/options.speed;
	segment.hand.radius = 1;
	segment.hand.speed = 0;
	segment.prop.speed = options.direction*options.speed;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + OFFSET;
	move.add(segment);
	move.extend();
	move.tail().hand.radius = 0.5;
	move.tail().pivot.angle = options.orient;
	move.tail().pivot.radius = 0.5;
	move.tail().hand.speed = options.direction*options.speed;
	move.tail().prop.speed = options.direction*options.speed;
	move.extend();
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
