//contextMenu
var FixScrollContextMenu = {
	init: function(event){
		var contextMenu = document.getElementById("contentAreaContextMenu");
		contextMenu.addEventListener("popupshowing", this, false);
	},
	destroy: function() {
		var contextMenu = document.getElementById("contentAreaContextMenu");
		contextMenu.removeEventListener("popupshowing", this, false);
	},
	handleEvent: function(event) {
		if (event.type == "popupshowing") {
			var on = FixscrollControl.isFixScrollModeOn;
			document.getElementById("fixscroll-heretotop").hidden = !on;
		}
	},
	//called by xul
	contextMenuHereToTop: function(event){
		var contextMenu = document.getElementById("contentAreaContextMenu");
		var diffY = contextMenu.popupBoxObject.y - gBrowser.boxObject.y;
		FixscrollControl.hereToTop(diffY);
	},
}

FixscrollControl.hereToTop = function(diffY){
	if(!this.isFixScrollModeOn) return;
	
	var windowHeight = this.windowHeight;
	var borderPosition = this.fixPosition % windowHeight;
	if( borderPosition <= diffY ){
		//under the border
		this.fixPosition -= borderPosition;
	}else{
		//over the border
		this.fixPosition += windowHeight - borderPosition;
	}
	this.scrollBy(diffY, true);
}
	

window.addEventListener("load", function() { FixScrollContextMenu.init(); }, false);
window.addEventListener("unload", function() { FixScrollContextMenu.destroy(); }, false);
