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

function Poi() {
	var c = Phoria.Util.generateCylinder(0.001,1,8);
	this.cylinder = Phoria.Entity.create({
		points: c.points,
		edges: c.edges,
		polygons: c.polygons
	});
	var s = Phoria.Util.generateSphere(0.2,12,12);
	this.sphere = Phoria.Entity.create({
			points: s.points,
			edges: s.edges,
			polygons: s.polygons
		});
}
Poi.prototype = new PropRenderer();
Poi.prototype.activate = function() {
	scene.graph.push(this.sphere);
	scene.graph.push(this.cylinder);
}
Poi.prototype.deactivate = function() {
	if (scene.graph.indexOf(this.sphere)!==-1) {
		scene.graph.splice(scene.graph.indexOf(this.sphere),1);
	}
	if (scene.graph.indexOf(this.cylinder)!==-1) {
		scene.graph.splice(scene.graph.indexOf(this.cylinder),1);
	}
}
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
	this.cylinder.matrix = tmat;
	// translate to prop head
	mat4.translate(mat, mat, [0,0,this.prop.prop.radius]);
	this.sphere.matrix = mat;
	this.sphere.style.color = this.head_color_3d;
}

function NoProp() {}
NoProp.prototype = new PropRenderer();
NoProp.prototype.render2D = function() {}
NoProp.prototype.render3D = function(mat) {}
NoProp.prototype.activate = function() {}
NoProp.prototype.deactivate = function() {}
