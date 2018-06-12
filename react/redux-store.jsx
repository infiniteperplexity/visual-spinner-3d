// A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let AppComponent = ReactRedux.connect(
  (state)=>({
    props: state.props,
    order: state.order,
    frame: state.frame
  }),
  (dispatch)=>({
      updateEngine: ()=>dispatch({type: "renderEngine"}),
      setNode: (args)=>dispatch({type: "setNode", ...args}),
      setTop: (top)=>dispatch({type: "setTop", top: top}),
      gotoFrame: (n)=>dispatch({type: "gotoFrame", n: n})
  })
)(App);

/*
Alright.  There are now several issues here.

- We still actually probably to separate VS3D state from React state, because we don't want to constantly update VS3D while we're dragging.
  - We can still represent React state using VS3D data structures; we'll just copy to the engine.
- We no longer store props in an array.

*/

//a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      props: reactProps,
      order: ["orange","white"],
      frame: 0
    };
  }
  let props;
  switch (action.type) {
    case "renderEngine":
      // we need better order here...
      props = Object.values(state.props); 
      renderer.render(player.props, props);
      return {...state};
    case "setNode":
      // this is much easier to handle if we have a wrapper on things...
      let {prop, node, x, y} = action;
      let z = 0;
      props = clone(state.props);
      let s = vector$spherify({x: x, y: y, z: z});
      let args = {};
      args[NODES[node]] = s;
      let p = snapto(args, props[prop]);
      props[prop] = p;
      return {...state, props: props};
    case "setTop":
      let order = [...state.order];
      // order.push(order.splice(order.indexOf(action.top),1)[0]);
      return {...state, order};
    case "gotoFrame":
      return {...state};
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