
class MoveQueue extends React.Component {
  render() {
    if (parseInt(this.props.propid)>=this.props.props.length) {
      return null;
    }
    let moves = this.props.moves[this.props.propid];
    let ticks = 0;
    let list = [
      <PropPanel key={-2}>
        <ColorPicker {...this.props}/>
        <br />
        <ModelPicker {...this.props}/>
        <br />
      </PropPanel>
    ];
    list.push(<MoveItem key={-1} ticks={-1} n={-1} move={this.props.starters[this.props.propid]} {...this.props}/>);
    // push the half-things onto here...
    for (let i=0; i<moves.length; i++) {
      if (i>0) {
        list.push(<Transition key={i-0.5} n={i} ticks={ticks} move={moves[i]} {...this.props}/>);
      }
      list.push(<MoveItem key={i} n={i} ticks={ticks} move={moves[i]} {...this.props}/>);
      ticks += beats(moves[i])*BEAT;
    }
    list.push(
      <div key={list.length} style={{verticalAlign: "top", display: "inline-block"}}>
        <NewMove {...this.props}/>
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

class NewMove extends React.Component {
  handleClick = (e)=> {
    this.props.addMovesToEnd(this.props.propid);
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

class PropPanel extends React.Component {
  render() {
    return <div style={{
      height: "90px",
      display: "inline-block",
      verticalAlign: "top"
    }}>
      {this.props.children}
    </div>
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
    if (this.props.tick2>=this.props.ticks) {
      if (this.props.tick2===-1 || this.props.tick2<(this.props.ticks+BEAT*beats(this.props.move))) {
        if (!this.props.transition) {
          ctx.fillStyle = "cyan";
        } else {
          ctx.fillStyle = "lightcyan";
        }
      }
    }
    ctx.fillRect(0,0,width,height);
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
  handleDragStart =(e)=>{
    let json = this.props.move;
    e.dataTransfer.setData("text", JSON.stringify(json));
  }
  handleDragOver =(e)=>{
    // allow drop
    e.preventDefault();
    this.renderContext("cyan");
    // maybe do cyan background as visual indicator
  }
  handleDragLeave = (e)=>{
    e.preventDefault();
    this.renderContext("white");
    // remove the visual indicator

  }
  handleDrop = (e)=>{
    e.preventDefault();
    let json = e.dataTransfer.getData("text");
    let move = JSON.parse(json);
    // insert move after target
    this.props.copyDraggedMove(move, this.props.propid, parseInt(this.props.n));
    // probably goto that tick as well?
    //this.props.gotoTick(this.props.tick+beats(this.props.move)*BEAT);
  }
  render() {
    let move = this.props.move;
    let width = this.WIDTH*beats(this.props.move);
    width = width || this.WIDTH;
    let title = "codes a segment of movement";
    if (this.props.ticks===-1) {
      title = "codes the starting positions for all nodes";
    }
    let canv = (
      <canvas ref={c=>this.canvas=c} height={this.WIDTH} width={width}
        draggable={(this.props.n===-1) ? false : true}
        onDragStart={this.handleDragStart}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        onMouseEnter={(e)=>this.handleMouseEnter(e)}
        onMouseLeave={(e)=>this.handleMouseLeave(e)}
        onMouseDown={(e)=>this.handleMouseDown(e)}
        title={title}
        style={{
          borderRadius: (this.props.ticks===-1) ? "50%" : "10%",
          borderStyle: "solid",
          borderWidth: "1px",
          marginRight: (this.props.ticks===-1) ? "-1px" : "0",
          marginLeft:(this.props.ticks===-1) ? "0" : (this.props.ticks===0) ? "1px" : "-9.5px",
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
    this.dim = 7;
    this.margin = 90/2 - this.dim/2;
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
    this.props.validateTransition();
    this.props.setTop(this.props.propid);
    this.props.gotoTick(this.props.ticks);
    this.props.editTransition();
  }
  render() {
    let title = "no custom transition defined";
    let color = "white";
    if (this.props.transitions[this.props.propid][this.props.n]) {
      title = "custom transition defined";
      color = this.props.colors[this.props.propid];
    } else if (this.state.highlight) {
      color = "cyan";
    } else if (this.props.tick===this.props.ticks) {
      if (this.props.transition) {
        color = "cyan";
      } else {
        color = "white";
      }
    }
    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onMouseDown={this.handleMouseDown}
        title={title}
        style={{
          height: this.dim,
          width: this.dim,
          borderStyle: "solid",
          borderWidth: "1px",
          marginBottom: this.margin+"px",
          left: "-5.25px",
          display: "inline-block",
          overflowX: "hidden",
          position: "relative",
          zIndex: "1",
          // borderTopRightRadius: "50%",
          // borderBottomRightRadius: "50%",
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

class ModelPicker extends React.Component {
  handleChange = (e)=> {
    player.stop();
    let models = [...this.props.models];
    models[this.props.propid] = e.target.value;
    this.props.setModels(models);
  }
  render() {
    return (
      <select onChange={this.handleChange} 
        value={this.props.models[this.props.propid]}>
        <option value="poi">Poi</option>
        <option value="staff">Staff</option>
        <option value="hoop">Hoop</option>
        <option value="fan">Fan</option>
      </select>
    );
  }

}