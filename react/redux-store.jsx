  // A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let AppComponent = ReactRedux.connect(
  (state)=>({
    ...state
  }),
  (dispatch)=>({
      renderEngine: renderEngine,
      updateEngine: updateEngine,

      gotoTick: gotoTick,

      setTop: setTopPropById,
      setTopPropById: setTopPropById,
      
      // moving the node around 
      setNode: setNodePosition,
      setNodePosition: setNodePosition,
      
      pushState: pushStoreState,
      pushStoreState: pushStoreState,
      restoreState: restoreStoreState,
      restoreStoreState: restoreStoreState,

      
      
      addMovesToEnd: addMovesToEnd,
      modifyMoveUsingNode: modifyMoveUsingNode,
      setTransition: editTransition,
      editTransition: editTransition,
      validateTransition: validateTransition,

      modifySpins: modifySpins,
      modifyAcceleration: modifyAcceleration,
      insertMove: (args)=>{},
      resolveMove: (args)=>{},
      modifyMove: (args)=>{},
      setTransition: (val)=>{},
      acceptTransition: (args)=>{},

      

      setColors: setColors,
      setPlane: setPlane,
      setLock: setLock,
      setFrozen: setFrozen,
      checkLocks: validateLocks,
      validateLocks: validateLocks,

      loadJSON: loadJSON,
      fileInput: fileInput
  })
)(App);

/***** UI functionality *****/

/*** Update rendering on the VS3D engine, based on the store state ***/
function renderEngine() {
  let {props, moves, tick} = store.getState();
  /*** If the initial positions are selected, render only those ***/
  if (tick===-1) {
    renderer.render(player.props, props);
  } else {
    /*** Otherwise, do some swapping and cloning to get wrappers and positions for beginnings and endings ***/
      /* Rendering transitions treats the current beginning as the beginning and the editing buffer as the ending */
    let begins = props.map((_,i)=>spin(moves[i],tick));
    let positions = props.concat(begins);
    let ends = clone(player.props);
    ends.map(e=>{
      e.nudge = -e.nudge;
      e.alpha = 0.6;
    });
    let wrappers = ends.concat(player.props);
    renderer.render(wrappers, positions);
  }
}

function updateEngine() {
  let {moves, props, starters} = store.getState();
  for (let i=0; i<moves.length; i++) {
    player.props[i].prop = dummy(starters[i]);
    player.props[i].moves = clone(moves[i]);
    // this prevents the player from trying to refit the moves itself.
    // the fact that that's not a good idea says there's something wrong with fitting, right?
    player.props[i].fitted = player.props[i].moves;
  }
  renderEngine();
}

// might rename to just apply to the UI
function gotoTick(tick) {
  validateTransition();
  store.dispatch({type: "SET_TICK", tick: tick});
  setPropNodesByTick(tick);
  updateEngine();
  validateLocks();
}

function getMovesAtTick(tick) {
  let state = store.getState();
  return state.moves.map(m=>submove(m, tick));
}
function setPropNodesByTick(tick) {
  let state = store.getState();
  let props;
  if (tick===-1) {
    props = state.starters.map(s=>spin(s, 0))
  } else {
    props = getMovesAtTick(tick).map(m=>dummy(m.move));
  }
  ;
  store.dispatch({type: "SET_PROPS", props: props});
  updateEngine();
}
function setTopPropById(propid) {
  store.dispatch({type: "SET_TOP", propid: propid});
}

/*** Update the position of a single node on a single prop in the UI only, without updating any other state ***/
function setNodePosition({propid, node, x, y, z}) {
  let s = vector$spherify({x: x, y: y, z: z});
  let props = clone(store.getState().props);
  props[parseInt(propid)][NODES[node]] = s;
  store.dispatch({type: "SET_PROPS", props: props});
}

function pushStoreState() {
  window.history.pushState({storeState: clone(store.getState())}, "emptyTitle");
}

function restoreStoreState(state) {
  store.dispatch({type: "SET_STATE", state: state});
}

/*** Select one prop, and then propagate a move onto the end of each prop that has equal or shorter queue ***/
function addMovesToEnd(propid) {
  player.stop();
  pushStoreState();
  validateTransition();
  setTopPropById(propid);
  let {moves, starters} = store.getState();
  moves = [...moves];
  let ticks = (moves[propid].length===0) ? 0 : beats(moves[propid])*BEAT;
  for (let i=0; i<moves.length; i++) {
    if (moves[i].length===0) {
      // just snag nodes from starters
      moves[i] = [merge(starters[i], {beats: 1})];
    } else if (beats(moves[i])*BEAT<=ticks) {
      let previous = moves[i][moves[i].length-1];
      let move = {beats: 1};
      // otherwise, copy radius and angle, but use previous ending speed as starting speed
      NODES.map(node=> {
        move[node] = {};
        move[node].r = previous[node].r;
        move[node].a = previous[node].a1;
        move[node].va = previous[node].va1;
        move[node].va1 = previous[node].va1;
      });
      moves[i].push(resolve(move));
    }
  }
  store.dispatch({type: "SET_MOVES", moves: moves});
  gotoTick(ticks);
}

function modifyMoveUsingNode({node, propid}) {
  propid = parseInt(propid);
  const ROUNDMIN = 0.2;
  pushStoreState();
  let {props, moves, starters, plane, tick, transition, transitions} = store.getState();
  let prop = props[propid]
  let a = sphere$planify(prop[node], VS3D[plane]);
  let r = prop[node].r;
  // if the radius is just slightly offset from zero, snap it to zero
  if (r<=ROUNDMIN) {
    // should it be lower?
    r = 0.01;
    props = clone(props);
    prop[node] = angle$spherify(a, VS3D[plane]);
    prop[node].r = r;
    props[propid] = prop;
    store.dispatch({type: "SET_PROPS", props: props});
  }
  // don't update if nothing changed, or if it's a transition
  let current = (tick===-1) ? starters[propid] : submove(moves[propid], tick).move;
  if (!transition && !(nearly(current[node].r1, r) && nearly(current[node].a1, a))) {
    current = clone(current);
    let old = current[node];
          // should I try to snag spin at this point???
    let updated = {r: old.r, r1: r, a: old.a, a1: a};
    // update one node based on the change
    current[node] = updated;
    current = resolve(current);
    let next = null;
    // if we modified the starting positions
    if (tick===-1) {
      if (moves[propid].length>0) {
        next = clone(moves[propid][0]);
      }
    } else {
      // if there is at least one more move on the list
      let {index} = submove(moves[propid], tick);
      // don't worry about transitions; we will discard them
      if (index<moves[propid].length-1) {
        next = clone(moves[propid][index+1]);
      }
    }
    if (next) {
      // ??? should I try to keep spins here?
      next[node] = {
        r: updated.r1,
        r1: next[node].r1,
        a: updated.a1,
        a1: next[node].a1
      };
      next = resolve(next);
    }
    if (tick===-1) {
      starters = clone(starters);
      starters[propid] = current;
      store.dispatch({type: "SET_STARTERS", starters: starters});
      if (next) {
        moves = clone(moves);
        moves[propid][0] = next;
        store.dispatch({type: "SET_MOVES", moves: moves});
      }
    } else {
      moves = clone(moves);
      let {index} = submove(moves[propid], tick);
      moves[propid][index] = current;
      if (next) {
        moves[propid][index+1] = next;
        if (transitions[propid][index+1]) {
          transitions = clone(transitions);
          delete transitions[propid][index+1];
          store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
        }
      }
      store.dispatch({type: "SET_MOVES", moves: moves});
    }
  }
  if (tick!==-1) {
    let t = submove(moves[propid], tick).tick;
    let past = 0;
    let i = 0; 
    while (past<t) {
      let ticks = beats(moves[i])*BEAT;
      if (past+ticks>t) {
        gotoTick(past);
        return;
      }
      past+=ticks;
      i+=1;
    }
  }
  updateEngine();
  validateLocks();
}

function editTransition() {
  let {props, moves, tick} = store.getState();
  props = clone(props);
  for (let i=0; i<props.length; i++) {
    let {move} = submove(moves[i], tick);
    props[i] = spin(move, 0);
  }
  store.dispatch({type: "SET_TRANSITION", transition: true});
  store.dispatch({type: "SET_PROPS", props: props});
}

function validateTransition() {
  let {transition, transitions, tick, moves, props, order} = store.getState();
  if (transition) {
    let propid = order[order.length-1];
    let {move, index} = submove(moves[propid], tick);
    let previous = moves[propid][index-1];
    let position = dummy(props[propid],0);
    if (matches(previous, position)) {
      if (!transitions[propid][index]) {
        console.log("The transition perfectly matches the end of the preceding move and will be discarded.");
      } else {
        // undo the custom transition
        console.log("The transition perfectly matches the end of the preceding move, so it will be deleted.");
        transitions = clone(transitions);
        delete transitions[propid][index];
        store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
        move = clone(move);
        NODES.map(node=>{
          // don't overwrite the next node unless necessary
          if (!(nearly(position[node].r, move[node].r) && nearly(position[node].a, move[node].a))) {
            //try to keep spins?
            move[node] = {
              r: position[node].r,
              r1: move[node].r1,
              a: position[node].a,
              a1: move[node].a1
            };
          }
        });    
        moves = clone(moves);
        moves[propid][index] = resolve(move);
        store.dispatch({type: "SET_MOVES", moves: moves});
      }
    } else if (fits(previous, position, 0.1)) {
      console.log("The transition is an acceptable fit to the end of the preceding move and will be accepted.");
      transitions = clone(transitions);
      let transition = {};
      move = clone(move);
      NODES.map(node=>{
        transition[node] = {
          r: position[node].r,
          r1: position[node].r,
          a: position[node].a,
          a1: position[node].a    
        }
        // don't overwrite the next node unless necessary
        if (!(nearly(position[node].r, move[node].r) && nearly(position[node].a, move[node].a))) {
          //try to keep spins?
          move[node] = {
            r: position[node].r,
            r1: move[node].r1,
            a: position[node].a,
            a1: move[node].a1
          };
        }
      });
      transitions[propid][index] = resolve(transition);
      store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
      moves = clone(moves);
      moves[propid][index] = resolve(move);
      store.dispatch({type: "SET_MOVES", moves: moves});
    } else {
      alert("The transition does not fit with the end of the preceding move and will be discarded.");
    }
    store.dispatch({type: "SET_TRANSITION", transition: false});
  }
}

function setColors(colors) {
  store.dispatch({type: "SET_COLORS", colors: colors});
  let {props} = store.getState();
  for (let i=0; i<props.length; i++) {
    let prop = new VS3D.PropWrapper();
    prop.color = colors[i];
    for (let key of ["model","fire","alpha","nudge","prop","moves","fitted"]) {
      prop[key] = player.props[i][key];
    }
    player.props[i] = prop;
  }
  updateEngine();
}

function setPlane(plane) {
  if (plane==="WALL") {
    renderer.setCameraPosition(0,0,8);
  } else if (plane==="WHEEL") {
    renderer.setCameraPosition(8,0,0);
  } else if (plane==="FLOOR") {
    renderer.setCameraPosition(0,-8,0);
  }
  store.dispatch({type: "SET_PLANE", plane: plane});
}

function setFrozen(val) {
  store.dispatch({type: "SET_FROZEN", frozen: val});
}

function setLock(node, val) {
  let {locks} = store.getState();
  locks = clone(locks);
  locks[node] = val;
  store.dispatch({type: "SET_LOCKS", locks: locks});
  validateLocks();
}

function getActiveProp() {
  let {props, order} = store.getState();
  return props[order[order.length-1]];
}

function validateLocks() {
  let {locks} = store.getState();
  locks = clone(locks);
  let prop = getActiveProp();
  for (let node in locks) {
    if (node==="head") {
      if (!nearly(prop.head.r,1)) {
        locks.head = false;
      }
    } else {
      if (!zeroish(prop[node].r, 0.05)) {
        locks[node] = false;
      }
    }
  }
  store.dispatch({type: "SET_LOCKS", locks: locks});
}

function loadJSON(json) {
  let saveState = clone(store.getState());
  let savedProps = clone(player.props);
  try {
    let props = parse(json);
    for (let i=0; i<props.length; i++) {
      player.props[i] = new PropWrapper();
      for (let key in props[i]) {
        player.props[i][key] = props[i][key];
      }
    }
    let state = {
      props: clone(player.props.map(p=>p.prop)),
      moves: clone(player.props.map(p=>p.moves)),
      starters: player.props.map(p=>resolve(fit(p.prop, new Move({beats: 0})))),
      colors: player.props.map(p=>p.color || "red"),
      tick: -1,
      order: player.props.map((_,i)=>(player.props.length-i-1)),
      plane: "WALL",
      frozen: false,
      transition: false,
      // !!!! need to do something about transitions here...
      transitions: player.props.map(p=>{}),
      locks: {
        helper: true,
        grip: true,
        head: true,
        body: true
      } 
    };
    // should check state and throw errors if it's bad.
    let nprops = state.props.length;
    if (  state.moves.length!==nprops ||
          state.starters.length!==nprops ||
          state.colors.length!==nprops ||
          state.order.length!==nprops
      ) {
      throw new Error("number of props not consistent.");
    }
    if (  !["WALL","WHEEL","FLOOR"].includes(state.plane) ||
          state.tick<-1 ||
          parseInt(state.tick) !== state.tick
      ) {
      throw new Error("still working on error messages");
    }
    store.dispatch({type: "SET_STATE", state: state});
    pushStoreState();
    gotoTick(-1);
  } catch (e) {
    alert("invalid input!");
    console.log(json);
    console.log(e);
    store.dispatch({type: "SET_STATE", state: savedState});
    for (let i=0; i<savedProps.length; i++) {
      for (let key in savedProps[i]) {
        player.props[i][key] = savedProps[i][key];
      }
    }
  }
}

function fileInput() {
  let input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.style.display = "none";
  input.onchange = ()=>{
    let files = input.files;
    let reader = new FileReader();
    reader.onload = (f)=>{
      if (reader.result) {
        this.handleInput(reader.result);
      }
    }
    if (files[0]) {
      reader.readAsText(files[0]);
    }
  }
  document.body.appendChild(input);
  input.click();
  setTimeout(()=>document.body.removeChild(input),0);
}


function modifySpins({propid, node, n}) {
  const BOUNDS = 2;
  let {tick, moves} = store.getState();
  let {move, index} = submove(moves[propid], tick);
  // make sure we align to the beginning of the move
  let past = 0;
  let i = 0;
  while (past<tick) {
    let ticks = beats(moves[propid][i])*BEAT;
    if (past+ticks>tick) {
      gotoTick(past);
      tick = past;
    }
    past+=ticks;
    i+=1;
  }
  let va = move[node] ? move[node].va : 0;
  let va1 = move[node] ? move[node].va1 : va;
  let a = move[node] ? move[node].a : 0;
  let a1 = move[node] ? move[node].a1 : a;
  let speed = (va+va1)/2;
  let spin = beats(move)/4;
  let spins = Math.sign(speed)*Math.ceil(Math.abs(speed*spin));
  let {vl} = move[node];
  if (vl!==undefined) {
    spins = 0;
  }
  if (Math.abs(spins+n)>BOUNDS) {
    return;
  }
  move = clone(move);
  let updated = {
    r: move[node].r,
    r1: move[node].r1,
    a: move[node].a,
    a1: move[node].a1,
    spin: spins+n
  };
  move[node] = updated;
  moves = clone(moves);
  moves[propid][index] = resolve(move);
  store.dispatch({type: "SET_MOVES", moves: moves});
  pushStoreState();
  updateEngine();
}

/**** Lots of duplicated code from the previous thing ****/
function modifyAcceleration({propid, node, n}) {
  let BOUNDS = 8;
  // make sure we align to the beginning of the move
  let {tick, moves} = store.getState();
  let {move, index} = submove(moves[propid], tick);
  let past = 0;
  let i = 0;
  while (past<tick) {
    let ticks = beats(moves[propid][i])*BEAT;
    if (past+ticks>tick) {
      this.props.gotoTick(past);
      tick = past;
    }
    past+=ticks;
    i+=1;
  }
  let va = move[node] ? move[node].va : 0;
  let va1 = move[node] ? move[node].va1 : va;
  let spin = beats(move)/4;
  let spins = Math.sign(va+va1)*Math.ceil(Math.abs(0.5*(va+va1)*spin));
  if (zeroish(spins) || zeroish(va+va1)) {
    return;
  }
  // if zero starting speed, can't accelerate more
  if (zeroish(va) && n>0) {
    return;
  // if zero ending speed, can't decelerate more
  } else if (zeroish(va1) && n<0) {
    return;
  } else if ((Math.abs(va)>=BOUNDS || nearly(Math.abs(va),BOUNDS)) && n<0) {
    return;
  }
  if ((va+va1)>0) {
    va -= n;
  } else if ((va+va1)<0) {
    va += n;
  }
  move = clone(move);
  let updated = {
    r: move[node].r,
    r1: move[node].r1,
    a: move[node].a,
    a1: move[node].a1,
    va: va,
    spin: spins
  };
  move[node] = updated;
  moves = clone(moves);
  moves[propid][index] = resolve(move);
  store.dispatch({type: "SET_MOVES", moves: moves});
  pushStoreState();
  updateEngine();
}

function reducer(state, action) {
  if (state === undefined) {
    return {
      props: clone(player.props.map(p=>p.prop)),
      moves: clone(player.props.map(p=>p.moves)),
      colors: clone(COLORS),
      starters: player.props.map(p=>resolve(fit(p.prop, new Move({beats: 0})))),
      tick: 0,
      order: player.props.map((_,i)=>(player.props.length-i-1)),
      plane: "WALL",
      popup: false,
      frozen: false,
      transition: false,
      // sparse array
      transitions: player.props.map(p=>({})),
      locks: {
        body: true,
        helper: true,
        grip: true,
        head: true,
      } // mean slightly different things
    };
  }
  // if (!["SET_TICK","SET_TOP","SET_PROPS"].includes(action.type)) {
    console.log(action);
  // }
  switch (action.type) {
    case "SET_STATE":
      return action.state;
    case "SET_TICK":
      return {...state, tick: action.tick};
    case "SET_TOP":
      let order = [...state.order];
      let propid = parseInt(action.propid);
      order.push(order.splice(order.indexOf(propid),1)[0]);
      return {...state, order};
    case "SET_PROPS":
      return {...state, props: action.props};
    case "SET_MOVES":
      return {...state, moves: action.moves};
    case "SET_STARTERS":
      return {...state, starters: action.starters};
    case "SET_TRANSITIONS":
      return {...state, transitions: action.transitions};
    case "SET_COLORS":
      return {...state, colors: action.colors};
    case "SET_PLANE":
      return {...state, plane: action.plane};
    case "SET_TRANSITION":
      return {...state, transition: action.transition};
    case "SET_FROZEN":
      return {...state, transition: action.frozen};
    case "SET_LOCKS":
      return {...state, locks: action.locks};
    default:
      console.log("whatever for now");
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