let debugScroll;
class QueuePanel extends React.PureComponent {
  componentDidUpdate = ()=>{
    this._scroll.scrollLeft = this.props.scrolled;
  }
  handleScroll = (e)=>{
    this.props.setScrolled(e.target.scrollLeft);
  }
  render() {
    let panels = this.props.props.map((_,i)=><PropPanel key={i} n={i}>
      <ColorPicker propid={i} {...this.props}/>
      <br />
      <ModelPicker propid={i} {...this.props}/>
      <br />
      <DeleteProp propid={i} {...this.props}/>
    </PropPanel>);
    let scale = [];
    let max = 10;
    for (let move of this.props.moves) {
      max = Math.max(max, beats(move)+1);
    }
    for (let i=0; i<max; i++) {
      scale.push(<li key={i} style={{
        display: "inline-block",
        borderRight:"1px solid lightgray",
        color: "lightgray",
        fontSize: "10px",
        textAlign: "right",
        paddingRight: "2px",
        width: "87.9px",
        marginLeft: (i===0) ? "-37px" : "0px"
      }}>{i*BEAT}</li>);
    }
    
    let queues = this.props.props.map((_,i)=><MoveQueue key={i} propid={i} {...this.props}/>);
    return (
      <div style={{whiteSpace: "nowrap"}}>
        <div style={{
          display: "inline-block",
          paddingTop: "22px"
        }}>
          {panels}
          <NewProp {...this.props} />
        </div>
        <div 
          ref={e=>(this._scroll = e)}
          onScroll={this.handleScroll}
          style={{
            width: "981px",
            borderLeft: "1px solid lightgray",
            borderRight: "1px solid lightgray",
            overflowX: "scroll",
            whiteSpace: "nowrap",
            display: "inline-block",
            verticalAlign: "top"
          }}
        >
          <ul style={{
            margin: "0px",
            height: "20px"
          }}>{scale}</ul>
          {queues}
        </div>
      </div>
    );
  }
}

class MoveQueue extends React.PureComponent {
  render() {
    if (parseInt(this.props.propid)>=this.props.props.length) {
      return null;
    }
    let moves = this.props.moves[this.props.propid];
    let ticks = 0;
    let list = [<MoveItem key={-1} ticks={-1} n={-1} move={this.props.starters[this.props.propid]} {...this.props}/>];
    // push the half-things onto here...
    for (let i=0; i<moves.length; i++) {
      if (i>0) {
        list.push(<TransitionPoint key={i-0.5} n={i} ticks={ticks} move={moves[i]} {...this.props}/>);
      }
      list.push(<MoveItem key={i} n={i} queue={this} ticks={ticks} move={moves[i]} previous={(i===0) ?  this.props.starters[this.props.propid] : moves[i-1]} {...this.props}/>);
      ticks += beats(moves[i])*BEAT;
    }
    list.push(
      <div key={list.length} style={{verticalAlign: "top", display: "inline-block"}}>
        <NewMove {...this.props}/>
      </div>
    );
    return (
      <ul ref={e=>this._dragTarget=e} style={{
        listStyleType: "none",
        borderTop: "1px",
        borderStyle: "solid",
        borderLeft: "0px",
        borderRight: "0px",
        borderColor: "lightgray",
        borderBottom: "0px",
        padding: "3px",
        paddingBottom: "0px",
        margin: "0px"
      }}>
        {list}
      </ul>
    );
  }
}

class NewMove extends React.PureComponent {
  handleClick = (e)=> {
    this.props.addMovesToEnd(this.props.propid);
    this.props.pushStoreState();
  }
  render() {
    return (
      <button
        title="add new move(s) to end" 
        ref={e=>(this._element=e)}
        style={{
          marginLeft: "1px"
        }}
        onClick={this.handleClick}
      >+</button>);
  }
}

class PropPanel extends React.PureComponent {
  render() {
    return <div style={{
      marginTop: (this.props.n===0) ? "-5px" : "0px",
      height: "94px",
      padding: "3px"
    }}>
      {this.props.children}
    </div>
  }
}

class MoveItem extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.WIDTH = 90;
    this.ARM = 16;
    this.TETHER = 16;
    this.HEAD = 6;
    this.HAND = 3;
    this.SCROLL = 810;
  }
  handleMouseEnter = (e)=>{
    this.renderContext("lightcyan");
  }
  handleMouseLeave = (e)=>{
    this.renderContext("white");
  }
  handleMouseUp = (e)=>{
    if (this.props.multiselect && !e.ctrlKey) {
      this.props.clearMultiSelect();
    }
  }
  handleMouseDown = (e)=>{
    player.stop();
    if (e.ctrlKey && this.props.ticks!==-1) {
      this.props.addMultiSelect({
        propid: this.props.propid,
        index: this.props.n
      });
    } else {
      let multiselect = this.props.multiselect;
      if (this.props.ticks===-1 || !multiselect || this.props.propid!==multiselect.propid || this.props.ticks<multiselect.tick || this.props.ticks>multiselect.tick2) {     
        this.props.clearMultiSelect();
        this.props.validateTransition();
        this.props.setTop(this.props.propid);
        this.props.gotoTick(this.props.ticks);
      }
    }
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
    let p = this.props.move.plane || VS3D.WALL;
    let move = dummy(this.props.move);
    let hand = cumulate([move.body, move.pivot, move.helper, move.hand, move.grip]);
    let head = move.head;
    hand = {a: sphere$planify(hand, p), r: hand.r};
    head = {a: sphere$planify(head, p), r: head.r};
    let x0 = Math.cos(hand.a*VS3D.UNIT-Math.PI/2)*hand.r*this.ARM;
    let y0 = Math.sin(hand.a*VS3D.UNIT-Math.PI/2)*hand.r*this.ARM;
    let x1 = Math.cos(head.a*VS3D.UNIT-Math.PI/2)*head.r*this.TETHER;
    let y1 = Math.sin(head.a*VS3D.UNIT-Math.PI/2)*head.r*this.TETHER;
    if (vector$nearly(p, VS3D.WHEEL)) {
      x0 = -x0;
      x1 = -x1;
    } else if (vector$nearly(p, VS3D.FLOOR)) {
      y0 = -y0;
      y1 = -y1;
    }
    ctx.fillStyle = bg;
    if (this.props.multiselect) {
      let multi = this.props.multiselect;
      let tick2 = this.props.ticks + BEAT*beats(this.props.move)-1;
      if (this.props.propid===multi.propid && this.props.ticks>=multi.tick && tick2<=multi.tick2) {
        ctx.fillStyle = "cyan";
      }
    } else if (this.props.tick2>=this.props.ticks) {
      if (this.props.tick2===-1 || this.props.tick2<(this.props.ticks+BEAT*beats(this.props.move))) {
        if (!this.props.transition) {
          ctx.fillStyle = "cyan";
        } else {
          ctx.fillStyle = "lightcyan";
        }
      }
    }
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
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
    const DISPLACE = (this.props.ticks===-1) ? 26 : 35;
    if (this.props.timecodes[this.props.ticks+BEAT*beats(this.props.move)]!==undefined || (this.props.ticks===-1 && this.props.timecodes[0]!==undefined)) {
      // visual indicator for timecode
      ctx.fillStyle = "none";
      ctx.lineWidth = 1;
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.arc(width/2+DISPLACE,height/2-DISPLACE,4,0,2*Math.PI);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.moveTo(width/2+DISPLACE, height/2-DISPLACE-2);
      ctx.lineTo(width/2+DISPLACE, height/2-DISPLACE);
      ctx.lineTo(width/2+DISPLACE+2, height/2-DISPLACE);
      ctx.stroke();
    }
    let plane = this.props.move.plane || VS3D.WALL;
    let previous = this.props.previous;
    // !!! use X if there is a discontinuous plane break
    if (previous && !vector$nearly(previous.plane || VS3D.WALL, plane) && !VS3D.inplane(dummy(previous), plane, GRIP)) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      let x = width/2-DISPLACE;
      let y = height/2-DISPLACE;
      ctx.beginPath();
      ctx.moveTo(x-4,y-4);
      ctx.lineTo(x+4,y+4);
      ctx.moveTo(x+4,y-4);
      ctx.lineTo(x-4,y+4);
      ctx.fill();
      ctx.stroke();
    } else if (plane!==undefined && !vector$nearly(plane, VS3D.WALL)) {
      ctx.strokeStyle = color;
      ctx.fillStyle = "none";
      ctx.lineWidth = 1;
      let rx, ry;
      if (vector$nearly(plane, VS3D.WHEEL)) {
        rx = 2;
        ry = 4;
      } else if (vector$nearly(plane, VS3D.FLOOR)) {
        rx = 4;
        ry = 2;
      }
      ctx.beginPath();
      ctx.ellipse(width/2-DISPLACE, height/2-DISPLACE, rx, ry, 0, 0, 2*Math.PI, false);
      ctx.closePath();
      ctx.stroke();
    }
  }
  handleDragStart =(e)=>{
    let json = this.props.move;
    if (this.props.multiselect) {
      // let test = this.props.queue._dragTarget.cloneNode();
    // e.dataTransfer.setDragImage(test,0,0);
      e.dataTransfer.setData("text", JSON.stringify({
        multiselect: this.props.multiselect
      }));
    } else {
      e.dataTransfer.setData("text", JSON.stringify(json));
    }
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
  handleDragEnd = (e)=>{

  }
  handleDrop = (e)=>{
    e.preventDefault();
    let json = e.dataTransfer.getData("text");
    let move = JSON.parse(json);
    if (move.multiselect) {
      this.props.copyDraggedMultiple(this.props.propid, parseInt(this.props.n));
      this.props.clearMultiSelect();
    } else {
      // insert move after target
      this.props.copyDraggedMove(move, this.props.propid, parseInt(this.props.n));
    }
    this.props.pushStoreState();
    // probably goto that tick as well?
    this.props.gotoTick(this.props.ticks+beats(this.props.move)*BEAT);
  }
  render() {
    let move = this.props.move;
    let b = beats(this.props.move);
    b = b || 1;
    let width = this.WIDTH*b + 0.5*b-1;
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
          borderRadius: (this.props.ticks===-1) ? "50%" : "8px",
          borderStyle: "solid",
          borderWidth: "1px",
          marginRight: (this.props.ticks===-1) ? "-1px" : "0",
          marginLeft:(this.props.ticks===-1) ? "0" : (this.props.ticks===0) ? "1px" : "-11px",
          display: "inline-block",
          overflowX: "hidden",
          backgroundColor: (this.props.tick===this.props.ticks) ? "cyan" : "white"
        }}
      />
    );
    return canv;
  }
}


class TransitionPoint extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this.dim = 9;
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
          borderColor: (color==="#ffffff") ? "gray" : "black",
          marginBottom: this.margin+"px",
          left: "-5.25px",
          display: "inline-block",
          overflowX: "hidden",
          position: "relative",
          zIndex: "1",
          borderRadius: "50%",
          // to make it a diamond...not very visually apparent
          // transform: "rotate(45deg)",
          // height: this.dim*0.7,
          // width: this.dim*0.7,
          // left: "-6px",
          backgroundColor: (color==="#ffffff") ? "#dddddd" : color
        }}
      />
    );
  }
}

let {svg2hex, hex2svg} = VS3D.Colors;
class ColorPicker extends React.PureComponent {
  handleChange = (e)=> {
    player.stop();
    let colors = [...this.props.colors];
    let color = hex2svg(e.target.value);
    colors[this.props.propid] = e.target.value;
    this.props.setColors(colors);
    this.props.pushStoreState();
  }
  render() {
    return (
      <input  type="color"
              style={{
                marginLeft: "1px"
              }}
              title="change color of prop"
              onChange={this.handleChange}
              value={svg2hex(this.props.colors[this.props.propid])}/>
    );
  }
}

class ModelPicker extends React.PureComponent {
  handleChange = (e)=> {
    player.stop();
    let models = [...this.props.models];
    models[this.props.propid] = e.target.value;
    this.props.setModels(models);
    this.props.pushStoreState();
  }
  render() {
    return (
      <select title="change model for prop" onChange={this.handleChange} 
        style={{width: "64px"}}
        value={this.props.models[this.props.propid]}>
        <option value="poi">Poi</option>
        <option value="staff">Staff</option>
        <option value="hoop">Hoop</option>
        <option value="minihoop">Mini Hoop</option>
        <option value="fan">Fan</option>
        <option value="buugeng">Buugeng</option>
        <option value="flipbuugeng">Mirrored Buugeng</option>
      </select>
    );
  }
}

class NewProp extends React.PureComponent {
  handleAddProp = ()=>{
    this.props.addProp();
  }
  render() {
    return (
      <button style={{marginTop: "5px"}} onClick={this.handleAddProp}>+ Prop</button>
    );
  }
}

class DeleteProp extends React.PureComponent {
  handleDeleteProp = ()=>{
    this.props.deleteProp(this.props.propid);
  }
  render() {
    return (
      <button onClick={this.handleDeleteProp}>{"- Prop"}</button>
    );
  }
}
