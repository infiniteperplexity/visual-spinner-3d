// http://www.codedread.com/blog/archives/2005/12/21/how-to-enable-dragging-in-svg/

// might need a polyfill for Internet Explorer for getScreenCTM?

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
        <Draggable>
          <rect x={HALF*UNITS} y={HALF*UNITS} width={UNIT} height={UNIT} stroke="gray" strokeWidth="1" fill="green" />
        </Draggable>
      </svg>
    );
  }
};
// {grid}
// <DragRect svg={this.svg} x={HALF*UNITS} y={HALF*UNITS} width={UNIT} height={UNIT} />


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
      xoffset: 0,
      yoffset: 0,
      anchorX: 0,
      anchorY: 0
    };
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
    this.point = e.createSVGPoint();
    this.matrix = this.element.getScreenCTM().inverse();
  }
  handleMouseDown = (event) => {
    event.preventDefault();
    this.setState({dragging: true});
    // note: harmless violation of React state management practices
    this.point.x = event.clientX;
    this.point.y = event.clientY;
    let p = this.point.matrixTransform(this.matrix);
    this.setState({xoffset: p.x - this.state.anchorX});
    this.setState({yoffset: p.y - this.state.anchorY});
  }
  handleMouseUp = (event) => {
    event.preventDefault();
    this.setState({dragging: false});
  }
  handleMouseLeave = (event) => {
    event.preventDefault();
    this.setState({dragging: false});
  }
  handleMouseMove = (event) => {
    event.preventDefault();
    // note: harmless violation of React state management practices
    this.point.x = event.clientX;
    this.point.y = event.clientY;
    if(this.state.dragging) {
      let p = this.point.matrixTransform(this.matrix);
      this.setState({anchorX: p.x-this.state.xoffset});
      this.setState({anchorY: p.y-this.state.yoffset});
    }
  }
  render() {
    return (
      <g 
        ref={(e)=>(this.element=e)}
        transform={"translate("+this.state.anchorX+","+this.state.anchorY+")"}
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
  (state)=>({}),
  (dispatch)=>({
      f: ()=>{dispatch({})}
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