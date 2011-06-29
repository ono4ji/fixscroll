if ( "undefined" != typeof(FixscrollControl)
	&& "undefined" == typeof(FixscrollControl.fixscroll_hack_load)
	&& "undefined" == typeof(FixscrollControl.fixscroll_hack_unload)
	&& "undefined" == typeof(FixscrollControl.fixscroll_hack_browserOn)
	&& "undefined" == typeof(FixscrollControl.fixscroll_hack_browserOff)
	) {

FixscrollControl.fixscroll_hack_load = function() {
	//when sidebarToggled, resize fixscroll
	FixscrollControl._org_toggleSidebar = toggleSidebar;
	toggleSidebar = function(){
		var result = FixscrollControl._org_toggleSidebar.apply(gBrowser, arguments);
		try { FixscrollControl.onResize(); }catch (ex){}
		return result;
	};
	
	FixscrollControl._org_gFindBar_close = gFindBar.close;
	gFindBar.close = function(){
		var result = FixscrollControl._org_gFindBar_close.apply(gFindBar, arguments);
		try { FixscrollControl.onResize(); }catch (ex){}
		return result;
	};

	FixscrollControl._org_setToolbarVisibility = setToolbarVisibility;
	setToolbarVisibility = function(){
		var result = FixscrollControl._org_setToolbarVisibility.apply(gBrowser, arguments);
		try { FixscrollControl.onResize(); }catch (ex){}
		return result;
	};

	FixscrollControl._org_FullZoom__applySettingToPref = FullZoom._applySettingToPref;
	FullZoom._applySettingToPref = function(){
		var result = FixscrollControl._org_FullZoom__applySettingToPref.apply(FullZoom, arguments);
		try { FixscrollControl.onResize(); }catch (ex){}
		return result;
	};

	FixscrollControl._org_FullZoom_reset = FullZoom.reset;
	FullZoom.reset = function(){
		var result = FixscrollControl._org_FullZoom_reset.apply(FullZoom, arguments);
		try { FixscrollControl.onResize(); }catch (ex){}
		return result;
	};

	FixscrollControl._org_FullScreen_mouseoverToggle = FullScreen.mouseoverToggle;
	FullScreen.mouseoverToggle = function(){
		var result = FixscrollControl._org_FullScreen_mouseoverToggle.apply(FullScreen, arguments);
		try { FixscrollControl.onResize(); }catch (ex){}
		return result;
	};
}

FixscrollControl.fixscroll_hack_unload = function() {
	toggleSidebar = FixscrollControl._org_toggleSidebar;
	FixscrollControl._org_toggleSidebar = null;
	
	gFindBar.close = FixscrollControl._org_gFindBar_close;
	FixscrollControl._org_gFindBar_close = null;
	
	setToolbarVisibility = FixscrollControl._org_setToolbarVisibility;
	FixscrollControl._org_setToolbarVisibility = null;
	
	FullZoom._applySettingToPref = FixscrollControl._org_FullZoom__applySettingToPref;
	FixscrollControl._org_FullZoom__applySettingToPref = null;
	
	FullZoom.reset = FixscrollControl._org_FullZoom_reset;
	FixscrollControl._org_FullZoom_reset = null;

	FullScreen.mouseoverToggle = FixscrollControl._org_FullScreen_mouseoverToggle;
	FixscrollControl._org_FullScreen_mouseoverToggle = null;
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
				}else{
					browser.contentWindow.scrollToOrg(x,y);
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
				}else{
					browser.contentWindow.scrollByPagesOrg(page);
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
				}else{
					browser.contentWindow.scrollByLinesOrg(line);
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

}