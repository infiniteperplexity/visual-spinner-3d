class PropNode extends React.Component {
  constructor(props, context) {
    super(props, context);
    // this stuff is technically "state" but it will never force re-rendering
    this.localState = {
      beingDragged: false,
      xoffset: 0,
      yoffset: 0,
      point: null,
      matrix: null
    }
    this.ROUNDMIN = 0.2;
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
    this.localState.point = e.createSVGPoint();
    this.localState.matrix = this.element.getScreenCTM().inverse();
  }
  handleMouseDown = (event) => {
    event.preventDefault();
    if (this.props.frozen) {
      return;
    }
    if (Draggables[this.props.dragID].localState.dragging === null) { 
      this.localState.beingDragged = true;
      Draggables[this.props.dragID].localState.dragging = this;
    }
    // note: harmless violation of React state management practices
    this.localState.point.x = event.clientX;
    this.localState.point.y = event.clientY;
    let p = this.localState.point.matrixTransform(this.localState.matrix);
    let node = this.props.props[this.props.propid][NODES[this.props.node]];
    let v = sphere$vectorize(node);
    let x = v.x * UNIT;
    let y = v.y * UNIT;
    this.localState.xoffset = p.x - x;
    this.localState.yoffset = p.y + y;
    this.props.setTop(this.props.propid);
  }
  handleMouseUp = (event) => {
    if (this.props.frozen) {
      return;
    }
    event.preventDefault();
    if (this.localState.beingDragged) {
      this.props.pushState();
      let node = this.props.props[this.props.propid][NODES[this.props.node]];
      let plane = this.props.plane;
      let a = sphere$planify(node, VS3D[plane]);
      let nodes = {plane: VS3D[plane]};
      if (node.r<=this.ROUNDMIN) {
        node.r = 0.01;
      }
      nodes[NODES[this.props.node]] = {r1: node.r, a1: a};
      this.props.modifyMove({
        propid: this.props.propid,
        tick: this.props.tick,
        nodes: nodes
      });
      this.props.resolveMove({
        propid: this.props.propid,
        tick: this.props.tick
      });
      // an SVG update at this point is cheap and sometimes useful
      this.props.gotoTick(this.props.tick);
      this.props.checkLocks();
      this.props.renderEngine();
    }
    this.localState.beingDragged = false;
    Draggables[this.props.dragID].localState.dragging = null;
  }
  handleMouseLeave = (event) => {
    //this.handleMouseUp(event);
  }
  handleMouseMove = (event) => {
    event.preventDefault();
    if (this.props.frozen) {
      return;
    }
    // note: harmless violation of React state management practices
    this.localState.point.x = event.clientX;
    this.localState.point.y = event.clientY;

    if (this.localState.beingDragged) {
      let p = this.localState.point.matrixTransform(this.localState.matrix);
      let x, y, z;
      let plane = this.props.plane;
      if (plane==="WALL") {
        x = (p.x-this.localState.xoffset)/UNIT;
        y = (-p.y+this.localState.yoffset)/UNIT;
        z = 0;
      } else if (plane==="WHEEL") {
        x = 0;
        y = (-p.y+this.localState.yoffset)/UNIT;
        z = (-p.x+this.localState.xoffset)/UNIT;
      } else if (plane==="FLOOR") {
        x = (p.x-this.localState.xoffset)/UNIT;
        y = 0;
        z = (-p.y+this.localState.yoffset)/UNIT;
      }
      let {r, a, b} = vector$spherify({x: x, y: y, z: z});
      if (this.props.node===HEAD && this.props.locks.head) {
        r = 1;
      } else {
        if (r>=0.5) {
          r = round(r, 0.5);
        } else if (r>=this.ROUNDMIN) {
          r = this.ROUNDMIN;
        } else {
          r = 0;
        }
      }
      // how fine-grained is the rounding on angles?
      const FRACTION = 4;
      let rounding = round(Math.PI/(FRACTION*VS3D.UNIT),1);
      // !!! this may be a bit fishy, actually.  shouldn't the rounding happen in-plane?
      a = round(a, rounding);
      b = round(b, rounding);
      let v = sphere$vectorize({r: r, a: a, b: b});
      x = v.x;
      y = v.y;
      z = v.z;
      this.props.setNode({
        propid: this.props.propid,
        node: this.props.node,
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
    let node = this.props.props[this.props.propid][NODES[this.props.node]];
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

    let tether = null;
    let child = null;
    if (this.props.node<NODES.length-1) {
      let n = this.props.node+1;
      if (n===HELPER && this.props.locks.helper) {
        n+=1;
      } else if (n===GRIP && this.props.locks.grip) {
        n+=1;
      }
      let node2 = this.props.props[this.props.propid][NODES[n]];
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
    let shape;
    // should actually be the GRIP node?
    if (this.props.node===BODY) {
      shape = <rect x={X0-UNIT/12} y={Y0-UNIT/12} width={UNIT/6} height={UNIT/6} stroke="gray" strokeWidth="1" fill={this.props.color} />
    } else if (this.props.node===PIVOT) {
      shape = <polygon points={ (X0-UNIT/10) + "," + Y0 + " " +
                                X0 + "," + (Y0-UNIT/10) + " " +
                                (X0+UNIT/10) + "," + Y0 + " " +
                                X0 + "," + (Y0+UNIT/10)
      } stroke="gray" strokeWidth="1" fill={this.props.color} />
    } else if (this.props.node===HELPER) {
      shape = <polygon points={ (X0-UNIT/10) + "," + (Y0+UNIT/10) + " " +
                                X0 + "," + (Y0-UNIT/12) + " " +
                                (X0+UNIT/10) + "," + (Y0+UNIT/10)
      } stroke="gray" strokeWidth="1" fill={this.props.color} />
    } else if (this.props.node===HAND && !this.props.locks.grip) {
      shape = <polygon points={ (X0-UNIT/10) + "," + (Y0-UNIT/10) + " " +
                                X0 + "," + (Y0+UNIT/10) + " " +
                                (X0+UNIT/10) + "," + (Y0-UNIT/10)
      } stroke="gray" strokeWidth="1" fill={this.props.color} />
    } else if (this.props.node===GRIP || this.props.node===HAND) {
      shape = <circle cx={X0} cy={Y0} r={UNIT/8} stroke="gray" strokeWidth="1" fill={this.props.color} />;
    } else if (this.props.node===HEAD) {
      shape = <circle cx={X0} cy={Y0} r={UNIT/4} stroke="gray" strokeWidth="1" fill={this.props.color} />;
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
        {tether}
        {shape}
        {child}
      </g>
    );
  }
}