/***************************************************************************************/
/*** Propagate a move onto each prop with equal or shorter queue than selected prop ****/
/***************************************************************************************/
function addMovesToEnd(propid) {
  player.stop();
  validateTransition();
  setTopPropById(propid);
  let {moves, starters, plane} = store.getState();
  moves = clone(moves);
  // moves = [...moves];
  let ticks = (moves[propid].length===0) ? 0 : beats(moves[propid])*BEAT;
  for (let i=0; i<moves.length; i++) {
    if (moves[i].length===0) {
      // just snag nodes from starters
      moves[i] = [merge(starters[i], {beats: 1})];
    } else if (beats(moves[i])*BEAT<=ticks) {
      let previous = moves[i][moves[i].length-1];
      let twist = angle(BEAT*beats(previous)*previous.vt+previous.twist);
      let move = {beats: 1, plane: previous.plane || VS3D.WALL, vb: previous.vb, twist: twist, vt: previous.vt};
      NODES.map(node=> {
        move[node] = {};
        move[node].r = previous[node].r1;
        move[node].a = handleBend(previous[node].a1, previous.vb, node);
        move[node].va = previous[node].va1;
        move[node].va1 = previous[node].va1;
      });
      moves[i].push(resolve(move));
    }
  }
  store.dispatch({type: "SET_MOVES", moves: moves});
  gotoTick(ticks);
}

function handleBend(a1, move, node) {
  if (node!=="head") {
    return a1;
  }
  let vb = move.vb || 0;
  let halfbends = Math.abs(vb*beats(move)/2);
  if (halfbends%2===0) {
    return a1;
  }
  if (halfbends%2===1) {
    return angle(a1+180);
  }
  alert("the editor encountered a bend value ("+vb+") that it cannot handle");
  throw new Error("unexpected bend value");
}
// !!!if I were feeling ambitious I could try to preserve spins here...
function handlePlaneChange(previous, current, p) {
  let prop = dummy(previous);
  if (VS3D.inplane(prop, p, BODY)) {
    // there's a purely viable plane break
    console.log("viable plane break");
    NODES.map((node,i)=>{
      if (node!=="head" || !angle$nearly(sphere$planify(prop.head, p), current.head.a) || !nearly(prop.head.r, current.head.r)) {
        current[node] = {
          a: sphere$planify(prop[node], p),
          a1: current[node].a1,
          r: prop[node].r,
          r1: current[node].r1
        };
      }
    });
    // does this actually work?
  } else if (VS3D.inplane(prop, p, GRIP)) {
    // there's a viable plane break but we need to abstract differently
    // the head node *has* to match exactly.
    console.log("abstractable plane break");
    if (!angle$nearly(sphere$planify(prop.head, p), current.head.a) || !nearly(prop.head.r, current.head.r)) {
      current.head = {
        a: sphere$planify(prop.head, p),
        a1: current.head.a1,
        r: prop.head.r,
        r1: current.head.r1
      };
    }
    // the grip node's total location must be the same...we'll wipe the grip itself to zero...
    let hand = cumulate([prop.body, prop.pivot, prop.helper, prop.hand, prop.grip]);
    current.hand = {
      a: sphere$planify(hand, p),
      a1: current.hand.a1,
      r: hand.r,
      r1: current.hand.r1
    };
    let rest = ["body","pivot","helper","grip"];
    for (let node of rest) {
      current[node] = {
        a: 0,
        a1: current[node].a1,
        r: 0,
        r1: current[node].r1
      };
    }
  } else {
      // no viable plane break
    console.log("no viable plane break");
    // NODES.map((node,i)=>{
    //   current[node] = {
    //     a: current[node].a1,
    //     a1: current[node].a1,
    //     r: current[node].r1,
    //     r1: current[node].r1
    //   };
    // });
  }
  // current.bent = 0;
  // current.vb = 0;
  current = resolve(current);
  return current;
}

/***************************************************************************************/
/********** Modify a move by dragging and dropping a node ******************************/
/***************************************************************************************/
function modifyMoveUsingNode({node, propid}) {
  player.stop();
  propid = parseInt(propid);
  let {props, moves, starters, plane, tick, transition, transitions} = store.getState();
  let prop = props[propid]
  let a = sphere$planify(prop[node], VS3D[plane]);
  let r = prop[node].r;
  // don't update if nothing changed, or if it's a transition
  let current = (tick===-1) ? starters[propid] : submove(moves[propid], tick).move;
  // PLANE: Might this be handled totally differently if the planes differ?
  let p = VS3D[plane];
  // !!!!! Wait a second...can there we be in transition *node* at this point?
  let changed = false;
  if (!vector$nearly(p, current.plane)) {
    changed = true;
    current = clone(current);
    current.plane = p;
    if (tick!==-1) {
      let previous;
      let {index} = submove(moves[propid], tick);
      if (index===0) {
        previous = starters[propid];
      } else {
        previous = moves[propid][index-1];
      }
      // wipe out any existing custom transition
      if (transitions[propid][index]) {
        transitions = clone(transitions);
        transitions[propid][index] = null;
        store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
      }
      current = handlePlaneChange(previous, current, p);
    } else {
      console.log("starting position, no plane break needed");
    }
  }
  // !!! so...I'm not sure if the !changed logic is good...should just clicking it be enough to change the plane?
  if (!transition && !(nearly(current[node].r1, r) && angle$nearly(handleBend(current[node].a1, current, node), a) && !changed)) {
    current = clone(current);
    if (node==="head") {
      current.bent = 0;
      current.vb = 0;
    }
    let old = current[node];
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
        transitions[propid][index] = null;
        store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
      }
    }
    if (next) {
      // I think it's okay to break spins and acceleration here
      if (!vector$nearly(current.plane, next.plane)) {
        next = handlePlaneChange(current, next, next.plane);
      } else {
        if (node==="head") {
          next.bent = 0;
          next.vb = 0;
        }
        next[node] = {
          r: updated.r1,
          r1: next[node].r1,
          a: handleBend(updated.a1, current, node),
          a1: next[node].a1
        };
      }
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
  store.dispatch({type: "SET_RAW", raw: null});
  let {moves, tick} = store.getState();
  let {move, index} = getMovesAtTick(tick)[propid];
  if (beats(move)*BEAT===ticks) {
    return;
  } else {
    let bts = ticks / BEAT;
    let plane = move.plane || VS3D.WALL;
    let updated = {beats: bts, plane: plane};

    for (let node of NODES) {
      updated[node] = {
        r: move[node].r,
        r1: move[node].r1,
        a: move[node].a,
        a1: move[node].a1
      };
    }
    updated.bent = 0;
    updated.vb = 0;
    updated = resolve(updated);
    moves = clone(moves);
    moves[propid][index] = updated;
    store.dispatch({type: "SET_MOVES", moves: moves});
    gotoTick(getActiveMove().tick);
  }
}
/***************************************************************************************/
/********** Modify rotations using panel buttons ***************************************/
/***************************************************************************************/
function modifySpins({propid, node, n}) {
  player.stop();
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

  if (move.vb && node==="head") {
    modifyBend({
      propid: propid,
      bend: n,
      pitch: 0
    });
    return;
  }
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
  updateEngine();
}

/***************************************************************************************/
/********** Modify acceleration using panel buttons ************************************/
/***************************************************************************************/
function modifyAcceleration({propid, node, n}) {
  player.stop();
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
  updateEngine();
}

/***************************************************************************************/
/*** Set up or delete a custom transition **********************************************/
/***************************************************************************************/

// getting factored out
function validateTransition() {
  store.dispatch({type: "SET_TRANSITION", transition: false});
  return;
}

function deleteTransition() {
  player.stop();
  let propid = getActivePropId();
  let {transitions, moves, tick, plane} = store.getState();
  let {move, index} = getActiveMove();
  if (!transitions[propid][index]) {
    return;
  }
  transitions = clone(transitions);
  transitions[propid][index] = null;
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
  move = clone(move);
  let position = moves[propid][index-1];
  // PLANE: need to handle plane
  if (!vector$nearly(position.plane, move.plane)) {
    move = handlePlaneChange(position, move, move.plane);
  } else {
    NODES.map(node=>{
      // don't overwrite the next node unless necessary
      if (!(nearly(position[node].r1, move[node].r) && nearly(position[node].a1, move[node].a))) {
        //try to keep spins?
        if (!nearly(move[node].a, position[node].a1) || !nearly(move[node].r, position[node].r1)) {
          move[node] = {
            r: position[node].r1,
            r1: move[node].r1,
            a: handleBend(position[node].a1, position, node),
            a1: move[node].a1
          };
        }
      }
    });
  }
  moves = clone(moves);
  moves[propid][index] = resolve(move);
  store.dispatch({type: "SET_MOVES", moves: moves});
  editTransition();
}

// !!!! This will get really complicated in the plane-change case
function validateSequences() {
  let {props, moves, transitions} = store.getState();
  moves = clone(moves);
  transitions = props.map(p=>([]));
  for (let i=0; i<props.length; i++) {
    for (let j=1; j<moves[i].length; j++) {
      let previous = moves[i][j-1];
      let move = moves[i][j];
      // we could also force the moves to resolve() at this point...
      if (!vector$nearly(previous.plane || VS3D.WALL, move.plane || VS3D.WALL)) {
        // kind of a weird way of doing this...use handlePlaneChange, but use the beginning of the move
        let deflt = handlePlaneChange(previous, move, move.plane || VS3D.WALL);
        NODES.map(node=>{
          let n = deflt[node];
          deflt[node] = {
            a: n.a,
            a1: n.a,
            r: n.r,
            r1: n.r
          };
        });
        deflt = resolve(deflt);
        if (!matches(deflt, move, 0.1)) {
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
        }
      } else if (!matches(previous, move, 0.1)) {
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
    if (!vector$nearly(first.plane, second.plane)) {
      second = handlePlaneChange(first, second, second.plane);
    } else {
      for (let node of NODES) {
        // keep spins?
        if (!nearly(second[node].a, first[node].a1) || !nearly(second[node].r, first[node].r1)) {
          second[node] = {
            a: handleBend(first[node].a1, first, node),
            a1: second[node].a1,
            r: first[node].r1,
            r1: second[node].r1
          }
        }
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

function deleteMultiple() {
  player.stop();
  let {moves, transitions} = store.getState();
  let {propid, from, to} = getMultiSelected();
  clearMultiSelect();
  moves = clone(moves);
  let last = moves[propid].length;
  moves = clone(moves);
  moves[propid] = moves[propid].filter((_,i)=>(i<from || i>to));
  transitions = clone(transitions);
  transitions[propid] = transitions[propid].filter((_,i)=>(i<from || i>to));
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});  
  let index = from;
  if (index<moves[propid].length) {
    let first;
    if (from===0) {
      first = starters[propid];
    } else {
      first = moves[propid][index-1];
    }
    let second = moves[propid][index];
    if (!vector$nearly(first.plane, second.plane)) {
      second = handlePlaneChange(first, second, second.plane);
    } else {
      for (let node of NODES) {
        // keep spins?
        if (!nearly(second[node].a, first[node].a1) || !nearly(second[node].r, first[node].r1)) {
          second[node] = {
            a: handleBend(first[node].a1, first, node),
            a1: second[node].a1,
            r: first[node].r1,
            r1: second[node].r1
          }
        }
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

function copyDraggedMove(move, propid, i) {
  let {moves, starters, transitions} = store.getState();
  moves = clone(moves);
  transitions = clone(transitions);
  let previous = (i===-1) ? starters[propid] : moves[propid][i];
  if (i<moves[propid].length-1) {
    if (!vector$nearly(previous.plane, move.plane)) {
      move = handlePlaneChange(previous, move, move.plane);
    } else {
      NODES.map(node=>{
      // shouldn't mess with nodes if we don't have to
        if (!nearly(move[node].a, previous[node].a1) || !nearly(move[node].r, previous[node].r1)) {
          move[node] = {
            a: handleBend(previous[node].a1, previous, node),
            a1: move[node].a1,
            r: previous[node].r1,
            r1: move[node].r1
          };
        }
      });
    }
    let next = clone(moves[propid][i+1]);
    if (!vector$nearly(move.plane, next.plane)) {
      next = handlePlaneChange(move, next, next.plane);
    } else {
      NODES.map(node=>{
        // shouldn't mess with nodes if we don't have to
        if (!nearly(next[node].a, move[node].a1) || !nearly(next[node].r, move[node].r1)) {
          next[node] = {
            a: handleBend(move[node].a1, previous, node),
            a1: next[node].a1,
            r: move[node].r1,
            r1: next[node].r1
          }
        }
      });
    }
    moves[propid][i+1] = resolve(next);
  } else {
    if (!vector$nearly(previous.plane, move.plane)) {
      move = handlePlaneChange(previous, move, move.plane);
    } else {
      NODES.map(node=>{
        // shouldn't mess with nodes if we don't have to
        if (!nearly(move[node].a, previous[node].a1) || !nearly(move[node].r, previous[node].r1)) {
          move[node].a = handleBend(previous[node].a1, previous, node);
          move[node].r = previous[node].r1;
          if (move[node].a1) {
            delete move[node].a1;
          }
          if (move[node].r1) {
            delete move[node].r1;
          }
        }
      });
    }
  }
  moves[propid].splice(i+1, 0, resolve(move));
  store.dispatch({type: "SET_MOVES", moves: moves});
  transitions[propid].splice(i+1, 0, null);
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
}


function copyDraggedMultiple(propid, i) {
  let {moves, starters, transitions} = store.getState();
  let {from, to, propid: propid1} = getMultiSelected();
  moves = clone(moves);
  let move1 = clone(moves[propid1][from]);
  let move2 = moves[propid1][to];
  transitions = clone(transitions);
  let previous = (i===-1) ? starters[propid] : moves[propid][i];
  if (!vector$nearly(previous.plane, move1.plane)) {
    move1 = handlePlaneChange(previous, move1, move1.plane);
  } else {
    NODES.map(node=>{
      // shouldn't mess with nodes if we don't have to
      if (!nearly(move1[node].a, previous[node].a1) || !nearly(move1[node].r, previous[node].r1)) {
        move1[node] = {
          a: handleBend(previous[node].a1, previous, node),
          a1: move1[node].a1,
          r: previous[node].r1,
          r1: move1[node].r1
        };
      }
    });
  }
  move1 = resolve(move1);
  if (i<moves[propid].length-1) {
    let next = clone(moves[propid][i+1]);
    if (!vector$nearly(move2.plane, next.plane)) {
      next = handlePlaneChange(move2, next, next.plane);
    } else {
      if (!nearly(next[node].a, move2[node].a1) || !nearly(next[node].r, move2[node].r1)) {
        NODES.map(node=>{
          // shouldn't mess with nodes if we don't have to
          next[node] = {
            a: handleBend(move2[node].a1, move2, node),
            a1: next[node].a1,
            r: move2[node].r1,
            r1: next[node].r1
          }
        });
      }
    }
    moves[propid][i+1] = resolve(next);
  }
  let inserts = clone(moves[propid1].slice(from, to+1));
  let trans = clone(transitions[propid1].slice(from+1, to+1));
  trans.unshift(null);
  inserts[0] = move1;
  moves[propid].splice(i+1, 0, ...inserts);
  store.dispatch({type: "SET_MOVES", moves: moves});
  transitions[propid].splice(i+1, 0, ...trans);
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
}

function modifyTransitionUsingNode({node, propid}) {
  // !!!! What happens here if the transition is in a differnet plane than the node?
  player.stop();
  propid = parseInt(propid);
  let {props, moves, transitions, plane} = store.getState();
  let prop = props[propid];
  let r = prop[node].r;
  let a = sphere$planify(prop[node], VS3D[plane]);
  let {move, index} = getActiveMove();
  // switch planes so that you match the move?  Maybe this should be handled earlier?
  if (!vector$nearly(VS3D[plane], move.plane)) {
    if (vector$nearly(move.plane, VS3D.WALL)) {
      setPlane("WALL");
    } else if (vector$nearly(move.plane, VS3D.WHEEL)) {
      setPlane("WHEEL");
    } else {
      setPlane("FLOOR");
    }
  }
  let previous = moves[propid][index-1];
  let transition;
  if (transitions[propid][index]) { //if the transition already exists, start with that
    transition = clone(transitions[propid][index]);
  } else if (!vector$nearly(previous.plane, move.plane)) {
    let prop = dummy(previous);
    transition = {beats: 0, plane: move.plane};
    NODES.map(node=>{
      transition[node] = {
        a: sphere$planify(prop[node], move.plane),
        a1: sphere$planify(prop[node], move.plane),
        r: prop[node].r,
        r1: prop[node].r
      };
    });
  } else {
    transition = {
      beats: 0,
      plane: VS3D[plane]
    }
    NODES.map(n=>{
      transition[n] = {
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
  transitions = clone(transitions);
  if (!vector$nearly(previous.plane, transition.plane)) {
    let deflt = handlePlaneChange(previous, move, move.plane);
    NODES.map(node=>{
      let n = deflt[node];
      deflt[node] = {
        a: n.a,
        a1: n.a,
        r: n.r,
        r1: n.r
      };
    });
    deflt = resolve(deflt);
    if (matches(deflt, transition, 0.02)) {
      transitions[propid][index] = null;
    } else {
      transitions[propid][index] = transition;
      move = clone(move);
      NODES.map(n=>{
        if (!angle$nearly(move[node].a, transition[node].a1) || !nearly(move[node].r, transition[node].r1)) {
          move[n] = {
            r: transition[n].r1,
            r1: move[n].r1,
            a: transition[n].a1,
            a1: move[n].a1
          };
        }
      });
    }
  } else if (matches(previous, transition, 0.02)) {
    // does this get weird due to intermediate states?  probably not, because it won't match
    NODES.map(n=>{
      // avoid wiping out spin, etc?
      if (!angle$nearly(move[node].a, handleBend(previous[node].a1, previous, node)) || !nearly(move[node].r, previous[node].r1)) {
        move[n] = {
          r: previous[n].r1,
          r1: move[n].r1,
          a: handleBend(previous[n].a1, previous, n),
          a1: move[n].a1
        };
      }
    });
    transitions[propid][index] = null;
  } else {
    move = clone(move);
    NODES.map(n=>{
      // avoid wiping out spin, etc?
      if (!angle$nearly(move[node].a, transition[node].a1) || !nearly(move[node].r, transition[node].r1)) {
        move[n] = {
          r: transition[n].r1,
          r1: move[n].r1,
          a: transition[n].a1,
          a1: move[n].a1
        };
      }
    });
    transitions[propid][index] = transition;
  }
  move = resolve(move);
  moves = clone(moves);
  moves[propid][index] = move;
  store.dispatch({type: "SET_MOVES", moves: moves});
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
  updateEngine();
  validateLocks();
}

function addProp() {
  let {frozen, props, starters, moves, transitions, colors, order} = store.getState();
  if (frozen) {
    return;
  }
  let i = moves.length;
  let prop = player.addProp(new VS3D.Prop(), {color: COLORS[Math.min(i,3)]});
  props.push(clone(prop.prop));
  store.dispatch({type: "SET_PROPS", props: props});
  starters.push(resolve(fit(prop, new Move({beats: 0, plane: VS3D.WALL}))));
  store.dispatch({type: "SET_STARTERS", starters: starters});
  if (moves[0].length>0) {
    let move = clone(starters[i]);
    move.beats = 1;
    moves.push([move]);
  } else {
    moves.push([]);
  }
  store.dispatch({type: "SET_MOVES", moves: moves});
  transitions.push([]);
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
  order.push(order.length);
  store.dispatch({type: "SET_TOP", order: order});
  colors.push(COLORS[Math.min(i,3)]);
  store.dispatch({type: "SET_COLORS", colors: colors});
  updateEngine();
}

function deleteProp(propid) {
  let {frozen, props, starters, moves, transitions, colors, order} = store.getState();
  if (frozen) {
    return;
  }
  propid = parseInt(propid);
  player.props = player.props.filter((_,i)=>(i!==propid));
  props = props.filter((_,i)=>(i!==propid));
  store.dispatch({type: "SET_PROPS", props: props});
  starters = starters.filter((_,i)=>(i!==propid));
  store.dispatch({type: "SET_STARTERS", starters: starters});
  moves = moves.filter((_,i)=>(i!==propid));
  store.dispatch({type: "SET_MOVES", moves: moves});
  transitions = transitions.filter((_,i)=>(i!==propid));
  store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
  order = order.filter(e=>(e!==propid));
  store.dispatch({type: "SET_TOP", order: order});
  colors = colors.filter((_,i)=>(i!==propid));
  store.dispatch({type: "SET_COLORS", colors: colors});
  updateEngine();
}




function modifyBend({propid, bend, pitch}) {
  player.stop();
  const BOUNDS = 2;
  let {tick, tick2, moves} = store.getState();
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
  move = clone(move);
  let a0 = move.head.a;
  let a1 = handleBend(move.head.a1, move, "head");
  let bts = beats(move);
  let solutions = [];
  for (let i=-2; i<=2; i++) {
    let nospin = null;
    if (angle$nearly(a0, a1)) {
      nospin = 0;
    } else if (angle$nearly(a0, angle(a1+180))) {
      nospin = 180;
    }
    let solution = VS3D.solve_angle({x0: a0, x1: a1, t: BEAT*bts, spin: i});
    let flipped = VS3D.solve_angle({x0: a0, x1: angle(a1+180), t: BEAT*bts, spin: i});
    for (let j=0.5; j<=4; j+=0.5) {
      let halfbends = Math.abs(j*beats(move)/2);
      if (halfbends%2===0) {
        if (Math.abs(solution.v0)<=3 && (i!==0 || nospin===0)) {
          solutions.push({v: solution.v0, b: j, spin: i, flip: false});
        }
      } else if (halfbends%2===1) {
        // the flipped solution is wrong when spin=0
        if (Math.abs(flipped.v0)<=3 && (i!==0 || nospin===180)) {
          solutions.push({v: flipped.v0, b: j, spin: i, flip: true});
        }
      }
    }
  }
  // at this point we have all valid solutions...now we just need to sort and traverse
  if (bend) {
    solutions.sort((a,b)=>(a.b-b.b));
    solutions.sort((a,b)=>(a.v-b.v));
  } else if (pitch) {
    solutions.sort((a,b)=>(Math.abs(a.v)-Math.abs(b.v)));
    solutions.sort((a,b)=>(a.b-b.b));
  }
  let bindex, solved;
  let speed = move.head.va || 0;
  for (let i=0; i<solutions.length; i++) {
    let sol = solutions[i];
    if (nearly(speed, sol.v) && nearly(Math.abs(move.vb), sol.b)) {
      bindex = i;
      break;
    }
  }
  if (bindex===undefined && move.vb) {
    alert("never should have gotten here in the code");
    return;
  }
  if (pitch) {
    if (!move.vb) {
      solved = solutions[0];
    } else if (move.vb>0) {
      if (pitch<0) {
        if (bindex===0) {
          solved = {spin: undefined, flip: false, b: 0}
        } else {
          solved = solutions[bindex-1];
        }
      } else if (pitch>0) {
        if (bindex===solutions.length-1) {
          return;
        } else {
          solved = solutions[bindex+1];
        }
      }
    } else if (move.vb<0) {
      if (pitch>0) {
        if (bindex===0) {
          solved = {spin: undefined, flip: false, b: 0}
        } else {
          solved = solutions[bindex-1];
        }
      } else if (pitch<0) {
        if (bindex===solutions.length-1) {
          return;
        } else {
          solved = solutions[bindex+1];
        }
      }
    }
  } else if (bend) {
    if (bend>0 && bindex===solutions.length-1) {
      return;
    } else if (bend<0 && bindex===0) {
      return;
    } else {
      solved = solutions[bindex+bend];
    }
  }
  move = clone(move);
  move.head = {
    a: a0,
    a1: solved.flip ? angle(a1+180) : a1,
    r: move.head.r,
    r1: move.head.r1,
    spin: solved.spin
  };
  move = resolve(move);
  if (move.vb===0) {
    if (pitch>0) {
      move.vb = solved.b;
    } else if (pitch<0) {
      move.vb = -solved.b;
    } else {
      alert("should never reach this point in the code");
    }
  } else {
    move.vb = Math.sign(move.vb)*solved.b;
  }
  moves = clone(moves);
  moves[propid][index] = move;
  store.dispatch({type: "SET_MOVES", moves: moves});
}

    
function modifyTwist({propid, twist, vt}) {
  player.stop();
  const BOUNDS = 4;
  let {tick, tick2, moves, starters, props} = store.getState();
  let move, index;
  if (tick===-1) {
    move = clone(starters[propid]);
  } else {
    let sub = submove(moves[propid], tick);
    move = sub.move;
    index = sub.index;
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
  }
  move = clone(move);
  move.twist = angle(move.twist+45*twist);
  move.vt+=(vt/2);
  move.vt = Math.min(Math.max(move.vt, -BOUNDS), BOUNDS);
  let prop = props[propid];
  prop = clone(prop);
  if (tick===-1) {
    prop.twist = move.twist;
    starters = clone(starters);
    starters[propid] = move;
    store.dispatch({type: "SET_STARTERS", starters: starters});
  } else {
    prop.twist = move.twist+beats(move)*90*move.vt;
    moves = clone(moves);
    moves[propid][index] = move;
    store.dispatch({type: "SET_MOVES", moves: moves});
  }
  props = clone(props);
  props[propid] = prop;
  store.dispatch({type: "SET_PROPS", props: props});
  updateEngine();
}



// hold on...the starting position for the move still exists, right?  we don't want to spoil that...I don't think.
// so what we should actually do is...ugh, this is almost kinda hopeless.  So...let's still let it calculate speeds..
// ...but have it set angles.
function modifyUsingRawMove() {
  let {raw, moves, starters, transitions} = store.getState();
  let {move, index, tick} = getActiveMove();
  let propid = getActivePropId();
  raw = clone(raw);
  raw.plane = VS3D.vector$unitize(raw.plane);
  let next;
  if (tick===-1) {
    if (moves[propid].length>0) {
      next = clone(moves[propid][0]);
    }
  } else {
    if (moves[propid].length>index+1) {
      next = clone(moves[propid][index+1]);
    }
  }
  if (tick===-1) {
    NODES.map(node=>{
      raw[node] = {
        a: raw[node].a1,
        a1: raw[node].a1,
        r: raw[node].r1,
        r1: raw[node].r1
      };
    });
  } else {
    NODES.map(node=>{
      if (!angle$nearly(handleBend(move[node].a1, move, node), handleBend(raw[node].a1, raw, node)) || !nearly(move[node].r1, raw[node].r1)) {
        raw[node] = {
          a: raw[node].a,
          a1: handleBend(raw[node].a1, raw, node),
          r: raw[node].r,
          r1: raw[node].r1
        };
      }
    });
  }
  raw = resolve(raw);
  if (tick===-1) {
    starters = clone(starters);
    starters[propid] = raw;
    store.dispatch({type: "SET_STARTERS", starters: starters});
  } else {
    moves = clone(moves);
    moves[propid][index] = raw;
    store.dispatch({type: "SET_MOVES", moves: moves});
  }
  if (transitions[propid][index+1]) {
    transitions = clone(transitions);
    transitions[propid][index+1] = null;
    store.dispatch({type: "SET_TRANSITIONS", transitions: transitions});
  }
  if (next) {
    moves = clone(moves);
    NODES.map(node=>{
      if (!angle$nearly(next[node].a, handleBend(raw[node].a1, raw, node)) || !nearly(raw[node].r1, next[node].r)) {
        next[node] = {
          a: handleBend(raw[node].a1, raw, node),
          a1: next[node].a1,
          r: raw[node].r1,
          r1: next[node].r1
        };
      }
    });
    next = resolve(next);
    moves[propid][index+1] = next;
    store.dispatch({type: "SET_MOVES", moves: moves});
  }
  gotoTick(tick);
}