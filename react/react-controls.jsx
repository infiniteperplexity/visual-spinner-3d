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
  };
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