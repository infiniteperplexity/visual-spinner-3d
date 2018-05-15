//target Div
let destination = document.querySelector("#container");

const UNIT = 50;
const UNITS = 11;
const HALF = UNIT/2;
let X0 = HALF*UNITS;
let Y0 = HALF*UNITS;

// registry of all props
let Props = {
  "red": newProp({head: {x: 1, y: 0}}),
  "blue": newProp({head: {x: 0, y: 1}})
};
// Node structure of Props
let NODES = [0,1,2,3,4], [BODY,PIVOT,HELPER,HAND,HEAD] = NODES;

// factory function for new props
function newProp({body={x:0, y:0},pivot={x:0, y:0},helper={x:0,y:0},hand={x:0,y:0}, head={x:1,y:1}}) {
  return [
    {x: body.x*UNIT, y: body.y*UNIT},
    {x: pivot.x*UNIT, y: pivot.y*UNIT},
    {x: helper.x*UNIT, y: helper.y*UNIT},
    {x: hand.x*UNIT, y: hand.y*UNIT},
    {x: head.x*UNIT, y: head.y*UNIT}
  ];
}

// reference to Redux store
let store;
//utility function for immutable state
function clone(obj) {
  let nobj = {...obj};
  for (let prop in nobj) {
    if (typeof(nobj[prop])==="object") {
      nobj[prop] = {...clone(nobj[prop])};
    }
  }
  return nobj;
}
function round(n, step) {
  return Math.round(n/step)*step;
}

// prevent recursive handling of double-clicks
let doubleClickHandled = false;
function handleDoubleClick() {
  doubleClickHandled = true;
  setInterval(()=>(doubleClickHandled=false),0);
}

// App, basically
function Grid(props, context) {
  let grid = [];
  for (let i=0; i<UNITS; i++) {
    let x = UNIT*i-HALF;
    grid.push(<line key={i} x1={x} y1={0} x2={x} y2={UNITS*UNIT} style={{stroke: "gray", strokeWidth: 1}}/>);
  }  
  for (let j=0; j<UNITS; j++) {
    let y = UNIT*j-HALF;
    grid.push(<line key={UNITS+j} x1={0} y1={y} x2={UNITS*UNIT} y2={y} style={{stroke: "gray", strokeWidth: 1}}/>);
  }
  return (
    <DragSVG dragID={props.dragID} width={UNIT*UNITS} height={UNIT*UNITS}>
      {grid} 
      <PropNode prop="red" color="red" {...props}/>
      <PropNode prop="blue" color="blue" {...props}/>
    </DragSVG>
  );
}

// Draggable SVG area
let Draggables = {};
class DragSVG extends React.Component {
  constructor(props, context) {
    super(props, context);
    Draggables[props.dragID] = this;
    this.info = {
      dragging: null,
      dragID: props.dragID
    }
  }
  handleMouseMove = (event) => {
    if (this.info.dragging) {
      event.preventDefault();
      this.info.dragging.handleMouseMove.call(this.info.dragging, event);
    }
  }
  handleMouseUp = (event) => {
    if (this.info.dragging) {
      event.preventDefault();
      this.info.dragging.handleMouseUp.call(this.info.dragging, event);
    }
  }
  handleMouseLeave = (event) => {
    if (this.info.dragging) {
      event.preventDefault();
      this.info.dragging.handleMouseUp.call(this.info.dragging, event);
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

class PropNode extends React.Component {
  constructor(props, context) {
    super(props, context);
    // this stuff is not really "state" in the sense Redux cares about
    this.info = {
      prop: props.prop,
      node: props.node || 0,
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
    let {x, y} = this.props.props[this.info.prop][this.info.node];
    this.info.xoffset = p.x - x;
    this.info.yoffset = p.y - y;
  }
  handleMouseUp = (event) => {
    event.preventDefault();
    this.info.beingDragged = false;
    Draggables[this.info.dragID].info.dragging = null;
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
        x: round(p.x-this.info.xoffset, UNIT),
        y: round(p.y-this.info.yoffset, UNIT)
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
    let {x, y} = this.props.props[this.info.prop][this.info.node];
    let r = UNIT/16;
    if (this.info.node===HAND) {
      r = UNIT/8;
    } else if (this.info.node===HEAD) {
      r = UNIT/4;
    }
    let fill = (this.info.node===HEAD) ? this.info.color : "gray";
    let tether = null;
    let child = null;
    if (this.info.node<NODES.length-1) {
      let {x: x2, y: y2} = this.props.props[this.info.prop][this.info.node+1];
      let style = {stroke: "gray"};
      if (this.info.node===HAND) {
        style.strokeWidth = 3;
      } else {
        style.strokeDasharray="5,5";
      }
      tether = <line x1={X0} y1={Y0} x2={X0+x2} y2={Y0+y2} style={style} />
      child = <PropNode {...this.props} node={this.info.node+1} />;
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
        <circle cx={X0} cy={Y0} r={r} stroke="gray" strokeWidth="1" fill={fill} />
        {tether}
        {child}
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

store = Redux.createStore(reducer);
ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <App dragID="WALL"/>
  </ReactRedux.Provider>,
  destination
);