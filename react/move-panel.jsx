// path d= for SVG from the Noun Project, clockwise arrow, user 'icon 54', CC license
let ARROW = "M15.85,7.85l-3,3c-0.19,0.2-0.51,0.2-0.7,0l-3-3C9,7.71,8.96,7.5,9.04,7.31C9.12,7.12,9.3,7,9.5,7h1.36  c-0.47-1.889-2.203-3.163-4.241-2.983c-1.802,0.159-3.319,1.6-3.576,3.391C2.688,9.881,4.595,12,7,12  c0.873,0,1.696-0.28,2.371-0.786c0.207-0.155,0.489-0.154,0.672,0.029l1.423,1.423c0.203,0.203,0.202,0.545-0.018,0.73  c-1.162,0.974-2.606,1.535-4.154,1.598c-3.831,0.156-7.189-2.972-7.291-6.805C-0.102,4.243,3.077,1,7,1c3.53,0,6.44,2.55,6.93,6  h1.57c0.2,0,0.38,0.12,0.46,0.31C16.04,7.5,16,7.71,15.85,7.85z";
// polygon points= for double forward arrowhead
let ACC = "8,4 0,2 0,6 8,4 8,0 16,4 8,8, 8,4";
let DEC = "8,4 0,0 0,8 8,4 8,2 16,4 8,6, 8,4";
let LINEAR = "0,2 8,2 8,0 16,4 8,8 8,6 0,6 0,2";
let BREAK = "M0,2 4,2 4,6 0,6 0,2 M6,2 8,2 8,0 16,4 8,8 8,6 6,6 6,2"

class DurationEditor extends React.PureComponent {
  handleDurationChange = (n)=>{
    let {move} = this.props.getActiveMove();
    let duration = beats(move)*BEAT;
    this.props.pushStoreState();
    this.props.setDuration({
      propid: this.props.getActivePropId(),
      ticks: Math.max(0.5*BEAT, duration+n*BEAT)
    });
  }
  handleDurationIncrease = ()=>{
    this.handleDurationChange(0.5);
  }
  handleDurationDecrease = ()=>{
    this.handleDurationChange(-0.5);
  }
  render() {
    let propid = this.props.getActivePropId();
    // want to align this to start of move
    let tick = this.props.tick;
    let tick2 = this.props.tick2;
    if (tick!==-1) {
      let {move, index} = getActiveMove();
      tick = elapsed(this.props.moves[propid], index);
      tick2 = tick + beats(move)*BEAT-1;
    }
    let style = {
      height: "30px",
      borderStyle: "solid",
      borderWidth: "1px",
      borderColor: "lightgray",
      paddingLeft: "16px",
      paddingTop: "4px"
    };
    let content;
    let pnames = [
      "Prop 1",
      "Prop 2",
      "Prop 3",
      "Prop 4"
    ];
    let buttons = null;
    if (this.props.multiselect) {
      let m = this.props.multiselect;
      content = pnames[propid]+", multiple moves from ticks "+m.tick+"-"+m.tick2;
    } else if (tick===-1) {
      content = pnames[propid]+", starting position";
    } else if (this.props.transition) {
      content = pnames[propid]+", transition at tick "+tick;
    } else {
      let move;
      if (tick===-1 || this.props.transition) {
        content = null;
      } if (this.props.moves[propid].length===0) {
        // I don't think this ever happens
        content = null;;
      } else {
        move = submove(this.props.moves[propid], tick).move;
        content = pnames[propid]+", move at ticks "+tick+"-"+tick2+" ("+beats(move)+" "+ ((beats(move)===1) ? "beat) " : "beats) ");
        let color = this.props.colors[propid];
        let plus = <polygon points="0,4 4,4 4,0 8,0 8,4 12,4 12,8 8,8 8,12 4,12 4,8 0,8 0,4" transform="translate(6.5,6.5)" fill={color} stroke="lightgray"/>;
        let minus = <rect x="6.5" y="11" width="12" height="4" fill={color} stroke="lightgray"/>;
        buttons = (<div style={{
          display: "inline-block",
          float: "right",
          paddingRight: "16px"
        }}>
          <SpeedButton title={"shorter"} onClick={this.handleDurationDecrease}>
            {minus}
          </SpeedButton>
          <SpeedButton title={"longer"} onClick={this.handleDurationIncrease}>
            {plus}
          </SpeedButton>
        </div>);
      }
    }
    return (
      <div style={style}>
        <div style={{
          display: "inline-block",
          position: "relative",
          top: "4px",
          fontSize: "14px",
          fontFamily: "Tahoma"
        }}>
          {content}
        </div>
        {buttons}
      </div>
    );
  }
}
class MovePanel extends React.PureComponent {
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
    } else if (this.props.multiselect) {
      // is anything really needed here?
    } else {
      txt = "tick "+this.props.tick+" to "+(this.props.tick+beats(move)*BEAT-1);
      buttons = <div>
        <button>-</button>
        <input style={{
          width: "25px"
        }} type="number" min="22.5" step="22.5" onChange={this.handleDurationChange} value={beats(move)*BEAT} />
        <button>+</button>
      </div>;
    }
    let duration = <div style={{
      color: "black"
    }}>
      {buttons}
    </div>;
    let twist = <TwistControl move={move} color={color} {...this.props}/>;
    let planes = <PlaneControl color={color} {...this.props}/>;
    let toggle = <div><button onClick={this.props.toggleRawEdit}>Edit Raw Values</button></div>;
    if (this.props.transition) {
      planes = null;
      toggle = null;
    }
    return (
      <div style={{
        color: "lightgray",
        borderWidth: "1px",
        paddingTop: "5px",
        paddingLeft: "5px"
        // marginBottom: "9px"
      }} className="grid movepanel">
        <MoveControl node="head" move={move} propid={propid} {...this.props}/>
        <MoveControl node="grip" move={move} propid={propid} {...this.props}/>
        <MoveControl node="hand" move={move} propid={propid} {...this.props}/>
        <MoveControl node="helper" move={move} propid={propid} {...this.props}/>
        <MoveControl node="pivot" move={move} propid={propid} {...this.props}/>
        <MoveControl node="body" move={move} propid={propid} {...this.props}/>
        {twist}
        {planes}
        {toggle}
      </div>
    );
  }
}

class TwistControl extends React.PureComponent {
  handleTwistForward = (e)=>{
    if (this.props.frozen) {
      return;
    }
    let propid = this.props.order[this.props.order.length-1];
    this.props.modifyTwist({propid: propid, twist: +1, vt: +0});
    this.props.pushStoreState();
  }
  handleTwistBackward = (e)=>{
    if (this.props.frozen) {
      return;
    }
    let propid = this.props.order[this.props.order.length-1];
    this.props.modifyTwist({propid: propid, twist: -1, vt: +0});
    this.props.pushStoreState();
  }
  handleTwistPlus = (e)=>{
    if (this.props.frozen) {
      return;
    }
    let propid = this.props.order[this.props.order.length-1];
    this.props.modifyTwist({propid: propid, twist: +0, vt: +1});
    this.props.pushStoreState();
  }
  handleTwistMinus = (e)=>{
    if (this.props.frozen) {
      return;
    }
    let propid = this.props.order[this.props.order.length-1];
    this.props.modifyTwist({propid: propid, twist: +0, vt: -1});
    this.props.pushStoreState();
  }
  render() {
    let propid = this.props.order[this.props.order.length-1];
    if (!["fan","minihoop","hoop","buugeng"].includes(this.props.models[propid])) {
      return null;
    }
    let {move, color} = this.props;
    let stroke = "lightgray";
    let text;
    if (move.twist || move.vt) {
      if (!this.props.transition && this.props.tick!==-1) {
        text = "twist: "+move.twist+" ";
        if (move.vt>=0) {
          text+="+ ";
        } else if (move.vt<0) {
          text+="- ";
        }
        text+=(Math.abs(move.vt*90));
      } else {
        text = "twist: "+move.twist;
      }
    }
    let buttons = [
      <SpeedButton key="0" onClick={this.handleTwistBackward} title={"starting twist backward"}>
         <path d={ARROW} transform="scale(-1, 1) translate(-20, 5)" fill={color} stroke={stroke}/>
      </SpeedButton>,
      <div key="1" style={{display: "inline-block", width: "3px"}}/>,     
      <SpeedButton key="2" onClick={this.handleTwistForward} title={"starting twist forward"}>
        <path d={ARROW} transform="translate(5, 5)" fill={color} stroke={stroke}/>
      </SpeedButton>
    ];
    if (!this.props.transition && this.props.tick!==-1) {
      buttons.push(
        <div key="3" style={{display: "inline-block", width: "3px"}}/>
      );
      buttons.push(
        <SpeedButton key="4" onClick={this.handleTwistMinus} title={"more backward / less forward twist"}>
          <path d={ARROW} transform="scale(-1, 1) translate(-20, 5)" fill={color} stroke={stroke}/>
        </SpeedButton>
      );
      buttons.push(
        <div key="5" style={{display: "inline-block", width: "3px"}}/>
      );
      buttons.push(
        <SpeedButton key="6" onClick={this.handleTwistPlus} title={"more forward / less backward twist"}>
          <path d={ARROW} transform="translate(5, 5)" fill={color} stroke={stroke}/>
        </SpeedButton>
      );
    }
    buttons.push(
      <svg key="7" height="25" width="75">
        <text style={{fontSize: "10px"}} x="35" y="17" textAnchor="middle">
          {text}
        </text>
      </svg>
    );
    return (
      <div>
        {buttons}
      </div>
    );
  }
}

class PlaneControl extends React.PureComponent {
  handleWall = ()=>{
    if (this.props.frozen) {
      return;
    }
    this.props.setPlane("WALL");
  }
  handleFloor = ()=>{
    if (this.props.frozen) {
      return;
    }
    this.props.setPlane("FLOOR");
  }
  handleWheel = ()=>{
    if (this.props.frozen) {
      return;
    }
    this.props.setPlane("WHEEL");
  }
  render() {
    let p = this.props.plane;
    let color = this.props.color;
    let wall = (
      <g>
        <ellipse cx="12.5" cy="12.5" rx="8" ry="8" fill={color} stroke="lightgray" strokeWidth={1}/>;
        <ellipse cx="12.5" cy="12.5" rx={p==="WALL" ? 4 : 6} ry={p==="WALL" ? 4 : 6} fill="white" stroke="lightgray" strokeWidth={1}/>;
      </g>
    );
    let wheel = (
      <g>
        <ellipse cx="12.5" cy="12.5" rx="4" ry="8" fill={color} stroke="lightgray" strokeWidth="1"/>;
        <ellipse cx="12.5" cy="12.5" rx={p==="WHEEL" ? 1 : 2} ry={p==="WHEEL" ? 3 : 6} fill="white" stroke="lightgray" strokeWidth="1"/>;
      </g>
    );
    let floor = (
      <g>
        <ellipse cx="12.5" cy="12.5" ry="4" rx="8" fill={color} stroke="lightgray" strokeWidth="1"/>;
        <ellipse cx="12.5" cy="12.5" ry={p==="FLOOR" ? 1 : 2} rx={p==="FLOOR" ? 3 : 6} fill="white" stroke="lightgray" strokeWidth="1"/>;
      </g>
    );
    let text = "Wall Plane";
    if (p==="WHEEL") {
      text = "Wheel Plane";
    } else if (p==="FLOOR") {
      text = "Floor Plane";
    }
    return (
      <div>
        <SpeedButton title={"edit in wall plane"} onClick={this.handleWall}>{wall}</SpeedButton>
        <div style={{display: "inline-block", width: "3px"}}/>
        <SpeedButton title={"edit in wheel plane"} onClick={this.handleWheel}>{wheel}</SpeedButton>
        <div style={{display: "inline-block", width: "3px"}}/>
        <SpeedButton title={"edit in floor plane"} onClick={this.handleFloor}>{floor}</SpeedButton>
        <div style={{display: "inline-block", width: "3px"}}/>
        <svg height="25" width="50">
          <text style={{fontSize: "10px"}} x="25" y="17" textAnchor="middle">
            {text}
          </text>
        </svg>
      </div>
    );
  }
}

class MoveControl extends React.PureComponent {
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
    this.props.pushStoreState();
  }
  handleCounter = (e)=>{
      if (this.props.frozen) {
      return;
    }
    this.props.modifySpins({propid: this.props.propid, node: this.props.node, n: -1});
    this.props.pushStoreState();
  }
  
  handleSpeedUp = (e)=>{
    if (this.props.frozen) {
      return;
    }
    this.props.modifyAcceleration({propid: this.props.propid, node: this.props.node, n: +1});
    this.props.pushStoreState();
  }
  handleSlowDown = (e)=>{
    if (this.props.frozen) {
      return;
    }
    this.props.modifyAcceleration({propid: this.props.propid, node: this.props.node, n: -1});
    this.props.pushStoreState();
  }
  handleBendPlus = (e)=>{
    if (this.props.frozen) {
      return;
    }
    let propid = this.props.order[this.props.order.length-1];
    this.props.modifyBend({propid: this.props.propid, pitch: +1, bend: 0});
    this.props.pushStoreState();
  }
  handleBendMinus = (e)=>{
    if (this.props.frozen) {
      return;
    }
    let propid = this.props.order[this.props.order.length-1];
    this.props.modifyBend({propid: this.props.propid, pitch: -1, bend: 0});
    this.props.pushStoreState();
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
    let move, index, previous;
    if (this.props.tick>-1) {
      let sub = submove(this.props.moves[propid], this.props.tick);
      move = sub.move;
      index = sub.index;
      previous = (index===0) ? this.props.starters[propid] : this.props.moves[propid][index-1];
    }
    let stroke = "lightgray";
    let buttons = (locked || this.props.tick===-1 || this.props.transition || this.props.multiselect) ? null : [
        <SpeedMeter key="0" move={move} previous={previous} color={color} node={node}/>,
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
    if (buttons && node==="head") {
      buttons.push(
        <SpeedButton key="5" onClick={this.handleBendMinus} title={"plane bend backward"}>
          <path d={ARROW} transform="scale(-1, 1) translate(-20, 5)" fill={color} stroke={stroke}/>
        </SpeedButton>
      );
      buttons.push(
        <SpeedButton key="6" onClick={this.handleBendPlus} title={"plane bend forward"}>
          <path d={ARROW} transform="translate(5, 5)" fill={color} stroke={stroke}/>
        </SpeedButton>
      );
    } else if (buttons) {
      buttons.push(<div key="5" />);
      buttons.push(<div key="6" />);
    }
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
    if (move && node==="head" && move.vb) {
      buttons[3] = <div key="3" />;
      buttons[4] = <div key="4" />
    }
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


function SpeedMeter(props, context) {
  let {move, node, color, previous} = props;
  let {va, va1, vr, vr1, vl, vl1, la, a, a1, r, r1} = move[node];
  let {vb} = move;
  // very occasionally, null va, va1, and a1 sneak in here...forgot to resolve?
  let title, speed, spinshape, spintext, accshape, acctext;
  let stroke = "lightgray";
  let cw = <path d={ARROW} transform="translate(9, 17)" fill={color} stroke="lightgray"/>;
  let ccw = <path d={ARROW} transform="scale(-1, 1) translate(-25, 17)" fill={color} stroke="lightgray"/>;
  let acc = <polygon transform="translate(34,21)" points={ACC} fill={color} stroke={stroke}/>;
  let dec = <polygon transform="translate(27, 21)" points={DEC} fill={color} stroke={stroke}/>;
  let spd = <polygon transform="translate(34,19)" points="0,0 0,12, 12,6" fill={color} stroke={stroke}/>;
  if (node==="head" && vb) {
    speed = round(va || 0, 0.5);
    let bend = -round(vb, 0.5);
    let bendcw = <path d={ARROW} transform="translate(32, 17)" fill={color} stroke="lightgray"/>;
    let bendccw = <path d={ARROW} transform="scale(-1, 1) translate(-48, 17)" fill={color} stroke="lightgray"/>;
    title = "plane bend ("+speed+", "+bend+")";
    spinshape = (speed>0) ? cw : ccw;
    spintext = <text textAnchor="middle" x="5" y="29" style={{fontSize: (parseInt(speed)===speed) ? "10px" : "8px"}}>{Math.abs(speed)}</text>;
    acctext = <text textAnchor="middle" x="29" y="29" style={{fontSize: (parseInt(bend)===bend) ? "10px" : "8px"}}>{Math.abs(bend)}</text>;
    accshape = (bend>0) ? bendcw : bendccw;
  } else if (zeroish(r,0.02) && zeroish(r1,0.02) && zeroish(previous[node].r1,0.02)) {
    // kind of debatable
    speed = 0;
    title = "speed 0";
    spintext = <text textAnchor="middle" x="5" y="29" style={{fontSize: "10px"}}>0</text>;
  } else if (vl!==undefined || vl1!==undefined || la!==undefined) {
    title = "linear ("+angle(Math.round(la))+" degrees), ";
    if (zeroish(vl, 0.02) && zeroish(vl1, 0.02)) {
      speed = 0;
      title = "speed 0";
      spintext = <text textAnchor="middle" x="5" y="29" style={{fontSize: "10px"}}>0</text>;
    } else {
      spinshape = <polygon transform={"translate(11,21) rotate("+(la-90)+" 8 4)"} points={LINEAR} fill={color} stroke={stroke}/>;
      if (nearly(vl, vl1, 0.02)) {
        speed = round(vl, 0.5);
        title += ("speed "+speed); 
        accshape = spd;
        acctext = <text textAnchor="middle" x={29} y={29} style={{fontSize: (parseInt(speed)===speed) ? "10px" : "8px"}}>{speed}</text>;
      } else if (vl>vl1) {
        speed = round(vl1, 0.5);
        title += ("decelerating to "+speed); 
        accshape = dec;
        acctext = <text textAnchor="middle" x={46} y={29} style={{fontSize: (parseInt(speed)===speed) ? "10px" : "8px"}}>{speed}</text>;
      } else if (vl1>vl) {
        speed = round(vl, 0.5);
        title += ("accelerating from "+speed);
        accshape = acc;
        acctext = <text textAnchor="middle" x={29} y={29} style={{fontSize: (parseInt(speed)===speed) ? "10px" : "8px"}}>{speed}</text>;
      }
    }
  } else if ((!zeroish(vr, 0.02) || !zeroish(vr1, 0.02)) && zeroish(va, 0.02) && zeroish(va1, 0.02)) {
    // pseudo-linear
    if (vr+vr1>0) {
      la = angle(a);
    } else if (vr+vr1<0) {
      la = angle(-a);
    }
    title = "linear ("+angle(Math.round(la))+" degrees), ";
    spinshape = <polygon transform={"translate(11,21) rotate("+(la-90)+" 8 4)"} points={LINEAR} fill={color} stroke={stroke}/>;
    if (nearly(vr, vr1, 0.02)) {
      speed = Math.abs(round(vr, 0.5));
      title += ("speed "+speed);
      accshape = spd;
      acctext = <text textAnchor="middle" x={29} y={29} style={{fontSize: (parseInt(speed)===speed) ? "10px" : "8px"}}>{speed}</text>;
    } else {     
      if (Math.abs(vr, 0.02)>Math.abs(vr1, 0.02)) {
        speed = Math.abs(round(vr1, 0.5));
        title += ("decelerating to "+speed);
        accshape = dec;
        acctext = <text textAnchor="middle" x={46} y={29} style={{fontSize: (parseInt(speed)===speed) ? "10px" : "8px"}}>{speed}</text>;
      } else if (Math.abs(vr1)>Math.abs(vr)) {
        speed = Math.abs(round(vr, 0.5));
        title += ("accelerating from "+speed);
        accshape = acc;
        acctext = <text textAnchor="middle" x={29} y={29} style={{fontSize: (parseInt(speed)===speed) ? "10px" : "8px"}}>{speed}</text>;
      }
    }
  } else if (zeroish(va, 0.02) && zeroish(va1, 0.02)) {
    speed = 0;
    title = "speed 0";
    spintext = <text textAnchor="middle" x="5" y="29" style={{fontSize: "10px"}}>{speed}</text>;
  } else {
    title = " spins, "
    let spin = beats(move)/4;
    let spins = Math.ceil(Math.abs(0.5*(va+va1)*spin));
    title = spins + title;
    if (va+va1>0) {
      spinshape = cw;
    } else if (va+va1<0) {
      spinshape = ccw;
    }
    if (nearly(va, va1, 0.02)) {
      speed = Math.abs(round(va, 0.5));
      title += ("speed "+speed); 
      accshape = spd;
      acctext = <text textAnchor="middle" x={29} y={29} style={{fontSize: "10px"}}>{speed}</text>;
    } else if (Math.abs(va)>Math.abs(va1)) {
      speed = Math.abs(round(va1, 0.5));
      title += ("decelerating to "+speed); 
      accshape = dec;
      acctext = <text textAnchor="middle" x={46} y={29} style={{fontSize: "10px"}}>{speed}</text>;
    } else if (Math.abs(va1)>Math.abs(va)) {
      speed = Math.abs(round(va, 0.5));
      title += ("accelerating from "+speed);
      accshape = acc;
      acctext = <text textAnchor="middle" x={29} y={29} style={{fontSize: "10px"}}>{speed}</text>;
    }
    spintext = <text textAnchor="middle" x="5" y="29" style={{fontSize: "10px"}}>{spins}</text>;
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

class SpeedButton extends React.PureComponent {
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
    let style = {};
    if (this.props.top || this.props.right) {
      style.position = "relative";
      style.right = this.props.right;
      style.top = this.props.top;
    }
    return (
      <svg style={style} height={SVG} width={SVG} onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave} onMouseDown={this.props.onClick}>
        <title>{this.props.title}</title>
        <rect x="1" y="1" height={SVG-2} width={SVG-2} fill={this.state.fill} stroke={this.state.stroke} rx="4" ry="4"/>
        {this.props.children}
      </svg>
    )
  }
}

class RawInput extends React.PureComponent {
  handleChange = (event)=>{
    let {move, node, val} = this.props;
    if (isNaN(parseFloat(event.target.value))) {
      return;
    }
    let raw = clone(move);
    if (node) {
      raw[node][val] = parseFloat(event.target.value);
    } else {
      raw[val] = parseFloat(event.target.value);
    }
    this.props.setRawMove(raw);
  }
  render() {
    let {move, node, val, text} = this.props;
    let value;
    if (node) {
      value = move[node][val] || 0;
    } else {
      value = move[val] || 0;
    }
    return (
      <div style={{position: "relative"}}>
        {text}
        <input  type="number"
                size="15"
                onChange={this.handleChange}
                style={{position: "absolute", left: "150px"}}
                value={value}/>
      </div>
    );
  }
}

class RawPanel extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      node: "head",
      linear: false
    };
  }
  handleSubmit = (event)=>{
    this.props.modifyUsingRawMove();
  }
  render() {
    let propid = this.props.getActivePropId();
    let {raw, tick, colors} = this.props;
    let {node, linear} = this.state;
    let niceNames = {
      body: "Body",
      pivot: "Shoulder",
      helper: "Elbow",
      hand: "Hand",
      grip: "Grip",
      head: "Head"
    };
    let txt = (tick===-1) ? "starting" : "ending";
    let duration = (tick===-1) ? null : <RawInput move={raw} node={null} val="beats" text={"duration"} {...this.props}/>;
    return (
      <div className="rawpanel">
        <svg height="40" width="100">
          <line x1={30} y1={30} x2={80} y2={30} style={{stroke: "gray", strokeWidth: 3}} />
          <circle cx={30} cy={30} r={10} fill="red" stroke="gray"/>
          <circle cx={80} cy={30} r={6} fill="red" stroke="gray"/>
        </svg>
        <RawInput move={raw} node="head" val="a1" text={"head " +txt + " angle"} {...this.props}/>
        <RawInput move={raw} node="head" val="r1" text={"head " +txt+ " radius"} {...this.props}/>
        <RawInput move={raw} node="grip" val="a1" text={"grip " +txt+ " angle"} {...this.props}/>
        <RawInput move={raw} node="grip" val="r1" text={"grip " +txt+ " radius"} {...this.props}/>
        <RawInput move={raw} node="hand" val="a1" text={"hand " +txt+ " angle"} {...this.props}/>
        <RawInput move={raw} node="hand" val="r1" text={"hand " +txt+ " radius"} {...this.props}/>
        <RawInput move={raw} node="helper" val="a1" text={"elbow " +txt+ " angle"} {...this.props}/>
        <RawInput move={raw} node="helper" val="r1" text={"elbow " +txt+ " radius"} {...this.props}/>
        <RawInput move={raw} node="pivot" val="a1" text={"shoulder " +txt+ " angle"} {...this.props}/>
        <RawInput move={raw} node="pivot" val="r1" text={"shoulder " +txt+ " radius"} {...this.props}/>
        <RawInput move={raw} node="body" val="a1" text={"body " +txt+ " angle"} {...this.props}/>
        <RawInput move={raw} node="body" val="r1" text={"body " +txt+ " radius"} {...this.props}/>
        <hr/>
        <RawInput move={raw} node={"plane"} val="x" text={"plane x"}/>
        <RawInput move={raw} node={"plane"} val="y" text={"plane y"}/>
        <RawInput move={raw} node={"plane"} val="z" text={"plane z"}/>
        {duration}
        <hr/>
        <button onClick={this.handleSubmit}>Accept</button>
        <button onClick={this.props.toggleRawEdit}>Cancel</button>
      </div>
    );
  }
}