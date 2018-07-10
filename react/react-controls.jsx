class ControlPanel extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.RATE = 15;
  }
  handlePlay = (e)=>{
    e.preventDefault();
    if (this.props.transitionWorks()) {
      this.props.acceptTransition();
    }
    this.props.setTransition(false);
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
    this.props.gotoTick(player.tick);
    this.props.renderEngine();
  }
  handleRewind = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    this.props.updateEngine();
    player.stop();
    player.goto(player.tick-this.RATE);
    this.props.gotoTick(player.tick);
    this.props.renderEngine();
  }
  handleFrame = (e)=>{
    this.props.setFrozen(false);
    this.props.updateEngine();
    player.stop();
    player.goto(e.target.value);
    this.props.gotoTick(player.tick);
    this.props.renderEngine();
  }
  handleForward = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    this.props.updateEngine();
    player.stop();
    player.goto(player.tick+this.RATE);
    this.props.gotoTick(player.tick);
    this.props.renderEngine();
  }
  handleReset = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    player.reset();
    this.props.gotoTick(-1);
    this.props.renderEngine();
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
    let saveState = clone(store.getState());
    let savedProps = clone(player.props);
    try {
      let props = parse(json);
      for (let i=0; i<props.length; i++) {
        player.props[i] = new PropWrapper();
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
            state.tick<-1 ||
            parseInt(state.tick) !== state.tick
        ) {
        throw new Error("still working on error messages");
      }

      this.props.restoreState(state);
      this.props.pushState();
      this.props.gotoTick(-1);
      this.props.checkLocks();
      this.props.renderEngine();
    } catch (e) {
      alert("invalid input!");
      console.log(json);
      console.log(e);
      this.props.restoreState(saveState);
        for (let i=0; i<savedProps.length; i++) {
        for (let key in savedProps[i]) {
          player.props[i][key] = savedProps[i][key];
        }
      }
    }
  }
  handleClick = (e)=>{
    e.preventDefault();
    let input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.style.display = "none";
    input.onchange = ()=>{
      let files = input.files;
      console.log(files);
      let reader = new FileReader();
      reader.onload = (f)=>{
        if (reader.result) {
          this.handleInput(reader.result);
        }
      }
      if (files[0]) {
        reader.readAsText(files[0]);
      }
    }
    document.body.appendChild(input);
    input.click();
    setTimeout(()=>document.body.removeChild(input),0);
  }
  render() {
    return <button onClick={this.handleClick}>Import</button>
  }
}