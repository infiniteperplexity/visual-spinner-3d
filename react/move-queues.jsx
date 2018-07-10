
class MoveQueue extends React.Component {
  render() {
    if (parseInt(this.props.propid)>=this.props.props.length) {
      return null;
    }
    let moves = this.props.moves[this.props.propid];
    let ticks = 0;
    let list = [<MoveItem key={-1} ticks={-1} move={this.props.starters[this.props.propid]} {...this.props}/>];
    list.push(<PropOptions key={-0.5} {...this.props}/>);
    // push the half-things onto here...
    for (let i=0; i<moves.length; i++) {
      if (i>0) {
        list.push(<Transition key={i-0.5} ticks={ticks} move={moves[i]} {...this.props}/>);
      }
      list.push(<MoveItem key={i} ticks={ticks} move={moves[i]} {...this.props}/>);
      ticks += beats(moves[i])*BEAT;
    }
    list.push(
      <div key={list.length} style={{verticalAlign: "top", display: "inline-block"}}>
        <NewMove {...this.props}/>
        <br />
        <ColorPicker {...this.props}/>
      </div>
    );
    return (
      <ul style={{
        listStyleType: "none",
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

class PropOptions extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {highlight: false};
  }
  handleMouseEnter = (e)=>{
    this.setState({highlight: true});
  }
  handleMouseLeave = (e)=>{
    this.setState({highlight: false});
  }
  handleMouseDown = (e)=>{
    this.setState({highlight: false});
    player.stop();
    this.props.setTop(this.props.propid);
    this.props.gotoTick(0);
    this.props.checkLocks();
    this.props.renderEngine();
  }
  render() {
    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseDown={this.handleMouseDown}
        onMouseLeave={this.handleMouseLeave}
        style={{
          height: "90px",
          width: "5px",
          borderStyle: "solid",
          borderWidth: "1px",
          marginRight: "-1px",
          display: "inline-block",
          overflowX: "hidden",
          backgroundColor: (this.state.highlight) ? "cyan" : "white"
        }}
      />
    );
  }
}
class NewMove extends React.Component {
  handleClick = (e)=> {
    player.stop();
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
    this.props.checkLocks();
  }
  render() {
    return (
      <button 
        style={{
          marginLeft: "1px"
        }}
        onClick={this.handleClick}
      >+</button>);
  }
}

class MoveItem extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.WIDTH = 90;
    this.ARM = 16;
    this.TETHER = 16;
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
    player.stop();
    this.props.setTop(this.props.propid);
    this.props.gotoTick(this.props.ticks);
    this.props.checkLocks();
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
    ctx.fillStyle = bg;
    if (this.props.tick>=this.props.ticks) {
      if (this.props.tick===-1 || this.props.tick<(this.props.ticks+BEAT*beats(this.props.move))) {
        ctx.fillStyle = "cyan";
      }
    }
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
          marginRight: (this.props.ticks===-1) ? "-1px" : "0",
          marginLeft: (this.props.ticks<=0) ? "0" : "1px",
          display: "inline-block",
          overflowX: "hidden",
          backgroundColor: (this.props.tick===this.props.ticks) ? "cyan" : "white"
        }}
      />
    );
    return canv;
  }
}

class Transition extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.dim = 8;
    this.margin = 90/2 - this.dim/2;
    this.activated = false;
    this.active = false;
    this.state = {highlight: false};
  }
  handleMouseEnter = (e)=>{
    this.setState({highlight: true});
  }
  handleMouseLeave = (e)=>{
    this.setState({highlight: false});
  }
  handleMouseDown = (e)=>{
    player.stop();
    this.setState({highlight: false});
    this.props.setTop(this.props.propid);
    this.props.gotoTick(this.props.ticks);
    this.props.checkLocks();
    this.props.renderEngine();
  }
  render() {
    let color = "white";
    if (this.activated) {
      color = this.props.colors[this.props.propid];
    } else if (this.active) {
      color = "cyan";
    } else if (this.state.highlight) {
      color = "cyan";
    }
    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onMouseDown={this.handleMouseDown}
        style={{
          height: this.dim,
          width: this.dim,
          borderStyle: "solid",
          borderWidth: "1px",
          marginBottom: this.margin+"px",
          marginRight: "-1px",
          display: "inline-block",
          overflowX: "hidden",
          borderRadius: "50%",
          backgroundColor: color
        }}
      />
    );
  }
}

let {svg2hex, hex2svg} = VS3D.Colors;
class ColorPicker extends React.Component {
  handleChange = (e)=> {
    player.stop();
    let colors = [...this.props.colors];
    let color = hex2svg(e.target.value);
    colors[this.props.propid] = e.target.value;
    this.props.setColors(colors);
    this.props.renderEngine();
    console.log(e.target.value);
    console.log(this.props.colors[this.props.propid]);
    console.log(svg2hex(this.props.colors[this.props.propid]));
  }
  render() {
    return (
      <input  type="color"
              style={{
                marginLeft: "1px"
              }}
              onChange={this.handleChange}
              value={svg2hex(this.props.colors[this.props.propid])}/>
    );
  }
}