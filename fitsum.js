	// treat an array as if it were a collection of digits
	

	// it kind of seems likw this should be generalizable somehow.



	function incindex(arr, base, i) {
		i = i || 0;
		if (i>=arr.length) {
			return null;
		}
		arr = [...arr];
		// the check
		if (arr[i]+1<max) {
			// the operation
			arr[i]+=1;
			return arr;
		} else {
			for (let j=0; j<=i; j++) {
				arr[j] = 0;
			}
			return incindex(arr, max, i+1);
		}
	}
	function fitsums(prop, move) {
		// skip all the recursive and recipe stuff for now
		if (fits(prop, move)) {
			return move;
		}
		let plane = move.p || WALL;
		let {body, pivot, helper, hand, twist, bend, grip, head} = prop;

		let body1 = {r: body.r, a: sphere$planify(body, plane)};
		let pivot1 = {r: pivot.r, a: sphere$planify(pivot, plane)};
		let helper1 = {r: helper.r, a: sphere$planify(helper, plane)};
		let hand1 = {r: hand.r, a: sphere$planify(hand, plane)};
		twist = twist || 0;
		let grip1 = {r: grip.r, a: sphere$planify(grip, plane)};
		let head1 = {r: head.r, a: sphere$planify(head, plane)};

		move = new Move(move);
		let body2 = move.body;
		let pivot2 = move.pivot;
		let helper2 = move.helper;
		let hand2 = move.hand;
		let grip2 = move.grip;
		let head2 = move.head;

		
		let bodyd = (!nearly(body1.r, body2.r));
		let pivotd = (!nearly(pivot1.r, pivot2.r));
		let helperd = (!nearly(helper1.r, helper2.r));
		let handd = (!nearly(hand1.r, hand2.r));
		let gripd = (!nearly(grip1.r, grip2.r));
		let handdiff = bodyd+pivotd+helperd+handd;
		// the algorithm only tries if there are at least two nodes<=HAND with different radii
		if (handdiff>=2) {
		// in which case it tries spinning all the new radii to see if anything fits the old handsum
			
			let nodes = [];
			if (gripd && !zeroish(grip2.r)) {
				nodes.push(GRIP);
			}
			if (handd && !zeroish(hand2.r)) {
				nodes.push(HAND);
			}
			if (helperd && !zeroish(helper2.r)) {
				nodes.push(HELPER);
			}
			if (pivotd && !zeroish(pivot2.r)) {
				nodes.push(PIVOT);
			}
			if (bodyd && !zeroish(body2.r)) {
				nodes.push(BODY);
			}
			let combos = [];
			for (let node of nodes) {
				combos.push(0);
			}
			// okay, now we have our array of angles to try.
			let k = 0;
			let ANGLES = 8;
			let ANGLE = UNIT*(2*Math.PI)/ANGLES;
			let aligned = clone(move);
			while (combos!==null) {	
				for (let i=0; i<combos.length; i++) {
					aligned[NODES[nodes[i]]].a = angle(move[NODES[nodes[i]]].a+ANGLE*combos[i]);
				}
				let m = spin(aligned, 0, "dummy");
				if (sphere$nearly(sum_nodes(prop, GRIP),sum_nodes(m, GRIP), SMALL)) {
					break;
				} else {
					combos = incindex(combos, ANGLES);
				}
			}
		}
	}