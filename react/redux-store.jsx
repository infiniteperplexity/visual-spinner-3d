// A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let AppComponent = ReactRedux.connect(
  (state)=>({
    props: state.props,
    moves: state.moves,
    order: state.order,
    frame: state.frame
  }),
  (dispatch)=>({
      updateEngine: ()=>dispatch({type: "renderEngine"}),
      setNode: (args)=>dispatch({type: "setNode", ...args}),
      setTop: (top)=>dispatch({type: "setTop", top: top}),
      gotoFrame: (n)=>dispatch({type: "gotoFrame", n: n}),
      gotoMove: (prop, i)=>dispatch({type: "gotoMove", prop: prop, i: i})
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
      props: clone(player.props),
      order: player.props.map((_,i)=>i),
      frame: 0
    };
  }
  let props, prop, node;
  switch (action.type) {
    case "renderEngine":
      // we need better order here...
      props = Object.values(state.props.props); 
      renderer.render(player.props, props);
      return {...state};
    case "setNode":
      // this is much easier to handle if we have a wrapper on things...
      let {x, y} = action;
      prop = action.prop;
      node = action.node;
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
    case "gotoMove":
      prop = action.prop;
      let i = action.i;
      let move = state.moves[prop][i];
      props = {...state.props};
      // this part is wrong but it's a decent placeholder
      props[prop] = socket(move, prop);
      return {...state, props: props};
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