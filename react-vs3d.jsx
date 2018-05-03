// http://www.codedread.com/blog/archives/2005/12/21/how-to-enable-dragging-in-svg/

// var m = El.getScreenCTM();
// var p = document.documentElement.createSVGPoint();
// p.x = evt.clientX;
// p.y = evt.clientY;
// p = p.matrixTransform(m.inverse());

// and point p will now be in user coordinate system of the element El.

//Returns a DOMMatrix representing the matrix that transforms the current element's coordinate system to the coordinate system of the SVG viewport for the SVG document fragment.

let destination = document.querySelector("#container");
const UNIT = 50;
const UNITS = 11;
const HALF = UNIT/2;

function parentSVG(el) {
  while (el.nodeName!=="svg") {
    el = el.parentNode;
    if (el===null) {
      return null;
    }
  }
  return el;
}

// A basic React component with some properties that I don't manually create
class Grid extends React.Component {
  render() {
    let grid = [];
    for (let i=0; i<UNITS; i++) {
      grid.push([])
      for (let j=0; j<UNITS; j++) {
        grid[i].push(<GridTarget key={i+","+j} x={i*UNIT+HALF} y={j*UNIT+HALF} />);
      }
    }
    return (
      <svg ref={(svg)=>(this.svg=svg)} width={UNIT*UNITS} height={UNIT*UNITS}>
        {grid}
        <DragRect svg={this.svg} x={HALF*UNITS} y={HALF*UNITS} width={UNIT} height={UNIT} />
      </svg>
    );
  }
};



class GridTarget extends React.Component {
  render() {
    let {x, y} = this.props;
    return [
      <line key="h" x1={x-HALF} y1={y} x2={x+HALF} y2={y} style={{stroke: "gray", strokeWidth: 1}} />,
      <line key="v" x1={x} y1={y-HALF} x2={x} y2={y+HALF} style={{stroke: "gray", strokeWidth: 1}} />
    ]
  };
}

class Draggable extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      dragging: false,
      xoffset: null,
      yoffset: null
    };
  }
  handleMouseDown = (event) => {
    this.setState({dragging: true});
    // create a point in the SVG's coordinate system
    let p = parentSVG(this.element).createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    let m = this.element.getScreenCTM();
    p = p.matrixTransform(m.inverse());
    this.setState({xoffset: p.x - this.getCenterX()});
    this.setState({yoffset: p.y - this.getCenterY()});
  }
  handleMouseUp = (event) => {
    this.setState({dragging: false});
  }
  handleMouseMove = (event) => {
    let p = parentSVG(this.element).createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    if(this.state.dragging) {
      let m = this.element.getScreenCTM();
      p = p.matrixTransform(m.inverse());
      this.setCenterX(p.x-this.state.xoffset);
      this.setCenterY(p.y-this.state.yoffset);
    }
  }
}

class DragRect extends Draggable {
  constructor(props, context) {
    super(props, context);
    this.state = {
      ...this.state,
      x: props.x,
      y: props.y
    }
  }
  getCenterX = () => {
    let e = this.element;
    return parseInt(e.getAttribute("x")+e.getAttribute("width")/2);
  }
  getCenterY = () => {
    let e = this.element;
    return parseInt(e.getAttribute("y")+e.getAttribute("height")/2);
  }
  setCenterX = (x) => {
    this.setState({x: x});
  }
  setCenterY = (y) => {
    this.setState({y: y});
  }
  render() {
    let {height, width} = this.props;
    let {x, y} = this.state;
    return (
      <rect ref={(e)=>(this.element=e)} x={x-width/2} y={y-height/2} width={width} height={height} stroke="gray" strokeWidth="1" fill="green"
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      />
    );
  }
}
// A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let App = ReactRedux.connect(
  (state)=>({}),
  (dispatch)=>({
      inc: ()=>{dispatch({type: "inc"})},
      dec: ()=>{dispatch({type: "dec"})}
  })
)(Grid);

// a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {n: 0};
  }
  let n = state.n;
  switch (action.type) {
    case "inc":
      return {n: n+1};
    case "dec":
      return {n: n-1};
    default:
      return state;
  }
}

// create the store inline
ReactDOM.render(
  <ReactRedux.Provider store={Redux.createStore(reducer)}>
    <App />
  </ReactRedux.Provider>,
  destination
);

/*
Let's look at SVG.  It's what d3 uses.

circle, rect

*/