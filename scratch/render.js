function poiShapes() {
	let head= new THREE.Mesh(
		new THREE.SphereGeometry(0.2,16,16),
		new THREE.MeshLambertMaterial({color: "red"})
	);
	head.position.y = 1;
	let tether = new THREE.Mesh(
		new THREE.CylinderGeometry(0.025,0.025,1,4),
		new THREE.MeshLambertMaterial({color: "white"})
	);
	tether.translateY(0.5);
	let handle = new THREE.Mesh(
		new THREE.SphereGeometry(0.075,8,8),
		new THREE.MeshLambertMaterial({color: "red"})
	);
	let group = new THREE.Group();
	group.add(head);
	group.add(tether);
	group.add(handle);
	return group;
}

function ThreeRenderer(el) {
	this.width = 500;
	this.height = 500;
	this.renderer = new THREE.WebGLRenderer({antialias: true});
	this.renderer.setSize(this.width,this.height);
	el.appendChild(this.renderer.domElement);
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.1, 1000);
	//this.camera.position.set(0,0,8);
	this.camera.position.set(0,0,8);
	this.scene.add(this.camera);
	this.renderer.setClearColor(0x000000,1.0);
	let light = new THREE.PointLight(0xffffff);
	light.position.set(-100,200,100);
	this.scene.add(light);
	let grid = new THREE.GridHelper(200,10);
	grid.setColors(0x333333, 0x333333);
	this.scene.add(grid);
	this.scene.fog = new THREE.FogExp2( 0x000000, 0.0128 );
	// let animate = ()=>{
	// 	requestAnimationFrame(animate);
	// 	this.renderer.render(this.scene, this.camera);
	// }
	// this.requestId = animate();
	this.shapes = poiShapes();
	this.scene.add(this.shapes);
	this.renderer.render(this.scene, this.camera);
	this.tick = 0;
}


ThreeRenderer.prototype.update = function(prop) {
	// rotate and translate according to "body", "pivot", "helper", and "hand"
	this.shapes.position.x = 0;
	this.shapes.position.y = 0;
	this.shapes.position.z = 0;
	this.shapes.rotation.x = 0;
	this.shapes.rotation.y = 0;
	this.shapes.rotation.z = 0;
	for (let i=BODY; i<=HAND; i++) {
		let node = NODES[i];
		this.shapes.rotateZ(-prop[node].a*UNIT);
		this.shapes.rotateY(-prop[node].b*UNIT);
		this.shapes.translateOnAxis(XAXIS,+prop[node].r);
		this.shapes.rotateZ(+prop[node].a*UNIT);
		this.shapes.rotateY(+prop[node].b*UNIT);
	}
	this.shapes.rotateZ(-prop.head.a*UNIT);
	this.shapes.rotateY(-prop.head.b*UNIT);
	// leave HEAD.r out of this for now
	// leave bend out of this for now
	// leave grip out of this for now
	// leave twist out of this for now
	// choke
	//shape.translate(0.5*myProp.prop.radius);
	this.shapes.translateOnAxis(XAXIS,-(prop.grip.c)*prop.head.r);
	this.renderer.render(this.scene, this.camera);
}

ThreeRenderer.prototype.play = function(prop, move, intv) {
	play(prop, move, (p)=>this.update(p),intv);
}

ThreeRenderer.prototype.goto = function(prop, move, t) {
	this.tick = t;
	prop = spin(prop, move, this.tick);
	this.update(prop);
	return prop;
}
