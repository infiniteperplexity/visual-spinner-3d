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
      setNode: (args)=>dispatch({type: "setNode", ...args}),
      setTop: (top)=>dispatch({type: "setTop", top: top}),
      gotoTick: (tick)=>dispatch({type: "gotoTick", tick: tick}),
      pushState: ()=>dispatch({type: "pushState"}),
      restoreState: (state)=>dispatch({type: "restoreState", state: state}),
      setPlane: (plane)=>dispatch({type: "setPlane", plane: plane}),
      insertMove: (args)=>dispatch({type: "insertMove", ...args}),
      resolveMove: (args)=>dispatch({type: "resolveMove", ...args}),
      modifyMove: (args)=>dispatch({type: "modifyMove", ...args}),
      playEngine: (args)=>dispatch({type: "playEngine"})
  })
)(App);


//a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      props: clone(player.props.map(p=>p.prop)),
      moves: clone(player.props.map(p=>p.moves)),
      starters: player.props.map(p=>resolve(fit(p.prop, new Move({beats: 0})))),
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
  // if (!["setNode","setTop"].includes(action.type)) {
  //   console.log("store action:");
  //   console.log(clone(action));
  // }
  if (action.type==="renderEngine") {
    //  update the view of the engine
    let props = [...state.props];
    let moves = [...state.moves];
    let begins = [];
    if (state.tick===-1) {
      renderer.render(player.props,props);
      return state;
    }
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
    return state;
  } else if (action.type==="playEngine") {
    for (let i=0; i<state.moves.length; i++) {
      player.props[i].prop = socket(state.starters[i]);
      player.props[i].moves = clone(state.moves[i]);
    }
    player.play();
    return state;
  } else if (action.type==="insertMove") { 
    let {propid, tick} = action;
    propid = parseInt(propid);
    let moves = [...state.moves];
    if (moves[propid].length===0) {
      moves[propid] = [action.move];
      return {...state, moves: moves};
    }
    let idx;
    if (tick>=beats(moves[propid])*BEAT) {
      // ready to add new move on the end
      idx = moves[propid].length;
    } else {
      // ready to replace a move in the middle
      let {move} = submove(moves[propid], tick);
      idx = moves[propid].indexOf(move);
    }
    moves[action.propid].splice(idx,0,action.move);
    return {...state, moves: moves};
  // re-solve the move after a change
  } else if (action.type==="resolveMove") {
    let {propid, tick} = action;
    propid = parseInt(propid);
    let moves = [...state.moves];
    let idx, prev, move;
    if (tick===-1) {
      idx = 0;
      move = {...state.starters[propid]};
      prev = {...state.starters[propid]};
    } else if (moves[propid].length===0) {
      throw new Error("This should never happen!");
    } else {
      move = submove(moves[propid], tick).move;
      idx = moves[propid].indexOf(move);

      prev = (idx>0) ? moves[propid][idx-1] : state.starters[propid];
    }
    for (let i=0; i<NODES.length; i++) {
      // keep a0 and r0 from the move, recalculate a1 and r1
      let node = {};
      let mnode = move[NODES[i]] || {};
      node.r = prev[NODES[i]].r1;
      node.a = prev[NODES[i]].a1;
      node.a1 = mnode.a1;
      node.r1 = mnode.r1;
      // !!! probably need to do some other properties as well
      move[NODES[i]] = node;
    }
    move = resolve(move);
    // need to propagate either zero or one times
    if ((tick===-1 && moves[propid].length>0) || (tick>=0 && idx<moves[propid].length-1)) {
      let next;
      if (tick===-1) {
        next = moves[propid][0]
      } else {
        next = moves[propid][idx+1];
      }
      for (let i=0; i<NODES.length; i++) {
        // keep a1 and r1 from the move, conform a0 and r0
        let node = {};
        node.r = move[NODES[i]].r1;
        node.a = move[NODES[i]].a1;
        node.a1 = next[NODES[i]].a1;
        node.r1 = next[NODES[i]].r1;
        // !!! probably need to do some other properties as well
        next[NODES[i]] = node;
      }
      next = resolve(next);
      if (tick===-1) {
        moves[propid][0] = next;
      } else {
        moves[propid][idx+1] = next;
      }
    }
    if (tick===-1) {
      let starters = [...state.starters];
      starters[propid] = move;
      return {...state, starters: starters, moves: moves};
    } else {
      moves[propid][idx] = move;
      return {...state, moves: moves};
    }
  } else if (action.type==="deleteMove") { 
    // don't let 'em delete the first one
    let {propid, tick} = action;
    propid = parseInt(propid);
    let moves = [...state.moves];
    let {move} = submove(moves[propid], tick);
    let idx = moves[propid].indexOf(move);
    moves[action.propid].splice(idx,1);
    return {...state, moves: moves};
  } else if (action.type==="modifyMove") {
    let {propid, tick} = action;
    propid = parseInt(propid);
    let moves = [...state.moves];
    let move;
    if (tick===-1) {
      move = state.starters[propid];
    } else {
      move = submove(moves[propid], tick).move;
    }
    let nodes = action.nodes;
    for (let i=0; i<NODES.length; i++) {
      let node0 = move[NODES[i]];
      let node1 = nodes[NODES[i]];
      if (!node1) {
        continue;
      }
      if (node1.a1!==undefined) {
        node0.a1 = node1.a1;
        node0.va = node1.va;
        node0.va1 = node1.va1;
        node0.aa = node1.aa;
      } else if (node1.va!==undefined) {
        node0.va = node1.va;
        node0.va1 = node1.va1;
        node0.aa = node1.aa;
      } else if (node1.va1!==undefined) {
        node0.va1 = node1.va1;
        node0.va = node1.va;
        node0.aa = node1.aa;
      }
      if (node1.r1!==undefined) {
        node0.r1 = node1.r1;
        node0.vr = node1.vr;
        node0.vr1 = node1.vr1;
        node0.ar = node1.ar;
      } else if (node1.vr!==undefined) {
        node0.vr = node1.vr;
        node0.vr1 = node1.vr1;
        node0.ar = node1.ar;
      } else if (node1.vr1!==undefined) {
        node0.vr1 = node1.vr1;
        node0.vr = node1.vr;
        node0.ar = node1.ar;
      }
    }
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
    // advance SVG state to the end of the selected move
    let t = action.tick;
    let props = [...state.props];
    let moves = [...state.moves];
    for (let i=0; i<props.length; i++) {
      if (t===-1) {
        props[i] = spin(state.starters[i], 0);
      } else {
        let {move, tick} = submove(moves[i], t);
        props[i] = spin(move, tick+beats(move)*BEAT);
      }
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
      store.dispatch({type: "restoreState", state: event.state.storeState});
      store.dispatch({type: "renderEngine"});
    }
};

window.history.replaceState({storeState: store.getState()}, "emptyTitle", window.location);