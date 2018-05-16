function setFirstMove() {
  for (let key in Props) {
    let segment = VS3D.MoveLink();
    segment.hand.radius = Props[key].hand.radius;
    segment.prop.radius = Props[key].prop.radius;
    segment.hand.angle = Props[key].hand.azimuth;
    segment.prop.angle = Props[key].prop.azimuth;
    segment.duration = 0.25;
    segment.prop.speed = 1;
    segment.hand.speed = 0;
    Props[key].addMove(segment);
  }
}
setFirstMove();
// looks like 90 ticks per quarter
// so...t is the position in a MoveLink, and p is the position the chain of moves.
function extendForward() {
  for (let key in Props) {
    Props[key].move.extend();
  }
}

let TICKS_PER_FRAME = 90;
function gotoVS3DFrame(n) {
  let len = Props[Object.keys(Props)[0]].move.submoves.length;
  if (n===len) {
    for (let key in Props) {
      Props[key].move.extend();
    }
  } else if (n===-1) {
    // for now
    n = 0;
  }
  if (n<0) {
    n = 0;
  } else if (n>len) {
    n = len;
  }
  vs.scene.goto(TICKS_PER_FRAME*n);
  return n;
}