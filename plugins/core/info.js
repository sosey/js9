// ---------------------------------------------------------------------
// Info plugin
// ---------------------------------------------------------------------

/*jslint bitwise: true, plusplus: true, sloppy: true, vars: true, white: true, browser: true, devel: true, continue: true, unparam: true, regexp: true */
/*global $, JS9 */

// create our namespace, and specify some meta-information and params
JS9.Info = {};
JS9.Info.CLASS = "JS9";
JS9.Info.NAME = "Info";
JS9.Info.WIDTH = 350;	// width of js9Info box
JS9.Info.HEIGHT = 300;	// height of js9Info box

JS9.Info.opts = {
    // info url
    infoURL: "./params/info.html",
    infoObj: {
	file: '<tr><td>file</td><td colspan="2"><input type="text" name="id" size="32" value="" readonly="readonly" /></td></tr>',
	object: '<tr><td>object</td><td colspan="2"><input type="text" name="object" size="32" value="" readonly="readonly" /></td></tr>',
	wcscen: '<tr><td>center</td><td><input type="text" name="racen" size="15" value="" readonly="readonly" /></td><td><input type="text" name="deccen" size="15" value="" readonly="readonly" /></td></tr>',
	wcsfov: '<tr><td>fov</td><td><input type="text" name="wcsfov" size="15" value="" readonly="readonly" /></td><td><input type="text" name="wcspix" size="15" value="" readonly="readonly" /></td></tr>',
	 value: '<tr><td>value</td><td colspan="2"><input type="text" name="val3" size="15" value="" readonly="readonly" /></td></tr>',
	impos: '<tr><td><input style="background: transparent;border: none" type="text" name="isys" size="10" value="image" readonly="readonly" /></td><td><input type="text" name="ix" size="15" value="" readonly="readonly" /></td><td><input type="text" name="iy" size="15" value="" readonly="readonly" /></td></tr>',
	physpos: '<tr><td><input style="background: transparent;border: none" type="text" name="psys" size="10" value="physical" readonly="readonly" /></td><td><input type="text" name="px" size="15" value="" readonly="readonly" /></td><td><input type="text" name="py" size="15" value="" readonly="readonly" /></td></tr>',
	wcspos: '<tr><td><input style="background: transparent;border: none" type="text" name="wcssys" size="10" value="wcs" readonly="readonly" /></span></td><td><input type="text" name="ra" size="15" value="" readonly="readonly" /></td><td><input type="text" name="dec" size="15" value="" readonly="readonly" /></td></tr>',
	 regions: '<tr><td colspan="3"><textarea style="background: #E9E9E9; border: #CCCCCC solid 1px" name="regions" rows="4" cols="42" value="" readonly="readonly" /></td></tr><td colspan="3"><div class="JS9Progress"><progress name="progress" class="JS9ProgressBar" value="0" max="100"></progress></div></tr>'
    }
};

// init plugin
JS9.Info.init = function(){
    var i, key, opts, obj, infoHTML;
    // only init if we are displaying a new image
    // i.e., avoid re-init when changing contrast/bias
    if( this.display.image ){
	if( this.lastimage === this.display.image.id ){
	    return;
	}
	this.lastimage = this.display.image.id;
    }
    // generate the web page
    opts = JS9.globalOpts.infoBox;
    obj = JS9.Info.opts.infoObj;
    infoHTML = '<table name="info" class="js9InfoTable">';
    for(i=0; i<opts.length; i++){
	key = opts[i];
	// aesthetic condideration: skip wcs display if we have no wcs
	if( key.match(/^wcs/)
	    && this.display.image && !(this.display.image.raw.wcs>0) ){
	    continue;
	}
	// add html for this line of the display
	if( key in obj ){
	    infoHTML += obj[key];
	}
    }
    infoHTML += '</table>';
    // reset previous
    if( this.infoConjq ){
	this.infoConjq.html("");
    }
    // add container to the high-level div
    this.infoConjq = $("<div>")
	.addClass("JS9Container")
	.append(infoHTML)
	.appendTo(this.divjq);
    // save the jquery element for later processing
    this.jq = this.infoConjq.find("[name='info']");
};

// display a message on the image canvas or info plugin
// call with display as context
JS9.Info.display = function(type, message, target){
    var tobj, split, area, tokens, rexp, s, color, info, key, el, jel;
    var disp = this;
    // backward compatibility -- allow context to be Image
    if( this.display ){
	disp = this.display;
    }
    // if image is context
    if( disp.pluginInstances ){
	info = disp.pluginInstances.JS9Info;
    }
    // if specific target was specified use that
    if( target ){
	tobj = target;
    } else {
	// if info plugin is active, use that
	if( info && (info.status === "active") ){
	    tobj = info;
	} else {
	    // image context
	    tobj = disp;
	}
    }
    // handle progress specially
    if( type === "progress" ){
	if( tobj === info ){
	    el = info.jq;
	} else {
	    el = tobj.divjq;
	}
	if( el.length > 0 ){
	    el = el.find("[name='progress']");
	    switch(typeof message){
	    case "string":
	    case "boolean":
		if( message ){
		    if( message === "indeterminate" ){
			el.removeAttr("value");
		    }
		    el.parent().css("display", "inline-block");
		} else {
		    el.parent().css("display", "none");
		    el.attr("value", 0);
		}
		break;
	    case "object":
		if( message[1] ){
		    el.attr("max", message[1]);
		}
		el.attr("value", message[0]);
		break;
	    }
	}
	return;
    }
    // plugin-based display: fill in html form
    if( tobj === info ){
	switch( typeof message ){
	case "string":
	    jel = info.jq.find("[name='"+type+"']");
	    if( jel.length > 0 ){
		jel.val(message);
	    }
	    break;
	case "object":
	    // process all key in the object
	    for( key in message ){
		if( message.hasOwnProperty(key) ){
		    // set value, if possible
		    jel = info.jq.find("[name='"+key+"']");
		    if( jel.length > 0 ){
			jel.val(message[key]);
		    }
		}
	    }
	    break;
	}
	// allow chaining
	return disp;
    }
    // height params for text color assignment
    tobj.infoheight = tobj.infoArea.height() + 4;
    tobj.regheight = Math.max(tobj.infoheight * 2 + 10,
			      tobj.infoheight + tobj.regionsArea.height() + 10);
    // display-based message
    switch(type){
    case "regions":
	area = tobj.regionsArea;
	if( !disp.image || (disp.image.iy > tobj.regheight) ){
	    color = JS9.textColorOpts.inimage;
	} else {
	    color = JS9.textColorOpts.regions;
	}
	split = ";";
	break;
    case "info":
	area = tobj.infoArea;
	if( !disp.image || (disp.image.iy > tobj.infoheight) ){
	    color = JS9.textColorOpts.inimage;
	} else {
	    color = JS9.textColorOpts.info;
	}
	split = "";
	break;
    default:
	area = tobj.infoArea;
	if( !disp.image || (disp.image.iy > tobj.infoheight) ){
	    color = JS9.textColorOpts.inimage;
	} else {
	    color = JS9.textColorOpts.info;
	}
	break;
    }
    // massage the message before display, if necessary
    switch( typeof message ){
    case "string":
	s = message;
	break;
    case "object":
	s = message.vstr;
	break;
    }
    if( split !== "" ){
	tokens = s.split(split);
	if( tokens.length > 2 ){
	    rexp = new RegExp(split, "g");
	    s = s.replace(rexp, "<br>");
	}
    }
    // display the message
    area.css("color", color).html(s);
    // allow chaining
    return disp;
};
JS9.Display.prototype.displayMessage = JS9.Info.display;
// backwards compatibility
JS9.Image.prototype.displayMessage = JS9.Info.display;

// clear an info message
JS9.Info.clear = function(which){
    var disp = this;
    // backward compatibility -- allow context to be Image
    if( this.display ){
	disp = this.display;
    }
    if( which ){
	disp.displayMessage(which, "");
    } else {
	disp.displayMessage("info", "");
	disp.displayMessage("regions", "");
	disp.displayMessage("progress", false);
    }
    // allow chaining
    return disp;
};
JS9.Display.prototype.clearMessage = JS9.Info.clear;
// backwards compatibility
JS9.Image.prototype.clearMessage = JS9.Info.clear;

// when a plugin window is brought up, clear the display window
JS9.Info.clearMain = function(im){
    var disp;
    if( im && im.display ){
	disp = im.display;
	disp.displayMessage("info", "", disp);
	disp.displayMessage("regions", "", disp);
	disp.displayMessage("progress", false, disp);
    }
};

// having added the prototype displayMessage, we can define a public routine
JS9.mkPublic("DisplayMessage", function(type, message, target){
    var got;
    var obj = JS9.parsePublicArgs(arguments);
    var display = JS9.lookupDisplay(obj.display);
    if( !display ){
	JS9.error("invalid display for display message");
    }
    type = obj.argv[0];
    message = obj.argv[1];
    target = obj.argv[2];
    got = display.displayMessage(type, message, target);
    if( got === display ){
	got = "OK";
    }
    return got;
});

// add this plugin into JS9
JS9.RegisterPlugin("JS9", "Info", JS9.Info.init,
		   {menuItem: "InfoBox",
		    onplugindisplay: JS9.Info.clearMain,
		    onimagedisplay: JS9.Info.init,
		    winTitle: "Info",
		    winResize: true,
		    winDims: [JS9.Info.WIDTH, JS9.Info.HEIGHT]});
