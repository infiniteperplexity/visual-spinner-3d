// Render the prop in 2D
Prop.prototype.render2D = function() {
	ctx.save();
	ctx.translate(ORIGINX, ORIGINY);
	for (element in ("home","pivot","hand")) {
		ctx.rotate(this[element].azimuth);
		ctx.translate(Math.sin(this[element].zenith)*this[element].radius*this.renderer.pixels,0);
		ctx.rotate(-this[element].azimuth);
	}
	this.renderer.render2D();
	ctx.restore();
}
// Render the prop in 3D
Prop.prototype.render3D = function() {
	// new matrix centered on the origin
	var mat = mat4.create();
	var elements = ["home","pivot","hand"];
	for (i = 0; i<elements.length; i++) {
		mat4.rotate(mat, mat, this[elements[i]].azimuth, ZAXIS3);
		mat4.rotate(mat, mat, this[elements[i]].zenith, YAXIS3);
		mat4.translate(mat, mat, [0,0,this[elements[i]].radius]);
		mat4.rotate(mat, mat, -this[elements[i]].zenith, YAXIS3);
		mat4.rotate(mat, mat, -this[elements[i]].azimuth, ZAXIS3);
	}
	mat4.rotate(mat, mat, this.prop.azimuth, ZAXIS3);
	mat4.rotate(mat, mat, this.prop.zenith, YAXIS3);
	this.renderer.render3D(mat);
}
function PropRenderer() {
	this.pixels = 50;
	this.head_size = 10;
	this.head_color = "red";
	this.handle_size = 3;
	this.handle_color = "red";
	this.tether_color = "gray";
	this.tether_thickness = 1;
	this.head_color_3d = [255,0,0];
}
PropRenderer.prototype.activate = function() {
	for (var i = 0; i<this.shapes.length; i++) {
		scene.graph.push(this.shapes[i]);
	}
}
PropRenderer.prototype.deactivate = function() {
	for (var i = 0; i<this.shapes.length; i++) {
		if (scene.graph.indexOf(this.shapes[i])!==-1) {
			scene.graph.splice(scene.graph.indexOf(this.shapes[i]),1);
		}
	}
}

function Poi() {
	this.shapes = [];
	var c = Phoria.Util.generateCylinder(0.001,1,3);
	var cylinder = Phoria.Entity.create({
		points: c.points,
		edges: c.edges,
		polygons: c.polygons
	});
	this.shapes.push(cylinder);
	var s = Phoria.Util.generateSphere(0.2,6,6);
	var sphere = Phoria.Entity.create({
			points: s.points,
			edges: s.edges,
			polygons: s.polygons
	});
	this.shapes.push(sphere);
}
Poi.prototype = new PropRenderer();
Poi.prototype.render2D = function() {	
	ctx.save();
	
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(this.pixels,0);
	ctx.lineWidth = this.tether_thickness;
	ctx.strokeStyle = this.tether_color;
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(0, 0, this.handle_size, 0, UNIT);
	ctx.fillStyle = this.handle_color;
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(this.pixels, 0, this.head_size, 0, UNIT);
	ctx.fillStyle = this.head_color;
	ctx.fill();
	ctx.stroke();
		
	ctx.restore();
};
Poi.prototype.render3D = function(mat) {
	// create the handle
	var tmat = mat4.clone(mat);
	mat4.translate(tmat, tmat, [0,0,0.5*this.prop.prop.radius]);
	mat4.rotate(tmat, tmat, STAGGER, XAXIS3);
	this.shapes[0].matrix = tmat;
	// translate to prop head
	mat4.translate(mat, mat, [0,0,this.prop.prop.radius]);
	this.shapes[1].matrix = mat;
	this.shapes[1].style.color = this.head_color_3d;
}

function NoProp() {this.shapes = []}
NoProp.prototype = new PropRenderer();
NoProp.prototype.render2D = function() {}
NoProp.prototype.render3D = function(mat) {}
	
	
function FirePoi() {
	this.shapes = [];
	var c = Phoria.Util.generateCylinder(0.01,1,3);
	var cylinder = Phoria.Entity.create({
		points: c.points,
		edges: c.edges,
		polygons: c.polygons
	});
	this.shapes.push(cylinder);
	
	var s = Phoria.Util.generateSphere(0.15,4,4);
	var sphere = Phoria.Entity.create({
			points: s.points,
			edges: s.edges,
			polygons: s.polygons
	});
	this.shapes.push(sphere);
	
	var texture = Phoria.Util.generateRadialGradientBitmap(32, "rgba(128,64,32,1)", "rgba(128,64,32,0)");
	var flame = Phoria.EmitterEntity.create({
		position: {x:0, y:0, z:0},
		positionRnd: {x:0.1, y:0.1, z:0.1},
		rate: 25,
		velocity: {x:0, y:0.025, z:0},
		velocityRnd: {x:0.025, y:0.025, z:0.025},
		lifetime: 500,
		lifetimeRnd: 50,
		gravity: false,
		style: {
			compositeOperation: "lighter",
			shademode: "sprite",
			linewidth: 7,
			objectsortmode: "front",
			sprite: 0
		}
	});
	flame.textures[0] = texture;
	//flame.textures.push(texture);
	this.shapes.push(flame);
	var s = Phoria.Util.generateSphere(0.2,6,6);
}
FirePoi.prototype = new PropRenderer() ;
FirePoi.prototype.render3D = function(mat) {
	// create the handle
	var tmat = mat4.clone(mat);
	mat4.translate(tmat, tmat, [0,0,0.5*this.prop.prop.radius]);
	mat4.rotate(tmat, tmat, STAGGER, XAXIS3);
	this.shapes[0].matrix = tmat;
	// translate to prop head
	mat4.translate(mat, mat, [0,0,this.prop.prop.radius]);
	this.shapes[1].matrix = mat;
	this.shapes[2].matrix = mat;
	this.shapes[1].style.color = [128,64,32];
}


	
	       

           
    

