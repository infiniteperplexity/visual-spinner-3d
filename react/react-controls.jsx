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
    for (let i=0; i<moves.length; i++) {
      list.push(<MoveItem key={i} prop={this.info.prop} move={i} {...this.props}>{stringify(moves[i])}</MoveItem>)
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
    this.props.gotoMove(this.info.prop, this.info.move);
    this.props.updateEngine();
  }
  render() {
    return (
      <li
        onMouseEnter={(e)=>this.handleMouseEnter(e)}
        onMouseLeave={(e)=>this.handleMouseLeave(e)}
        onMouseDown={(e)=>this.handleMouseDown(e)}
        style={{whiteSpace: "nowrap"}}
      >{this.props.children}</li>
    );
  }
}


class PropControls extends React.Component {
  backFrame = () => {
    let frame = this.props.frame;
    frame-=1;
    this.props.gotoFrame(frame);
  }
  forwardFrame = () => {
    let frame = this.props.frame;
    frame+=1;
    this.props.gotoFrame(frame);
  }
  render() {
    return (
      <div>
        <button onClick={this.backFrame}> {"\u2190"} </button>
        <input type="number" readOnly style={{width: 50}} value={this.props.frame} />
        <button onClick={this.forwardFrame}> {"\u2192"} </button>
      </div>
    );
  }
}
