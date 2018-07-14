// might rename to just apply to the UI
function gotoTick(tick) {
  validateTransition();
  store.dispatch({type: "SET_TICK", tick: tick});
  setPropNodesByTick(tick);
  updateEngine();
  validateLocks();
}

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
    let moves = getMovesAtTick(tick);
    let ticks = tick + beats(moves[getActivePropId()].move)*BEAT-1;
    props = state.moves.map(m=>dummy(m, ticks));
    // !!! This is better than it was, but we still need to have some way of preventing con
  }
  ;
  store.dispatch({type: "SET_PROPS", props: props});
  updateEngine();
}

function propSelectAllowed(propid) {
  console.log(propid);
  propid = parseInt(propid);
  let active = getActivePropId();
  if (propid===active) {
    return true;
  } else {
    let {tick} = store.getState();
    if (tick===-1) {
      return true;
    }
    let moves = getMovesAtTick(tick);
    let ticks = tick + beats(moves[active].move)*BEAT;
    console.log(propid);
    console.log(moves);
    let past = elapsed(moves[propid].move, moves[propid].index);
    // if the ending points of the two moves line up, say yes
    if (past+beats(moves[propid].move)*BEAT===ticks) {
      return true;
    } else {
      return false;
    }
  }
}

function activateProp(propid) {
  let {tick, moves, transition} = store.getState();
  if (propid!==getActivePropId()) {
    if (transition) {
      validateTransition();
      editTransition();
    }
  }
  setTopPropById(propid);
}


function setTopPropById(propid) {
  store.dispatch({type: "SET_TOP", propid: propid});
}

function setActiveNode(node) {
  store.dispatch({type: "SET_NODE", node: node});
}

/*** Update the position of a single node on a single prop in the UI only, without updating any other state ***/
function setNodePosition({propid, node, x, y, z}) {
  let s = vector$spherify({x: x, y: y, z: z});
  let props = clone(store.getState().props);
  props[parseInt(propid)][NODES[node]] = s;
  setActiveNode(node);
  store.dispatch({type: "SET_PROPS", props: props});
}

function pushStoreState() {
  window.history.pushState({storeState: clone(store.getState())}, "emptyTitle");
}

function restoreStoreState(state) {
  store.dispatch({type: "SET_STATE", state: state});
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

function getActivePropId() {
  let {order} = store.getState();
  return order[order.length-1];
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
      transitions: player.props.map(p=>({})),
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
    validateSequences();
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


function fileInput(callback) {
  let input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.style.display = "none";
  input.onchange = ()=>{
    let files = input.files;
    let reader = new FileReader();
    reader.onload = (f)=>{
      if (reader.result) {
        callback(reader.result);
      }
    }
    if (files[0]) {
      reader.readAsText(files[0]);
      _filename = files[0].name;
    }
  }
  document.body.appendChild(input);
  input.click();
  setTimeout(()=>document.body.removeChild(input),0);
}
