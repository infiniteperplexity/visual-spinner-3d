// Constants used by the VisualSpinner3D engine
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
var NOOFFSET = 0;
var OFFSET = Math.PI;
var STAGGER = 0.5*Math.PI;
var QUARTER = 0.5*Math.PI;
var DIAMOND = 0;
var BOX = Math.PI;
var ZAXIS = new Vector(0,0,1);
var YAXIS = new Vector(0,-1,0);
var XAXIS = new Vector(1,0,0);
var XAXIS3 = [1,0,0];
var ZAXIS3 = [0,0,1];
var YAXIS3 = [0,-1,0];
var WALL = new Vector(0,0,1);
var WHEEL = new Vector(-1,0,0);
var FLOOR = new Vector(0,1,0);
var NWALL = new Vector(0,0,-1);
var NWHEEL = new Vector(1,0,0);
var NFLOOR = new Vector(0,-1,0);
var BEAT = 360;
var SPEED = UNIT/BEAT;
var TINY = 0.0001;

// A Vector can represent either a point or a plane, in 3D Cartesian coordinates
function Vector(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
}
Vector.prototype.isZero = function() {
	if (this.x==0 && this.y==0 && this.z==0) {
		return true;
	} else {
		return false;
	}
}
Vector.prototype.unitize = function() {
	if (this.isZero()) {return this;}	
	var len = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
	var x = this.x / len;
	var y = this.y / len;
	var z = this.z / len;
	return (new Vector(x,y,z));
}
Vector.prototype.diagonal = function(v) {
	return (new Vector(this.x + v.x, this.y + v.y, this.z + v.z)).unitize();
}
Vector.prototype.spherify = function() {
	var r = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
	var theta = Math.acos(this.z/r);
	var phi = Math.atan2(this.y,this.x);
	return (new Spherical(r,theta,phi));
}
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
Vector.prototype.project = function(axis) {
	var dot = this.x*axis.x + this.y*axis.y + this.z*axis.z;
	var x = this.x-dot*axis.x;
	var y = this.y-dot*axis.y;
	var z = this.z-dot*axis.z;
	return (new Vector(x,y,z));
}
Vector.prototype.reference = function() {
	//if thisis the floor plane or the zero vector, return THREE
	if (this.x==0 && this.z==0) {
		return (new Vector(1,0,0));
	}
	//otherwise, return the intersection of this and the floor plane in the first or second quadrant
	if (this.z > 0) {
		return (new Vector(this.z,0,-this.x)).unitize();
	} else {
		//return new Vector(-this.z,0,-this.x);
		return (new Vector(-this.z,0,this.x)).unitize();
	}
}
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
Vector.prototype.nearly = function(vector) {
	//checks to see whether two vectors or planes are nearly the same
	if (	Math.abs(Math.abs(this.x)-Math.abs(vector.x))<TINY
		&&	Math.abs(Math.abs(this.y)-Math.abs(vector.y))<TINY
		&&	Math.abs(Math.abs(this.z)-Math.abs(vector.z))<TINY) 
	{
		return true;
	} else {
		return false;
	}		
}

// A Spherical represents the spherical coordinates of a point
function Spherical(r, z, a) {
	this.radius = r;
	this.zenith = z;
	this.azimuth = a;
}
Spherical.prototype.vectorize = function() {
	var x = this.radius*Math.cos(this.azimuth)*Math.sin(this.zenith);
	var y = this.radius*Math.sin(this.azimuth)*Math.sin(this.zenith);
	var z = this.radius*Math.cos(this.zenith);
	return (new Vector(x,y,z));
}
Spherical.prototype.unitize = function() {
	return (new Spherical(1, this.zenith, this.azimuth));
}

// Make an angle unique
function unwind(angle) {
	while (angle<0) {angle+=UNIT;}
	angle%UNIT;
	return angle;
}

// Check whether two floating point values are almost equal
function nearly(n1,n2) {
	if (Math.abs(n1-n2)<TINY) {return true;}
	else {return false;}
}
// A prop handles the geometry for a number of spherical coordinates, a renderer, and a move queue
function Prop() {
	this.home = new Spherical(TINY,QUARTER,TINY);
	this.pivot = new Spherical(TINY,QUARTER,TINY);
	this.hand = new Spherical(TINY,QUARTER,TINY);
	this.prop = new Spherical(1,QUARTER,TINY);
	this.grip = new Spherical(0.5,QUARTER,TINY);
	this.roll = 0;
	this.renderer = undefined;
}
// Set an element to a particular spherical angle
Prop.prototype.setElementAngle = function(element, angle, plane) {
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
	// not a perfect fix
	if (element=="hand" && this[element].radius==0) {this[element].radius=TINY}
	if (plane === undefined) {plane = WALL;}
	//project the current vector onto the plane
	var projected = this[element].vectorize().project(plane);
	// not a perfect fix
	if (element=="hand" && projected.isZero()) {
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
	if (plane === undefined) {plane = WALL;}
	var current = this[element].vectorize();
	var v = plane.reference().rotate(angle,plane);
	var x = current.x + v.x*distance;
	var y = current.y + v.y*distance;
	var z = current.z + v.z*distance;
	var translated = new Vector(x,y,z);
	this[element] = translated.spherify();
}
Prop.prototype.translateHome = function(distance, angle, plane) {this.translateElement("home", distance, angle, plane);}
Prop.prototype.translatePivot = function(distance, angle, plane) {this.translateElement("pivot", distance, angle, plane);}
Prop.prototype.translateHand = function(distance, angle, plane) {this.translateElement("hand", distance, angle, plane);}
Prop.prototype.translateProp = function(distance, angle, plane) {this.translateElement("prop", distance, angle, plane);}
Prop.prototype.translateGrip = function(distance, angle, plane) {this.translateElement("grip", distance, angle, plane);}
// Get an element's angle in a certain plane
Prop.prototype.getElementAngle = function(element, plane) {
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


// Functions relating to the move queue
Prop.prototype.spin = function() {
	if (this.myMoveQueue === undefined) {
		this.myMoveQueue = new CompositeMove();
		this.myMoveQueue.myProp = this;
	}
	if (this.myMoveQueue.mySubMoves.length==0) {
		this.queueIsEmpty();
	}
	this.myMoveQueue.spin(this);
}
Prop.prototype.queueIsEmpty = undefined;//should be overridden by controller
Prop.prototype.addMove = function(myMove) {
	if (this.myMoveQueue === undefined) {
		this.myMoveQueue = new CompositeMove();
		this.myMoveQueue.myProp = this;
	}
	this.myMoveQueue.addMove(myMove);
}
Prop.prototype.getMoveQueue = function() {
	if (this.myMoveQueue === undefined) {
		this.myMoveQueue = new CompositeMove();
		this.myMoveQueue.myProp = this;
	}
	return(this.myMoveQueue);
}
Prop.prototype.addPartneredMove = function(otherProp, myMove) {
	this.addMove(myMove.getFirstMove());
	otherProp.addMove(myMove.getSecondMove());
}
Prop.prototype.render = function() {
	this.renderer.render(this);
}


function CompositeMove() {
	this.isStarted = false;
	this.isFinished = false;
	this.isOneShot = false;
	this.tally = 0;
	this.align = {prop: {}, hand: {}};
	this.finish = {prop: {}, hand: {}};
	this.hand = {};
	this.prop = {}
}
CompositeMove.prototype.getSubMoves = function() {
	if (this.mySubMoves === undefined) {this.mySubMoves = new Array();}
	return this.mySubMoves;
}

CompositeMove.prototype.resetSubMoves = function() {
	for(var i=0;i<this.mySubMoves.length;i++) {
		this.mySubMoves[i].isStarted = false;
		this.mySubMoves[i].isFinished = false;
	}
}
CompositeMove.prototype.getProp = function() {
	if (this.myParentMove === undefined) {return this.myProp;}
	return myParentMove.getProp();
}
CompositeMove.prototype.spin = function(myProp) {
	if (this.isStarted == false) {this.setup(myProp);}
	this.isStarted = true;
	this.isFinished = false;
	if (this.mySubMoves === undefined || this.mySubMoves.length == 0) {this.alert("bad move!"); return;}
	var nextMove = this.mySubMoves[0];
	nextMove.spin(myProp);
	if(nextMove.isFinished==true) {
		if (nextMove.isOneShot==true) {
			this.mySubMoves.shift();
		} else {
			this.mySubMoves.push(this.mySubMoves.shift());
		}
		if (this.mySubMoves.length==0 || this.mySubMoves[0].isFinished == true) {
			this.cleanup(myProp);
			this.isFinished = true;
			this.resetSubMoves();
		}
	}
}
CompositeMove.prototype.addMove = function(myMove) {
	if (this.mySubMoves === undefined) {this.mySubMoves = new Array();}
	this.mySubMoves.push(myMove);
}
CompositeMove.prototype.addSubMovesFrom = function(myMove) {
	if (this.mySubMoves === undefined) {this.mySubMoves = new Array();}
	if (myMove.mySubMoves === undefined) {myMove.mySubMoves = new Array();}
	this.mySubMoves = this.mySubMoves.concat(myMove.mySubMoves);
}
//Phasing
CompositeMove.prototype.newPhase = function() {
	var newPhase = new CompositeMove();
	this.addMove(newPhase);
	return newPhase;
}
CompositeMove.prototype.changePhase = function(phase) {
	if (phase>0) {
		for (var i = 0; i<phase; i++) {
			this.mySubMoves.push(this.mySubMoves.shift());
		}
	} else if (phase<0) {
		for (var i = 0; i<phase; i++) {
			this.mySubMoves.unshift(this.mySubMoves.pop());
		}
	}
	return this;
}
//Reflective Setters
//These probably won't work very well now that I have refactored
CompositeMove.prototype.setBeats = function(arg) {this.setReflect("setBeats",arg);}
CompositeMove.prototype.setHandSpeed = function(arg) {this.setReflect("setHandSpeed",arg);}
CompositeMove.prototype.setPropSpeed = function(arg) {this.setReflect("setPropSpeed",arg);}
CompositeMove.prototype.setHandRadius = function(arg) {this.setReflect("setHandRadius",arg);}
CompositeMove.prototype.setPropRadius = function(arg) {this.setReflect("setPropRadius",arg);}
CompositeMove.prototype.setReflect = function(meth, arg) {
	for(var i = 0; i < this.mySubMoves.length; i++) {this.mySubMoves[i][meth](arg);}
}
CompositeMove.prototype.getBeats = function() {
	var tally = 0;
	for(var i = 0; i < this.mySubMoves.length; i++) {tally+=this.mySubMoves[i].getBeats();}
	return tally;
}



function SimpleMove() {
	this.options;
	this.hand = new SpinElement(this, "hand");
	this.prop = new SpinElement(this, "prop");
	this.prop.radius = 1;
	this.hand.speed = 0;
	this.beats = 1;
	this.t = 0;
	this.isStarted = false;
	this.isFinished = false;
	this.align = {prop: {}, hand: {}};
	this.finish = {prop: {}, hand: {}};		
}
SimpleMove.prototype.getProp = function() {return this.myParentMove.getProp();}
SimpleMove.prototype.getSubMove = function() {return this;}
SimpleMove.prototype.getPosition = function() {return this.t/(BEAT*this.beats);}	
SimpleMove.prototype.spin = function(myProp) {
	if (this.isStarted == false) {this.setup(myProp);}
	this.isStarted = true;
	if (this.beats==0) {this.isFinished = true; return;}
	this.isFinished = false;
	this.hand.go(myProp);
	this.prop.go(myProp);
	this.t+=1;
	if (this.t >= this.beats*BEAT) {
		this.cleanup(myProp);
		this.isFinished = true;
		this.t = 0;}
}

function SpinElement(parent, element) {
        this.parent = parent;
        this.element = element;
        this.plane = WALL;
        this.begin_radius;
        this.end_radius;
        this.radius = 0;
        this.begin_speed;
        this.end_speed;
        this.speed = 1;
        this.begin_bend;
        this.end_bend;
        this.bend;
        this.bend_plane;
}
SpinElement.prototype.go = function(myProp) {
        this.spin(myProp);
        this.extend(myProp);
}
SpinElement.prototype.spin = function(myProp) {
        if (this.begin_speed!==undefined) {
                this.speed = this.begin_speed + this.parent.getPosition()*(this.end_speed - this.begin_speed);
        }
        if (this.begin_bend!==undefined) {
                this.bend = this.begin_bend + this.parent.getPosition()*(this.end_bend - this.begin_bend);
        }
        if (this.bend !==undefined) {
                this.plane = this.plane.rotate(this.bend*SPEED,this.bend_plane);
        }
        myProp.rotateElement(this.element,this.speed*SPEED,this.plane);
}
SpinElement.prototype.extend = function(myProp) {
        if (this.begin_radius!==undefined) {
                this.radius = this.begin_radius + this.parent.getPosition()*(this.end_radius - this.begin_radius);
        }
        myProp[this.element].radius = this.radius;
} 
function LinearElement(parent, element) {
	this.parent = parent;
	this.element = element;
	this.angle = 0;
	this.plane = WALL;	
	this.distance = 0;
	this.begin_speed;
	this.end_speed;
	this.speed = 1;
}
LinearElement.prototype.go = function(myProp) {
	if (this.begin_speed!==undefined) {
		this.speed = this.begin_speed + this.parent.getPosition()*(this.end_speed - this.begin_speed);
	}
	myProp.translateElement(this.element,this.speed/BEAT,this.angle,this.plane);
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

SimpleMove.prototype.setup = function(myProp) {
	setup.call(this, myProp);
}
CompositeMove.prototype.setup = function(myProp) {
	setup.call(this, myProp);
}
function setup(myProp) {
	var hand_plane;
	var prop_plane;
	if (this.align.hand.radius !== undefined) {
		myProp.hand.radius = this.align.hand.radius;
	}
	if (this.align.prop.radius !== undefined) {
		myProp.prop.radius = this.align.prop.radius;
	}
	if (this.align.hand.plane === undefined) {
		hand_plane = this.hand.plane;
	} else {
		hand_plane = this.align.hand.plane;
	}
	if (this.align.prop.plane === undefined) {
		prop_plane = this.prop.plane;
	} else {
		prop_plane = this.align.prop.plane;
	}
	if (this.align.hand.angle !== undefined) {
		myProp.setHandAngle(this.align.hand.angle,hand_plane);
	}
	if (this.align.prop.angle !== undefined) {
		myProp.setPropAngle(this.align.prop.angle,prop_plane);
	}
	if (this.align.prop.offset!==undefined) {
		myProp.setPropAngle(myProp.getHandAngle(hand_plane)+this.align.prop.offset, hand_plane);
	}
	if (this.align.prop.tilt !== undefined) {
		this.prop.plane = myProp.hand.unitize().vectorize().rotate(this.align.prop.tilt, hand_plane);
		prop_plane = this.prop.plane;
	}
	if (prop_plane !== undefined) {
		if (prop_plane.nearly(WALL)) {
			myProp.grip = 0;
		} else if (prop_plane.nearly(WHEEL) || prop_plane.nearly(FLOOR)) {
			myProp.grip = STAGGER;
		} else {
			myProp.grip = prop_plane.between(WALL);
		}
	}
	if (this.align.phase !== undefined) {
		this.changePhase(this.align.phase);
	}
	var nangles = [THREE,SIX,NINE,TWELVE];
	var angles = ["THREE","SIX","NINE","TWELVE"];
	var lookup;
	for (var i = 0; i<angles.length; i++) {
		if (this.align[angles[i]]!==undefined && nearly(myProp.getHandAngle(this.hand.plane),[nangles[i]])) {
			lookup = angles[i];
		}
	}
	if (this.mySubMoves !== undefined) {
		for (var i = 0; i<this.mySubMoves.length; i++) {
			if (this.align["PHASE"+i]!==undefined && this.options.phase==i) {
				lookup = "PHASE"+i;
			}
		}
	}
	if (lookup !== undefined) {
		if (this.align[lookup].hand !== undefined && this.align[lookup].hand.radius !== undefined) {
			myProp.hand.radius = this.align[lookup].hand.radius;
		}
		if (this.align[lookup].prop !== undefined && this.align[lookup].prop.radius !== undefined) {
			myProp.prop.radius = this.align[lookup].prop.radius;
		}
		if (this.align[lookup].hand === undefined || this.align[lookup].hand.plane === undefined) {
			hand_plane = this.hand.plane;
		} else {
			hand_plane = this.align[lookup].hand.plane;
		}
		if (this.align[lookup].prop === undefined || this.align[lookup].prop.plane === undefined) {
			prop_plane = this.prop.plane;
		} else {
			prop_plane = this.align[lookup].prop.plane;
		}
		if (this.align[lookup].hand !== undefined && this.align[lookup].hand.angle !== undefined) {
			myProp.setHandAngle(this.align[lookup].hand.angle,hand_plane);
		}
		if (this.align[lookup].prop !== undefined && this.align[lookup].prop.angle !== undefined) {
			myProp.setPropAngle(this.align[lookup].prop.angle,prop_plane);
		}
		if (this.align[lookup].prop !== undefined && this.align[lookup].prop.offset!==undefined) {
			myProp.setPropAngle(myProp.getHandAngle(hand_plane)+this.align[lookup].prop.offset, hand_plane);
		}
		if (this.align[lookup].phase !== undefined) {
			this.changePhase(this.align[lookup].phase);
		}
		if (this.align[lookup].prop !== undefined && this.align[lookup].prop.tilt !== undefined) {
			this.prop.plane = myProp.hand.vectorize().rotate(this.align[lookup].prop.tilt, myProp.hand.vectorize());
		}
	}
}
SimpleMove.prototype.cleanup = function(myProp) {
	cleanup.call(this, myProp);
}
CompositeMove.prototype.cleanup = function(myProp) {
	cleanup.call(this, myProp);
}
function cleanup(myProp) {
	var hand_plane;
	var prop_plane;
	if (this.align.hand.plane === undefined) {
		hand_plane = this.hand.plane;
	} else {
		hand_plane = this.align.hand.plane;
	}
	if (this.align.prop.plane === undefined) {
		prop_plane = this.prop.plane;
	} else {
		prop_plane = this.align.prop.plane;
	}
	if (this.finish.hand.rotate !== undefined) {
		myProp.rotateHand(this.finish.hand.rotate, hand_plane);
	}
	if (this.finish.prop.rotate !== undefined) {
		myProp.rotateProp(this.finish.prop.rotate, hand_plane);
	}
}

function SimpleLinear() {
	var myMove = new SimpleMove();
	myMove.hand = new LinearElement(myMove,"hand");
	return myMove;
}

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
