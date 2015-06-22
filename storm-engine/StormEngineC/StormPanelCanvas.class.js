/**
* @class
* @constructor
*/
StormEngineC_PanelCanvas = function() {

};

/**
* @type Void
* @private
*/
StormEngineC_PanelCanvas.prototype.loadPanel = function() {
	var html = '<canvas id="CANVASID_STORM" ></canvas><br />'+
				'<div id="DIVID_StormPanelCanvas_proc"></div>'+
				'<button type="button" id="BTNID_StormPanelCanvas_renderBtn" >Render</button>'+
				'<button type="button" onclick="stormEngineC.renderFrameStop();" ><div style="width:14px;height:14px;background:#FF0000;"></div></button>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelCanvas', 'RENDER', html);
	
	
										
	$("#DIVID_StormPanelCanvas #BTNID_StormPanelCanvas_renderBtn").bind('click', function() {
												stormEngineC.PanelRenderSettings.pushRender();
											});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelCanvas.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
};

/**
* @type Void
* @private
* @param {Int} width
* @param {Int} height
*/
StormEngineC_PanelCanvas.prototype.setDimensions = function(width, height) {
	$('#CANVASID_STORM').attr('width',width);
	$('#CANVASID_STORM').attr('height',height);
};
