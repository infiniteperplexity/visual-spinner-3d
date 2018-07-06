function BodyNode(props, context) {
  let {x, y, fill, dim} = props;
  return <rect x={x-dim} y={y-dim} width={2*dim} height={2*dim} stroke="gray" strokeWidth="1" fill={fill}/>;
}

function PivotNode(props, context) {
  let {x, y, fill, dim} = props;
  return <polygon points={
    (x-dim)+","+y+" "+
    x+","+(y-dim)+" "+
    (x+dim)+","+y+" "+
    x+","+(y+dim)
  } stroke="gray" strokeWidth="1" fill={fill} />;
}

function HelperNode(props, context) {
  let {x, y, fill, dim} = props;
  return <polygon points={
    (x-dim)+","+(y-dim)+" "+
    x+","+(y+dim)+" "+
    (x+dim)+","+(y-dim)
  } stroke="gray" strokeWidth="1" fill={fill} />;
}

function HandNode(props, context) {
  let {x, y, fill, dim} = props;
  return <polygon points={
    (x-dim)+","+(y+dim)+" "+
    x+","+(y-dim)+" "+
    (x+dim)+","+(y+dim)
  } stroke="gray" strokeWidth="1" fill={fill} />;
}

function GripNode(props, context) {
  let {x, y, fill, dim} = props;
  return <circle cx={x} cy={y} r={dim*2} stroke="gray" strokeWidth="1" fill={fill} />;
}

function HeadNode(props, context) {
  let {x, y, fill, dim} = props;
  return <circle cx={x} cy={y} r={dim*2} stroke="gray" strokeWidth="1" fill={fill} />;
}

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
      // don't update if nothing changed
      let move;
      if (this.props.tick===-1) {
        move = this.props.starters[this.props.propid];
      } else {
        move = submove(this.props.moves[this.props.propid], this.props.tick).move;
      }
      let nd = NODES[this.props.node];
      if (!(nearly(move[nd].r1, node.r) && nearly(move[nd].a1, a))) {
        // !!!! At this point we could decide on spins...
        nodes[NODES[this.props.node]] = {r1: node.r, a1: a};
        if (nearly(move[nd].a1, a)) {
          nodes[NODES[this.props.node]].spin = 0;
        }
        this.props.modifyMove({
          propid: this.props.propid,
          tick: this.props.tick,
          nodes: nodes
        });
        this.props.resolveMove({
          propid: this.props.propid,
          tick: this.props.tick
        });
        // make sure we align to the beginning of the move
        let {propid, tick} = this.props;
        let moves = this.props.moves[propid];
        let past = 0;
        let i = 0;
        while (past<tick) {
          let ticks = beats(moves[i])*BEAT;
          if (past+ticks>tick) {
            this.props.gotoTick(past);
          }
          past+=ticks;
          i+=1;
        }
        this.props.checkLocks();
        this.props.renderEngine();
      }
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
      shape = <BodyNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/12} />
    } else if (this.props.node===PIVOT) {
      shape = shape = <PivotNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/10}/>
    } else if (this.props.node===HELPER) {
      shape = <HelperNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/10} />
    } else if (this.props.node===HAND && !this.props.locks.grip) {
      shape = <HandNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/10} />
    } else if (this.props.node===GRIP || this.props.node===HAND) {
      shape = <GripNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/16} />
    } else if (this.props.node===HEAD) {
      shape = <HeadNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/8} />
    }
    let title = (this.props.tick) ? "drag to set starting positions" : "drag to set movement positions"; 
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
        <title>{title}</title>
        {tether}
        {shape}
        {child}
      </g>
    );
  }
}