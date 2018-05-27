function spin(p, m, t, nofit) {
		if (typeof(m)==="number") {
			nofit = t;
			t = m;
			m = p;
		} else if (!nofit) {
			m = fit(p, m);
		}
		if (Array.isArray(m)) {
			if (m.length===0) {
				return p;
			}
			let past = 0;
			let i = 0;
			while (past<=t) {
				let ticks = beats(m[i])*BEAT || 1*BEAT;
				if (past+ticks>=t) {
					return spin(m[i], t-past, nofit);
				} else {
					past+=ticks;
					i=(i+1)%m.length;
				}
			}
		}
		if (Array.isArray(m)) {
			console.log("shouldn't have gotten here");
		}
		return prop$spin(m, t);
	}

	

	function refit(prop, move) {
		if (Array.isArray(move)) {
			console.log("need to handle refit?");
		}
		let plane = move.p || WALL;
		// !!!in a perfect world, this would have a preference for keeping defaults on body, pivot, or hinge
		let {body, pivot, helper, hand, twist, bend, grip, head} = prop;
		body = {r: body.r, a: sphere$planify(body, plane), p: plane};
		pivot = {r: pivot.r, a: sphere$planify(pivot, plane), p: plane};
		helper = {r: helper.r, a: sphere$planify(helper, plane), p: plane};
		hand = {r: hand.r, a: sphere$planify(hand, plane), p: plane};
		// at least for how we currently handle TWIST
		twist = twist || 0;
		// so...ooh boy...better hope you never have a BENDED prop at the beginning of a move :(
		// !!!!!!I think what I actually need to do is BEND the move's head and grip here
		grip = {r: grip.r, a: sphere$planify(grip, plane), p: plane};
		head = {r: head.r, a: sphere$planify(head, plane), p: plane};
		let aligned = {
			body: merge(move.body, body),
			pivot: merge(move.pivot, pivot),
			helper: merge(move.helper,helper),
			hand: merge(move.hand, hand),
			// I'm not sure this is correct
			twist: twist,
			bent: move.bent,
			vt: move.vt,
			vb: move.vb,
			grip: merge(move.grip, grip),
			head: merge(move.head, head),
			beats: move.beats,
			p: plane
		};
		if (move.recipe) {

			
			// // should I also refit, or will it already be fit properly?
			let built = build(move.recipe, merge(aligned, move));
			// if (move.recipe==="pendulum") {
			// 	console.log("arguments:");
			// 	console.log(merge(aligned, move));
			// 	console.log("initial form:");
			// 	console.log(clone(built));
			// 	console.log("socket:");
			// 	console.log(socket(aligned));
			// }
			if (move.nofit) {
				return built;
			}
			return realign(socket(aligned), built);
		}
		// !!!!! causes problems for movefactory
		if (move.nofit) {
			return move;
		}
		return aligned;
	}



	function fit(prop, move) {
		if (Array.isArray(move)) {
			if (move.length===0) {
				return [];
			}
			return chain(prop, move);
		} else {
			// this isn't really where I want to check this
			// if (move.nofit) {
			// 	return move;
			// }
			if (move.recipe) {
				return refit(prop, move);
			}
			if (fits(prop, move)) {
				return move;
			} else {
				return refit(prop, move);
			}
		}
	}

	function chain(prop, arr) {
		if (Array.isArray(prop)) {
			arr = prop;
		} else {
			arr[0] = fit(prop,arr[0]);
		}
		for (let i=1; i<arr.length; i++) {
			arr[i] = fit(socket(arr[i-1]),arr[i]);
		}
		return arr;
	}
