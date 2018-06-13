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
      gotoTick: (prop, tick)=>dispatch({type: "gotoTick", prop: prop, tick: tick})
  })
)(App);

//a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      props: clone(player.props.map(p=>p.prop)),
      moves: clone(player.props.map(p=>p.moves)),
      active: [0,0],
      order: player.props.map((_,i)=>i),
      frame: 0
    };
  }
  let props, prop, node;
  switch (action.type) {
    case "renderEngine":
      // we need better order here...
      props = Object.values(state.props);

      // let shadows = clone(props);
      // placeholder...
      let shadows = clone(player.props.map(p=>p.prop));
      props = props.concat(shadows);
      let wrappers = clone(player.props);
      wrappers.map(w=>{
        w.nudge = -w.nudge;
        w.alpha = 0.6;
      });
      // placeholder...
      wrappers = wrappers.concat(player.props);
      //wrappers = clone(player.props).concat(wrappers);
      renderer.render(wrappers, props);
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
      order.push(order.splice(order.indexOf(action.top),1)[0]);
      return {...state, order};
    case "gotoFrame":
      return {...state};
    case "gotoTick":
      prop = action.prop;
      let t = action.tick;
      let active = [prop, t];
      props = [...state.props];
      let moves = [...state.moves];
      for (let i=0; i<props.length; i++) {
        let {move, tick} = submove(moves[i], t);
        // this just spins to the beginning, though, right?
        props[i] = spin(move, tick+beats(move)*BEAT);
      }
      return {...state, active: active, props: props};
    default:
      return state;
  }
}

store = Redux.createStore(reducer);

ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <AppComponent />
  </ReactRedux.Provider>,
  destination
);