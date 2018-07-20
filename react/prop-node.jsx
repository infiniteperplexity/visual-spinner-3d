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
    if (!this.props.propSelectAllowed(this.props.propid)) {
      this.handleSnapTo();
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
    let node = this.props.props[this.props.propid][NODES[this._node]];
    let v = sphere$vectorize(node);
    let x = v.x * UNIT;
    let y = v.y * UNIT;
    this.localState.xoffset = p.x - x;
    this.localState.yoffset = p.y + y;
    // do I need to debounce this sucker??
    if (!_debounce) {
      this.props.setActiveNode(this._node);
      _debounce = true;
      setTimeout(()=>(_debounce=false),0);
      this.props.activateProp(this.props.propid);
    }
  }
  handleMouseUp = (event) => {
    if (this.props.frozen) {
      return;
    }
    event.preventDefault();
    // this.localState.ctrlKey = false;
    if (this.localState.beingDragged && !this.props.validate && this.props.propSelectAllowed(this.props.propid)) {
      this.handleModifyMove();
    }
    this.localState.beingDragged = false;
    Draggables[this.props.dragID].localState.dragging = null;
  }
  handleMouseLeave = (event) => {
    // if (this.localState.beingDragged) {
    //   this.handleMouseUp(event);
    // }
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
      if (this.props.reversed && this._node===HAND && this.props.locks.head) {
        r = 1;
      } else if (!this.props.reversed && this._node===HEAD && this.props.locks.head) {
        r = 1;
      } else {
          r = round(r, 0.5) || 0.01;
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
      // alternate, grid-based rounding
      let x2 = round(x, 0.5);
      let y2 = round(y, 0.5);
      let z2 = round(z, 0.5);
      let d1 = (x1-x)*(x1-x)+(y1-y)*(y1-y)+(z1-z)*(z1-z);
      let d2 = (x2-x)*(x2-x)+(y2-y)*(y2-y)+(z2-z)*(z2-z);
      if (d1<=d2) {
        x = x1;
        y = y1;
        z = z1;
      } else if (this.props.reversed && this._node===HAND && this.props.locks.head) {
        x = x1;
        y = y1;
        z = z1;
      } else if (!this.props.reversed && this._node===HEAD && this.props.locks.head) {
        x = x1;
        y = y1;
        z = z1;
      } else {
        x = x2;
        y = y2;
        z = z2;
      }
      this.handleMoveNode({
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
    if (this.props.node===undefined) {
      if (this.props.reversed) {
        this._node = HEAD;
      } else {
        this._node = (this.props.locks.body) ? PIVOT : BODY;
      }
    } else {
      this._node = this.props.node;
    }
    let {x, y} = this.handleTranslate();
    let node = this.props.props[this.props.propid][NODES[this._node]];
    let {tether, child} = (this.props.reversed) ? this.handleParentNode() : this.handleChildNode();
    let shape;
    // should actually be the GRIP node?
    if (this._node===BODY) {
      shape = <BodyNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/12} />
    } else if (this._node===PIVOT) {
      shape = <PivotNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/10}/>
    } else if (this._node===HELPER) {
      shape = <HelperNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/10} />
    } else if (this._node===HAND && !this.props.locks.grip) {
      shape = <HandNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/10} />
    } else if (this._node===GRIP || this._node===HAND) {
      shape = <GripNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/16} />
    } else if (this._node===HEAD) {
      shape = <HeadNode x={X0} y={Y0} fill={this.props.color} dim={UNIT/8} />
    }
    let marker = null;
    if (zeroish(node.r, 0.015) && this.props.activeNode===this._node && this.props.getActivePropId()===this.props.propid) {
      // !!!! I can't really do this with node.a
      let tip = "zero " +NODES[this._node]+" at angle "+node.a;
      let trans = "rotate(" + node.a + " "+X0+" "+Y0+")";
      marker = <NodeMarker x={X0} y={Y0} transform={trans} fill={this.props.color} dim={UNIT/20} tip={tip}/>;
    }
    let title = (this.props.tick) ? "drag to set starting "+NODES[this._node] : "drag to set next "+NODES[this._node]; 
    if (this.props.transition) {
      title = "drag to set starting "+NODES[this._node];
    }
    let dimmer = "#333333";
    let circles = null;
    if (this.localState.beingDragged && !isNaN(x) && !isNaN(y)) {
      let xc = X0-x;
      let yc = Y0-y;
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
        {circles}
        {tether}
        {shape}
        {child}
        {marker}
      </g>
    );
  }
  handleTranslate = ()=>{
    let v;
    let prop = this.props.props[this.props.propid];
    if (this.props.reversed && this._node===HEAD) {
      let s = cumulate(NODES.map(node=>prop[node]));
      v = sphere$vectorize(s);
    } else {
      let n = (this.props.reversed) ? this._node+1 : this._node;
      if (n===HELPER && this.props.locks.helper) {
        n+=1;
      } else if (n===GRIP && this.props.locks.grip) {
        n+=1;
      }
      v = sphere$vectorize(prop[NODES[n]]);
      if (this.props.reversed) {
        v.x = -v.x;
        v.y = -v.y;
        v.z = -v.z;
      }
    }
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
    return {x: x, y: y};
  }
  handleSnapTo = ()=> {      
    let past = 0;
    for (let move of this.props.moves[this.props.propid]) {
      if (past+beats(move)*BEAT > this.props.tick2) {
        this.props.validateTransition();
        this.props.activateProp(this.props.propid);
        this.props.gotoTick(past);
        return;
      } else {
        past += beats(move)*BEAT;
      }
    }
  }
  handleModifyMove = ()=>{
    this.props.modifyMoveUsingNode({
      node: NODES[this._node],
      propid: this.props.propid,
    });
  }
  handleMoveNode = ({x, y, z, plane})=>{
    if (this.props.reversed) {
      this.props.reversedNodePosition({
        propid: this.props.propid,
        node: this._node,
        x: x,
        y: y,
        z: z,
        plane: plane
      });
    } else {
      this.props.setNodePosition({
        propid: this.props.propid,
        node: this._node,
        x: x,
        y: y,
        z: z,
        plane: plane
      });
    }
  }
  handleChildNode = ()=>{
    if (this._node>=NODES.length-1) {
      return ({
        tether: null,
        child: null
      });
    }
    let n = this._node+1;
    if (n===HELPER && this.props.locks.helper) {
      n+=1;
    } else if (n===GRIP && this.props.locks.grip) {
      n+=1;
    }
    let node2 = this.props.props[this.props.propid][NODES[n]];
    let v2 = sphere$vectorize(node2);
    let x2, y2;
    let plane = this.props.plane;
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
    console.log(NODES[this._node]);
    console.log(X0, x2, Y0, y2);  
    let tether = <line x1={X0} y1={Y0} x2={X0+x2} y2={Y0+y2} style={style} />
    let child = <PropNode {...this.props} node={n} />;
    return {tether: tether, child: child};
  }
  handleParentNode = ()=>{
    console.log(NODES[this._node]);
    if (this._node<=0) {
      return ({
        tether: null,
        child: null
      });
    } else if (this._node===PIVOT && this.props.locks.body) {
      return ({
        tether: null,
        child: null
      });
    }
    let n = this._node-1;
    if (n===HELPER && this.props.locks.helper) {
      n-=1;
    } else 
    if (n===GRIP && this.props.locks.grip) {
      n-=1;
    }
    // duplicate code!
    let node2 = this.props.props[this.props.propid][NODES[this._node]];
    let v2 = sphere$vectorize(node2);
    let x2, y2;
    let plane = this.props.plane;
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
    if (this._node===HEAD) {
      style.strokeWidth = 3;
    } else {
      style.strokeDasharray="5,5";
    }
    let tether = <line x1={X0} y1={Y0} x2={X0-x2} y2={Y0-y2} style={style} />
    let child = <PropNode {...this.props} node={n} />;
    return {tether: tether, child: child};
  }
}


// So...
// actual coordinates
// body: -1, 0
// pivot: -1, -1
// helper: 0, -1
// hand: 0, -2
// grip: -1, -2
// head: -1, -3
// ~
// relative coordinates
// -1, 0 (body)
// 0, -1 (pivot)
// 1, 0 (helper)
// 0, -1 (hand)
// -1, 0 (grip)
// 0, -1 (head)
// ~
// reversed coordinates
// -1, -3 (cumulated) (render head)
// 0, 1 (-head) (render grip)
// 1, 0 (-grip) (render hand)
// 0, 1 (-hand) (render helper)
// -1, 0 (-helper) (render pivot)
// 0, 1 (-pivot) (render body)

// So...how can we deal with this?
  // the order of traversal for a prop is completely arbitrary.
  // so it's probably best to make handleTranslate the workhorse method