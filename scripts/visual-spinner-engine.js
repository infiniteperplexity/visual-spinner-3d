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
Vector.prototype.nearly = function(vector, delta) {
	if (delta===undefined) {
		delta = TINY;
	}
	//checks to see whether two vectors or planes are nearly the same
	if (	Math.abs(Math.abs(this.x)-Math.abs(vector.x))<delta
		&&	Math.abs(Math.abs(this.y)-Math.abs(vector.y))<delta
		&&	Math.abs(Math.abs(this.z)-Math.abs(vector.z))<delta) 
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
// A prop handles the geometry for a number of spherical coordinates, a renderer, and a move queue
function Prop() {
	this.home = new Spherical(TINY,QUARTER,TINY);
	this.pivot = new Spherical(TINY,QUARTER,TINY);
	this.hand = new Spherical(TINY,QUARTER,TINY);
	this.prop = new Spherical(1,QUARTER,TINY);
	this.grip = new Spherical(0.5,QUARTER,TINY);
	this.elements = ["home","pivot","hand","prop","grip"];
	this.roll = 0;
	this.renderer = undefined;
	this.move = new MoveChain();
	
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
	if (distance===0) {return;}
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

Prop.prototype.nudge = function(x,y,z) {
        var v = new Vector(x,y,z);
        var s = v.spherify();
        this.home = s;
}

// Functions relating to the move queue
Prop.prototype.spin = function() {
	this.move.spin(this);
}
Prop.prototype.addMove = function(myMove) {
	this.move.add(myMove);
}
Prop.prototype.chainMove = function(myMove) {
        var tail = this.tail();
        if (tail == undefined) {
                tail = {};
                for (var i = 0; i < this.elements.length; i++) {
                        tail[this.elements[i]] = {};
                        tail[this.elements[i]].plane = myMove.head()[this.elements[i]].plane;
                }
        } else {
                tail = tail.tailsocket();
        }
        var head = myMove.head();
        for (var i = 0; i < this.elements.length; i++) {
                head[this.elements[i]].radius = undefined;
                head[this.elements[i]].angle = undefined;
                head[this.elements[i]].plane = tail[this.elements[i]].plane;        
        }        
        myMove.refit();
        this.move.add(myMove);
} 
Prop.prototype.head = function() {
	return this.move.head();
}
Prop.prototype.tail = function() {
	return this.move.tail();
}
Prop.prototype.addPartneredMove = function(otherProp, myMove) {
	this.addMove(myMove.getFirstMove());
	otherProp.addMove(myMove.getSecondMove());
}
Prop.prototype.render = function() {
	this.renderer.render(this);
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


function MoveChain() {
	this.p = 0;
	this.oneshot = false;
	this.started = false;
	this.finished = false;
	this.submoves = [];
}
MoveChain.prototype.takesubs = function(from, to) {
	var newMove = new MoveChain();
	for (var i = from; i < to; i++) {
		newMove.add(this.submoves[i].clone());
	}
	return newMove;
}
MoveChain.prototype.spin = function(prop, dummy) {
	if (dummy===undefined) {dummy = false;}
	this.started = true;
	this.finished = false;
	if (this.submoves.length == 0) {
		this.reset();
		this.finished = true;
		return;
	}
	this.submoves[this.p].spin(prop, dummy);
	if (this.submoves[this.p].finished) {
		if (this.submoves[this.p].oneshot && dummy==false) {
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

MoveChain.prototype.add = function(move) {
	force_align = false;
	if (force_align == true || this.submoves.length==0 || this.tail().fits(move.head())) {
		this.submoves.push(move);
	}
}
MoveChain.prototype.append = function(move) {
	for (var i=0; i<move.submoves.length; i++) {
		this.submoves.push(move.submoves[i]);
	}
	return this;
}
MoveChain.prototype.head = function() {return this.submoves[0].head();}
MoveChain.prototype.tail = function() {
	if (this.submoves.length == 0) {
                return undefined;
        } 
	return this.submoves[this.submoves.length-1].tail();
}
MoveChain.prototype.current = function() {return this.submoves[this.p].current();}
MoveChain.prototype.getDuration = function() {
	var tally = 0;
	for (var i = 0; i<this.submoves.length; i++) {
		tally+=this.submoves[i].getDuration();
	}
	return tally;
}
MoveChain.prototype.phaseby = function(phase) {
	//this currently trusts that the head and tail sockets fit
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
MoveChain.prototype.alignprop = function(prop) {
	return this.head().alignprop(prop);
}
MoveChain.prototype.angleto = function(element, target) {
	//first we try this the easy way...
	for (var i = 0; i<this.submoves.length; i++) {
		if (nearly(this.head()[element].angle, target,0.01)) {
			return this;
		} else {
			this.phaseby(1);
		}
	}
	//...then we try it the hard way...
	var dummy = new Prop();
	var d = this.getDuration()*BEAT;
	var ts = [];
	for (var i =0; i<d; i++) {
		this.spin(dummy, true);
		if (nearly(dummy.getElementAngle(element,this.current()[element].plane),target,0.01)) {
			ts.push(i);
		}
	}
	this.reset();
	var halves;
	if (ts.length>0) {
		halves = this.split(ts[0]);
		halves[1].append(halves[0]);
		this.submoves = halves[1].submoves;
		return this;
	}
	//...and if that doesn't work we just give up.
	alert("alignment failed.");
	return this;
}
MoveChain.prototype.reset = function() {
	this.p = 0;
	this.finished = false;
	this.started = false;
	for(var i=0;i<this.submoves.length;i++) {
		this.submoves[i].reset();
	}
}
MoveChain.prototype.clone = function() {
	chain = new MoveChain();
	for(var i = 0; i<this.submoves.length; i++) {
		link = this.submoves[i].clone();
		chain.addlink(link);
	}
	return chain;
}
MoveChain.prototype.fits = function(move) {
	return this.head().fits(move.tail());
}
MoveChain.prototype.headsocket =function() {
	return this.submoves[0].headsocket();
}
MoveChain.prototype.tailsocket = function() {
	return this.submoves[this.submoves.length-1].tailsocket();
}
MoveChain.prototype.fitsocket = function(socket) {
	this.submoves[0].fitsocket(socket);
	this.refit();
}
MoveChain.prototype.refit = function() {
	for (var i = 1; i<this.submoves.length; i++) {
		this.submoves[i].fitsocket(this.submoves[i-1].tailsocket());
	}
}
MoveChain.prototype.extend = function() {
	newlink = this.tail().clone();
	newlink.fitsocket(this.tailsocket());
	this.add(newlink);
	return newlink;
}
MoveChain.prototype.split = function(t) {
	if (t<=0) {return [this,undefined];}
	if (t>=this.getDuration()*BEAT) {return [this,undefined];}
	var tally = 0;
	var found = false;
	var chain1 = new MoveChain();
	var chain2 = new MoveChain();
	var halves;
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


function MoveLink() {
	this.elements = ["home","pivot","hand","prop","grip"];
	for (var i = 0; i<this.elements.length; i++) {
		if (this.elements[i]=="home" || this.elements[i]=="grip") {
			this[this.elements[i]] = {
				speed: 0,
				acc: 0,
				bend: 0,
				bend_plane: WALL,
				linear_angle: THREE,
				linear_speed: 0,
				linear_acc: 0
			};
		} else {
			this[this.elements[i]] = {
				plane: WALL,
				radius: 0,
				angle: THREE,
				speed: 0,
				acc: 0,
				bend: 0,
				bend_plane: WALL,
				linear_angle: THREE,
				linear_speed: 0,
				linear_acc: 0
			};
		}
	}
	this.roll = undefined;
	this.prop.radius = 1;
	this.duration = 1;
	this.t = 0;
	this.finished = false;
	this.started = false;
}
MoveLink.prototype.head = function() {return this;}
MoveLink.prototype.tail = function() {return this;}
MoveLink.prototype.current = function() {return this;}
MoveLink.prototype.getDuration = function() {return this.duration;}
MoveLink.prototype.spin = function(prop) {
	if (this.started == false) {
		for (var i = 0; i<this.elements.length; i++) {
			if (this[this.elements[i]].angle !== undefined && this[this.elements[i]].plane !== undefined) {
				prop.setElementAngle(this.elements[i], this[this.elements[i]].angle, this[this.elements[i]].plane);
			}
			if (this[this.elements[i]].radius !== undefined) {
				prop[this.elements[i]].radius = this[this.elements[i]].radius;
			}
		}
		if (this.roll === undefined) {
                        if (this.prop.plane === undefined) {
                                this.roll = 0;
                        } else if (this.prop.plane.nearly(WALL)) {
                                this.roll = 0;
                        } else if (this.prop.plane.nearly(WHEEL)  || this.prop.plane.nearly(FLOOR)) {
                                this.roll = STAGGER;
                        }
                } 
		prop.roll = this.roll;
		this.started = true;
	}
	if (this.duration==0) {this.finished = true; return;}
	this.finished = false;
	var v;
	var p;
	for (var i = 0; i<this.elements.length; i++) {
		if (this[this.elements[i]].plane !== undefined) {
			p = this[this.elements[i]].plane.rotate(this[this.elements[i]].bend*this.t*SPEED, this[this.elements[i]].bend_plane);
			v = this[this.elements[i]].linear_speed + this[this.elements[i]].linear_acc*this.t/BEAT;
			prop.translateElement(this.elements[i], v/BEAT, this[this.elements[i]].linear_angle, p);
			v = this[this.elements[i]].speed + this[this.elements[i]].acc*this.t/BEAT;
			prop.rotateElement(this.elements[i], v*SPEED, p);
		}
	}
	this.t+=1;
	if (this.t >= this.duration*BEAT) {
		this.finished = true;
		this.t = 0;
	}
}

MoveLink.prototype.reset = function() {
	this.started = false;
	this.finished = false;
}


MoveLink.prototype.tailsocket = function() {
	var dummy = new Prop();
	for (var i=0; i<this.elements.length; i++) {
		if (this[this.elements[i]].angle !== undefined && this[this.elements[i]].plane !== undefined) {
			dummy.setElementAngle(this.elements[i], this[this.elements[i]].angle, this[this.elements[i]].plane);
		}
		if (this[this.elements[i]].radius !== undefined) {
			dummy.radius = this.elements[i].radius;
		}
	}
	for (var i=0; i<this.duration*BEAT; i++) {
		this.spin(dummy);
	}
	this.reset();
	var socket = {};
	var p;
	for (var i=0; i<this.elements.length; i++) {
		
		socket[this.elements[i]] = {};
		if (this[this.elements[i]].radius !== undefined) {
			socket[this.elements[i]].radius = dummy[this.elements[i]].radius;
		}
		socket[this.elements[i]].speed = this[this.elements[i]].speed+this.duration*this[this.elements[i]].acc;
		socket[this.elements[i]].linear_speed = this[this.elements[i]].linear_speed+this.duration*this[this.elements[i]].linear_acc;
		if (this[this.elements[i]].plane !== undefined) {
			p = this[this.elements[i]].plane.rotate(this[this.elements[i]].bend*this.duration*UNIT, this[this.elements[i]].bend_plane);
			socket[this.elements[i]].angle = dummy.getElementAngle(this.elements[i], p);
			socket[this.elements[i]].plane = p;
		}
		//should I have a socket for the angle?
	}
	return socket;
}

MoveLink.prototype.headsocket = function() {
	var socket = {};
	var properties = ["plane", "radius", "speed", "acc", "angle", "bend", "bend_plane", "linear_angle", "linear_speed", "linear_acc"];
	for (var i = 0; i<this.elements.length; i++) {
		socket[this.elements[i]] = {};
		for (var j = 0; j<properties.length; j++) {
			socket[this.elements[i]][properties[j]] = this[this.elements[i]][properties[j]];
		}
	}
	return socket;
}

MoveLink.prototype.refit = function() {
        //do nothing but don't fail
}

MoveLink.prototype.fitsocket = function(socket) {
	var properties = ["plane","radius","speed","angle","linear_speed"];
	for (var i = 0; i<this.elements.length; i++) {
		for (var j = 0; j<properties.length; j++) {
			this[this.elements[i]][properties[j]] = socket[this.elements[i]][properties[j]];
		}
	}	
}

MoveLink.prototype.clone = function() {
	newlink = new MoveLink();
	var properties = ["plane", "radius", "speed", "acc", "angle", "bend", "bend_plane", "linear_angle", "linear_speed", "linear_acc"];
	for (var i = 0; i<this.elements.length; i++) {
		for (var j = 0; j<properties.length; j++) {
			newlink[this.elements[i]][properties[j]] = this[this.elements[i]][properties[j]];
		}
	}
	newlink.duration = this.duration;
	newlink.roll = this.roll;
	return newlink;
}
MoveLink.prototype.fits = function(move) {
	// this will eventually be a complex check
	return true;
}
MoveLink.prototype.split = function(t) {
	if (t<=0) {return [this,undefined];}
	if (t>=this.duration*BEAT) {return [this,undefined];}
        one = this.clone();
        two = this.clone();
        one.duration = t/BEAT;
	two.duration = this.duration-one.duration;
        two.fitsocket(one.tailsocket());
        return [one, two];
}
MoveLink.prototype.alignprop = function(prop) {
	for (var i=0; i<this.elements.length; i++) {
		prop.setElementAngle(this.elements[i], this[this.elements[i]].angle, this[this.elements[i]].plane);
		prop.radius = this.elements[i].radius;
	}
	return prop;
}
MoveLink.prototype.angleto = function(element, target) {
	this[element] = target;
}
