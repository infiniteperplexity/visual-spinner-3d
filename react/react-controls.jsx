class ControlPanel extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.RATE = 15;
  }
  handlePlay = (e)=>{
    e.preventDefault();
    this.props.setFrozen(true);
    this.props.updateEngine();
    player.goto(this.props.tick);
    player.play();
  }
  handlePause = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    // probably want to gotoTick...
    player.stop();
  }
  handleRewind = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    this.props.updateEngine();
    player.stop();
    player.goto(player.tick-this.RATE);
  }
  handleFrame = (e)=>{
    this.props.setFrozen(false);
    this.props.updateEngine();
    player.stop();
    player.goto(e.target.value)
  }
  handleForward = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    this.props.updateEngine();
    player.stop();
    player.goto(player.tick+this.RATE);
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
        <button onClick={this.handleRewind}>-</button>
        <input id="panelTicks" type="number" style={{width:"80px"}} onChange={this.handleFrame} onInput={this.handleFrame} value={0}/>
        <button onClick={this.handleForward}>+</button>
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

class PopUp extends React.Component {
  handleSubmit = (e)=> {
    if (this.props.frozen) {
      this.props.setPopup(false);
      return;
    }
    e.preventDefault();
    let json = this.txt.value;
    if (json) {
      let saveState = clone(store.getState());
      let savedProps = clone(player.props);
      try {
        let props = parse(json);
        for (let i=0; i<props.length; i++) {
          for (let key in props[i]) {
            player.props[i][key] = props[i][key];
          }
        }
        let state = {
          props: clone(player.props.map(p=>p.prop)),
          moves: clone(player.props.map(p=>p.moves)),
          starters: player.props.map(p=>resolve(fit(p.prop, new Move({beats: 0})))),
          colors: player.props.map(p=>p.color || "red"),
          tick: -1,
          order: player.props.map((_,i)=>(player.props.length-i-1)),
          plane: "WALL",
          locks: {
            helper: true,
            grip: true,
            head: true,
            body: true
          } 
        };
        // should check state and throw errors if it's bad.
        let nprops = state.props.length;
        if (  state.moves.length!==nprops ||
              state.starters.length!==nprops ||
              state.colors.length!==nprops ||
              state.order.length!==nprops
          ) {
          throw new Error("number of props not consistent.");
        }
        if (  !["WALL","WHEEL","FLOOR"].includes(state.plane) ||
              tick<-1 ||
              parseInt(tick) !== tick
          ) {

        }

        this.props.restoreState(state);
        this.props.pushState();
        this.props.gotoTick(-1);
        this.props.checkLocks();
        this.props.renderEngine();
      } catch (e) {
        alert("invalid input!");
        console.log(e);
        this.props.restoreState(saveState);
          for (let i=0; i<savedProps.length; i++) {
          for (let key in savedProps[i]) {
            player.props[i][key] = savedProps[i][key];
          }
        }
      }
    }
    this.props.setPopup(false);
  }
  handleCancel= (e)=> {
    e.preventDefault();
    this.props.setPopup(false);
  }
  render() {
    if (this.props.popup===false) {
      return null;
    }
    return (
      <div style={{
        position: "absolute"
      }}>
        <textarea ref={txt=>this.txt=txt} cols="50" rows="12">

        </textarea>
        <br />
        <button onClick={this.handleSubmit}>
          Submit
        </button>
        <button onClick={this.handleCancel}>
          Cancel
        </button>
      </div>
    );
  }
}