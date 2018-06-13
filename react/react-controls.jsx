class MoveQueue extends React.Component {
  constructor(props, context) {
    super(props, context); 
    this.info = {
      prop: props.prop
    }
  }
  render() {
    let list = [];
    let moves = this.props.moves[this.info.prop];
    let ticks = 0;
    for (let i=0; i<moves.length; i++) {
      list.push(<MoveItem key={i} prop={this.info.prop} ticks={ticks} move={moves[i]} {...this.props}></MoveItem>);
      ticks += beats(moves[i])*BEAT;
    }
    return (
      <ul style={{
        listStyleType: "none",
        overflowY: "scroll",
        overflowX: "hidden",
        padding: "0",
        height: "380px"
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
      prop: props.prop,
      ticks: props.ticks,
      move: props.move
    };
  }
  handleMouseEnter = (e)=>{
    e.target.style.backgroundColor = "lightcyan";
  }
  handleMouseLeave = (e)=>{
    e.target.style.backgroundColor = "white";
  }
  handleMouseDown = (e)=>{
    this.props.gotoTick(this.info.prop, this.info.ticks);
    this.props.updateEngine();
  }
  render() {
    const HEIGHT = 24;
    return (
      <li
        onMouseEnter={(e)=>this.handleMouseEnter(e)}
        onMouseLeave={(e)=>this.handleMouseLeave(e)}
        onMouseDown={(e)=>this.handleMouseDown(e)}
        style={{whiteSpace: "nowrap", height: HEIGHT*beats(this.info.move)}}
      >{stringify(this.info.move)}</li>
    );
  }
}


class PropControls extends React.Component {
  render() {
    return (
      <div>
        <input type="number" readOnly style={{width: 50}} value={this.props.tick} />
      </div>
    );
  }
}
