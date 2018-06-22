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

// let arrowPath = `
// M 124.2,807.8 244.4,687.599 C 196.4,639.599 170,575.8 170,507.9 c 0,-67.9 26.4,-131.7 74.4,-179.7 48,-48 111.8,-74.4 179.7,-74.4 67.9,0 131.7,26.4 179.7,74.4 62,62 87,150.6 68.5,234.399 L 522.3,501.9 623.2,889.9 973.8,684.701 831.1,627 c 19,-65.1 22.2,-133.699 9,-200.9 C 823.899,343.3 783.7,268 723.8,208.2 683.3,167.7 636.1,136.4 583.5,115.1 532.8,94.3 479.1,83.9 424,83.9 369,83.9 315.3,94.3 264.5,115 211.8,136.4 164.6,167.7 124.2,208.1 83.7,248.6 52.4,295.8 31.1,348.4 10.5,399.2 0,452.9 0,507.9 c 0,55 10.4,108.699 31.1,159.5 21.3,52.801 52.6,100 93.1,140.4 z
// `;

// arrowPath = "M5,25 a25,25 0 0,0 25,5";

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
    if (node==="body") {
      graphic = <BodyNode x={0.5*SVG} y={SVG} dim={SVG/6} fill={color}/>;
    } else if (node==="pivot") {
      graphic = <PivotNode x={0.5*SVG} y={SVG} dim={SVG/5} fill={color}/>;
    } else if (node==="helper") {
      graphic = <HelperNode x={0.5*SVG} y={SVG} dim={SVG/5} fill={color}/>;
    } else if (node==="hand") {
      if (this.props.locks.grip) {
        graphic = <GripNode x={0.5*SVG} y={SVG} dim={SVG/9} fill={color}/>;
      } else {
        graphic = <HandNode x={0.5*SVG} y={SVG} dim={SVG/5} fill={color}/>;
      }
    } else if (node==="grip") {
      graphic = <GripNode x={0.5*SVG} y={SVG} dim={SVG/9} fill={color}/>;
    } else if (node==="head") {
      graphic = <HeadNode x={0.5*SVG} y={SVG} dim={SVG/5} fill={color}/>;
    }
    let font = {fontSize: "32px", fontWeight: "bold", width: "50px", color: color};
    let buttons = (locked) ? null : [
        <button key="0" title="More Counterclockwise / Less Clockwise Spin" style={font}>{"\u21BA"}</button>,
        <button key="1" title="More Clockwise / Less Counterclockwise Spin" style={font}>{"\u21BB"}</button>,
        <p key="2" title="1 Clockwise Rotation, Constant Speed" type="text">{"1"+"\u21BB"+"\u21D2"+"1"+"\u21BB"}</p>,
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
    return (
      <div className="grid movecontrol">
        <svg height={2*SVG} width={SVG}>
          <g onMouseDown={this.handleMouseDown}>
            <line x1={0.5*SVG} y1={0} x2={0.5*SVG} y2={SVG} style={tether2} />
            <line x1={0.5*SVG} y1={SVG} x2={0.5*SVG} y2={2*SVG} style={tether1} />
            {graphic}
          </g>
        </svg>
        <p style={{color: (locked) ? "lightgray" : "black"}}>{node}</p>
        {buttons}
      </div>
    );
  }
}

