//utility function for immutable state
function clone(obj) {
  let nobj = {...obj};
  for (let prop in nobj) {
    if (typeof(nobj[prop])==="object") {
      nobj[prop] = {...clone(nobj[prop])};
    }
  }
  return nobj;
}

// A Higher-Order Component made using ReactRedux.connect
  // attaches properties to the "wrapped" component
let AppComponent = ReactRedux.connect(
  (state)=>({
    props: state.props,
    order: state.order,
    frame: state.frame
  }),
  (dispatch)=>({
      setNode: (args)=>dispatch({type: "setNode", ...args}),
      setTop: (top)=>dispatch({type: "setTop", top: top}),
      synchFrom: ()=>dispatch({type: "synchFrom"}),
      synchTo: ()=>dispatch({type: "synchTo"}),
      gotoFrame: (n)=>dispatch({type: "gotoFrame", n: n})
  })
)(App);


function vs3dToReact() {
  let props = {};
  for (let key in Props) {
    props[key] = [node2vector(Props[key].home),/* {x:0,y:0,z:0}, {x:0,y:0,z:0}, */node2vector(Props[key].hand), node2vector(Props[key].prop)];
  }
  return props;
}

// fire manually at first
function reactToVS3D() {
  let rprops = store.getState().props;
  for (let key in Props) {
    let vprop = Props[key];
    let rprop = rprops[key];
    let body = vector2sphere(rprop[BODY].x,rprop[BODY].y,rprop[BODY].z);
    // let pivot = vector2sphere(rprop[PIVOT]);
    // let helper = vector2sphere(rprop[HELPER]);
    let hand = vector2sphere(rprop[HAND].x,rprop[HAND].y,rprop[HAND].z);
    let head = vector2sphere(rprop[HEAD].x,rprop[HEAD].y,rprop[HEAD].z);
    console.log(rprop[HAND]);
    console.log(hand);
    let rprec = 0.001;
    let aprec = Math.PI/1024;
    vprop.home.radius = round(body.r/UNIT,rprec);
    vprop.home.zenith = round(body.z,aprec);
    vprop.home.azimuth = round(body.a,aprec);
    // vprop.pivot.radius = round(pivot.r/UNIT,0.0001);
    // vprop.pivot.zenith = round(pivot.z,Math.PI/1024);
    // vprop.pivot.azimuth = round(pivot.a,Math.PI/1024);
    // vprop.helper.radius = round(helper.r/UNIT,0.0001);
    // vprop.helper.zenith = round(helper.z,Math.PI/1024);
    // vprop.helper.azimuth = round(helper.a,Math.PI/1024);
    vprop.hand.radius = round(hand.r/UNIT,rprec);
    vprop.hand.zenith = round(hand.z,aprec);
    vprop.hand.azimuth = round(hand.a,aprec);
    vprop.prop.radius = round(head.r/UNIT,rprec);
    vprop.prop.zenith = round(head.z,aprec);
    vprop.prop.azimuth = round(head.a,aprec);
  }
  vs.renderer.render(vs.scene);
}


//a reducer function for a Redux store
function reducer(state, action) {
  if (state === undefined) {
    return {
      props: vs3dToReact(),
      order: Object.keys(Props),
      frame: 0
    };
  }
  switch (action.type) {
    case "synchFrom":
      // could make it so we can synch only one prop, but let's not for now
      return {...state, props: vs3dToReact()}
    case "setNode":
      let {prop, node, x, y} = action;
      let props = clone(state.props);
      props[prop][node] = {x: x, y: y, z:0};
      return {...state, props: props};
    case "setTop":
      let order = [...state.order];
      order.push(order.splice(order.indexOf(action.top),1)[0]);
      return {...state, order};
    case "gotoFrame":
      let n = gotoVS3DFrame(action.n);
      return {...state, frame: n, props: vs3dToReact()};
    default:
      return state;
  }
}

let store = Redux.createStore(reducer);

ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <AppComponent />
  </ReactRedux.Provider>,
  destination
);