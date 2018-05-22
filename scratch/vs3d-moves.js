VS3D = (function(VS3D) {
	const SMALL = VS3D.SMALL;
	const TINY = VS3D.TINY;
	const UNIT = VS3D.UNIT;
	const BODY = VS3D.BODY;
	const PIVOT = VS3D.PIVOT;
	const HELPER = VS3D.HELPER;
	const HAND = VS3D.HAND;
	const HEAD = VS3D.HEAD;
	const NODES = VS3D.NODES;
	const WALL = VS3D.WALL;
	const WHEEL = VS3D.WHEEL;
	const FLOOR = VS3D.FLOOR;
	const XAXIS = VS3D.XAXIS;
	const YAXIS = VS3D.YAXIS;
	const ZAXIS = VS3D.ZAXIS;
	const MEASURE = VS3D.MEASURE;
	const TICKS = VS3D.TICKS;
	const BEAT = VS3D.BEAT;
	const SPEED = VS3D.SPEED;
	const NORTH = VS3D.NORTH;
	const EAST = VS3D.EAST;
	const SOUTH = VS3D.SOUTH;
	const WEST = VS3D.WEST;
	const NORTHEAST = VS3D.NORTHEAST;
	const SOUTHEAST = VS3D.SOUTHEAST;
	const SOUTHWEST = VS3D.SOUTHWEST;
	const NORTHWEST = VS3D.NORTHWEST;
	const NEAR = VS3D.NEAR;
	const FAR = VS3D.FAR;
	const N = VS3D.N ;
	const E = VS3D.E;
	const S = VS3D.S;
	const W = VS3D.W;
	const NE = VS3D.NE;
	const SE = VS3D.SE;
	const SW = VS3D.SW;
	const NW = VS3D.NW;
	const TWELVE = VS3D.TWELVE;
	const THREE = VS3D.THREET;
	const SIX = VS3D.SIX;
	const NINE = VS3D.NINE;
	const UP = VS3D.UP;
	const DOWN = VS3D.DOWN;
	const RIGHT = VS3D.RIGHT;
	const LEFT = VS3D.LEFTT;
	const CLOCKWISE = VS3D.CLOCKWISE;
	const COUNTERCLOCKWISE = VS3D.COUNTERCLOCKWISE;
	const CW = VS3D.CW;
	const COUNTER = VS3D.COUNTER;
	const CCW = VS3D.CCW = COUNTERCLOCKWISE;
	const QUARTER = VS3D.QUARTER;
	const HALF = VS3D.HALF;
	const SPLIT = VS3D.SPLIT;
	const SAME = VS3D.SAME;
	const TOGETHER = VS3D.TOGETHER;
	const OPPOSITE = VS3D.OPPOSITE;
	const TOG = VS3D.TOG = TOGETHER;
	const OPP = VS3D.OPP = OPPOSITE;
	const DIAMOND = VS3D.DIAMOND;
	const BOX = VS3D.BOX;
	const INSPIN = VS3D.INSPIN;
	const FORWARD = VS3D.FORWARD;
	const ANTISPIN = VS3D.ANTISPIN;
	const BACKWARD = VS3D.BACKWARD;
	const NONE = VS3D.NONE;

	let MoveFactory = VS3D.MoveFactory;

	MoveFactory.recipe(
		"pendulum",
		{
			spin: INSPIN,
			orient: SOUTH,
			radius: 1
			// ,
			// options for various hybrids
			// triquetra: false,
			// twirl: 1,
			// lift: 0,
			// swing: 0
		},
		(options)=>{
			let segment = new MoveSegment({
				hand: {
					speed: 2*options.spin,
					end_speed: 0,
					
				}

			});

		}
	)




// MoveFactory.recipe(
// 	"pendulum",
// {
// 	name: "Pendulum",
// 	spin: "INSPIN",
// 	orient: "SIX",
// 	entry: "SIX",
// 	extend: 1,
// 	// This parameter makes the hand path accelerate
// 	hybrid: false,
// 	// This parameter allows 1.5s...it should always be an odd number
// 	twirl: 1,
// 	// This parameter helps with antipendulum hybrids
// 	lift: 0,
// 	// This parameter determines how far the pendulum swings
// 	swing: 1
// },
// function(options) {
// 	var move = VS3D.MoveChain();
// 	var segment = VS3D.MoveLink();
// 	segment.pivot.angle = options.pivot_angle;
// 	segment.pivot.radius = options.pivot_radius;
// 	segment.pivot.plane = options.plane;
// 	segment.pivot.speed = 0;
// 	segment.helper.angle = TWELVE;
// 	segment.helper.radius = options.lift;
// 	segment.helper.plane = options.plane;
// 	segment.helper.speed = 0;
// 	segment.duration = 0.25;
// 	segment.hand.speed = options.speed*options.direction;
// 	segment.prop.speed = 2*options.twirl*options.swing*options.speed*options.direction*options.spin;
// 	segment.hand.radius = options.extend;
// 	segment.hand.plane = options.plane;
// 	segment.prop.plane = options.plane;
// 	segment.hand.angle = options.orient;
// 	segment.prop.angle = options.orient + ((options.twirl-1)%4)*QUARTER;
// 	if (options.hybrid == true) {
// 		segment.hand.speed *= 2;
// 	}
// 	var hybrid = (options.hybrid == true) ? 8*options.direction*options.speed*options.spin : 0;
// 	move.add(segment);
// 	move.tail().prop.acc = -8*options.twirl*options.swing*options.direction*options.speed*options.spin;
// 	move.tail().hand.acc = -hybrid;
// 	move.tail().helper.stretch = 0;
// 	move.tail().helper.stretch_acc = 0;
// 	move.extend();
// 	move.tail().prop.acc = -8*options.swing*options.direction*options.speed*options.spin;
// 	move.tail().hand.acc = -hybrid;
// 	move.tail().helper.stretch = 0;
// 	move.tail().helper.stretch_acc = 32*options.lift;
// 	move.extend();
// 	move.tail().prop.acc = 8*options.swing*options.direction*options.speed*options.spin;
// 	move.tail().hand.acc = hybrid;
// 	move.tail().helper.stretch = -8*options.lift;
// 	move.tail().helper.radius = 2*options.lift;
// 	move.tail().helper.stretch_acc = 32*options.lift;
// 	move.extend();
// 	move.tail().prop.acc = 8*options.twirl*options.swing*options.direction*options.speed*options.spin;
// 	move.tail().hand.acc = hybrid;
// 	move.tail().helper.stretch = 0;
// 	move.tail().helper.stretch_acc = 0;
// 	// under certain parameters, pendulums align badly and need tweaking
// 	if ((options.hybrid == true || options.extend < SMALL) && nearly(options.entry,TWELVE)) {
// 		move.align("hand",SIX);
// 	} else {
// 		move.align("hand", options.entry);
// 	}
// 	return move;
// });
// MoveFactory.variant("antipendulum",{name: "Anti-Pendulum", spin: "ANTISPIN", lift: 0.5, swing: 0.75, extend: 0.5},"pendulum");
// MoveFactory.variant("onepointfive",{name: "One Point Five", twirl: 3},"pendulum");


	return VS3D;
})(VS3D);