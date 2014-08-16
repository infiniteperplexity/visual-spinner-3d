//// Human-readable constants used by the VisualSpinner3D engine
var UNIT = 2 * Math.PI;
var SAME = 0;
var SPLIT = Math.PI;
var TOGETHER = 0;
var OPPOSITE = Math.PI;
var CLOCKWISE = 1;
var COUNTERCLOCKWISE = -1;
var INSPIN = 1;
var ANTISPIN = -1;
var FORWARD = 1;
var BACKWARD = -1;
var ISOBEND = 1;
var ANTIBEND = -1;
var PROBEND = 3; 
var NOSPIN = 0;
var STATIC = 0;
var TWELVE = 1.5*Math.PI;
var THREE = 0;
var SIX = 0.5*Math.PI;
var NINE = Math.PI;
var NEAR = 0;
var FAR = Math.PI;
var DOWN = 0.5*Math.PI;
var UP = 1.5*Math.PI;
var NOOFFSET = 0;
var OFFSET = Math.PI;
var STAGGER = 0.5*Math.PI;
var QUARTER = 0.5*Math.PI;
var DIAMOND = 0;
var BOX = Math.PI;
var XAXIS = [1,0,0];
var ZAXIS = [0,0,1];
var YAXIS = [0,-1,0];
var WALL = new Vector(0,0,1);
var WHEEL = new Vector(1,0,0);
var FLOOR = new Vector(0,1,0);
var NWALL = new Vector(0,0,-1);
var NWHEEL = new Vector(-1,0,0);
var NFLOOR = new Vector(0,-1,0);
var BEAT = 360;
var SPEED = UNIT/BEAT;
var TINY = 0.0001;

var HOME = 0;
var PIVOT = 1;
var HAND = 2;
var PROP = 3;
var GRIP = 4;
var ELEMENTS = ["home","pivot","hand","prop","grip"];

//// A Vector can represent either a point or a plane, in 3D Cartesian coordinates
function Vector(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
}
/// Vector helper methods
// Check whether the Vector is exaclty zero, which often causes math errors
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
	if (axis==undefined) {
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
// Project a vector onto a plane (defined by axis)
Vector.prototype.project = function(axis) {
	if (axis==undefined) {
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
Vector.prototype.toArray = function() {
	return [this.x,this.y,this.z];
}
// Test equality of vectors within rounding error
Vector.prototype.nearly = function(vector, delta) {
	if (delta===undefined) {
		delta = TINY;
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
Spherical.prototype.fromAnglePlane = function(radius, angle, plane) {
	var s = new Spherical();
	s.radius = radius;
	if (plane === undefined) {plane = WALL;}
	var v = plane.reference().rotate(angle,plane).unitize();
	s.zenith = unwind(Math.acos(v.z/Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z)));
	s.azimuth = unwind(Math.atan2(v.y,v.x));;
	return s;
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
	angle%UNIT;
	return angle;
}
// Check whether two floating point values are almost equal
function nearly(n1,n2, delta) {
	if (delta===undefined) {
		delta = TINY;
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
	this.name = undefined;
	// These elements define the Prop's position
	// "hand" and "prop" are used in almost every move
	// "home" should be used when the spinner's body is moving, e.g. walking around
	// "pivot" is used to displace a move when the spinner's body is not moving
	// "grip" is thus far not used
	this.home = new Spherical(TINY,QUARTER,TINY);
	this.pivot = new Spherical(TINY,QUARTER,TINY);
	this.hand = new Spherical(TINY,QUARTER,TINY);
	this.prop = new Spherical(1,QUARTER,TINY);
	this.grip = new Spherical(0.5,QUARTER,TINY);
	//this.elements = ["home","pivot","hand","prop","grip"];
	this.elements = [this.home, this.pivot, this.hand, this.prop, this.grip];
	// "roll", which I may rename to "twist", has no effect for poi, but for hoop or fans it represents twisting the grip
	this.roll = 0;
	// "renderer" is specific to a type of prop and a viewing interface
	this.renderer = undefined;
	// "move" is the queue of moves associated with the Prop
	this.move = new MoveChain();
}
// Set an element to a particular spherical angle
Prop.prototype.setElementAngle = function(element, angle, plane) {
	if (typeof element == "number") {
		element = ELEMENTS[element];
	}
	if (plane === undefined) {plane = WALL;}
	var v = plane.reference().rotate(angle,plane).unitize();
	this[element].zenith = unwind(Math.acos(v.z/Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z)));
	this[element].azimuth = unwind(Math.atan2(v.y,v.x));
}
Prop.prototype.setHomeAngle = function(angle, plane) {this.setElementAngle("home", angle, plane);}
Prop.prototype.setPivotAngle = function(angle, plane) {this.setElementAngle("pivot", angle, plane);}
Prop.prototype.setHandAngle = function(angle, plane) {this.setElementAngle("hand", angle, plane);}
Prop.prototype.setPropAngle = function(angle, plane) {this.setElementAngle("prop", angle, plane);}
Prop.prototype.setGripAngle = function(angle, plane) {this.setElementAngle("grip", angle, plane);}
// Rotate an element by a particular angle in a particular plane
Prop.prototype.rotateElement = function(element, angle, plane) {
	if (typeof element == "number") {
		element = ELEMENTS[element];
	}
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
Prop.prototype.rotateHome = function(angle, plane) {this.rotateElement("home", angle, plane);}
Prop.prototype.rotatePivot = function(angle, plane) {this.rotateElement("pivot", angle, plane);}
Prop.prototype.rotateHand = function(angle, plane) {this.rotateElement("hand", angle, plane);}
Prop.prototype.rotateProp = function(angle, plane) {this.rotateElement("prop", angle, plane);}
Prop.prototype.rotateGrip = function(angle, plane) {this.rotateElement("grip", angle, plane);}
// Slide an element a certain distance in a certain angle in a certain plane
Prop.prototype.translateElement = function(element, distance, angle, plane) {
	if (typeof element == "number") {
		element = ELEMENTS[element];
	}
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
Prop.prototype.translateHome = function(distance, angle, plane) {this.translateElement("home", distance, angle, plane);}
Prop.prototype.translatePivot = function(distance, angle, plane) {this.translateElement("pivot", distance, angle, plane);}
Prop.prototype.translateHand = function(distance, angle, plane) {this.translateElement("hand", distance, angle, plane);}
Prop.prototype.translateProp = function(distance, angle, plane) {this.translateElement("prop", distance, angle, plane);}
Prop.prototype.translateGrip = function(distance, angle, plane) {this.translateElement("grip", distance, angle, plane);}
// Get an element's angle in a certain plane
Prop.prototype.getElementAngle = function(element, plane) {
	if (typeof element == "number") {
		element = ELEMENTS[element];
	}
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
Prop.prototype.getHomeAngle = function(plane) {return this.getElementAngle("home", plane);}
Prop.prototype.getPivotAngle = function(plane) {return this.getElementAngle("pivot", plane);}
Prop.prototype.getHandAngle = function(plane) {return this.getElementAngle("hand", plane);}
Prop.prototype.getPropAngle = function(plane) {return this.getElementAngle("prop", plane);}
Prop.prototype.getGripAngle = function(plane) {return this.getElementAngle("grip", plane);}
// Generate a vector based on an element's cumulative position, skipping the HOME coordinates
Prop.prototype.getVector = function(element) {
	var x = 0;
	var y = 0;
	var z = 0;
	var e;
	var v;
	for (var i = PIVOT; i<=element; i++) {
		e = this.elements[i];
		if (e.radius !== undefined) {
			v = e.vectorize();
			x += v.x;
			y += v.y;
			z += v.z;
		}
	}
	return (new Vector(x,y,z));
}
Prop.prototype.handVector = function() {
	return this.getVector(HAND);
}
Prop.prototype.propVector = function() {
	return this.getVector(PROP);
}


// We might want to revisit the name of this at some point
Prop.prototype.orientToProp = function(prop) {
	for (var i = 0; i < this.elements.length; i++) {
		this.elements[i].radius = prop.elements[i].radius;
		this.elements[i].zenith = prop.elements[i].zenith;
		this.elements[i].azimuth = prop.elements[i].azimuth;
	}
}

// Move the home coordinate of the prop using vector coordinates
Prop.prototype.nudge = function(x,y,z) {
	var v = new Vector(x,y,z);
	var s = v.spherify();
	this.home.radius = s.radius;
	this.home.zenith = s.zenith;
	this.home.azimuth = s.azimuth;
}
//// Functions relating to the move queue
// Tell the prop to spin
Prop.prototype.spin = function() {
	if (this.move.submoves.length==0) {
		this.spinfail();
	} else {
		this.move.spin(this);
	}
}
//  Predict where the prop will be when the entire queue has been spun
Prop.prototype.predict = function() {
	var dummy = new Prop();
	dummy.dummitize();
	dummy.orientToProp(this);
	while (!this.move.finished) {
		this.move.spindummy(dummy);
	}
	this.move.reset();
	return dummy;
}
// Trying to spin with an empty queue might produce different results in different implementations, e.g. populating with a default move
Prop.prototype.spinfail = function() {
	alert("please override spinfail()");
	//user should override
}
// Call the renderer
Prop.prototype.render = function() {
	this.renderer.render(this);
}
// The optional "fixed" parameter allows you to choose whether the Prop respects the Move's starting position
Prop.prototype.addMove = function(myMove, fix) {
	if (fix!==true && fix!=="fixed" && fix!=="fix") {
		if (this.move.submoves.length>0) {
			myMove.reorient(this.move.tail());
		} else {
			myMove.reorient(this);
		}
	}
	this.move.add(myMove);
}
Prop.prototype.addFixedMove = function(move) {
	this.addMove(move,true);
}

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
// Add a multi-prop move to this and at least one other prop
Prop.prototype.addPartnership = function(partneredMove, otherPropsWithCommas, fix) {
	var tf = false;
	if (!(arguments[arguments.length-1] instanceof Prop)) {
		tf = arguments[arguments.length-1];
	}
	this.addMove(partneredMove[0], tf);
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] instanceof Prop) {
			arguments[i].addMove(partneredMove[i], tf);
		}
	}
}
Prop.prototype.dummitize = function() {
	for (var i = HOME; i<=GRIP; i++) {
		this.elements[i].radius = undefined;
		this.elements[i].zenith = undefined;
		this.elements[i].azimuth = undefined;
	}
	return this;
}

//// A "MoveLink" is the simplest kind of movement.  It defines a single, continuous movement.
function MoveLink() {
	this.name = "not defined";
	// the default MoveLink is a clockwise static spin starting from the right
	this.elements = [];
	for (var i = HOME; i<=GRIP; i++) {
		this.elements[i] = {
			speed: 0,
			acc: 0,
			bend: 0,
			bend_plane: WALL,
			linear_angle: THREE,
			linear_speed: 0,
			linear_acc: 0
		}
		if (i==PIVOT || i==HAND || i==PROP) {
			this.elements[i].plane = WALL;
			this.elements[i].radius = 0;
			this.elements[i].angle = THREE;
		}
		this[ELEMENTS[i]] = this.elements[i];
	}
	this.prop.radius = 1;
	this.duration = 1;
	this.roll = undefined;
	// initialize the move
	this.t = 0;
	this.finished = false;
	this.started = false;
	// by default, the MoveLink is not removed from the parent queue when finished
	this.oneshot = false;
}
// A MoveLink is responsible for directly spinning a Prop
MoveLink.prototype.spin = function(prop, dummy) {
	// Currently, dummyspin for MoveLink is identical to normal spin
	// When you start spinning, reposition the Prop to the starting position of the MoveLink
	if (this.started == false) {
		// If the MoveLink has no starting position, adopt the Prop's current position
		for (var i = HOME; i<=GRIP; i++) {
			if (this.elements[i].angle !== undefined && this.elements[i].plane !== undefined) {
				prop.setElementAngle(i, this.elements[i].angle, this.elements[i].plane);
			}
			if (this.elements[i].radius !== undefined) {
				prop.elements[i].radius = this.elements[i].radius;
			}
		}
		// For a hoop or fan, the default grip is different in wall plane than it is in floor or wheel plane
		if (this.roll === undefined) {
			if (this.prop.plane === undefined) {
				this.roll = 0;
			} else if (this.prop.plane.nearly(WALL)) {
				this.roll = 0;
			} else if (this.prop.plane.nearly(WHEEL)  || this.prop.plane.nearly(FLOOR)) {
				this.roll = STAGGER;
			} else {
				this.roll = 0;
			}	
		} 
		prop.roll = this.roll;
		this.started = true;
	}
	if (this.duration==0) {this.finished = true; return;}
	this.finished = false;
	// Spin, slide, and plane-bend the prop frame by frame
	var v;
	var p;
	for (var i = HOME; i<=GRIP; i++) {
		if (this.elements[i].plane !== undefined) {
			p = this.elements[i].plane.rotate(this.elements[i].bend*this.t*SPEED, this.elements[i].bend_plane);
			v = this.elements[i].linear_speed + this.elements[i].linear_acc*this.t/BEAT;
			prop.translateElement(i, v/BEAT, this.elements[i].linear_angle, p);
			v = this.elements[i].speed + this.elements[i].acc*this.t/BEAT;
			prop.rotateElement(i, v*SPEED, p);
		}
	}
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
	return this;
}
// How many frames does the MoveLink have?
MoveLink.prototype.getDuration = function() {return this.duration;}
// Choose whether the MoveLink removes itself from the parent queue when finished
MoveLink.prototype.setOneShot = function(tf) {
	this.oneshot = tf;
	return this;
}
// MoveLinks don't drill down any further, so they return themselves when their parent tries to drill down
MoveLink.prototype.head = function() {return this;}
MoveLink.prototype.tail = function() {return this;}
MoveLink.prototype.current = function() {return this;}
// Does nothing except return itself
MoveLink.prototype.refit = function() {return this;}
// Set the starting angle to an angle
MoveLink.prototype.reangle = function(element, angle) {
	this[element].angle = angle;
	return this;
}		
// Reorient the MoveLink to match a Prop or Move
MoveLink.prototype.reorient = function(target) {
	if (target instanceof Prop) {
		for (var i = HOME; i<=GRIP; i++) {
			if (target.elements[i].azimuth !== undefined && this.elements[i].plane !== undefined) {
				this.elements[i].angle = target.getElementAngle(i, this.elements[i].plane);
			}
		}
	} else if (target instanceof MoveChain || target instanceof MoveLink) {
		// !!!This is a *seriously* kludgy way to get the final angle and plane...
		var tail = target.tail().clone();
		tail.fitTail(target.tail());
		for (var i = HOME; i<=GRIP; i++) {
			this.elements[i].plane = tail.elements[i].plane;
			this.elements[i].angle = tail.elements[i].angle;
		}
	}
	return this;
}
// Create a perfect duplicate of this MoveLink
MoveLink.prototype.clone = function() {
	newlink = new MoveLink();
	for (var i = HOME; i<=GRIP; i++) {
		newlink.elements[i].plane = this.elements[i].plane;
		newlink.elements[i].radius = this.elements[i].radius;
		newlink.elements[i].angle = this.elements[i].angle;
		newlink.elements[i].speed = this.elements[i].speed;
		newlink.elements[i].acc = this.elements[i].acc;
		newlink.elements[i].linear_angle = this.elements[i].linear_angle;
		newlink.elements[i].linear_speed = this.elements[i].linear_speed;
		newlink.elements[i].linear_acc = this.elements[i].linear_acc;
		newlink.elements[i].bend = this.elements[i].bend;
		newlink.elements[i].bend_plane = this.elements[i].bend_plane;
	}
	newlink.duration = this.duration;
	newlink.roll = this.roll;
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
		two.fitTail(one);
        return [one, two];
}
MoveLink.prototype.tailVector = function(element) {
	// The most reliable way to predict the position is to do an actual run through a "dummy" Prop
	var dummy = new Prop();
	dummy.dummitize();
	for (var i=0; i<this.duration*BEAT; i++) {
		this.spindummy(dummy);
	}
	// Reset the MoveLink so it's ready for the real Prop
	this.reset();
	// Return one of the Prop element's position vectors
	return dummy.getVector(element);
}
MoveLink.prototype.headVector = function(element) {
	//this is a truly bizarre way to accomplish this task
	var dummy = new Prop();
	for (var i = PIVOT; i <= element; i++) {
		if (this.elements[i].angle !== undefined && this.elements[i].plane !== undefined) {
			dummy.setElementAngle(i, this.elements[i].angle, this.elements[i].plane);
		}
		if (this.elements[i].radius !== undefined) {
			dummy.elements[i].radius = this.elements[i].radius;
		}
	}
	return dummy.getVector(element);
}
MoveLink.prototype.headHandVector = function() {
	return this.headVector(HAND);
}
MoveLink.prototype.headPropVector = function() {
	return this.headVector(PROP);
}
MoveLink.prototype.tailHandVector = function() {
	return this.tailVector(HAND);
}
MoveLink.prototype.tailPropVector = function() {
	return this.tailVector(PROP);
}
// getVector defaults to tailVector, not headVector
MoveLink.prototype.getVector = function(element) {
	return this.tailVector(element);
}
MoveLink.prototype.handVector = function() {
	return this.getVector(HAND);
}
MoveLink.prototype.propVector = function() {
	return this.getVector(PROP);
}
MoveLink.prototype.fitTail = function(move) {
	move = move.tail();
	// The most reliable way to predict the position is to do an actual run through a "dummy" Prop
	var dummy = new Prop();
	dummy.dummitize();
	for (var i=0; i<move.duration*BEAT; i++) {
		move.spindummy(dummy);
	}
	// Reset the MoveLink so it's ready for the real Prop
	move.reset();
	// Fit this move to the final position of the target move
	for (var i=HOME; i<=GRIP; i++) {
		this.elements[i].radius = dummy.elements[i].radius;
		this.elements[i].speed = move.elements[i].speed + move.duration * move.elements[i].acc;
		this.elements[i].linear_speed = move.elements[i].linear_speed + move.duration * move.elements[i].linear_acc;
		this.elements[i].linear_angle = move.elements[i].linear_angle;
		if (move.elements[i].plane !== undefined) {
			p = move.elements[i].plane.rotate(move.elements[i].bend * move.duration*UNIT, move.elements[i].bend_plane);
			this.elements[i].angle = dummy.getElementAngle(i, p);
			this.elements[i].plane = p;
		}
	}
}

//// A "MoveChain" is a queued tree of MoveLinks and other, nested MoveChains
// This allows a MoveChain to represent multiple kinds of movements in sequences
function MoveChain() {
	this.name = "not defined";
	this.p = 0;
	this.oneshot = false;
	this.started = false;
	this.finished = false;
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

// Will this move remove itself from the parent move queue after spinning?
MoveChain.prototype.setOneShot = function(tf) {
	this.oneshot = tf;
	return this;
}
// Add a submove to the MoveChain
MoveChain.prototype.add = function(move) {
	this.submoves.push(move);
	return this;
}
// Concatenate two MoveChains
MoveChain.prototype.concatenate = function(move) {
	for (var i=0; i<move.submoves.length; i++) {
		this.submoves.push(move.submoves[i]);
	}
	return this;
}



// Extract a MoveChain consisting of some of this MoveChain's submoves
MoveChain.prototype.slice = function(from, to) {
	var newMove = new MoveChain();
	for (var i = from; i < to; i++) {
		newMove.add(this.submoves[i].clone());
	}
	return newMove;
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
		if (tally >= t) {
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
// Rotate through submoves, changing which one comes first
MoveChain.prototype.phaseBy = function(phase) {
	//this currently trusts that the head and tail of the move fit together
	if (phase===undefined) {phase = 1;}
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

// Rotate the move until a specified element matches a specified angle
MoveChain.prototype.reangle = function(element, angle) {
	//first we try this the easy way...
	for (var i = HOME; i<GRIP; i++) {
		if (nearly(this.head()[element].angle, angle, 0.1)) {
			return this;
		} else {
			this.phaseBy(1);
		}
	}
	//...then we try it the hard way...
	var dummy = new Prop();
	dummy.dummitize();
	var d = this.getDuration()*BEAT;
	var ts = [];
	for (var i =0; i<d; i++) {
		this.spindummy(dummy);
		if (nearly(dummy.getElementAngle(element,this.current()[element].plane), angle, 0.1)) {
			ts.push(i);
		}
	}
	this.reset();
	var halves;
	if (ts.length>0) {
		halves = this.split(ts[0]);
		halves[1].concatenate(halves[0]);
		this.submoves = halves[1].submoves;
		return this;
	}
	//...and if that doesn't work we just give up.
	alert("alignment failed.");
	return this;
}

// Rotate the move until it matches a target Move or Prop
MoveChain.prototype.reorient = function(target) {
	var hand = target.handVector();
	var prop = target.propVector();
	//first we try this the easy way...
	for (var i = 0; i<this.submoves.length; i++) {
		if (hand.nearly(this.headHandVector(),0.05) && prop.nearly(this.headPropVector(),0.1)) {
			return this;
		} else {
			this.phaseBy(1);
		}
	}
	
	//...then we try it the hard way...
	var dummy = new Prop();
	dummy.dummitize();
	var d = this.getDuration()*BEAT;
	var ts = [];
	for (var i =0; i<d; i++) {
		this.spindummy(dummy);
		if (hand.nearly(this.headHandVector(),0.05) && prop.nearly(this.headPropVector(),0.1)) {
			ts.push(i);
		}
	}
	this.reset();
	var halves;
	if (ts.length>0) {
		halves = this.split(ts[0]);
		halves[1].concatenate(halves[0]);
		this.submoves = halves[1].submoves;
		return this;
	}
	
	//...and if that doesn't work we just give up.
	alert("alignment failed.");
	return this;
}

// This convenience method clones the last MoveLink on the queue and adds it to the tail end of the MoveChain
MoveChain.prototype.extend = function() {
	newlink = this.tail().clone();
	newlink.fitTail(this);
	this.add(newlink);
	return newlink;
}
//// Many MoveChain methods simply drill down to MoveLink methods of the same name
MoveChain.prototype.reset = function() {
	this.p = 0;
	this.finished = false;
	this.started = false;
	for(var i=0;i<this.submoves.length;i++) {
		this.submoves[i].reset();
	}
	return this;
}
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
MoveChain.prototype.current = function() {
	return this.submoves[this.p].current();
}
MoveChain.prototype.getDuration = function() {
	var tally = 0;
	for (var i = 0; i<this.submoves.length; i++) {
		tally+=this.submoves[i].getDuration();
	}
	return tally;
}
MoveChain.prototype.clone = function() {
	chain = new MoveChain();
	for(var i = 0; i<this.submoves.length; i++) {
		link = this.submoves[i].clone();
		chain.addlink(link);
	}
	return chain;
}
MoveChain.prototype.tailVector = function(element) {
	return this.tail().tailVector(element);
}
MoveChain.prototype.tailHandVector = function() {
	return this.tailVector(HAND);
}
MoveChain.prototype.tailPropVector = function() {
	return this.tailVector(PROP);
}
MoveChain.prototype.headVector = function(element) {
	return this.head().headVector(element);
}
MoveChain.prototype.headHandVector = function() {
	return this.headVector(HAND);
}
MoveChain.prototype.headPropVector = function() {
	return this.headVector(PROP);
}

// getVector defaults to tailVector, not headVector
MoveChain.prototype.getVector = function(element) {
	return this.tailVector(element);
}
MoveChain.prototype.handVector = function() {
	return this.getVector(HAND);
}
MoveChain.prototype.propVector = function() {
	return this.getVector(PROP);
}
MoveChain.prototype.fitTail = function(move) {
	move = move.tail();
	var head = this.head();
	head.fitTail(move);
	this.refit();
}
// I am no longer using this, but I will keep it around just in case
MoveChain.prototype.refit = function() {
	for (var i = 1; i<this.submoves.length; i++) {
		this.submoves[i].fitTail(this.submoves[i-1]);
	}
	return this;
}
//// Factory functions to produce props and moves.  The user should either add methods or include a library of methods
function PropFactory() {}
PropFactory.prototype.defaults = function(options, defaults) {
	if (options===undefined) {options = {};}
	for (var option in defaults) {
		if (options[option]===undefined) {
			options[option] = defaults[option];
		}
	}
	return options;
}
function MoveFactory() {
	this.options = {};
}
MoveFactory.prototype.defaults = function(options, defaults) {
	if (options===undefined) {options = {};}
	for (var option in defaults) {
		if (options[option]===undefined) {
			options[option] = defaults[option];
		}
	}
	return options;
}


