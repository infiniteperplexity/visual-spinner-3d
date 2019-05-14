let ytPlayer;
let vidFrozen = false;
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('youtube', {
      width: '700',
      height: '350',
      videoId: 'bHQqvYy5KYo',
      events: {
          onReady: ()=>{
            vidFrozen = false;
          },
          onStateChange: updateTimeCoder
      }
  });
}

class VideoTools extends React.PureComponent {
  handleFacebook = ()=>{
    let url = prompt("Enter the video URL, then right-click the popup to download:");
    if (url) {
      let popup = window.open(url.replace("www.","m."), '_blank', 'width=500,height=500');
    }
  }
  handleYouTube = ()=>{
    this.props.cueYouTubeVideo();
  }
  handleMP4 = ()=>{
    this.props.cueMP4Video();
  }
  handleChange = (e)=>{
    this.props.gotoSeconds(parseFloat(e.target.value));
    // do we need code to send this to the correct tick2? 
  }
  handleForwardFrame = ()=>{
    this.props.gotoSeconds(this.props.seconds+0.05);
  }
  handleBackFrame = ()=>{
    this.props.gotoSeconds(this.props.seconds-0.05);
  }
  handleAddCode = ()=>{
    this.props.setTimeCode();
    // add a new timecode
  }
  handleInsertCode = ()=>{
    if (confirm("really shift all subsequent codes forward?")) {
      this.props.insertTimeCode();
    }
  }
  handleRemoveCode = ()=>{
    this.props.removeTimeCode();
  }
  handleSliceCode = ()=>{
    if (confirm("really shift all subsequent codes backward?")) {
      this.props.sliceTimeCode();
    }
  }
  componentDidUpdate = (prev)=>{
    if (ytPlayer && this.props.youtube && prev.youtube!==this.props.youtube) {
      ytPlayer.cueVideoById(this.props.youtube);
    }
  }
  render() {
    return (
      <div className="gridover"
        style={{
          display: (this.props.video===0) ? "none" : "block",
          borderStyle: "solid",
          borderColor: "lightgray",
          borderWidth: "1px",
          backgroundColor: "white",
          width: "705px",
          height: "393px",
          left: (this.props.video===-1) ? "-355px" : "0px",
          position: "absolute",
          zIndex: +1
      }}>
        <div style={{backgroundColor: "black", paddingTop: "3px"}}>
          <video id="video" height="400px" controls src={this.props.mp4} type="video/mp4" height="350px" width="700px"
            style={{display: (!this.props.youtube) ? "block" : "none"}}
            onTimeUpdate={this.props.updateTimeCoder}>
            Your browser does not support HTML5 video.
          </video>
          <div id="youtube" style={{display: (this.props.youtube) ? "block" : "none"}}/>
        </div>
        <button title="set current timecode" onClick={this.handleAddCode}>Set</button>
        <button title="remove current timecode" onClick={this.handleRemoveCode}>Unset</button>
        <button title="insert timecode and shift others forward" onClick={this.handleInsertCode}>Insert</button>
        <button title="remove current timecode and shift others back" onClick={this.handleSliceCode}>Slice</button>
        <span style={{marginLeft: "95px"}} />
        <button onClick={this.handleBackFrame} >&lt;</button>
        <input type="text" size="4" value={this.props.seconds.toFixed(3)} onChange={this.handleChange}></input>
        <button onClick={this.handleForwardFrame}>&gt;</button>
        <div style={{float: "right"}}>
          <button title="load a YouTube video using the YouTube API" onClick={this.handleYouTube}>YouTube</button>
          <button title="load an *.mp4 video from your computer" onClick={this.handleMP4}>*.mp4</button>
          <button title="pop up a downloadable version of a Facebook video" onClick={this.handleFacebook}>Facebook</button>
        </div>
        <br/>
        <p style={{fontSize: "12px", marginLeft: "70px", marginTop: "-1px"}}>Timecodes</p>
      </div>
    );
  }
}


function validateTimeCodes() {
  updateCusps();
  let {timecodes} = store.getState();
  timecodes = clone(timecodes);
  for (let index in timecodes) {
    if (!index in _cusps) {
      delete timecodes[index];
    }
  }
  store.dispatch({type: "SET_TIMECODES", timecodes: timecodes});
}

function setTimeCode() {
  validateTimeCodes();
  let {timecodes, tick2, seconds} = store.getState();
  timecodes = clone(timecodes);
  tick2+=1;
  if (timecodes[tick2]===undefined || confirm("replace current timecode?")) {
    timecodes[tick2] = parseFloat(seconds.toFixed(2));
    store.dispatch({type: "SET_TIMECODES", timecodes: timecodes});
  }
}


/* I don't know if this is the logic I actually want, but it is something */
function insertTimeCode() {
  validateTimeCodes();
  let {timecodes, tick2, seconds} = store.getState();
  let keys = Object.keys(timecodes).map(e=>parseInt(e)).filter(e=>!isNaN(e));
  keys.sort((a,b)=>(a-b));
  if (keys.length===0) {
    setTimeCode();
    return;
  }
  let mx = keys[keys.length-1];
  timecodes = clone(timecodes);
  do {
    tick2+=1;
  } while (!(tick2 in timecodes) && tick2<mx);
  if (tick2>mx) {
    timecodes[tick2] = parseFloat(seconds.toFixed(2));
  } else {
    let last = _cusps2.indexOf(mx);
    if (last<_cusps2.length-1) {
      timecodes[_cusps2[last+1]] = timecodes[mx];
    }
    let index = keys.indexOf(tick2);
    for (let i=keys.length-1; i>index; i--) {
      timecodes[keys[i]] = timecodes[keys[i-1]];
    }
    timecodes[tick2] = parseFloat(seconds.toFixed(2));
  }
  store.dispatch({type: "SET_TIMECODES", timecodes: timecodes});
}

function sliceTimeCode() {
  validateTimeCodes();
  let {timecodes, tick2} = store.getState();
  let keys = Object.keys(timecodes).map(e=>parseInt(e)).filter(e=>!isNaN(e));
  keys.sort((a,b)=>(a-b));
  let mx = keys[keys.length-1];
  do {
    tick2+=1;
  } while (!(tick2 in timecodes) && tick2<mx);
  if (tick2>mx) {
    return;
  }
  timecodes = clone(timecodes);
  let index = keys.indexOf(tick2);
  for (let i=index; i<keys.length-1; i++) {
    timecodes[keys[i]] = timecodes[keys[i+1]];
  }
  if (timecodes[mx]!==undefined) {
    delete timecodes[mx];
  }
  store.dispatch({type: "SET_TIMECODES", timecodes: timecodes});
}

function removeTimeCode() {
  validateTimeCodes();
  let {timecodes, tick2} = store.getState();
  timecodes = clone(timecodes);
  let mx = _cusps2[_cusps2.length-1];
  do {
    tick2+=1;
  } while (!(tick2 in _cusps) && tick2<mx);
  timecodes = clone(timecodes);
  if (timecodes[tick2]!==undefined) {
    delete timecodes[tick2];
  }
  store.dispatch({type: "SET_TIMECODES", timecodes: timecodes});
}

function gotoSeconds(seconds) {
  seconds = Math.max(0,seconds);
  seconds = VS3D.round(seconds, 0.05);
  let {mp4, youtube} = store.getState();
  if (mp4) {
    let video = document.getElementById("video");
    if (video) {
      video.currentTime = seconds;
      seconds = VS3D.round(video.currentTime,0.05);
      store.dispatch({type: "SET_SECONDS", seconds: seconds});
    }
  } else if (youtube) {
    if (ytPlayer) {
      ytPlayer.seekTo(seconds);
      // double setTimeout...the first one tries to make the transition look seemless...
      setTimeout(()=>{
        seconds = VS3D.round(ytPlayer.getCurrentTime(),0.05);
        store.dispatch({type: "SET_SECONDS", seconds: seconds});
      },50);
      // ...and the second one makes absolutely sure the transition happens.
      setTimeout(()=>{
        seconds = VS3D.round(ytPlayer.getCurrentTime(),0.05);
        store.dispatch({type: "SET_SECONDS", seconds: seconds});
      },250);
      setTimeout(()=>ytPlayer.pauseVideo(),500);
    }  
  }
}

function updateTimeCoder(event) {
  let {mp4, youtube} = store.getState();
  let seconds;
  if (mp4) {
    seconds = VS3D.round(event.target.currentTime,0.05);
    store.dispatch({type: "SET_SECONDS", seconds: seconds});
  } else if (youtube) {
      if (!ytPlayer || !ytPlayer.getCurrentTime()) {
        seconds = 0;
      } else {
        seconds = VS3D.round(ytPlayer.getCurrentTime(),0.05);
        seconds = ytPlayer.getCurrentTime();
        store.dispatch({type: "SET_SECONDS", seconds: seconds});
      }
  }
  
}


function setYouTube(youtube) {
  let {timecodes} = store.getState();
  timecodes = clone(timecodes);
  timecodes.format = "youtube";
  timecodes.url = youtube;
  store.dispatch({type: "SET_TIMECODES", timecodes: timecodes});
  store.dispatch({type: "SET_YOUTUBE", youtube: youtube});
}

function setMP4(mp4) {
  let {timecodes} = store.getState();
  timecodes = clone(timecodes);
  timecodes.format = "mp4";
  timecodes.url = mp4;
  store.dispatch({type: "SET_TIMECODES", timecodes: timecodes});
  store.dispatch({type: "SET_MP4", mp4: mp4});
}

function toggleVideoTools() {
  if (vidFrozen) {
    return;
  }
  let {video} = store.getState();
  if (video===0) {
    video = 1;
  } else if (video===1) {
    video = -1;
  } else if (video===-1) {
    video = 0;
  }
  store.dispatch({type: "SET_VIDEO", video: video});
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
      setMP4(null);
      setYouTube(url);
      document.getElementById("youtube").style.display = "block";
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
  input.onchange = ()=>{
    let files = input.files;
      if (files[0]) {
          let path = files[0].name;
          if (ytPlayer) {
            ytPlayer.clearVideo();
          }
          setYouTube(null);
          setMP4(path);
          document.getElementById("youtube").style.display = "none";
      }
  }
    input.click();
}

function popupFacebook() {
  let url = prompt("Enter the video URL, then right-click the popup to download:");
  if (url) {
    let popup = window.open(url.replace("www.","m."), '_blank', 'width=500,height=500');
  }
}



/*


        <button title="add a timecode" onClick={this.handleAddCode}>Add</button>
        <button title="remove current timecode" onClick={this.handleRemoveCode}>Remove</button>
        <button title="to previous timecode" onClick={this.handleBackCode}>&lt;&lt;</button>
        <button title="to next timecode timecode" onClick={this.handleNextCode}>&gt;&gt;</button>

*/

/*

- for now, going to seconds never updates tick.
- timecodes are associations between ticks and seconds.
  - if you're crazy, you could have two ticks with the same seconds, but never the reverse, right?

- so adding a removing timecodes is very, very simple.

*/