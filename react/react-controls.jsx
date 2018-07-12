class ControlPanel extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.RATE = 15;
  }
  handlePlay = (e)=>{
    e.preventDefault();
    this.props.validateTransition();
    this.props.setFrozen(true);
    player.goto(this.props.tick);
    player.play();
  }
  handlePause = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    // probably want to gotoTick...
    player.stop();
    this.props.gotoTick(player.tick);
  }
  handleRewind = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    player.stop();
    player.goto(player.tick-this.RATE);
    this.props.gotoTick(player.tick)
  };
  handleFrame = (e)=>{
    this.props.setFrozen(false);
    player.stop();
    player.goto(e.target.value);
    this.props.gotoTick(player.tick);
  }
  handleForward = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    player.stop();
    player.goto(player.tick+this.RATE);
    this.props.gotoTick(player.tick);
  }
  handleReset = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    player.reset();
    this.props.gotoTick(-1);
  }
  render() {
    // need to figure out how to handle ticks.
    return (
      <div>
        <button onClick={this.handlePlay}>Play</button>
        <button onClick={this.handlePause}>Pause</button>
        <button onClick={this.handleRewind}>&lt;</button>
        <input id="panelTicks" type="number" style={{width:"80px"}} onChange={this.handleFrame} onInput={this.handleFrame} value={this.props.tick}/>
        <button onClick={this.handleForward}>&gt;</button>
        <button onClick={this.handleReset}>Reset</button>
      </div>
    );
  }
}

class PlaneMenu extends React.Component {
  handleChange = (e)=>{
    if (this.props.frozen) {
      return;
    }
    this.props.setPlane(e.target.value);
  }
  render() {
    return (
      <select value={this.props.plane} onChange={this.handleChange}>
        <option value="WALL">Wall Plane</option>
        <option value="WHEEL">Wheel Plane</option>
        <option value="FLOOR">Floor Plane</option>
      </select>
    );
  }
}


class ImportButton extends React.Component {
  handleInput = (json)=>{
    this.props.loadJSON(json);
  }
  handleClick = (e)=>{
    e.preventDefault();
    this.props.fileInput();
  }
  render() {
    return <button onClick={this.handleClick}>Import</button>
  }
}