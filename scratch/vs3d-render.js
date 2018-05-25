VS3D = (function(VS3D) {

	function ThreeRenderer(el,width,height) {
		this.width = width || 400;
		this.height = height || 400;
		//this.renderer = Detector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer()
		this.renderer = new THREE.WebGLRenderer(); //{antialias: true}
		//this.renderer.sortObjects = false;
		this.renderer.setSize(this.width,this.height);
		el.appendChild(this.renderer.domElement);
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, this.width/this.height, 0.1, 1000);
		//this.camera.position.set(0,0,8);
		this.camera.position.set(0,0,8);
		this.scene.add(this.camera);
		this.renderer.setClearColor(0x000000,1.0);
		let light = new THREE.PointLight(0xffffff);
		light.position.set(0,0,100);
		this.scene.add(light);
		light = new THREE.PointLight(0xffffff);
		//let grid = new THREE.GridHelper(10,1, 0x333333, 0x333333);
		//let grid = new THREE.GridHelper(10,1, 0xffffff, 0xffffff);
		let grid = new THREE.GridHelper(10, 10, 0x333333, 0x333333); 
		grid.material.transparent = true;
		grid.rotateX(Math.PI/2);
		//grid.translateOnAxis(VS3D.YAXIS, -5*VS3D.NUDGE);
		this.scene.add(grid);
		let polar = new THREE.PolarGridHelper(10, 8, 20, 64, 0x333333, 0x333333);
		polar.material.transparent = true;
		// polar.setColors(0x333333, 0x333333);
		polar.rotateX(Math.PI/2);
		//polar.translateOnAxis(VS3D.YAXIS, -0.1);
		this.scene.add(polar);
		this.scene.fog = new THREE.FogExp2( 0x000000, 0.0128 );
		this.registry = [];
		this.models = [];
		this.tick = 0;
	}

	ThreeRenderer.prototype.render = function(wrappers, positions) {
		for (let i=0; i<this.registry.length; i++) {
			let prop = this.registry[i];
			// clean up removed props
			if (!wrappers.includes(prop)) {
				console.log("removing prop shapes");
				this.registry.splice(i,1);
				let shapes = this.models[i];
				this.scene.remove(shapes);
				this.models.splice(i,1);
				i-=1;
			}
		}
		// add new props
		// oof...we need to think about how to do this...'cuz right 
		for (let prop of wrappers) {
			if (!this.registry.includes(prop)) {
				this.registry.push(prop);
				let shapes = this.builder[prop.model](prop.color);
				this.models.push(shapes);
				this.scene.add(shapes);
			}
		}
		// what about properties that have changed?
		// update all prop locations
		for (let i=0; i<this.registry.length; i++) {
			let prop = this.registry[i];
			this.update(this.models[i], positions[i], i);
		}
		this.renderer.render(this.scene, this.camera);
	}


	ThreeRenderer.prototype.update = function(shapes, prop, i) {
		// rotate and translate according to "body", "pivot", "helper", and "hand"
		shapes.position.x = 0;
		shapes.position.y = 0;
		shapes.position.z = 0;
		shapes.rotation.x = 0;
		shapes.rotation.y = 0;
		shapes.rotation.z = 0;
		for (let i=VS3D.BODY; i<VS3D.HEAD; i++) {
			let node = VS3D.NODES[i];
			shapes.rotateY(-prop[node].b*VS3D.UNIT);
			shapes.rotateZ(-prop[node].a*VS3D.UNIT);
			shapes.translateOnAxis(VS3D.YAXIS,+prop[node].r);
			shapes.rotateZ(+prop[node].a*VS3D.UNIT);
			shapes.rotateY(+prop[node].b*VS3D.UNIT);
		}
		// BEND should be handled elsewhere
		let axis = VS3D.prop$axis(prop);
		// handle TWIST (possibly this should go before GRIP?)
		shapes.rotateOnAxis(axis,prop.twist*VS3D.UNIT);
		shapes.rotateY(-prop.head.b*VS3D.UNIT);
		shapes.rotateZ(-prop.head.a*VS3D.UNIT);
		// leave HEAD.R out of this for now
	}

	

	ThreeRenderer.prototype.builder = {};

	ThreeRenderer.prototype.builder.colors = function(c) {
		let colors = {
			//blue: "royalblue"
			//blue: new THREE.Color(0x3333ff)
		};
		return (colors[c] || c);
	}

	ThreeRenderer.prototype.builder.poi = function(color) {
		let head = new THREE.Mesh(
			new THREE.SphereGeometry(0.2,16,16),
			new THREE.MeshLambertMaterial({color: this.colors(color)})
		);
		
		head.position.y = 1;
		let tether = new THREE.Mesh(
			new THREE.CylinderGeometry(0.025,0.025,1,4),
			new THREE.MeshLambertMaterial({color: "white"})
		);
		tether.position.y = 0.5;
		let handle = new THREE.Mesh(
			new THREE.SphereGeometry(0.075,8,8),
			new THREE.MeshLambertMaterial({color: this.colors(color)})
		);
		let group = new THREE.Group();
		group.add(head);
		group.add(tether);
		group.add(handle);
		return group;
	}

	ThreeRenderer.prototype.builder.staff = function(color) {
		let shaft = new THREE.Mesh(
			new THREE.CylinderGeometry(0.05,0.05,2,8),
			new THREE.MeshLambertMaterial({color: this.colors(color)})
		);
		let handle = new THREE.Mesh(
			new THREE.CylinderGeometry(0.065,0.065,0.2,8),
			new THREE.MeshLambertMaterial({color: this.colors(color)})
		);
		let head = new THREE.Mesh(
			new THREE.SphereGeometry(0.1,8,8),
			new THREE.MeshLambertMaterial({color: this.colors("white")})
		);
		head.position.y = 1;
		let tail = new THREE.Mesh(
			new THREE.SphereGeometry(0.1,8,8),
			new THREE.MeshLambertMaterial({color: this.colors("gray")})
		);
		tail.position.y = -1;
		let group = new THREE.Group();
		group.add(shaft);
		group.add(handle);
		group.add(head);
		group.add(tail);
		return group;
	}

	ThreeRenderer.prototype.builder.hoop = function(color) {
		let ring = new THREE.Mesh(
			new THREE.TorusGeometry(0.8,0.05,8,32),
			new THREE.MeshLambertMaterial({color: this.colors(color)})
		);
		let handle = new THREE.Mesh(
			new THREE.CylinderGeometry(0.075,0.075,0.15,8),
			new THREE.MeshLambertMaterial({color: this.colors("gray")})
		);
		//rotateX?
		handle.translateOnAxis(VS3D.YAXIS,-0.8);
		let group = new THREE.Group();
		group.add(ring);
		group.add(handle);
		return group;
	}

	ThreeRenderer.prototype.builder.fan = function(color) {
		let ring = new THREE.Mesh(
			new THREE.TorusGeometry(0.2,0.05,6,16),
			new THREE.MeshLambertMaterial({color: this.colors(color)})
		);
		let tine;
		let tines = 3;
		let angle = Math.PI/4;
		let group = new THREE.Group();
		group.add(ring);
		for (var i=0; i<tines; i++) {
			tine = new THREE.Mesh(
				new THREE.CylinderGeometry(0.05,0.05,0.8,8),
				new THREE.MeshLambertMaterial({color: this.colors(color)})
			);
			tine.rotateZ(-angle+i*angle);
			tine.translateOnAxis(VS3D.YAXIS,0.6);
		 	group.add(tine);
		}
		return group;
	}

	ThreeRenderer.prototype.builder.none = function() {
		return new THREE.Group();
	}

	VS3D.ThreeRenderer = ThreeRenderer;
	
	return VS3D;
})(VS3D);