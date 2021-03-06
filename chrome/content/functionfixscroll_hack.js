if ( "undefined" != typeof(FixscrollControl)
	&& "undefined" == typeof(FixscrollControl.fixscroll_hack_load)
	&& "undefined" == typeof(FixscrollControl.fixscroll_addon_load)
	&& "undefined" == typeof(FixscrollControl.fixscroll_hack_unload)
	&& "undefined" == typeof(FixscrollControl.fixscroll_addon_unload)
	&& "undefined" == typeof(FixscrollControl.fixscroll_hack_browserOn)
	&& "undefined" == typeof(FixscrollControl.fixscroll_hack_browserOff)
	&& "undefined" == typeof(FixscrollControl.lazyResize)
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

	FixscrollControl._org_HUDConsoleUI_toggleHUD = HUDConsoleUI.toggleHUD;//for Webconsole
	HUDConsoleUI.toggleHUD = function(){
		if ("undefined" == typeof(FixscrollControl) ) return;
		var result = FixscrollControl._org_HUDConsoleUI_toggleHUD.apply(HUDConsoleUI, arguments);
		try { FixscrollControl.onResize(); }catch (ex){}
			var linkedBrowser = gBrowser.selectedTab.linkedBrowser;
			var tabId = gBrowser.getNotificationBox(linkedBrowser).getAttribute("id");
			var hudId = "hud_" + tabId;
			var ownerDocument = gBrowser.selectedTab.ownerDocument;
			var hud = ownerDocument.getElementById(hudId);
			if (hud) {
				var hudSplitter = hud.nextSibling;
				if(hudSplitter){//I wonder why hud can't listen resize event. This way is too bad.
					hudSplitter.addEventListener("command", function(){FixscrollControl.onResize();} ,false);
				}
				hud.addEventListener("transitionend", function(){FixscrollControl.onResize();} ,false); //copy from HUDService.jsm
			}
		return result;
	};
	
	this.fixscroll_addon_load();
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

	FullScreen.toggleHUD = FixscrollControl._org_HUDConsoleUI_toggleHUD;//for Webconsole
	FixscrollControl._org_HUDConsoleUI_toggleHUD = null;
	//remove event
	var tabs = gBrowser.tabContainer.childNodes;
	for(var i=0; i< tabs.length;i++){
		var xulDocument = tabs[i].ownerDocument;
		var notificationBox = document.getElementById(tabs[i].linkedPanel);
		var hudId = "hud_" + notificationBox.getAttribute("id");
		var hud = xulDocument.getElementById(hudId);
		if (hud) {
			var hudSplitter = hud.nextSibling;
			if(hudSplitter){
				hudSplitter.removeEventListener("command", function(){FixscrollControl.onResize();} ,false);
			}
			hud.removeEventListener("transitionend", function(){FixscrollControl.onResize();} ,false);
		}
	}

	this.fixscroll_addon_unload();
}

FixscrollControl.fixscroll_addon_load = function() {
	var fbMainFrame = document.getElementById("fbMainFrame"); // for firebug
	if(fbMainFrame){
		fbMainFrame.addEventListener("resize", function(){FixscrollControl.onResize();} ,false);
	}
	
	if("undefined" != typeof(Firebug) && Firebug.closeFirebug){//for firebug
		FixscrollControl._org_Firebug_closeFirebug = Firebug.closeFirebug;
		Firebug.closeFirebug = function(){
			var result = FixscrollControl._org_Firebug_closeFirebug.apply(Firebug, arguments);
			try { FixscrollControl.onResize(); }catch (ex){}
			return result;
		};
	}

	var abpSidebar = document.getElementById("abp-sidebar"); // for addblock-plus
	if(abpSidebar){
		abpSidebar.addEventListener("resize", function(){FixscrollControl.onResize();} ,false);
	}
	
	var abpCommand = parent.document.getElementById("abp-command-sidebar");//for addblock-plus
	if(abpCommand){
		//abp add event to command in jsm. And this eventlister call earlier than adp.
		abpCommand.addEventListener("command", function(){FixscrollControl.lazyResize();}, false);
	}
}

//lazy call resize 
FixscrollControl.lazyResize = function() {
	var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
	timer.initWithCallback(function(){
			FixscrollControl.onResize();
		}, 0, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
}

FixscrollControl.fixscroll_addon_unload = function() {

	var fbMainFrame = document.getElementById("fbMainFrame"); // for firebug
	if(fbMainFrame){
		fbMainFrame.removeEventListener("resize" ,function(){FixscrollControl.onResize();} ,false);
	}

	if(FixscrollControl._org_Firebug_closeFirebug){//for firebug
		Firebug.closeFirebug = FixscrollControl._org_Firebug_closeFirebug;
		FixscrollControl._org_Firebug_closeFirebug = null;
	}

	var abpSidebar = document.getElementById("abp-sidebar"); // for addblock-plus
	if(abpSidebar){
		abpSidebar.removeEventListener("resize", function(){FixscrollControl.onResize();} ,false);
	}
	
	var abpCommand = parent.document.getElementById("abp-command-sidebar");//for addblock-plus
	if(abpCommand){
		abpCommand.removeEventListener("command", function(){FixscrollControl.lazyResize();}, false);
	}
}

FixscrollControl.fixscroll_hack_browserOn = function(browser) {
	// scroll MODE fix (findbar depend on "Find To Center" addon)
	if(!browser.contentWindow.scrollToOrg){
		browser.contentWindow.scrollToOrg = browser.contentWindow.scrollTo;
		browser.contentWindow.scrollTo = 
			function(x, y){
				var tab = gBrowser.selectedTab;
				if(tab.isFixscroll && tab.fixscroll){
					FixscrollControl.scrollBox.scrollLeft = this.horizonPosition;
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