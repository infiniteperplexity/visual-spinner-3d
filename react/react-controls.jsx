class PlayButton extends React.Component {
  handleClick = (e)=>{
    this.props.playEngine();
  }
  render() {
    return (<button onClick={this.handleClick}>Play</button>);
  }
}

class MoveQueue extends React.Component {
  render() {
    if (parseInt(this.props.propid)>=this.props.props.length) {
      return null;
    }
    let moves = this.props.moves[this.props.propid];
    let ticks = 0;
    // let list = [];
    let list = [<MoveItem key={-1} ticks={-1} move={this.props.starters[this.props.propid]} {...this.props}/>];
    for (let i=0; i<moves.length; i++) {
      list.push(<MoveItem key={i} ticks={ticks} move={moves[i]} {...this.props}/>);
      ticks += beats(moves[i])*BEAT;
    }
    list.push(<NewMove key={list.length} {...this.props}/>);
    return (
      <ul style={{
        listStyleType: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        borderStyle: "solid",
        border: "0px",
        padding: "0px",
        margin: "0px",
        borderRight: "1px"
      }}>
        {list}
      </ul>
    );
  }
}

class NewMove extends React.Component {
  handleClick = (e)=> {
    let ticks;
    let allTicks = [];
    if (this.props.moves[this.props.propid].length===0) {
      ticks = 0;
    } else {
      ticks = beats(this.props.moves[this.props.propid])*BEAT;
    }
    // add a new move to any prop that has equal or fewer ticks
    for (let i=0; i<this.props.moves.length; i++) {
      if (this.props.moves[i].length===0) {
        allTicks[i] = 0;
      } else {
        allTicks[i] = beats(this.props.moves[i])*BEAT;
      }
      if (allTicks[i]<=ticks) {
        this.props.insertMove({
          propid: i,
          tick: allTicks[i],
          move: {}
        });
        this.props.resolveMove({
          propid: i,
          tick: allTicks[i]
        });
      }
    }
    this.props.setTop(this.props.propid);
    this.props.gotoTick(ticks);
  }
  render() {
    return <button onClick={this.handleClick}
      style={{
        display: "inline-block",
        verticalAlign: "top"
      }}
      >+</button>
  }
}

class MoveItem extends React.Component {
  handleMouseEnter = (e)=>{
    e.target.style.backgroundColor = (this.props.tick===this.props.ticks) ? "cyan" : "lightcyan";
  }
  handleMouseLeave = (e)=>{
    e.target.style.backgroundColor = (this.props.tick===this.props.ticks) ? "cyan" : "white";
  }
  handleMouseDown = (e)=>{
    this.props.setTop(this.props.propid);
    this.props.gotoTick(this.props.ticks);
    this.props.renderEngine();
  }
  render() {
    const WIDTH = 120;
    let move = this.props.move;
    let repr = (this.props.ticks>=0) ? 
      {
        hand: {a0:move.hand.a, a1: move.hand.a1},
        head: {a0: move.head.a, a1: move.head.a1}
      } :
      {
        hand: {a: move.hand.a1},
        head: {a: move.head.a1}
      };
    let width = WIDTH*beats(this.props.move);
    width = width || WIDTH;
    return (
      <li
        onMouseEnter={(e)=>this.handleMouseEnter(e)}
        onMouseLeave={(e)=>this.handleMouseLeave(e)}
        onMouseDown={(e)=>this.handleMouseDown(e)}
        style={{
          borderStyle: "solid",
          borderWidth: "1px",
          display: "inline-block",
          overflowX: "hidden",
          height: "95%",
          width: width,
          backgroundColor: (this.props.tick===this.props.ticks) ? "cyan" : "white"
        }}
      >{stringify(repr)}</li>
    );
  }
}

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
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v<sub>radius0</sub><NumberPanel vals={{propid: propid, node: i, moment: "vr"}} value={move[node].vr} {...this.props}/>
          &nbsp;v<sub>radius1</sub><NumberPanel vals={{propid: propid, node: i, moment: "vr1"}} value={move[node].vr1} {...this.props}/>
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
        <option value="WALL">Wall (Front)</option>
        <option value="WHEEL">Wheel (Left)</option>
        <option value="FLOOR">Floor (Top)</option>
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
      player.props = props;
      let state = {
        props: clone(player.props.map(p=>p.prop)),
        moves: clone(player.props.map(p=>p.moves)),
        starters: player.props.map(p=>resolve(fit(p.prop, new Move({beats: 0})))),
        tick: -1,
        order: player.props.map((_,i)=>(player.props.length-i-1)),
        plane: "WALL",
        locks: {
          body: true,
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