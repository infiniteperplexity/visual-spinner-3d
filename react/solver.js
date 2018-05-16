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

function radialAcceleration(r0, r1, v0, t) {
  return 2*((r1-r0)/(t*t) - v0/t);
}

function angularAcceleration(a0, a1, v0, t, n) {
  n = 0; // for now
  a0 = unwind(a0);
  a1 = unwind(a1);
  if (a0 > a1) { // force it to clockwise for now
    a1 += (2*Math.PI);
  }
  return 2*((a1-a0)/(t*t) - v0/t);
}

function solve(prop, frame) {
  let len = Props[Object.keys(Props)[0]].move.submoves.length;
  if (frame<0 || frame>len-1) {
    alert("can't solve frame out of bounds.");
    return;
  }
  if (frame===len-1) {
    console.log("can't use solver on final frame.");
    return;
  }
  // extract the frames
  let move = prop.move.submoves[frame];
  let next = prop.move.submoves[frame+1];
  let p0, p1, v0 = 1.0;
  let t = 0.25;
  let beats = 0;
  // solve for the home
  if (nearly(move.home.azimuth,next.home.azimuth)) {
    move.home.speed = 0;
    move.home.acc = 0;
  } else {
    move.home.speed = 1;
    move.home.acc = angularAcceleration(move.home.azimuth, next.home.azimuth, move.home.speed, t, beats);
  }
  move.home.stretch = (move.home.radius+next.home.radius)/2;
  // solve for the hand
  if (nearly(move.hand.azimuth,next.hand.azimuth)) {
    move.hand.speed = 0;
    move.hand.acc = 0;
  } else {
    move.hand.speed = 1;
    move.hand.acc = angularAcceleration(move.hand.azimuth, next.hand.azimuth, move.hand.speed, t, beats);
  }
  move.hand.stretch = (move.hand.radius+next.hand.radius)/2;
  // solve for the head
  if (nearly(move.prop.azimuth,next.prop.azimuth)) {
    move.prop.speed = 0;
    move.prop.acc = 0;
  } else {
    move.prop.speed = 1;
    move.prop.acc = angularAcceleration(move.prop.azimuth, next.prop.azimuth, move.prop.speed, t, beats);
  }
  move.prop.stretch = (move.prop.radius+next.prop.radius)/2;
}


// Okay...but we definitely need the synchronization to fix the starting properties at each frame