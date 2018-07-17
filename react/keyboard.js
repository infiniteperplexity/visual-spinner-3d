const KEYCODES = {
  DELETE: 46,
  BACKSPACE: 8
}

window.addEventListener("keydown", handleKeyDown);
	function handleKeyDown(e) {
	if ([KEYCODES.DELETE, KEYCODES.BACKSPACE].includes(e.keyCode)) {
	  	e.preventDefault();
	  	let {transition, tick} = store.getState();
	  	if (transition) {
	  		deleteTransition();
	  	} else if (tick!==-1) {
	  		deleteMove();
	  	}
	  	gotoTick(store.getState().tick);
	}
}