VS3D = (function(VS3D) {

	const THREEX = {x: 1, y: 0, z: 0};
	const THREEY = {x: 0, y: 1, z: 0};
	const THREEZ = {x: 0, y: 0, z: -1};

	function webglAvailable() {
		try {
			let canvas = document.createElement('canvas');
			return !!( window.WebGLRenderingContext && (
				canvas.getContext( 'webgl' ) ||
				canvas.getContext( 'experimental-webgl' ) )
			);
		} catch (e) {
			return false;
		}
	}

	function ThreeRenderer(el,width,height,fov) {
		this.div = document.createElement("div");
		this.div.className = "vs3d-renderer";
		this.div.style.position = "relative";
		this.div.style.width = "400px";
		el.appendChild(this.div);
		// or could maybe throw this in its own div, with relative positioning?
		this.width = width || 400;
		this.height = height || 400;
		this.fov = fov || 45;
		this.renderer = new THREE.WebGLRenderer(); // antialias = true
		this.renderer.setSize(this.width,this.height);
		this.div.appendChild(this.renderer.domElement);
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(this.fov, this.width/this.height);
		this.setCameraPosition(0,0,8);
		this.scene.fog = new THREE.FogExp2( 0x000000, 0.0128 );
		this.registry = [];
		this.models = [];
		this.tick = 0;
	}

	ThreeRenderer.prototype.setCameraPosition = function(x,y,z) {
		this.camera.position.set(x,y,z);
		this.camera.lookAt(this.scene.position);
		if (this.grid) {
			this.scene.remove(this.grid);
		}
		if (this.polar) {
			this.scene.remove(this.polar);
		}
		if (this.light) {
			this.scene.remove(
				this.light);
		}
		this.camera.position.set(x,y,z);
		this.camera.lookAt(this.scene.position);
		this.scene.add(this.camera);
		this.renderer.setClearColor(0x000000,1.0);
		let light = new THREE.PointLight(0xffffff);
		light.position.set(x,y,z*10);
		this.scene.add(light);
		this.light = light;
		let gcolor = 0x202020;
		let grid = new THREE.GridHelper(20, 20, gcolor, gcolor);
		grid.material.tranparent = true;
		grid.material.opacity = 0.2;
		grid.rotateOnAxis(VS3D.vector(Math.sign(z),Math.sign(y),Math.sign(x)),Math.PI/2);
		this.scene.add(grid);
		this.grid = grid;
		let polar = new THREE.PolarGridHelper(10, 8, 20, 64, gcolor, gcolor);
		polar.material.tranparent = true;
		polar.material.opacity = 0.2;
		polar.rotateOnAxis(VS3D.vector(Math.sign(z),Math.sign(y),Math.sign(x)),Math.PI/2);
		this.polar = polar;
		this.scene.add(polar);
	};

	ThreeRenderer.prototype.render = function(wrappers, positions) {
		let removes = [];
		for (let i=0; i<this.registry.length; i++) {
			let prop = this.registry[i];
			// clean up removed props or altered
			if (!wrappers.includes(prop)) {
				let shapes = this.models[i];
				shapes.renderOrder = i;
				this.scene.remove(shapes);
				removes.push(i);
			}
		}
		this.models = this.models.filter((_,i)=>!removes.includes(i));
		this.registry = this.registry.filter((_,i)=>!removes.includes(i));
		// add new props
		for (let prop of wrappers) {
			if (!this.registry.includes(prop)) {
				this.registry.push(prop);
				let shapes = this.builder[prop.model](prop.color);
				this.models.push(shapes);
				this.scene.add(shapes);
			}
		}
		// update all prop locations
		for (let i=0; i<wrappers.length; i++) {
			let idx = this.registry.indexOf(wrappers[i]);
			this.update(this.models[idx], positions[i], wrappers[i].nudge);
		}
		this.renderer.render(this.scene, this.camera);
	}


	ThreeRenderer.prototype.update = function(shapes, prop, nudge) {
		nudge = nudge || 0;
		shapes.position.x = Math.sign(this.camera.position.x)*nudge;
		shapes.position.y = Math.sign(this.camera.position.y)*nudge;
		shapes.position.z = Math.sign(this.camera.position.z)*nudge;
		shapes.rotation.x = 0;
		shapes.rotation.y = 0;
		shapes.rotation.z = 0;
		for (let shape of shapes.children) {
			if (shape.userData.stretchy) {
				shape.scale.set(1,prop.head.r,1);
			}
			if (shape.userData.slideish) {
				shape.position.y = prop.head.r/2;
			}
			if (shape.userData.slidey) {
				shape.position.y = prop.head.r;
			}
		}
		let axis = VS3D.axis(prop);
		for (let i=VS3D.BODY; i<VS3D.HEAD; i++) {
			let node = VS3D.NODES[i];
			shapes.rotateY(-prop[node].b*VS3D.UNIT);
			shapes.rotateZ(-prop[node].a*VS3D.UNIT);
			shapes.translateOnAxis(THREEY,+prop[node].r);
			shapes.rotateZ(+prop[node].a*VS3D.UNIT);
			shapes.rotateY(+prop[node].b*VS3D.UNIT);
		}
		// BEND should be handled elsewhere
		let twist = prop.twist;
		shapes.rotateOnAxis(axis,twist*VS3D.UNIT);
		shapes.rotateY(-prop.head.b*VS3D.UNIT);
		shapes.rotateZ(-prop.head.a*VS3D.UNIT);
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
		//head.position.y = 1;
		head.userData.slidey = true;
		let tether = new THREE.Mesh(
			new THREE.CylinderGeometry(0.025,0.025,1,4),
			new THREE.MeshLambertMaterial({color: "white"})
		);
		// tether.position.y = 0.5;
		tether.userData.stretchy = true;
		tether.userData.slideish = true;
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
		handle.translateOnAxis(THREEY,-0.8);
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
			let c = (i===0) ? "gray" : this.colors(color);
				tine = new THREE.Mesh(
				new THREE.CylinderGeometry(0.05,0.05,0.8,8),
				new THREE.MeshLambertMaterial({color: this.colors(c)})
			);
			tine.rotateZ(-angle+i*angle);
			tine.translateOnAxis(THREEY,0.6);
		 	group.add(tine);
		}
		return group;
	}

	ThreeRenderer.prototype.builder.none = function() {
		return new THREE.Group();
	}

	VS3D.ThreeRenderer = ThreeRenderer;
	


	// how to handle captions
	// let overlay = document.createElement("div");
	// overlay.appendChild(document.createTextNode("hello world!"));
	// overlay.style.color ="yellow";
	// overlay.style.position = "absolute";
	// overlay.style.top = "10px";
	// overlay.style.width = "100%";
	// overlay.style.zIndex = "100";
	// overlay.style.display = "block";
	// overlay.style.textAlign= "left";
	// document.body.appendChild(overlay);
	// overlay.innerHTML = "Testing";


	return VS3D;
})(VS3D);