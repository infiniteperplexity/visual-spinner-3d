  // A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let AppComponent = ReactRedux.connect(
  (state)=>({
    // props: state.props,
    // moves: state.moves,
    // order: state.order,
    // tick: state.tick,
    // planes: state.planes,
    // locks: state.locks
    ...state
  }),
  (dispatch)=>({
      renderEngine: ()=>dispatch({type: "renderEngine"}),
      updateMove: (propid, gridid)=>dispatch({type: "updateMove", propid: propid, gridid: gridid}),
      setNode: (args)=>dispatch({type: "setNode", ...args}),
      setTop: (top)=>dispatch({type: "setTop", top: top}),
      gotoTick: (tick)=>dispatch({type: "gotoTick", tick: tick}),
      pushState: ()=>dispatch({type: "pushState"}),
      restoreState: (state)=>dispatch({type: "restoreState", state: state}),
      setPlane: (plane)=>dispatch({type: "setPlane", plane: plane})
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
      order: player.props.map((_,i)=>(player.props.length-i-1)),
      plane: "WALL",
      locks: {
        helper: true,
        grip: true,
        head: true
      } // mean slightly different things
    };
  }
  let props, prop, node, moves, swap, plane;
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
    case "updateMove":
      // update the current move for the active prop
      moves = [...state.moves];
      let {move} = submove(moves[action.propid], state.tick);
      let idx = moves.indexOf(move);
      move = {...move};
      plane = state.plane;
      prop = state.props[action.propid];
      for (let i=0; i<NODES.length; i++) {
        move[NODES[i]].r1 = prop[NODES[i]].r;
        move[NODES[i]].a1 = sphere$planify(prop[NODES[i]], VS3D[plane]);
      }
      move.p = VS3D[plane];
      move = resolve(move);
      moves[action.propid][idx] = move;
      return {...state, moves: moves};
    case "setNode":
      // update an ending node of a move
      let {x, y, z} = action;
      prop = action.propid;
      node = action.node;
      props = clone(state.props);
      let s = vector$spherify({x: x, y: y, z: z});
      props[prop][NODES[node]] = s;
      return {...state, props: props};
    case "setTop":
      // change the order of a prop (thus far only in the SVG)
      let order = [...state.order];
      order.push(order.splice(order.indexOf(action.top),1)[0]);
      return {...state, order};
    case "gotoTick":
      // advance SVG state to the end of the selected move
      let t = action.tick;
      props = [...state.props];
      moves = [...state.moves];
      for (let i=0; i<props.length; i++) {
        let {move, tick} = submove(moves[i], t);
        props[i] = spin(move, tick+beats(move)*BEAT);
      }
      return {...state, tick: t, props: props};
    case "pushState":
      // modify the browser history
      frame+=1;
      window.history.pushState({storeState: clone(state)}, "emptyTitle");
      return state;
    case "restoreState":
      // restore the browser history
      frame = action.frame;
      return action.state;
    case "setPlane":
      return {...state, plane: action.plane};
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