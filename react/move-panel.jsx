class NumberPanel extends React.Component {
  handleChange = (e)=>{
    if (this.props.frozen) {
      return;
    }
    // !!!might need to change state.locks
    // this.props.modifyMove({...this.prop.vals, value: e.target.value});
    let nodes = {};
    let node = {};
    node[this.props.vals.moment] = parseFloat(e.target.value);
    nodes[NODES[this.props.vals.node]] = node;
    this.props.modifyMove({
      propid: this.props.vals.propid,
      tick: this.props.tick,
      nodes: nodes
    });
    this.props.resolveMove({
      propid: this.props.vals.propid,
      tick: this.props.tick
    });
    this.props.pushState();
    this.props.renderEngine();
  }
  render() {
    return <input type="number" onChange={this.handleChange} style={{width: 50, fontFamily: "monospace"}} value={this.props.value} />
  }
}

class LockBox extends React.Component {
  handleChange = (e) => {
    if (this.props.frozen) {
      return;
    }
    this.props.setLock(this.props.node, e.target.checked);
    // !!!!This is one possibility; another is to overwrite.
    this.props.checkLocks();
  }
  render() {
    let bool = clone(this.props.locks)[this.props.node];
    return (
      <span>
        <input onChange={this.handleChange} type="checkbox" value="someDamnthing" checked={bool}/>{this.props.children}
      </span>
    );
  }
}

class MovePanel1 extends React.Component {
  // the last item on order is the active one
  render() {
    let propid = this.props.order[this.props.order.length-1];
    let move;
    if (this.props.tick===-1) {
      move = this.props.starters[propid];
    } else if (this.props.moves[propid].length===0) {
      return null;
    } else {
      move = submove(this.props.moves[propid], this.props.tick).move;
    }
    let list = [];
    for (let i=NODES.length-1; i>=0; i--) {
      let node = NODES[i];
      let spacer = (node==="pivot") ? <span>&nbsp;</span> : <span>&nbsp;&nbsp;</span>;
      let color = "black";
      if (["grip","helper","body"].includes(node) && this.props.locks[node]) {
        color = "gray";
      }
      if (this.props.tick===-1) {
        color = "gray";
      }
      list.push(
        <div key={i} style={{color: color}}>
          {(node==="helper") ? "help" : node}{spacer}v<sub>angle0</sub>&nbsp;<NumberPanel vals={{propid: propid, node: i, moment: "va"}} value={move[node].va} {...this.props}/>
          &nbsp;v<sub>angle1</sub>&nbsp;<NumberPanel vals={{propid: propid, node: i, moment: "va1"}} value={move[node].va1} {...this.props}/>
          {(["grip","helper","body"].includes(node)) ? <LockBox node={node} {...this.props}>lock {node}</LockBox>: null}
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v<sub>radius0</sub><NumberPanel vals={{propid: propid, node: i, moment: "vr"}} value={move[node].vr} {...this.props}/>
          &nbsp;v<sub>radius1</sub><NumberPanel vals={{propid: propid, node: i, moment: "vr1"}} value={move[node].vr1} {...this.props}/>
          {(node==="head") ? <LockBox node={node} {...this.props}>lock tether</LockBox>: null}
        </div>
      );
    }
    return (
      <div style={{fontFamily: "monospace"}}>
        @tick  <input type="text" size="5" readOnly value={this.props.tick} />
        &nbsp;ticks <NumberPanel  vals={{propid: propid, node: null, moment: "ticks"}} step={90} value={move.beats*BEAT} {...this.props}/>
          {list}
          <div>
            plane <input type="text" size="5" readOnly value={this.props.plane} />
            <br />
            bend<sub>0</sub>&nbsp;
              <NumberPanel vals={{propid: propid, node: null, moment: "bent"}} value={move.bent} {...this.props} />
            &nbsp;v<sub>bend</sub>&nbsp;
              <NumberPanel vals={{propid: propid, node: null, moment: "vb"}} value={move.vb} {...this.props} />
            &nbsp;twist<sub>0</sub>&nbsp;
            <NumberPanel vals={{propid: propid, node: null, moment: "twist"}} value={move.twist} {...this.props}/>
            &nbsp;v<sub>twist</sub>&nbsp;
              <NumberPanel vals={{propid: propid, node: null, moment: "vt"}} value={move.vt} {...this.props}/>
          </div>
        </div>
    )
  }
}


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
        <input type="number" style={{width: "72px"}} value={beats(move)*BEAT}/>
      </div>
    ;
    if (this.props.tick===-1) {
      duration = <div style={{color: "lightgray"}}>{"\u231B"+" (starting position)"}</div>;
    }
    return (
      <div className="grid movepanel">
        {duration}
        <MoveControl node="head" {...this.props}/>
        <MoveControl node="grip" {...this.props}/>
        <MoveControl node="hand" {...this.props}/>
        <MoveControl node="helper" {...this.props}/>
        <MoveControl node="pivot" {...this.props}/>
        <MoveControl node="body" {...this.props}/>
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
  render() {
    const SVG = 25;
    let graphic;
    let propid = this.props.order[this.props.order.length-1];
    let node = this.props.node;
    let color = this.props.colors[propid];
    // !!!! needs a visual cue for tether lock
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
    let font = {fontSize: "32px", fontWeight: "bold", width: "50px", color: color};
    console.log(submove);
    let move;
    if (this.props.tick>-1) {
      move = submove(this.props.moves[propid], this.props.tick).move;
    }
    let buttons = (locked || this.props.tick===-1) ? null : [
        <button key="0" title="More Counterclockwise / Less Clockwise Spin" style={font}>{"\u21BA"}</button>,
        <button key="1" title="More Clockwise / Less Counterclockwise Spin" style={font}>{"\u21BB"}</button>,
        <p key="2" title="1 Clockwise Rotation, Constant Speed" type="text">{
          ((move[node]) ? move[node].va : 0)+"\u21BB"+"\u21D2"+((move[node]) ? move[node].va1 : 0)+"\u21BB"
        }</p>,
        <button key="3" title="Starts Slower, Ends Faster" style={font}>{"\u219E"}</button>,
        <button key="4" title="Starts Faster, Ends Slower" style={font}>{"\u21A0"}</button>
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
    let title = (this.props.locks[node]===undefined) ? null : <title>click me.</title>;
    return (
      <div className="grid movecontrol">
        <svg height={2*SVG} width={2*SVG}>
          <g onMouseDown={this.handleMouseDown}>
            {title}
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

