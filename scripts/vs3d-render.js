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
		grid.rotateOnAxis(VS3D.vector(Math.sign(z),Math.sign(y),Math.sign(x)),Math.PI/2);
		this.scene.add(grid);
		this.grid = grid;
		let polar = new THREE.PolarGridHelper(10, 8, 20, 64, gcolor, gcolor);
		polar.rotateOnAxis(VS3D.vector(Math.sign(z),Math.sign(y),Math.sign(x)),Math.PI/2);
		this.polar = polar;
		this.scene.add(polar);
		this.renderer.render(this.scene, this.camera);
	};

	ThreeRenderer.prototype.render = function(wrappers, positions) {
		let removes = [];
		for (let i=0; i<this.registry.length; i++) {
			let prop = this.registry[i];
			// clean up removed props or altered
			// does not properly detected altered if mutated in place
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
				let shapes = this.builder[prop.model](prop);
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
		// shapes.rotateY(-(prop.head.b+prop.grip.b)*VS3D.UNIT);
		// shapes.rotateZ(-(prop.head.a+prop.grip.a)*VS3D.UNIT);
	}

	

	ThreeRenderer.prototype.builder = {};


	ThreeRenderer.prototype.builder.poi = function(prop) {
		let {color, alpha} = prop;
		let head = new THREE.Mesh(
			new THREE.SphereGeometry(0.2,16,16),
			new THREE.MeshLambertMaterial({color: color})
		);
		head.userData.slidey = true;
		let tether = new THREE.Mesh(
			new THREE.CylinderGeometry(0.025,0.025,1,4),
			new THREE.MeshLambertMaterial({color: "white"})
		);
		tether.userData.stretchy = true;
		tether.userData.slideish = true;
		let handle = new THREE.Mesh(
			new THREE.SphereGeometry(0.075,8,8),
			new THREE.MeshLambertMaterial({color: color})
		);
		if (alpha<1) {
			head.material.transparent = true;
			head.material.opacity = alpha;
			tether.material.transparent = true;
			tether.material.opacity = alpha;
			handle.material.transparent = true;
			handle.material.opacity = alpha;
		}
		let group = new THREE.Group();
		group.add(head);
		group.add(tether);
		group.add(handle);
		return group;
	}

	ThreeRenderer.prototype.builder.staff = function(prop) {
		let {color, alpha} = prop;
		let shaft = new THREE.Mesh(
			new THREE.CylinderGeometry(0.05,0.05,2,8),
			new THREE.MeshLambertMaterial({color: color})
		);
		let handle = new THREE.Mesh(
			new THREE.CylinderGeometry(0.065,0.065,0.2,8),
			new THREE.MeshLambertMaterial({color: color})
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
		if (alpha<1) {
			shaft.material.transparent = true;
			shaft.material.opacity = alpha;
			handle.material.transparent = true;
			handle.material.opacity = alpha;
			head.material.transparent = true;
			head.material.opacity = alpha;
			tail.material.transparent = true;
			tail.material.opacity = alpha;
		}
		group.add(shaft);
		group.add(handle);
		group.add(head);
		group.add(tail);
		return group;
	}

	ThreeRenderer.prototype.builder.hoop = function(prop) {
		let {color, alpha} = prop;
		let ring = new THREE.Mesh(
			new THREE.TorusGeometry(0.8,0.05,8,32),
			new THREE.MeshLambertMaterial({color: color})
		);
		let handle = new THREE.Mesh(
			new THREE.CylinderGeometry(0.075,0.075,0.15,8),
			new THREE.MeshLambertMaterial({color: this.colors("gray")})
		);
		//rotateX?
		handle.translateOnAxis(THREEY,-0.8);
		let group = new THREE.Group();
		if (alpha<1) {
			ring.material.transparent = true;
			ring.material.opacity = alpha;
			handle.material.transparent = true;
			handle.material.opacity = alpha;
		}
		group.add(ring);
		group.add(handle);
		return group;
	}

	ThreeRenderer.prototype.builder.fan = function(prop) {
		let {color, alpha} = prop;
		let ring = new THREE.Mesh(
			new THREE.TorusGeometry(0.2,0.05,6,16),
			new THREE.MeshLambertMaterial({color: color})
		);
		let tine;
		let tines = 3;
		let angle = Math.PI/4;
		let group = new THREE.Group();
		group.add(ring);
		for (var i=0; i<tines; i++) {
			let c = (i===0) ? "gray" : color;
				tine = new THREE.Mesh(
				new THREE.CylinderGeometry(0.05,0.05,0.8,8),
				new THREE.MeshLambertMaterial({color: this.colors(c)})
			);
			tine.rotateZ(-angle+i*angle);
			tine.translateOnAxis(THREEY,0.6);
		 	group.add(tine);
		}
		if (alpha<1) {
			for (let child in group.children) {
				child.material.transparent = true;
				child.material.opacity = alpha;
			}
		}
		return group;
	}

	ThreeRenderer.prototype.builder.none = function() {
		return new THREE.Group();
	}

	VS3D.ThreeRenderer = ThreeRenderer;
	

	let Colors = {};
	Colors.rgb2hex = function(r, g, b) {
		r = parseInt(r).toString(16);
		g = parseInt(g).toString(16);
		b = parseInt(b).toString(16);
		r = (r.length===2) ? r : "0"+r;
		g = (g.length===2) ? g : "0"+g; 
		b = (b.length===2) ? b : "0"+b; 
		return "#"+r+g+b;
	}
	Colors.css2hex = function(color) {
	    let d = document.createElement("div");
	    d.style.color = color;
	    let c = getComputedStyle(d).color;
	    let rgb = c.split("rgb(").join("").split(")").join("").split(", ");
	    return Colors.rgb2hex(...rgb);
	}

	VS3D.Colors = Colors;

	return VS3D;
})(VS3D);