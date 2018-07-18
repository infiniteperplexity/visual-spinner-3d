
function getActiveMove() {
  let propid = getActivePropId();
  let {moves, tick} = store.getState();
  return submove(moves[propid], tick);
}

// might rename to just apply to the UI
function gotoTick(tick) {
  validateTransition();
  store.dispatch({type: "SET_TICK", tick: tick});
  let tick2 = -1;
  if (tick!==-1) {
    let {move} = getActiveMove();
    tick2 = tick+beats(move)*BEAT-1; 
  }
  store.dispatch({type: "SET_FRAME", frame: tick});
  store.dispatch({type: "SET_TICK2", tick2: tick2});
  setPropNodesByTick(tick2);
  updateEngine();
  validateLocks();
}




let _cusps = {};
let _cusps2 = [];
function playEngineTick(tick, wrappers, positions) {
  if (tick===-1) {
    tick = 0;
  }
  store.dispatch({type: "SET_FRAME", frame: tick});
  if (_cusps[tick]) {
    store.dispatch({type: "SET_TICK", tick: tick});
    let index = _cusps2.indexOf(tick);
    let next = (index>=_cusps2.length-1) ? tick : _cusps2[index+1];
    store.dispatch({type: "SET_TICK2", tick2: next-1});
    setPropNodesByTick(next-1);
  }
  let {moves, tick2, props} = store.getState();
  if (tick2===-1) {
    tick2 = 0;
  }
  let ends = props.map((_,i)=>spin(moves[i],tick2+1));
  positions = positions.concat(ends);
  let endwraps = clone(wrappers);
  endwraps.map(e=>{
    e.nudge = -e.nudge;
    e.alpha = 0.6;
  });
  wrappers = wrappers.concat(endwraps);
  renderer.render(wrappers, positions);
}

function skipToEngineTick(frame) {
  store.dispatch({type: "SET_FRAME", frame: frame});
  let tick, tick2;
  for (let i=1; i<_cusps2.length; i++) {
    if (frame>=_cusps2[i-1] && frame<_cusps2[i]) {
      tick = _cusps2[i-1]
      store.dispatch({type: "SET_TICK", tick: tick});
      tick2 = _cusps2[i];
      store.dispatch({type: "SET_TICK2", tick2: tick2-1});
      setPropNodesByTick(tick2-1);
      break;
    }
  }
  let {props, moves} = store.getState();
  let begins = props.map((_,i)=>spin(moves[i], frame));
  let positions = props.concat(begins);
  let ends = clone(player.props);
  ends.map(e=>{
    e.nudge = -e.nudge;
    e.alpha = 0.6;
  });
  let wrappers = ends.concat(player.props);
  renderer.render(wrappers, positions);
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
  _cusps = {};
  _cusps2 = [];
  for (let sequence of moves) {
    let past = 0;
    _cusps[past] = true;
    if (!_cusps2.includes(past)) {
      _cusps2.push(past);
    }
    for (let move of sequence) {
      past+=beats(move)*BEAT;
      _cusps[past] = true;
      if (!_cusps2.includes(past)) {
        _cusps2.push(past);
      }
    }
  }
  _cusps2.sort((a,b)=>(a-b));
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
    props = state.moves.map(m=>dummy(m, tick+1));
  }
  ;
  store.dispatch({type: "SET_PROPS", props: props});
  updateEngine();
}

// function nextCusp(propid) {

// }
function propSelectAllowed(propid) {
  propid = parseInt(propid);
  let active = getActivePropId();
  if (propid===active) {
    return true;
  } else {
    let {transition, moves, tick2, tick} = store.getState();
    if (transition) {
      let past = 0;
      for (let move of moves[propid]) {
        past += beats(move)*BEAT;
        if (past===tick) {
          return true;
        }
      }
      return false;
    }
    if (tick2===-1) {
      return true;
    }
    let past = 0;
    for (let move of moves[propid]) {
      past += beats(move)*BEAT;
      if (past===tick2+1) {
        return true;
      }
    }
    return false;
  }
}

function activateProp(propid) {
  let {tick2, moves, transition} = store.getState();
  if (propid!==getActivePropId()) {
    if (transition) {
      validateTransition();
      let move = getActiveMove();
      editTransition();
      store.dispatch({type: "SET_TOP", propid: propid});
      return;
    }
    setTopPropById(propid);
    // might need to change tick here.
    let past = 0;
      for (let move of moves[propid]) {
      if (past+beats(move)*BEAT===tick2+1) {
        gotoTick(past);
        break;
      }
      past += beats(move)*BEAT;
    }
  }
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

function offsetNodePosition({propid, node, x, y, z}) {
  propid = parseInt(propid);
  let s = vector$spherify({x: x, y: y, z: z});
  let props = clone(store.getState().props);
  let former = props[propid][NODES[node]];
  props[propid][NODES[node]] = s;
  let {x: x0, y: y0, z: z0} = sphere$vectorize(former);
  let next = props[propid][NODES[node+1]];
  let {x: xn, y: yn, z: zn} = sphere$vectorize(next);
  let s2 = vector$spherify({
    x: xn - x + x0,
    y: yn - y + y0,
    z: zn - z + z0    
  });
  props[propid][NODES[node+1]] = s2;
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
  // okay, so this guy is gonna need to change a bit maybe?
  let {props, moves, tick} = store.getState();
  props = clone(props);
  for (let i=0; i<props.length; i++) {
    props[i] = spin(moves[i], tick);
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

function setModels(models) {
  store.dispatch({type: "SET_MODELS", models: models});
  let {props} = store.getState();
  for (let i=0; i<props.length; i++) {
    let prop = new VS3D.PropWrapper();
    prop.model = models[i];
    for (let key of ["color","fire","alpha","nudge","prop","moves","fitted"]) {
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

function setFileName(fname) {
  store.dispatch({type: "SET_FILENAME", filename: fname});
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
      models: player.props.map(p=>p.model || "poi"),
      tick: -1,
      tick2: -1,
      frame: -1,
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
      setFileName(files[0].name);
    }
  }
  document.body.appendChild(input);
  input.click();
  setTimeout(()=>document.body.removeChild(input),0);
}


function setScrolled(scrolled) {
  store.dispatch({type: "SET_SCROLLED", scrolled: scrolled})
}