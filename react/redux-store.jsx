// A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let AppComponent = ReactRedux.connect(
  (state)=>({
    props: state.props,
    moves: state.moves,
    order: state.order,
    tick: state.tick
  }),
  (dispatch)=>({
      updateEngine: ()=>dispatch({type: "renderEngine"}),
      setNode: (args)=>dispatch({type: "setNode", ...args}),
      setTop: (top)=>dispatch({type: "setTop", top: top}),
      gotoTick: (prop, tick)=>dispatch({type: "gotoTick", prop: prop, tick: tick})
  })
)(App);

//a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      props: clone(player.props.map(p=>p.prop)),
      moves: clone(player.props.map(p=>p.moves)),
      tick: 0,
      order: player.props.map((_,i)=>i)
    };
  }
  let props, prop, node, moves;
  switch (action.type) {
    case "renderEngine":
      //  update the view of the engine
      props = [...state.props];
      moves = [...state.moves];
      let begins = [];
      for (let i=0; i<props.length; i++) {
        begins.push(spin(moves[i], state.tick));
      }
      props = props.concat(begins);
      let wrappers = clone(player.props);
      wrappers.map(w=>{
        w.nudge = -w.nudge;
        w.alpha = 0.6;
      });
      wrappers = wrappers.concat(player.props);
      renderer.render(wrappers, props);
      return {...state};
    case "setNode":
      // move an ending node of a move
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
      // change the order of a prop (thus far only in the SVG)
      let order = [...state.order];
      order.push(order.splice(order.indexOf(action.top),1)[0]);
      return {...state, order};
    case "gotoTick": // kind of misleading...actually moves to the move that begins at that tick for that prop
      // advance SVG to the end of the selected move
      prop = action.prop;
      let t = action.tick;
      props = [...state.props];
      let moves = [...state.moves];
      for (let i=0; i<props.length; i++) {
        let {move, tick} = submove(moves[i], t);
        props[i] = spin(move, tick+beats(move)*BEAT);
      }
      return {...state, tick: t, props: props};
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