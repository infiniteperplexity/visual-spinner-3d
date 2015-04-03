VS3D = (function (VS3D) {
"use strict";
//Bring some Constants into the current namespace, for convenience
var ELEMENTS = VS3D.Constants.ELEMENTS;
var HOME = VS3D.Constants.HOME;
var HAND = VS3D.Constants.HAND;
var XAXIS = VS3D.Constants.XAXIS;
var YAXIS = VS3D.Constants.YAXIS;
var ZAXIS = VS3D.Constants.ZAXIS;
var WALL = VS3D.Constants.WALL;
var WHEEL = VS3D.Constants.WHEEL;
var FLOOR = VS3D.Constants.FLOOR;
var BEAT = VS3D.Constants.BEAT;

var props = VS3D.PropFactory();

function VisualSpinnerWidget(options) {
	this.div = undefined; // a reference
	this.width = 400;
	this.height = 400; // need some room for controls
	this.canvas = document.createElement("canvas");
	this.canvas.innerHTML = "Your browser does not support HTML5 Canvas.";
	this.context = this.canvas.getContext('2d');
	this.svg = document.createElement("svg"); // build a new one
	this.scene = new VisualSpinnerScene(); //can be reassigned
	this.scene.widgets.push(this);
	//this.renderer = new HTML5Canvas2dRenderer(); // for now;
	this.renderer = new Phoria3dRenderer();
	this.controls = []; // a list of control elements
	this.annotations = [];
	this.textCursor = 0;
	this.text = document.createElement("p");
	this.text.innerHTML = "";
	this.text.style.color = "yellow";
	this.text.style.position = "absolute";
	this.text.style.top = "10px";
	this.text.style.zIndex = "1";
}

VisualSpinnerWidget.prototype.camera = function(x,y,z) {
	if (this.renderer.camera !== undefined) {
		this.renderer.camera(x,y,z);
	}
}
VisualSpinnerWidget.prototype.cameraX = function() {
	if (this.renderer.camera !== undefined) {
		return this.renderer.cameraX();
	}
}
VisualSpinnerWidget.prototype.cameraY = function() {
	if (this.renderer.camera !== undefined) {
		return this.renderer.cameraY();
	}
}
VisualSpinnerWidget.prototype.cameraZ = function() {
	if (this.renderer.camera !== undefined) {
		return this.renderer.cameraZ();
	}
}
VisualSpinnerWidget.prototype.addText = function(txt, duration) {
	duration = duration || 1;
	this.annotations.push([txt,0,duration]);
}
VisualSpinnerWidget.prototype.advanceText = function() {
	if (this.annotations.length > 0) {
		var active = this.annotations[this.textCursor];
		active[1]+=1;
		if (active[1] >= active[2]*BEAT) {
			active[1] = 0;
			this.textCursor = (this.textCursor + 1)%this.annotations.length;
		}
	}
}
VisualSpinnerWidget.prototype.renderText = function() {
	if (this.annotations.length > 0) {
		var active = this.annotations[this.textCursor];
		this.text.innerHTML = active[0];
		var left = this.width/2 - this.text.offsetWidth/2;
		this.text.style.left = ""+left+"px";
	}
}
VisualSpinnerWidget.prototype.padText = function() {
	var tally = 0;
	for (var i = 0; i<this.annotations.length; i++) {
		tally += this.annotations[i][2];
	}
	//do not implement for now...
}

VisualSpinnerWidget.prototype.embedById = function(id) {
	this.div = document.getElementById(id);
	this.div.VisualSpinnerWidget = this;
	this.div.height = this.height;
	this.div.width = this.width;
	this.div.appendChild(this.canvas);
	this.canvas.height = this.height;
	this.canvas.width = this.width;
	this.div.appendChild(document.createElement("br"));
	this.context.fillRect(0,0,this.width,this.height);
	this.renderer.activate(this);
	this.div.style.position = "relative";
	this.div.appendChild(this.text);
}
VisualSpinnerWidget.prototype.ready = function() {
	this.renderer.render(this.scene);
	for (var i = 0; i<this.scene.props.length; i++) {
		this.scene.starting[i].orientToProp(this.scene.props[i]);
	}
	this.renderText();
}

VisualSpinnerWidget.prototype.addProp = function(optionalProp) {
	var p = optionalProp || VS3D.Prop();
	var o;
	this.padding = 1; //provides some padding at the start
	p.propType = "poi";
	p.color = "red";
	p.fire = false;
	this.scene.props.push(p);
	o = VS3D.Prop();
	o.propType = "poi";
	o.color = "red";
	o.fire = false;
	o.shadow = true;
	this.scene.starting.push(o);
	return p;
}

function VisualSpinnerScene() {
	this.props = []; // empty list
	this.starting = [];
	this.predicts = [];
	this.widgets = [];
	this.paused = true;
	this.padding = 1;
	this.frame = 0;
	this.speed = 1;
	VS3D.overrideSpinfail(this.spinfail());
}


VisualSpinnerScene.prototype.spinfail = function() {
	var self = this;
	var spinfail = function() {
		var none = true;
		for (var i = 0; i<self.props.length; i++) {
			if (self.props[i].move.submoves.length>0) {
				none = false;
			}
		}
		if (none===true) {
			alert("can't spin with an empty queue");
			self.reset();
		}
	}
	return spinfail;
}

VisualSpinnerWidget.prototype.swapScene = function(scene) {
	this.scene.widgets.splice(this.scene.widgets.indexOf(this));
	this.renderer.deactivate(this);
	this.scene = scene;
	this.scene.widgets.push(this);
	this.renderer.activate(this);
}
VisualSpinnerWidget.prototype.swapRenderer = function(r) {
	this.renderer.deactivate(this);
	this.renderer = r;
	r.activate(this);
}



VisualSpinnerWidget.prototype.play = function() {
	this.scene.play();
}
VisualSpinnerScene.prototype.play = function() {
	if (this.paused === false) {return;} // don't want multiple animation loops going
	if (this.frame===0) {
		for (var i = 0; i<this.props.length; i++) {
			this.starting[i].orientToProp(this.props[i]);
		}
	}
	this.paused = false;
	for (var i = 0; i < this.widgets.length; i++) {
		this.widgets[i].padText();
	}
	this.animationLoop(this);
}

VisualSpinnerWidget.prototype.pause = function() {
	this.scene.pause();
}
VisualSpinnerScene.prototype.pause = function() {
	this.paused = true;
}

VisualSpinnerWidget.prototype.rewind = function(n) {
	this.scene.rewind(n);
}
VisualSpinnerScene.prototype.rewind = function(n) {
	var f = this.frame;
	this.reset();
	if (f-n >= 0) {
		this.advance(f - n);
	} else if (f-n < 0) {
		this.advance(this.maxFrame() + f - n);
	}
}

VisualSpinnerWidget.prototype.forward = function(n) {
	this.scene.forward(n);
}
VisualSpinnerScene.prototype.forward = function(n) {
	this.paused = true;
	this.advance(n);
}

VisualSpinnerWidget.prototype.advance = function(n) {
	this.scene.advance(n);
}
VisualSpinnerScene.prototype.advance = function(n) {
	if (n===undefined) {
		n = 1;
	}
	for (var i = 0; i<n; i++) {
		for (var j = 0;  j < this.props.length; j++) {
			if (!this.props[j].dummy) {
				this.props[j].spin();
			}
		}	
		for (var j = 0; j < this.widgets.length; j++) {
			this.widgets[j].advanceText();
		}
	}
	this.frame = (this.frame + n)%this.maxFrame();
	for (var i = 0; i < this.widgets.length; i++) {
		for (var j = 0; j < this.widgets[i].controls.length; j++) {
			if (this.widgets[i].controls[j].class === "vs3d-frame-control") {
				this.widgets[i].controls[j].value = this.frame;
			}
		}
	}
	for (var i = 0; i < this.widgets.length; i++) {
		this.widgets[i].renderer.render(this);
		this.widgets[i].renderText();
	}
}
VisualSpinnerWidget.prototype.goto = function(n) {
	this.scene.goto(n);
}
VisualSpinnerScene.prototype.goto = function(n) {
	this.frame = n;
	//ugly kludge
	this.rewind(0);
}

VisualSpinnerWidget.prototype.reset = function() {
	this.scene.reset();
}
VisualSpinnerScene.prototype.reset = function() {
	this.paused = true;
	this.frame = 0;
	for (var i = 0; i<this.props.length; i++) {
		this.props[i].orientToProp(this.starting[i]);
		this.props[i].move.reset();
	}
	for (var i = 0; i < this.widgets.length; i++) {
		this.widgets[i].textCursor = 0;
		for (var j = 0; j < this.widgets[i].annotations.length; j++) {
			this.widgets[i].annotations[j][1]=0;
		}
		for (var j = 0; j < this.widgets[i].controls.length; j++) {
			if (this.widgets[i].controls[j].class === "vs3d-frame-control") {
				this.widgets[i].controls[j].value = 0;
			}
		}
	}
	this.padding = 1;
	for (var i = 0; i < this.widgets.length; i++) {
		this.widgets[i].renderer.clean(this);
	}
}


VisualSpinnerWidget.prototype.maxFrame = function() {
	return this.scene.maxFrame();
}
VisualSpinnerScene.prototype.maxFrame = function() {
	var max = 0;
	for (var i = 0; i < this.props.length; i++) {
		max = Math.max(this.props[i].move.getDuration()*BEAT,max);
	}
	return max;
}

VisualSpinnerScene.prototype.animationLoop = function(caller) {
	if (this.paused === true) {
		return;
	}
	setTimeout(function() {
		requestAnimationFrame(function() {
			caller.animationLoop(caller);
			if (caller.padding <= 0) {
				caller.advance(caller.speed);
			} else {
				caller.padding -= 1;
			}
			for (var i = 0; i < caller.widgets.length; i++) {
				caller.widgets[i].renderer.render(caller);
				caller.widgets[i].renderText();
			}
		})
	}, 1);
}

VisualSpinnerWidget.prototype.addControl = function(s) {
	var control;
	switch (s) {
		case "play":
			control = document.createElement("button");
			$(control).data("widget", this);
			control.class = "vs3d-play-control";
			control.type = "button";
			control.innerHTML = "Play";
			control.onclick = function(){$(this).data("widget").play();}
			this.controls.push(control);
			this.div.appendChild(control);
		break;
		case "pause":
			control = document.createElement("button");
			$(control).data("widget", this);
			control.class = "vs3d-pause-control";
			control.type = "button";
			control.innerHTML = "Pause";
			control.onclick = function(){$(this).data("widget").pause();}
			this.controls.push(control);
			this.div.appendChild(control);
		break;
		case "rewind":
			control = document.createElement("button");
			$(control).data("widget", this);
			control.class = "vs3d-rewind-control";
			control.type = "button";
			control.innerHTML = "-";
			control.onclick = function(){$(this).data("widget").rewind(5);}
			this.controls.push(control);
			this.div.appendChild(control);
		break;
		case "forward":
			control = document.createElement("button");
			$(control).data("widget", this);
			control.class = "vs3d-forward-control";
			control.type = "button";
			control.innerHTML = "+";
			control.onclick = function(){$(this).data("widget").forward(5);}
			this.controls.push(control);
			this.div.appendChild(control);
		break;
		case "frame":
			control = document.createElement("input");	
			control.type = "number";
			control.class = "vs3d-frame-control";
			control.value= "0";
			control.min = "0";
			control.style.width = "80px";
			$(control).data("widget", this);
			control.onchange = function() {this.max = $(this).data("widget").maxFrame(); $(this).data("widget").goto(this.value); this.value = $(this).data("widget").scene.frame;}
			control.oninput = function() {this.max = $(this).data("widget").maxFrame(); $(this).data("widget").goto(this.value); this.value = $(this).data("widget").scene.frame;}
			this.controls.push(control);
			this.div.appendChild(control);
		break;
		case "reset":
			control = document.createElement("button");
			$(control).data("widget", this);
			control.class = "vs3d-reset-control";
			control.type = "button";
			control.innerHTML = "Reset";
			control.onclick = function(){$(this).data("widget").reset(); $(this).data("widget").renderer.render($(this).data("widget").scene);}
			this.controls.push(control);
			this.div.appendChild(control);
		break;
		case "speed":
			control = document.createElement("input");	
			control.class = "vs3d-speed-control";
			control.type = "number";
			control.value= "1";
			control.min = "1";
			control.max = "12";
			control.style.width = "50px";
			$(control).data("widget", this);
			control.onchange = function() {$(this).data("widget").speed = this.value;}
			this.controls.push(control);
			this.div.appendChild(control);
		break;
			case "2d3d":
			control = document.createElement("select");	
			control.appendChild(document.createElement("option"));
			control.appendChild(document.createElement("option"));
			control.class = "vs3d-2d3d-control";
			control.options[0].text = "2d";
			control.options[0].value = "2d";
			control.options[1].text = "3d";
			control.options[1].text = "3d";
			control.options[1].selected = "selected";
			control.style.width = "50px";
			$(control).data("widget", this);
			$(control).data("2d", new HTML5Canvas2dRenderer());
			$(control).data("3d", new Phoria3dRenderer());
			//control.onchange = function() {alert($(this).data(this.options[this.selectedIndex].value));}
			control.onchange = function() {$(this).data("widget").swapRenderer($(this).data(this.options[this.selectedIndex].value));}
			this.controls.push(control);
			this.div.appendChild(control);
		break;
			case "export":
			control = document.createElement("button");
			$(control).data("widget", this);
			control.class = "vs3d-export-control";
			control.type = "button";
			control.innerHTML = "Export";
			control.onclick = function(){
				$(this).data("pop-export").style.display = "block";
				$(this).data("widget").canvas.style.display = "none";
				$(this).data("export-txt").innerHTML = $(this).data("widget").stringify();
			}
			this.controls.push(control);
			this.div.appendChild(control);
			var popup = document.createElement("div");
			popup.style.display = "none";
			$(control).data("pop-export", popup);
			var txt = document.createElement("textarea")
			$(control).data("export-txt", txt);
			txt.rows="18";
			txt.cols="46";
			var done = document.createElement("button");
			done.innerHTML = "Done";
			done.onclick = function() {
				$(control).data("pop-export").style.display = "none";
				$(control).data("widget").canvas.style.display = "block";
			}
			popup.appendChild(txt);
			popup.appendChild(done);
			this.div.appendChild(popup);
		break;
	}
}
VisualSpinnerWidget.prototype.addControls = function(args) {
	for (var i = 0; i < arguments.length; i++) {
		this.addControl(arguments[i]);
	}
}


VisualSpinnerWidget.prototype.stringify = function() {
        if (this.scene.props.length===0) {return "";}
        var json = '{"prop1": '+this.scene.props[0].stringify();
        for (var i = 1; i<this.scene.props.length; i++) {
                json += ', "prop' + (i+1) + '": ' + this.scene.props[i].stringify();
        }
        json += "}";
        return json;
}
VisualSpinnerWidget.prototype.parse = function(json) {	
        this.scene.props = [];
        this.scene.starting = [];
       	var jsonprops = JSON.parse(json);
        var p;
        for (var prop in jsonprops) {
	        p = this.addProp();
	        p.build(JSON.stringify(jsonprops[prop]));
	       	p.applyMoves(JSON.stringify(jsonprops[prop]));
        }
        this.renderer.render(this.scene);
}

VisualSpinnerWidget.prototype.parseFile = function(url) {
	var widget = this;
	$.ajax({
		url: url,
		type: "GET",
		dataType: "text",
		cache: false,
		success: function(data) {widget.parse(data);}
	});
}


VisualSpinnerWidget.prototype.Moves = VS3D.MoveFactory();
VisualSpinnerWidget.prototype.Props = VS3D.PropFactory();

VisualSpinnerWidget.prototype.populateFromJSON = function(json) {
}

////*********** Renderers **************************************************************************************************************;
// VisualSpinnerWidget provides both a Canvas element and an SVG element, so a renderer can use either (but not both);
////******************************************************************************************************************************;

// *** Glenn Wright's 2D (pseudo-3D) renderer for HTML5 Canvas ***
function HTML5Canvas2dRenderer() {
	var canvas = undefined;
	this.context = undefined;
	this.pixels = 60;
}
HTML5Canvas2dRenderer.prototype.activate = function(widget) {
	this.canvas = widget.canvas;
	this.context = widget.canvas.getContext('2d');	
}
HTML5Canvas2dRenderer.prototype.deactivate = function() {}
HTML5Canvas2dRenderer.prototype.clean = function(scene) {
	this.context.fillStyle = "black";
	this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
}
HTML5Canvas2dRenderer.prototype.render = function(scene) {
	this.context.fillStyle = "rgba(0,0,0,0.05)";
	this.context.fillRect(0,0,this.canvas.width,this.canvas.height);
	var prop;
	for (var i = 0; i < scene.props.length; i++) {
		prop = scene.props[i];
		this.context.save();
		this.context.translate(this.canvas.width/2, this.canvas.height/2);
		for (var j = HOME; j<=HAND; j++) {
			this.context.rotate(prop[ELEMENTS[j]].azimuth);
			this.context.translate(Math.sin(prop[ELEMENTS[j]].zenith)*prop[ELEMENTS[j]].radius*this.pixels,0);
			this.context.rotate(-prop[ELEMENTS[j]].azimuth);
		}
		// BEND
		var s = prop.prop.vectorize().rotate(prop.bend,prop.prop.vectorize().cross(prop.axis)).spherify();
		this.context.rotate(s.azimuth);
		// GRIP and CHOKE
		this.context.translate(Math.sin(s.zenith)*0.5*prop.prop.radius*this.pixels,0);
		this.context.rotate(prop.grip);
		this.context.translate(Math.sin(s.zenith)*(-prop.choke-0.5)*prop.prop.radius*this.pixels,0);
		//this.context.translate(Math.sin(s.zenith)*(-prop.choke-0.5)*prop.prop.radius*this.pixels,0);
		// actually draw the thing...
		if (prop.propType === "poi") {
			this.renderPoi(prop);
		} else if (prop.propType === "hoop") {
			this.renderHoop(prop);
		} else if (prop.propType === "staff") {
			this.renderStaff(prop);
		} else if (prop.propType === "noprop") {
			//do not render
		} else {
			this.renderPoi(prop);
		}
		this.context.restore();
	}
}

HTML5Canvas2dRenderer.prototype.renderPoi = function(prop) {
	// Redundant calculation, could pass this as a parameter if necessary
	var bend = prop.prop.vectorize().rotate(prop.bend,prop.prop.vectorize().cross(prop.axis)).spherify();
	this.context.beginPath();
	this.context.arc(0,0,3,0,2*Math.PI);
	this.context.fillStyle = this.color(prop.color);
	this.context.fill();
	this.context.lineWidth = 1;
	this.context.strokeStyle = "gray";
	this.context.stroke();
	this.context.beginPath();
	this.context.moveTo(0,0);
	this.context.lineTo(60*Math.sin(bend.zenith)*prop.prop.radius,0);
	this.context.lineWidth = 1;
	this.context.strokeStyle = "gray";
	this.context.stroke();
	if (prop.fire === true) {
		this.drawFlame(60*Math.sin(bend.zenith)*prop.prop.radius,0);
	} else {
		this.context.beginPath();
		// could do this in a different order depending on the zenith value...
		this.context.arc(60*Math.sin(bend.zenith)*prop.prop.radius,0,12,0,2*Math.PI);
		this.context.fillStyle = this.color(prop.color);
		this.context.fill();
		this.context.lineWidth = 1;
		this.context.strokeStyle = "gray";
		this.context.stroke();
	}
}

HTML5Canvas2dRenderer.prototype.color = function(s) {
	if (s.split(",").length === 3) {
		s = "rgb("+s+")";
	}
	return s;
}
	
HTML5Canvas2dRenderer.prototype.renderHoop = function(prop) {
	// Redundant calculation, could pass this as a parameter if necessary
	var bend = prop.prop.vectorize().rotate(prop.bend,prop.prop.vectorize().cross(prop.axis)).spherify();
	var x;
	var y;
	var twist;
	if (prop.prop.vectorize().nearly(WALL)) {
		twist = prop.twist + WHEEL.between(prop.axis);
	} else {
		// use the rest of the time
		twist = prop.twist + WALL.between(prop.axis);
	}
	var angle = Math.cos(bend.zenith)*twist/4;
	this.context.beginPath();
	//dozens of redundant calculations, could be optimized a lot!;
	for (var i = 0 * Math.PI; i <= 2*Math.PI+(1/50); i+=(1/50)) {
    	x = 40*Math.sin(bend.zenith)-(40*Math.sin(i)) * Math.sin(angle * Math.PI) + (40*Math.sin(bend.zenith)* Math.cos(i)) * Math.cos(angle * Math.PI);
    	y = (40*Math.sin(bend.zenith) * Math.cos(i)) * Math.sin(angle * Math.PI) + (40*Math.sin(i)) * Math.cos(angle * Math.PI);
	    if (i == 0) {
	    	this.context.moveTo(x, Math.cos(twist)*y);
	    } else {
	    	this.context.lineTo(x, Math.cos(twist)*y);
	    }
	}
	this.context.lineWidth = 2;
	this.context.strokeStyle = this.color(prop.color);
	this.fillStyle = "transparent";
	this.context.stroke();
	if (prop.fire === true) {
		this.context.translate(40*Math.sin(bend.zenith),0);
		this.drawFlame(-64*Math.sin(bend.zenith),0);
		this.drawFlame(64*Math.sin(bend.zenith),0);
		this.drawFlame(0,-64*Math.cos(twist)*Math.cos(prop.twist));
		this.drawFlame(0,64*Math.cos(twist)*Math.cos(prop.twist));
		this.context.restore();
	}
}

HTML5Canvas2dRenderer.prototype.renderStaff = function(prop) {
	// Redundant calculation, could pass this as a parameter if necessary
	var bend = prop.prop.vectorize().rotate(prop.bend,prop.prop.vectorize().cross(prop.axis)).spherify();
	this.context.beginPath();
	this.context.moveTo(-60*Math.sin(bend.zenith)*prop.prop.radius,0);
	this.context.lineTo(60*Math.sin(bend.zenith)*prop.prop.radius,0);
	this.context.lineWidth = 3;
	this.context.strokeStyle = this.color(prop.color);
	this.context.stroke();
	this.context.beginPath();
	this.context.moveTo(-3*Math.sin(bend.zenith)*prop.prop.radius,0);
	this.context.lineTo(3*Math.sin(bend.zenith)*prop.prop.radius,0);
	this.context.strokeStyle = "gray";
	this.context.stroke();
	if (prop.fire === true) {
		this.drawFlame(-60*Math.sin(bend.zenith)*prop.prop.radius,0);
		this.drawFlame(60*Math.sin(bend.zenith)*prop.prop.radius,0);
	}
}

HTML5Canvas2dRenderer.prototype.drawFlame = function(x,y) {
	// twelve motes per frame
	this.context.save();
	this.context.translate(x,y);
	for (var i = 0; i < 12; i++) {
		this.context.save();
		this.context.rotate(Math.random()*2*Math.PI);
		this.context.fillStyle = 'rgba(255,'+ Math.round(Math.random()*255)+ ',0,0.5)';
		this.context.beginPath();
		this.context.arc(Math.random()*24-Math.random()*24, 0, 6, 0, 2*Math.PI);
		this.context.fill();
		this.context.restore();
	}
	this.context.restore();
}



// *** Glenn Wright's 3D renderer using Phoria.js for HTML5 Canvas ***
function Phoria3dRenderer() {}

Phoria3dRenderer.prototype.activate = function(widget) {
	var canvas = widget.canvas;
	canvas.style.backgroundColor = "black";
	this.scene = new Phoria.Scene();
	this.scene.camera.position = {x:0.0, y:1.0, z:10.0};
	this.scene.perspective.aspect = canvas.width / canvas.height;
	this.scene.viewport.width = canvas.width;
	this.scene.viewport.height = canvas.height;
	this.renderer = new Phoria.CanvasRenderer(canvas);
	var plane = Phoria.Util.generateTesselatedPlane(8,8,0,20);
	this.scene.graph.push(Phoria.Entity.create({
		points: plane.points,
		edges: plane.edges,
		polygons: plane.polygons,
		style: {
				 drawmode: "wireframe",
				 shademode: "plain",
				 linewidth: 0.5,
				 objectsortmode: "back"
		}}));
	this.scene.graph.push(new Phoria.DistantLight());
	var light = new Phoria.DistantLight();
	light.direction.x = 1;
	light.direction.z = 0;
	this.scene.graph.push(light);
	light = new Phoria.DistantLight();
	light.direction.y = 1;
	light.direction.z = 0;
	this.scene.graph.push(light);
	this.props = [];
}
Phoria3dRenderer.prototype.camera = function(_x,_y,_z) {
	this.scene.camera.position = {x: _x, y: _y, z: _z};
}
Phoria3dRenderer.prototype.cameraX = function() {
	return this.scene.camera.position.x;
}
Phoria3dRenderer.prototype.cameraY = function() {
	return this.scene.camera.position.y;
}
Phoria3dRenderer.prototype.cameraZ = function() {
	return this.scene.camera.position.z;
}
Phoria3dRenderer.prototype.deactivate = function(widget) {
}

Phoria3dRenderer.prototype.clean = function() {
	//do nothing
}
Phoria3dRenderer.prototype.render = function(scene) {
	var myProp;
	// remove any shapes that shouldn't be there
	for (var i = 0; i<this.props.length; i++) {
		myProp = this.props[i].prop;
		if (scene.props.indexOf(myProp)===-1) {
			for (var j = 0; j<this.props[i].shapes.length; j++) {
				this.scene.graph.splice(this.scene.graph.indexOf(this.props[i].shapes[j],1));
			}
			this.props[i] = null;
		}
	}
	// clean up the prop registry
	this.props  = this.props.filter(function (x) {return x !== null;});
	// add any shape that need adding
	var newProp;
	for (var i = 0; i < scene.props.length; i++) {
		myProp = scene.props[i];
		var found = false;
		for (var j = 0; j<this.props.length; j++) {
			if (this.props[j].prop === myProp) {
				found = true;
				break;
			}
		}
		if (found===false) {
			newProp = new PhoriaProp(myProp);
			this.props.push(newProp);
			this.scene.graph = this.scene.graph.concat(newProp.shapes);
		}
	}
	// rebuild any renderers whose properties have changed
	for (var i = 0; i < this.props.length; i++) {
		if (	this.props[i].propType !== this.props[i].prop.propType
				|| this.props[i].color !== this.props[i].prop.color
				||	this.props[i].fire !== this.props[i].prop.fire)	{
			for (var j = 0; j<this.props[i].shapes.length; j++) {
				this.scene.graph.splice(this.scene.graph.indexOf(this.props[i].shapes[j]),1);
			}
			newProp = new PhoriaProp(this.props[i].prop);
			this.props[i] = newProp;
			this.scene.graph = this.scene.graph.concat(newProp.shapes);
		}
	}
	// we should also check to see if any props have changed type or color...
	var mat;
	for (var i = 0; i < this.props.length; i++) {
		// new matrix centered on the origin
		mat = mat4.create();
		myProp = this.props[i].prop;
		// rotate and translate according to "home", "pivot", "helper", and "hand"
		for (j = HOME; j<=HAND; j++) {
			mat4.rotate(mat, mat, myProp[ELEMENTS[j]].azimuth, ZAXIS);
			mat4.rotate(mat, mat, myProp[ELEMENTS[j]].zenith, YAXIS);
			mat4.translate(mat, mat, [0,0,myProp[ELEMENTS[j]].radius]);
			mat4.rotate(mat, mat, -myProp[ELEMENTS[j]].zenith, YAXIS);
			mat4.rotate(mat, mat, -myProp[ELEMENTS[j]].azimuth, ZAXIS);
		}
		var s = myProp.prop.vectorize().rotate(myProp.bend,myProp.prop.vectorize().cross(myProp.axis)).spherify();
		// BEND
		mat4.rotate(mat, mat, s.azimuth, ZAXIS);
		mat4.rotate(mat, mat, s.zenith, YAXIS);
		// GRIP and CHOKE
		mat4.translate(mat, mat, [0,0,0.5*myProp.prop.radius]);
		mat4.rotate(mat, mat, myProp.grip, XAXIS);
		mat4.translate(mat, mat, [0,0,(-myProp.choke-0.5)*myProp.prop.radius]);
		// TWIST
		if (myProp.prop.vectorize().nearly(WALL)) {
			// handle the weird cusp
			mat4.rotate(mat, mat, myProp.twist+WHEEL.between(myProp.axis), ZAXIS);
		} else {
			// use the rest of the time
			mat4.rotate(mat, mat, myProp.twist+WALL.between(myProp.axis), ZAXIS);
		}
		for (var j = 0; j<this.props[i].shapes.length; j++) {
			this.props[i].shapes[j].matrix = mat;
			// so far, poi are the only props that can change visual prop radius
			if (myProp.propType === "poi") {
				this.props[i].updatePoi(myProp);
			}
		}
	}
	this.scene.modelView();
	this.renderer.render(this.scene);
}

function PhoriaProp(myProp) {
	this.prop = myProp;
	this.propType = myProp.propType;
	this.color = myProp.color;
	this.fire = myProp.fire;
	if (myProp.propType === "poi") {
		this.shapes = this.poiShapes(myProp);
	} else if (myProp.propType === "staff") {
		this.shapes = this.staffShapes(myProp);
	} else if (myProp.propType === "hoop") {
		this.shapes = this.hoopShapes(myProp);
	} else if (myProp.propType === "noprop") {
		this.shapes = [];
	} else {
		this.shapes = this.poiShapes(myProp);
	}
	this.currentScale = myProp.prop.radius; //???
}
PhoriaProp.prototype.poiShapes = function(myProp) {
	var handle = PhoriaSphere(0.05, 3);
	var tether = PhoriaCylinder(0.001, 1, 3);
	PhoriaTranslatePoints(tether,[0,0,0.5]);
	var ball = PhoriaSphere(0.2, 8);
	var flame = PhoriaFlame(6);	
	handle.style.color = PhoriaColor(myProp.color);
	PhoriaTranslatePoints(ball,[0,0,1]);
	PhoriaTranslatePoints(flame,[0,0,1]);
	tether.style.color = PhoriaColor("gray");
	if (myProp.fire === false) {
		ball.style.color = PhoriaColor(myProp.color);
		return [handle,tether,ball];
	} else {
		ball.style.color = PhoriaColor("fire");
		return [handle,tether,ball,flame];
	}
}
PhoriaProp.prototype.updatePoi = function(myProp) {
	var tether = this.shapes[1].points;
	for (var i = 0; i<tether.length; i++) {
		tether[i].z = myProp.prop.radius*tether[i].z / this.currentScale;
	}
	var head = this.shapes[2].points;
	for (var i=0; i<head.length; i++) {
		head[i].z = head[i].z - this.currentScale + myProp.prop.radius;
	}
	if (myProp.fire === true) {
		var flame = this.shapes[3].points;
		for (var i=0; i<flame.length; i++) {
			flame[i].z = flame[i].z - this.currentScale + myProp.prop.radius;
		}
	}
	this.currentScale = myProp.prop.radius;
}
PhoriaProp.prototype.staffShapes = function(myProp) {
	var staff= PhoriaCylinder(0.025, 2, 8);
	staff.style.color = PhoriaColor(myProp.color);
	var handle = PhoriaCylinder(0.026, 0.1, 8);
	handle.style.color = PhoriaColor(myProp.color);
	var flame1;
	var flame2;
	if (myProp.fire==true) {
		flame1 = PhoriaFlame(5);
		flame2 = PhoriaFlame(5);
		PhoriaTranslatePoints(flame1,[0,0,1]);
		PhoriaTranslatePoints(flame2,[0,0,-1]);
		return [staff,handle,flame1,flame2];
	}
	return [staff,handle];
}
PhoriaProp.prototype.hoopShapes = function(myProp) {
	var shapes = [];
	var a = 2*Math.PI/18;
	var len = 0.25*(1-Math.sin(a))/Math.cos(a);
	var section;
	for (var i=0; i<18; i++) {
		section = PhoriaCylinder(0.025, len, 6);
		PhoriaSwapPoints(section, "y", "z");
		PhoriaTranslatePoints(section, [0,0,0.5]);
		PhoriaRotatePoints(section, i*a, "y", "z");
		PhoriaTranslatePoints(section, [0,0,0.5]);
		section.style.color = PhoriaColor(myProp.color);
		shapes.push(section);
	}
	var handle = PhoriaCylinder(0.026, 0.1, 6);
	handle.style.color = PhoriaColor(myProp.color);
	PhoriaSwapPoints(handle,"y","z");
	shapes.push(handle);
	var flame;
	a = Math.PI/2;
	if (myProp.fire==true) {
		for (var i=0; i<4; i++) {
			flame = PhoriaFlame(3);
			PhoriaTranslatePoints(flame, [0,0,0.8]);
			PhoriaRotatePoints(flame, i*a, "y", "z");
			PhoriaTranslatePoints(flame, [0,0,0.5]);
			shapes.push(flame);
		}
	}
	return shapes;
}



// Helper methods for Phoria
function PhoriaSwapPoints(shape, a, b) {
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
function PhoriaTranslatePoints(shape, vector) {
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
function PhoriaRotatePoints(shape, angle, a, b) {
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

function PhoriaColor(s) {
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

function PhoriaCylinder(thickness, length, facets) {
	var c = Phoria.Util.generateCylinder(thickness,length,facets);
	var cylinder = Phoria.Entity.create({
		points: c.points,
		edges: c.edges,
		polygons: c.polygons
	});
	PhoriaSwapPoints(cylinder,"y","z");
	return cylinder;
}
function PhoriaSphere(size, facets) {
	var s = Phoria.Util.generateSphere(size,facets,facets);
	var sphere = Phoria.Entity.create({
			points: s.points,
			edges: s.edges,
			polygons: s.polygons
	});
	return sphere;
}
function PhoriaFlame(size) {
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
	f.textures[0] = Phoria.Util.generateRadialGradientBitmap(32,"rgba(128,64,32,1)","rgba(128,64,32,0)");
	f.points = [f.position];
	return f;
}	
//*** End Phoria3dRenderer;

VS3D.VisualSpinnerWidget = function(options) {return new VisualSpinnerWidget(options);}
VS3D.HTML5Canvas2dRenderer = function(options) {return new HTML5Canvas2dRenderer();}
VS3D.Phoria3dRenderer = function(options) {return new Phoria3dRenderer();}
return VS3D;
})(VS3D);
