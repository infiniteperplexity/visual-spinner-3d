const KEYCODES = {
  DELETE: 46,
  BACKSPACE: 8,
  CONTROL: 17,
  SHIFT: 16
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
function handleKeyDown(e) {
	if ([KEYCODES.DELETE, KEYCODES.BACKSPACE].includes(e.which)) {
	  	e.preventDefault();
	  	let {transition, tick, multiselect} = store.getState();
	  	if (transition) {
	  		pushStoreState();
	  		deleteTransition();
	  	} else if (multiselect) {
	  		deleteMultiple();
	  	} else if (tick!==-1) {
	  		pushStoreState();
	  		deleteMove();
	  		gotoTick(store.getState().tick);
	  	}
	} else if (e.which===KEYCODES.CONTROL) {
		setModifier(true);
	}
	else if (e.which===KEYCODES.SHIFT) {
		// don't do it yet.
	}
}
function handleKeyUp(e) {
	if (e.which===KEYCODES.CONTROL) {
		setModifier(false);
	} else if (e.which===KEYCODES.SHIFT) {
		// don't do it yet.
	}
}