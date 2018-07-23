const KEYCODES = {
  DELETE: 46,
  BACKSPACE: 8,
  CONTROL: 17
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
function handleKeyDown(e) {
	if ([KEYCODES.DELETE, KEYCODES.BACKSPACE].includes(e.which)) {
	  	e.preventDefault();
	  	let {transition, tick} = store.getState();
	  	if (transition) {
	  		deleteTransition();
	  	} else if (tick!==-1) {
	  		deleteMove();
	  	}
	  	gotoTick(store.getState().tick);
	} else if (e.which===KEYCODES.CONTROL) {
		setModifier(true);
	}
}
function handleKeyUp(e) {
	if (e.which===KEYCODES.CONTROL) {
		setModifier(false);
	}
}