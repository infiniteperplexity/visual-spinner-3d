let MouseHandler = {
  listeners: []
};
function handleMouseUpListeners(event) {
  for (let listener of MouseHandler.listeners) {
    if (listener.handleMouseUp) {
      listener.handleMouseUp(event);
    }
  }
}
document.body.addEventListener("mouseup",handleMouseUpListeners);


let destination = document.querySelector("#container");
const UNIT = 50;
const UNITS = 11;
const HALF = UNIT/2;

class Grid extends React.Component {
  componentDidMount() {
    this.dragging = null;
    MouseHandler.listeners.push(this);
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
    let grid = [];
    for (let i=0; i<UNITS; i++) {
      grid.push([])
      for (let j=0; j<UNITS; j++) {
        grid[i].push(<GridTarget key={i+","+j} x={i*UNIT+HALF} y={j*UNIT+HALF} />);
      }
    }
    return (
      <svg 
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp} 
        width={UNIT*UNITS}
        height={UNIT*UNITS}
      >
        {grid} 
        <PropNode dsvg={this} x={HALF*UNITS} y={HALF*UNITS} fill="red" />
        <PropNode dsvg={this} x={HALF*UNITS} y={HALF*UNITS} fill="blue" />
      </svg>
    );
  }
};

class PropNode extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      dragged: false,
      xoffset: 0,
      yoffset: 0,
      dragx: 0,
      dragy: 0
    };
    if (!props.dsvg) {
      throw new Error("DraggableG not provided with a parent DraggableSVG.");
    }
    this.dsvg = props.dsvg;
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
    this.setState({dragged: true});
    this.dsvg.dragging = this;
    // note: harmless violation of React state management practices
    this.point.x = event.clientX;
    this.point.y = event.clientY;
    let p = this.point.matrixTransform(this.matrix);
    this.setState({xoffset: p.x-this.state.dragx});
    this.setState({yoffset: p.y-this.state.dragy});
  }
  handleMouseUp = (event) => {
    event.preventDefault();
    this.setState({dragged: false});
    this.dsvg.dragging = null;
  }
  handleMouseMove = (event) => {
    event.preventDefault();
    // note: harmless violation of React state management practices
    this.point.x = event.clientX;
    this.point.y = event.clientY;
    if(this.state.dragged) {
      let p = this.point.matrixTransform(this.matrix);
      this.setState({dragx: p.x-this.state.xoffset});
      this.setState({dragy: p.y-this.state.yoffset});
    }
  }
  render() {
    let {x, y, fill} = this.props;
    return (
      <g 
        ref={(e)=>(this.element=e)}
        transform={"translate("+this.state.dragx+","+this.state.dragy+")"}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseLeave}
      >
         <circle cx={x} cy={y} r={HALF} stroke="gray" strokeWidth="1" fill={fill} />
      </g>
    );
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
    return {
      nodes: []
    };
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


class DraggableG extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      dsvg_dragged: false,
      dsvg_xoffset: 0,
      dsvg_yoffset: 0,
      dsvg_x: 0,
      dsvg_y: 0
    };
    if (!props.dsvg) {
      throw new Error("DraggableG not provided with a parent DraggableSVG.");
    }
    this.dsvg_parent = props.dsvg;
  }
  componentDidMount() {
    let e = this.dsvg_gelement;
    while (e.nodeName!=="svg") {
      e = e.parentNode;
      if (e===null) {
        return null;
      }
    }
    // matrix transformation stuff
    this.dsvg_point = e.createSVGPoint();
    this.dsvg_matrix = this.dsvg_gelement.getScreenCTM().inverse();
  }
  handleMouseDown = (event) => {
    event.preventDefault();
    this.setState({dsvg_dragged: true});
    this.dsvg_parent.dsvg.dsvg_dragging = this;
    // note: harmless violation of React state management practices
    this.dsvg_point.x = event.clientX;
    this.dsvg_point.y = event.clientY;
    let p = this.dsvg_point.matrixTransform(this.dsvg_matrix);
    this.setState({dsvg_xoffset: p.x-this.state.dsvg_x});
    this.setState({dsvg_yoffset: p.y-this.state.dsvg_y});
  }
  handleMouseUp = (event) => {
    event.preventDefault();
    this.setState({dsvg_dragged: false});
    this.dsvg_parent.dsvg.dsvg_dragging = null;
  }
  handleMouseMove = (event) => {
    event.preventDefault();
    // note: harmless violation of React state management practices
    this.dsvg_point.x = event.clientX;
    this.dsvg_point.y = event.clientY;
    if(this.state.dsvg_dragged) {
      let p = this.dsvg_point.matrixTransform(this.dsvg_matrix);
      this.setState({dsvg_x: p.x-this.state.dsvg_xoffset});
      this.setState({dsvg_y: p.y-this.state.dsvg_yoffset});
    }
  }
  render() {
    return (
      <g 
        ref={(e)=>(this.dsvg_gelement=e)}
        transform={"translate("+this.state.dsvg_x+","+this.state.dsvg_y+")"}
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