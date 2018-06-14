  // A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let AppComponent = ReactRedux.connect(
  (state)=>({
    props: state.props,
    moves: state.moves,
    order: state.order,
    tick: state.tick,
    locks: state.locks
  }),
  (dispatch)=>({
      updateEngine: ()=>dispatch({type: "renderEngine"}),
      setNode: (args)=>dispatch({type: "setNode", ...args}),
      setTop: (top)=>dispatch({type: "setTop", top: top}),
      gotoTick: (tick)=>dispatch({type: "gotoTick", tick: tick}),
      pushState: ()=>dispatch({type: "pushState"}),
      restoreState: (state)=>({type: "restoreState", state: state})
  })
)(App);
let frame = 0;
//a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      props: clone(player.props.map(p=>p.prop)),
      moves: clone(player.props.map(p=>p.moves)),
      tick: 0,
      order: player.props.map((_,i)=>i),
      locks: {
        helper: true,
        grip: true,
        head: true
      } // mean slightly different things
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
      let {x, y, plane} = action;
      prop = action.propid;
      node = action.node;
      let z = 0;
      props = clone(state.props);
      let s;
      if (plane==="WALL") {
        s = vector$spherify({x: x, y: y, z: z});
      } else if (plane==="WHEEL") {
        s = vector$spherify({x: z, y: y, z: x});
      } else if (plane==="FLOOR") {
        s = vector$spherify({x: x, y: z, z: y});
      }
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
    case "gotoTick":
      // advance SVG to the end of the selected move
      let t = action.tick;
      props = [...state.props];
      let moves = [...state.moves];
      for (let i=0; i<props.length; i++) {
        let {move, tick} = submove(moves[i], t);
        props[i] = spin(move, tick+beats(move)*BEAT);
      }
      return {...state, tick: t, props: props};
    case "pushState":
      frame+=1;
      window.history.pushState({storeState: clone(state)}, "emptyTitle");
      return state;
    case "restoreState":
      frame = action.frame;
      return action.state;
    default:
      throw new Error("wrong kind of action");
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



window.onpopstate = function(event) {
    if (event.state) {
      store.dispatch({type: "restoreState", frame: event.state.frame, state: event.state.storeState});
      store.dispatch({type: "renderEngine"});
    }
};

window.history.replaceState({frame: frame, storeState: store.getState()}, "emptyTitle", window.location);