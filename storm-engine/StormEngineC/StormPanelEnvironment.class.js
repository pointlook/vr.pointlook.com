/**
* @class
* @constructor
*/
StormEngineC_PanelEnvironment = function() {
	this.$;
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEnvironment.prototype.loadPanel = function() {
	var html = '<div id="DIVID_StormPanelEnvironment_CONTENT"></div>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelEnvironment', 'ENVIRONMENT', html);
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEnvironment.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
	
	this.update();
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEnvironment.prototype.update = function() {
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►	
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► AMBIENT COLOR ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►	
	var str = 	'<fieldset><legend>Ambient color</legend>'+
					'setAmbientColor: <div id="DIVID_StormPanelEnvironment_colorAmbient" style="width:16px;height:16px;border:1px solid #CCC;cursor:pointer;" ></div>'+
					'<input id="INPUTID_StormPanelEnvironment_colorAmbient" type="text" style="display:none"/>'+
				'</fieldset>';
	$('#DIVID_StormPanelEnvironment_CONTENT').html(str);
	
	//ambient color functions
	$('#INPUTID_StormPanelEnvironment_colorAmbient').ColorPicker({'onChange':function(hsb, hex, rgb) {
																	stormEngineC.setAmbientColor($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
																	$('#DIVID_StormPanelEnvironment_colorAmbient').css('background','rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
																}
													});
	var colorAmbient = stormEngineC.stormGLContext.ambientColor;
	$('#DIVID_StormPanelEnvironment_colorAmbient').css('background-color','rgb('+parseInt(colorAmbient.e[0]*255)+','+parseInt(colorAmbient.e[1]*255)+','+parseInt(colorAmbient.e[2]*255)+')');
	$('#INPUTID_StormPanelEnvironment_colorAmbient').ColorPickerSetColor({'r':colorAmbient.e[0], 'g': colorAmbient.e[1], 'b':colorAmbient.e[2]});//normalizado 0.0-1.0
	$("#DIVID_StormPanelEnvironment_colorAmbient").on('click', function() {
										$('#INPUTID_StormPanelEnvironment_colorAmbient').css('display','block');
										$('#INPUTID_StormPanelEnvironment_colorAmbient').click();
										$('#INPUTID_StormPanelEnvironment_colorAmbient').css('display','none');
									});
	
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►	
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► AO ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►	
	var str = 	'<fieldset><legend>AO</legend>'+
					'<br />setWebGLSSAO: <span id="DIVID_StormPanelEnvironment_ssao_value">'+parseFloat(stormEngineC.stormGLContext.SSAOlevel).toFixed(1)+'</span><br />'+ 
					'<div id="DIVID_StormPanelEnvironment_ssao"></div>'+
				'</fieldset>';
	$('#DIVID_StormPanelEnvironment_CONTENT').append(str);
	
	// AO functions
	$("#DIVID_StormPanelEnvironment_ssao").slider({max:5,
												min:0,
												value:(stormEngineC.stormGLContext.SSAOlevel).toFixed(1),
												step:0.1,
												slide:function(event,ui){
														stormEngineC.setWebGLSSAO(true, ui.value);
														if(stormEngineC.stormGLContext.SSAOlevel >= 4.99) {
															stormEngineC.setWebGLSSAO(false, 5.0);
														}
														$('#DIVID_StormPanelEnvironment_ssao_value').text(parseFloat(ui.value).toFixed(1));
													}}); 
	
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►	
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► GIv2 ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►	
	var str = ''+
	'<fieldset><legend>GI</legend>'+
		"<button type=\"button\" id=\"BUTTONID_StormPanelEnvironment_giv2_set\">setVoxelizator</button>"+ 
		'<div id="DIVID_StormPanelEnvironment_GIv2panel" style="display:none">'; 
			// GIv2enable 
			var giStatus = stormEngineC.stormGLContext.GIv2enable == false ? '' : 'checked';
			str += '<br />enable: <input id="INPUTID_StormPanelEnvironment_GIv2enable" type="checkbox" '+giStatus+'/>';
			// GIstopOncameramove
			var giStopOncameramoveStatus = stormEngineC.stormGLContext.GIstopOncameramove == false ? '' : 'checked';
			str += '<br />stopOncameramove: <input id="INPUTID_StormPanelEnvironment_GIstopOncameramove" type="checkbox" '+giStopOncameramoveStatus+'/>';
			// GIdistanceFactor
			str += 	'<br />setMaxBounds: <span id="DIVID_StormPanelEnvironment_GIv2maxbounds">'+stormEngineC.giv2.maxBounds+'</span>'+
						'<div id="DIVID_StormPanelEnvironment_GIv2maxbounds_SLIDER"></div>';
		str += '</div>';
	str += 	'</fieldset>';
	$("#DIVID_StormPanelEnvironment_CONTENT").append(str);
	
	$("#BUTTONID_StormPanelEnvironment_giv2_set").on('click', function() {
												stormEngineC.selectNode(stormEngineC.giv2);
												stormEngineC.pickingCall='setVoxelizator(_selectedNode_);stormEngineC.PanelEnvironment.show();';  
												stormEngineC.PanelListObjects.show();
												$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
												document.body.style.cursor='pointer';
											}); 
	
	
	if(stormEngineC.stormGLContext.Shader_GIv2_READY == true)
		$('#DIVID_StormPanelEnvironment_GIv2panel').css('display','block');
	
	// GIv2enable functions
	$("#INPUTID_StormPanelEnvironment_GIv2enable").on('click', function() {
		stormEngineC.stormGLContext.GIv2enable = stormEngineC.stormGLContext.GIv2enable == false ? true : false;
	});
	
	// GIstopOncameramove functions
	$("#INPUTID_StormPanelEnvironment_GIstopOncameramove").on('click', function() {
		stormEngineC.stormGLContext.GIstopOncameramove = stormEngineC.stormGLContext.GIstopOncameramove == false ? true : false;
	});
	
	// GImaxbounds functions
	$("#DIVID_StormPanelEnvironment_GIv2maxbounds_SLIDER").slider({max:10,
												min:1,
												value:stormEngineC.giv2.maxBounds,
												step:1,
												slide:function(event,ui){
														stormEngineC.giv2.setMaxBounds(ui.value);
														stormEngineC.setZeroSamplesGIVoxels();
														$('#DIVID_StormPanelEnvironment_GIv2maxbounds').text(ui.value);
													}});
	
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►	
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►► SHADOWS ►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►
	//►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►►	
	var shadowStatus = stormEngineC.stormGLContext.shadowsEnable == false ? '' : 'checked';
	var str = 	'<fieldset><legend>Shadows</legend>'+
					'<br />Shadows: <input id="INPUTID_StormPanelEnvironment_enableShadows" type="checkbox" '+shadowStatus+'/>'+
				'</fieldset>';
	$('#DIVID_StormPanelEnvironment_CONTENT').append(str);
	
	// shadows functions
	$("#INPUTID_StormPanelEnvironment_enableShadows").on('click', function() {
		stormEngineC.stormGLContext.shadowsEnable = stormEngineC.stormGLContext.shadowsEnable == false ? true : false;
	});
};




