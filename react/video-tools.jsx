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

class VideoTools extends React.Component {
// class VideoTools extends React.PureComponent {
  handleFacebook = ()=>{
    let url = prompt("Enter the video URL, then right-click the popup to download:");
    if (url) {
      let popup = window.open(url.replace("www.","m."), '_blank', 'width=500,height=500');
    }
  }
  handleYouTube = ()=>{
    alert("sorry, this functionality is currently too buggy");
    // this.props.cueYouTubeVideo();
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
  handleNextCode = ()=>{
    // move forward to the next timecode
  }
  handleBackCode = ()=>{
    // move back to the previous timecode
  }
  handleAddCode = ()=>{
    // add a new timecode
  }
  handleRemoveCode = ()=>{
    // remove the current timecode
  }

  componentDidUpdate = ()=>{
    if (ytPlayer && this.props.youtube) {
      ytPlayer.cueVideoById(this.props.youtube);
    }
  }
  shouldComponentUpdate = (nextProps, nextState)=>{
    let {video, youtube, mp4} = nextProps;
    if (video!==this.props.video || youtube!==this.props.youtube || mp4!==this.props.mp4) {
      return true;
    } else {
      return false;
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
            style={{display: (!this.props.youtube) ? "block" : "none"}}
            onTimeUpdate={this.props.updateTimeCoder}>
            Your browser does not support HTML5 video.
          </video>
          <YouTube youtube={this.props.youtube}/>
        </div>
        <button style={{marginLeft: "10px"}} onClick={this.handleBackFrame} >&lt;</button>
        <SecondsBox seconds={this.props.seconds} handleChange={this.handleChange}/>
        <button onClick={this.handleForwardFrame}>&gt;</button>
        <div style={{float: "right"}}>
          <button title="load a YouTube video using the YouTube API" onClick={this.handleYouTube}>YouTube</button>
          <button title="load an *.mp4 video from your computer" onClick={this.handleMP4}>*.mp4</button>
          <button title="pop up a downloadable version of a Facebook video" onClick={this.handleFacebook}>Facebook</button>
        </div>
      </div>
    );
  }
}

function SecondsBox(props, context) {
  return <input type="text" size="4" value={props.seconds.toFixed(3)} onChange={props.handleChange}></input>
}
function YouTube(props, context) {
  console.log("testing");
  return <div id="youtube" style={{display: (props.youtube) ? "block" : "none"}}/>
}

function addTimeCode(seconds) {
  let {timecodes} = store.getState();
  timecodes = clone(timecodes);

  store.dispatch({type: "SET_TIMECODES", timecodes: timecodes});
}

function removeTimeCode(seconds) {
  let {timecodes} = store.getState();
  timecodes = clone(timecodes);

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
      console.log("seeking to");
      ytPlayer.seekTo(seconds);
      setTimeout(()=>{
        console.log(ytPlayer.getCurrentTime());
        store.dispatch({type: "SET_SECONDS", seconds: seconds});
      },100);
      // seconds = VS3D.round(ytPlayer.getCurrentTime(),0.05);
      setTimeout(()=>ytPlayer.pauseVideo(),1000);
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
        // store.dispatch({type: "SET_SECONDS", seconds: seconds});
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
  store.dispatch({type: "SET_VIDEO", video: !video});
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

- refactor out all the timecoder stuff to use Redux state.
- create a new interface that has ticks but no saving or loading.
- revamp the JSON format.

*/

/*


        <button title="add a timecode" onClick={this.handleAddCode}>Add</button>
        <button title="remove current timecode" onClick={this.handleRemoveCode}>Remove</button>
        <button title="to previous timecode" onClick={this.handleBackCode}>&lt;&lt;</button>
        <button title="to next timecode timecode" onClick={this.handleNextCode}>&gt;&gt;</button>

So...let's talk about how the functionality works...three/four major things, right?

Forward/Back seconds.
Forward/Back timecodes.
Add/remove codes.


*/