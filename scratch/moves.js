var VS3D = function(VS3D) {

	let defaults = {
		plane: WALL,
		entry: NORTH,
		orient: NORTH,
		beats: 4,
		speed: 1,
		direction: CLOCKWISE
	}
	function NamedMove(args) {
		return new VS3D.MoveChain(args);	
	}
	NamedMove.prototype = VS3D.MoveChain.prototype;
	NamedMove.prototype.align = function(prop) {

	}
	let MoveFactory = {};
	MoveFactory.build = {};
	MoveFactory.recipe = function(name, defs, f) {
		MoveFactory.build[name] = function(args) {
			return f({...args, ...defs, ...defaults});
		}
	}
	MoveFactory.variant = function(name, recipe, defs) {
		MoveFactory.build[name] = function(args) {
			return MoveFactory.build[recipe]({...args, ...defs});
		}
	} 

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




MoveFactory.recipe(
	"pendulum",
{
	name: "Pendulum",
	spin: "INSPIN",
	orient: "SIX",
	entry: "SIX",
	extend: 1,
	// This parameter makes the hand path accelerate
	hybrid: false,
	// This parameter allows 1.5s...it should always be an odd number
	twirl: 1,
	// This parameter helps with antipendulum hybrids
	lift: 0,
	// This parameter determines how far the pendulum swings
	swing: 1
},
function(options) {
	var move = VS3D.MoveChain();
	var segment = VS3D.MoveLink();
	segment.pivot.angle = options.pivot_angle;
	segment.pivot.radius = options.pivot_radius;
	segment.pivot.plane = options.plane;
	segment.pivot.speed = 0;
	segment.helper.angle = TWELVE;
	segment.helper.radius = options.lift;
	segment.helper.plane = options.plane;
	segment.helper.speed = 0;
	segment.duration = 0.25;
	segment.hand.speed = options.speed*options.direction;
	segment.prop.speed = 2*options.twirl*options.swing*options.speed*options.direction*options.spin;
	segment.hand.radius = options.extend;
	segment.hand.plane = options.plane;
	segment.prop.plane = options.plane;
	segment.hand.angle = options.orient;
	segment.prop.angle = options.orient + ((options.twirl-1)%4)*QUARTER;
	if (options.hybrid == true) {
		segment.hand.speed *= 2;
	}
	var hybrid = (options.hybrid == true) ? 8*options.direction*options.speed*options.spin : 0;
	move.add(segment);
	move.tail().prop.acc = -8*options.twirl*options.swing*options.direction*options.speed*options.spin;
	move.tail().hand.acc = -hybrid;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = 0;
	move.extend();
	move.tail().prop.acc = -8*options.swing*options.direction*options.speed*options.spin;
	move.tail().hand.acc = -hybrid;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = 32*options.lift;
	move.extend();
	move.tail().prop.acc = 8*options.swing*options.direction*options.speed*options.spin;
	move.tail().hand.acc = hybrid;
	move.tail().helper.stretch = -8*options.lift;
	move.tail().helper.radius = 2*options.lift;
	move.tail().helper.stretch_acc = 32*options.lift;
	move.extend();
	move.tail().prop.acc = 8*options.twirl*options.swing*options.direction*options.speed*options.spin;
	move.tail().hand.acc = hybrid;
	move.tail().helper.stretch = 0;
	move.tail().helper.stretch_acc = 0;
	// under certain parameters, pendulums align badly and need tweaking
	if ((options.hybrid == true || options.extend < SMALL) && nearly(options.entry,TWELVE)) {
		move.align("hand",SIX);
	} else {
		move.align("hand", options.entry);
	}
	return move;
});
MoveFactory.variant("antipendulum",{name: "Anti-Pendulum", spin: "ANTISPIN", lift: 0.5, swing: 0.75, extend: 0.5},"pendulum");
MoveFactory.variant("onepointfive",{name: "One Point Five", twirl: 3},"pendulum");


	return VS3D;
}(VS3D);