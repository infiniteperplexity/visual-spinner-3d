class NumberPanel extends React.Component {
  handleChange = (e)=>{
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
    this.props.setLock(this.props.node, e.target.checked);
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

class MovePanel extends React.Component {
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
          {(["grip","helper"].includes(node)) ? <LockBox node={node} {...this.props}>lock {node}</LockBox>: null}
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

class PlaneMenu extends React.Component {
  handleChange = (e)=>{
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
    e.preventDefault();
    let json = this.txt.value;
    if (json) {
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
        tick: -1,
        order: player.props.map((_,i)=>(player.props.length-i-1)),
        plane: "WALL",
        locks: {
          helper: true,
          grip: true,
          head: true,
        } 
      };
      this.props.restoreState(state);
      this.props.pushState();
      this.props.gotoTick(-1);
      this.props.renderEngine();
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