class MovePanel extends React.Component {
  // the last item on order is the active one
  setLock = (e, node)=>{
    e.preventDefault();
    if (this.props.frozen) {
      return;
    }
    let locked = this.props.locks[node];
    this.props.setLock(node, !locked);
    this.props.checkLocks();
  }
  setGripLock = (e)=>{
    this.setLock(e, "grip");
  }
  setHelperLock = (e)=>{
    this.setLock(e, "helper");
  }
  setBodyLock = (e)=>{
    this.setLock(e, "body");
  }
  render() {
    let propid = this.props.order[this.props.order.length-1];
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
    let duration =
      <div>
        <span>
          {"duration "+"\u231B"}
        </span>
        {beats(move)*BEAT}
      </div>
    ;
    if (this.props.tick===-1) {
      duration = <div style={{color: "lightgray"}}>{"\u231B"+" (starting position)"}</div>;
    }
    return (
      <div className="grid movepanel">
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
    this.props.checkLocks();
  }
  modifySpins = (n) =>{
    let {move, node, propid, tick} = this.props;
    let va = move[node] ? move[node].va : 0;
    let va1 = move[node] ? move[node].va1 : va;
    let speed = (va+va1)/2;
    let spin = beats(move)/4;
    let spins = Math.sign(speed)*Math.ceil(Math.abs(speed*spin));
    let args = {};
    spins += n;
    if (zeroish(spins)) {
      spins += n;
    }
    args[node] = {spin: spins};
    this.props.modifyMove({
      propid: propid,
      tick: tick,
      nodes: args
    });
    this.props.resolveMove({
      propid: propid,
      tick: tick
    });
    this.props.pushState();
    this.props.renderEngine();
  }
  handleClockwise = (e)=>{
    this.modifySpins(+1);
  }
  handleCounter = (e)=>{
    this.modifySpins(-1);
  }
  modifySpeed = (n) => {
    let {move, node, propid, tick} = this.props;
    let va = move[node] ? move[node].va : 0;
    if (zeroish(va) && n<0) {
      return;
    }
    let speed = va + ((va<0) ? -n : n);
    let args = {};
    args[node] = {va: speed};
    this.props.modifyMove({
      propid: propid,
      tick: tick,
      nodes: args
    });
    this.props.resolveMove({
      propid: propid,
      tick: tick
    });
    this.props.pushState();
    this.props.renderEngine();
  }
  handleSpeedUp = (e)=>{
    this.modifySpeed(+1);
  }
  handleSlowDown = (e)=>{
    this.modifySpeed(-1);
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
    let button = {paddingBottom: "28px", paddingRight: "25px", height: "22px", width: "22px", fontSize: "18px", fontWeight: "bold", color: color};
    let buttons = (locked || this.props.tick===-1) ? null : [
        <SpeedMeter key="0" move={move} color={color} node={node}/>,
        <button key="1"
                title="More Counterclockwise / Less Clockwise Spin"
                style={button}
                onClick={this.handleCounter}
        >{"\u21BA"}</button>,
        <button key="2"
                title="More Clockwise / Less Counterclockwise Spin"
                style={button}
                onClick={this.handleClockwise}
        >{"\u21BB"}</button>,
        <button key="3"
                title="Starts Slower, Ends Faster"
                style={button}
                onClick={this.handleSlowDown}
        >{"\u219E"}</button>,
        <button key="4"
                title="Starts Faster, Ends Slower"
                style={button}
                onClick={this.handleSpeedUp}
        >{"\u21A0"}</button>
    ];
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
          <g onMouseDown={this.handleMouseDown}>
            <title>{title}</title>
            <line x1={SVG} y1={0} x2={SVG} y2={SVG} style={tether2} />
            <line x1={SVG} y1={SVG} x2={SVG} y2={2*SVG} style={tether1} />
            {graphic}
          </g>
        </svg>
        <p style={{color: (locked) ? "lightgray" : "black"}}>{niceNames[node]}</p>
        {buttons}
      </div>
    );
  }
}

function SpeedMeter(props, context) {
  let {move, node, color} = props;
  let va = move[node] ? move[node].va : 0;
  let va1 = move[node] ? move[node].va1 : 0;
  let spin = beats(move)/4;
  let spins = Math.ceil(Math.abs(va*spin));
  let spins1 = Math.ceil(Math.abs(va1*spin));
  let sym0 = <text textAnchor="middle" x={11} y={35} fill={color} style={{fontSize: "32px", fontWeight: "bold"}}>{(va<0) ? "\u21BA" : "\u21BB"}</text>;
  let sym1 = <text textAnchor="middle" x={41} y={35} fill={color} style={{fontSize: "32px", fontWeight: "bold"}}>{(va1<0) ? "\u21BA" : "\u21BB"}</text>;
  let text1 = <text textAnchor="middle" x={(va<0) ? 11 : 12} y={31} style={{fontSize: "12px"}}>{spins}</text>;
  let text2 = <text textAnchor="middle" x={(va<0) ? 26 : 27} y={31} style={{fontSize: "12px"}}>{"\u2B62"}</text>;
  let text3 = <text textAnchor="middle" x={(va1<0) ? 41 : 42} y={31} style={{fontSize: "12px"}}>{spins1}</text>;
  let niceNames = {
    body: "body",
    pivot: "shoulder",
    helper: "elbow",
    hand: "hand",
    grip: "handle",
    head: "head"
  };
  let title = niceNames[node] + " starts at "+va+" spins, ends at "+va1+" spins per measure";
  if (nearly(va, va1)) {
    sym0 = <text textAnchor="middle" x={26} y={35} fill={color} style={{fontSize: "32px", fontWeight: "bold"}}>{(va<0) ? "\u21BA" : "\u21BB"}</text>;
    text1 = <text textAnchor="middle" x={(va<0) ? 26 : 27} y={31} style={{fontSize: "12px"}}>{spins}</text>;
    sym1 = null;
    text2 = null;
    text3 = null;
    title = niceNames[node]+" speed is "+va+" spins per measure";
  }
  return (
    <svg height={49} width={80}>
      <title>{title}</title>
      {sym0}
      {sym1}
      {text1}
      {text2}
      {text3}
    </svg>
  );
}