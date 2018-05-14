let destination = document.querySelector("#container");
const UNIT = 50;
const UNITS = 11;
const HALF = UNIT/2;

let store;

let propRegistry = {
  "red": {
    hand: {
      x: 0,
      y: 0
    },
    head: {
      x: 1,
      y: 1
    }
  }
};

let DragSpaces = {};

class DragSVG extends React.Component {
  constructor(props, context) {
    super(props, context);
    DragSpaces[props.dragID] = this;
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
  handleMouseLeave = (event) => {
    if (this.dragging) {
      event.preventDefault();
      this.dragging.handleMouseUp.call(this.dragging, event);
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
        <PropNodeComponent dragID={dragID} {...this.props}>
          <circle cx={HALF*UNITS} cy={HALF*UNITS} r={HALF} stroke="gray" strokeWidth="1" fill="green" />
        </PropNodeComponent>
      </DragSVG>
    );
  }
};

class PropNodeComponent extends React.Component {
  constructor(props, context) {
    super(props, context);
    // this stuff is not really "state" in the sense Redux cares about
    this.info = {
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
    this.info.beingDragged = true;
    DragSpaces[this.info.dragID].dragging = this;
    // note: harmless violation of React state management practices
    this.info.point.x = event.clientX;
    this.info.point.y = event.clientY;
    let p = this.info.point.matrixTransform(this.info.matrix);
    this.info.xoffset = p.x - this.props.anchorX;
    this.info.yoffset = p.y - this.props.anchorY;
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
      this.props.setX(p.x-this.info.xoffset);
      this.props.setY(p.y-this.info.yoffset);
    }
  }
  render() {
    return (
      <g 
        ref={(e)=>(this.element=e)}
        transform={"translate("+this.props.anchorX+","+this.props.anchorY+")"}
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
  (state)=>({
    anchorX: state.anchorX,
    anchorY: state.anchorY
  }),
  (dispatch)=>({
      setX: (x)=>dispatch({type: "setX", x: x}),
      setY: (y)=>dispatch({type: "setY", y: y})
  })
)(Grid);

// a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      anchorX: 0,
      anchorY: 0
    };
  }
  switch (action.type) {
    case "setX":
      return {...state, anchorX: action.x};
    case "setY":
      return {...state, anchorY: action.y};
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