const fxslVERSION = "0.1";

const fxslPref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch(null);;

var FixscrollData = function(){
	this.fixPosition = 0;
	this.slidePosition = 0;
	this.isBrowserOver = true;//false;//
	this.horizonPosition= 0;
	this._innerWidth= 0;
	this._innerHeight= 0;
};

FixscrollControl = {
	SCROLL_WIDTH : 17,
	DEFAULT_COLOR : "rgb(255,255,255)",
	duplicateHeight : 20,

	////////////////////////////////////////////////////////////////////////////////////
	//load method
	////////////////////////////////////////////////////////////////////////////////////
	onLoad: function() {
		// first loading
		var version = null;
		try{ version = fxslPref.getCharPref("extensions.fixscroll.version");}catch(e){}
		if (!version){
			//first loading
			window.openDialog("chrome://fixscroll/content/intro.xul", "fixscrollIntro", "chrome=yes,dialog=yes,resizable=yes");
			fxslPref.setCharPref("extensions.fixscroll.version", fxslVERSION);
		}

		var container = gBrowser.tabContainer;
		container.addEventListener("TabSelect", FixscrollControl.onTabSelected, false);
		
		var sidebarBox = document.getElementById("sidebar-box");
		sidebarBox.addEventListener("resize" ,FixscrollControl.onResize ,true);

		//bottombox
		window.addEventListener("findbaropen" ,FixscrollControl.onResize ,false);

		//pref
		fxslPref.QueryInterface(Ci.nsIPrefBranch2);
		fxslPref.addObserver("extensions.fixscroll.defaultOn", this, false);
		fxslPref.QueryInterface(Ci.nsIPrefBranch);
		
		this.fixscroll_hack_load();
		
		this.initElement();
		
		if(fxslPref.getBoolPref("extensions.fixscroll.defaultOn")){
			//go ON start TAB
			var tab = gBrowser.selectedTab;
			tab.isFixscroll = true;
			tab.fixscroll = new FixscrollData();
			
			this.start();
		}else{
			var cu = document.getElementById("fixscroll-toolbar-button");
			cu.setAttribute("fixscrollOn", false);
		}
	},
	
	onUnload: function(){
		var container = gBrowser.tabContainer;
		container.removeEventListener("TabSelect", FixscrollControl.onTabSelected, false);

		var sidebarBox = document.getElementById("sidebar-splitter");
		sidebarBox.removeEventListener("resize" ,FixscrollControl.onResize ,true);

		window.removeEventListener("findbaropen",FixscrollControl.onResize ,false);

		fxslPref.removeObserver("extensions.fixscroll.defaultOn", this);

		this.fixscroll_hack_unload();
	},
	
	initElement: function(){
		//Application.console.log("initElement");
		
		var fontsize = this.fontsize;
		
		//scroll vertical
		this.scrollV = document.createElement("scrollbar");
		this.scrollV.id = "fxsl.scrollbarV";
		this.scrollV.orient = "vertical";
		this.scrollV.setAttribute("increment", fontsize);
		
		//scroll horizontal
		this.scrollH = document.createElement("scrollbar");
		this.scrollH.id = "fxsl.scrollbarH";
		this.scrollH.orient = "horizontal";
		this.scrollH.setAttribute("increment", fontsize);
		this.scrollH.setAttribute("curpos", 0);
		
		//canvas
		//canvasの追加(canvasをそのままappendchildすると拡大されてしまう。
		this.canvasBox = document.createElement("box");
		this.canvasBox.id = "fxsl.canvasBox";

		this.canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "html:canvas");
		this.canvas.id = "fxsl.canvas";
		this.canvas.height = 1;
		this.canvasBox.appendChild(this.canvas);
		
		//border
		this.border = document.createElement("box");
		this.border.id = "fxsl.border";
		this.border.top = 0;
		this.border.left = 0;
		this.border.height = 2;
		this.border.width = innerWidth;
		this.border.style.backgroundColor = "blue";
		this.border.style.opacity = 0.5;
		
		//duplicateArea
		this.dBox = document.createElement("box");
		this.dBox.id = "fxsl.duplicateArea";
		this.dBox.top = 0;
		this.dBox.left = 0;
		this.dBox.height = this.duplicateHeight;
		this.dBox.width = innerWidth;
		this.dBox.style.backgroundColor = "gray";
		this.dBox.style.opacity = 0.5;
	},
	
	////////////////////////////////////////////////////////////////////////////////////
	//listener method ( for tabbrowser)
	////////////////////////////////////////////////////////////////////////////////////
	observe: function(aSubject, aTopic, aData){
		if ("nsPref:changed" != aTopic) return;
		
		var defaultOn = fxslPref.getBoolPref("extensions.fixscroll.defaultOn");
		//Application.console.log("updateMode:" + defaultOn);
		
		//update selected
		var tab = gBrowser.selectedTab;
		if(defaultOn){
			//go ON
			if(!tab.fixscroll){
				tab.fixscroll = new FixscrollData();
				this.start();
			}
		}else{
			//go OFF
			if(tab.fixscroll){
				this.stop();
				tab.fixscroll = null;
			}
		}
		
		//update all flag
		var tabs = gBrowser.tabContainer.childNodes;
		for(var i=0; i< tabs.length;i++){
			tabs[i].isFixscroll = defaultOn;
		}

		var cu = document.getElementById("fixscroll-toolbar-button");
		cu.setAttribute("fixscrollOn",defaultOn);
	},

	onToolbarButtonCommand: function(e) {
		var tab = gBrowser.selectedTab;
		//Application.console.log("onToolbarButtonCommand:" + tab.isFixscroll);

		if(tab.isFixscroll){
			//go OFF
			tab.isFixscroll = false;
			if(tab.fixscroll){
				this.stop();
				tab.fixscroll = null;
			}
			
			//toolbar-button OFF
			var cu = document.getElementById("fixscroll-toolbar-button");
			cu.setAttribute("fixscrollOn",false);
		}else{
			//go ON
			tab.isFixscroll = true;
			
			//オブジェクトの追加
			tab.fixscroll = new FixscrollData();
			//Application.console.log("fixPosition1: " + box.fixscroll.fixPosition);
			this.start();
			
			//toolbar-button ON
			var cu = document.getElementById("fixscroll-toolbar-button");
			cu.setAttribute("fixscrollOn",true);
		}
	},

	onTabSelected: function(e){
		var tab = gBrowser.selectedTab;
		//Application.console.log("onTabSelected:" + tab.isFixscroll + ", " + tab.fixscroll + "," + tab.linkedPanel + "," + tab.tabIndex );

		//no setting -> use default value
		if(tab.isFixscroll == undefined){
			var defaultOn = fxslPref.getBoolPref("extensions.fixscroll.defaultOn");
			tab.isFixscroll = defaultOn;
		}
		
		if(tab.isFixscroll && !tab.fixscroll){
			//defaultOn == true and show not yet
			//Application.console.log("onTabSelected@ onLoad");
			tab.fixscroll = new FixscrollData();
			FixscrollControl.start();
		}else if(!tab.isFixscroll){
			//defaultOn == false
			//Application.console.log("onTabSelected@ onUnLoad" + box.fixscroll);
			if(tab.fixscroll){
				FixscrollControl.stop();
				tab.fixscroll = null;
			}
		}else{
			//Application.console.log("onTabSelected@ resize");
			FixscrollControl.onResize();
		}

		//toolbar-button 
		var cu = document.getElementById("fixscroll-toolbar-button");
		cu.setAttribute("fixscrollOn",tab.isFixscroll);
	},
	
	////////////////////////////////////////////////////////////////////////////////////
	//fixscroll ON/OFF method
	////////////////////////////////////////////////////////////////////////////////////
	start: function() {
		//Application.console.log("start:" + gBrowser.selectedTab.linkedPanel);

		var stack = this.notificationBox.childNodes[0];
		var browser = this.browser;

		var stackBox = document.getBoxObjectFor(stack);
		var innerHeight = stackBox.height - this.SCROLL_WIDTH;
		var innerWidth = stackBox.width - this.SCROLL_WIDTH;

		browser.style.overflow = "hidden";
		
		// keep position(OFF -> ON)1. This should be before drawing.
		this.fixPosition = browser.contentWindow.scrollY;
		this.horizonPosition= browser.contentWindow.scrollX;
		
		this.init(innerWidth, innerHeight);
		
		// keep position(OFF -> ON)2. This should be after define scroll length.
		this.scrollV.setAttribute("curpos", this.fixPosition);
		this.scrollH.setAttribute("curpos", this.horizonPosition);
		
		//listener. After init.
		window.addEventListener('resize', this, true);
		browser.addEventListener("pageshow", this, true);
	},
	
	stop: function() {
		//Application.console.log("stop:" + gBrowser.selectedTab.linkedPanel);

		var stack = this.notificationBox.childNodes[0];
		var browser = this.browser;

		//listener revert
		this.scrollV.removeEventListener('DOMAttrModified', this, true);
		this.scrollH.removeEventListener('DOMAttrModified', this, true);
		this.canvas.removeEventListener("mousemove", this, true);
		this.canvas.removeEventListener("mouseover", this, true);
		this.dBox.removeEventListener("mousemove", this, true);

		stack.removeEventListener('DOMMouseScroll', this, true);
		window.removeEventListener('resize', this, true);
		browser.removeEventListener("pageshow", this, true);

		//addlister by init();
		browser.contentDocument.documentElement.removeEventListener('DOMMouseScroll', this, false);
		browser.contentDocument.documentElement.removeEventListener('keydown', this, false);

		//element revert
		browser.style.overflow = null;
		browser.top = null;
		browser.left = null;
		browser.height = null;
		browser.width = null;

		try{//if stack do not contain, error occur.
			stack.removeChild(this.scrollV);
			stack.removeChild(this.scrollH);
			stack.removeChild(this.canvasBox);
			stack.removeChild(this.border);
			stack.removeChild(this.dBox);
		}catch(e){}
		
		this.fixscroll_hack_browserOff();
		
		//keep position(ON -> OFF)
		browser.contentWindow.scrollTo(this.horizonPosition, this.fixPosition + this.slidePosition);
	},

	seiriPrev: function(){
		//Application.console.log("seiriPrev:")
		this.scrollV.removeEventListener('DOMAttrModified', this, true);
		this.scrollH.removeEventListener('DOMAttrModified', this, true);
		this.canvas.removeEventListener("mousemove", this, true);
		this.canvas.removeEventListener("mouseover", this, true);
		this.dBox.removeEventListener("mousemove", this, true);

		var stack = this.notificationBox.childNodes[0];
		//stack.removeEventListener('DOMMouseScroll', this, true);
		
		stack.appendChild(this.scrollV);
		stack.appendChild(this.scrollH);
		stack.appendChild(this.canvasBox);
		stack.appendChild(this.border);
		stack.appendChild(this.dBox);
	},
	
	seiriLast: function(){
		//Application.console.log("seiriLast:")
		this.scrollV.addEventListener('DOMAttrModified', this, true);
		this.scrollH.addEventListener('DOMAttrModified', this, true);
		this.canvas.addEventListener("mousemove", this, true);
		this.canvas.addEventListener("mouseover", this, true);
		this.dBox.addEventListener("mousemove", this, true);
		
		var stack = this.notificationBox.childNodes[0];
		stack.addEventListener('DOMMouseScroll', this, true);
	},

	init: function(width, height){
		this.seiriPrev();
		this._innerWidth = width;
		this._innerHeight = height;
		
		this.duplicateHeight = this.getDuplicateHeight();
		
		var browser = this.browser;
		var scale = this.scale;
		//Application.console.log("init:" + width + "," + height + "," + "," + browser.contentTitle);
		
		browser.top = 0;
		browser.left = 0;
		browser.height = height;
		browser.width = width;
		
		var maxWidth = browser.contentWindow.scrollMaxX;
		var maxHeight = (browser.contentWindow.scrollMaxY == 0 ? 0 : this.maxHeight);
		this.scrollH.hidden = (maxWidth <= 0);
		this.scrollV.hidden = (maxHeight <= 0);
		if(this.scrollV.hidden){
			this.border.hidden = true;
			this.dBox.hidden = true;
			this.duplicateHeight = 0;
		}
		
		var relationalWidth = width + (this.scrollV.hidden ? this.SCROLL_WIDTH : 0);
		var relationalHeight = height + (this.scrollH.hidden ? this.SCROLL_WIDTH : 0);
		//rewrite
		browser.height = relationalHeight;
		browser.width = relationalWidth;
		
		this.canvasBox.top = 0;
		this.canvasBox.left = 0;
		this.canvasBox.height = 1;
		this.canvasBox.width = relationalWidth;
		this.canvas.width = relationalWidth;
		
		this.border.width = relationalWidth;
		
		//horizontal scrollbar update
		this.scrollH.top = height;
		this.scrollH.left = 0;
		this.scrollH.width = relationalWidth;

		this.scrollH.setAttribute("maxpos", maxWidth);
		this.scrollH.setAttribute("pageincrement", width - this.fontsize);
		
		//vertical scrollbar update
		this.scrollV.top = 0;
		this.scrollV.left = width;
		this.scrollV.height = relationalHeight;
		
		this.scrollV.setAttribute("maxpos", maxHeight);
		this.scrollV.setAttribute("pageincrement", this.pageHeight);
		this.scrollV.height = relationalHeight;
		
		this.dBox.top = height + (this.scrollH.hidden ? this.SCROLL_WIDTH : 0 ) - this.duplicateHeight;
		this.dBox.height = this.duplicateHeight;
		this.dBox.width = relationalWidth;

		//dump
		//Application.console.log("last_max" + maxHeight + ",height" + height + ", browser.contentWindow.scrollMaxY" + browser.contentWindow.scrollMaxY + ",browser.height" + browser.height);

		//this lister will vanish when url changes.
		browser.contentDocument.documentElement.addEventListener('DOMMouseScroll', this, false);
		browser.contentDocument.documentElement.addEventListener('keydown', this, false);

		this.fixscroll_hack_browserOn(browser);

		//スクロールがない場合は全面browserにする。
		if( this.scrollV.hidden ){
			this.isBrowserOver = true;
		}
		this.displayBrowser();
		
		this.seiriLast();
	},
	
	////////////////////////////////////////////////////////////////////////////////////
	//listener method(for fixscroll)
	////////////////////////////////////////////////////////////////////////////////////
	handleEvent :function(aEvent) {
		//Application.console.log(aEvent.type);
		switch (aEvent.type)
		{
			case 'DOMAttrModified':
				if(aEvent.attrName != "curpos") return;
				
				if(aEvent.currentTarget.getAttribute("orient") == "vertical"){
					this.scrollBy(parseInt(this.scrollV.getAttribute("curpos")) - this.fixPosition - this.slidePosition);
				}else{
					var nextHorizonPosition = parseInt(this.scrollH.getAttribute("curpos"));
					if( this.horizonPosition != nextHorizonPosition){
						this.horizonPosition = nextHorizonPosition;
						this.displayBrowser();
					}
				}
				return;
			case 'DOMMouseScroll':
				//Application.console.log("c:" + aEvent.currentTarget + ", t:" + aEvent.target + ", o:" + aEvent.originalTarget + ", " + aEvent.originalTarget.nodeName.toLowerCase() + ":"+ aEvent.detail );
				if(aEvent.ctrlKey && fxslPref.getIntPref("mousewheel.withcontrolkey.action") == 3 ){
					//zoom
					return ;
				}
				
				if(!this.isFixscrollable(aEvent)) return;
				
				var scale = this.scale;
				var move = parseInt(aEvent.detail) * this.fontsize * scale;

				this.scrollBy(parseInt(move), aEvent.altKey);
				aEvent.preventDefault();
				aEvent.stopPropagation();
				return;
			case 'keydown':
				this.onKeydown(aEvent);
				return;
			case 'mousemove':
				if(aEvent.target.id == this.canvas.id){
					if(!this.scrollV.hidden){
						this.isBrowserOver = !this.isBrowserOver;
						this.displayBrowser();
					}
				}else if(aEvent.target.id == this.dBox.id){
					this.dBox.hidden = true;
				}
				return;
			case 'mouseover':
				if(aEvent.target.id == this.canvas.id){
					if(!this.scrollV.hidden){
						this.isBrowserOver = !this.isBrowserOver;
						this.displayBrowser();
					}
				}
				return;
			case 'resize':
				//Application.console.log("resize" + aEvent.currentTarget + "," + aEvent.explicitOriginalTarget + "," +aEvent.originalTarget + "," + aEvent.target  );
				if( aEvent.target == aEvent.currentTarget ){
					this.onResize();
				}
				return;
			case 'pageshow':
				this.fixPosition = 0;
				this.slidePosition = 0;
				this.horizonPosition = 0;
				this.scrollV.setAttribute("curpos", 0);
				this.scrollH.setAttribute("curpos", 0);
				this.init(this._innerWidth, this._innerHeight);
				return;
		}
	},
	
	onKeydown: function(aEvent){
		var ot = aEvent.explicitOriginalTarget;
		if (ot.nodeName.toLowerCase()=="input" || ot.nodeName.toLowerCase()=="select" || 
			ot.nodeName.toLowerCase()=="option" || ot.nodeName.toLowerCase()=="textarea") {
			return;
		}
		//FIXME: Here want to avoid scrollable div, but keyEvent don't return selected target.
		/*
		if(!this.isFixscrollable(aEvent)){
			return;
		}
		*/
		switch (aEvent.keyCode){
			case KeyEvent.DOM_VK_DOWN:
				this.scrollBy(this.cursorValue, aEvent.altKey);
				break;
			case KeyEvent.DOM_VK_UP:
				this.scrollBy(-this.cursorValue, aEvent.altKey);
				break;
			case KeyEvent.DOM_VK_SPACE:
			case KeyEvent.DOM_VK_PAGE_DOWN:
				if(aEvent.ctrlKey){return;}//emulate default action
				this.scrollBy(this.pageValue, aEvent.altKey);
				break;
			case KeyEvent.DOM_VK_PAGE_UP:
				if(aEvent.ctrlKey){return;}//emulate default action
				this.scrollBy(-this.pageValue, aEvent.altKey);
				break;
			case KeyEvent.DOM_VK_HOME:
				this.scrollBy(-1000000, aEvent.altKey);
				break;
			case KeyEvent.DOM_VK_END:
				this.scrollBy(1000000, aEvent.altKey);
				break;
			case KeyEvent.DOM_VK_LEFT:
				if(aEvent.ctrlKey){return;}//emulate default action
				var nextHorizonPosition = parseInt(this.scrollH.getAttribute("curpos")) - this.fontsize;
				this.scrollH.setAttribute("curpos", 
					this.minMax(nextHorizonPosition, 0, parseInt(this.scrollH.getAttribute("maxpos")) )
					);
				break;
			case KeyEvent.DOM_VK_RIGHT:
				if(aEvent.ctrlKey){return;}//emulate default action
				var nextHorizonPosition = parseInt(this.scrollH.getAttribute("curpos")) + this.fontsize;
				this.scrollH.setAttribute("curpos", 
					this.minMax(nextHorizonPosition, 0, parseInt(this.scrollH.getAttribute("maxpos")) )
					);
				break;
			default:
				return;
		}
		aEvent.preventDefault();
		aEvent.stopPropagation();
	},
	
	onResize: function(){
		var tab = gBrowser.selectedTab;
		if(! (tab.isFixscroll && tab.fixscroll) ) return;

		var stack = FixscrollControl.notificationBox.childNodes[0];
		
		//accept small resize
		FixscrollControl.canvasBox.hidden = true;
		FixscrollControl.canvas.hidden = true;
		FixscrollControl.scrollV.hidden = true;
		FixscrollControl.scrollH.hidden = true;
		FixscrollControl.border.hidden = true;
		FixscrollControl.dBox.hidden = true;
		FixscrollControl.browser.hidden = true;
		
		var stackBox = document.getBoxObjectFor(stack);
		var innerHeight = stackBox.height - FixscrollControl.SCROLL_WIDTH;
		var innerWidth = stackBox.width - FixscrollControl.SCROLL_WIDTH;

		//revert
		FixscrollControl.canvasBox.hidden = null;
		FixscrollControl.canvas.hidden = null;
		FixscrollControl.scrollV.hidden = null;
		FixscrollControl.scrollH.hidden = null;
		FixscrollControl.border.hidden = null;
		FixscrollControl.dBox.hidden = null;
		FixscrollControl.browser.hidden = null;

		FixscrollControl.init(innerWidth, innerHeight);
	},
	
	////////////////////////////////////////////////////////////////////////////////////
	//scroll method
	////////////////////////////////////////////////////////////////////////////////////
	scrollBy: function(length, altKey){
		var maxpos = parseInt(this.scrollV.getAttribute("maxpos"));
		var nextSlidePosition = this.slidePosition;
		var nextFixPosition = this.fixPosition;
		var windowHeight = this.getWindowHeight();

		//TODO: 処理が重くならないように工夫したい。
		var browser = this.browser;
		var maxHeight = this.maxHeight;
		maxHeight = (browser.contentWindow.scrollMaxY == 0 ? 0 : maxHeight);
		if( !this.scrollV.hidden && maxHeight && maxpos != maxHeight ){
			this.scrollV.setAttribute("maxpos", maxHeight);
			maxpos = maxHeight;
		}
		
		//Mode slidescroll
		if(altKey){
			nextSlidePosition += length;
			nextSlidePosition = Math.min( nextSlidePosition, maxpos - nextFixPosition );
			nextSlidePosition = Math.max( nextSlidePosition, - nextFixPosition );
			
			//trade fix<->slide. abs(slidePosition) < windowHeight
			if(nextSlidePosition >= windowHeight ){
				nextFixPosition += windowHeight;
				nextSlidePosition -= windowHeight;
			}else if(nextSlidePosition <= -windowHeight ){
				nextFixPosition -= windowHeight;
				nextSlidePosition += windowHeight;
			}
		}else{
			//Mode fixscroll
			nextFixPosition += length;
			nextFixPosition = Math.min( nextFixPosition, maxpos - nextSlidePosition );
			nextFixPosition = Math.max( nextFixPosition, - nextSlidePosition );
		}

		//trade fix<->slide 
		if(nextFixPosition < 0){
			nextFixPosition += windowHeight;
			nextSlidePosition -= windowHeight;
		}
		
		//is changed?
		if( nextFixPosition != this.fixPosition || nextSlidePosition != this.slidePosition ){
			this.scrollV.setAttribute("curpos", nextFixPosition + nextSlidePosition);
			this.fixPosition = nextFixPosition;
			this.slidePosition = nextSlidePosition;
			this.displayBrowser();
		}
		this.border.hidden = this.scrollV.hidden;
		this.dBox.hidden = this.scrollV.hidden;
	},
	
	displayBrowser: function(){
		//TODO: temporary avoid error.
		if(!this.browser.contentWindow.scrollToOrg) return;
		
		if(this.isBrowserOver){
			this.fixScrollBrowserOver();
		}else{
			this.fixScrollBrowserUnder();
		}
	},
	
	// scroll over:browser, under:canvas
	fixScrollBrowserOver: function(){
		//Application.console.log("fixScrollBrowserOver");
		var browser = this.browser;

		var scale = this.scale;
		var currentPosition = this.fixPosition;
		var windowHeight = this.getWindowHeight();
		
		//control height
		this.setBrowserHeight( this.scrollV.hidden ? windowHeight : currentPosition % windowHeight );
		this.canvas.height= windowHeight - browser.height + this.duplicateHeight;
		this.canvasBox.height = this.canvas.height;
		//Application.console.log("windowHeight: " + windowHeight + ", browser.height:" + browser.height + ",this.canvas.height: " + this.canvas.height);

		//control position
		browser.top = 0;
		this.canvasBox.top = browser.height;
		this.border.top = browser.height;

		//control scroll position
		var overPosition = Math.ceil(currentPosition / windowHeight) * Math.round(windowHeight/scale) + this.slidePosition/scale;
		var underPosition = (currentPosition + this.slidePosition)/scale;

		browser.contentWindow.scrollToOrg(this.horizonPosition/scale,overPosition);
		var ctx = this.canvas.getContext("2d");
		ctx.scale(scale,scale);
		ctx.drawWindow(browser.contentWindow, this.horizonPosition/scale, underPosition , this._innerWidth / scale, (this._innerHeight + this.duplicateHeight) / scale, this.DEFAULT_COLOR);

		//Application.console.log("overPosition:" + overPosition + ", scale:" + scale +", waru:" + overPosition / scale);
	},

	// scroll over:canvas, under:browser
	fixScrollBrowserUnder: function(){
		//Application.console.log("fixScrollBrowserUnder" + this.fixPosition);
		var browser = this.browser;

		var currentPosition = this.fixPosition;
		var windowHeight = this.getWindowHeight();
		
		//control height
		this.canvas.height = Math.max(1, currentPosition % windowHeight); //canvas min size = 1;
		this.canvasBox.height = this.canvas.height;

		var maxpos = parseInt(this.scrollV.getAttribute("maxpos"));
		var spaceHeight = Math.max(0, windowHeight + this.duplicateHeight - this.canvas.height - ( maxpos + windowHeight - currentPosition - this.slidePosition ) + 1 );//adjust canvas height

		this.setBrowserHeight( windowHeight - this.canvas.height + this.duplicateHeight - spaceHeight );
		//Application.console.log("windowHeight: " + windowHeight + ", browser.height:" + browser.height + ",this.canvas.height: " + this.canvas.height);

		//control position
		this.canvasBox.top = 0;
		browser.top = this.canvas.height;
		this.border.top = currentPosition % windowHeight;

		//control scroll position ( This must be after control height in browser. )
		var overPosition = Math.ceil(currentPosition / windowHeight) * windowHeight + this.slidePosition;
		var underPosition = currentPosition + this.slidePosition + (currentPosition % windowHeight == 0 ? 1 : 0);

		var ctx = this.canvas.getContext("2d");
		var scale = this.scale;
		ctx.scale(scale,scale);
		ctx.drawWindow(browser.contentWindow, this.horizonPosition/scale, overPosition / scale, this._innerWidth / scale, (this._innerHeight>0 ? this._innerHeight : 0)  / scale, this.DEFAULT_COLOR);
		
		browser.contentWindow.scrollToOrg(this.horizonPosition/scale,underPosition / scale);
	},
	
	////////////////////////////////////////////////////////////////////////////////////
	//util method
	////////////////////////////////////////////////////////////////////////////////////
	getWindowHeight: function(){
		return this._innerHeight - this.duplicateHeight + (this.scrollH.hidden ? this.SCROLL_WIDTH : 0);
	},

	setBrowserHeight: function(_height){
		var browser = this.browser;
		//browser can change only after set null
		browser.left = null;
		browser.left = 0;
		browser.height= _height;
	},
	
	get scale(){
		var winUtils = window.content.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils);
		return winUtils.screenPixelsPerCSSPixel;
	},
	
	get fontsize(){
		var language = fxslPref.getCharPref("general.useragent.locale");
		try{
			return fxslPref.getIntPref("font.size.variable." + language);
		}catch(e){}
		//FIX ME. load default font size
		return 16;
	},
	
	get pageHeight(){
		return this._innerHeight - this.fontsize - this.duplicateHeight;
	},
	
	get maxHeight(){
		var maxHeight = this.browser.contentWindow.scrollMaxY * this.scale - parseInt(this._innerHeight) + parseInt(this.browser.height) + this.duplicateHeight - (this.scrollH.hidden ? this.SCROLL_WIDTH : 0);
		//Application.console.log("this.browser.contentWindow.scrollMaxY:" + this.browser.contentWindow.scrollMaxY);
		if(maxHeight){
			return maxHeight;
		}else if(this.scrollV && this.scrollV.getAttribute("maxpos")){
			return this.scrollV.getAttribute("maxpos");
		}else{
			return 0;
		}
	},
	
	get cursorValue(){
		var cursor = fxslPref.getIntPref("extensions.fixscroll.kb.cursor");
		if(cursor == 0){
			return this.fontsize;
		}
		return cursor;
	},
	
	get pageValue(){
		var page = fxslPref.getIntPref("extensions.fixscroll.kb.pageUpDown");
		if(page == 0){
			return this.pageHeight/2;
		}
		return page;
	},
	getDuplicateHeight: function(){
		return fxslPref.getIntPref("extensions.fixscroll.duplicateHeight");
	},
	isFixscrollable: function(aEvent){
		//Application.console.log("c:" + aEvent.currentTarget + ", t:" + aEvent.target + ", o:" + aEvent.originalTarget + ", " + aEvent.originalTarget.nodeName.toLowerCase() );
		var isXUL = aEvent.originalTarget.nodeName.toLowerCase() == "html:canvas" 
					|| aEvent.originalTarget.nodeName.toLowerCase() == "box";
		if(isXUL) return true;

		var node = this.findNodeToScroll(aEvent.originalTarget);
		if( node 
			&& (node.tagName.toLowerCase() == "body" || node.tagName.toLowerCase() == "html") ){
			return true;
		}
		return false;
	},
	get browser(){
		return gBrowser.selectedTab.linkedBrowser;
	},
	get notificationBox(){
		return document.getElementById(gBrowser.selectedTab.linkedPanel);
	},
	
	minMax: function( input ,minLimit, maxLimit){
		if( input < minLimit ) return minLimit;
		if( input > maxLimit ) return maxLimit;
		return input;
	},
	
	//data
	get fixPosition(){return gBrowser.selectedTab.fixscroll.fixPosition;},
	get slidePosition(){return gBrowser.selectedTab.fixscroll.slidePosition;},
	get isBrowserOver(){return gBrowser.selectedTab.fixscroll.isBrowserOver;},
	get horizonPosition(){return gBrowser.selectedTab.fixscroll.horizonPosition;},
	get _innerWidth(){return gBrowser.selectedTab.fixscroll._innerWidth;},
	get _innerHeight(){return gBrowser.selectedTab.fixscroll._innerHeight;},
	
	set fixPosition(i){gBrowser.selectedTab.fixscroll.fixPosition = i;},
	set slidePosition(i){gBrowser.selectedTab.fixscroll.slidePosition = i;},
	set isBrowserOver(i){gBrowser.selectedTab.fixscroll.isBrowserOver = i;},
	set horizonPosition(i){gBrowser.selectedTab.fixscroll.horizonPosition = i;},
	set _innerWidth(i){gBrowser.selectedTab.fixscroll._innerWidth = i;},
	set _innerHeight(i){gBrowser.selectedTab.fixscroll._innerHeight = i;},
};

//現時点では不要だが、タブでアドオン設定する方法以外にもでてくるかもしれないので、残しておく。
/*
var fixscrollPrefObserver =
{
  register: function()
  {
    this._branch = fxslPref.getBranch("extensions.fixscroll.");
    this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
    this._branch.addObserver("", this, false);
  },

  unregister: function()
  {
    if(!this._branch) return;
    this._branch.removeObserver("", this);
  },

  observe: function(aSubject, aTopic, aData)
  {
    if(aTopic != "nsPref:changed") return;
    switch (aData) {
      case "duplicateHeight":
        Application.console.log("duplicateHeight");
        fxslLoader.resize();
        break;
    }
  }
}
fixscrollPrefObserver.register();
*/

// The following is modified from Marc Boullet's All-in-one Gestures extension
FixscrollControl.findNodeToScroll = function (initialNode){
	function getStyle(elem, aProp) {
		var p = elem.ownerDocument.defaultView.getComputedStyle(elem, "").getPropertyValue(aProp);
		var val = parseFloat(p);
		if (!isNaN(val)) return Math.ceil(val);
		if (p == "thin") return 1;
		if (p == "medium") return 3;
		if (p == "thick") return 5;
		return 0;
	}

	function scrollCursorType(neededW, availW, neededH, availH, scrollBarSize) {
		if (neededW <= availW && neededH <= availH) return 3;
		if (neededW > availW && neededH > availH) return 0;
		if (neededW > availW) return ((neededH <= (availH - scrollBarSize)) - 0) << 1;  // 0 or 2
		return (neededW <= (availW - scrollBarSize)) - 0;
	}
  
	const defaultScrollBarSize = 16;
	const twiceScrollBarSize = defaultScrollBarSize * 2;
	var realWidth, realHeight, nextNode, currNode, scrollType;
	var targetDoc = initialNode.ownerDocument;
	var docEl = targetDoc.documentElement;
	var insertionNode = (docEl) ? docEl : targetDoc;
	var clientFrame = targetDoc.defaultView;
	if (docEl && docEl.nodeName.toLowerCase() == "html") { // walk the tree up looking for something to scroll
		if (clientFrame.frameElement) return null;
		var bodies = docEl.getElementsByTagName("body");
		if (!bodies || !bodies.length) 
			return null;
		var bodyEl = bodies[0];
		if (initialNode == docEl) nextNode = bodyEl;
		else if (initialNode.nodeName.toLowerCase() == "select") nextNode = initialNode.parentNode;
		else nextNode = initialNode;
		do {
			try {
				currNode = nextNode;
				// note: we ignore DIVs etc with "visible" overflow but allow it for body and html elements, 
				// which get scrollbars automatically in frames or from the browser.
				if (currNode.clientWidth && currNode.clientHeight &&  
						(currNode.ownerDocument.defaultView.getComputedStyle(currNode, "").getPropertyValue("overflow") != "hidden") &&
						(currNode.nodeName.toLowerCase()=="html" || currNode.nodeName.toLowerCase()=="body" || currNode.ownerDocument.defaultView.getComputedStyle(currNode, "").getPropertyValue("overflow") != "visible")) {
					realWidth = currNode.clientWidth + getStyle(currNode, "border-left-width") + getStyle(currNode, "border-right-width");
					realHeight = currNode.clientHeight + getStyle(currNode, "border-top-width") + getStyle(currNode, "border-bottom-width");
					scrollType = scrollCursorType(currNode.scrollWidth, realWidth, currNode.scrollHeight, realHeight, 0);
					if (scrollType != 3) {
						if (scrollType==0 || scrollType==1){
							return currNode;
						}
						if (scrollType==0 || scrollType==2){
							return null;
						}
					}
				}
				nextNode = currNode.parentNode;
			}
			catch(err) {
				return null;
			}
		} while (nextNode && currNode != docEl);
	}
	else { // XML document; TODO:if someone need.
	}
	return null;
}
// End AiOG

window.addEventListener("load", function () { FixscrollControl.onLoad(); }, false);
window.addEventListener("unload", function () { FixscrollControl.onUnload(); }, false);

