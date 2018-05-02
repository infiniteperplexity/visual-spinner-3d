let destination = document.querySelector("#container");
 
// A basic React component with some properties that I don't manually create
class Grid extends React.Component {
  render() {
    return (
      <div>
        <p>Hello World!</p>
      </div>
    );
  }
};
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