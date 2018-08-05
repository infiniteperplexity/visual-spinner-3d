
function getActiveMove() {
  let propid = getActivePropId();
  let {moves, tick} = store.getState();
  return submove(moves[propid], tick);
}

const SCROLL = 810;
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
  if (tick2>SCROLL) {
    console.log(tick2-SCROLL);
    setScrolled(tick2 - SCROLL);
  }
}




let _cusps = {};
let _cusps2 = [];
let endwraps;
function playEngineTick(tick, wrappers, positions) {
  if (tick===-1) {
    tick = 0;
  }
  store.dispatch({type: "SET_FRAME", frame: tick});
  if (_cusps[tick] || !endwraps) {
    store.dispatch({type: "SET_TICK", tick: tick});
    let index = _cusps2.indexOf(tick);
    let next = (index>=_cusps2.length-1) ? tick : _cusps2[index+1];
    store.dispatch({type: "SET_TICK2", tick2: next-1});
    setPropNodesByTick(next-1);
    if (next-1>SCROLL) {
      setScrolled(next-1 - SCROLL);
    } 
    endwraps = clone(wrappers);
    endwraps.map(e=>{
      e.nudge = -e.nudge;
      e.alpha = 0.6;
    });
  }
  let {moves, props, tick2} = store.getState();
  let ends = props.map((_,i)=>spin(moves[i],tick2+1));
  positions = positions.concat(ends);
  // positions = ends.concat(positions);
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
  // let positions = props.concat(begins);
  let positions = begins.concat(props);
  let ends = clone(player.props);
  ends.map(e=>{
    e.nudge = -e.nudge;
    e.alpha = 0.6;
  });
  // let wrappers = ends.concat(player.props);
  let wrappers = player.props.concat(ends);
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
    // let positions = props.concat(begins);
    let positions = begins.concat(props);
    let ends = clone(player.props);
    ends.map(e=>{
      e.nudge = -e.nudge;
      e.alpha = 0.6;
    });
    // let wrappers = ends.concat(player.props);
    let wrappers = player.props.concat(ends);
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
    props = state.starters.map(s=>dummy(s, 0))
  } else {
    let subs = getMovesAtTick(tick);
    props = subs.map(({move, tick})=>dummy(move, tick+1));
    // props = state.moves.map(m=>dummy(m, tick+1));
  }
  ;
  store.dispatch({type: "SET_PROPS", props: props});
  updateEngine();
}

function propSelectAllowed(propid) {
  if (store.getState().multiselect) {
    return false;
  }
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

function setModifier(val) {
  store.dispatch({type: "SET_MODIFIER", modifier: val})
}
function decoupledNodePosition({propid, node, dx, dy, dz}) {
  propid = parseInt(propid);
  let props = clone(store.getState().props);
  // the body node gets offset by the dragged amount
  let body = props[propid].body;
  let {x: xb, y: yb, z: zb} = sphere$vectorize(body);
  let nbody = vector$spherify({
    x: xb + dx,
    y: yb + dy,
    z: zb + dz
  });
  props[propid].body = nbody;  
  // the child node gets offset by the reverse amount
  if (node!==HEAD) {
    let n = node+1;
    let {locks} = store.getState();
    if (locks.helper && node===PIVOT) {
      n+=1;
    } else if (locks.grip && node===HAND) {
      n+=1;
    }
    let child = props[propid][NODES[n]]; 
    let {x: xc, y: yc, z: zc} = sphere$vectorize(child);
    let nchild = vector$spherify({
      x: xc - dx,
      y: yc - dy,
      z: zc - dz
    });
    props[propid][NODES[n]] = nchild;
  }
  setActiveNode(node);
  store.dispatch({type: "SET_PROPS", props: props});
}

function pushStoreState() {
  window.history.pushState({storeState: clone(store.getState())}, "emptyTitle");
}

function restoreStoreState(state) {
  console.log("restoring state");
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
  renderer.refresh(player.props);
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
  renderer.refresh(player.props);
  updateEngine();
}


function setPlane(plane) {
  if (plane!=="WALL") {
    alert("warning: all functionality outside the wall plane is poorly tested and buggy.");
  }
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
  if (!val) {
    endwraps = undefined;
  }
  store.dispatch({type: "SET_FROZEN", frozen: val});
}

function setMultiSelect(val) {
  store.dispatch({type: "SET_MULTISELECT", multiselect: val});
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
      filename: saveState.filename,
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
      transitions: player.props.map(p=>([])),
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
    renderer.refresh(player.props);
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

function addMultiSelect({propid, index}) {
  let t = 0;
  let t2 = 0;
  let {multiselect, tick, tick2, moves} = store.getState();
  for (let i=0; i<=index; i++) {
    t = t2;
    t2+=(beats(moves[propid][i])*BEAT);
  }
  if (propid!==getActivePropId()) {
    multiselect = null;
  }
  if (!multiselect) {
    if (tick===-1) {
      tick = 0;
    }
    if (tick2===-1) {
      tick2 = 0;
    }
    multiselect = {
      propid: propid,
      tick: tick,
      tick2: tick2
    };
  }
  if (multiselect.tick>t) {
    multiselect.tick = t;
  }
  if (multiselect.tick2<t2) {
    multiselect.tick2 = t2;
  }
  store.dispatch({type: "SET_TOP", propid: propid});
  store.dispatch({type: "SET_MULTISELECT", multiselect: multiselect});
  setPropNodesByTick(multiselect.tick2);
}

// clear this out, mostly to clean up for doing some other interface action
function clearMultiSelect() {
  store.dispatch({type: "SET_MULTISELECT", multiselect: null});
}

function getMultiSelected() {
  let {multiselect, moves} = store.getState();
  let {propid, tick, tick2} = multiselect;
  let past = 0;
  let indexes = [];
  for (let i=0; i<moves[propid].length; i++) {
    let b = BEAT*beats(moves[propid][i]);
    if (past>=tick && past+b-1<=tick2) {
      indexes.push(i);
    }
    past+=b;
  }
  return {
    propid: propid,
    from: indexes[0],
    to: indexes[indexes.length-1]
  };
}

function setDisplayYouTube(youtube) {
  store.dispatch({type: "SET_YOUTUBE", youtube: youtube});
}

function setDisplayMP4(mp4) {
  store.dispatch({type: "SET_MP4", mp4: mp4});
}

function toggleVideoTools() {
  if (vidFrozen) {
    return;
  }
  let {video} = store.getState();
  store.dispatch({type: "SET_VIDEO", video: !video});
}