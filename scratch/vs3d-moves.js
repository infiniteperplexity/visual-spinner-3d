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
	let Move = VS3D.Move;
	let chain = VS3D.chain;
	let socket = VS3D.socket;
	let realign = VS3D.realign;

	MoveFactory.recipe(
		"ccap",
		{
			orient: NORTH,
			spin: INSPIN,
			hand: {r: 1}
		},
		function(options) {
			let {beats, speed, hand, spin, orient, direction} = options;
			let move = chain([
				Move({
					...options,
					beats: beats/4,
					hand: {...hand, a: orient, va: spin*direction*speed},
					head: {a: orient, va: spin*direction*speed},
				}),
				Move({
					...options,
					beats: beats/4,
					hand: {...hand, va: -spin*direction*speed},
					head: {va: 3*spin*direction*speed}
				}),
				Move({
					...options,
					beats: beats/4,
					hand: {...hand, va: -spin*direction*speed},
					head: {va: 3*spin*direction*speed}
				}),
				Move({
					...options,
					beats: beats/4,
					hand: {...hand, va: spin*direction*speed},
					head: {va: spin*direction*speed}
				})
			]);
			if (spin===ANTISPIN) {
				move = move.slice(2).concat(move.slice(0,2));
			}
			return realign(socket(options),move);
		}
	);

	return VS3D;
})(VS3D);