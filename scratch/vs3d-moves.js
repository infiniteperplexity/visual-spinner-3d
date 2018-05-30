VS3D = (function(VS3D) {
	const SMALL = VS3D.SMALL;
	const TINY = VS3D.TINY;
	const NUDGE = VS3D.NUDGE;
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
	const ISOBEND = VS3D.ISOBEND;
	const PROBEND = VS3D.PROBEND;
	const ANTIBEND = VS3D.ANTIBEND;

	let recipe = VS3D.recipe;
	let Move = VS3D.Move;
	let extend = VS3D.extend;
	let merge = VS3D.merge;
	let clone = VS3D.clone;

	recipe(
		"ccap",
		{},
		options => {
			let {beats, speed, hand, spin, orient, direction} = options;
			let segment = Move({
				...options,
				beats: beats/4,
				hand: {...hand, a: orient, va: spin*direction*speed},
				head: {a: orient, va: spin*direction*speed},
			}); 
			let move = extend([
				segment,
				{	
					hand: {va: -spin*direction*speed},
					head: {va: 3*spin*direction*speed}
				},
				{},
				{
					hand: {va: spin*direction*speed},
					head: {va: spin*direction*speed}
				}
			]);
			if (spin===ANTISPIN) {
				move = move.slice(2).concat(move.slice(0,2));
			}
			return move;
		}
	);
	// so I don't break things while working on variants
	recipe(
		"pendulum",
		{
			orient: DOWN,
			onepointfive: false,
			// hybrid does nothing for now...makes sense only for bottom half
			hybrid: false
		},
		options => {
			let {beats, speed, hand, head, spin, orient, direction, onepointfive, hybrid} = options;
			// floor plane pendulums don't work right...is that okay?
			let segment = Move(merge(options, {
				beats: beats/4,
				hand: {...hand, a: orient, va: direction*speed},
				head: {...head, a: orient, a1: orient+QUARTER*direction, va1: 0}
			}));
			let topangle = (onepointfive) ? orient+SPLIT : orient;
			let move = extend([
				segment,
				{head: {a1: topangle, spin: -direction}},
				{head: {a1: orient-QUARTER*direction, va1: 0}},
				{head: {a1: orient}}
			]);
			return move;
		}
	);

	recipe(
		"flower",
		{
			petals: 4
		},
		options => {
			let {beats, mode, speed, hand, head, spin, orient, direction, petals, p} = options;
			let v = (spin===INSPIN) ? (petals+1) : (petals-1);
			// mode is a "soft default"
			// should it be more aggressive?
			let hangle = orient+mode;
			if (head.a!==undefined && hand.a!==undefined) {
				hangle = orient + head.a - hand.a;
			}
			let segment = Move(merge(options,{
				beats: beats/4,
				hand: {...hand, a: orient, va: direction*speed},
				head: {...head, a: hangle, va: v*spin*direction*speed}
			}));
			let move = extend([segment,{},{},{}]);
			return move;
		}
	);

	recipe(
		"isolation",
		{
			hand: {r: 0.5},
			mode: BOX
		},
		options => {
			let {beats, mode, speed, hand, head, spin, orient, direction} = options;
			let hangle = mode;
			if (head.a) {
				hangle = head.a;
			} else if (spin===ANTISPIN) {
				// mode is not a very intuitive parameter for cateyes
				hangle = -hangle;
			}
			let segment = Move({
				...options,
				beats: beats/4,
				hand: {...hand, a: orient, va: direction*speed},
				head: {head: {...head, a: hangle}, va: spin*direction*speed}
			});
			let move = extend([
				segment,
				segment,
				segment,
				segment
			]);
			return move;
		}
	);

	recipe(
		"toroid",
		{
			bend: ISOBEND,
			pitch: FORWARD,
			harmonics: 4
		},
		options => {
			let {beats, mode, speed, hand, head, bend, harmonics, orient, direction, pitch, p} = options;
			//mode is a "soft default"
			let hangle = orient+mode;
			if (head.a!==undefined && hand.a!==undefined) {
				hangle = orient + head.a - hand.a;
			}
			let segment = Move(merge(options,{
				beats: beats/4,
				vb: -pitch*harmonics,
				hand: {...hand, a: orient, va: direction*speed},
				head: {...head, a: hangle, va: bend*direction*speed}
			}));
			let move = extend([
				segment,
				segment,
				segment,
				segment
			]);
			return move;
		}
	);

	// A placeholder until I fix extending for bent moves
	recipe(
		"shim_toroid",
		{
			bend: ISOBEND,
			pitch: FORWARD,
			harmonics: 4
		},
		options => {
			let {beats, mode, speed, hand, head, bend, harmonics, orient, pitch, direction, p} = options;
			//mode is a "soft default"
			let hangle = orient+mode;
			if (head.a!==undefined && hand.a!==undefined) {
				hangle = orient + head.a - hand.a;
			}
			let segment = Move(merge(options,{
				beats: beats,
				vb: -pitch*harmonics,
				hand: {...hand, a: orient, va: direction*speed},
				head: {...head, a: hangle, va: bend*direction*speed}
			}));
			return [segment];
		}
	);


	recipe(
		"snake",
		{
			petals: 0
		},
		options => {
			let {beats, mode, speed, hand, head, spin, orient, direction, petals, p} = options;
			let hangle = orient+mode;
			let move = [
				{	
					...options,
					hand: {...hand, a: orient, a1: TINY, a1: orient},
					head: {...head, a: orient, v: direction*spin*speed}
				},
				{	
					...options,
					hand: {...hand, a: orient, a1: TINY, a1: orient},
					head: {...head, a: orient, v: direction*spin*speed}
				},
				{	
					...options,
					hand: {...hand, a: orient, a1: TINY, a1: orient},
					head: {...head, a: -orient, v: direction*spin*speed}
				},
				{	
					...options,
					hand: {a: orient, a1: TINY, a1: orient},
					head: {a: -orient, v: direction*spin*speed}
				}
			];
			// let move = extend([
			// 	segment,
			// 	segment,
			// 	segment,
			// 	segment
			// ]);
			return move;
		}
	);

	return VS3D;
})(VS3D);