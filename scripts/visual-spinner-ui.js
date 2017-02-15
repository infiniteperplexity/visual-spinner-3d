//"Import" is not yet implemented in any browser so we use this horrible hacky thing...
function loadScripts(callback) {
	var github = "https://raw.githubusercontent.com/infiniteperplexity/visual-spinner-3d/master/scripts/";

	$.getScript(github + "gl-matrix-min.js")
		.done(function( script, textStatus ) {
	$.getScript(github + "phoria-min.js")
		.done(function( script, textStatus ) {
	$.getScript(github + "three.min.js")
		.done(function( script, textStatus ) {
	$.getScript(github + "OrbitControls.js")
	  .done(function( script, textStatus ) {

	console.log( textStatus );
	console.log("loaded");
	callback();

	}).fail(function( jqxhr, settings, exception ) {
		$( "div.log" ).text( "Triggered ajaxError handler." );
	});
	}).fail(function( jqxhr, settings, exception ) {
		$( "div.log" ).text( "Triggered ajaxError handler." );
	});
	}).fail(function( jqxhr, settings, exception ) {
	  $( "div.log" ).text( "Triggered ajaxError handler." );
	});
	}).fail(function( jqxhr, settings, exception ) {
	  $( "div.log" ).text( "Triggered ajaxError handler." );
	});
}



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
	this.renderer = null;
	this.controls = []; // a list of control elements
	this.annotations = [];
	this.textCursor = 0;
	this.text = document.createElement("p");
	this.text.innerHTML = "";
	this.text.style.color = "yellow";
	this.text.style.position = "absolute";
	this.text.style.top = "10px";
	this.text.style.zIndex = "1";
	//rescope all the constants to the widget
	for (var c in VS3D.Constants)  {
		this[c] = VS3D.Constants[c];
	}
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
	this.div.style.position = "relative";
	this.div.appendChild(this.text);
}
VisualSpinnerWidget.prototype.ready = function(callback) {
	callback = callback || function() {};
	let that = this;
	loadScripts(function() {
		console.log("ready");
		if (that.renderer===null) {
			that.renderer = new Phoria3dRenderer();
		}
		that.renderer.activate(that);
		that.renderer.render(that.scene);
		for (var i = 0; i<that.scene.props.length; i++) {
			that.scene.starting[i].orientToProp(that.scene.props[i]);
		}
		that.renderText();
		callback();
	});
};

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
			control.appendChild(document.createElement("option"));
			control.class = "vs3d-2d3d-control";
			control.options[0].text = "2d";
			control.options[0].value = "2d";
			control.options[1].text = "3d";
			control.options[1].value = "3d";
			control.options[2].text = "WebGL";
			control.options[2].value = "WebGL";
			control.options[1].selected = "selected";
			control.style.width = "50px";
			$(control).data("widget", this);
			$(control).data("2d", new HTML5Canvas2dRenderer());
			$(control).data("3d", new Phoria3dRenderer());
			$(control).data("WebGL", new Phoria3dRenderer());
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
        this.scene.props.length = 0;
        this.scene.starting.length = 0;
       	var jsonprops = JSON.parse(json);
        var p;
        var j;
        for (var prop in jsonprops) {
	        p = this.addProp();
	        j = JSON.stringify(jsonprops[prop]);
	        p.definePosition(p.parseProp(j));
	        p.defineMoves(p.parseProp(j));
        }
        this.renderer.activate(this);
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
		} else if (prop.propType === "club") {
			this.renderClub(prop);
		} else if (prop.propType === "fan") {
			this.renderFan(prop);
		} else if (prop.propType === "buugeng") {
			this.renderBuugeng(prop);
		} else if (prop.propType === "flipbuu") {
			this.renderFlipBuu(prop);
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

HTML5Canvas2dRenderer.prototype.renderClub = function(prop) {
	// Redundant calculation, could pass this as a parameter if necessary
	var bend = prop.prop.vectorize().rotate(prop.bend,prop.prop.vectorize().cross(prop.axis)).spherify();
	//handle
	this.context.beginPath();
	this.context.moveTo(0,0);
	this.context.lineTo(20*Math.sin(bend.zenith)*prop.prop.radius,0);
	this.context.lineWidth = 6;
	this.context.strokeStyle = "gray";
	this.context.stroke();
	//pommel
	this.context.beginPath();
	this.context.arc(0,0,6,0,2*Math.PI);
	this.context.fillStyle = this.color(prop.color);
	this.context.fill();
	this.context.lineWidth = 1;
	this.context.strokeStyle = "gray";
	this.context.stroke();
	//head
	this.context.beginPath();
	drawEllipse(this.context,20*Math.sin(bend.zenith)*prop.prop.radius,-6,40,12);
	this.context.fillStyle = this.color(prop.color);
	this.context.fill();
	this.context.lineWidth = 1;
	this.context.strokeStyle = "gray";
	this.context.stroke();
	if (prop.fire === true) {
		this.drawFlame(60*Math.sin(bend.zenith)*prop.prop.radius,0);
	}
}
function drawEllipse(ctx, x, y, w, h) {
  var kappa = .5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  //ctx.closePath(); // not used correctly, see comments (use to close off open path)
  ctx.stroke();
}
HTML5Canvas2dRenderer.prototype.renderFan = function(prop) {
	// Redundant calculation, could pass this as a parameter if necessary
	var bend = prop.prop.vectorize().rotate(prop.bend,prop.prop.vectorize().cross(prop.axis)).spherify();
	//handle
	this.context.beginPath();
	this.context.arc(0,0,8,0,2*Math.PI);
	this.context.lineWidth = 3;
	this.context.strokeStyle = this.color(prop.color);
	this.context.stroke();
	// cross bars
	this.context.beginPath();
	this.context.moveTo(0.4*60*Math.sin(bend.zenith)*prop.prop.radius,60*Math.sin(bend.zenith)*prop.prop.radius*Math.sqrt(2)/4);
	this.context.lineTo(60*Math.sin(bend.zenith)*prop.prop.radius*Math.sqrt(2)/2,0);
	this.context.lineWidth = 3;
	this.context.strokeStyle = this.color(prop.color);
	this.context.stroke();
	this.context.beginPath();
	this.context.moveTo(0.4*60*Math.sin(bend.zenith)*prop.prop.radius,-60*Math.sin(bend.zenith)*prop.prop.radius*Math.sqrt(2)/4);
	this.context.lineTo(60*Math.sin(bend.zenith)*prop.prop.radius*Math.sqrt(2)/2,0);
	this.context.lineWidth = 3;
	this.context.strokeStyle = this.color(prop.color);
	this.context.stroke();
	//tines
	this.context.save();
	this.context.rotate(-Math.PI/4);
	for (var i = 0; i<3; i++) {
		this.context.beginPath();
		this.context.moveTo(0,0);
		this.context.lineTo(60*Math.sin(bend.zenith)*prop.prop.radius,0);
		this.context.lineWidth = 3;
		this.context.strokeStyle = this.color(prop.color);
		this.context.stroke();
		if (prop.fire === true) {
			this.drawFlame(60*Math.sin(bend.zenith)*prop.prop.radius,0);
		}
		this.context.rotate(Math.PI/4);
	}
	this.context.restore();
}
HTML5Canvas2dRenderer.prototype.renderBuugeng = function(prop) {
	// Redundant calculation, could pass this as a parameter if necessary
	var bend = prop.prop.vectorize().rotate(prop.bend,prop.prop.vectorize().cross(prop.axis)).spherify();
	this.context.beginPath();
	this.context.arc(30*Math.sin(bend.zenith)*prop.prop.radius,0,30*Math.sin(bend.zenith)*prop.prop.radius,0,Math.PI);
	this.context.lineWidth = 3;
	this.context.strokeStyle = this.color(prop.color);
	this.context.stroke();
	this.context.beginPath();
	this.context.arc(-30*Math.sin(bend.zenith)*prop.prop.radius,0,30*Math.sin(bend.zenith)*prop.prop.radius,0,Math.PI,true);
	this.context.lineWidth = 3;
	this.context.strokeStyle = this.color(prop.color);
	this.context.stroke();
	if (prop.fire === true) {
		this.drawFlame(60*Math.sin(bend.zenith)*prop.prop.radius,0);
		this.drawFlame(-60*Math.sin(bend.zenith)*prop.prop.radius,0);
	}
}
HTML5Canvas2dRenderer.prototype.renderFlipBuu = function(prop) {
	// Redundant calculation, could pass this as a parameter if necessary
	var bend = prop.prop.vectorize().rotate(prop.bend,prop.prop.vectorize().cross(prop.axis)).spherify();
	this.context.beginPath();
	this.context.arc(30*Math.sin(bend.zenith)*prop.prop.radius,0,30*Math.sin(bend.zenith)*prop.prop.radius,0,Math.PI,true);
	this.context.lineWidth = 3;
	this.context.strokeStyle = this.color(prop.color);
	this.context.stroke();
	this.context.beginPath();
	this.context.arc(-30*Math.sin(bend.zenith)*prop.prop.radius,0,30*Math.sin(bend.zenith)*prop.prop.radius,0,Math.PI);
	this.context.lineWidth = 3;
	this.context.strokeStyle = this.color(prop.color);
	this.context.stroke();
	if (prop.fire === true) {
		this.drawFlame(60*Math.sin(bend.zenith)*prop.prop.radius,0);
		this.drawFlame(-60*Math.sin(bend.zenith)*prop.prop.radius,0);
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
function Phoria3dRenderer() {
	this.props = [];
}

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
	} else if (myProp.propType === "club") {
		this.shapes = this.clubShapes(myProp);
	} else if (myProp.propType === "fan") {
		this.shapes = this.fanShapes(myProp);
	} else if (myProp.propType === "buugeng") {
		this.shapes = this.buugengShapes(myProp);
	} else if (myProp.propType === "flipbuu") {
		this.shapes = this.flipBuuShapes(myProp);
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
PhoriaProp.prototype.clubShapes = function(myProp) {
	var pommel = PhoriaSphere(0.075, 3);
	var tip = PhoriaSphere(0.1, 3);
	var handle = PhoriaCylinder(0.05, 0.21, 8);
	var segment1 = PhoriaCylinder(0.065, 0.11, 8);
	var segment2 = PhoriaCylinder(0.08, 0.11, 8);
	var segment3 = PhoriaCylinder(0.1, 0.11, 8);
	var segment4 = PhoriaCylinder(0.125, 0.11, 8);
	var segment5 = PhoriaCylinder(0.15, 0.11, 8);
	var segment6 = PhoriaCylinder(0.125, 0.11, 8);
	var segment7 = PhoriaCylinder(0.1, 0.11, 8);
	pommel.style.color = PhoriaColor(myProp.color);
	handle.style.color = PhoriaColor("gray");
	segment1.style.color = PhoriaColor(myProp.color);
	segment2.style.color = PhoriaColor(myProp.color);
	segment3.style.color = PhoriaColor(myProp.color);
	segment4.style.color = PhoriaColor(myProp.color);
	segment5.style.color = PhoriaColor("gray");
	segment6.style.color = PhoriaColor(myProp.color);
	segment7.style.color = PhoriaColor(myProp.color);
	PhoriaTranslatePoints(handle,[0,0,0.21]);
	PhoriaTranslatePoints(segment1,[0,0,0.32]);
	PhoriaTranslatePoints(segment2,[0,0,0.44]);
	PhoriaTranslatePoints(segment3,[0,0,0.55]);
	PhoriaTranslatePoints(segment4,[0,0,0.66]);
	PhoriaTranslatePoints(segment5,[0,0,0.77]);
	PhoriaTranslatePoints(segment6,[0,0,0.88]);
	PhoriaTranslatePoints(segment7,[0,0,0.99]);
	PhoriaTranslatePoints(tip,[0,0,1.05]);
	var flame = PhoriaFlame(6);
	PhoriaTranslatePoints(flame,[0,0,1]);
	if (myProp.fire === false) {
		tip.style.color = PhoriaColor(myProp.color);
		return [handle,pommel,tip,segment1,segment2,segment3,segment4,segment5,segment6,segment7];
	} else {
		tip.style.color = PhoriaColor("fire");
		return [handle,pommel,tip,segment1,segment2,segment3,segment4,segment5,segment6,segment7,flame];
	}


}
PhoriaProp.prototype.fanShapes = function(myProp) {
	var shapes = [];
	var a = 2*Math.PI/8;
	var len = 0.25*(1-Math.sin(a))/Math.cos(a);
	var section;
	for (var i=0; i<8; i++) {
		section = PhoriaCylinder(0.01, len, 4);
		PhoriaSwapPoints(section, "y", "z");
		PhoriaTranslatePoints(section, [0,0,0.15]);
		PhoriaRotatePoints(section, i*a, "y", "z");
		section.style.color = PhoriaColor(myProp.color);
		shapes.push(section);
	}
	var tines = []
	var ntines = 3;
	for (var i=0; i<ntines; i++) {
		section = PhoriaCylinder(0.01, 0.9, 4);
		PhoriaTranslatePoints(section,[0,0,0.6]);
		PhoriaRotatePoints(section, -Math.PI/4+i*Math.PI/4, "y", "z");
		section.style.color = PhoriaColor(myProp.color);
		shapes.push(section);
	}
	for (var i=0; i<ntines-1; i++) {
		section = PhoriaCylinder(0.01, 0.4, 4);
		PhoriaSwapPoints(section, "y", "z");
		PhoriaTranslatePoints(section, [0,0,0.5]);
		PhoriaRotatePoints(section, -Math.PI/8+i*Math.PI/4, "y", "z");
		section.style.color = PhoriaColor(myProp.color);
		shapes.push(section);
	}
	for (var i=0; i<ntines-1; i++) {
		section = PhoriaCylinder(0.01, 0.6, 4);
		PhoriaSwapPoints(section, "y", "z");
		PhoriaTranslatePoints(section, [0,0,0.75]);
		PhoriaRotatePoints(section, -Math.PI/8+i*Math.PI/4, "y", "z");
		section.style.color = PhoriaColor(myProp.color);
		shapes.push(section);
	}
	if (myProp.fire == true) {
		for (var i=0; i<ntines; i++) {
			section = PhoriaFlame(4);
			PhoriaTranslatePoints(section, [0,0,1.1]);
			PhoriaRotatePoints(section, -Math.PI/4+i*Math.PI/4, "y", "z");
			shapes.push(section);
		}
	}
	return shapes;
}

//not sure if I should handle flipped buugeng using grip or the prop
PhoriaProp.prototype.buugengShapes = function(myProp) {
	var shapes = [];
	var a = 2*Math.PI/18;
	var len = 0.25*(1-Math.sin(a))/Math.cos(a);
	var section;
	for (var i=6; i<14; i++) {
		section = PhoriaCylinder(0.025, len, 6);
		PhoriaSwapPoints(section, "y", "z");
		PhoriaTranslatePoints(section, [0,0,0.5]);
		PhoriaRotatePoints(section, i*a, "y", "z");
		PhoriaTranslatePoints(section, [0,0.5,0]);
		PhoriaRotatePoints(section, 0.4*Math.PI, "y", "z");
		if (i%2==1) {
			if (myProp.color == "white") {
				section.style.color = PhoriaColor("gray");
			} else {
				section.style.color = PhoriaColor("white");
			}
		} else {
			section.style.color = PhoriaColor(myProp.color);
		}
		shapes.push(section);
	}
	for (var i=6; i<14; i++) {
		section = PhoriaCylinder(0.025, len, 6);
		PhoriaSwapPoints(section, "y", "z");
		PhoriaTranslatePoints(section, [0,0,0.5]);
		PhoriaRotatePoints(section, i*a+Math.PI, "y", "z");
		PhoriaTranslatePoints(section, [0,-0.5,0]);
		PhoriaRotatePoints(section, 0.4*Math.PI, "y", "z");
		if (i%2==1) {
			if (myProp.color == "white") {
				section.style.color = PhoriaColor("gray");
			} else {
				section.style.color = PhoriaColor("white");
			}
		} else {
			section.style.color = PhoriaColor(myProp.color);
		}
		shapes.push(section);
	}
	var handle = PhoriaCylinder(0.026, 0.1, 8);
	var flame;
	if (myProp.fire == true) {
		flame = PhoriaFlame(4);
		PhoriaTranslatePoints(flame, [0,0,1]);
		PhoriaRotatePoints(flame, -0.075*Math.PI, "y", "z");
		shapes.push(flame);
		flame = PhoriaFlame(4);
		PhoriaTranslatePoints(flame, [0,0,-1]);
		PhoriaRotatePoints(flame, -0.075*Math.PI, "y", "z");
		shapes.push(flame);
	}
	return shapes;
}

PhoriaProp.prototype.flipBuuShapes = function(myProp) {
	var shapes = [];
	var a = 2*Math.PI/18;
	var len = 0.25*(1-Math.sin(a))/Math.cos(a);
	var section;
	for (var i=6; i<14; i++) {
		section = PhoriaCylinder(0.025, len, 6);
		PhoriaSwapPoints(section, "y", "z");
		PhoriaTranslatePoints(section, [0,0,0.5]);
		PhoriaRotatePoints(section, i*a, "y", "z");
		PhoriaTranslatePoints(section, [0,0.5,0]);
		PhoriaRotatePoints(section, 0.4*Math.PI, "y", "z");
		PhoriaRotatePoints(section, Math.PI, "x", "z");
		if (i%2==1) {
			if (myProp.color == "white") {
				section.style.color = PhoriaColor("gray");
			} else {
				section.style.color = PhoriaColor("white");
			}
		} else {
			section.style.color = PhoriaColor(myProp.color);
		}
		shapes.push(section);
	}
	for (var i=6; i<14; i++) {
		section = PhoriaCylinder(0.025, len, 6);
		PhoriaSwapPoints(section, "y", "z");
		PhoriaTranslatePoints(section, [0,0,0.5]);
		PhoriaRotatePoints(section, i*a+Math.PI, "y", "z");
		PhoriaTranslatePoints(section, [0,-0.5,0]);
		PhoriaRotatePoints(section, 0.4*Math.PI, "y", "z");
		PhoriaRotatePoints(section, Math.PI, "x", "z");
		if (i%2==1) {
			if (myProp.color == "white") {
				section.style.color = PhoriaColor("gray");
			} else {
				section.style.color = PhoriaColor("white");
			}
		} else {
			section.style.color = PhoriaColor(myProp.color);
		}
		shapes.push(section);
	}
	var handle = PhoriaCylinder(0.026, 0.1, 8);
	var flame;
	if (myProp.fire == true) {
		flame = PhoriaFlame(4);
		PhoriaTranslatePoints(flame, [0,0,1]);
		PhoriaRotatePoints(flame, -0.075*Math.PI, "y", "z");
		PhoriaRotatePoints(flame, Math.PI, "x", "z");
		shapes.push(flame);
		flame = PhoriaFlame(4);
		PhoriaTranslatePoints(flame, [0,0,-1]);
		PhoriaRotatePoints(flame, -0.075*Math.PI, "y", "z");
		PhoriaRotatePoints(flame, Math.PI, "x", "z");
		shapes.push(flame);
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

var github = "https://raw.githubusercontent.com/infiniteperplexity/visual-spinner-3d/master/scripts/";
// load custom shaders
var vShader;
var fShader;
$.ajax({
	url : "scripts/vertex.vert",
  dataType: "text",
  success : function (result) {
		vShader = result;
  }
});
$.ajax({
	url : "scripts/fragment.frag",
  dataType: "text",
  success : function (result) {
		fShader = result;
  }
});

// Begin ThreeHS3dRenderer
	function ThreeJS3dRenderer() {}

	ThreeJS3dRenderer.prototype.activate = function(widget) {
	  //var gl, experimental;
	  /*try { gl = canvas.getContext("webgl"); }
	  catch (x) { gl = null; }

	  if (gl == null) {
	      try { gl = canvas.getContext("experimental-webgl"); experimental = true; }
	      catch (x) { gl = null; }
	  }
	  if (gl===null) {
	    alert("WebGL not supported!");
	  }*/
		this.timestamp = Date.now();
	  var WIDTH = 400;
	  var HEIGHT = 400;
	  this.renderer = new THREE.WebGLRenderer({antialias: true});
	  this.renderer.setSize(WIDTH,HEIGHT);
	  this.renderer.setClearColor(0x333F47, 1);
	  var div = widget.div;
	  div.removeChild(widget.canvas);
	  div.removeChild(div.children[0]);
	  div.appendChild(this.renderer.domElement);
	  div.appendChild(document.createElement('br'));
	  this.scene = new THREE.Scene();

	  this.camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.1, 1000);

	  this.camera.position.set(0,1,8);
	  this.scene.add(this.camera);
		this.renderer.setClearColor(0x000000,1.0);
	  var light = new THREE.PointLight(0xffffff);
		light.position.set(-100,200,100);
		this.scene.add(light);
	  this.props = [];
		// need to figure how to chain the loading...
	  this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		var grid = new THREE.GridHelper(200,10);
	  grid.setColors(0x333333, 0x333333);
	  this.scene.add(grid);
	  this.scene.fog = new THREE.FogExp2( 0x000000, 0.0128 );
	  this.renderer.render(this.scene, this.camera);
	  this.controls.update();
		var that = this;
		function animate() {
	    requestAnimationFrame(animate);
	    that.renderer.render(that.scene,that.camera);
	    that.controls.update();
	  }
	  this.requestId = animate();
	};

	ThreeJS3dRenderer.prototype.camera = function(_x,_y,_z) {
		this.camera.position = {x: _x, y: _y, z: _z};
	}
	ThreeJS3dRenderer.prototype.cameraX = function() {
		return this.camera.position.x;
	}
	ThreeJS3dRenderer.prototype.cameraY = function() {
		return this.camera.position.y;
	}
	ThreeJS3dRenderer.prototype.cameraZ = function() {
		return this.camera.position.z;
	}
	ThreeJS3dRenderer.prototype.deactivate = function(widget) {
	  var div = widget.div;
	  div.removeChild(this.renderer.domElement);
	  div.removeChild(div.children[0]);
	  div.appendChild(widget.canvas);
	  div.appendChild(document.createElement('br'));
		window.cancelAnimationFrame(this.requestId);
	  //cancelAnimationFrame
	}
	ThreeJS3dRenderer.prototype.clean = function() {
		//do nothing
	}
	ThreeJS3dRenderer.prototype.render = function(scene) {
	  var myProp;
	  // remove any shapes that shouldn't be there
	  for (var i = 0; i<this.props.length; i++) {
	    myProp = this.props[i].prop;
	    if (scene.props.indexOf(myProp)===-1) {
	      for (var j = 0; j<this.props[i].shapes.length; j++) {
	        //!!!Whatever we need to do to remove old shapes
	        this.scene.remove(this.props[i].shapes[j]);
	        this.props[i] = null;
	      }
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
	      newProp = new ThreeJSProp(myProp);
	      this.props.push(newProp);
	      for (var k=0; k<newProp.shapes.length; k++) {
	        this.scene.add(newProp.shapes[k]);
	      }
	    }
	  }
	  // rebuild any renderers whose properties have changed
	  for (var i = 0; i < this.props.length; i++) {
	    if (	this.props[i].propType !== this.props[i].prop.propType
	        || this.props[i].color !== this.props[i].prop.color
	        ||	this.props[i].fire !== this.props[i].prop.fire)	{
	      for (var j = 0; j<this.props[i].shapes.length; j++) {
	        this.scene.remove(this.props[i].shapes[j]);
	      }
	      newProp = new ThreeJSProp(this.props[i].prop);
	      this.props.push(newProp);
	      for (var k=0; k<newProp.shapes.length; k++) {
	        this.scene.add(newProp.shapes[k]);
	      }
	    }
	  }
	  var start, mat;
		for (var i = 0; i < this.props.length; i++) {
			// new matrix centered on the origin
			myProp = this.props[i].prop;
			// rotate and translate according to "home", "pivot", "helper", and "hand"
	    for (s=0; s<this.props[i].shapes.length; s++) {
	      var shape = this.props[i].shapes[s];
	      shape.position.x = 0;
	      shape.position.y = 0;
	      shape.position.z = 0;
	      shape.rotation.x = 0;
	      shape.rotation.y = 0;
	      shape.rotation.z = 0;
	       for (j = HOME; j<=HAND; j++) {
	         shape.rotateZ(-myProp[ELEMENTS[j]].azimuth);  //from y
	         shape.rotateX(-myProp[ELEMENTS[j]].zenith);
	         shape.translateX(myProp[ELEMENTS[j]].radius);
	         shape.rotateX(myProp[ELEMENTS[j]].zenith);
	         shape.rotateZ(myProp[ELEMENTS[j]].azimuth);
	  		 }
	  		 var s = myProp.prop.vectorize().rotate(myProp.bend,myProp.prop.vectorize().cross(myProp.axis)).spherify();
	  		// // BEND
	       shape.rotateZ(-s.azimuth);
	       shape.rotateX(-s.zenith);
	  		// // GRIP and CHOKE
	       shape.translateX(0.5*myProp.prop.radius);
	       //shape.rotateZ(myProp.grip);
	       shape.translateX((-myProp.choke-0.5)*myProp.prop.radius);
	  		// // TWIST
	  		 if (myProp.prop.vectorize().nearly(WALL)) {
	  		 	// handle the weird cusp
	  		 	shape.rotateZ(-myProp.twist+WHEEL.between(myProp.axis), ZAXIS);
	  		 } else {
	  		 	// use the rest of the time
	         shape.rotateZ(-myProp.twist+WALL.between(myProp.axis), ZAXIS);
	  		 }
				 //update or animate prop if necessary
	  	}
			if (this.props[i].updateProp) {
				this.props[i].updateProp(this);
			}
		}

		//material.uniforms
	  this.renderer.render(this.scene, this.camera);
	  this.controls.update();
	}

	function ThreeJSProp(myProp) {
		this.prop = myProp;
		this.propType = myProp.propType;
		this.color = myProp.color;

		this.fire = myProp.fire;
		if (myProp.propType === "poi") {
			this.shapes = this.poiShapes(myProp);
		} else if (myProp.propType === "staff") {
			this.shapes = this.staffShapes(myProp);
			//this.shapes = this.staffShapes(myProp);
		} else if (myProp.propType === "hoop") {
			this.shapes = this.hoopShapes(myProp);
			//this.shapes = this.hoopShapes(myProp);
		} else if (myProp.propType === "club") {
			this.shapes = this.poiShapes(myProp);
			//this.shapes = this.clubShapes(myProp);
		} else if (myProp.propType === "fan") {
			this.shapes = this.fanShapes(myProp);
			//this.shapes = this.fanShapes(myProp);
		} else if (myProp.propType === "buugeng") {
			this.shapes = this.poiShapes(myProp);
			//this.shapes = this.buugengShapes(myProp);
		} else if (myProp.propType === "flipbuu") {
			this.shapes = this.poiShapes(myProp);
			//this.shapes = this.flipBuuShapes(myProp);
		} else if (myProp.propType === "noprop") {
			this.shapes = [];
		} else {
			this.shapes = this.poiShapes(myProp);
		}
		this.currentScale = myProp.prop.radius; //???
	  //!!!!!Need to actually draw a poi now

	}

ThreeJSProp.prototype.updateProp = function(renderer) {
	for (var i=0; i<this.shapes.length; i++) {
		var children = this.shapes[i].children;
		for (var j=0; j<children.length; j++) {
			if (children[j].material.uniforms) {
				children[j].material.uniforms['time'].value = 0.00025*(Date.now()-renderer.timestamp);
			}
		}
	}
};

ThreeJSProp.prototype.poiShapes = function(myProp) {
	// this stuff isn't working yet
	var material;
	var model = new THREE.SphereGeometry(0.2,16,16);
	//material = new THREE.MeshLambertMaterial({color: myProp.color});
	var loader = new THREE.TextureLoader();
	material = new THREE.ShaderMaterial( {
		uniforms: {
				tExplosion: {
						type: "t",
						value: loader.load( 'scripts/explosion.png' )
				},
				time: { // float initialized to 0
						type: "f",
						value: 0.0
				}
		},
		vertexShader: vShader,
		fragmentShader: fShader
	} );
	var sphere = new THREE.Mesh(model, material);
	sphere.position.x = 1;
	var group = new THREE.Group();
	group.add(sphere);
	model = new THREE.CylinderGeometry(0.025,0.025,1,4);
	material = new THREE.MeshLambertMaterial({color: "gray"});
	var cylinder = new THREE.Mesh(model, material);
	cylinder.rotateZ(Math.PI/2);
	cylinder.translateY(-0.5);
	group.add(cylinder);
	model = new THREE.SphereGeometry(0.075,8,8);
	material = new THREE.MeshLambertMaterial({color: myProp.color});
	sphere = new THREE.Mesh(model, material);
	group.add(sphere);
	return [group];
}

ThreeJSProp.prototype.staffShapes = function(myProp) {
	var group = new THREE.Group();
	var model = new THREE.CylinderGeometry(0.05,0.05,2,8);
	var material = new THREE.MeshLambertMaterial({color: myProp.color});
	var cylinder = new THREE.Mesh(model, material);
	cylinder.rotateZ(Math.PI/2);
	group.add(cylinder);
	model = new THREE.CylinderGeometry(0.065,0.065,0.2,8);
	material = new THREE.MeshLambertMaterial({color: myProp.color});
	cylinder = new THREE.Mesh(model, material);
	cylinder.rotateZ(Math.PI/2);
	group.add(cylinder);
	return [group];
}

ThreeJSProp.prototype.hoopShapes = function(myProp) {
	var group = new THREE.Group();
	var model = new THREE.TorusGeometry(0.8,0.05,8,32);
	var material = new THREE.MeshLambertMaterial({color: myProp.color});
	var torus = new THREE.Mesh(model, material);
	torus.rotateX(Math.PI/2);
	group.add(torus);
	model = new THREE.CylinderGeometry(0.075,0.075,0.2,8);
	material = new THREE.MeshLambertMaterial({color: myProp.color});
	var cylinder = new THREE.Mesh(model, material);
	cylinder.rotateX(Math.PI/2);
	cylinder.translateX(-0.8);
	group.add(cylinder);
	return [group];
}

ThreeJSProp.prototype.fanShapes = function(myProp) {
	var group = new THREE.Group();
	var model = new THREE.TorusGeometry(0.2,0.05,6,16);
	var material = new THREE.MeshLambertMaterial({color: myProp.color});
	var torus = new THREE.Mesh(model, material);
	torus.rotateX(Math.PI/2);
	group.add(torus);
	var cylinder;
	var nTines = 3;
	var a = Math.PI/4;
	for (var i=0; i<nTines; i++) {
		model = new THREE.CylinderGeometry(0.05,0.05,0.8,8);
		material = new THREE.MeshLambertMaterial({color: myProp.color});
	 	cylinder = new THREE.Mesh(model, material);
		cylinder.rotateZ(Math.PI/2);
	 	cylinder.rotateX(-a+i*a);
	 	cylinder.translateY(-0.6);
	 	group.add(cylinder);
	}
	for (var j=0; j<nTines-1; j++) {
	 	model = new THREE.CylinderGeometry(0.05,0.05,0.45,8);
		material = new THREE.MeshLambertMaterial({color: myProp.color});
	 	cylinder = new THREE.Mesh(model, material);
		cylinder.rotateZ(Math.PI/2);
		cylinder.rotateX(Math.PI/2);
		cylinder.rotateX(-a/2+j*a);
		cylinder.translateZ(0.5);
	 	group.add(cylinder);
	}
	return [group];
}

VS3D.VisualSpinnerWidget = function(options) {return new VisualSpinnerWidget(options);}
VS3D.HTML5Canvas2dRenderer = function(options) {return new HTML5Canvas2dRenderer();}
VS3D.Phoria3dRenderer = function(options) {return new Phoria3dRenderer();}
VS3D.ThreeJS3dRenderer = function(options) {return new ThreeJS3dRenderer();}
return VS3D;
})(VS3D);
