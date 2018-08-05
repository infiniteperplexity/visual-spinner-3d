let renderer, store;
const {
	dummy, fit, fits, matches, 
	angle, nearly, zeroish, vector$spherify, sphere$vectorize, sphere$planify, angle$spherify,
	clone, merge,
	round,
	BEAT,
	LEFT, RIGHT,
	NODES, HEAD, GRIP, HAND, PIVOT, HELPER, BODY,
	parse, stringify, save,
	flatten, submove, beats, spin, resolve, elapsed, cumulate,
	Prop, Move, PropWrapper
} = VS3D;

const NPROPS = 2;
const COLORS = ["red","blue"];
const ANGLES = [LEFT, RIGHT];

let	player = new VS3D.Player();
player.speed = 1;
player.rate = 1;
for (let i=0; i<NPROPS; i++) {
	let prop = player.addProp(new VS3D.Prop(), {color: COLORS[i]});
	prop.setHeadAngle(ANGLES[i]);
	prop.setHandAngle(ANGLES[i]);
}

let panelTicks = -1;
let framePanel;
let timecoder = new VS3D.TimeCoder();
let ytPlayer;
let vidFrozen = true;
function afterReactMounts() {
	renderer = new VS3D.ThreeRenderer(document.getElementById("display"), 350, 350);
	// store.dispatch({type: "SET_FRAME", frame: player.tick});
	framePanel = document.getElementById("panelTicks");
	player.update = function(positions) {
		playEngineTick(this.tick, this.props, positions);
	}
	gotoTick(-1);
	renderEngine();
	timecoder.getTime = function() {
		let t;
		if (store.getState().mp4) {    	
	    	if (!document.getElementById("video").currentTime) {
	    		return 0;
	    	}
    		t = parseFloat(VS3D.round(document.getElementById("video").currentTime, 1/this.RATE).toFixed(3));
    	} else {
    		if (!ytPlayer || !ytPlayer.getCurrentTime) {
    			return 0;
    		}
	    	t = parseFloat(VS3D.round(ytPlayer.getCurrentTime(), 1/this.RATE).toFixed(3));
	   	}
    	return t;
    }
    timecoder.setTime = function(t) {
    	if (store.getState().mp4) {
    		document.getElementById("video").currentTime = t;
    	} else {
    		ytPlayer.seekTo(t);
    		setTimeout(()=>this.update(),100);
    		setTimeout(()=>ytPlayer.pauseVideo(),1000);
    		document.getElementById("vframes").value = t.toFixed(3);
    	}
    	this.update();
    }
    timecoder.update = function() {
    	document.getElementById("vframes").value = this.getTime();
    	let codes = document.getElementById("timecodes");
		codes.innerHTML = "<option value='null'>(timecodes)</option>";
		let selected = false;
		for (let code of this.timecodes) {
			let node = document.createElement("option");
			node.innerHTML = code;
			node.value = code;
			if (VS3D.nearly(parseFloat(code), this.getTime(), 1/this.RATE)) {
				node.selected = true;
				selected = true;
			}
			codes.appendChild(node);
		}
		if (!selected) {
			codes.firstChild.selected = true;
		}
    }
}

window.onYouTubeIframeAPIReady = function() {
	ytPlayer = new YT.Player('youtube', {
	    width: '700',
	    height: '350',
	    videoId: 'bHQqvYy5KYo',
	    events: {
	      	onReady: ()=>{
	        	vidFrozen = false;
	        	updateTimeCoder();
	        },
	        onStateChange: updateTimeCoder
	    }
	});
}

function updateTimeCoder() {
	timecoder.update();
}


function gotoTimeCode() {
	if (vidFrozen) {
		return;
	}
	let val = document.getElementById("timecodes").value;
	timecoder.setTime(parseFloat(val));
}

function addTimeCode() {
	if (vidFrozen) {
		return;
	}
	timecoder.add();
}

function removeTimeCode() {
	if (vidFrozen) {
		return;
	}
	timecoder.remove();
}
function backVideoFrame() {
	if (vidFrozen) {
		return;
	}
	timecoder.setTime(Math.max(0, timecoder.getTime()-1/timecoder.RATE));
}
function forwardVideoFrame() {
	if (vidFrozen) {
		return;
	}
	timecoder.setTime(timecoder.getTime()+1/timecoder.RATE);
}
function chooseTime() {
	if (vidFrozen) {
		return;
	}
	let val = input.value;
	if (parseFloat(val)===parseFloat(String(parseFloat(val)))) {
		timecoder.setTime(parseFloat(val));
	}
}

function cueYouTubeVideo() {
	let url = prompt("Enter URL or YouTube ID");
	// let url = document.getElementById("url").value;
	if (url) {
		url = url.split("/");
		url = url[url.length-1];
		url = url.split("&");
		url = url[0];
		url = url.split("=");
		url = url[url.length-1];
		try {
			ytPlayer.cueVideoById(url);
			setDisplayMP4(null);
			setDisplayYouTube(url);
		} catch(e) {
			alert("invalid url");
		}
	}
}

function cueMP4Video() {
	let input = document.createElement("input");
  	input.type = "file";
  	input.accept = "video/mp4";
  	input.style.display = "none";
  	input.onclick = ()=>{
    	let files = input.files;
	    if (files[0]) {
	      	let path = files[0].name;
	      	setDisplayYouTube(null);
	      	setDisplayMP4(path);
	    }
	};
  	input.click();
}

function popupFacebook() {
	let url = prompt("Enter the video URL, then right-click the popup to download:");
	if (url) {
		let popup = window.open(url.replace("www.","m."), '_blank', 'width=500,height=500');
	}
}