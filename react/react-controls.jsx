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
    // return (
    //   <div>
    //     <select><option>(timecodes)</option></select>
    //     <button>Load</button>
    //     <button>Import</button>
    //     <button>Save</button>
    //     <button>Add</button>
    //     <button>Remove</button>
    //     <button>&lt;</button>
    //     <input type="number" />
    //     <button>&gt;</button>
    //   </div>
    // );
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

class DisplayPanel extends React.PureComponent {
  handleEngine = ()=>{
    this.props.setDisplayEngine();
  }
  handleYouTube = ()=>{
    this.props.setDisplayYouTube();
  }
  handleMP4 = ()=>{
    this.props.setDisplayMP4();
  }
  handleFacebook = ()=>{
    let url = prompt("Enter the video URL, then right-click the popup to download:");
    if (url) {
      let popup = window.open(url.replace("www.","m."), '_blank', 'width=500,height=500');
    }
  }
  render() {
    return <div/>;
    // return (
    //   <div>
    //     <button>VisualSpinner3D</button>
    //     <span style={{marginLeft: "20px"}}>
    //       <button>YouTube</button>
    //       <button>*.mp4</button>
    //       <button onClick={this.handleFacebook}>Facebook</button>
    //     </span>
    //   </div>
    // );
  }
}