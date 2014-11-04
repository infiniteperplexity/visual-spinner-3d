var VS3D = (function () {
"use strict";
//// Human-readable constants used by the VisualSpinner3D engine
// Constants related to speed and radians
var Constants = {};
var UNIT = Constants.UNIT = 2 * Math.PI;
var BEAT = Constants.BEAT = 360;
var SPEED = Constants.SPEED = UNIT/BEAT;
// Constants used to prevent rounding errors
var TINY = Constants.TINY = 0.0001;
var SMALLISH = Constants.SMALLISH = 0.01;
// Constants referring to the five spherical prop elements
var HOME = Constants.HOME = 0;
var PIVOT = Constants.PIVOT = 1;
var HELPER = Constants.HELPER = 2;
var HAND = Constants.HAND = 3;
var PROP = Constants.PROP = 4;
var ELEMENTS = Constants.ELEMENTS = ["home","pivot","helper","hand","prop"];
// Constants referring to directions
var TWELVE = Constants.TWELVE = 1.5*Math.PI;
var THREE = Constants.THREE = 0;
var SIX = Constants.SIX = 0.5*Math.PI;
var NINE = Constants.NINE = Math.PI;
var ONETHIRTY = Constants.ONETHIRTY = 1.75*Math.PI;
var FOURTHIRTY = Constants.FOURTHIRTY = 0.25*Math.PI;
var SEVENTHIRTY = Constants.SEVENTHIRTY = 0.75*Math.PI;
var TENTHIRTY = Constants.TENTHIRTY = 1.25*Math.PI;
var NEAR = Constants.NEAR = 0;
var FAR = Constants.FAR = Math.PI;
var DOWN = Constants.DOWN = 0.5*Math.PI;
var UP = Constants.UP = 1.5*Math.PI;
var HALF = Constants.HALF = 0.5*Math.PI;
var QUARTER = Constants.QUARTER = 0.5*Math.PI;
var THIRD = Constants.THIRD = (2/3)*Math.PI;
var STAGGER = Constants.STAGGER = 0.5*Math.PI;
// Constants referring to planes and axes
var XAXIS = Constants.XAXIS = [1,0,0];
var ZAXIS = Constants.ZAXIS = [0,0,1];
var YAXIS = Constants.YAXIS = [0,-1,0];
var WALL = Constants.WALL = new Vector(0,0,1);
var WHEEL = Constants.WHEEL = new Vector(1,0,0);
var FLOOR = Constants.FLOOR = new Vector(0,1,0);
// Constants used to parameterize moves
var SAME = Constants.SAME = 0;
var SPLIT = Constants.SPLIT = Math.PI;
var TOGETHER = Constants.TOGETHER = 0;
var OPPOSITE = Constants.OPPOSITE = Math.PI;
var DIAMOND = Constants.DIAMOND = 0;
var BOX = Constants.BOX = Math.PI;
var NOOFFSET = Constants.NOOFFSET = 0;
var OFFSET = Constants.OFFSET = Math.PI;
var CLOCKWISE = Constants.CLOCKWISE = 1;
var COUNTERCLOCKWISE = Constants.COUNTERCLOCKWISE = -1;
var INSPIN = Constants.INSPIN = 1;
var NOSPIN = Constants.NOSPIN = 0;
var ANTISPIN = Constants.ANTISPIN = -1;
var CATEYE = Constants.CATEYE = -1;
var FORWARD = Constants.FORWARD = 1;
var BACKWARD = Constants.BACKWARD = -1;
var PROBEND = Constants.PROBEND = 3; 
var ISOBEND = Constants.ISOBEND = 1;
var ANTIBEND = Constants.ANTIBEND = -1;
var STATIC = Constants.STATIC = 0;
var CONTACT = Constants.CONTACT = Math.PI;
var GUNSLINGER = Constants.GUNSLINGER = 0.5;

//attempt to re-scope constants into another namespace
Constants.rescope = function (scope) {
	scope = scope || window;
	for (var c in this) {
		if (scope[c] !== undefined && c !== "rescope") {
			alert("Constant-naming conflict in enclosing namespace.  Must use explicit 'VS3D.Constant' reference for this session.");
			return;
		}
	}
	for (var c in this)  {
		if (c !== "rescope") {
			scope[c] = this[c];
		}
	}
}
Constants.descope = function (scope) {
	scope = scope || window;
	for (var c in this) {
		if (c !== "rescope") {
			scope[c] = undefined;
		}
	}
}

//// A Vector can represent either a point or a plane, in 3D Cartesian coordinates
function Vector(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
}
/// Vector helper methods
// Check whether the Vector is exactly zero, which sometimes causes math errors
Vector.prototype.isZero = function() {
	if (this.x==0 && this.y==0 && this.z==0) {
		return true;
	} else {
		return false;
	}
}
// Normalize a vector to magnitude = 1
Vector.prototype.unitize = function() {
	if (this.isZero()) {return this;}	
	var len = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
	var x = this.x / len;
	var y = this.y / len;
	var z = this.z / len;
	return (new Vector(x,y,z));
}
// Find the diagonal vector halfway between two vectors
Vector.prototype.diagonal = function(v) {
	return (new Vector(this.x + v.x, this.y + v.y, this.z + v.z)).unitize();
}
// Rotate a Vector around an axis
Vector.prototype.rotate = function(angle, axis) {
	if (axis===undefined) {
		axis = WALL;
	}
	var x = this.x;
	var y = this.y;
	var z = this.z;
	var u = axis.x;
	var v = axis.y;
	var w = axis.z;
	var s = (u*x+v*y+w*z); 
	var t = (u*u+v*v+w*w);
	var sq = Math.sqrt(t);
	var cs = Math.cos(angle);
	var sn = Math.sin(angle);
	var a = (u*s*(1-cs)+t*x*cs+sq*(v*z-w*y)*sn)/t;
	var b = (v*s*(1-cs)+t*y*cs+sq*(w*x-u*z)*sn)/t;
	var c = (w*s*(1-cs)+t*z*cs+sq*(u*y-v*x)*sn)/t;
	return (new Vector(a,b,c));
}
// Find the cross product of two Vectors
Vector.prototype.cross = function(v) {
        var x = this.y*v.z - this.z*v.y;
        var y = this.z*v.x - this.x*v.z;
        var z = this.x*v.y - this.y*v.x;
        return new Vector(x,y,z);
}         
// Project a vector onto a plane (defined by axis)
Vector.prototype.project = function(axis) {
	if (axis===undefined) {
		axis = WALL;
	}
	var dot = this.x*axis.x + this.y*axis.y + this.z*axis.z;
	var x = this.x-dot*axis.x;
	var y = this.y-dot*axis.y;
	var z = this.z-dot*axis.z;
	return (new Vector(x,y,z));
}
// Find the arbitrarily defined "reference" vector for a plane (defined by axis)
Vector.prototype.reference = function() {
	//if this is the floor plane or the zero vector, return THREE
	if (this.x==0 && this.z==0) {
		return (new Vector(1,0,0));
	}
	//otherwise, return the intersection of this and the floor plane in the first or second quadrant (is that right?)
	if (this.z > 0) {
		return (new Vector(this.z,0,-this.x)).unitize();
	} else {
		//return new Vector(-this.z,0,-this.x);
		//return (new Vector(-this.z,0,this.x)).unitize();
		return (new Vector(-this.z,0,-this.x)).unitize();
	}
}
// Find angle between two Vectors
Vector.prototype.between = function(v) {
	//returns the angle between two vectors
	//tends to have rounding errors
	var cx = this.y*v.z - this.z*v.y;
	var cy = this.z*v.x - this.x*v.z;
	var cz = this.x*v.y - this.y*v.x;
	var cross = Math.sqrt(cx*cx+cy*cy+cz*cz);
	var dot = this.x*v.x+this.y*v.y+this.z*v.z;
	return Math.atan2(cross, dot);
}
// Test equality of vectors within rounding error
Vector.prototype.nearly = function(vector, delta) {
	if (delta===undefined) {
		delta = SMALLISH;
	}
	//checks to see whether two vectors or planes are nearly the same
	if (	Math.abs(this.x-vector.x)<delta
		&&	Math.abs(this.y-vector.y)<delta
		&&	Math.abs(this.z-vector.z)<delta) 
	{
		return true;
	} else {
		return false;
	}		
}
// Convert Vector coordinates to Spherical coordinates
Vector.prototype.spherify = function() {
	var r = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
	var theta = Math.acos(this.z/r);
	var phi = Math.atan2(this.y,this.x);
	return (new Spherical(r,theta,phi));
}
// Convert Vector to an array
Vector.prototype.toArray = function() {
	return [this.x,this.y,this.z];
}
// Some properties render differently in the WALL plane vs. the WHEEL and FLOOR planes
// This function tells you, roughly, how WALL-ish the plane is
Vector.prototype.zsquare = function() {
	// I think it should be already unitized
	//var unit = this.unitize();
	return unit.z*unit.z;
}


//// A Spherical represents the spherical coordinates of a point
function Spherical(r, z, a) {
	this.radius = r;
	this.zenith = z;
	this.azimuth = a;
}
// Normalize a Spherical to radius = 1
Spherical.prototype.unitize = function() {
	return (new Spherical(1, this.zenith, this.azimuth));
}
// Build a Spherical from the coordinate system used by Moves
Spherical.prototype.setRadiusAnglePlane = function(radius, angle, plane) {
	this.radius = radius;
	if (plane === undefined) {plane = WALL;}
	var v = plane.reference().rotate(angle,plane).unitize();
	this.zenith = unwind(Math.acos(v.z/Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z)));
	this.azimuth = unwind(Math.atan2(v.y,v.x));;
	return this;
}
// Convert from Spherical coordinates to Vector coordinates
Spherical.prototype.vectorize = function() {
	var x = this.radius*Math.cos(this.azimuth)*Math.sin(this.zenith);
	var y = this.radius*Math.sin(this.azimuth)*Math.sin(this.zenith);
	var z = this.radius*Math.cos(this.zenith);
	return (new Vector(x,y,z));
}

//// Generally helpful geometry methods
// Make an angle unique
function unwind(angle) {
        while (angle<0) {angle+=UNIT;}
        while (angle>UNIT) {angle = angle%UNIT;}
        return angle;
}
// Check whether two floating point values are almost equal
function nearly(n1,n2, delta) {
	if (delta===undefined) {
		delta = SMALLISH;
	}
	n1 = unwind(n1);
	n2 = unwind(n2);
	if (Math.abs(n1-n2)<delta) {return true;}
	else if (Math.abs(Math.abs(n1-n2)-2*Math.PI)<delta) {return true;}
	else {return false;}
}


//// A Prop handles the geometry for a number of spherical coordinates, a renderer, and a move queue
// Note that Props and Moves use different coordinate systems for three-dimensional angles.
	// Props define angles uniquely in terms of spherical coordinates: zenith and azimuth
	// Moves define angles in spinner's terms: distance from a reference angle in the wall, wheel, or floor plane 
function Prop() {
	this.propname = "not defined";
	// These elements define the Prop's position
	// "hand" and "prop" are used in almost every move
	// "home" should be used when the spinner's body is moving, e.g. walking around
		// home is a little bit special because Moves default to "null" (respect the Prop's starting "home")
	// "helper" and "pivot" are used to displace a move further
		// in general, use "pivot" to displace an entire move, and "helper" as a last resort to fine-tune sub-movements
	this.home = new Spherical(TINY,QUARTER,TINY);
	this.pivot = new Spherical(TINY,QUARTER,TINY);
	this.helper = new Spherical(TINY,QUARTER,TINY);
	this.hand = new Spherical(TINY,QUARTER,TINY);
	this.prop = new Spherical(1,QUARTER,TINY);
	this.elements = [this.home, this.pivot, this.helper, this.hand, this.prop];
	// "grip" could represent any point along the circumference of a hoop; for poi and staff, 0 or PI are the only sensible values
	this.grip = 0;
	// "twist" has no effect for poi or staff, but for hoop or fans it represents twisting the grip
	this.twist = 0;
	// "choke" tells how far up the prop is being gripped.
	this.choke = 0;
	// "bend" is used for plane-bending moves, and represents a bend in the prop's plane relative to the axis of motion
	this.bend = 0;
	// "axis" tracks the prop's axis of motion, which is useful for rendering .bend and possibly .twist correctly
		// WALL is an arbitrary default
	this.axis = WALL;
	// "renderer" is specific to a type of prop and a viewing interface
	this.renderer = null;
	// "move" is the queue of moves associated with the Prop
	this.move = new MoveChain();
}
//// Primary methods
// Call the renderer
Prop.prototype.render = function() {
	this.renderer.render(this);
}
// Tell the prop to spin
Prop.prototype.spin = function() {
	if (this.move.submoves.length==0) {
		this.spinfail();
	} else {
		this.move.spin(this);
	}
}
// Trying to spin with an empty queue might produce different results in different implementations, e.g. populating with a default move
Prop.prototype.spinfail = function() {
	alert("please override spinfail()");
	//user should override
}

//// Geometrical methods to move the Prop around
// Set an element to a particular spherical angle
Prop.prototype.setElementAngle = function(element, angle, plane) {
	element = ELEMENTS[element];
	if (plane === undefined) {plane = WALL;}
	var v = plane.reference().rotate(angle,plane).unitize();
	this[element].zenith = unwind(Math.acos(v.z/Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z)));
	this[element].azimuth = unwind(Math.atan2(v.y,v.x));
}
Prop.prototype.setHomeAngle = function(angle, plane) {this.setElementAngle(HOME, angle, plane);}
Prop.prototype.setPivotAngle = function(angle, plane) {this.setElementAngle(PIVOT, angle, plane);}
Prop.prototype.setHelperAngle = function(angle, plane) {this.setElementAngle(HELPER, angle, plane);}
Prop.prototype.setHandAngle = function(angle, plane) {this.setElementAngle(HAND, angle, plane);}
Prop.prototype.setPropAngle = function(angle, plane) {this.setElementAngle(PROP, angle, plane);}
// Rotate an element by a particular angle in a particular plane
Prop.prototype.rotateElement = function(element, angle, plane) {
	element = ELEMENTS[element];
	if (angle===0) {return;}
	// not a perfect fix
	if (this[element].radius==0) {this[element].radius=TINY}
	if (plane === undefined) {plane = WALL;}
	//project the current vector onto the plane
	var projected = this[element].vectorize().project(plane);
	// not a perfect fix
	if (projected.isZero()) {
		projected.x = TINY;
		projected.y = TINY;
		projected.z = TINY;
	}
	var v = projected.rotate(angle, plane).unitize();
	this[element].zenith = unwind(Math.acos(v.z/Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z)));
	this[element].azimuth = unwind(Math.atan2(v.y,v.x));
}
Prop.prototype.rotateHome = function(angle, plane) {this.rotateElement(HOME, angle, plane);}
Prop.prototype.rotatePivot = function(angle, plane) {this.rotateElement(PIVOT, angle, plane);}
Prop.prototype.rotateHelper = function(angle, plane) {this.rotateElement(HELPER, angle, plane);}
Prop.prototype.rotateHand = function(angle, plane) {this.rotateElement(HAND, angle, plane);}
Prop.prototype.rotateProp = function(angle, plane) {this.rotateElement(PROP, angle, plane);}
// Slide an element a certain distance in a certain angle in a certain plane
Prop.prototype.translateElement = function(element, distance, angle, plane) {
	element = ELEMENTS[element];
	if (distance===0) {return;}
	if (plane === undefined) {plane = WALL;}
	var current = this[element].vectorize();
	var v = plane.reference().rotate(angle,plane);
	var x = current.x + v.x*distance;
	var y = current.y + v.y*distance;
	var z = current.z + v.z*distance;
	var translated = new Vector(x,y,z);
	translated = translated.spherify();
	this[element].azimuth = translated.azimuth;
	this[element].zenith = translated.zenith;
	this[element].radius = translated.radius;
}
Prop.prototype.translateHome = function(distance, angle, plane) {this.translateElement(HOME, distance, angle, plane);}
Prop.prototype.translatePivot = function(distance, angle, plane) {this.translateElement(PIVOT, distance, angle, plane);}
Prop.prototype.translatePivot = function(distance, angle, plane) {this.translateElement(HELPER, distance, angle, plane);}
Prop.prototype.translateHand = function(distance, angle, plane) {this.translateElement(HAND, distance, angle, plane);}
Prop.prototype.translateProp = function(distance, angle, plane) {this.translateElement(PROP, distance, angle, plane);}
// Get an element's angle in a certain plane
Prop.prototype.getElementAngle = function(element, plane) {
	element = ELEMENTS[element];
        if (this[element].radius==0) {return 0;}
        if (plane === undefined) {plane = WALL;}
        var ref = plane.reference();
        var projected = this[element].unitize().vectorize().project(plane);
        var angle = ref.between(projected);
        var tiny = ref.rotate(TINY,plane).between(projected);
        if (angle >= tiny) {
                return unwind(angle);
        } else {
                return unwind(-angle);
        }
} 
Prop.prototype.getHomeAngle = function(plane) {return this.getElementAngle(HOME, plane);}
Prop.prototype.getPivotAngle = function(plane) {return this.getElementAngle(PIVOT, plane);}
Prop.prototype.getHelperAngle = function(plane) {return this.getElementAngle(HELPER, plane);}
Prop.prototype.getHandAngle = function(plane) {return this.getElementAngle(HAND, plane);}
Prop.prototype.getPropAngle = function(plane) {return this.getElementAngle(PROP, plane);}
// Move the home coordinate of the prop using vector coordinates
Prop.prototype.nudge = function(x,y,z) {
	var v = new Vector(x,y,z);
	var s = v.spherify();
	this.home.radius = s.radius;
	this.home.zenith = s.zenith;
	this.home.azimuth = s.azimuth;
}
// Align one prop to another
Prop.prototype.orientToProp = function(prop) {
	for (var i = 0; i < this.elements.length; i++) {
		this.elements[i].radius = prop.elements[i].radius;
		this.elements[i].zenith = prop.elements[i].zenith;
		this.elements[i].azimuth = prop.elements[i].azimuth;
	}
	this.bend = prop.bend;
	this.axis = prop.axis;
	this.twist = prop.twist;
	this.grip = prop.grip;
	this.choke = prop.choke;
}

//// Methods for accessing and modifying the move queue
// The optional "abrupt" property determines whether the move gets automatically aligned to the prop
Prop.prototype.addMove = function(myMove) {
	if (myMove.abrupt == false) {
		if (this.move.submoves.length>0) {
			myMove.adjust(this.move.tail());
		} else {
			myMove.adjust(this);
		}
	}
	this.move.add(myMove);
}
// Remove all moves from the queue
Prop.prototype.emptyMoves = function() {
	while(this.move.submoves.length>0) {
		this.move.submoves.pop();
	}
}
// Drill down to the first move on the queue
Prop.prototype.head = function() {
	return this.move.head();
}
// Drill down to the last move on the queue
Prop.prototype.tail = function() {
	return this.move.tail();
}
// Modify the last move on the queue
Prop.prototype.modifyTail = function(options) {
	var tail = this.tail();
	var parent = tail.parent;
	if (parent !== this.move && parent.definition !== undefined) {
		parent.definition.modify_tail = options;
	}
	tail.modify(options);
}
//// Methods with complex functionality
// Predict where the prop will be when the entire queue has been spun
Prop.prototype.predict = function() {
	var dummy = new Prop();
	//dummy.dummitize();
	dummy.orientToProp(this);
	while (!this.move.finished) {
		this.move.spindummy(dummy);
	}
	this.move.reset();
	return dummy;
}
// Generate a MoveLink based on the prop's predicted position
Prop.prototype.socket = function(plane) {
	if (this.move.submoves.length===0) {
		if (plane == null) {plane = WALL;}
		var socket = new MoveLink();
		for (var i=PIVOT; i<=PROP; i++) {
			socket.elements[i].radius = this.elements[i].radius;
			socket.elements[i].speed = 0;
			socket.elements[i].linear_speed = 0;
			socket.elements[i].linear_angle = 0;
			socket.elements[i].rescale = 0;
			// this is clearly not ideal...maybe there should be a pickValidPlane?
			socket.elements[i].plane = plane;
			socket.elements[i].angle = this.getElementAngle(i, plane);
		}
		socket.twist = this.twist;
		socket.grip = this.grip;
		socket.choke = this.choke;
		socket.bend = this.bend;
		return socket;
	} else {
		return this.tail().socket();
	}
}
//// Get a three-dimensional vector representing the prop head or handle position
Prop.prototype.getVector = function(element) {
	if (this.move.submoves.length>0) {
		return (this.tail().socket().getVector(element));
	}
	var x = 0;
	var y = 0;
	var z = 0;
	var e;
	var v;
	// ignore HOME
	for (var i = PIVOT; i<=HAND; i++) {
		e = this.elements[i];
		v = e.vectorize();
		x += v.x;
		y += v.y;
		z += v.z;
	}
	v = this.prop.vectorize();
	// BEND
	v = v.rotate(this.bend,v.cross(this.axis));
	// GRIP
	x += 0.5*v.x;
	y += 0.5*v.y;
	z += 0.5*v.z;
	var vh = new Vector(x,y,z);
	v = v.rotate(this.grip,this.axis);
	// ignore TWIST
	if (element===HAND) {
		v = new Vector(vh.x-(this.choke+0.5)*v.x, vh.y-(this.choke+0.5)*v.y, vh.z-(this.choke+0.5)*v.z);
	} else if (element===PROP) {
		v = new Vector(x+0.5*v.x,y+0.5*v.y,z+0.5*v.z);
	}
	return v;
}
Prop.prototype.handVector = function() {
	return this.getVector(HAND);
}
Prop.prototype.propVector = function() {
	return this.getVector(PROP);
}


//////// A "MoveLink" is the simplest kind of movement.  It defines a single, continuous movement.
function MoveLink() {
	this.parent = null;
	this.movename = "not defined";
	// the default MoveLink is a clockwise static spin starting from the right
	this.elements = [];
	for (var i = HOME; i<=PROP; i++) {
		this.elements[i] = {
			speed: 0,
			acc: 0,
			linear_angle: THREE,
			linear_speed: 0,
			linear_acc: 0,
			rescale: 0,
			rescale_acc: 0,
			plane: WALL,
			radius: 0,
			angle: THREE
		}
		this[ELEMENTS[i]] = this.elements[i];
	}
	this.home.radius = null;
	this.home.plane = null;
	this.home.angle = null;
	this.prop.radius = 1;
	this.duration = 1;
	//this.twist = null;
	this.twist = 0;
	this.twist_speed = 0;
	this.grip = 0;
	this.grip_speed = 0; 
	this.choke = 0;
	this.choke_speed = 0; 
	this.bend = 0;
	this.bend_speed = 0;
	this.bend_acc = 0;
	// initialize the move
	this.t = 0;
	this.finished = false;
	this.started = false;
	// by default, the MoveLink is not removed from the parent queue when finished
	this.oneshot = false;
	// determines the default reorientation behavior of the move when added to a Prop
	this.abrupt = false; 
}
//// Modify one or more MoveLink parameters
MoveLink.prototype.modify = function(options) {
	this.duration = (options.duration !== undefined) ? options.duration : this.duration;
	this.pivot.angle = (options.pivot_angle!== undefined) ? options.pivot_angle : this.pivot.angle;
	this.pivot.plane = (options.pivot_plane !== undefined) ? options.pivot_plane : this.pivot.plane;
	this.pivot.radius = (options.pivot_radius !== undefined) ? options.pivot_radius : this.pivot.radius;
	this.pivot.speed = (options.pivot_speed !== undefined) ? options.pivot_speed : this.pivot.speed;
	this.pivot.acc = (options.pivot_acc !== undefined) ? options.pivot_acc : this.pivot.acc;
	this.pivot.linear_angle = (options.pivot_linear_angle !== undefined) ? options.pivot_linear_angle : this.pivot.linear_angle;
	this.pivot.linear_speed = (options.pivot_linear_speed !== undefined) ? options.pivot_linear_speed : this.pivot.linear_speed;
	this.pivot.linear_acc = (options.pivot_linear_acc !== undefined) ? options.pivot_linear_acc : this.pivot.linear_acc;
	this.pivot.rescale = (options.pivot_rescale !== undefined) ? options.pivot_rescale : this.pivot.rescale;
	this.pivot.rescale_acc = (options.pivot_rescale_acc !== undefined) ? options.pivot_rescale_acc : this.pivot.rescale_acc;
	this.helper.angle = (options.helper_angle!== undefined) ? options.helper_angle : this.helper.angle;
	this.helper.plane = (options.helper_plane !== undefined) ? options.helper_plane : this.helper.plane;
	this.helper.radius = (options.helper_radius !== undefined) ? options.helper_radius : this.helper.radius;
	this.helper.speed = (options.helper_speed !== undefined) ? options.helper_speed : this.helper.speed;
	this.helper.acc = (options.helper_acc !== undefined) ? options.helper_acc : this.helper.acc;
	this.helper.linear_angle = (options.helper_linear_angle !== undefined) ? options.helper_linear_angle : this.helper.linear_angle;
	this.helper.linear_speed = (options.helper_linear_speed !== undefined) ? options.helper_linear_speed : this.helper.linear_speed;
	this.helper.linear_acc = (options.helper_linear_acc !== undefined) ? options.helper_linear_acc : this.helper.linear_acc;
	this.helper.rescale = (options.helper_rescale !== undefined) ? options.helper_rescale : this.helper.rescale;
	this.helper.rescale_acc = (options.helper_rescale_acc !== undefined) ? options.helper_rescale_acc : this.helper.rescale_acc;
	this.hand.angle = (options.hand_angle!== undefined) ? options.hand_angle : this.hand.angle;
	this.hand.plane = (options.hand_plane !== undefined) ? options.hand_plane : this.hand.plane;
	this.hand.radius = (options.hand_radius !== undefined) ? options.hand_radius : this.hand.radius;
	this.hand.speed = (options.hand_speed !== undefined) ? options.hand_speed : this.hand.speed;
	this.hand.acc = (options.hand_acc !== undefined) ? options.hand_acc : this.hand.acc;
	this.hand.linear_angle = (options.hand_linear_angle !== undefined) ? options.hand_linear_angle : this.hand.linear_angle;
	this.hand.linear_speed = (options.hand_linear_speed !== undefined) ? options.hand_linear_speed : this.hand.linear_speed;
	this.hand.linear_acc = (options.hand_linear_acc !== undefined) ? options.hand_linear_acc : this.hand.linear_acc;
	this.hand.rescale = (options.hand_rescale !== undefined) ? options.hand_rescale : this.hand.rescale;
	this.hand.rescale_acc = (options.hand_rescale_acc !== undefined) ? options.hand_rescale_acc : this.hand.rescale_acc;
	this.prop.angle = (options.prop_angle!== undefined) ? options.prop_angle : this.prop.angle;
	this.prop.plane = (options.prop_plane !== undefined) ? options.prop_plane : this.prop.plane;
	this.prop.radius = (options.prop_radius !== undefined) ? options.prop_radius : this.prop.radius;
	this.prop.speed = (options.prop_speed !== undefined) ? options.prop_speed : this.prop.speed;
	this.prop.acc = (options.prop_acc !== undefined) ? options.prop_acc : this.prop.acc;
	this.prop.linear_angle = (options.prop_linear_angle !== undefined) ? options.prop_linear_angle : this.prop.linear_angle;
	this.prop.linear_speed = (options.prop_linear_speed !== undefined) ? options.prop_linear_speed : this.prop.linear_speed;
	this.prop.linear_acc = (options.prop_linear_acc !== undefined) ? options.prop_linear_acc : this.prop.linear_acc;
	this.prop.rescale = (options.prop_rescale !== undefined) ? options.prop_rescale : this.prop.rescale;
	this.prop.rescale_acc = (options.prop_rescale_acc !== undefined) ? options.prop_rescale_acc : this.prop.rescale_acc;
	this.twist = (options.twist !== undefined) ? options.twist : this.twist;
	this.twist_speed = (options.twist_speed !== undefined) ? options.twist_speed : this.twist_speed;
	this.grip = (options.grip !== undefined) ? options.grip : this.grip;
	this.grip_speed = (options.grip_speed !== undefined) ? options.grip_speed : this.grip_speed;
	this.choke = (options.choke !== undefined) ? options.choke : this.choke;
	this.choke_speed = (options.choke_speed !== undefined) ? options.choke_speed : this.choke_speed; 
	this.bend = (options.bend !== undefined) ? options.bend : this.bend;
	this.bend_speed = (options.bend_speed !== undefined) ? options.bend_speed : this.bend_speed;
	this.bend_acc = (options.bend_acc !== undefined) ? options.bend_acc : this.bend_acc;
	return this;
}

// A MoveLink is responsible for directly spinning a Prop
MoveLink.prototype.spin = function(prop, dummy) {
	// Currently, dummyspin for MoveLink is identical to normal spin
	if (this.started == false) {
		// the comment in the old version was wrong...this is telling the prop to adopt the move's starting position
		// the HOME plane should be the only thing we need to ever check.
		for (var i = HOME; i<=PROP; i++) {
			if (this.elements[i].plane !== null) {
				prop.setElementAngle(i, this.elements[i].angle, this.elements[i].plane);
				prop.elements[i].radius = this.elements[i].radius;
			}
		}
		// For a hoop or fan, the default grip is different in wall plane than it is in floor or wheel plane
		prop.twist = this.twist;
		prop.bend = this.bend;
		prop.choke = this.choke;
		prop.grip = this.grip;
		prop.axis = this.prop.plane;
		this.started = true;
	}
	if (this.duration==0) {this.finished = true; return;}
	this.finished = false;
	// Spin, slide, and plane-bend the prop frame by frame
	var v;
	// If we keep the default null "home" plane, we skip the entire "home" element
	for (var i = HOME; i<=PROP; i++) {
		if (this.elements[i].plane != null) {
			// rescale
			v = this.elements[i].rescale + this.elements[i].rescale_acc*this.t/BEAT;
			prop.elements[i].radius += v/BEAT;
			// rotation
			v = this.elements[i].speed + this.elements[i].acc*this.t/BEAT;
			prop.rotateElement(i, v*SPEED, this.elements[i].plane);
			// linear translation
			v = this.elements[i].linear_speed + this.elements[i].linear_acc*this.t/BEAT;
			prop.translateElement(i, v/BEAT, this.elements[i].linear_angle, this.elements[i].plane);
		}
	}
	//update the prop axis of the current move
	v = this.bend_speed + this.bend_acc*this.t/BEAT;
	prop.bend = unwind(prop.bend+v*SPEED);
	prop.twist = unwind(prop.twist+this.twist_speed);
	prop.grip = unwind(prop.grip+this.grip_speed);
	prop.choke += this.choke_speed; 
	this.t+=1;
	if (this.t >= this.duration*BEAT) {
		this.finished = true;
		this.t = 0;
	}
}
// Currently, dummyspin for MoveLink is identical to ordinary spin
MoveLink.prototype.spindummy = function(dprop) {
	this.spin(dprop, "dummy");
}
// Reset the MoveLink
MoveLink.prototype.reset = function() {
	this.started = false;
	this.finished = false;
	this.t = 0;
	return this;
}
// How many frames does the MoveLink have?
MoveLink.prototype.getDuration = function() {
	return this.duration;
}
// Choose whether the MoveLink removes itself from the parent queue when finished
MoveLink.prototype.setOneShot = function(tf) {
	this.oneshot = tf;
	return this;
}
// An "abrupt" MoveLink will not trigger reorientation when added to a prop
MoveLink.prototype.setAbrupt = function(tf) {
	tf = (tf == undefined) ? true : tf;
	this.abrupt = tf;
	return this;
}
// MoveLinks don't drill down any further, so they return themselves when their parent tries to drill down
MoveLink.prototype.head = function() {return this;}
MoveLink.prototype.tail = function() {return this;}
MoveLink.prototype.current = function() {return this;}
// Does nothing except return itself
	// ???is "refit" deprecated?
MoveLink.prototype.refit = function() {return this;}
// Set the starting angle to an angle
MoveLink.prototype.align = function(element, angle) {
	this[element].angle = angle;
	return this;
}
// ever used?
MoveLink.prototype.fitTo = function(move) {
	for (var i = HOME; i<=PROP; i++) {
		this.elements[i].plane = move.elements[i].plane;
		this.elements[i].radius = move.elements[i].radius;
		this.elements[i].angle = move.elements[i].angle;
	}
	return this;
}
// adjust the MoveLink to match a Prop or Move
	//??? Is this any good?  how should it work?
MoveLink.prototype.adjust = function(target) {
	if (target instanceof Prop) {
		// should this ever be adjusting HOME?
		for (var i = HOME; i<=PROP; i++) {
			if (target.elements[i].azimuth != null && this.elements[i].plane != null) {
				this.elements[i].angle = target.getElementAngle(i, this.elements[i].plane);
			}
		}
	} else if (target instanceof MoveChain || target instanceof MoveLink) {
		var tail = target.socket();
		for (var i = HOME; i<=PROP; i++) {
			//this.elements[i].plane = tail.elements[i].plane;
			// This actually seems like kind of a terrible idea, and has been a stumbling block so far
			//this.elements[i].angle = tail.elements[i].angle;
		}
	}
	return this;
}

// Create a perfect duplicate of this MoveLink
MoveLink.prototype.clone = function() {
	var newlink = new MoveLink();
	for (var i = HOME; i<=PROP; i++) {
		newlink.elements[i].plane = this.elements[i].plane;
		newlink.elements[i].radius = this.elements[i].radius;
		newlink.elements[i].angle = this.elements[i].angle;
		newlink.elements[i].speed = this.elements[i].speed;
		newlink.elements[i].acc = this.elements[i].acc;
		newlink.elements[i].linear_angle = this.elements[i].linear_angle;
		newlink.elements[i].linear_speed = this.elements[i].linear_speed;
		newlink.elements[i].linear_acc = this.elements[i].linear_acc;
		newlink.elements[i].rescale = this.elements[i].rescale;
		newlink.elements[i].rescale_acc = this.elements[i].rescale_acc;
	}
	newlink.duration = this.duration;
	newlink.bend = this.bend;
	newlink.bend_speed = this.bend_speed;
	newlink.bend_acc = this.bend_acc;
	newlink.twist = this.twist;
	newlink.twist_speed = this.twist_speed;
	newlink.grip = this.grip;
	newlink.grip_speed = this.grip_speed;
	newlink.choke = this.choke;
	newlink.choke_speed = this.choke_speed; 
	return newlink;
}

// Split this MoveLink into two pieces at a specified frame
MoveLink.prototype.split = function(t) {
	if (t<=0) {return [this,undefined];}
	if (t>=this.duration*BEAT) {return [this,undefined];}
        one = this.clone();
        two = this.clone();
        one.duration = t/BEAT;
		two.duration = this.duration-one.duration;
		two.fitTo(one.socket());
        return [one, two];
}

// Return a new MoveLink representing the end state of this MoveLink
MoveLink.prototype.socket = function() {
	var socket = this.clone();
	var dummy = new Prop();
	for (var i=0; i<socket.duration*BEAT; i++) {
		socket.spindummy(dummy);
	}
	// Reset the MoveLink so it's ready for the real Prop
	socket.reset();
	// Fit this move to the final position of the target move
	for (var i=HOME; i<=PROP; i++) {
		// only HOME should ever be null
		// If the radius of an element is explicitly null, return a null radius on the socket
		if (this.elements[i].radius !== null) {
			socket.elements[i].radius = dummy.elements[i].radius;
		}
		socket.elements[i].speed = this.elements[i].speed + this.duration * this.elements[i].acc;
		socket.elements[i].linear_speed = this.elements[i].linear_speed + this.duration * this.elements[i].linear_acc;
		socket.elements[i].linear_angle = this.elements[i].linear_angle;
		socket.elements[i].rescale = this.elements[i].rescale + this.duration * this.elements[i].rescale_acc;
		if (this.elements[i].plane != null) {
			if (this.elements[i].angle !== null) {
				socket.elements[i].angle = dummy.getElementAngle(i, this.elements[i].plane);
			}
			socket.elements[i].plane = this.elements[i].plane;
		}
	}
	socket.twist = dummy.twist;
	socket.grip = dummy.grip;
	socket.choke = dummy.choke;
	socket.bend = dummy.bend;
	socket.bend_speed = this.bend_speed + this.duration*this.bend_acc;
	return socket;
}

//// Return the MoveLink's starting handle or prop head position as a three-dimensional vector
MoveLink.prototype.getVector = function(element) {
	var x = 0;
	var y = 0;
	var z = 0;
	var e;
	var v;
	var radius;
	var angle;
	var plane;
	// ignore HOME
	for (var i = PIVOT; i<=HAND; i++) {
		e = new Spherical();
		radius = this.elements[i].radius;
		angle = this.elements[i].angle;
		plane = this.elements[i].plane;
		e.setRadiusAnglePlane(radius, angle, plane);
		v = e.vectorize();
		x += v.x;
		y += v.y;
		z += v.z;
	}
	radius = this.prop.radius;
	angle = this.prop.angle;
	plane = this.prop.plane;
	e.setRadiusAnglePlane(radius, angle, plane);
	v = e.vectorize();
	// BEND
	v = v.rotate(this.bend,v.cross(this.prop.plane));
	// GRIP
	x += 0.5*v.x;
	y += 0.5*v.y;
	z += 0.5*v.z;
	var vh = new Vector(x,y,z);
	v = v.rotate(this.grip,this.prop.plane);
	// ignore TWIST
	if (element===HAND) {
		v = new Vector(vh.x-(this.choke+0.5)*v.x, vh.y-(this.choke+0.5)*v.y, vh.z-(this.choke+0.5)*v.z);
	} else if (element===PROP) {
		v = new Vector(x+0.5*v.x,y+0.5*v.y,z+0.5*v.z);
	}
	return v;
}
MoveLink.prototype.handVector = function() {
	return this.getVector(HAND);
}
MoveLink.prototype.propVector = function() {
	return this.getVector(PROP);
}



//// A "MoveChain" is a queued tree of MoveLinks and other, nested MoveChains
// This allows a MoveChain to represent multiple kinds of movements in sequences
// !!!In theory, they are recursively composable, but that is not well-tested
function MoveChain() {
	this.parent = null;
	this.movename = "not defined";
	this.p = 0;
	this.oneshot = false;
	this.started = false;
	this.finished = false;
	this.abrupt = false; 
	this.submoves = [];
}

// Spinning a MoveChain sequentially spins the entire nested structure it contains
MoveChain.prototype.spin = function(prop, dummy) {
	// Initialize the MoveChain
	this.started = true;
	this.finished = false;
	if (this.submoves.length == 0) {
		this.reset();
		this.finished = true;
		return;
	}
	// Drill down to spin lower-level submoves
-	this.submoves[this.p].spin(prop);
	// Clean up after spinning the current submove
	if (this.submoves[this.p].finished) {
		// if this was a one-shot, remove it from the parent queue unless this is a dummy spin
		if (this.submoves[this.p].oneshot && !this.dummy) {
			this.submoves.splice(this.p,1);
		} else {
			this.p+=1;
		}
		if (this.p>=this.submoves.length) {
			this.reset();
			this.finished = true;
		}
	}
}
// Cycle through the move but do not remove it for being a oneshot
MoveChain.prototype.spindummy = function(dprop) {
	this.spin(dprop, "dummy");
}
// Rotate through submoves, changing which one comes first
	// Rarely use this on moves that are not "cyclical"; e.g. start and stop in the same position
MoveChain.prototype.phaseBy = function(phase) {
	if (phase==undefined) {phase = 1;}
	if (this.definition !== undefined) {
		if (this.definition.phase == undefined) {
			this.definition.phase = 0;
		} else {
			// this might not be quite right.
			this.definition.phase = (this.definition.phase + phase) % this.submoves.length;
		}
	}
	if (phase>0) {
		for (var i = 0; i<phase; i++) {
			this.submoves.push(this.submoves.shift());
		}
	} else if (phase<0) {
		for (var i = 0; i>phase; i--) {
			this.submoves.unshift(this.submoves.pop());
		}
	}
	return this;
}
//// Methods for traversing and modifying MoveChains
// Add a submove to the MoveChain
MoveChain.prototype.add = function(move) {
	move.parent = this;
	this.submoves.push(move);
	return this;
}
// Methods that drill down to a MoveLink
MoveChain.prototype.head = function() {
	if (this.submoves.length==0) {
		alert("Why zero length?!?");
	}
	return this.submoves[0].head();
}
MoveChain.prototype.tail = function() {
	if (this.submoves.length == 0) {
                return undefined;
        } 
	return this.submoves[this.submoves.length-1].tail();
}
MoveChain.prototype.socket = function() {
	return this.tail().socket();
}
MoveChain.prototype.current = function() {
	return this.submoves[this.p].current();
}
MoveChain.prototype.reset = function() {
	this.p = 0;
	this.finished = false;
	this.started = false;
	for(var i=0;i<this.submoves.length;i++) {
		this.submoves[i].reset();
	}
	return this;
}
MoveChain.prototype.getVector = function(element) {
	return this.head().getVector(element);
}
MoveChain.prototype.handVector = function() {
	return this.getVector(HAND);
}
MoveChain.prototype.propVector = function() {
	return this.getVector(PROP);
}
MoveChain.prototype.modify = function(options) {
	for (var i = 0; i < this.submoves.length; i++) {
		this.submoves[i].modify(options);
	}
	if (this.definition !== undefined) {
		this.definition.modify = options;
	} 
	return this;
}
// This convenience method clones the last MoveLink on the queue and adds it to the tail end of the MoveChain
MoveChain.prototype.extend = function() {
	var r = this.tail().socket();
	this.add(r);
	return r;
}
// Concatenate two MoveChains
MoveChain.prototype.concatenate = function(move) {
	for (var i=0; i<move.submoves.length; i++) {
		this.add(move.submoves[i]);
	}
	return this;
}
// Split a MoveChain into two MoveChains at a specific frame
MoveChain.prototype.split = function(t) {
	if (t<=0) {return [this,undefined];}
	if (t>=this.getDuration()*BEAT) {return [this,undefined];}
	var tally = 0;
	var found = false;
	var chain1 = new MoveChain();
	var chain2 = new MoveChain();
	var halves;
	// The split may or may not split a MoveLink or split between two MoveLinks
	for (var i=0; i<this.submoves.length; i++) {
		if (tally >= t) {this.abrupt = false; 
			chain2.add(this.submoves[i]);
		} else if (tally+this.submoves[i].getDuration()*BEAT > t) {
			halves = this.submoves[i].split(t-tally);
			chain1.add(halves[0]);
			chain2.add(halves[1]);			
		} else {
			chain1.add(this.submoves[i]);
		}
		tally+=this.submoves[i].getDuration()*BEAT;
	}
	return [chain1, chain2];
}
// Extract a MoveChain consisting of some of this MoveChain's submoves
MoveChain.prototype.slice = function(from, to) {
	var newMove = new MoveChain();
	for (var i = from; i < to; i++) {
		newMove.add(this.submoves[i].clone());
	}
	// didn't we originally want to keep it the same move?  anyway...
	newMove.definition = this.definition;
	return newMove;
}
// Creates a deep copy of the MoveChain
MoveChain.prototype.clone = function() {
	chain = new MoveChain();
	for(var i = 0; i<this.submoves.length; i++) {
		link = this.submoves[i].clone();
		chain.addlink(link);
	}
	return chain;
}

// Rotate the move until a specified element matches a specified angle
	// this tends to be used for parameterizing move "entry" angle
MoveChain.prototype.align = function(element, angle) {
	for (var i = 0; i<this.submoves.length; i++) {
		if (nearly(this.head()[element].angle, angle, 0.1)) {
			return this;
		} else {
			this.phaseBy(1);
		}
	}
	alert("alignment failed.");
	return this;
}
//// Methods with complex functionality
// Rotate the move until it matches a target Move or Prop
	// this tends to be used for the finer points of chaining moves together
MoveChain.prototype.adjust = function(target) {
	// If the move is set as "abrupt" it will be added no matter what
	if (this.abrupt) {return this;}
	// Otherwise we need to perform checks and adjustments
	var hand;
	var prop;
	hand = this.socket().handVector();
	prop = this.socket().propVector();
	// If the move is not "cyclical", then it's useless to try phasing through it, and we should reenter or reorient instead
	if (hand.nearly(this.handVector(),0.05) == false || prop.nearly(this.propVector(),0.1) == false) {
		return null;
	}
	if (target instanceof Prop) {
		hand = target.handVector();
		prop = target.propVector();
	} else if (target instanceof MoveLink || target instanceof MoveChain) {
		hand = target.socket().handVector();
		prop = target.socket().propVector();
	}
	for (var i = 0; i<this.submoves.length; i++) {
		// !!!Eventually we will want to account for grip, twist, choke, and bend
		if (hand.nearly(this.handVector(),0.05) && prop.nearly(this.propVector(),0.1)) {
			return this;
		} else {
			this.phaseBy(1);
		}
	}
	return null;
}
//// "reorient" is a more aggressive version of "adjust" that will scrap and rebuild the move in different orientations
MoveChain.prototype.reorient = function(target) {
	var retrn = this.adjust(target);
	// If it works to start with, don't mess with it
	if (retrn !== null) {return retrn;}
	var definition = this.definition;
	if (definition === undefined) {
		alert("Cannot reorient a move that has no attached definition.");
		return null;
	}
	var entry = definition.entry;
	var orient = definition.orient;
	if (entry === undefined || orient === undefined) {
		alert("Cannot reorient a move that has no defined orientation or entry.");
		return null;
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
				return redefined;
			}
			retrn = redefined.adjust(target);
			if (retrn !== null) {
				return retrn;
			}
		}
	}
	// Otherwise fail
	return null;
}
// I am no longer using this, but I will keep it around just in case
MoveChain.prototype.refit = function() {
	alert("still used?");
	for (var i = 1; i<this.submoves.length; i++) {
		this.submoves[i].fitTo(this.submoves[i-1].socket());
	}
	return this;
}

// A few handy setters and getters
MoveChain.prototype.setOneShot = function(tf) {
	this.oneshot = tf;
	return this;
}
MoveChain.prototype.setAbrupt = function(tf) {
	tf = (tf == undefined) ? true : tf;
	this.abrupt = tf;
	if (this.definition !== undefined) {
		this.definition.abrupt = tf;
	} 
	return this;
}
MoveChain.prototype.getDuration = function() {
	var tally = 0;
	for (var i = 0; i<this.submoves.length; i++) {
		tally+=this.submoves[i].getDuration();
	}
	return tally;
}




/////////// Factory functions to produce props and moves.  The user should either add methods or include a library of methods
function PropFactory() {}
PropFactory.prototype.defaults = function(options, defaults) {
	if (options===undefined) {options = {};}
	for (var option in options) {
		defaults[option] = options[option];
	}
	return defaults;
}
PropFactory.prototype.parse = function(json) {
	var definition = JSON.parse(json);
	return definition;
}
function MoveFactory() {
	this.options = {};
}
MoveFactory.prototype.defaults = function(options, defaults) {
	if (options===undefined) {options = {};}
	for (var option in options) {
		defaults[option] = options[option];
	}
	return defaults;
}

//// Serialization methods on factories, props, and moves
PropFactory.prototype.setPosition = function(prop, json) {
	var definition = PropFactory.prototype.parse(json);
	for (var i = HOME; i<=PROP; i++) {
		prop[ELEMENTS[i]].radius = definition[ELEMENTS[i]].radius;
		prop[ELEMENTS[i]].azimuth = definition[ELEMENTS[i]].azimuth;
		prop[ELEMENTS[i]].zenith = definition[ELEMENTS[i]].zenith;
	}
	prop.twist = definition.twist;
	prop.grip = definition.grip;
	prop.choke = definition.choke;
	prop.bend = definition.bend;
	prop.axis = new Vector(definition.axis.x, definition.axis.y, definition.axis.z);
}

// This does both moves and position, I want one that just does position
Prop.prototype.apply = function(json) {
	var definition = PropFactory.prototype.parse(json);
	for (var i = HOME; i<=PROP; i++) {
		this[ELEMENTS[i]].radius = definition[ELEMENTS[i]].radius;
		this[ELEMENTS[i]].azimuth = definition[ELEMENTS[i]].azimuth;
		this[ELEMENTS[i]].zenith = definition[ELEMENTS[i]].zenith;
	}
	this.twist = definition.twist;
	this.grip = definition.grip;
	this.choke = definition.choke;
	this.bend = definition.bend;
	if (definition.axis !== null) {
		this.axis = new Vector(definition.axis.x, definition.axis.y, definition.axis.z);
	}
	this.axis = definition.axis;
	this.propname = definition.propname;
}
Prop.prototype.applyMoves = function(json) {
	this.emptyMoves();
	var definition = PropFactory.prototype.parse(json);
	var jmove;
	for (var i = 0; i<definition.moves.length; i++) {
		jmove = JSON.stringify(definition.moves[i]);
		this.addMove(MoveFactory.prototype.build(jmove));
	}
}


///these methods should not be on the factories
Prop.prototype.stringify = function() {
	// This currently won't exist
	var definition = {	propname: this.propname,
					home: {},
					pivot: {},
					helper: {},
					hand: {},
					prop: {}
				};
	for (var i = HOME; i<=PROP; i++) {
		definition[ELEMENTS[i]].radius = this[ELEMENTS[i]].radius;
		definition[ELEMENTS[i]].azimuth = this[ELEMENTS[i]].azimuth;
		definition[ELEMENTS[i]].zenith = this[ELEMENTS[i]].zenith;
	}
	definition.twist = this.twist;
	definition.grip = this.grip;
	definition.choke = this.choke;
	definition.bend = this.bend;
	definition.axis = this.axis;
	definition.moves = [];
	for (var i = 0; i<this.move.submoves.length; i++) {
		definition.moves[i] = this.move.submoves[i].definition;
	}
	return JSON.stringify(definition);
}

MoveFactory.prototype.parse = function(json) {
	var definition = JSON.parse(json);
	// I check for undefined and null separately just as a matter of style
	if (definition.plane !== undefined && definition.plane !== null) {
		definition.plane = new Vector(definition.plane.x,definition.plane.y,definition.plane.z);
	}
	return definition;
}
MoveFactory.prototype.build = function(json) {
	var definition = this.parse(json);
	var move = this[definition.build](definition);
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
MoveLink.prototype.stringify = function() {
	if (this.definition !== undefined) {
		return JSON.stringify(this.definition);
	}
}
MoveChain.prototype.stringify = function() {
	if (this.definition !== undefined) {
		return JSON.stringify(this.definition);
	}
}
function isValidJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
return {
	MoveChain: function() {return new MoveChain();},
	MoveLink: function() {return new MoveLink();},
	Prop: function() {return new Prop();},
	PropFactory: function() {return new PropFactory();},
	MoveFactory: function() {return new MoveFactory();},
	Vector: function(x,y,z) {return new Vector(x,y,z);},
	Spherical: function(r,z,a) {return new Spherical(r,z,a);},
	Constants: Constants,
	Utilities: {unwind, nearly, isValidJSON},
	spinfail: Prop.prototype.spinfail
}
})();