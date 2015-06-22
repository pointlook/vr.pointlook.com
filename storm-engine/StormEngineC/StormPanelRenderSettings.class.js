/**
* @class
* @constructor
*/
StormEngineC_PanelRenderSettings = function() {
	
};

/**
* @type Void
* @private
*/
StormEngineC_PanelRenderSettings.prototype.loadPanel = function() {
	var html = '<fieldset>'+
					'<legend style="font-weight:bold;padding:2px">Render mode</legend>'+
					'<input id="INPUTVALUE_StormRenderMode" type="hidden" value="0"/>'+
					"Path Tracing <input type='radio' id='INPUTRADIO_StormRenderMode' name='INPUTRADIO_StormRenderMode' onclick='$(\"#INPUTVALUE_StormRenderMode\").val($(this).val());' value='0' checked='true'/><br />"+
					"EMR <input type='radio' id='INPUTRADIO_StormRenderMode' name='INPUTRADIO_StormRenderMode' onclick='$(\"#INPUTVALUE_StormRenderMode\").val($(this).val());' value='1'/><br />"+
					"<a href='#' style='color:#FFF' onclick='$(\"#DIVID_aboutEMRvsPATHTRACING\").dialog({ width:696,height:677,title:\"EMRvsPATHTRACING\" });'>View info..</a>"+
				'</fieldset>'+
				 
				 '<div id="DIVID_StormRenderConf">'+ 
					'Width: <input id="INPUTID_StormRenderSettings_width" type="text" value="256" /><br />'+
					'Height: <input id="INPUTID_StormRenderSettings_height" type="text" value="256" /><br />'+
					'Max samples: <input id="INPUTID_StormRenderSettings_maxSamples" type="text" value="60" /><br />'+
				'</div>'+
				'<br />'+
				'Frame start: <input id="INPUTID_StormRenderSettings_frameStart" type="text" value="0"/><br />'+
				'Frame end: <input id="INPUTID_StormRenderSettings_frameEnd" type="text" value="5" /><br />'+
				
				'<button id="BTNID_StormRenderBtn" type="button">Render</button>'+
				'<br />'+
				'<button id="BTNID_StormRenderTimelineBtn" type="button" onclick="stormEngineC.timelinePathTracing.show();">Frames..</button>'+
				
				'<div style="background-color:#FFF;padding:5px;">'+
					'<div id="DIVID_StormRenderTypeNet"></div>'+
					'<div id="DIVID_StormRenderNetReceive"></div>'+
				'</div>'+
				'<div id="DIVID_aboutEMRvsPATHTRACING" style="display:none;"><img src="'+stormEngineCDirectory+'/resources/EMRvsPATHTRACING.jpg" /></div>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormRenderSettings', 'RENDER SETTINGS', html);	
	
	
	$("#DIVID_StormRenderSettings #BTNID_StormRenderBtn").bind('click', function() {
												stormEngineC.PanelRenderSettings.pushRender();
											});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelRenderSettings.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
};

/**
* @type Void
* @private
* @param {Int} width
* @param {Int} height
*/
StormEngineC_PanelRenderSettings.prototype.render = function(width, height) {
	var w = (width != undefined) ? width : $('#INPUTID_StormRenderSettings_width').val();
	var h = (height != undefined) ? height : $('#INPUTID_StormRenderSettings_height').val();
	
	stormEngineC.PanelCanvas.show(); 
	stormEngineC.PanelCanvas.setDimensions(w, h); 
	stormEngineC.renderFrame({	'target':'CANVASID_STORM',
								'mode':$('#INPUTVALUE_StormRenderMode').val(),
								'width':w,
								'height':h,
								'frameStart':$('#INPUTID_StormRenderSettings_frameStart').val(),
								'frameEnd':$('#INPUTID_StormRenderSettings_frameEnd').val()});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelRenderSettings.prototype.pushRender = function() {
	if(wsPathTracing != undefined && (wsPathTracing.socket.connected == true || wsPathTracing.socket.connecting == true)) {
		if(stormEngineC.netID != 0) {
			wsPathTracing.emit('getRenderDimensions', {
				netID: stormEngineC.netID
			});
		} else {
			stormEngineC.PanelRenderSettings.render();
		}
	} else {
		stormEngineC.PanelRenderSettings.render();
	}
};