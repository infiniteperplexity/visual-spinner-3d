
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
    list.push(<ColorPicker key={list.length+1} {...this.props}/>);
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
  constructor(props, context) {
    super(props, context);
    this.WIDTH = 120;
    this.ARM = 24;
    this.TETHER = 24;
    this.HEAD = 6;
    this.HAND = 3;
  }
  handleMouseEnter = (e)=>{
    this.renderContext("lightcyan");
  }
  handleMouseLeave = (e)=>{
    this.renderContext("white");
  }
  handleMouseDown = (e)=>{
    this.props.setTop(this.props.propid);
    this.props.gotoTick(this.props.ticks);
    this.props.renderEngine();
  }
  componentDidMount() {
    this.renderContext();
  }
  componentDidUpdate() {
    this.renderContext();
  }
  renderContext = (bg)=>{
    bg = bg || "white";
    let width = this.canvas.width;
    let height = this.canvas.height;
    let color =this.props.colors[this.props.propid];
    let ctx = this.canvas.getContext("2d");
    let hand = this.props.move.hand;
    let head = this.props.move.head;
    let x0 = Math.cos(hand.a1*VS3D.UNIT-Math.PI/2)*hand.r1*this.ARM;
    let y0 = Math.sin(hand.a1*VS3D.UNIT-Math.PI/2)*hand.r1*this.ARM;
    let x1 = Math.cos(head.a1*VS3D.UNIT-Math.PI/2)*head.r1*this.TETHER;
    let y1 = Math.sin(head.a1*VS3D.UNIT-Math.PI/2)*head.r1*this.TETHER;
    ctx.fillStyle = (this.props.tick===this.props.ticks) ? "cyan" : bg;
    ctx.fillRect(0,0,height,width);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(width/2+x0,height/2+y0);
    ctx.lineTo(width/2+x0+x1,height/2+y0+y1);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width/2+x0,height/2+y0,this.HAND,0,2*Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width/2+x0+x1,height/2+y0+y1,this.HEAD,0,2*Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }
  render() {
    let move = this.props.move;
    let width = this.WIDTH*beats(this.props.move);
    width = width || this.WIDTH;
    let canv = (
      <canvas ref={c=>this.canvas=c} height={this.WIDTH} width={width}
        onMouseEnter={(e)=>this.handleMouseEnter(e)}
        onMouseLeave={(e)=>this.handleMouseLeave(e)}
        onMouseDown={(e)=>this.handleMouseDown(e)}
        style={{
          borderStyle: "solid",
          borderWidth: "1px",
          display: "inline-block",
          overflowX: "hidden",
          backgroundColor: (this.props.tick===this.props.ticks) ? "cyan" : "white"
        }}
      />
    );
    return canv;
  }
}



class ColorPicker extends React.Component {
  handleChange = (e)=> {
    let colors = [...this.props.colors];
    colors[this.props.propid] = e.target.value;
    this.props.setColors(colors);
    this.props.renderEngine();
  }
  render() {
    return (
      <select style={{
        display: "inline-block"
      }} onChange={this.handleChange} value={this.props.colors[this.props.propid]}>
        
        <option value="red">Red</option>
        <option value="orange">Orange</option>
        <option value="yellow">Yellow</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
        <option value="white">White</option>
      </select>
    );
  }
}