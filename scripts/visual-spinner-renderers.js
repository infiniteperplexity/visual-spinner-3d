"use strict";
function PhoriaPropRenderer(scene) {
	this.scene = scene;
	this.shapes = [];
	this.options = {};
}
PhoriaPropRenderer.prototype.render = function(myProp) {
	// new matrix centered on the origin
	var mat = mat4.create();
	// rotate and translate according to "home", "pivot", "helper", and "hand"
	for (i = 0; i<=HAND; i++) {
		mat4.rotate(mat, mat, myProp[ELEMENTS[i]].azimuth, ZAXIS);
		mat4.rotate(mat, mat, myProp[ELEMENTS[i]].zenith, YAXIS);
		mat4.translate(mat, mat, [0,0,myProp[ELEMENTS[i]].radius]);
		mat4.rotate(mat, mat, -myProp[ELEMENTS[i]].zenith, YAXIS);
		mat4.rotate(mat, mat, -myProp[ELEMENTS[i]].azimuth, ZAXIS);
	}
	mat4.rotate(mat, mat, myProp.prop.azimuth, ZAXIS);
	mat4.rotate(mat, mat, myProp.prop.zenith, YAXIS);
	// this should probably go off some kind of unitize, sqrt(x*y),z system...
	if (myProp.axis.nearly(WALL)) {
		//mat4.rotate(mat, mat, -myProp.bend, YAXIS);
		mat4.rotate(mat, mat, -myProp.bend, FLOOR.rotate(myProp.bend_angle, FLOOR).toArray());
	} else if (myProp.axis.nearly(WHEEL)) {
		if (myProp.prop.azimuth <= 0.5*Math.PI) {
			mat4.rotate(mat, mat, -myProp.bend, XAXIS);
		} else {
			mat4.rotate(mat, mat, myProp.bend, XAXIS);
		}
	} else if (myProp.axis.nearly(FLOOR)) {
		if (myProp.prop.azimuth >= 0.5*Math.PI && myProp.prop.azimuth <= 1.5*Math.PI) {
			mat4.rotate(mat, mat, myProp.bend, XAXIS);
		} else {
			mat4.rotate(mat, mat, -myProp.bend, XAXIS);
		}
	}
	// prop radius should be handled by prop-specific renderers
	mat4.rotate(mat, mat, myProp.grip, XAXIS);
	mat4.translate(mat, mat, [0,0,-myProp.choke]);
	mat4.rotate(mat, mat, myProp.twist, ZAXIS);
	for (var i=0; i<this.shapes.length; i++) {
		this.shapes[i].matrix = mat;
		PropFactory.prototype.rescale(this.shapes[i], myProp.prop.radius);
	}
}
PhoriaPropRenderer.prototype.activate = function(scene) {
	for (var i = 0; i<this.shapes.length; i++) {
		this.scene.graph.push(this.shapes[i]);
	}
}
PhoriaPropRenderer.prototype.deactivate = function(scene) {
	for (var i = 0; i<this.shapes.length; i++) {
		if (this.scene.graph.indexOf(this.shapes[i])!==-1) {
			this.scene.graph.splice(this.scene.graph.indexOf(this.shapes[i]),1);
		}
	}
}

PropFactory.prototype.translatePoints = function(shape, vector) {
	var point;
	var points = [];
	if (shape.points!==undefined) {
		points = shape.points;
	} else if (shape.position!==undefined) {
		points = [shape.position];
	}
	for (var i=0; i<points.length; i++) {
		point = points[i];
		point.x += vector[0];
		point.y += vector[1];
		point.z += vector[2];
	}
	return shape;
}

PropFactory.prototype.rescale= function(shape, scale) {
	if (shape.currscale == undefined) {
		shape.currscale = 1;
	}
	var point;
	var points = [];
	if (shape.points!==undefined) {
		points = shape.points;
	} else if (shape.position!==undefined) {
		points = [shape.position];
	}
	// for shapes such as poi tethers or staves
	if (shape.scaleEffect === "stretch") {
		for (var i=0; i<points.length; i++) {
			points[i].z = scale*points[i].z/ shape.currscale;
		}
	}
	else if (shape.scaleEffect === "slide") {
		for (var i=0; i<points.length; i++) {
			if (points[i].z > 0) {
				points[i].z = points[i].z - shape.currscale + scale;
			} else if (points[i].z < 0) {
				points[i].z = points[i].z + shape.currscale - scale;
			}
		}
	}
	shape.currscale = scale;
}
PropFactory.prototype.swapPoints = function(shape, a, b) {
	var point;
	var points = [];
	if (shape.points!==undefined) {
		points = shape.points;
	} else if (shape.position!==undefined) {
		points = [shape.position];
	}
	var c;
	if (a===undefined) {a="x";}
	if (b===undefined) {b="y";}
	for (var i=0; i<points.length; i++) {
		point = points[i];
		c = point[a];
		point[a] = point[b];
		point[b] = c;
	}
	return shape;
}


PropFactory.prototype.colormap= function(s) {
	if (s=="red") {
		return [255,0,0];
	} else if (s=="blue") {
		return [0,128,255];
	} else if (s=="yellow") {
		return [255,255,0];
	} else if (s=="green") {
		return [0,255,0];
	} else if(s=="gray" || s=="grey") {
		return [128,128,128];
	} else if (s=="white") {
		return [255,255,255];
	} else if (s=="orange") {
		return [255,128,0];
	} else if (s=="fire") {
		return [128,64,32];
	} else if (s.split(",").length === 3) {
		return [parseInt(s.split(",")[0]), parseInt(s.split(",")[1]), parseInt(s.split(",")[2])];
	}
	else {
		return [255,255,255];
	}	
}
PropFactory.prototype.colorflame = function(s) {
	if (s=="red") {
		return [32, "rgba(256,32,64,1)", "rgba(256,32,64,0)"];
	} else if (s=="blue") {
		return [32, "rgba(64,64,256,1)", "rgba(64,64,256,0)"];
	} else if (s=="yellow") {
		return [32, "rgba(64,64,32,1)", "rgba(64,64,32,0)"];
	} else if (s=="green") {
		return [32, "rgba(64,128,64,1)", "rgba(64,128,64,0)"];
	} else if(s=="gray" || s=="grey") {
		return [32, "rgba(128,64,32,1)", "rgba(128,64,32,0)"];
	} else if (s=="white") {
		return [32, "rgba(128,64,32,1)", "rgba(128,64,32,0)"];
	} else if (s=="fire") {
		return [32, "rgba(128,64,32,1)", "rgba(128,64,32,0)"];
	} else {
		return [32, "rgba(128,64,32,1)", "rgba(128,64,32,0)"];
	}	
}

PropFactory.prototype.trail = function(size, color) {
	if (size===undefined) {size = 7;}
	if (color===undefined) {color = [32, "rgba(128,64,32,1)", "rgba(128,64,32,0)"];}
	var texture = Phoria.Util.generateRadialGradientBitmap(color[0],color[1],color[2]);
	var f = Phoria.EmitterEntity.create({
		position: {x:0, y:0, z:0},
		positionRnd: {x:0, y:0, z:0},
		rate: 25,
		velocity: {x:0, y:0, z:0},
		velocityRnd: {x:0.1, y:0.1, z:0.1},
		lifetime: 2500,
		lifetimeRnd: 500,
		gravity: false,
		style: {
			compositeOperation: "lighter",
			shademode: "sprite",
			linewidth: size,
			objectsortmode: "front",
			sprite: 0
		}
	});
	f.textures[0] = texture;
	return f;
}


PropFactory.prototype.flame = function(size, color) {
	if (size===undefined) {size = 7;}
	if (color===undefined) {color = [32, "rgba(128,64,32,1)", "rgba(128,64,32,0)"];}
	var texture = Phoria.Util.generateRadialGradientBitmap(color[0],color[1],color[2]);
	var f = Phoria.EmitterEntity.create({
		position: {x:0, y:0, z:0},
		positionRnd: {x:0.1, y:0.1, z:0.1},
		rate: 25,
		velocity: {x:0, y:0.015, z:0},
		velocityRnd: {x:0.025, y:0.025, z:0.025},
		lifetime: 500,
		lifetimeRnd: 50,
		gravity: false,
		style: {
			compositeOperation: "lighter",
			shademode: "sprite",
			linewidth: size,
			objectsortmode: "front",
			sprite: 0
		}
	});
	f.textures[0] = texture;
	return f;
}

PropFactory.prototype.cylinder = function(thickness, length, facets) {
	var c = Phoria.Util.generateCylinder(thickness,length,facets);
	var cylinder = Phoria.Entity.create({
		points: c.points,
		edges: c.edges,
		polygons: c.polygons
	});
	// Can anyone remember why I swapped points to the z-axis instead of the more intuitive x-axis?
	// ...because I sure can't...
	this.swapPoints(cylinder,"y","z");
	return cylinder;
}

PropFactory.prototype.sphere = function(size, facets) {
	var s = Phoria.Util.generateSphere(size,facets,facets);
	var sphere = Phoria.Entity.create({
			points: s.points,
			edges: s.edges,
			polygons: s.polygons
	});
	return sphere;
}

PropFactory.prototype.poi = function(options) {
	var p = new Prop();
	p.renderer = this.poirender(options);
	p.renderer.activate();
	return p;
}
PropFactory.prototype.poirender = function(options) {
	options = this.defaults(options,{
		scene: undefined,
		fire: false,
		handle_color: "gray",
		head_color: "red",
		flame_color: "fire",
		tether_size: 0.001,
		tether_detail: 3,
		handle_size: 0.05,
		head_size: 0.2,
		handle_detail: 3,
		head_detail: 8	
	});
	var r = new PhoriaPropRenderer(options.scene);
	r.options = options;
	var handle = this.sphere(options.handle_size, options.handle_detail);
	var tether = this.cylinder(options.tether_size, 1, options.tether_detail);
	tether.scaleEffect = "stretch";
	this.translatePoints(tether,[0,0,0.5]);
	var ball = this.sphere(options.head_size, options.head_detail);
	ball.scaleEffect = "slide";
	this.translatePoints(ball,[0,0,1]);
	handle.style.color = this.colormap(options.handle_color);
	tether.style.color = this.colormap(options.handle_color);
	r.shapes.push(handle);
	r.shapes.push(tether);
	r.shapes.push(ball);
	var flame;
	if (options.fire==true) {
		ball.style.color = this.colormap(options.handle_color);
		flame = this.flame(35*options.head_size, this.colorflame(options.flame_color));
		flame.scaleEffect = "slide";
		this.translatePoints(flame,[0,0,1]);
		r.shapes.push(flame);
	} else {
		ball.style.color = this.colormap(options.head_color);
	}
	return r;
}

PropFactory.prototype.staff = function(options) {
	var p = new Prop();
	p.renderer = this.staffrender(options);
	p.renderer.activate();
	return p;
}
PropFactory.prototype.staffrender = function(options) {
	options = this.defaults(options,{
		scene: undefined,
		fire: false,
		handle_color: "gray",
		head_color: "red",
		flame_color: "fire",
		handle_size: 0.025,
		handle_detail: 8
	});
	var r = new PhoriaPropRenderer(options.scene);
	r.options = options;
	var staff= this.cylinder(options.handle_size, 2, options.handle_detail);
	staff.scaleEffect = "stretch";
	staff.style.color = this.colormap(options.head_color)
	r.shapes.push(staff);
	var handle = this.cylinder(options.handle_size+0.01, 0.1, options.handle_detail);
	handle.style.color = this.colormap(options.head_color)
	r.shapes.push(handle);
	var flame1;
	var flame2;
	if (options.fire==true) {
		flame1 = this.flame(7, this.colorflame("fire"));
		flame2 = this.flame(7, this.colorflame("fire"));
		flame1.scaleEffect = "slide";
		flame2.scaleEffect = "slide";
		this.translatePoints(flame1,[0,0,1]);
		this.translatePoints(flame2,[0,0,-1]);
		r.shapes.push(flame1);
		r.shapes.push(flame2);
	}
	return r;
}

PropFactory.prototype.noprop = function(options) {
	var p = new Prop();
	p.renderer = this.noproprender(options);
	p.renderer.activate();
	return p;
}
PropFactory.prototype.noproprender = function(options) {
	var r = new PhoriaPropRenderer();
	r.options = options;
	return r;
}
PropFactory.prototype.noprop2d = function(options) {
	var p = new Prop();
	p.renderer = this.noproprender2d(options);
	return p;
}
PropFactory.prototype.noproprender2d= function(options) {
	var r = new PhoriaPropRenderer();
	r.options = options;
	return r;
}

function CanvasPropRenderer(canvas) {
	this.context =document.getElementById('canvas').getContext('2d');
	this.shapes = [];
	this.options = {};
	this.pixels = 60;
}
CanvasPropRenderer.prototype.render = function(myProp) {
	// does not support grip, choke, or plane-bending;
	this.context.save();
	this.context.translate(ORIGINX, ORIGINY);
	for (i = HOME; i<=HAND; i++) {
		this.context.rotate(myProp[ELEMENTS[i]].azimuth);
		this.context.translate(Math.sin(myProp[ELEMENTS[i]].zenith)*myProp[ELEMENTS[i]].radius*this.pixels,0);
		this.context.rotate(-myProp[ELEMENTS[i]].azimuth);
	}
	this.context.rotate(myProp.prop.azimuth);
	//if (myProp.axis.nearly(WALL)) {
	//	mat4.rotate(mat, mat, -myProp.bend, YAXIS);
	//} else if (myProp.axis.nearly(WHEEL)) {
	//	if (myProp.prop.azimuth <= 0.5*Math.PI) {
	//		mat4.rotate(mat, mat, -myProp.bend, XAXIS);
	//	} else {
	//		mat4.rotate(mat, mat, myProp.bend, XAXIS);
	//	}
	//} else if (myProp.axis.nearly(FLOOR)) {
	//	if (myProp.prop.azimuth >= 0.5*Math.PI && myProp.prop.azimuth <= 1.5*Math.PI) {
	//		mat4.rotate(mat, mat, myProp.bend, XAXIS);
	//	} else {
	//		mat4.rotate(mat, mat, -myProp.bend, XAXIS);
	//	}
	//}
	// prop radius should be handled by prop-specific renderers
	//mat4.rotate(mat, mat, myProp.grip, XAXIS);
	//mat4.translate(mat, mat, [0,0,-myProp.choke]);
	//mat4.rotate(mat, mat, myProp.twist, ZAXIS);
	for (var i=0; i<this.shapes.length; i++) {
		this.shapes[i].draw(this.context, myProp.prop.zenith, myProp.twist, myProp.prop.radius);
	}
	this.context.restore();
}
CanvasPropRenderer.prototype.activate = function(scene) {}
CanvasPropRenderer.prototype.deactivate = function(scene) {}

PropFactory.prototype.poi2d= function(options) {
	var p = new Prop();
	p.renderer = this.poirender2d(options);
	p.renderer.activate();
	return p;
}
PropFactory.prototype.poirender2d = function(options) {
    options = this.defaults(options,{
	canvas: undefined,
        fire: false,
        handle_color: "gray",
        head_color: "red",
        flame_color: "fire",
        tether_size: 1,
        handle_size: 3,
        head_size: 12,
        pixels: 60
    });
    var r = new CanvasPropRenderer(options.canvas);
    r.options = options;
    var handle = new canvasBall(0,0,options.handle_size, options.handle_color, options.handle_color);
    var tether = new canvasLine(0,0,options.pixels, 0, options.tether_size, options.handle_color);
    tether.scalesby = r;
    var ball = new canvasBall(options.pixels, 0, options.head_size, options.head_color, options.handle_color);
    r.shapes.push(handle);
    r.shapes.push(tether);
    r.shapes.push(ball);
    var flame;
    if (options.fire==true) {
        flame = new canvasFlame(options.pixels, 0, options.head_size);
        r.shapes.push(flame);
        ball.radius = options.handle_size;
	ball.color = options.handle_color;
    }
    return r;
}

function canvasLine(x1,y1,x2,y2,thickness,color) {
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
	this.thickness = thickness;
	this.color = color;
}
canvasLine.prototype.draw = function(context, zenith, roll, scale) {
	var scalex = Math.sin(zenith);
	var scaley = Math.cos(roll);
	context.save();
	context.beginPath();
	context.moveTo(this.x1*scalex, this.y1*scaley);
	//context.lineTo(this.x2*scalex, this.y2*scaley);
	context.lineTo(this.x2*scalex*scale, this.y2*scaley*scale);
	context.lineWidth = this.thickness;
	context.strokeStyle = this.color;
	context.stroke();
	context.restore();
}
function canvasBall(x, y, r, color, linecolor) {
	this.x = x;
	this.y = y;
	this.radius = r;
	this.color = color;
	this.linecolor = linecolor;
}
canvasBall.prototype.draw = function(context, zenith, roll, scale) {
	var scalex = Math.sin(zenith)*scale;
	var scaley = Math.cos(roll)*scale;
	context.save();
	context.beginPath();
	context.arc(this.x*scalex, this.y*scaley, this.radius, 0, 2*Math.PI);
	context.fillStyle = this.color;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = this.linecolor;
	context.stroke();
	context.restore();
}

//for now, canvasRing ignores scale
function canvasRing(x, y, r, detail, thickness, color) {
	this.x = x;
	this.y = y;
	this.radius = r;
	this.detail = detail;
	this.thickness = thickness;
	this.color = color;
}

canvasRing.prototype.draw = function(context, zenith, roll) {
	//this seems close to correct, but not quite, especially when roll==STAGGER/2
	var x = Math.sin(zenith);
	var y = 1;
	var h = Math.sin(zenith);
	var w = 1;
	var a = 1;
	var b = Math.cos(roll);
	var angle = Math.cos(zenith)*roll/4;
	var xx;
	var yy;
	context.save();
	context.beginPath();
	for (var i = 0 * Math.PI; i <= 2*Math.PI+(1/this.detail); i+=(1/this.detail)) {
    	xx = this.x*x-(this.radius*w * Math.sin(i)) * Math.sin(angle * Math.PI) + (this.radius*h* Math.cos(i)) * Math.cos(angle * Math.PI);
    	yy = this.y*y+(this.radius*h * Math.cos(i)) * Math.sin(angle * Math.PI) + (this.radius*w* Math.sin(i)) * Math.cos(angle * Math.PI);
	    if (i == 0) {
	    	context.moveTo(a*xx, b*yy);
	    } else {
	    	context.lineTo(a*xx, b*yy);
	    }
	}
	context.fill();
	context.lineWidth = this.thickness;
	context.strokeStyle = this.color;
	context.stroke();
	context.restore();
}


function canvasFlame(x, y, r) {
	this.x = x;
	this.y = y;
	this.radius = r;
	this.fire_density = 10;
	this.mote_size = 0.5;
}
canvasFlame.prototype.draw = function(context, zenith, roll, scale) {
	var scalex = Math.sin(zenith)*scale;
	var scaley = Math.cos(roll)*scale;
	context.save();
	context.translate(this.x*scalex,this.y*scaley);
	var yellow;
	for (var i = 0; i < this.fire_density; i++) {
		context.save();
		context.rotate(Math.random()*2*Math.PI);
		yellow = Math.round(Math.random()*255);
		context.fillStyle = 'rgba(255,'+ yellow + ',0,0.5)';
		context.beginPath();
		context.arc(Math.random()*2*this.radius-Math.random()*2*this.radius, 0, this.mote_size*this.radius, 0, 2*Math.PI);
		context.fill();
		context.restore();	
	}
	context.restore();
}

PropFactory.prototype.staff2d = function(options) {
	var p = new Prop();
	p.renderer = this.staffrender2d(options);
	p.renderer.activate();
	return p;
}
PropFactory.prototype.staffrender2d = function(options) {
	options = this.defaults(options,{
		canvas: undefined,
		fire: false,
		handle_color: "gray",
		head_color: "red",
		flame_color: "fire",
		tether_size: 1,
		handle_size: 3,
		head_size: 10,
		pixels: 60
	});
	var r = new CanvasPropRenderer(options.canvas);
	r.options = options;
	var staff= new canvasLine(-options.pixels,0,options.pixels,0,options.handle_size,options.head_color);
	r.shapes.push(staff);
	var handle = new canvasLine(-options.handle_size, 0, options.handle_size, 0, options.handle_size, options.handle_color);
	r.shapes.push(handle);
	var flame1;
	var flame2;
	if (options.fire==true) {
		flame1 = new canvasFlame(options.pixels,0,options.head_size);
		flame2 = new canvasFlame(-options.pixels,0,options.head_size);
		r.shapes.push(flame1);
		r.shapes.push(flame2);
	}
	return r;
}

PropFactory.prototype.hoop = function(options) {
	var p = new Prop();
	p.renderer = this.hooprender(options);
	p.renderer.activate();
	return p;
}


PropFactory.prototype.hooprender = function(options) {
	options = this.defaults(options,{
		scene: undefined,
		fire: false,
		handle_color: "gray",
		head_color: "red",
		flame_color: "fire",
		handle_size: 0.025,
		handle_detail: 6,
		sections: 18,
		radius: 0.5,
		wicks: 4,
		wick_length: 0.4,
		wick_thickness: 0.001,
		wick_detail: 3
	});
	var r = new PhoriaPropRenderer(options.scene);
	r.options = options;
	var section;
	var a = 2*Math.PI/options.sections;
	//this isn't really set right, I don't think...
	var len = 0.5*options.radius*(1-Math.sin(a))/Math.cos(a);
	for (var i=0; i<options.sections; i++) {
		section = this.cylinder(options.handle_size, len, options.handle_detail);
		this.swapPoints(section, "y", "z");
		this.translatePoints(section, [0,0,options.radius]);
		this.rotatePoints(section, i*a, "y", "z");
		this.translatePoints(section, [0,0,options.radius]);
		//this.translatePoints(section, [0,Math.sin(i*a),Math.cos(i*a)+options.radius]);
		section.style.color = this.colormap(options.head_color);
		r.shapes.push(section);
	}
	var handle = this.cylinder(options.handle_size+0.01, 0.1, options.handle_detail);
	handle.style.color = this.colormap(options.head_color)
	this.swapPoints(handle,"y","z");
	r.shapes.push(handle);
	var wick;
	var flame;
	a = 2*Math.PI/options.wicks;
	if (options.fire==true) {
		for (var i=0; i<options.wicks; i++) {
			wick = this.cylinder(options.wick_thickness, options.wick_length, options.wick_detail);
			wick.style.color = options.handle_color;
			this.translatePoints(wick, [0,0,options.radius+0.5*options.wick_length]);
			this.rotatePoints(wick, i*a, "y", "z");
			this.translatePoints(wick, [0,0,options.radius]);
			//flame = this.flame(5, this.colorflame(options.flame_color));
			flame = this.flame(5, this.colorflame("fire"));
			this.translatePoints(flame, [0,0,options.radius+options.wick_length]);
			this.rotatePoints(flame, i*a, "y", "z");
			this.translatePoints(flame, [0,0,options.radius]);
			r.shapes.push(wick);
			r.shapes.push(flame);
		}
	}
	return r;
}

PropFactory.prototype.rotatePoints = function(shape, angle, a, b) {
	var point;
	var points = [];
	if (shape.points!==undefined) {
		points = shape.points;
	} else if (shape.position!==undefined) {
		points = [shape.position];
	}
	if (a===undefined) {a="y";}
	if (b===undefined) {b="z";}
	var r;
	var s;
	for (var i=0; i<points.length; i++) {
		point = points[i];
		s = Math.atan2(point[a],point[b]);
		r = Math.sqrt(point[a]*point[a] + point[b]*point[b]);
		point[a] = r*Math.sin(s+angle);
		point[b] = r*Math.cos(s+angle);
	}
	return shape;
}


PropFactory.prototype.hoop2d = function(options) {
	var p = new Prop();
	p.renderer = this.hooprender2d(options);
	p.renderer.activate();
	return p;
}
PropFactory.prototype.hooprender2d = function(options) {
	options = this.defaults(options,{
		canvas: undefined,
		fire: false,
		handle_color: "gray",
		head_color: "red",
		flame_color: "fire",
		radius: 0.5,
		wicks: 4,
		wick_length: 25,
		wick_thickness: 1,
		handle_size: 2,
		head_size: 10,
		pixels: 40,
		handle_detail: 50
	});
	var r = new CanvasPropRenderer(options.canvas);
	r.options = options;
	var hoop = new canvasRing(options.pixels, 0, options.pixels, options.handle_detail, options.handle_size, options.head_color);
	r.shapes.push(hoop);
	var handle = new canvasBall(0,0,options.handle_size, options.handle_color, options.handle_color);
	r.shapes.push(handle);
	var wick;
	var flame;
	var a = 2*Math.PI/options.wicks;
	var c;
	var s;
	if (options.fire==true) {
		for (var i=0; i<4; i++) {
			c = Math.cos(i*a);
			s = Math.sin(i*a);
			wick = new canvasLine(options.pixels+c*(options.pixels), s*(options.pixels), options.pixels+c*(options.pixels+options.wick_length),s*(options.pixels+options.wick_length), options.wick_thickness, options.handle_color);
			flame = new canvasFlame(options.pixels+c*(options.pixels+options.wick_length),s*(options.pixels+ options.wick_length),options.head_size);
			r.shapes.push(wick);
			r.shapes.push(flame);
		}
	}
	return r;
}

