

let destination = document.querySelector("#container");

const UNIT = 50;
const UNITS = 7;
const HALF = UNIT/2;
let X0 = HALF*UNITS;
let Y0 = HALF*UNITS;

// prevent recursive handling of double-clicks
let doubleClickHandled = false;
function handleDoubleClick() {
  doubleClickHandled = true;
  setInterval(()=>(doubleClickHandled=false),0);
}

class App extends React.Component {
  componentDidMount() {
    afterReactMounts();
  }
  render() {
    let props = this.props;
    return (
      <div className="grid app" style={{height: "720px"}}>
        <div className="grid top">
            <MovePanel className="frame" {...props} />
            <Grid dragID="SVG" {...props} />
            <div id="display"/>
            <div>
            <button onClick={(e)=>{
              e.preventDefault();
              props.updateEngine();
              save(player.props);
            }}>Export</button>
            <button onClick={(e)=>{
              e.preventDefault();
              props.setPopup(true);
            }}>Import</button>
            </div>
            <PlaneMenu {...props}/>
            <ControlPanel {...props} />
        </div>
        <div className="grid bottom">
        <MoveQueue propid="0" {...props}/>
        <MoveQueue propid="1" {...props}/>
        <MoveQueue propid="2" {...props}/>
        <MoveQueue propid="3" {...props}/>
        </div>
        <PopUp {...props}/>
      </div>
      
    );
  }
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
    registry.push(<PropNode key={key} propid={key} node={BODY} color={props.colors[key]} {...props} />);
  }
  let top = "UP";
  let bottom = "DOWN";
  let right = "RIGHT";
  let left = "LEFT";
  if (props.plane==="WHEEL") {
    right = "BACK";
    left = "FRONT";
  } else if (props.plane==="FLOOR") {
    top = "FRONT";
    bottom = "BACK";
  }
  let tweak = -3;
  return (
    <DragSVG width={UNIT*UNITS} height={UNIT*UNITS} {...props}>

      <rect width={UNIT*UNITS} height={UNIT*UNITS} fill="black"/>
      {grid} 
      <UnitCircle x={X0} y={Y0} />
      <circle cx={X0} cy={Y0} r={2*UNIT} fill="none" stroke="gray" />
      {registry}
      <text x={X0} y={0.75*UNIT+tweak} textAnchor="middle" stroke="gray" fill="gray" style={{fontFamily: "monospace"}}>{top}</text>
      <text x={UNIT*(UNITS-0.5)} y={Y0+tweak} textAnchor="middle" stroke="gray" fill="gray" style={{fontFamily: "monospace"}}>{right}</text>
      <text x={X0} y={UNIT*(UNITS-0.5)+tweak} textAnchor="middle" stroke="gray" fill="gray" style={{fontFamily: "monospace"}}>{bottom}</text>
      <text x={HALF} y={Y0+tweak} textAnchor="middle" stroke="gray" fill="gray" style={{fontFamily: "monospace"}}>{left}</text>
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

class ControlPanel extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.RATE = 15;
  }
  handlePlay = (e)=>{
    e.preventDefault();
    this.props.setFrozen(true);
    this.props.updateEngine();
    player.play();
  }
  handlePause = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    // probably want to gotoTick...
    player.stop();
  }
  handleRewind = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    this.props.updateEngine();
    player.stop();
    player.goto(player.tick-this.RATE);
  }
  handleFrame = (e)=>{
    this.props.setFrozen(false);
    this.props.updateEngine();
    player.stop();
    player.goto(e.target.value)
  }
  handleForward = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    this.props.updateEngine();
    player.stop();
    player.goto(player.tick+this.RATE);
  }
  handleReset = (e)=>{
    e.preventDefault();
    this.props.setFrozen(false);
    player.reset();
  }
  render() {
    // need to figure out how to handle ticks.
    return (
      <div>
        <button onClick={this.handlePlay}>Play</button>
        <button onClick={this.handlePause}>Pause</button>
        <button onClick={this.handleRewind}>-</button>
        <input type="number" style={{width:"80px"}} onChange={this.handleFrame} onInput={this.handleFrame} value={0}/>
        <button onClick={this.handleForward}>+</button>
        <button onClick={this.handleReset}>Reset</button>
      </div>
    );
  }
}

              