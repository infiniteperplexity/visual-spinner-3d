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
    this.props.gotoSeconds(e.target.value);
    // do we need code to send this to the correct tick2? 
  }
  handleForwardFrame = ()=>{
    // move seconds forward
    if (this.props.mp4) {

    } else if (this.props.youtube) {

    }
  }
  handleBackFrame = ()=>{
    // move seconds backward
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
        <button title="add a timecode" onClick={this.handleAddCode}>Add</button>
        <button title="remove current timecode" onClick={this.handleRemoveCode}>Remove</button>
        <button title="to previous timecode" onClick={this.handleBackCode}>&lt;&lt;</button>
        <button title="to next timecode timecode" onClick={this.handleNextCode}>&gt;&gt;</button>
        <button style={{marginLeft: "10px"}} onClick={this.handleBackFrame} >&lt;</button>
        <input id="vframes" type="text" size="4" value={this.props.seconds || 0} onChange={this.handleChange}></input>
        <button onClick={this.handleNextFrame}>&gt;</button>
        <div style={{float: "right"}}>
          <button title="load a YouTube video using the YouTube API" onClick={this.handleYouTube}>YouTube</button>
          <button title="load an *.mp4 video from your computer" onClick={this.handleMP4}>*.mp4</button>
          <button title="pop up a downloadable version of a Facebook video" onClick={this.handleFacebook}>Facebook</button>
        </div>
      </div>
    );
  }
}

function addTimeCode(seconds) {
  let {timecodes} = store.getState();
  timecodes = clone(timecodes);

  store.;dispatch({type: "SET_STATE", timecodes: timecodes});
}

function removeTimeCode(seconds) {
  let {timecodes} = store.getState();
  timecodes = clone(timecodes);

  store.;dispatch({type: "SET_STATE", timecodes: timecodes});
}

function gotoSeconds(seconds) {
  if (this.props.mp4) {

  } else if (this.props.youtube) {
      
  }
  store.dispatch({type: "SET_SECONDS", seconds: seconds});
}


function setYouTube(youtube) {
  let {timecodes} = store.getState();
  timecodes = clone(timecodes);

  store.;dispatch({type: "SET_STATE", timecodes: timecodes});
  store.dispatch({type: "SET_YOUTUBE", youtube: youtube});
}

function setMP4(mp4) {
  let {timecodes} = store.getState();
  timecodes = clone(timecodes);

  store.;dispatch({type: "SET_STATE", timecodes: timecodes});
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

/*

So...let's talk about how the functionality works...three/four major things, right?

Forward/Back seconds.
Forward/Back timecodes.
Add/remove codes.


*/