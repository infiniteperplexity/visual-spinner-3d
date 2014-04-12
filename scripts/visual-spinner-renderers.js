function PhoriaPropRenderer(scene) {
	this.scene = scene;
	this.shapes = [];
	this.options = {};
}
PhoriaPropRenderer.prototype.render = function(myProp) {
	// new matrix centered on the origin
	var mat = mat4.create();
	var elements = ["home","pivot","hand"];
	for (i = 0; i<elements.length; i++) {
		mat4.rotate(mat, mat, myProp[elements[i]].azimuth, ZAXIS3);
		mat4.rotate(mat, mat, myProp[elements[i]].zenith, YAXIS3);
		mat4.translate(mat, mat, [0,0,myProp[elements[i]].radius]);
		mat4.rotate(mat, mat, -myProp[elements[i]].zenith, YAXIS3);
		mat4.rotate(mat, mat, -myProp[elements[i]].azimuth, ZAXIS3);
	}
	mat4.rotate(mat, mat, myProp.prop.azimuth, ZAXIS3);
	mat4.rotate(mat, mat, myProp.prop.zenith, YAXIS3);
	for (var i=0; i<this.shapes.length; i++) {
		this.shapes[i].matrix = mat;
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
	} else if (s=="fire") {
		return [128,64,32];
	} else {
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
	this.translatePoints(tether,[0,0,0.5]);
	var ball = this.sphere(options.head_size, options.head_detail);
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
		//flame = this.trail(35*options.head_size, this.colorflame(options.flame_color));
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
	return p;
}
PropFactory.prototype.staffrender = function(options) {
	options = this.defaults(options,{
		scene: undefined,
		fire: false,
		handle_color: "gray",
		head_color: "red",
		flame_color: "fire",
		handle_size: 0.05,
		handle_detail: 6
	});
	var r = new PhoriaPropRenderer(options.scene);
	r.options = options;
	var staff= this.cylinder(options.handle_size, 2, options.handle_detail);
	staff.style.color = this.colormap(options.head_color)
	r.shapes.push(staff);
	var handle = this.cylinder(options.handle_size+0.01, 0.1, options.handle_detail);
	handle.style.color = this.colormap(options.head_color)
	r.shapes.push(handle);
	var flame1;
	var flame2;
	if (options.fire==true) {
		flame1 = this.flame(7, this.colorflame(options.flame_color));
		flame2 = this.flame(7, this.colorflame(options.flame_color));
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
	return p;
}
PropFactory.prototype.noproprender = function(options) {
	var r = new PhoriaPropRenderer();
	r.options = options;
	return r;
}


