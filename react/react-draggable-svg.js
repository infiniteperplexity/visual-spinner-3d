let DraggableSVGs = [];

class DragSVG extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  componentDidMount() {
    this.dragID = DraggableSVGs.length;
    DraggableSVGs.push(this);
    this.dragging = null;
  }
  handleMouseMove = (event) => {
    if (this.dragging) {
      event.preventDefault();
      this.dragging.handleMouseMove.call(this.dragging, event);
    }
  }
  handleMouseUp = (event) => {
    if (this.dragging) {
      event.preventDefault();
      this.dragging.handleMouseUp.call(this.dragging, event);
    }
  }
  render() {
    return (
      <svg 
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp} 
        ...this.props} >
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
        grid[i].push(<GridTarget key={i+","+j} x={i*UNIT+HALF} y={j*UNIT+HALF} />);
      }
    }
    let dragID = "WALL";
    return (
      <DragSVG dragID={dragID} width={UNIT*UNITS} height={UNIT*UNITS}>
        {grid} 
        <Draggable dragID={dragID}>
          <circle cx={HALF*UNITS} cy={HALF*UNITS} r={HALF} stroke="gray" strokeWidth="1" fill="green" />
        </Draggable>
      </DragSVG>
    );
  }
};
// <svg width={UNIT*UNITS} height={UNIT*UNITS}>
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
    this.dragID = props.dragID;
    this.state = {
      beingDragged: false,
      xoffset: 0,
      yoffset: 0,
      anchorX: 0,
      anchorY: 0
    };
    this.svg = props.svg;
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
    this.setState({beingDragged: true});
    DragSpaces[this.dragID].dragging = this;
    // note: harmless violation of React state management practices
    this.point.x = event.clientX;
    this.point.y = event.clientY;
    let p = this.point.matrixTransform(this.matrix);
    this.setState({xoffset: p.x - this.state.anchorX});
    this.setState({yoffset: p.y - this.state.anchorY});
  }
  handleMouseUp = (event) => {
    event.preventDefault();
    this.setState({beingDragged: false});
    DragSpaces[this.dragID].dragging = null;
  }
  handleMouseLeave = (event) => {
    //event.preventDefault();
    //this.setState({beingDragged: false});
  }
  handleMouseMove = (event) => {
    event.preventDefault();
    // note: harmless violation of React state management practices
    this.point.x = event.clientX;
    this.point.y = event.clientY;
    if(this.state.beingDragged) {
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