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
	let controls = new VS3D.Controls(player);
	timecoder.getTime = function() {
		let t;
		if (store.getState().mp4) {    	
	    	if (!document.getElementById("video").currentTime) {
	    		return 0;
	    	}
    		t = parseFloat(VS3D.round(document.getElementById("video").currentTime, 1/this.RATE).toFixed(3));
    	} else {
    		if (!ytPlayer.getCurrentTime) {
    			return 0;
    		}
	    	t = parseFloat(VS3D.round(player.getCurrentTime(), 1/this.RATE).toFixed(3));
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
    	}
    	this.update();
    }
    setTimeout(()=>{
		ytPlayer = new YT.Player('player', {
	        width: '700',
	        height: '350',
	        videoId: 'bHQqvYy5KYo',
	        events: {
	        	onReady: ()=>{
	        		frozen = false;
	        		updateTimeCoder();
	        	},
	        	onStateChange: updateTimeCoder
	        }
	    });
	},500);
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
function backFrame() {
	if (vidFrozen) {
		return;
	}
	timecoder.setTime(Math.max(0, timecoder.getTime()-1/timecoder.RATE));
}
function forwardFrame() {
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
		} catch(e) {
			alert("invalid url");
		}
	}
}

function cueMP4Video() {
  let mp4 = document.getElementById("mp4");
  mp4.onclick = ()=>{
    let files = mp4.files;
    if (files[0]) {
      let path = files[0].name;
      document.getElementById("video").src = path;
    }
  }
  mp4.click();
}

function popupFacebook() {
	let url = prompt("Enter the video URL, then right-click the popup to download:");
	if (url) {
		let popup = window.open(url.replace("www.","m."), '_blank', 'width=500,height=500');
	}
}