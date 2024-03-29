  // A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let AppComponent = ReactRedux.connect(
  (state)=>({
    getActiveProp: getActiveProp,
    getActivePropId: getActivePropId,
    getMovesAtTick: getMovesAtTick,
    getActiveMove: getActiveMove,
    getMultiSelected: getMultiSelected,
    ...state
  }),
  (dispatch)=>({
      renderEngine: renderEngine,
      updateEngine: updateEngine,
      skipToEngineTick: skipToEngineTick,

      gotoTick: gotoTick,

      setTop: setTopPropById,
      setTopPropById: setTopPropById,
      activateProp: activateProp,
      setActiveNode: setActiveNode,
      propSelectAllowed: propSelectAllowed,
      
      // moving the node around 
      setNode: setNodePosition,
      setNodePosition: setNodePosition,
      decoupledNodePosition: decoupledNodePosition,
      
      pushState: pushStoreState,
      pushStoreState: pushStoreState,
      restoreState: restoreStoreState,
      restoreStoreState: restoreStoreState,

      
      
      addMovesToEnd: addMovesToEnd,
      modifyMoveUsingNode: modifyMoveUsingNode,
      setTransition: editTransition,
      editTransition: editTransition,
      validateTransition: validateTransition,
      // setAbruptTransition: setAbruptTransition,
      modifyTransitionUsingNode: modifyTransitionUsingNode,
      // insertNewMove: insertNewMove,
      copyDraggedMove: copyDraggedMove,

      setDuration: setDuration,
      modifySpins: modifySpins,
      modifyAcceleration: modifyAcceleration,
      modifyBend: modifyBend,
      modifyTwist: modifyTwist,
      alignTwist: alignTwist,

      deleteMove: deleteMove,

      setColors: setColors,
      setModels: setModels,
      setPlane: setPlane,
      setLock: setLock,
      setFrozen: setFrozen,
      setScrolled: setScrolled,
      checkLocks: validateLocks,
      validateLocks: validateLocks,

      saveJSON: saveJSON,
      loadJSON: loadJSON,
      fileInput: fileInput,
      setModifier: setModifier,
      setMultiSelect: setMultiSelect,

      addMultiSelect: addMultiSelect,
      clearMultiSelect: clearMultiSelect,
      copyDraggedMultiple: copyDraggedMultiple,

      toggleVideoTools: toggleVideoTools,
      cueMP4Video: cueMP4Video,
      cueYouTubeVideo: cueYouTubeVideo,
      gotoSeconds: gotoSeconds,
      updateTimeCoder: updateTimeCoder,
      setTimeCode: setTimeCode,
      insertTimeCode: insertTimeCode,
      sliceTimeCode: sliceTimeCode,
      removeTimeCode: removeTimeCode,

      toggleRawEdit: toggleRawEdit,
      setRawMove: setRawMove,
      modifyUsingRawMove: modifyUsingRawMove,

      addProp: addProp,
      deleteProp: deleteProp
  })
)(App);


function reducer(state, action) {
  if (state === undefined) {
    return {
      filename: "sequence.json",
      props: clone(player.props.map(p=>p.prop)),
      moves: clone(player.props.map(p=>p.moves)),
      colors: clone(COLORS),
      models: player.props.map(p=>"poi"),
      starters: player.props.map(p=>resolve(fit(p.prop, new Move({beats: 0, plane: VS3D.WALL})))),
      modifier: false,
      multiselect: null,
      video: 0,
      raw: null,
      // youtube: "bHQqvYy5KYo",
      youtube: null,
      // mp4: null,
      mp4: null,
      timecodes: {},
      seconds: 0,
      tick: -1,
      tick2: -1,
      frame: -1,
      order: player.props.map((_,i)=>(player.props.length-i-1)),
      activeNode: null,
      plane: "WALL",
      frozen: false,
      scrolled: 0,
      transition: false,
      // sparse array
      transitions: player.props.map(p=>([])),
      locks: {
        body: true,
        helper: true,
        grip: true,
        head: true,
      } // mean slightly different things
    };
  }
  if (!["SET_TOP","SET_PROPS", "SET_FRAME"].includes(action.type)) {
    // console.log(action);
  }
  switch (action.type) {
    case "SET_STATE":
      return action.state;
    case "SET_FILENAME":
      return {...state, filename: action.filename};
    case "SET_TICK":
      if (action.tick!==-1) {
        for (let move of state.moves) {
          if (move.length===0) {
            return state;
          }
        }
      }
      return {...state, tick: action.tick};
    case "SET_TICK2":
      if (action.tick2!==-1) {
        for (let move of state.moves) {
          if (move.length===0) {
            return state;
          }
        }
      }
      return {...state, tick2: action.tick2};
    case "SET_FRAME":
      player.tick = action.frame;
      return {...state, frame: action.frame};
    case "SET_TOP":
      let order = [...state.order];
      let propid = parseInt(action.propid);
      order.push(order.splice(order.indexOf(propid),1)[0]);
      return {...state, order: order};
    case "SET_NODE":
      return {...state, activeNode: action.node};
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
    case "SET_MODELS":
      return {...state, models: action.models};
    case "SET_PLANE":
      return {...state, plane: action.plane};
    case "SET_TRANSITION":
      return {...state, transition: action.transition};
    case "SET_FROZEN":
      return {...state, frozen: action.frozen};
    case "SET_LOCKS":
      return {...state, locks: action.locks};
    case "SET_MODIFIER":
      return {...state, modifier: action.modifier};
    case "SET_SCROLLED":
      return {...state, scrolled: action.scrolled};
    case "SET_MULTISELECT":
      return {...state, multiselect: action.multiselect};
    case "SET_VIDEO":
      return {...state, video: action.video};
    case "SET_YOUTUBE":
      return {...state, youtube: action.youtube};
    case "SET_MP4":
      return {...state, mp4: action.mp4};
    case "SET_SECONDS":
      return {...state, seconds: action.seconds};
    case "SET_TIMECODES":
      return {...state, timecodes: action.timecodes};
    case "SET_RAW":
      return {...state, raw: action.raw};
    default:
      throw new Error("wrong type of store action: "+action.type);
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
    restoreStoreState(event.state.storeState);
  }
};

window.history.replaceState({storeState: store.getState()}, "emptyTitle", window.location);