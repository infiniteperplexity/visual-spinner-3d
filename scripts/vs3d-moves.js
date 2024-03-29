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
	let chain = VS3D.chain;
	let merge = VS3D.merge;
	let clone = VS3D.clone;
	let realign = VS3D.realign;
	let angle$nearly = VS3D.angle$nearly;
	let {nearly, zeroish, angle} = VS3D;

	recipe(
		"ccap",
		{},
		options => {
			let {beats, hand, spin, orient, direction, plane, entry} = options;
			let segment = Move(merge(options,{
				beats: 1,
				hand: {a: orient, va: spin*direction},
				head: {a: orient, va: spin*direction}
			})); 
			let move = chain([
				segment,
				{	
					hand: {va: -spin*direction},
					head: {va: 3*spin*direction}
				},
				{},
				{
					hand: {va: spin*direction},
					head: {va: spin*direction}
				}
			]);
			if (spin===ANTISPIN) {
				move = move.slice(2).concat(move.slice(0,2));
			}
			if (entry!==undefined) {
				if (angle$nearly(entry, orient+SPLIT)) {
					move = move.slice(2).concat(move.slice(0,2));
				} else {
					move = realign(move,(s)=>angle$nearly(s.hand.a,entry));
				}
			}
			return move;
		}
	);
	recipe(
		"pendulum",
		{
			orient: DOWN,
			onepointfive: false,
			spin: INSPIN,
			// hybrid does nothing for now...makes sense only for bottom half
			hybrid: false,
			// I may change the name for this at some point; it's for a variant I have been working on
			variant: false
			// there's also craziness you can do with the antispin variants...you can throw the top half of a two-petal inspin in there
			// and you can throw the bottom half of an antispin flower into a normal pendulum...is there a way to general the arguments here?
		},
		options => {
			let {beats, hand, head, spin, orient, direction, onepointfive, hybrid, entry, variant} = options;
			let bangle = (onepointfive) ? angle(orient+SPLIT) : orient;
			let tangle = (variant) ? angle(orient+SPLIT) : orient;
			//let tangle = angle(orient+SPLIT);
			let segment = Move(merge(options, {
				beats: 1,
				hand: {a: orient, va: direction},
				head: {a: bangle, a1: orient+QUARTER*spin*direction, spin: spin*direction, va1: 0}
			}));
			let move = chain([
				segment,
				{head: {a1: tangle, spin: -spin*direction}},
				{head: {a1: orient-QUARTER*spin*direction, va1: 0}},
				{head: {a1: bangle, va: 0, spin: spin*direction}}
			]);
			if (entry!==undefined) {
				move = realign(move,(s)=>angle$nearly(s.hand.a,entry));
			}
			return move;
		}
	);

	recipe(
		"bupendulum",
		{
			orient: DOWN,
			onepointfive: false,
			spin: INSPIN,
			// hybrid does nothing for now...makes sense only for bottom half
			hybrid: false
		},
		options => {
			let {beats, hand, head, spin, orient, direction, onepointfive, hybrid, entry} = options;
			let bangle = (onepointfive) ? angle(orient+SPLIT) : orient;
			let segment = Move(merge(options, {
				beats: 1,
				hand: {a: orient, va: direction},
				head: {a: bangle, a1: orient+QUARTER*spin*direction, spin: spin*direction, va1: 0}
			}));
			let move = chain([
				segment,
				{head: {a1: orient, spin: -spin*direction}},
				{head: {a1: orient-QUARTER*spin*direction, va1: 0}},
				{head: {a1: bangle, va: 0, spin: spin*direction}}
			]);
			if (entry!==undefined) {
				move = realign(move,(s)=>angle$nearly(s.hand.a,entry));
			}
			return move;
		}
	);



	recipe(
		"flower",
		{
			petals: 4
		},
		options => {
			let {beats, mode, hand, head, spin, orient, direction, petals, plane, entry} = options;
			let v = (spin===INSPIN) ? (petals+1) : (petals-1);
			// mode is a "soft default"
			let hangle = (mode!==undefined) ? orient+mode : orient+head.a-hand.a;
			let segment = Move(merge(options,{
				beats: 1,
				hand: {a: orient, va: direction},
				head: {a: hangle, va: v*spin*direction}
			}));
			let move = chain([segment,{},{},{}]);
			if (entry!==undefined) {
				move = realign(move,(s)=>angle$nearly(s.hand.a,entry));
			}
			return move;
		}
	);

	recipe(
		"isolation",
		{
			mode: BOX
		},
		options => {
			let {beats, mode, hand, head, spin, orient, direction, entry} = options;
			let hangle = (mode!==undefined) ? orient+mode : head.a;
			if (spin===ANTISPIN) {
				// mode is not a very intuitive parameter for cateyes
				hangle = -hangle;
			}
			let segment = Move(merge(options,{
				beats: 1,
				hand: {r: 0.5, a: orient, va: direction},
				head: {a: hangle, va: spin*direction}
			}));
			let move = chain([segment,{},{},{}])
			if (entry!==undefined) {
				move = realign(move,(s)=>angle$nearly(s.hand.a, entry));
			}
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
			let {beats, mode, hand, head, bend, harmonics, orient, direction, pitch, plane, entry} = options;
			//mode is a "soft default"
			let hangle = (mode!==undefined) ? orient+mode : orient+head.a-hand.a;
			let segment = Move(merge(options,{
				beats: 1,
				vb: pitch*harmonics,
				hand: {a: orient, va: direction},
				head: {a: hangle, va: bend*direction}
			}));
			let move = chain([segment,{},{},{}]);
			if (entry!==undefined) {
				move = realign(move,(s)=>angle$nearly(s.hand.a,entry));
			}
			return move;
		}
	);

	recipe(
		"snake",
		{
			harmonics: 1,
			oval: 0.01
		},
		options => {
			let {beats, mode, hand, head, harmonics, orient, direction, plane, entry, oval} = options;
			// let's say there's no such thing as mode for now
			// so this guy, we combined hand and helper, but we could have just used linear movements
			let segment = Move(merge(options,{
				beats: 1,
				hand: {a: orient, r: hand.r, r1: 0, va: 0},
				head: {a: orient, va: direction*harmonics},
				helper: {a: orient+direction*QUARTER, r: 0, r1: oval}
			}));
			let move = chain([
				segment,
				{hand: {r1: hand.r, a: orient+SPLIT}, helper: {r1: 0}},
				{hand: {r1: 0}, helper: {a: orient-direction*QUARTER, r1: oval}},
				{hand: {r1: hand.r, a: orient}, helper: {r1: 0}}
			]);
			// alignment is pretty weird for this move that combines hand and helper
			if (entry!==undefined) {
				console.log("flag 1");
				move = realign(move,(s)=>{
					console.log(entry);	
					console.log(s.hand);
					console.log(s.helper);
					console.log(hand);
					if (nearly(s.hand.r, hand.r, 0.1) && angle$nearly(s.hand.a, entry, 1)) {
						return true;
					} else if (zeroish(s.hand.r, 0.1) && angle$nearly(s.helper.a, entry, 1)) {
						return true;
					}
					return false;
				});
				console.log("flag 2");
			}	
			return move;
		}
	);

	return VS3D;
})(VS3D);