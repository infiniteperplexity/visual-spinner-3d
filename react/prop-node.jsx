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

function WrongPlaneNode(props, context) {
  let {x, y, fill, dim} = props;
  return (
    <path 
      d={
      "M "+(x-dim)+","+y+
      "A "+dim+","+dim+" 0 0,0 "+x+","+(y-dim)+
      "A "+dim+","+dim+" 0 0,0 "+(x+dim)+","+y+
      "A "+dim+","+dim+" 0 0,0 "+x+","+(y+dim)+
      "A "+dim+","+dim+" 0 0,0 "+(x-dim)+","+y
      }
    fill={fill} stroke="gray" strokeWidth="1" />
  );
}

function NodeMarker(props, context) {
  let {x, y, fill, dim, tip, transform} = props;
  y-=UNIT/4;
  return <polygon points={
    (x-dim)+","+y+" "+
    x+","+(y-2*dim)+" "+
    (x+dim)+","+y+" "+
    x+","+(y+dim)
  } transform={transform} stroke="gray" strokeWidth="1" fill={fill}><title>{tip}</title></polygon>;
}


let _debounce = false;
class PropNode extends React.PureComponent {
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
    if (event.buttons===2) {
      this.props.setModifier(true);
    } else {
      this.props.setModifier(event.ctrlKey);
    }
    if (!this.props.propSelectAllowed(this.props.propid)) {
      let past = 0;
      for (let move of this.props.moves[this.props.propid]) {
        if (past+beats(move)*BEAT > this.props.tick2) {
          this.props.validateTransition();
          this.props.activateProp(this.props.propid);
          this.props.gotoTick(past);
          return;
        } else {
          past += beats(move)*BEAT;
          return;
        }
      }
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
    this.localState.origin = clone(this.props.props[this.props.propid]);
    this.localState.xoffset = p.x - x;
    this.localState.yoffset = p.y + y;
    // do I need to debounce this sucker??
    if (!_debounce) {
      this.props.setActiveNode(this.props.node);
      _debounce = true;
      setTimeout(()=>(_debounce=false),0);
      this.props.activateProp(this.props.propid);
    }
  }
  handleMouseUp = (event) => {
    if (this.props.frozen) {
      return;
    }
    this.props.setModifier(event.crlKey);
    event.preventDefault();
    let dragged = Draggables[this.props.dragID].localState.dragging;
    if (dragged && dragged!==this) {
      dragged.handleMouseUp.call(dragged, event);
      return;
    }
    if (this.localState.beingDragged && !this.props.validate && this.props.propSelectAllowed(this.props.propid)) {
      this.props.modifyMoveUsingNode({
        node: NODES[this.props.node],
        propid: this.props.propid,
      });
      // it should be okay to modify this even if we're not sure whether modifier was set
      if (this.props.node<HEAD) {
        let n = this.props.node+1;
        if (this.props.node===HAND && this.props.locks.grip) {
          n+=1;
        } else if (this.props.node===PIVOT && this.props.locks.helper) {
          n+=1;
        }
        this.props.modifyMoveUsingNode({
          node: NODES[n],
          propid: this.props.propid
        });
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
    if (this.localState.beingDragged) {
      // note: harmless violation of React state management practices
      this.localState.point.x = event.clientX;
      this.localState.point.y = event.clientY;
      // nodes should be decoupled during transitions and when the control key is down
      let decoupled = this.props.modifier || this.props.transition;
      if (event.buttons===2) {
        this.props.setModifier(true);
        decoupled = true;
      } else if (!event.ctrlKey) {
        this.props.setModifier(false);
        decoupled = this.props.transition;
      }
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
        r = round(r, 0.5) || 0.01;
      }
      if (([HEAD, GRIP].includes(this.props.node) || (this.props.node===HAND && this.props.locks.grip)) && this.props.transition && r>0.01) {
        return;
      }
      // how fine-grained is the rounding on angles?
      const FRACTION = 4;
      let rounding = round(Math.PI/(FRACTION*VS3D.UNIT),1);
      // !!! this may be a bit fishy, actually.  shouldn't the rounding happen in-plane?
      a = round(a, rounding);
      b = round(b, rounding);
      let v = sphere$vectorize({r: r, a: a, b: b});
      let x1 = v.x;
      let y1 = v.y;
      let z1 = v.z;
      // alternate, grid-based roundings
      let x2 = round(x, 0.5);
      let y2 = round(y, 0.5);
      let z2 = round(z, 0.5);
      let d1 = (x1-x)*(x1-x)+(y1-y)*(y1-y)+(z1-z)*(z1-z);
      let d2 = (x2-x)*(x2-x)+(y2-y)*(y2-y)+(z2-z)*(z2-z);
      if (decoupled && this.props.locks.head && (this.props.node===GRIP || (this.props.node===HAND && this.props.locks.grip))) {
        // respect the tether look in decoupled mode
        // I think this 
        let origin = this.localState.origin;
        let headsum = (this.props.node===HAND) ? cumulate([origin.hand, origin.grip, origin.head]) : cumulate([origin.grip, origin.head]);
        let {x: xh, y: yh, z: zh} = sphere$vectorize(headsum);
        let dx = x-xh;
        let dy = y-yh;
        let dz = z-zh;
        let s = vector$spherify({x: dx, y: dy, z: dz});
        a = round(s.a, rounding);
        b = round(s.b, rounding);
        v = sphere$vectorize({r: 1, a: a, b: b});
        x1 = xh + v.x;
        x2 = x1;
        y1 = yh + v.y;
        y2 = y1;
        z1 = zh + v.z;
        z2 = z1;
      }
      if ((this.props.node===HEAD && this.props.locks.head) || d1<=d2) {
        x = x1;
        y = y1;
        z = z1;
      } else {
        x = x2;
        y = y2;
        z = z2;
      }
      this.props.setNodePosition({
        propid: this.props.propid,
        node: this.props.node,
        x: x,
        y: y,
        z: z,
        plane: plane
      });
      if (decoupled && this.props.node!==HEAD) {
        let child = this.props.node+1;
        if (child===HELPER && this.props.locks.helper) {
          child+=1;
        } else if (child===GRIP && this.props.locks.grip) {
          child+=1;
        }
        let origin = this.localState.origin;
        let {x: x0, y: y0, z: z0} = sphere$vectorize(origin[NODES[this.props.node]]);
        let dx = x - x0;
        let dy = y - y0;
        let {x: xc, y: yc, z: zc} = sphere$vectorize(origin[NODES[child]]);
        this.props.setNodePosition({
          propid: this.props.propid,
          node: child,
          x: xc-dx,
          y: yc-dy,
          z: zc,
          plane: plane
        });
      }
    }
  }
  handleDoubleClick = (event) => {
    // if (doubleClickHandled===false) {
    //   event.preventDefault();
    //   handleDoubleClick();
    //   console.log("double clicked");
    // }
  }
  avoidContextMenu = (e)=>{
    e.preventDefault();
    return false;
  }
  render() {
    let decoupled = this.props.modifier || this.props.transition;
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
    if (isNaN(x) || isNaN(y)) {
      x = 0;
      y = 0;
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
      // fix NaN
      if (isNaN(x2) || isNaN(y2)) {
        x2 = 0;
        y2 = 0;
      }
      let style = {stroke: "gray"};
      if (n===HEAD) {
        style.strokeWidth = 3;
      } else {
        style.strokeDasharray="5,5";
      }
      if (decoupled) {
        style.strokeDasharray="2";
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
    let marker = null;
    // !!! should I also do this somehow for decoupling?
    if (zeroish(node.r, 0.015) && this.props.activeNode===this.props.node && this.props.getActivePropId()===this.props.propid) {
      // !!!! I can't really do this with node.a
      let a = node.a;
      if (isNaN(a)) {
        a = 0;
      }
      let tip = "zero " +NODES[this.props.node]+" at angle "+a;
      let trans = "rotate(" + a + " "+X0+" "+Y0+")";
      marker = <NodeMarker x={X0} y={Y0} transform={trans} fill={this.props.color} dim={UNIT/20} tip={tip}/>;
    }
    let title = (this.props.tick) ? "drag to set starting "+NODES[this.props.node] : "drag to set next "+NODES[this.props.node]; 
    if (this.props.transition) {
      title = "drag to set starting "+NODES[this.props.node];
    }
    let dimmer = "#333333";
    let circles = null;
    if (this.localState.beingDragged && !isNaN(x) && !isNaN(y)) {
      let xc = round(X0-x,1);
      let yc = round(Y0-y,1);
      // I need some way to round this off to zero.
      circles = 
        <g>
          <circle cx={xc} cy={yc} r={HALF} fill="none" stroke={dimmer} />  
          <circle cx={xc} cy={yc} r={UNIT} fill="none" stroke={dimmer} />
          <circle cx={xc} cy={yc} r={1.5*UNIT} fill="none" stroke={dimmer} />
          <circle cx={xc} cy={yc} r={2*UNIT} fill="none" stroke={dimmer} />
        </g>
      ;
    }
    return (
      <g transform={"translate("+x+","+y+")"}>
        {circles}
        {tether}
        {decoupled ? child : null}
        <g 
          ref={(e)=>(this.element=e)}  
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onMouseMove={this.handleMouseMove}
          onMouseLeave={this.handleMouseLeave}
          onContextMenu={this.avoidContextMenu}
        >
          <title>{title}</title>  
          {shape}
          {marker}
        </g>
        {decoupled ? null : child}
        
      </g>
    );
  }
}