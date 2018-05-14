let destination = document.querySelector("#container");
const UNIT = 50;
const UNITS = 11;
const HALF = UNIT/2;
let X0 = HALF*UNITS;
let Y0 = HALF*UNITS;

let store;

let HAND = 0, HEAD = 1;
let NODES = [HAND, HEAD];

let Props = {
  "red": [{x: 0, y: 0}, {x: UNIT, y: UNIT}],
  "blue": [{x: 0, y: 0}, {x: -UNIT, y: -UNIT}]
};

let DragSpaces = {};

function clone(obj) {
  let nobj = {...obj};
  for (let prop in nobj) {
    if (typeof(nobj[prop])==="object") {
      nobj[prop] = {...clone(nobj[prop])};
    }
  }
  return nobj;
}

class DragSVG extends React.Component {
  constructor(props, context) {
    super(props, context);
    DragSpaces[props.dragID] = this;
    this.info = {
      dragging: null,
      dragID: props.dragID
    }
    this.dragging = null;
  }
  handleMouseMove = (event) => {
    if (this.dragging) {
      event.preventDefault();
      this.dragging.handleMouseMove.call(this.info.dragging, event);
    }
  }
  handleMouseUp = (event) => {
    if (this.dragging) {
      event.preventDefault();
      this.dragging.handleMouseUp.call(this.info.dragging, event);
    }
  }
  handleMouseLeave = (event) => {
    if (this.dragging) {
      event.preventDefault();
      this.dragging.handleMouseUp.call(this.info.dragging, event);
    }
  }
  render() {
    return (
      <svg
        width={this.props.width}
        height={this.props.height}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.props.children}
      </svg>
    );
  }
}

class Grid extends React.Component {
  render() {
    let grid = [];
    for (let i=0; i<UNITS; i++) {
      grid.push([])
      for (let j=0; j<UNITS; j++) {
        grid[i].push(<GridTarget key={i+","+j}  x={i*UNIT+HALF} y={j*UNIT+HALF} />);
      }
    }
    let dragID = "WALL";
    return (
      <DragSVG dragID={dragID} width={UNIT*UNITS} height={UNIT*UNITS}>
        {grid} 
        <PropComponent dragID={dragID} prop="red" color="red" {...this.props}/>
        <PropComponent dragID={dragID} prop="blue" color="blue" {...this.props}/>
      </DragSVG>
    );
  }
};

function PropJointComponent(props) {
  let {prop, node1, node2} = props;
  let {x: x1, y: y1} = props.props[prop][node1];
  let {x: x2, y: y2} = props.props[prop][node2];
  return (
    <line x1={0+X0} y1={0+Y0} x2={x2+X0} y2={y2+Y0} style={{stroke: "gray", strokeWidth: 3}}/>
  );
}

function PropComponent(props) {
  return ([
    <PropNodeComponent key={HAND} node={HAND} {...props}>
      <circle cx={X0} cy={Y0} r={UNIT/8} stroke="gray" strokeWidth="1" fill="gray" />
      <PropJointComponent key={HAND+0.5} node1={HAND} node2={HEAD} {...props}/>,
      <PropNodeComponent key={HEAD} node={HEAD} {...props}>,
        <circle cx={X0} cy={Y0} r={UNIT/4} stroke="gray" strokeWidth="1" fill={props.color} />
      </PropNodeComponent>
    </PropNodeComponent>,
  ]);
}




class PropNodeComponent extends React.Component {
  constructor(props, context) {
    super(props, context);
    // this stuff is not really "state" in the sense Redux cares about
    this.info = {
      prop: props.prop,
      node: props.node,
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
    if (DragSpaces[this.info.dragID].dragging === null) { 
      this.info.beingDragged = true;
      DragSpaces[this.info.dragID].dragging = this;
    }
    // note: harmless violation of React state management practices
    this.info.point.x = event.clientX;
    this.info.point.y = event.clientY;
    let p = this.info.point.matrixTransform(this.info.matrix);
    let {x, y} = this.props.props[this.info.prop][this.info.node];
    this.info.xoffset = p.x - x;
    this.info.yoffset = p.y - y;
  }
  handleMouseUp = (event) => {
    event.preventDefault();
    this.info.beingDragged = false;
    DragSpaces[this.info.dragID].dragging = null;
  }
  handleMouseLeave = (event) => {
    //event.preventDefault();
    //this.setState({beingDragged: false});
  }
  handleMouseMove = (event) => {
    event.preventDefault();
    // note: harmless violation of React state management practices
    this.info.point.x = event.clientX;
    this.info.point.y = event.clientY;
    if (this.info.beingDragged) {
      let p = this.info.point.matrixTransform(this.info.matrix);
      this.props.setNode({
        prop: this.info.prop,
        node: this.info.node,
        x: p.x-this.info.xoffset,
        y: p.y-this.info.yoffset
      });
    }
  }
  render() {
    let {x, y} = this.props.props[this.info.prop][this.info.node];
    return (
      <g 
        ref={(e)=>(this.element=e)}
        transform={"translate("+x+","+y+")"}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.props.children}
      </g>
    );
  }
}

// A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let App = ReactRedux.connect(
  (state)=>({props: state.props}),
  (dispatch)=>({
      setNode: (args)=>dispatch({type: "setNode", ...args})
  })
)(Grid);

//a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      props: clone(Props)
    };
  }
  switch (action.type) {
    case "setNode":
      let {prop, node, x, y} = action;
      let props = clone(state.props);
      props[prop][node] = {x: x, y: y};
      return {...state, props: props};
    default:
      return state;
  }
}

class GridTarget extends React.Component {
  render() {
    let {x, y} = this.props;
    return [
      <line key="h" x1={x-HALF} y1={y} x2={x+HALF} y2={y} style={{stroke: "gray", strokeWidth: 1}} />,
      <line key="v" x1={x} y1={y-HALF} x2={x} y2={y+HALF} style={{stroke: "gray", strokeWidth: 1}} />
    ]
  };
}

store = Redux.createStore(reducer);
ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <App />
  </ReactRedux.Provider>,
  destination
);