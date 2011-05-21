function fixscroll_hack_load() {
	//when sidebarToggled, resize fixscroll
	var source = toggleSidebar.toSource();
	eval('toggleSidebar = '
		+ source.replace('return;', ' fxslLoader.resize(); $&')
		  .replace(/(\}\)?)$/, ' fxslLoader.resize(); $&')
	);
	
	var findbarSource = gFindBar.close.toSource();
	eval('gFindBar.close = '
		+ findbarSource.replace(/(\}?)$/, ' fxslLoader.resize(); $&')
	);

	var toolbarSource = setToolbarVisibility.toSource();
	eval('setToolbarVisibility = '
		+ toolbarSource.replace(/(\}?)$/, ' fxslLoader.resize(); $&')
	);
}

function fixscroll_hack_unload() {
	var source = toggleSidebar.toSource();
	eval('toggleSidebar = '
		+ source.replace('fxslLoader.resize();','')
	);

	var findbarSource = gFindBar.close.toSource();
	eval('gFindBar.close = '
		+ findbarSource.replace('fxslLoader.resize();', '')
	);

	var toolbarSource = setToolbarVisibility.toSource();
	eval('setToolbarVisibility = '
		+ toolbarSource.replace('fxslLoader.resize();', '')
	);
}

function fixscroll_hack_browserOn(browser) {
	// scroll MODE fix (findbar depend on "Find To Center" addon)
	if(!browser.contentWindow.scrollToOrg){
		browser.contentWindow.scrollToOrg = browser.contentWindow.scrollTo;
		browser.contentWindow.scrollTo = 
			function(x, y){
				var box = fxslNotificationBox();
				if(box.isFixscroll && box.fixscroll){
					box.fixscroll.scrollH.setAttribute("curpos", x);
					var dy = parseInt(y) - (box.fixscroll.fixPosition + box.fixscroll.slidePosition);
					box.fixscroll.scrollBy(dy,false);
				}
			};
	}

	if(!browser.contentWindow.scrollByPagesOrg){
		browser.contentWindow.scrollByPagesOrg = browser.contentWindow.scrollByPages;
		browser.contentWindow.scrollByPages = 
			function(page){
				var box = fxslNotificationBox();
				if(box.isFixscroll && box.fixscroll){
					box.fixscroll.scrollBy(box.fixscroll.pageValue * page, false);
				}
			};
	}
	
	if(!browser.contentWindow.scrollByLinesOrg){
		browser.contentWindow.scrollByLinesOrg = browser.contentWindow.scrollByLines;
		browser.contentWindow.scrollByLines = 
			function(line){
				var box = fxslNotificationBox();
				if(box.isFixscroll && box.fixscroll){
					box.fixscroll.scrollBy(box.fixscroll.cursorValue * line, false);
				}
			};
	}
}
function fixscroll_hack_browserOff() {
	var boxes = gBrowser.mPanelContainer.childNodes;
	for(var i=0; i< boxes.length;i++){
		var box = boxes[i];
		if(!box.fixscroll) return;
		
		var browser = box.fixscroll.browser;
		if(browser.contentWindow.scrollToOrg){
			browser.contentWindow.scrollTo = browser.contentWindow.scrollToOrg;
			browser.contentWindow.scrollToOrg = null;
		}
		if(browser.contentWindow.scrollByPagesOrg){
			browser.contentWindow.scrollByPages = browser.contentWindow.scrollByPagesOrg;
			browser.contentWindow.scrollByPagesOrg = null;
		}
		if(browser.contentWindow.scrollByLinesOrg){
			browser.contentWindow.scrollByLines = browser.contentWindow.scrollByLinesOrg;
			browser.contentWindow.scrollByLinesOrg = null;
		}
	}
}
