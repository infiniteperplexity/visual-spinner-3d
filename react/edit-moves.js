/***************************************************************************************/
/*** Propagate a move onto each prop with equal or shorter queue than selected prop ****/
/***************************************************************************************/
function addMovesToEnd(propid) {
  player.stop();
  pushStoreState();
  validateTransition();
  setTopPropById(propid);
  let {moves, starters, plane} = store.getState();
  moves = [...moves];
  let ticks = (moves[propid].length===0) ? 0 : beats(moves[propid])*BEAT;
  for (let i=0; i<moves.length; i++) {
    if (moves[i].length===0) {
      // just snag nodes from starters
      moves[i] = [merge(starters[i], {beats: 1})];
    } else if (beats(moves[i])*BEAT<=ticks) {
      let previous = moves[i][moves[i].length-1];
      let move = {beats: 1};
      // PLANE: let move = {beats: 1, p: plane};
      // PLANE: should this add based on the current plane, or the ending plane?
      // PLANE: should it freak out if it's an "incompatible" plane with the prior move?
      // otherwise, copy radius and angle, but use previous ending speed as starting speed
      NODES.map(node=> {
        move[node] = {};
        move[node].r = previous[node].r1;
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


/***************************************************************************************/
/********** Modify a move by dragging and dropping a node ******************************/
/***************************************************************************************/
function modifyMoveUsingNode({node, propid}) {
  player.stop();
  propid = parseInt(propid);
  pushStoreState();
  let {props, moves, starters, plane, tick, transition, transitions} = store.getState();
  let prop = props[propid]
  let a = sphere$planify(prop[node], VS3D[plane]);
  let r = prop[node].r;
  // don't update if nothing changed, or if it's a transition
  let current = (tick===-1) ? starters[propid] : submove(moves[propid], tick).move;
  // PLANE: Might this be handled totally differently if the planes differ?
  if (!transition && !(nearly(current[node].r1, r) && nearly(current[node].a1, a))) {
    current = clone(current);
    let old = current[node];
    // should I try to snag spin at this point???
    let updated = {
      r: (tick===-1) ? r : old.r,
      r1: r,
      a: (tick===-1) ? a: old.a,
      a1: a
    };
    // update one node based on the change
    current[node] = updated;
    current = resolve(current);
    // should probably wipe out exsiting transitions for this node?
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
      if (index>0 && transitions[propid][index]) {
        transitions = clone(transitions);
        // let previous = moves[propid][index-1][node];
        // transitions[propid][index][node] = {
        //   r: previous.r1,
        //   r1: previous.r1,
        //   a: previous.a1,
        //   a1: previous.a1
        // };
        transitions[propid][index] = null;
        store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
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
          /// !!! maybe just for the current node?
          transitions[propid][index] = null;
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

function setDuration({propid, ticks}) {
  player.stop();
  pushStoreState();
  let {moves, tick} = store.getState();
  let {move, index} = getMovesAtTick(tick)[propid];
  if (beats(move)*BEAT===ticks) {
    return;
  } else {
    let beats = ticks / BEAT;
    let updated = {beats: beats};
    // PLANE: Need to propagate plane
    for (let node of NODES) {
      updated[node] = {
        r: move[node].r,
        r1: move[node].r1,
        a: move[node].a,
        a1: move[node].a1
      };
    }
    updated = resolve(updated);
    moves = clone(moves);
    moves[propid][index] = updated;
    store.dispatch({type: "SET_MOVES", moves: moves});
  }
}
/***************************************************************************************/
/********** Modify rotations using panel buttons ***************************************/
/***************************************************************************************/
function modifySpins({propid, node, n}) {
  player.stop();
  pushStoreState();
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
  // PLANE: Need to propagate plane
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

/***************************************************************************************/
/********** Modify acceleration using panel buttons ************************************/
/***************************************************************************************/
function modifyAcceleration({propid, node, n}) {
  player.stop();
  pushStoreState();
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
  // right now this creates errors for linear movements


  let va = move[node] ? move[node].va : 0;
  let va1 = move[node] ? move[node].va1 : va;
  let spin = beats(move)/4;
  let spins = Math.sign(va+va1)*Math.ceil(Math.abs(0.5*(va+va1)*spin));
  if (zeroish(va+va1)) {
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
  let {vl, vl1, la} = move[node];
  if (vl!==undefined || vl1!==undefined) {
    if ((zeroish(vl1, 0.02) || vl1<0) && n>0) {
      return;
    } else if ((zeroish(vl, 0.02) || vl<0) && n<0) {
      return;
    }
    move = clone(move);
    let updated = {
      r: move[node].r,
      r1: move[node].r1,
      a: move[node].a,
      a1: move[node].a1,
      la: la
    };
    if (n<0) {
      updated.vl = Math.max(vl+n, 0);
    } else {
      updated.vl1 = Math.max(vl1-n, 0)
    }
    move[node] = updated;
    console.log(resolve(move)[node]);
  } else {
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
  }
  moves = clone(moves);
  moves[propid][index] = resolve(move);
  store.dispatch({type: "SET_MOVES", moves: moves});
  pushStoreState();
  updateEngine();
}

/***************************************************************************************/
/*** Set up or delete a custom transition **********************************************/
/***************************************************************************************/
function validateTransition() {



  store.dispatch({type: "SET_TRANSITION", transition: false});
  return;

  let {transition, transitions, tick, moves, props, order} = store.getState();
  if (transition) {
    let propid = order[order.length-1];
    // this gets messed up only if you get into an invalid transition state
    let {move, index} = submove(moves[propid], tick);
    let previous = moves[propid][index-1];
    // this is a bit weird...dummying a prop?  is that a thing?
    let position = dummy(props[propid], 0);
    if (matches(previous, position, 0.1)) {
      if (!transitions[propid][index]) {
        // console.log("The transition perfectly matches the end of the preceding move and will be discarded.");
      } else {
        pushStoreState();
        // undo the custom transition
        // console.log("The transition perfectly matches the end of the preceding move, so it will be deleted.");
        transitions = clone(transitions);
        transitions[propid][index] = null;
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
      pushStoreState();
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

function setAbruptTransition({propid, node}) {
  // so this works for *adding* an abrupt transition
  let {transitions, tick, moves} = store.getState();
  let {move, index} = getMovesAtTick(tick)[propid];
  let transition = transitions[propid][index];
  if (!transition) {
    transition = {};
    move = clone(move);
    NODES.map(n=>{
      transition[n] = {
        r: move[n].r,
        r1: move[n].r,
        a: move[n].a,
        a1: move[n].a    
      }
    });
  }
  transition[node] = {
    r: move[node].r1,
    r1: move[node].r1,
    a: move[node].a1,
    a1: move[node].a1
  };
  transitions = clone(transitions);
  transitions[propid][index] = transition;
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
  moves = clone(moves);
  move[node] = clone(transition[node]);
  moves[propid][index] = resolve(move);
  store.dispatch({type: "SET_MOVES", moves: moves});
}

function deleteTransition() {
  player.stop();
  pushStoreState();
  let propid = getActivePropId();
  let {transitions, moves, tick} = store.getState();
  transitions = clone(transitions);
  let {move, index} = getActiveMove();
  transitions[propid][index] = null;
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
  move = clone(move);
  let position = moves[propid][index-1];
  NODES.map(node=>{
    // don't overwrite the next node unless necessary
    if (!(nearly(position[node].r1, move[node].r) && nearly(position[node].a1, move[node].a))) {
      //try to keep spins?
      move[node] = {
        r: position[node].r1,
        r1: move[node].r1,
        a: position[node].a1,
        a1: move[node].a1
      };
    }
  }); 
  moves = clone(moves);
  moves[propid][index] = resolve(move);
  store.dispatch({type: "SET_MOVES", moves: moves});
  store.dispatch({type: "SET_TRANSITION", transition: false});
}

function validateSequences() {
  let {props, moves, transitions} = store.getState();
  moves = clone(moves);
  transitions = props.map(p=>([]));
  for (let i=0; i<props.length; i++) {
    for (let j=1; j<moves[i].length; j++) {
      let previous = moves[i][j-1];
      let move = moves[i][j];
      // we could also force the moves to resolve() at this point...
      if (!matches(previous, move, 0.1)) {
        if (fits(previous, move, 0.1)) {
          let transition = {};
          NODES.map(node=>{
            transition[node] = {
              r: move[node].r,
              r1: move[node].r,
              a: move[node].a,
              a1: move[node].a,
            };
          });
          transitions[i][j] = transition;
        } else {
          throw new Error("move positions do not match");
        }
      }
    }
  }
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
}

function deleteMove() {
  player.stop();
  let {moves, transitions, starters} = store.getState();
  let propid = getActivePropId();
  if (moves[propid].length<=1) {
    return;
  }
  let last = moves[propid].length;
  pushStoreState();
  let {index} = getActiveMove();
  transitions = clone(transitions);
  transitions[propid].splice(index,1);
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});  
  moves = clone(moves);
  moves[propid] = moves[propid].filter((_,i)=>(i!==index));
  if (index<moves[propid].length) {
    let first;
    if (index===0) {
      first = starters[propid];
    } else {
      first = moves[propid][index-1];
    }
    let second = moves[propid][index];
    for (let node of NODES) {
      // keep spins?
      second[node] = {
        a: first[node].a1,
        a1: second[node].a1,
        r: first[node].r1,
        r1: second[node].r1
      }
    }
    second = resolve(second);
    moves[propid][index] = second;
  }
  store.dispatch({type: "SET_MOVES", moves: moves});
  if (index<last-1) {
    // if it's not the last move on this prop, stay in roughly the same spot
    let i=0;
    let past=0;
    while (i<index) {
      past+=beats(moves[propid][i])*BEAT;
      i+=1;
    }
    gotoTick(past);
  } else {
    // otherwise, go to the end of the longest move
    let b = beats(moves[propid])*BEAT;
    let longest = propid;
    for (let i=moves.length-1; i>=0; i--) {
      if (beats(moves[i])*BEAT>b) {
        longest = i;
      }
    }
    if (longest!==propid) {
      store.dispatch({type: "SET_TOP", propid: longest});
    }
    let len = moves[longest].length;
    gotoTick(beats(moves[longest])*BEAT - beats(moves[longest][len-1])*BEAT);
  }
}

function insertNewMove() {
  let propid = getActivePropId();
  let {moves, starters, tick2, transitions} = store.getState();
  moves = clone(moves);
  transitions = clone(transitions);
  if (tick2===-1) {
    let starter = starters[propid];
    let created = {
      beats: 1
    };
    NODES.map(node=>{
      created[node] = {
        a: starter[node].a1,
        a1: starter[node].a1,
        r: starter[node].r1,
        r1: starter[node].r1
      }
    });
    moves[propid].unshift(created);
    transitions[propid].unshift(null);
  } else {
    let {move, index} = getActiveMove();
    let created = {
      beats: 1
    };
    NODES.map(node=>{
      created[node] = {
        a: move[node].a1,
        a1: move[node].a1,
        r: move[node].r1,
        r1: move[node].r1
      }
    });
    moves.splice(index, 0, created);
    transitions.splice(index, 0, null);
  }
  store.dispatch({type: "SET_MOVES", moves: moves});
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});

}

function copyDraggedMove(move, propid, i) {
  let {moves, starters, transitions} = store.getState();
  moves = clone(moves);
  transitions = clone(transitions);
  let previous = (i===-1) ? starters[propid] : moves[propid][i];
  if (i<moves[propid].length-1) {
    NODES.map(node=>{
    // shouldn't mess with nodes if we don't have to
      move[node] = {
        a: previous[node].a1,
        a1: move[node].a1,
        r: previous[node].r1,
        r1: move[node].r1
      };
    });
    let next = clone(moves[propid][i+1]);
    NODES.map(node=>{
      // shouldn't mess with nodes if we don't have to
      next[node] = {
        a: move[node].a1,
        a1: next[node].a1,
        r: move[node].r1,
        r1: next[node].r1
      }
    });
    moves[propid][i+1] = resolve(next);
  } else {
    NODES.map(node=>{
      move[node].a = previous[node].a1;
      move[node].r = previous[node].r1;
      if (move[node].a1) {
        delete move[node].a1;
      }
      if (move[node].r1) {
        delete move[node].r1;
      }
    });
  }
  moves[propid].splice(i+1, 0, resolve(move));
  store.dispatch({type: "SET_MOVES", moves: moves});
  transitions[propid].splice(i+1, 0, null);
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
}

function modifyTransitionUsingNode({node, propid}) {
  player.stop();
  propid = parseInt(propid);
  pushStoreState();
  let {props, moves, transitions, plane} = store.getState();
  let prop = props[propid];
  let r = prop[node].r;
  let a = sphere$planify(prop[node], VS3D[plane]);
  let {move, index} = getActiveMove();
  let previous = moves[propid][index-1];
  let transition;
  // PLANE: need to handle somehow
  if (transitions[propid][index]) {
    console.log("flag 1a");
    transition = clone(transitions[propid][index]);
  } else {
    console.log("flag 1b");
    transition = {
      beats: 0,
      plane: plane
    }
    NODES.map(n=>{
      transition[node] = {
        r: move[n].r,
        r1: move[n].r,
        a: move[n].a,
        a1: move[n].a
      };
    });
  }
  transition[node] = {
    r: r,
    r1: r,
    a: a,
    a1: a
  }
  move = clone(move);
  if (matches(previous, transition)) {
    console.log("flag 2a");
    // does this get weird due to intermediate states?  probably not, because it won't match
    NODES.map(n=>{
      // avoid wiping out spin, etc?
      move[n] = {
        r: previous[n].r1,
        r1: previous[n].r1,
        a: previous[n].a,
        a1: previous[n].a1
      };
    });
    move = resolve(move);
    moves = clone(moves);
    moves[propid][index] = move;
    store.dispatch({type: "SET_MOVES", moves: moves});
    transitions = clone(transitions);
    transitions[propid][index] = null;
    store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
  } else if (fits(previous, transition)) {
    console.log("flag 2b");
    NODES.map(n=>{
      // avoid wiping out spin, etc?
      move[n] = {
        r: previous[n].r1,
        r1: previous[n].r1,
        a: previous[n].a,
        a1: previous[n].a1
      };
    });
    move = resolve(move);
    moves = clone(moves);
    moves[propid][index] = move;
    store.dispatch({type: "SET_MOVES", moves: moves});
    transitions = clone(transitions);
    transitions[propid][index] = transitions;
    store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
  }
  else {
    console.log("flag 2c");
    // hopefully this is an intermediate state...if not, something has gone wrong
  }
  updateEngine();
  validateLocks();
}