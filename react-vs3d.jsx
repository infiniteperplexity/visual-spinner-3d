// http://www.codedread.com/blog/archives/2005/12/21/how-to-enable-dragging-in-svg/

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
      <svg width={UNIT*UNITS} height={UNIT*UNITS}>
        {grid}
        <Dragger x={HALF*UNITS} y={HALF*UNITS} />
      </svg>
    );
  }
};

          // draggable="true"
          // onDragStart={this.handleDrag}
          // onDragOver={this.allowDrop}
          // onDragLeave={this.dragLeave}
          // onDrop={this.handleDrop}

class GridTarget extends React.Component {
  allowDrop = (event) => {
    event.preventDefault();
    event.target.style.strokeWidth = 3;
  }
  dragLeave = (event) => {
    event.preventDefault();
    event.target.style.strokeWidth = 1;
  }
  render() {
    let {x, y} = this.props;
    return [
    
      <line key="h" x1={x-HALF} y1={y} x2={x+HALF} y2={y} style={{stroke: "gray", strokeWidth: 1}}
        onDragOver={this.allowDrop} onDragLeave={this.dragLeave} />,
      <line key="v" x1={x} y1={y-HALF} x2={x} y2={y+HALF} style={{stroke: "gray", strokeWidth: 1}} 
        onDragOver={this.allowDrop} onDragLeave={this.dragLeave} />
    ]
  };
}

function Dragger({x, y}) {
  return (
    <g>
    <circle draggable={true}
      onDragStart={() => console.log('drag start')}
      onDragOver={() => console.log('on drag over')}
      onDrop={() => console.log('on drop')}
      cx={y} cy={y} r={2*UNIT} stroke="gray" strokeWidth="1" fill="green"/>
    </g>
  );
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