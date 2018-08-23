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
		// !!!This will create problems if the width is changed later
		this.div.style.width = width+"px";
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

	// !!!should this take new props now
	ThreeRenderer.prototype.refresh = function(wrappers) {
		for (let shape of this.models) {
			this.scene.remove(shape);
		}
		this.models = [];
		for (let wrapper of wrappers) {
			let shapes = this.builder[wrapper.model](wrapper);
			this.models.push(shapes);
			this.scene.add(shapes);
		}
	}

	ThreeRenderer.prototype.render = function(wrappers, positions) {
		if (this.models.length!==wrappers.length) {
			this.refresh(wrappers);
		}
		for (let i=0; i<wrappers.length; i++) {
			this.update(this.models[i], positions[i], wrappers[i].nudge)
		}
		this.renderer.render(this.scene, this.camera);
	}


	

	ThreeRenderer.prototype.update_old = function(shapes, prop, nudge) {
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
		shapes.rotateOnAxis(axis, twist*VS3D.UNIT);
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
			new THREE.MeshLambertMaterial({color: "white"})
		);
		head.position.y = 1;
		let tail = new THREE.Mesh(
			new THREE.SphereGeometry(0.1,8,8),
			new THREE.MeshLambertMaterial({color: "gray"})
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
			new THREE.MeshLambertMaterial({color: "gray"})
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
				new THREE.MeshLambertMaterial({color: c})
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

	// not even close to working
	ThreeRenderer.prototype.builder.buugeng = function(prop) {
		let {color, alpha} = prop;
		let shape = new THREE.Shape();
		shape.moveTo(0,0);
		shape.arc(0,0,0.5,0,Math.PI);
		shape.moveTo(0,0);
		shape.arc(0,0,0.25,0,Math.PI);

		// shape.arc(1,0.5,0,Math.PI);
		// shape.lineTo(1,0);
		// shape.lineTo(1,1);
		// shape.lineTo(0,1);
		// shape.lineTo(0,0);
		let extrudeSettings = {
			amount: 0.1,
	        steps: 5,
	        bevelEnabled: true,
	        bevelSegments: 3,
	        bevelSize: .1,
	        bevelThickness: 0.05
		}
		let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		let material = new THREE.MeshLambertMaterial({color: color});
		let blade = new THREE.Mesh(geometry, material);
		blade.rotateZ(Math.PI/2);
		let group = new THREE.Group();
		group.add(blade);
		if (alpha<1) {
			for (let child in group.children) {
				material.transparent = true;
				material.opacity = alpha;
			}
		}
		return group;
	}

	VS3D.ThreeRenderer = ThreeRenderer;

	let Colors = {};
	Colors.key = {
		aliceblue: "#f0f8ff",
		antiquewhite : "#faebd7",
		aqua : "#00ffff",
		aquamarine : "#7fffd4",
		azure : "#f0ffff",
		beige : "#f5f5dc",
		bisque : "#ffe4c4",
		black : "#000000",
		blanchedalmond : "#ffebcd",
		blue : "#0000ff",
		blueviolet : "#8a2be2",
		brown : "#a52a2a",
		burlywood : "#deb887",
		cadetblue : "#5f9ea0",
		chartreuse : "#7fff00",
		chocolate : "#d2691e",
		coral : "#ff7f50",
		cornflowerblue : "#6495ed",
		cornsilk : "#fff8dc",
		crimson : "#dc143c",
		cyan : "#00ffff",
		darkblue : "#00008b",
		darkcyan : "#008b8b",
		darkgoldenrod : "#b8860b",
		darkgray : "#a9a9a9",
		darkgreen : "#006400",
		darkgrey : "#a9a9a9",
		darkkhaki : "#bdb76b",
		darkmagenta : "#8b008b",
		darkolivegreen : "#556b2f",
		darkorange : "#ff8c00",
		darkorchid : "#9932cc",
		darkred : "#8b0000",
		darksalmon : "#e9967a",
		darkseagreen : "#8fbc8f",
		darkslateblue : "#483d8b",
		darkslategray : "#2f4f4f",
		darkslategrey : "#2f4f4f",
		darkturquoise : "#00ced1",
		darkviolet : "#9400d3",
		deeppink : "#ff1493",
		deepskyblue : "#00bfff",
		dimgray : "#696969",
		dimgrey : "#696969",
		dodgerblue : "#1e90ff",
		firebrick : "#b22222",
		floralwhite : "#fffaf0",
		forestgreen : "#228b22",
		fuchsia : "#ff00ff",
		gainsboro : "#dcdcdc",
		ghostwhite : "#f8f8ff",
		gold : "#ffd700",
		goldenrod : "#daa520",
		gray : "#808080",
		green : "#008000",
		greenyellow : "#adff2f",
		grey : "#808080",
		honeydew : "#f0fff0",
		hotpink : "#ff69b4",
		indianred : "#cd5c5c",
		indigo : "#4b0082",
		ivory : "#fffff0",
		khaki : "#f0e68c",
		lavender : "#e6e6fa",
		lavenderblush : "#fff0f5",
		lawngreen : "#7cfc00",
		lemonchiffon : "#fffacd",
		lightblue : "#add8e6",
		lightcoral : "#f08080",
		lightcyan : "#e0ffff",
		lightgoldenrodyellow : "#fafad2",
		lightgray : "#d3d3d3",
		lightgreen : "#90ee90",
		lightgrey : "#d3d3d3",
		lightpink : "#ffb6c1",
		lightsalmon : "#ffa07a",
		lightseagreen : "#20b2aa",
		lightskyblue : "#87cefa",
		lightslategray : "#778899",
		lightslategrey : "#778899",
		lightsteelblue : "#b0c4de",
		lightyellow : "#ffffe0",
		lime : "#00ff00",
		limegreen : "#32cd32",
		linen : "#faf0e6",
		magenta : "#ff00ff",
		maroon : "#800000",
		mediumaquamarine : "#66cdaa",
		mediumblue : "#0000cd",
		mediumorchid : "#ba55d3",
		mediumpurple : "#9370db",
		mediumseagreen : "#3cb371",
		mediumslateblue : "#7b68ee",
		mediumspringgreen : "#00fa9a",
		mediumturquoise : "#48d1cc",
		mediumvioletred : "#c71585",
		midnightblue : "#191970",
		mintcream : "#f5fffa",
		mistyrose : "#ffe4e1",
		moccasin : "#ffe4b5",
		navajowhite : "#ffdead",
		navy : "#000080",
		oldlace : "#fdf5e6",
		olive : "#808000",
		olivedrab : "#6b8e23",
		orange : "#ffa500",
		orangered : "#ff4500",
		orchid : "#da70d6",
		palegoldenrod : "#eee8aa",
		palegreen : "#98fb98",
		paleturquoise : "#afeeee",
		palevioletred : "#db7093",
		papayawhip : "#ffefd5",
		peachpuff : "#ffdab9",
		peru : "#cd853f",
		pink : "#ffc0cb",
		plum : "#dda0dd",
		powderblue : "#b0e0e6",
		purple : "#800080",
		red : "#ff0000",
		rosybrown : "#bc8f8f",
		royalblue : "#4169e1",
		saddlebrown : "#8b4513",
		salmon : "#fa8072",
		sandybrown : "#f4a460",
		seagreen : "#2e8b57",
		seashell : "#fff5ee",
		sienna : "#a0522d",
		silver : "#c0c0c0",
		skyblue : "#87ceeb",
		slateblue : "#6a5acd",
		slategray : "#708090",
		slategrey : "#708090",
		snow : "#fffafa",
		springgreen : "#00ff7f",
		steelblue : "#4682b4",
		tan : "#d2b48c",
		teal : "#008080",
		thistle : "#d8bfd8",
		tomato : "#ff6347",
		turquoise : "#40e0d0",
		violet : "#ee82ee",
		wheat : "#f5deb3",
		white : "#ffffff",
		whitesmoke : "#f5f5f5",
		yellow : "#ffff00",
		yellowgreen : "#9acd32"
	};
	Colors.lookup = {};
	Object.keys(Colors.key).map((key)=>{
		let val = Colors.key[key];
		Colors.lookup[val] = key;
	});

	Colors.rgb2hex = function(r, g, b) {
		r = parseInt(r).toString(16);
		g = parseInt(g).toString(16);
		b = parseInt(b).toString(16);
		r = (r.length===2) ? r : "0"+r;
		g = (g.length===2) ? g : "0"+g; 
		b = (b.length===2) ? b : "0"+b; 
		return "#"+r+g+b;
	}
	Colors.svg2hex = function(color) {
	    let d = document.createElement("div");
	    d.style.color = color;
	    let c = getComputedStyle(d).color;
	    let rgb = c.split("rgb(").join("").split(")").join("").split(", ");
	    return Colors.rgb2hex(...rgb);
	}
	Colors.hex2svg = function(hex) {
		let color = Colors.key[hex];
		color = color || hex;
		return color;
	}

	VS3D.Colors = Colors;




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
		// shapes.rotateZ(-prop.twist);
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
		let twist = prop.twist*VS3D.UNIT;
		// console.log("axis");
		// console.log(axis.x.toFixed(3));
		// console.log(axis.y.toFixed(3));
		// console.log(axis.z.toFixed(3));
		// console.log("axis of rotation");
		// console.log(axis);
		// I'm not sure this is correct...
		// shapes.rotateOnAxis(axis, -twist*VS3D.UNIT);
		
		// shapes.rotateY(-twist);
		let b = prop.head.b*VS3D.UNIT;
		let a = prop.head.a*VS3D.UNIT;
		// these guys can fix the backwardness issue, but not the other issues.
		// a-=Math.PI;
		// b-=Math.PI;


		// 	a = VS3D.angle(180-prop.head.a)*VS3DUNIT;
		// }
		shapes.rotateY(-b);
		// shapes.rotateY(VS3D.bearing(-prop.head.b)*VS3D.UNIT);
		
		shapes.rotateZ(-a);
		shapes.rotateY(-twist);
		

		// shapes.rotateY(-(prop.head.b+prop.grip.b)*VS3D.UNIT);
		// shapes.rotateZ(-(prop.head.a+prop.grip.a)*VS3D.UNIT);
	}


	return VS3D;
})(VS3D);