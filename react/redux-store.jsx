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

// A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let AppComponent = ReactRedux.connect(
  (state)=>({
    props: state.props,
    order: state.order
  }),
  (dispatch)=>({
      setNode: (args)=>dispatch({type: "setNode", ...args}),
      setTop: (top)=>dispatch({type: "setTop", top: top})
  })
)(App);


//a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      props: clone(Props),
      order: Object.keys(Props)
    };
  }
  switch (action.type) {
    case "setNode":
      let {prop, node, x, y} = action;
      let props = clone(state.props);
      props[prop][node] = {x: x, y: y};
      return {...state, props: props};
    case "setTop":
      let order = [...state.order];
      order.push(order.splice(order.indexOf(action.top),1)[0]);
      return {...state, order};
    default:
      return state;
  }
}

let store = Redux.createStore(reducer);
ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <AppComponent />
  </ReactRedux.Provider>,
  destination
);