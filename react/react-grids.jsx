

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
        <div className="grid header">
          <div>
            <button onClick={(e)=>{
              e.preventDefault();
              if (this.props.frozen) {
                return;
              }
              props.updateEngine();
              setFileName(save(player.props, this.props.filename));
            }}>Save</button>
            <ImportButton {...props} />
            <span style={{
              paddingLeft: "25px"
            }}>{this.props.filename}</span>
          </div>
          <div />
          <div />
        </div>
        <div className="grid top">
          <Grid dragID="SVG" {...props} />
          <MovePanel className="frame" {...props} />
          <div id="display"/>
          <DurationEditor {...props}/>
          <PlaneMenu {...props}/>
          <ControlPanel {...props} />
        </div>
        <div className="grid bottom" style={{
          borderStyle: "solid",
          borderWidth: "1px",
          marginTop: "15px",
          padding: "5px",
          color: "dimgray"
        }}>
          <MoveQueue propid="0" {...props}/>
          <MoveQueue propid="1" {...props}/>
          <MoveQueue propid="2" {...props}/>
          <MoveQueue propid="3" {...props}/>
        </div>
      </div>
      
    );
  }
}

function Grid(props, context) {
  let stroke = "dimgray";
  let dimmer = "#333333";
  let grid = [];
  for (let i=0; i<UNITS; i++) {
    let x = UNIT*i+HALF;
    grid.push(<line key={i} x1={x} y1={0} x2={x} y2={UNITS*UNIT} style={{stroke: stroke, strokeWidth: 1}}/>);
  }  
  for (let j=0; j<UNITS; j++) {
    let y = UNIT*j+HALF;
    grid.push(<line key={UNITS+j} x1={0} y1={y} x2={UNITS*UNIT} y2={y} style={{stroke: stroke, strokeWidth: 1}}/>);
  }
  let registry = [];
  for (let key of props.order) {
    registry.push(<PropNode key={key} propid={key} node={(props.locks.body) ? PIVOT : BODY} color={props.colors[key]} {...props} />);
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
      <line x1={0} y1={0} x2={UNIT*UNITS} y2={UNIT*UNITS} style={{stroke: dimmer, strokeWidth: 1}}/>
      <line x1={0} y1={UNIT*UNITS} x2={UNIT*UNITS} y2={0} style={{stroke: dimmer, strokeWidth: 1}}/>
      <circle cx={X0} cy={Y0} r={UNIT} fill="none" stroke={dimmer} />
      <circle cx={X0} cy={Y0} r={2*UNIT} fill="none" stroke={dimmer} />
      <text x={X0} y={0.75*UNIT+tweak} textAnchor="middle" stroke={stroke} fill={stroke} style={{fontFamily: "monospace"}}>{top}</text>
      <text x={UNIT*(UNITS-0.5)} y={Y0+tweak} textAnchor="middle" stroke={stroke} fill={stroke} style={{fontFamily: "monospace"}}>{right}</text>
      <text x={X0} y={UNIT*(UNITS-0.5)+tweak} textAnchor="middle" stroke={stroke} fill={stroke} style={{fontFamily: "monospace"}}>{bottom}</text>
      <text x={HALF} y={Y0+tweak} textAnchor="middle" stroke={stroke} fill={stroke} style={{fontFamily: "monospace"}}>{left}</text>
      {registry}
    </DragSVG>
  );
}
              