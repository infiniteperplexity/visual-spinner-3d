const KEYCODES = {
  DELETE: 46,
  BACKSPACE: 8,
  CONTROL: 17,
  SHIFT: 16,
  TAB: 9
}

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
let doubleKey = null;
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
	} else if (e.which===KEYCODES.TAB && !e.altKey) {
		e.preventDefault();
		if (doubleKey && doubleKey.which===KEYCODES.TAB) {
			let {vidleft} = store.getState();
			store.dispatch({type: "SET_VIDLEFT", vidleft: !vidleft});
			store.disptch({type: "SET_VIDEO", video: true});
		} else {
			toggleVideoTools();
		}
	}
	doubleKey = e;
	setTimeout(()=>(doubleKey=null),500);
}
function handleKeyUp(e) {
	if (e.which===KEYCODES.CONTROL) {
		setModifier(false);
	} else if (e.which===KEYCODES.SHIFT) {
		// don't do it yet.
	}
}	