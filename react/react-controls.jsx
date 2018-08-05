class ControlPanel extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.RATE = 15;
  }
  handlePlay = (e)=>{
    e.preventDefault();
    for (let move of store.getState().moves) {
      if (move.length===0) {
        return;
      }
    }
    // just to make sure
    this.props.updateEngine();
    this.props.validateTransition();
    this.props.setFrozen(true);
    player.goto(this.props.frame);
    player.play();
  }
  handlePause = (e)=>{  
    e.preventDefault();
    this.props.setFrozen(false);
    player.stop();
  }
  handleRewind = (e)=>{
    e.preventDefault();
    for (let move of store.getState().moves) {
      if (move.length===0) {
        return;
      }
    }
    this.props.setFrozen(false);
    player.stop();
    player.goto(player.tick-this.RATE);
    this.props.skipToEngineTick(player.tick);
  }
  handleFrame = (e)=>{
    for (let move of store.getState().moves) {
      if (move.length===0) {
        return;
      }
    }
    this.props.setFrozen(false);
    player.stop();
    player.goto(e.target.value);
    this.props.skipToEngineTick(player.tick);
  }
  handleForward = (e)=>{
    for (let move of store.getState().moves) {
      if (move.length===0) {
        return;
      }
    }
    e.preventDefault();
    this.props.setFrozen(false);
    player.stop();
    player.goto(player.tick+this.RATE);
    this.props.skipToEngineTick(player.tick);
  }
  handleReset = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    player.reset();
    this.props.gotoTick(-1);
    this.props.setScrolled(0);
  }
  render() {
    // need to figure out how to handle ticks.
    return (
      <div>
        <button onClick={this.handlePlay}>Play</button>
        <button onClick={this.handlePause}>Pause</button>
        <button onClick={this.handleRewind}>&lt;</button>
        <input id="panelTicks" type="number" style={{width:"80px"}} onChange={this.handleFrame} onInput={this.handleFrame} value={this.props.frame}/>
        <button onClick={this.handleForward}>&gt;</button>
        <button onClick={this.handleReset}>Back to Start</button>
      </div>
    );
  }
}

class PlaneMenu extends React.PureComponent {
  handleChange = (e)=>{
    if (this.props.frozen) {
      return;
    }
    this.props.setPlane(e.target.value);
  }
  render() {
    return (
      <select title="change plane" value={this.props.plane} onChange={this.handleChange}>
        <option value="WALL">Wall Plane</option>
        <option value="WHEEL">Wheel Plane</option>
        <option value="FLOOR">Floor Plane</option>
      </select>
    );
  }
}


class ImportButton extends React.PureComponent {
  handleInput = (json)=>{
    this.props.loadJSON(json);
  }
  handleClick = (e)=>{
    e.preventDefault();
    this.props.fileInput(this.handleInput.bind(this));
  }
  render() {
    return <button title="import a saved JSON sequence" onClick={this.handleClick}>Import</button>
  }
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
        <select id="timecodes" onChange={gotoTimeCode}>
          <option>(timecodes)</option>
        </select>
        <button onClick={addTimeCode}>Add timecode</button>
        <button onClick={removeTimeCode}>Remove timecode</button>
        <button onClick={backVideoFrame} >&lt;</button>
        <input id="vframes" type="text" size="6" value={timecoder.getTime() || 0} onChange={this.handleChange}></input>
        <button onClick={forwardVideoFrame}>&gt;</button>
        <div style={{float: "right"}}>
          <button onClick={cueYouTubeVideo}>YouTube</button>
          <button onClick={cueMP4Video}>*.mp4</button>
          <button onClick={popupFacebook}>Facebook</button>
        </div>
      </div>
    );
  }
}