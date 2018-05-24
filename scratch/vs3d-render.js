VS3D = (function(VS3D) {

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
		this.registry = [];
		this.models = [];
		this.tick = 0;
		this.stagger = -0.1;
	}

	ThreeRenderer.prototype.render = function(wrappers, positions) {
		// clean up removed props
		for (let i=0; i<this.registry.length; i++) {
			let prop = this.registry[i];
			if (!wrappers.includes(prop)) {
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
				let shapes = this[prop.model](prop.color);
				this.models.push(shapes);
				this.scene.add(shapes);
			}
		}
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
		shapes.position.z = this.stagger*i;
		shapes.rotation.x = 0;
		shapes.rotation.y = 0;
		shapes.rotation.z = 0;
		for (let i=VS3D.BODY; i<=VS3D.HAND; i++) {
			let node = VS3D.NODES[i];
			shapes.rotateY(-prop[node].b*VS3D.UNIT);
			shapes.rotateZ(-prop[node].a*VS3D.UNIT);
			shapes.translateOnAxis(VS3D.YAXIS,+prop[node].r);
			shapes.rotateZ(+prop[node].a*VS3D.UNIT);
			shapes.rotateY(+prop[node].b*VS3D.UNIT);
		}
		shapes.rotateY(-prop.head.b*VS3D.UNIT);
		shapes.rotateZ(-prop.head.a*VS3D.UNIT);
		// leave HEAD.r out of this for now
		// leave bend out of this for now
		// leave grip out of this for now
		// leave twist out of this for now
		// choke
		//shape.translate(0.5*myProp.prop.radius);
		//this.shapes.translateOnAxis(YAXIS,-(prop.grip.c)*prop.head.r);
	}

	ThreeRenderer.prototype.play = function(prop, move, intv) {
		VS3D.play(prop, move, (p)=>this.update(p),intv);
	}

	ThreeRenderer.prototype.goto = function(prop, move, t) {
		this.tick = t;
		prop = VS3D.spin(prop, move, this.tick);
		this.update(prop);
		return prop;
	}

	ThreeRenderer.prototype.colors = function(c) {
		let colors = {
			//blue: "royalblue"
			blue: new THREE.Color(0x3333ff)
		};
		return (colors[c] || c);
	}

	ThreeRenderer.prototype.poi = function(color) {
		let head= new THREE.Mesh(
			new THREE.SphereGeometry(0.2,16,16),
			new THREE.MeshLambertMaterial({color: this.colors(color)})
		);
		head.position.y = 1;
		let tether = new THREE.Mesh(
			new THREE.CylinderGeometry(0.025,0.025,1,4),
			new THREE.MeshLambertMaterial({color: "white"})
		);
		tether.translateY(0.5);
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

	VS3D.ThreeRenderer = ThreeRenderer;
	
	return VS3D;
})(VS3D);