// path d= for SVG from the Noun Project, clockwise arrow, user 'icon 54', CC license
let ARROW = "M15.85,7.85l-3,3c-0.19,0.2-0.51,0.2-0.7,0l-3-3C9,7.71,8.96,7.5,9.04,7.31C9.12,7.12,9.3,7,9.5,7h1.36  c-0.47-1.889-2.203-3.163-4.241-2.983c-1.802,0.159-3.319,1.6-3.576,3.391C2.688,9.881,4.595,12,7,12  c0.873,0,1.696-0.28,2.371-0.786c0.207-0.155,0.489-0.154,0.672,0.029l1.423,1.423c0.203,0.203,0.202,0.545-0.018,0.73  c-1.162,0.974-2.606,1.535-4.154,1.598c-3.831,0.156-7.189-2.972-7.291-6.805C-0.102,4.243,3.077,1,7,1c3.53,0,6.44,2.55,6.93,6  h1.57c0.2,0,0.38,0.12,0.46,0.31C16.04,7.5,16,7.71,15.85,7.85z";
// polygon points= for double forward arrowhead
let ACC = "8,4 0,2 0,6 8,4 8,0 16,4 8,8, 8,4";
let DEC = "8,4 0,0 0,8 8,4 8,2 16,4 8,6, 8,4";
let LINEAR = "0,2 8,2 8,0 16,4 8,8 8,6 0,6 0,2";

class MovePanel extends React.Component {
  handleDurationChange = (e)=>{
    this.props.setDuration({
      propid: this.props.getActivePropId(),
      ticks: round(e.target.value,0.5)
    });
  }
  render() {
    let propid = this.props.getActivePropId();
    let move;
    if (this.props.tick===-1) {
      move = this.props.starters[propid];
    } else if (this.props.moves[propid].length===0) {
      // I don't think this ever happens
      return null;
    } else {
      move = submove(this.props.moves[propid], this.props.tick).move;
    }
    let locks = this.props.locks;
    let color = this.props.colors[propid];
    let gcolor = (locks.grip) ? "gray" : color;
    let hcolor = (locks.helper) ? "gray" : color;
    let bcolor = (locks.body) ? "gray" : color;
    const SVG = 25;
    const TEXT = 35;
    let txt, buttons;
    if (this.props.tick===-1) {
      txt = "tick 0";
    } else if (this.props.transition) {
      txt = "tick "+this.props.tick;
    } else {
      txt = "tick "+this.props.tick+" to "+(this.props.tick+beats(move)*BEAT);
      buttons = <div>
        <button>-</button>
        <input type="number" min="22.5" step="22.5" onChange={this.handleDurationChange} value={beats(move)*BEAT} />
        <button>+</button>
      </div>;
    }
    let duration = <div style={{
      color: "black"
    }}>
      {txt}
      {buttons}
    </div>;
    // placeholder
    // duration = <div>(duration info will go here)</div>;
    return (
      <div style={{color: "lightgray"}} className="grid movepanel">
        {duration}
        <MoveControl node="head" move={move} propid={propid} {...this.props}/>
        <MoveControl node="grip" move={move} propid={propid} {...this.props}/>
        <MoveControl node="hand" move={move} propid={propid} {...this.props}/>
        <MoveControl node="helper" move={move} propid={propid} {...this.props}/>
        <MoveControl node="pivot" move={move} propid={propid} {...this.props}/>
        <MoveControl node="body" move={move} propid={propid} {...this.props}/>
      </div>
    );
  }
}

class MoveControl extends React.Component {
  handleMouseDown = (e)=>{    
    if (this.props.frozen) {
      return;
    }
    if (!["head","grip","body","helper"].includes(this.props.node)) {
      return;
    }
    let node = this.props.node;
    let locked = this.props.locks[node];
    this.props.setLock(node, !locked);
  }
  handleClockwise = (e)=>{
    if (this.props.frozen) {
      return;
    }
    this.props.modifySpins({propid: this.props.propid, node: this.props.node, n: +1});
  }
  handleCounter = (e)=>{
      if (this.props.frozen) {
      return;
    }
    this.props.modifySpins({propid: this.props.propid, node: this.props.node, n: -1});
  }
  
  handleSpeedUp = (e)=>{
    if (this.props.frozen) {
      return;
    }
    this.props.modifyAcceleration({propid: this.props.propid, node: this.props.node, n: +1});
  }
  handleSlowDown = (e)=>{
    if (this.props.frozen) {
      return;
    }
    this.props.modifyAcceleration({propid: this.props.propid, node: this.props.node, n: -1});
  }
  render() {
    const SVG = 25;
    let graphic;
    let propid = this.props.order[this.props.order.length-1];
    let node = this.props.node;
    let color = this.props.colors[propid];
    let locked = (["grip","helper","body"].includes(node) && this.props.locks[node]);
    if (locked) {
      color = "lightgray";
    }
    let niceNames = {
      body: "body",
      pivot: "shoulder",
      helper: "elbow",
      hand: "hand",
      grip: "handle",
      head: "head"
    };
    if (node==="body") {
      graphic = <BodyNode x={SVG} y={SVG} dim={SVG/6} fill={color}/>;
    } else if (node==="pivot") {
      graphic = <PivotNode x={SVG} y={SVG} dim={SVG/5} fill={color}/>;
    } else if (node==="helper") {
      graphic = <HelperNode x={SVG} y={SVG} dim={SVG/5} fill={color}/>;
    } else if (node==="hand") {
      if (this.props.locks.grip) {
        graphic = <GripNode x={SVG} y={SVG} dim={SVG/9} fill={color}/>;
      } else {
        graphic = <HandNode x={SVG} y={SVG} dim={SVG/5} fill={color}/>;
      }
    } else if (node==="grip") {
      graphic = <GripNode x={SVG} y={SVG} dim={SVG/9} fill={color}/>;
    } else if (node==="head") {
      graphic = <HeadNode x={SVG} y={SVG} dim={SVG/5} fill={color}/>;
    }
    let move;
    if (this.props.tick>-1) {
      move = submove(this.props.moves[propid], this.props.tick).move;
    }
    // let stroke = (color==="#ffffff") ? "lightgray" : color;
    let stroke = "lightgray";
    let buttons = (locked || this.props.tick===-1 || this.props.transition) ? null : [
        <SpeedMeter key="0" move={move} color={color} node={node}/>,
        <SpeedButton key="1" onClick={this.handleCounter} title="less clockwise / more counterclockwise">
          <path d={ARROW} transform="scale(-1, 1) translate(-20, 5)" fill={color} stroke={stroke}/>
        </SpeedButton>,
        <SpeedButton key="2" onClick={this.handleClockwise} title="more clockwise / less counterclockwise">
          <path d={ARROW} transform="translate(5, 5)" fill={color} stroke={stroke}/>
        </SpeedButton>,
        <SpeedButton key="3" onClick={this.handleSpeedUp} title="starts slower / ends faster">
          <polygon points={ACC} transform="translate(5, 9)" fill={color} stroke={stroke}/>
        </SpeedButton>,
        <SpeedButton key="4" onClick={this.handleSlowDown} title="starts faster / ends slower">
          <polygon points={DEC} transform="translate(5, 9)" fill={color} stroke={stroke}/>
        </SpeedButton>
    ];
    // <polygon points={DEC} transform="scale(-1, 1) translate(-20, 9)" fill={color} stroke="lightgray"/>
    let tether1 = {stroke: "gray"};
    let tether2 = {stroke: "gray"};
    if (node==="head") {
      tether1.strokeWidth = 3;
      if (!this.props.locks.head) {
        tether1.strokeDasharray = "3,3";
      }
      tether2.strokeWidth = 0;
    } else if (node==="grip") {
      tether1.strokeDasharray = "5,5";
      if (!this.props.locks.head) {
        tether2.strokeDasharray = "3,3";
      }
      tether2.strokeWidth = 3;
    } else if (node==="body") {
      tether1.strokeWidth = 0;
      tether2.strokeDasharray="5,5";
    } else {
      tether1.strokeDasharray="5,5";
      tether2.strokeDasharray="5,5";
    }
    let title;
    if (node==="head" && this.props.locks.head) {
      title = "Click to 'unlock' the tether, allowing its length to change.";
    } else if (node==="head") {
      title = "Click to 'lock' the tether, preventing its length from changing.";
    } else if (node==="hand") {
      title = "This node represents the spinner's hand.";
    } else if (node==="grip") {
      title = "Click to "+((locked)?"en":"dis")+"able the 'handle' node, which represents varying where hand grips the prop.";
    } else if (node==="helper") {
      title = "Click to "+((locked)?"en":"dis")+"able the 'elbow' node, which is sometimes used to fine-tune movements.";
    } else if (node==="pivot") {
      title = "The 'shoulder' node is often used to shift moves horizontally or vertically.";
    } else if (node==="body") {
      title = "Click to "+((locked)?"en":"dis")+"able the 'body' node, which represents the spinner's body moving.";
    }
    return (
      <div className="grid movecontrol">
        <svg height={2*SVG} width={2*SVG}>
          <line x1={SVG} y1={0} x2={SVG} y2={SVG} style={tether2} />
          <line x1={SVG} y1={SVG} x2={SVG} y2={2*SVG} style={tether1} />
          <g onMouseDown={this.handleMouseDown}>
            <title>{title}</title>
            {graphic}
          </g>
        </svg>
        <p style={{fontSize: "10px", color: (locked) ? "lightgray" : "black"}}>{niceNames[node]+((this.props.tick===-1) ? "" : " speed:")}</p>
        {buttons}
      </div>
    );
  }
}


// okay...we need some stuff here to deal with linear motion
function SpeedMeter(props, context) {
  let {move, node, color} = props;
  let va = move[node] ? move[node].va : 0;
  let va1 = move[node] ? move[node].va1 : va;
  let spin = beats(move)/4;
  let spins = Math.ceil(Math.abs(0.5*(va+va1)*spin));
  let {vl, vl1, la} = move[node];
  let spintransform = "translate(9, 17)";
  if ((va+va1)<0) {
    spintransform = "scale(-1, 1) translate(-25, 17)";
  }
  let acctransform = "translate(34,21)";
  if (Math.abs(va1)<Math.abs(va)) {
    acctransform = "translate(27, 21)";
  }
  let niceNames = {
    body: "body",
    pivot: "shoulder",
    helper: "elbow",
    hand: "hand",
    grip: "handle",
    head: "head"
  };
  let speed = Math.round(Math.abs(va));
  let title = spins + " rotations";
  // deal with linear motion
  if (va===undefined && vl!==undefined) {
    spins = 0;
    title = "linear ("+Math.round(la)+" degrees)";
    if (!nearly(vl, vl1)) {
      if (Math.abs(vl)>Math.abs(vl1)) {
        speed = Math.round(Math.abs(vl1));
        title += ", decelerating to speed " + speed;
      } else {
        speed = Math.round(Math.abs(vl));
        title += ", accelerating from speed " + speed;
      }
    } else if (zeroish(vl)) {
      speed = 0;
      title = "0 rotations, speed 0";
    } else {
      speed = Math.round(Math.abs(vl));
      title += ", speed " + speed;
    }
  } else if (!nearly(va, va1)) {
    if (Math.abs(va)>Math.abs(va1)) {
      speed = Math.round(Math.abs(va1));
      title += ", decelerating to speed " + speed;
    } else {
      speed = Math.round(Math.abs(va));
      title += ", accelerating from speed " + speed;
    }
  } else {
    title += ", speed " + speed;
  }
  let stroke = "lightgray";
  let spinshape = <path d={ARROW} transform={spintransform} fill={color} stroke="lightgray"/>;
  let accshape = <polygon transform={acctransform} points={(Math.abs(va1)<Math.abs(va)) ? DEC : ACC} fill={color} stroke={stroke}/>;
  let spintext = <text textAnchor="middle" x={5} y={29} style={{fontSize: "10px"}}>{spins}</text>;
  let acctext = <text textAnchor="middle" x={Math.abs(va1)<Math.abs(va) ? 46 : 30} y={29} style={{fontSize: "10px"}}>{speed}</text>;
  if (zeroish(spins)) {
    spinshape = null;
    if (vl!==undefined) {
      if (zeroish(vl) && zeroish(vl1)) {
        accshape = null;
        acctext = null;
      } else {
        if (nearly(vl, vl1)) {
          accshape = <polygon transform="translate(34,19)" points="0,0 0,12, 12,6" fill={color} stroke={stroke}/>;
        }
        spinshape = <polygon transform={"translate(11,21) rotate("+(la-90)+" 8 4)"} points={LINEAR} fill={color} stroke={stroke}/>;
        spintext = null;
      }
    }
  }
  if (nearly(va, va1)) {
    if (zeroish(spins)) {
      accshape = null;
      acctext = null;
    } else {
      accshape = <polygon transform="translate(34,19)" points="0,0 0,12, 12,6" fill={color} stroke={stroke}/>;
    }
  }
  return (
    <svg height={49} width={80}>
      <title>{title}</title>
      {spinshape}
      {spintext}
      {accshape}
      {acctext}
    </svg>
  );
}

class SpeedButton extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      stroke: "lightgray",
      fill: "white"
    }
  }
  handleMouseOver = (e)=>{
    this.setState({
      stroke: "cyan",
      fill: "lightcyan"
    });
  }
  handleMouseLeave = (e)=>{
    this.setState({
      stroke: "lightgray",
      fill: "white"
    });
  }
  render() {
    const SVG = 25;
    return (
      <svg height={SVG} width={SVG} onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave} onMouseDown={this.props.onClick}>
        <title>{this.props.title}</title>
        <rect x="1" y="1" height={SVG-2} width={SVG-2} fill={this.state.fill} stroke={this.state.stroke} rx="4" ry="4"/>
        {this.props.children}
      </svg>
    )
  }
}