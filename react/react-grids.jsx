let destination = document.querySelector("#container");

// prevent recursive handling of double-clicks
let doubleClickHandled = false;
function handleDoubleClick() {
  doubleClickHandled = true;
  setInterval(()=>(doubleClickHandled=false),0);
}

function App(props, context) {
  return (
    <div className="app">
      <div className="track frame">
        <p>track-based view of prop movement sequences</p>
      </div>
      <div className="frame" id="display">
        <p>VS3D view goes here</p>
      </div>
      <div className="frame">
        <Grid dragID="WALL" {...props} />
      </div>
      <div className="frame">
        <Grid dragID="WHEEL" {...props} />
      </div>
      <div className="frame">
      <Grid dragID="FLOOR" {...props} />
      </div>
      <div className="frame">
        <PropControls {...props} />
        <p>edit attributes of selected prop here</p>
      </div>
    </div>
  );
}

function Grid(props, context) {
  let grid = [];
  for (let i=0; i<UNITS; i++) {
    let x = UNIT*i+HALF;
    grid.push(<line key={i} x1={x} y1={0} x2={x} y2={UNITS*UNIT} style={{stroke: "gray", strokeWidth: 1}}/>);
  }  
  for (let j=0; j<UNITS; j++) {
    let y = UNIT*j+HALF;
    grid.push(<line key={UNITS+j} x1={0} y1={y} x2={UNITS*UNIT} y2={y} style={{stroke: "gray", strokeWidth: 1}}/>);
  }
  let registry = [];
  for (let key of props.order) {
    registry.push(<PropNode key={key} prop={key} color={key} {...props} />);
  }
  return (
    <DragSVG width={UNIT*UNITS} height={UNIT*UNITS} {...props}>
      <rect width={UNIT*UNITS} height={UNIT*UNITS} fill="black"/>
      {grid} 
      <UnitCircle x={X0} y={Y0} />
      <circle cx={X0} cy={Y0} r={2*UNIT} fill="none" stroke="gray" />
      {registry}
    </DragSVG>
  );
}

function UnitCircle(props, context) {
  let {x, y} = props;
  return [
    <circle key={0.5} cx={x} cy={y} r={HALF} fill="none" stroke="gray" />,  
    <circle key={1.0} cx={x} cy={y} r={UNIT} fill="none" stroke="" />
  ];
}
