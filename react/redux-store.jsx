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
      setPlane: (plane)=>dispatch({type: "setPlane", plane: plane}),
      addMove: (propid)=>dispatch({type: "addMove", propid: propid}),
      modifyMove: (args)=>dispatch({type: "modifyMove", ...args}),
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
  if (action.type==="renderEngine") {
    //  update the view of the engine
    let props = [...state.props];
    let moves = [...state.moves];
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
  } else if (action.type==="addMove") {
    let moves = [...state.moves];
    let propid = parseInt(action.propid);
    let move = moves[propid][moves[propid].length-1];
    let m = {};
    let plane = state.plane;
    for (let i=0; i<NODES.length; i++) {
      // keep a0 and r0 from the move, recalculate a1 and r1
      let node = {};
      node.r = move[NODES[i]].r1;
      node.a = move[NODES[i]].a1;
      node.r1 = move[NODES[i]].r1;
      node.a1 = move[NODES[i]].a1;
      m[NODES[i]] = node;
    }
    m.p = VS3D[plane];
    m.twist = move.twist;
    m.vt = 0;
    m.bent = move.bent;
    m.vb = 0;
    m = resolve(m);
    moves[propid].push(m);
    return {...state, moves: moves};
  } else if (action.type==="updateMove") {
    let moves = [...state.moves];
    let propid = parseInt(action.propid);
    let {move} = submove(moves[propid], state.tick);
    let idx = moves[propid].indexOf(move);
    move = {...move};
    let plane = state.plane;
    let prop = state.props[propid];
    for (let i=0; i<NODES.length; i++) {
      move[NODES[i]].r1 = prop[NODES[i]].r;
      move[NODES[i]].a1 = sphere$planify(prop[NODES[i]], VS3D[plane]);
    }
    move.p = VS3D[plane];
    move = resolve(move);
    // !!!need to propagate things down the chain
    moves[action.propid][idx] = move;
    return {...state, moves: moves};
  } else if (action.type==="modifyMove") {
    // update the current move for the active prop
    let moves = [...state.moves];
    let propid = parseInt(action.propid);
    let move = submove(moves[propid], state.tick).move;
    let idx = moves[propid].indexOf(move);
    let m = clone(move);
    if (action.node===null) {
      if (action.moment==="ticks") {
        action.moment = "beats";
        action.value/=BEAT;
      }
      m[action.moment] = action.value;
    } else {
      m[action.node][action.moment] = action.value;
    }
    // might we still need "spins" here?
    m = resolve(m);
    // !!!need to propagate things down the chain
    moves[propid][idx] = m;
    return {...state, moves: moves};
  } else if (action.type==="setNode") {
    // update an ending node of a move
    let {x, y, z} = action;
    let propid = parseInt(action.propid);
    let node = action.node;
    let props = clone(state.props);
    let s = vector$spherify({x: x, y: y, z: z});
    props[propid][NODES[node]] = s;
    return {...state, props: props};
  } else if (action.type==="setTop") {
    // change the order of a prop (thus far only in the SVG)
    let order = [...state.order];
    let propid = parseInt(action.top);
    order.push(order.splice(order.indexOf(propid),1)[0]);
    return {...state, order};
  } else if (action.type==="gotoTick") {
    console.log("going to tick "+action.tick);
    // advance SVG state to the end of the selected move
    let t = action.tick;
    let props = [...state.props];
    let moves = [...state.moves];
    for (let i=0; i<props.length; i++) {
      let {move, tick} = submove(moves[i], t);
      props[i] = spin(move, tick+beats(move)*BEAT);
    }
    return {...state, tick: t, props: props};
  } else if (action.type==="pushState") {
    // modify the browser history
    window.history.pushState({storeState: clone(state)}, "emptyTitle");
    return state;
  } else if (action.type==="restoreState") {
    // restore the browser history
    return action.state;
  } else if (action.type==="setPlane") {
    return {...state, plane: action.plane};
  } else {
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