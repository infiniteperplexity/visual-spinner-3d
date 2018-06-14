class MoveQueue extends React.Component {
  render() {
    let list = [];
    let moves = this.props.moves[this.props.propid];
    let ticks = 0;
    for (let i=0; i<moves.length; i++) {
      list.push(<MoveItem key={i} ticks={ticks} move={moves[i]} {...this.props}></MoveItem>);
      ticks += beats(moves[i])*BEAT;
    }
    list.push(<NewMove key={list.length} {...this.props}/>);
    return (
      <ul style={{
        listStyleType: "none",
        overflowX: "hidden",
        borderStyle: "solid",
        border: "0px",
        borderRight: "1px"
      }}>
        {list}
      </ul>
    );
  }
}

class NewMove extends React.Component {
  handleClick = (e)=> {
    let ticks = beats(this.props.moves[this.props.propid])*BEAT;
    this.props.addMove(this.props.propid);
    this.props.setTop(this.props.propid);
    this.props.gotoTick(ticks);
  }
  render() {
    return <button onClick={this.handleClick}>+</button>
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
    const HEIGHT = 24;
    let move = this.props.move;
    let repr = {
      hand: {a0:move.hand.a, a1: move.hand.a1},
      head: {a0: move.head.a, a1: move.head.a1}
    };

    return (
      <li
        onMouseEnter={(e)=>this.handleMouseEnter(e)}
        onMouseLeave={(e)=>this.handleMouseLeave(e)}
        onMouseDown={(e)=>this.handleMouseDown(e)}
        style={{
          whiteSpace: "nowrap",
          height: HEIGHT*beats(this.props.move),
          backgroundColor: (this.props.tick===this.props.ticks) ? "cyan" : "white"
        }}
      >{stringify(repr)}</li>
    );
  }
}

function FrozenNumber(props, context) {
  return <input type="text" readOnly style={{width: 50, fontFamily: "monospace"}} value={props.value} />
}
class NumberPanel extends React.Component {
  handleChange = (e)=>{
    // !!!might need to change state.locks
    this.props.modifyMove({...this.prop.vals, value: e.target.value});
    this.props.pushState();
    this.props.renderEngine();
  }
  render() {
    return <input type="number" onChange={this.handleChange} style={{width: 50, fontFamily: "monospace"}} defaultValue={this.props.value} />
  }
}

class MovePanel extends React.Component {
  // the last item on order is the active one
  render() {
    let propid = [this.props.order[this.props.order.length-1]];
    let {move} = submove(this.props.moves[propid], this.props.tick);
    try {
      move = resolve(move);
    } catch(e) {
      move = Move(move);
    }
    let list = [];
    for (let i=0; i<NODES.length; i++) {
      let node = NODES[i];
      list.push(
        <div key={i}>
          {node}&nbsp;&nbsp;angle{"\u2080"}&nbsp; <FrozenNumber value={move[node].a} />
          &nbsp;angle{"\u2081"}&nbsp; <NumberPanel vals={{propid: propid, node: i, moment: "a1"}} value={move[node].a1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel vals={{propid: propid, node: i, moment: "va"}} value={move[node].va} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel vals={{propid: propid, node: i, moment: "va1"}} value={move[node].va1} />
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;radius{"\u2080"} <FrozenNumber value={move[node].r} />
          &nbsp;radius{"\u2081"} <NumberPanel vals={{propid: propid, node: i, moment: "r1"}} value={move[node].r1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel vals={{propid: propid, node: i, moment: "vr"}} value={move[node].vr} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel vals={{propid: propid, node: i, moment: "vr1"}} value={move[node].vr1} />
        </div>
      );
    }
    return (
      <div style={{fontFamily: "monospace"}}>
        @tick: <NumberPanel value={this.props.tick} />
        &nbsp;note: <input type="text" style={{width: 50}} readOnly value={move.notes}></input>
        &nbsp;ticks: <NumberPanel  vals={{propid: propid, node: null, moment: "ticks"}} value={move.beats*BEAT} />
        &nbsp;plane: {this.props.plane}
          {list}
          <div>
            bend:
              <NumberPanel vals={{propid: propid, node: null, moment: "bent"}} value={move.bent} />
            &nbsp;{"\u0394"}:
              <NumberPanel vals={{propid: propid, node: null, moment: "vb"}} value={move.vb} />
            &nbsp;&nbsp;
            twist:
              <NumberPanel vals={{propid: propid, node: null, moment: "twist"}} value={move.twist} />
            &nbsp;{"\u0394"}:
              <NumberPanel vals={{propid: propid, node: null, moment: "vt"}} value={move.vt} />
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