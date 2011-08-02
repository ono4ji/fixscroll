//for test
var fsxlScrollFlg = false;

FixscrollControl.test = function(){
	Application.console.log("test start");
	this.scrollEventOff();
	return;
	//var contextMenu = document.getElementById("contentAreaContextMenu");
	//contextMenu.openPopup(gBrowser, "overlap", 10,10,true,false,false);
	//Application.console.log("hereToTop:" + contextMenu.position + "," + contextMenu.left + "," + contextMenu.top);

//	var hoge;
//	Application.console.log(hoge + "," + hoge);
//	hoge = !hoge;
//	Application.console.log(hoge + "," + hoge);
	
	
	//var excludeUrls = fxslPref.getCharPref("extensions.fixscroll.excludeUrls");
	
	var excludeUrls = ".*\.log$;......(((((;*************;.*\.txt$;";
	Application.console.log(excludeUrls);

	var url = window.content.location.href;

	var excludeUrl = excludeUrls.split(";");
	for(var i=0;i<excludeUrl.length;i++){
		try{
			var reg = new RegExp(excludeUrl[i], "i");

			//var url = "hogehogerarara.txt";
			if(url.match(reg)){
				Application.console.log("matched");
				return;
			}else{
				Application.console.log("unmatched:" + url + "," + excludeUrl[i]);
			}
		}catch(e){Application.console.log(e);}
	}
	
	
	/*
	var tab = gBrowser.selectedTab;
	
	for(var i=0; i< gBrowser.tabContainer.childNodes.length;i++){
		var fixscroll = gBrowser.tabContainer.childNodes[i].fixscroll;
		
		Application.console.log("test" + tab.linkedPanel + "," + i );
		if(!fixscroll) continue;
		Application.console.log("fixscroll:" 
		+","+ fixscroll.fixPosition 
		+","+ fixscroll.slidePosition 
		+","+ fixscroll.isBrowserOver 
		+","+ fixscroll.horizonPosition
		+","+ fixscroll._innerWidth
		+","+ fixscroll._innerHeight
		);
	}
	
	var strStack = "stack:";
	var stack = FixscrollControl.notificationBox.childNodes[0];
	for(var i=0;i<stack.childNodes.length;i++){
		strStack = strStack + stack.childNodes[i].tagName + ":" + stack.childNodes[i].hidden + ",";
	}
	Application.console.log(strStack);
	
	var browser = FixscrollControl.browser;
	var canvas = FixscrollControl.canvas;
	Application.console.log("browser:" + browser.contentWindow.scrollY + "," + browser.contentTitle + "," + browser.height + ":" + browser.width + "," + browser.contentWindow.scrollMaxY + "," + browser.style.overflow);
	Application.console.log("canvas:" + canvas.height + ":" + canvas.width);
	
	
	Application.console.log("scrollY:" + FixscrollControl.scrollV.getAttribute("maxpos") + ","  );
	//fxslNotificationBox() === fixscroll.browser
	
	//browser.contentDocument.body.addEventListener('DOMAttrModified', fxtest, false);
	fsxlScrollFlg = !fsxlScrollFlg;
	if(fsxlScrollFlg){
		FixscrollControl.scrollEventOn();
	}else{
		FixscrollControl.scrollEventOff();
	}
	*/
	Application.console.log("OK");
};

var fxtest = {
	handleEvent :function(aEvent) {
		Application.console.log("handleEvent");
		switch (aEvent.type)
		{
			case 'DOMAttrModified':
				if(aEvent.attrName != "scrollTop") return;
				var browser = FixscrollControl.browser;
				Application.console.log("hoge:" + browser.contentWindow.scrollMaxY);
				break;
		}
	},
};

var falert = function(){
	Application.console.log("falert");
	alert("hogeho");
}

//how to use
//myUtil.dump(contextMenu,2,"contextMenu");
var myUtil = {
dump:function(o,depth,name,filter,filterMode) {
    var doc = gBrowser.contentDocument,
        el = doc.getElementById("fduDump"),
        str = "" || name + "\n",
        depthLimit = depth || 1,
        filterDefaultMode = filterMode || 1;
    // filterMode is either 1 or -1.
    // 1 => Like the iptable Allow all, it dig into all object exclude object name in the filter object
    // -1 => Like the iptable Deny all, it will not dig into any object unless object name is inside the filter

    if ( !el ) {
        el = doc.createElement("pre");
        el.id = "fduDump";
        doc.body.appendChild(el);
    }

    var transverse = function(o,thisLv,name,filter) {
        var indent = "", i, tmp, filterMode, dig, f;
        if ( filter && filter.__mode ) {
            filterMode = filter.__mode;
        } else {
            filterMode = filterDefaultMode;
        }
        for ( i = 0 ; i < thisLv ; i++ ) {
            indent += "    ";
        }

        if ( name ) {
            str += "\n" + indent + "=== lv "+thisLv+", Start "+name+" ===\n";
        }

        if ( o && thisLv < depthLimit ) {
            for ( var k in o ) {
                try{
                    tmp = o[k] + "";
                    tmp = tmp.split("\n");
                    tmp = tmp.join("\n"+indent);
                    str += indent + k + " : " + tmp + "\n";
                    if (typeof(o[k]) === "object" && o[k] && thisLv + 1 < depthLimit ) {
                        if ( filter && typeof filter[k] !== "undefined") {
                            dig = (filterMode === -1);
                        } else {
                            dig = (filterMode === 1);
                        }
                        if ( dig ) {
                            if ( filter && filter[k] ) {
                                f = filter;
                            } else {
                                f = null;
                            }
                            transverse(o[k], thisLv + 1, k, f);
                        }
                    }
                } catch (e) {
                }
            }
        }

        if ( name ) {
            str += indent + "=== lv "+thisLv+", End "+name+" ===\n\n";
        }
    }
    transverse(o,0,"",filter);
    Application.console.log(str);
    //el.innerHTML = str;
}
}