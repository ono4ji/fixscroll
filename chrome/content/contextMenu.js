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
				this.rightClickedX = event.screenX;
				this.rightClickedY = event.screenY;
			}
		}
	},
	//called by xul
	contextMenuHereToTop: function(event){
		var diffY = this.rightClickedY - gBrowser.boxObject.screenY;
		//Application.console.log("diffY:" + diffY + "=" + this.rightClickedY + " - " + gBrowser.boxObject.screenY);
		if(this.rightClickedY && diffY){
			FixscrollControl.hereToTop(diffY, this.rightClickedX, this.rightClickedY);
		}
	},
}

FixscrollControl.hereToTop = function(diffY, startX, startY){
	if(!this.isFixScrollModeOn) return;
	
	var windowHeight = this.windowHeight;
	var borderPosition = this.fixPosition % windowHeight;
	Application.console.log("diffY:" + diffY);
	Application.console.log("borderPosition:" + borderPosition);
	Application.console.log("windowHeight:" + windowHeight);
	
	var ns = {};
	Components.utils.import('resource://fixscroll-modules/animationManager.js', ns);
	ns.animationManager.removeAllTasks();

	if( borderPosition <= diffY ){
		//under the border
		var task = function(aTime, aBeginningValue, aTotalChange, aDuration) {
			var dmove = (aTime / aDuration * aTotalChange);
			var v = dmove - (this.prevPosition ? this.prevPosition : 0);
			this.prevPosition = dmove;
			FixscrollControl.fixPosition += v; //allow over limit. -> diffY scroll recovery 
			return aTime > aDuration;
		};
		ns.animationManager.addTask(task, 0, -borderPosition, 250);
	}else{
		//over the border
		var task = function(aTime, aBeginningValue, aTotalChange, aDuration) {
			var dmove = (aTime / aDuration * aTotalChange);
			var v = dmove - (this.prevPosition ? this.prevPosition : 0);
			this.prevPosition = dmove;
			FixscrollControl.scrollBy( v , false);
			return aTime > aDuration;
		};
		ns.animationManager.addTask(task, 0, windowHeight - borderPosition, 250);
	}
	
	//open panel
	const PANEL_HALF_WIDTH = 24;
	const PANEL_WIDTH = PANEL_HALF_WIDTH * 2;
	var panel = document.getElementById("fixscroll-arrow");
	panel.style.opacity = 1;
	panel.openPopup(gBrowser, "overlap", startX-PANEL_HALF_WIDTH, startY+PANEL_HALF_WIDTH, false, false);
	panel.moveTo(startX-PANEL_WIDTH, startY);

	//move scroll & panel
	var task = function(aTime, aBeginningValue, aTotalChange, aDuration) {
		var dmove = (aTime / aDuration * aTotalChange);
		var toTop = dmove - (this.prevMove ? this.prevMove : 0);
		this.prevMove = dmove;
		FixscrollControl.scrollBy(toTop, true);
		panel.moveTo(startX-PANEL_WIDTH, startY - dmove * FixscrollControl.scale );

		//disapper panel
		if(aTime >= aDuration){
			var task = function(aTime, aBeginningValue, aTotalChange, aDuration) {
				var panel = document.getElementById("fixscroll-arrow");
				panel.style.opacity = (aBeginningValue - aTime / aDuration * aTotalChange);
				if(aTime >= aDuration) panel.hidePopup();
				return aTime > aDuration;
			};
			ns.animationManager.addTask(task, 1, 1, 250);
		}
		return aTime > aDuration;
	};
	ns.animationManager.addTask(task, 0, diffY, 250);
}

window.addEventListener("load", function() { FixScrollContextMenu.init(); }, false);
window.addEventListener("unload", function() { FixScrollContextMenu.destroy(); }, false);
}