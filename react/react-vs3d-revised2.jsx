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


// a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      proplist: [
        [[0,0],[0,0],[0,0],[0,0],[0,0]],
        [[0,0],[0,0],[0,0],[0,0],[0,0]]
      ]
    };
  }
  switch (action.type) {
    case "setXY":
      state = {...state};
      let {i, j, x, y} = action;
      state.proplist[i][j][0] = x;
      state.proplist[i][j][1] = y;
      return state;
    default:
      return state;
  }
}


let propColors = ["red","blue"];

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
    let proplist = this.state.proplist;
    let propcomps = [];
    for (let i=0; i<proplist.length; i++) {
      propcomps.push([])
      for (let j=0; j<proplist[i].length; j++) {
        let [x, y] = proplist[i][j];
        let hinge = (j===0) ? null : propcomps[i][j-1];
        propcomps[i].push(<PropNode dsvg={this} x={x+UNITS*HALF} y={y+UNITS*HALF} hinge={hinge} fill={propColors[i]}/>);
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
        {propcomps}
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
    this.x = this.state.dragx;
    this.y = this.state.dragy;
    return (
      <g 
        ref={(e)=>(this.element=e)}
        transform={"translate("+this.thing.x+","+this.thing.y+")"}
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
  (state)=>({proplist: state.proplist}),
  (dispatch)=>({
      setXY: (i, j, x, y)=>{dispatch({type: "setXY", i: i, j: j, x: x, y: y})}
  })
)(Grid);

// create the store inline
ReactDOM.render(
  <ReactRedux.Provider store={Redux.createStore(reducer)}>
    <App />
  </ReactRedux.Provider>,
  destination
);
