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
            updateTimeCoder();
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
  handleChange = (e)=>{
    chooseTime(e.target.value);
  }
  componentDidUpdate = ()=>{
    if (ytPlayer && this.props.youtube) {
      ytPlayer.cueVideoById(this.props.youtube);
    }
  }
  render() {
    return (
      <div className="gridover"
        style={{
          display: (this.props.video) ? "block" : "none",
          borderStyle: "solid",
          borderColor: "lightgray",
          borderWidth: "1px",
          backgroundColor: "white",
          width: "705px",
          height: "393px",
          position: "absolute",
          zIndex: +1
      }}>
        <div style={{backgroundColor: "black", paddingTop: "3px"}}>
          <video id="video" height="400px" controls src={this.props.mp4} type="video/mp4" height="350px" width="700px"
            style={{display: (this.props.mp4) ? "block" : "none"}}>
            Your browser does not support HTML5 video.
          </video>
          <div id="youtube" style={{
            display: (this.props.youtube) ? "block" : "none"}}/>
        </div>
        <button title="save timecodes as JSON text file" onClick={saveTimeCodes}>Save</button>
        <button title="load timecodes from JSON text file" onClick={loadTimeCodes}>Load</button>
        <select id="timecodes" onChange={gotoTimeCode}>
          <option>(timecodes)</option>
        </select>
        <button title="add a timecode" onClick={addTimeCode}>Add</button>
        <button title="remove current timecode" onClick={removeTimeCode}>Remove</button>
        <button style={{marginLeft: "10px"}} onClick={backVideoFrame} >&lt;</button>
        <input id="vframes" type="text" size="4" value={timecoder.getTime() || 0} onChange={this.handleChange}></input>
        <button onClick={forwardVideoFrame}>&gt;</button>
        <div style={{float: "right"}}>
          <button title="load a YouTube video using the YouTube API" onClick={cueYouTubeVideo}>YouTube</button>
          <button title="load an *.mp4 video from your computer" onClick={cueMP4Video}>*.mp4</button>
          <button title="pop up a downloadable version of a Facebook video" onClick={popupFacebook}>Facebook</button>
        </div>
      </div>
    );
  }
}



function setDisplayYouTube(youtube) {
  store.dispatch({type: "SET_YOUTUBE", youtube: youtube});
}

function setDisplayMP4(mp4) {
  store.dispatch({type: "SET_MP4", mp4: mp4});
}

function toggleVideoTools() {
  if (vidFrozen) {
    return;
  }
  let {video} = store.getState();
  store.dispatch({type: "SET_VIDEO", video: !video});
}







function saveTimeCodes() {
  let fname = store.getState().filename;
  VS3D.save(timecoder.timecodes,"timecodes_"+fname);
}

function loadTimeCodes() {
  let json = document.createElement("input");
  json.type = "file";
  json.accept = "application/json";
  json.style.display = "none";
  json.onchange = ()=>{
    let files = json.files;
    let reader = new FileReader();
    reader.onload = (f)=>{
      if (reader.result) {
        try {
          let timecodes = JSON.parse(reader.result);
          console.log(timecodes);
          timecoder.timecodes = timecodes;
          timecoder.update();
        } catch (e) {
          throw e;
        }
      }
    }
    if (files[0]) {
      reader.readAsText(files[0]);
    }
  }
  json.click();
}


  timecoder.getTime = function() {
    let t;
    if (store.getState().mp4) {     
        if (!document.getElementById("video") || !document.getElementById("video").currentTime) {
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
  let val = document.getElementById("vframes").value;
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
          setDisplayYouTube(null);
          setDisplayMP4(path);
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

- refactor out all the timecoder stuff to use Redux state.
- create a new interface that has ticks but no saving or loading.
- revamp the JSON format.

*/