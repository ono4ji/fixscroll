FixscrollControl.fixscroll_hack_load = function() {
	//when sidebarToggled, resize fixscroll
	var source = toggleSidebar.toSource();
	eval('toggleSidebar = '
		+ source.replace('return;', ' FixscrollControl.onResize(); $&')
		  .replace(/(\}\)?)$/, ' FixscrollControl.onResize(); $&')
	);
	
	var findbarSource = gFindBar.close.toSource();
	eval('gFindBar.close = '
		+ findbarSource.replace(/(\}?)$/, ' FixscrollControl.onResize(); $&')
	);

	var toolbarSource = setToolbarVisibility.toSource();
	eval('setToolbarVisibility = '
		+ toolbarSource.replace(/(\}?)$/, ' FixscrollControl.onResize(); $&')
	);
	
	var zoomApplySource = FullZoom._applySettingToPref.toSource();
	eval('FullZoom._applySettingToPref = '
		+ zoomApplySource.replace(/(\}\)?)$/, ' FixscrollControl.onResize(); $&')
	);

	var zoomResetSource = FullZoom.reset.toSource();
	eval('FullZoom.reset = '
		+ zoomResetSource.replace(/(\}\)?)$/, ' FixscrollControl.onResize(); $&')
	);
}

FixscrollControl.fixscroll_hack_unload = function() {
	var source = toggleSidebar.toSource();
	eval('toggleSidebar = '
		+ source.replace('FixscrollControl.onResize();','')
	);

	var findbarSource = gFindBar.close.toSource();
	eval('gFindBar.close = '
		+ findbarSource.replace('FixscrollControl.onResize();', '')
	);

	var toolbarSource = setToolbarVisibility.toSource();
	eval('setToolbarVisibility = '
		+ toolbarSource.replace('FixscrollControl.onResize();', '')
	);
	
	var zoomApplySource = FullZoom._applySettingToPref.toSource();
	eval('FullZoom._applySettingToPref = '
		+ zoomApplySource.replace('FixscrollControl.onResize();', '')
	);

	var zoomResetSource = FullZoom.reset.toSource();
	eval('FullZoom.reset = '
		+ zoomResetSource.replace('FixscrollControl.onResize();', '')
	);
}

FixscrollControl.fixscroll_hack_browserOn = function(browser) {
	// scroll MODE fix (findbar depend on "Find To Center" addon)
	if(!browser.contentWindow.scrollToOrg){
		browser.contentWindow.scrollToOrg = browser.contentWindow.scrollTo;
		browser.contentWindow.scrollTo = 
			function(x, y){
				var tab = gBrowser.selectedTab;
				if(tab.isFixscroll && tab.fixscroll){
					FixscrollControl.scrollH.setAttribute("curpos", x);
					var dy = parseInt(y) - (tab.fixscroll.fixPosition + tab.fixscroll.slidePosition);
					FixscrollControl.scrollBy(dy,false);
				}
			};
	}

	if(!browser.contentWindow.scrollByPagesOrg){
		browser.contentWindow.scrollByPagesOrg = browser.contentWindow.scrollByPages;
		browser.contentWindow.scrollByPages = 
			function(page){
				var tab = gBrowser.selectedTab;
				if(tab.isFixscroll && tab.fixscroll){
					FixscrollControl.scrollBy(FixscrollControl.pageValue * page, false);
				}
			};
	}
	
	if(!browser.contentWindow.scrollByLinesOrg){
		browser.contentWindow.scrollByLinesOrg = browser.contentWindow.scrollByLines;
		browser.contentWindow.scrollByLines = 
			function(line){
				var tab = gBrowser.selectedTab;
				if(tab.isFixscroll && tab.fixscroll){
					FixscrollControl.scrollBy(FixscrollControl.cursorValue * line, false);
				}
			};
	}
}
FixscrollControl.fixscroll_hack_browserOff = function() {
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
