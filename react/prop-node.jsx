let _rebounces = {};
function rebounce(callback, timeout) {
  timeout = timeout || "_rebounce";
  clearTimeout(_rebounces.timeout);
  _rebounces.timeout = setTimeout(callback,0);
}

class PropNode extends React.Component {
  constructor(props, context) {
    super(props, context);
    // this stuff is not really "state" in the sense Redux cares about
    this.info = {
      propid: props.propid,
      node: props.node || BODY,
      color: props.color,
      dragID: props.dragID,
      beingDragged: false,
      xoffset: 0,
      yoffset: 0,
      svg: props.svg,
      point: null,
      matrix: null
    }
  }
  componentDidMount() {
    let e = this.element;
    while (e.nodeName!=="svg") {
      e = e.parentNode;
      if (e===null) {
        return null;
      }
    }
    // matrix transformation stuff
    this.info.point = e.createSVGPoint();
    this.info.matrix = this.element.getScreenCTM().inverse();
  }
  handleMouseDown = (event) => {
    event.preventDefault();
    if (Draggables[this.info.dragID].info.dragging === null) { 
      this.info.beingDragged = true;
      Draggables[this.info.dragID].info.dragging = this;
    }
    // note: harmless violation of React state management practices
    this.info.point.x = event.clientX;
    this.info.point.y = event.clientY;
    let p = this.info.point.matrixTransform(this.info.matrix);
    let node = this.props.props[this.info.propid][NODES[this.info.node]];
    let v = sphere$vectorize(node);
    let x = v.x * UNIT;
    let y = v.y * UNIT;
    this.info.xoffset = p.x - x;
    this.info.yoffset = p.y + y;
    this.props.setTop(this.info.propid);
  }
  handleMouseUp = (event) => {
    event.preventDefault();
    this.info.beingDragged = false;
    Draggables[this.info.dragID].info.dragging = null;
    rebounce(()=>{
      this.props.pushState();
      this.props.updateMove(this.info.propid);
      this.props.renderEngine();
    });
  }
  handleMouseLeave = (event) => {
  }
  handleMouseMove = (event) => {
    event.preventDefault();
    // note: harmless violation of React state management practices
    this.info.point.x = event.clientX;
    this.info.point.y = event.clientY;

    if (this.info.beingDragged) {
      let p = this.info.point.matrixTransform(this.info.matrix);
      let x, y, z;
      let plane = this.props.plane;
      if (plane==="WALL") {
        x = (p.x-this.info.xoffset)/UNIT;
        y = (-p.y+this.info.yoffset)/UNIT;
        z = 0;
      } else if (plane==="WHEEL") {
        x = 0;
        y = (-p.y+this.info.yoffset)/UNIT;
        z = (-p.x+this.info.xoffset)/UNIT;
      } else if (plane==="FLOOR") {
        x = (p.x-this.info.xoffset)/UNIT;
        y = 0;
        z = (-p.y+this.info.yoffset)/UNIT;
      }
      let {r, a, b} = vector$spherify({x: x, y: y, z: z});
      if (this.info.node===HEAD && this.props.locks.head) {
        r = 1;
      } else {
        r = round(r, 0.5);
      }
      let rounding = round(Math.PI/(12*VS3D.UNIT),1);
      a = round(a, rounding);
      b = round(b, rounding);
      let v = sphere$vectorize({r: r, a: a, b: b});
      x = v.x;
      y = v.y;
      z = v.z;
      this.props.setNode({
        propid: this.info.propid,
        node: this.info.node,
        x: x,
        y: y,
        z: z,
        plane: plane
      });
    }
  }
  handleDoubleClick = (event) => {
    if (doubleClickHandled===false) {
      event.preventDefault();
      handleDoubleClick();
      console.log("double clicked");
    }
  }
  render() {
    let node = this.props.props[this.info.propid][NODES[this.info.node]];
    let v = sphere$vectorize(node);
    let x, y;
    let plane = this.props.plane;
    if (plane==="WALL") {
      x = v.x * UNIT;
      y = -v.y * UNIT;
    } else if (plane==="WHEEL") {
      x = -v.z * UNIT;
      y = -v.y * UNIT;
    } else if (plane==="FLOOR") {
      x = v.x * UNIT;
      y = -v.z * UNIT;
    }
    let r = UNIT/18;
    if (this.info.node===HAND) {
      r = UNIT/12;
    } else if (this.info.node===HEAD) {
      r = UNIT/6;
    }
    let fill = ([HEAD,HAND].includes(this.info.node)) ? this.info.color : "gray";
    let stroke = ([HEAD,HAND].includes(this.info.node)) ? "gray" : this.info.color;
    let tether = null;
    let child = null;
    if (this.info.node<NODES.length-1) {
      let n = this.info.node+1;
      if (n===HELPER && this.props.locks.helper) {
        n+=1;
      } else if (n===GRIP && this.props.locks.grip) {
        n+=1;
      }
      let node2 = this.props.props[this.info.propid][NODES[n]];
      let v2 = sphere$vectorize(node2);
      let x2, y2;
      if (plane==="WALL") {
        x2 = v2.x * UNIT;
        y2 = -v2.y * UNIT;
      } else if (plane==="WHEEL") {
        x2 = -v2.z * UNIT;
        y2 = -v2.y * UNIT;
      } else if (plane==="FLOOR") {
        x2 = v2.x * UNIT;
        y2 = -v2.z * UNIT;
      }
      let style = {stroke: "gray"};
      if (n===HEAD) {
        style.strokeWidth = 3;
      } else {
        style.strokeDasharray="5,5";
      }
      tether = <line x1={X0} y1={Y0} x2={X0+x2} y2={Y0+y2} style={style} />
      child = <PropNode {...this.props} node={n} />;
    }
    return (
      <g 
        ref={(e)=>(this.element=e)}
        transform={"translate("+x+","+y+")"}
        onDoubleClick={this.handleDoubleClick}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseLeave}
      >
        <circle cx={X0} cy={Y0} r={r} stroke={stroke} strokeWidth="1" fill={fill} />
        {tether}
        {child}
      </g>
    );
  }
}