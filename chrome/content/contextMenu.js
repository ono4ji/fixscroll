if ("undefined" == typeof(FixScrollContextMenu) 
    && "undefined" != typeof(FixscrollControl)
	&& "undefined" == typeof(FixscrollControl.hereToTop)
	){

//contextMenu
var FixScrollContextMenu = {
	init: function(event){
		var contextMenu = document.getElementById("contentAreaContextMenu");
		contextMenu.addEventListener("popupshowing", this, false);
		window.addEventListener("mouseup", this, false);
	},
	destroy: function() {
		var contextMenu = document.getElementById("contentAreaContextMenu");
		contextMenu.removeEventListener("popupshowing", this, false);
	},
	handleEvent: function(event) {
		if (event.type == "popupshowing") {
			var on = FixscrollControl.isFixScrollModeOn;
			document.getElementById("fixscroll-heretotop").hidden = !on;
		}else if (event.type == "mouseup") {
			if(event.button == 2){//right click
				//save position temporary.
				this.rightClickedY = event.screenY;
			}
		}
	},
	//called by xul
	contextMenuHereToTop: function(event){
		var diffY = this.rightClickedY - gBrowser.boxObject.screenY;
		//Application.console.log("diffY:" + diffY + "=" + this.rightClickedY + " - " + gBrowser.boxObject.screenY);
		if(this.rightClickedY && diffY){
			FixscrollControl.hereToTop(diffY);
		}
	},
}

FixscrollControl.hereToTop = function(diffY){
	if(!this.isFixScrollModeOn) return;
	
	var windowHeight = this.windowHeight;
	var borderPosition = this.fixPosition % windowHeight;
	if( borderPosition <= diffY ){
		//under the border
		this.fixPosition -= borderPosition; //allow over limit. -> diffY scroll recovery 
		//this.scrollBy( -borderPosition , false);
	}else{
		//over the border
		this.scrollBy( windowHeight - borderPosition , false);
	}
	this.scrollBy(diffY, true);
}

window.addEventListener("load", function() { FixScrollContextMenu.init(); }, false);
window.addEventListener("unload", function() { FixScrollContextMenu.destroy(); }, false);
}