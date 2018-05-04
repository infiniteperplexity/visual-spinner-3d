let destination = document.querySelector("#container");
const UNIT = 50;
const UNITS = 11;
const HALF = UNIT/2;


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
      <DraggableSVG ref={(e)=>(this.dsvg=e)} width={UNIT*UNITS} height={UNIT*UNITS}>
        {grid} 
        <DraggableG dsvg={this}>
          <circle cx={HALF*UNITS} cy={HALF*UNITS} r={HALF} stroke="gray" strokeWidth="1" fill="green" />
        </DraggableG>
        <DraggableG dsvg={this}>
          <circle cx={HALF*UNITS+UNIT} cy={HALF*UNITS+UNIT} r={HALF} stroke="gray" strokeWidth="1" fill="red" />
        </DraggableG>
      </DraggableSVG>
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