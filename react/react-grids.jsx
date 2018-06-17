

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
            <button onClick={()=>{
              let state = store.getState();
              for (let i=0; i<state.moves.length; i++) {
                player.props[i].prop = socket(state.starters[i]);
                player.props[i].moves = clone(state.moves[i]);
                save(player.props);
              }
            }}>Export</button>
            <button onClick={()=>{
              let props = parse(json);
              player.props = props;
              let state = {
                props: clone(player.props.map(p=>p.prop)),
                moves: clone(player.props.map(p=>p.moves)),
                starters: player.props.map(p=>resolve(fit(p.prop, new Move({beats: 0})))),
                tick: -1,
                order: player.props.map((_,i)=>(player.props.length-i-1)),
                plane: "WALL",
                locks: {
                  body: true,
                  helper: true,
                  grip: true,
                  head: true,
                }
              };
              store.dispatch({type: "restoreState", state: state});
              store.dispatch({type: "gotoTick", tick: -1});
              store.dispatch({type: "renderEngine"});
            }}>Import</button>
            </div>
            <PlaneMenu {...props}/>
            <PlayButton />
        </div>
        <div className="grid bottom">
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
    registry.push(<PropNode key={key} propid={key} node={BODY} color={COLORS[key]} {...props} />);
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
