class MoveQueue extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.info = {
      propid: parseInt(props.propid)
    }
  }
  render() {
    let list = [];
    let moves = this.props.moves[this.info.propid];
    let ticks = 0;
    for (let i=0; i<moves.length; i++) {
      list.push(<MoveItem key={i} propid={this.info.propid} ticks={ticks} move={moves[i]} {...this.props}></MoveItem>);
      ticks += beats(moves[i])*BEAT;
    }
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

class MoveItem extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.info = {
      propid: parseInt(props.propid),
      ticks: props.ticks,
      move: props.move
    };
  }
  handleMouseEnter = (e)=>{
    e.target.style.backgroundColor = (this.props.tick===this.info.ticks) ? "cyan" : "lightcyan";
  }
  handleMouseLeave = (e)=>{
    e.target.style.backgroundColor = (this.props.tick===this.info.ticks) ? "cyan" : "white";
  }
  handleMouseDown = (e)=>{
    this.props.setTop(this.info.propid);
    this.props.gotoTick(this.info.ticks);
    this.props.updateEngine();
  }
  render() {
    const HEIGHT = 24;
    return (
      <li
        onMouseEnter={(e)=>this.handleMouseEnter(e)}
        onMouseLeave={(e)=>this.handleMouseLeave(e)}
        onMouseDown={(e)=>this.handleMouseDown(e)}
        style={{
          whiteSpace: "nowrap",
          height: HEIGHT*beats(this.info.move),
          backgroundColor: (this.props.tick===this.info.ticks) ? "cyan" : "white"
        }}
      >{stringify(this.info.move)}</li>
    );
  }
}

function NumberPanel(props, context) {
  return <input type="number" readOnly style={{width: 50, fontFamily: "monospace"}} value={props.value} />
}

class PropControls extends React.Component {
  render() {
    return (
      <div>
        <NumberPanel value={this.props.tick} />
      </div>
    );
  }
}

class MovePanel extends React.Component {
  // the last item on order is the active one
  render() {
    let prop = this.props.props[this.props.order[NPROPS-1]];
    // console.log(this.props.tick);
    let {move} = submove(this.props.moves[this.props.order[NPROPS-1]], this.props.tick);
    try {
      move = resolve(move);
    } catch(e) {
      move = Move(move);
    }
    return (
      <div style={{fontFamily: "monospace"}}>
        @tick: <NumberPanel value={this.props.tick} />
        &nbsp;note: <input type="text" style={{width: 50}} readOnly value={move.notes}></input>
        &nbsp;ticks: <NumberPanel value={move.beats*BEAT} />
        &nbsp;plane<sub>x</sub>
          <NumberPanel value={-move.p.x} />
          <sub>y</sub><NumberPanel value={move.p.y} />
          <sub>z</sub><NumberPanel value={-move.p.z} />
        <br />
          <div>
          body&nbsp;&nbsp;angle{"\u2080"}&nbsp; <NumberPanel value={move.body.a} />
          &nbsp;angle{"\u2081"}&nbsp; <NumberPanel value={move.body.a1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.body.va} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.body.va1} />
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;radius{"\u2080"} <NumberPanel value={move.body.r} />
          &nbsp;radius{"\u2081"} <NumberPanel value={move.body.r1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.body.vr} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.body.vr1} />
          </div>
        <div>
          pivot&nbsp;angle{"\u2080"}&nbsp; <NumberPanel value={move.pivot.a} />
          &nbsp;angle{"\u2081"}&nbsp; <NumberPanel value={move.pivot.a1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.pivot.va} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.pivot.va1} />
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;radius{"\u2080"} <NumberPanel value={move.pivot.r} />
          &nbsp;radius{"\u2081"} <NumberPanel value={move.pivot.r1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.pivot.vr} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.pivot.vr1} />
          </div>
        <div>
          help&nbsp;&nbsp;angle{"\u2080"}&nbsp; <NumberPanel value={move.helper.a} />
          &nbsp;angle{"\u2081"}&nbsp; <NumberPanel value={move.helper.a1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.helper.va} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.helper.va1} />
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;radius{"\u2080"} <NumberPanel value={move.helper.r} />
          &nbsp;radius{"\u2081"} <NumberPanel value={move.helper.r1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.helper.vr} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.helper.vr1} />
          </div>
        <div>
          hand&nbsp;&nbsp;angle{"\u2080"}&nbsp; <NumberPanel value={move.hand.a} />
          &nbsp;angle{"\u2081"}&nbsp; <NumberPanel value={move.hand.a1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.hand.va} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.hand.va1} />
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;radius{"\u2080"} <NumberPanel value={move.hand.r} />
          &nbsp;radius{"\u2081"} <NumberPanel value={move.hand.r1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.hand.vr} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.hand.vr1} />
          </div>
        <div>
          grip&nbsp;&nbsp;angle{"\u2080"}&nbsp; <NumberPanel value={move.grip.a} />
          &nbsp;angle{"\u2081"}&nbsp; <NumberPanel value={move.grip.a1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.grip.va} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.grip.va1} />
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;radius{"\u2080"} <NumberPanel value={move.grip.r} />
          &nbsp;radius{"\u2081"} <NumberPanel value={move.grip.r1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.grip.vr} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.grip.vr1} />
          </div>
          <div>
          head&nbsp;&nbsp;angle{"\u2080"}&nbsp; <NumberPanel value={move.head.a} />
          &nbsp;angle{"\u2081"}&nbsp; <NumberPanel value={move.head.a1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.head.va} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.head.va1} />
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;radius{"\u2080"} <NumberPanel value={move.head.r} />
          &nbsp;radius{"\u2081"} <NumberPanel value={move.head.r1} />
          &nbsp;{"\u0394"}{"\u2080"} <NumberPanel value={move.head.vr} />
          &nbsp;{"\u0394"}{"\u2081"} <NumberPanel value={move.head.vr1} />
          </div> 
          <div>
            bend:
              <NumberPanel value={move.bent} />
            &nbsp;{"\u0394"}:
              <NumberPanel value={move.vb} />
            &nbsp;&nbsp;
            twist:
              <NumberPanel value={move.twist} />
            &nbsp;{"\u0394"}:
              <NumberPanel value={move.vt} />
          </div>
        </div>
    )
  }
}

class PlaneMenu extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.info = {
      plane: props.selected
    }
  }
  handleChange = (e)=>{

  }
  render() {
    return (
      <select defaultValue={this.info.plane}>
        <option value="WALL">Wall (Front)</option>
        <option value="WHEEL">Wheel (Left)</option>
        <option value="FLOOR">Floor (Top)</option>
      </select>
    );
  }
}