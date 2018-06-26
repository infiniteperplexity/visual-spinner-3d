// should it be linked to a player, optionally?
function Bookmarker() {
	this.RATE = 24;
	this.bookmarks = [];
}

Bookmarker.prototype.setTime = function(t) {
	// must override
	// might need to handle bounds?
	//video.setTime(round(t, 1/this.RATE));
}

Bookmarker.prototype.getTime = function() {
	// must override
	// video.currentTime =
	// return video.currentTime.toFixed(3);
}

Bookmarker.prototype.update = function() {
	// should override
	// updateFrame;
}

Bookmarker.prototype.add = function() {
	let time = getTime();
	for (let mark of this.bookmarks) {
		if (nearly(mark), time) {
			return;
		} 
	}
	this.bookmarks.push(time);
	this.bookmarks.sort();
}

Bookmarker.prototype.remove = function() {
	let time = getTime();
	let i=0;
	while (i<this.bookmarks.length) {
		if (nearly(this.bookmarks[i], time)) {
			this.bookmarks.splice(i,1);
		} else {
			i++;
		}
	}
}

Bookmarker.prototype.goto = function() {

}




function chooseBookmark() {
	let val = this.target.value;
	video.currentTime = parseFloat(e.target.value);
	updateBookmarks();
}
function updateBookmarks() {
	let books = document.getElementById("bookmarks");
	books.innerHTML = "<option value='null'>(bookmarks)</option>";
	let selected = false;
	for (let mark of bookmarks) {
		let node = document.createElement("option");
		node.innerHTML = mark;
		node.value = mark;
		if (VS3D.nearly(parseFloat(mark), getTime())) {
			node.selected = true;
			selected = true;
		}
		books.appendChild(node);
	}
	if (!selected) {
		books.firstChild.selected = true;
	}
}

function deleteBookmark() {
	updateFrame();
	let i = 0;
	while (i<bookmarks.length) {
		if (VS3D.nearly(bookmarks[i], getTime())) {
			bookmarks.splice(i,1);
		}
	}
	updateBookmarks();
}
function backFrame() {
	setTime(Math.max(0, getTime() - 1/RATE));
	updateFrame();
}
function forwardFrame() {
	// do these things handle duration the way they should anyway?
	setTime(Math.min(video.duration, getTime() + 1/RATE));
	updateFrame();
}
function chooseTime(e) {
	let val = e.target.value;
	if (VS3D.nearly(parseFloat(val), parseFloat(String(parseFloat(val))))) {
		setTime(parseFloat(val));
	}
}
