/**
* @class
* @constructor
*/
StormEngineC_PanelEditNode = function() {

};

/**
* @type Void
* @private
*/
StormEngineC_PanelEditNode.prototype.loadPanel = function() {
	var html = '<input type="checkbox" id="INPUTID_StormEditNode_visible" /> <span id="DIVID_StormEditNode_name"></span>'+
				'<div id="DIVID_StormEditNode_edits"></div>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelEditNode', 'EDIT OBJECT', html);
	
	
	
	
	
	$("#INPUTID_StormEditNode_visible").on('click', function() {
											if(stormEngineC.nearNode.visibleOnContext == true) {
												stormEngineC.nearNode.visible(false);
											} else {
												stormEngineC.nearNode.visible(true);
											}
											
											stormEngineC.PanelListObjects.showListObjects();
											stormEngineC.PanelEditNode.updateNearNode();
										});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEditNode.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEditNode.prototype.updateNearNode = function() {
	if(stormEngineC.nearNode.name != undefined) $('#DIVID_StormEditNode_name').html(stormEngineC.nearNode.name+'<br />');
	$('#DIVID_StormEditNode_edits').html('');
	
	
	
	
	lines_position = function() {
		var strMoves = 	'<div>'+
							'TRANSLATE: '+
							'<input id="StormEN_spinnerTranslX" name="value" value="'+stormEngineC.nearNode.getPosition().e[0]+'" style="color:#FFF;width:40px">'+
							'<input id="StormEN_spinnerTranslY" name="value" value="'+stormEngineC.nearNode.getPosition().e[1]+'" style="color:#FFF;width:40px">'+
							'<input id="StormEN_spinnerTranslZ" name="value" value="'+stormEngineC.nearNode.getPosition().e[2]+'" style="color:#FFF;width:40px">'+
						'</div>';
		$('#DIVID_StormEditNode_edits').html(strMoves);
		$("#StormEN_spinnerTranslX").spinner({numberFormat:"n", step: 0.1,
											spin: function(event, ui) {
												var vecTranslation = $V3([ui.value, $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
												stormEngineC.nearNode.setPosition(vecTranslation);
												stormEngineC.debugValues = [];
												stormEngineC.setDebugValue(0, vecTranslation, stormEngineC.nearNode.name);
											},
											change: function(event, ui) {
												var vecTranslation = $V3([$(this).val(), $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
												stormEngineC.nearNode.setPosition(vecTranslation);
												stormEngineC.debugValues = [];
												stormEngineC.setDebugValue(0, vecTranslation, stormEngineC.nearNode.name);
											}
											});
			$("#StormEN_spinnerTranslY").spinner({numberFormat:"n", step: 0.1,
											spin: function(event, ui) {
												var vecTranslation = $V3([$("#StormEN_spinnerTranslX").val(), ui.value, $("#StormEN_spinnerTranslZ").val()]);
												stormEngineC.nearNode.setPosition(vecTranslation);
												stormEngineC.debugValues = [];
												stormEngineC.setDebugValue(0, vecTranslation, stormEngineC.nearNode.name);
											},
											change: function(event, ui) {
												var vecTranslation = $V3([$("#StormEN_spinnerTranslX").val(), $(this).val(), $("#StormEN_spinnerTranslZ").val()]);
												stormEngineC.nearNode.setPosition(vecTranslation);
												stormEngineC.debugValues = [];
												stormEngineC.setDebugValue(0, vecTranslation, stormEngineC.nearNode.name);
											}
											});
			$("#StormEN_spinnerTranslZ").spinner({numberFormat:"n", step: 0.1,
											spin: function(event, ui) {
												var vecTranslation = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), ui.value]);
												stormEngineC.nearNode.setPosition(vecTranslation);
												stormEngineC.debugValues = [];
												stormEngineC.setDebugValue(0, vecTranslation, stormEngineC.nearNode.name);
											},
											change: function(event, ui) {
												var vecTranslation = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), $(this).val()]);
												stormEngineC.nearNode.setPosition(vecTranslation);
												stormEngineC.debugValues = [];
												stormEngineC.setDebugValue(0, vecTranslation, stormEngineC.nearNode.name);
											}
											}); 
	};
	lines_rotation = function() {
		var strMoves = 	'<div>'+
							'ROTATE: '+
							"<input type='text' id='StormEN_tlVal' value='90.0' style='width:30px' />"+
							' X<input id="StormEN_spinnerRotX" name="value" value="0.0" style="color:#FFF;width:1px">'+
							' Y<input id="StormEN_spinnerRotY" name="value" value="0.0" style="color:#FFF;width:1px">'+
							' Z<input id="StormEN_spinnerRotZ" name="value" value="0.0" style="color:#FFF;width:1px">'+
						'</div>';
		$('#DIVID_StormEditNode_edits').append(strMoves);
		$("#StormEN_spinnerRotX").spinner({numberFormat:"n",
											spin: function(event, ui) {
												if(event.currentTarget.textContent == '▲') {
													stormEngineC.nearNode.setRotationX(stormEngineC.utils.degToRad(+$('#StormEN_tlVal').val())); 
												} else {
													stormEngineC.nearNode.setRotationX(stormEngineC.utils.degToRad(-$('#StormEN_tlVal').val())); 
												}
											}
											});
			$("#StormEN_spinnerRotY").spinner({numberFormat:"n",
											spin: function(event, ui) {
												if(event.currentTarget.textContent == '▲') {
													stormEngineC.nearNode.setRotationY(stormEngineC.utils.degToRad(+$('#StormEN_tlVal').val())); 
												} else {
													stormEngineC.nearNode.setRotationY(stormEngineC.utils.degToRad(-$('#StormEN_tlVal').val())); 
												}
											}
											});
			$("#StormEN_spinnerRotZ").spinner({numberFormat:"n",
											spin: function(event, ui) {
												if(event.currentTarget.textContent == '▲') {
													stormEngineC.nearNode.setRotationZ(stormEngineC.utils.degToRad(+$('#StormEN_tlVal').val())); 
												} else {
													stormEngineC.nearNode.setRotationZ(stormEngineC.utils.degToRad(-$('#StormEN_tlVal').val())); 
												}
											}
											});
	};
	
	
	
	if(stormEngineC.nearNode.objectType == 'node') {
		if(stormEngineC.nearNode.visibleOnContext == true) {
			$("#INPUTID_StormEditNode_visible").attr('checked','true');
			
			lines_position();
			lines_rotation();
		} else {
			$("#INPUTID_StormEditNode_visible").removeAttr('checked');
		}
	}
	if(stormEngineC.nearNode.objectType == 'polarityPoint') {
		if(stormEngineC.nearNode.visibleOnContext == true) {
			$("#INPUTID_StormEditNode_visible").attr('checked','true');
		} else {
			$("#INPUTID_StormEditNode_visible").removeAttr('checked');
		}
		
		lines_position();
		
		var currPolarityPositive = (stormEngineC.nearNode.polarity == 1) ? 'checked' : '';
		var currPolarityNegative = (stormEngineC.nearNode.polarity == 0) ? 'checked' : '';
		var str = "<button type=\"button\" onclick=\"stormEngineC.nearNode.deletePolarityPoint();$('#DIVID_StormEditNode_edits').html('');stormEngineC.PanelListObjects.showListObjects();\">Delete</button>"+
					'<br />POLARITY +<input type="radio" name="INPUTNAME_StormEditNode_pp_polarity" onclick="stormEngineC.nearNode.setPolarity(1);" '+currPolarityPositive+' />'+
					' -<input type="radio" name="INPUTNAME_StormEditNode_pp_polarity" onclick="stormEngineC.nearNode.setPolarity(0);" '+currPolarityNegative+' />'; 
		$('#DIVID_StormEditNode_edits').append(str);
		
		var currPPorbitEnable = (stormEngineC.nearNode.orbit == 1) ? 'checked="true"' : '';
		var str = '<br />ORBIT <input type="checkbox" id="INPUTID_StormEditNode_pp_orbit" '+currPPorbitEnable+' />';
		$('#DIVID_StormEditNode_edits').append(str);
		$("#INPUTID_StormEditNode_pp_orbit").on('click', function() {
											var enableDest = $("#INPUTID_StormEditNode_pp_orbit").attr('checked');
											if(enableDest=='checked') stormEngineC.nearNode.enableOrbit();
											else stormEngineC.nearNode.disableOrbit();
										});
										
		var str= '<br />FORCE <input id="INPUTNAME_StormEditNode_pp_spinnerForce" value="'+stormEngineC.nearNode.force+'" style="color:#FFF;width:40px">';
		$('#DIVID_StormEditNode_edits').append(str);
		$("#INPUTNAME_StormEditNode_pp_spinnerForce").spinner({numberFormat:"n", step: 0.1,
														spin: function(event, ui) {
															stormEngineC.nearNode.setForce(ui.value);
														}
													});
													
		var str = "<fieldset><legend></legend>"+
					"<button type=\"button\" id=\"BUTTONID_StormEditNode_pp_get\">get particles</button>";
					for(var n = 0, f = stormEngineC.nearNode.nodesProc.length; n < f; n++) str += '<br />'+stormEngineC.nearNode.nodesProc[n].name;
		str +="</fieldset>";
		$('#DIVID_StormEditNode_edits').append(str);
		
		$("#BUTTONID_StormEditNode_pp_get").on('click', function() {
												stormEngineC.pickingCall='get({node:_selectedNode_});';  
												stormEngineC.PanelListObjects.show();
												$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
												document.body.style.cursor='pointer';
											});
	}
	if(stormEngineC.nearNode.objectType == 'forceField') {
		if(stormEngineC.nearNode.visibleOnContext == true) {
			$("#INPUTID_StormEditNode_visible").attr('checked','true');
			
			//lines_position();
			
			var str = "<button type=\"button\" onclick=\"stormEngineC.nearNode.deleteForceField();$('#DIVID_StormEditNode_edits').html('');stormEngineC.PanelListObjects.showListObjects();\">Delete</button>"; 
			$('#DIVID_StormEditNode_edits').html(str);
											
			
														
			var strMoves = 	'<div>'+
							'TRANSLATE: '+
							'<input id="StormEN_spinnerForceDirX" name="value" value="'+stormEngineC.nearNode.direction.e[0]+'" style="color:#FFF;width:40px">'+
							'<input id="StormEN_spinnerForceDirY" name="value" value="'+stormEngineC.nearNode.direction.e[1]+'" style="color:#FFF;width:40px">'+
							'<input id="StormEN_spinnerForceDirZ" name="value" value="'+stormEngineC.nearNode.direction.e[2]+'" style="color:#FFF;width:40px">'+
						'</div>';
		$('#DIVID_StormEditNode_edits').append(strMoves);
		$("#StormEN_spinnerForceDirX").spinner({numberFormat:"n", step: 0.1,
											spin: function(event, ui) {
												var vec = $V3([ui.value, $("#StormEN_spinnerForceDirY").val(), $("#StormEN_spinnerForceDirZ").val()]);
												stormEngineC.nearNode.setDirection(vec);
											},
											change: function(event, ui) {
												var vec = $V3([$(this).val(), $("#StormEN_spinnerForceDirY").val(), $("#StormEN_spinnerForceDirZ").val()]);
												stormEngineC.nearNode.setDirection(vec);
											}
											});
			$("#StormEN_spinnerForceDirY").spinner({numberFormat:"n", step: 0.1,
											spin: function(event, ui) {
												var vec = $V3([$("#StormEN_spinnerForceDirX").val(), ui.value, $("#StormEN_spinnerForceDirZ").val()]);
												stormEngineC.nearNode.setDirection(vec);
											},
											change: function(event, ui) {
												var vec = $V3([$("#StormEN_spinnerForceDirX").val(), $(this).val(), $("#StormEN_spinnerForceDirZ").val()]);
												stormEngineC.nearNode.setDirection(vec);
											}
											});
			$("#StormEN_spinnerForceDirZ").spinner({numberFormat:"n", step: 0.1,
											spin: function(event, ui) {
												var vec = $V3([$("#StormEN_spinnerForceDirX").val(), $("#StormEN_spinnerForceDirY").val(), ui.value]);
												stormEngineC.nearNode.setDirection(vec);
											},
											change: function(event, ui) {
												var vec = $V3([$("#StormEN_spinnerForceDirX").val(), $("#StormEN_spinnerForceDirY").val(), $(this).val()]);
												stormEngineC.nearNode.setDirection(vec);
											}
											});
			
			var str = "<fieldset><legend></legend>"+
						"<button type=\"button\" id=\"BUTTONID_StormEditNode_ff_get\">get particles</button>";
						for(var n = 0, f = stormEngineC.nearNode.nodesProc.length; n < f; n++) str += '<br />'+stormEngineC.nearNode.nodesProc[n].name;
			str +="</fieldset>";
			$('#DIVID_StormEditNode_edits').append(str);
			
			$("#BUTTONID_StormEditNode_ff_get").on('click', function() {
												stormEngineC.pickingCall='get({node:_selectedNode_});';  
												stormEngineC.PanelListObjects.show();
												$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
												document.body.style.cursor='pointer';
											});
		} else {
			$("#INPUTID_StormEditNode_visible").removeAttr('checked');
		}
	}
	if(stormEngineC.nearNode.objectType == 'particles') {
		if(stormEngineC.nearNode.visibleOnContext == true) {
			$("#INPUTID_StormEditNode_visible").attr('checked','true');
						
			lines_position();
			lines_rotation();
			
			var currParticlesSelfshadows = (stormEngineC.nearNode.selfshadows == 1) ? 'checked="true"' : '';
			var str= '<br />setSelfshadows <input type="checkbox" id="INPUTID_StormEditNode_particles_selfshadows" '+currParticlesSelfshadows+' />';
			$('#DIVID_StormEditNode_edits').append(str);
			$("#INPUTID_StormEditNode_particles_selfshadows").on('click', function() {
												var enableSelfshadows = $("#INPUTID_StormEditNode_particles_selfshadows").attr('checked');
												if(enableSelfshadows=='checked') stormEngineC.nearNode.setSelfshadows(true);
												else stormEngineC.nearNode.setSelfshadows(false);
											});
											
			var currParticlesShadows = (stormEngineC.nearNode.shadows == 1) ? 'checked="true"' : '';
			var str= '<br />setShadows <input type="checkbox" id="INPUTID_StormEditNode_particles_shadows" '+currParticlesShadows+' />';
			$('#DIVID_StormEditNode_edits').append(str);
			$("#INPUTID_StormEditNode_particles_shadows").on('click', function() {
												var enableShadows = $("#INPUTID_StormEditNode_particles_shadows").attr('checked');
												if(enableShadows=='checked') stormEngineC.nearNode.setShadows(true);
												else stormEngineC.nearNode.setShadows(false);
											});
			
			var str= '<br />setPointSize <input id="INPUTID_StormEditNode_particlesPointSize" value="'+stormEngineC.nearNode.pointSize+'" style="color:#FFF;width:40px">';
			$('#DIVID_StormEditNode_edits').append(str);
			$("#INPUTID_StormEditNode_particlesPointSize").spinner({numberFormat:"n", step: 0.1,
															spin: function(event, ui) {
																stormEngineC.nearNode.setPointSize(ui.value);
															}
														});
														
			var currParticlesPositive = (stormEngineC.nearNode.polarity == 1) ? 'checked' : '';
			var currParticlesNegative = (stormEngineC.nearNode.polarity == 0) ? 'checked' : '';
			var str = "<br /><button type=\"button\" onclick=\"stormEngineC.nearNode.deleteParticles();$('#DIVID_StormEditNode_edits').html('');stormEngineC.PanelListObjects.showListObjects();\">Delete</button>"+
						'<br />setPolarity +<input type="radio" name="INPUTNAME_StormEditNode_particles_polarity" onclick="stormEngineC.nearNode.setPolarity(1);" '+currParticlesPositive+' />'+
						' -<input type="radio" name="INPUTNAME_StormEditNode_particles_polarity" onclick="stormEngineC.nearNode.setPolarity(0);" '+currParticlesNegative+' />'+
						"<table style='width:100%'><tr>"+
							"<td style='width:18px;text-align:left'>setColor</td>"+
							"<td style='text-align:left'>"+
								"<input id='INPUTID_StormEditNode_particles_colorButton' type='file' style='display:none'/>"+
								"<div id='DIVID_StormEditNode_particles_color' title='setColor' onclick='$(this).prev().click();' onmouseover='$(this).css(\"border\", \"1px solid #EEE\");' onmouseout='$(this).css(\"border\", \"1px solid #CCC\");' style='cursor:pointer;width:16px;height:16px;border:1px solid #CCC'></div>"+
							"</td>"+
						"</tr></table>"+
						"<table style='width:100%'><tr>"+
							"<td style='width:18px;text-align:left'>setDisposal</td>"+
							"<td style='text-align:center'>"+
								'W<input type="text" id="INPUTID_StormEditNode_setDisposal_width" value="128" style="width:40px"/>'+
								'H<input type="text" id="INPUTID_StormEditNode_setDisposal_height" value="128" style="width:40px"/>'+
								'<button type="button" id="BUTTONID_StormEditNode_setDisposalWH" style="width:100%;padding:0px">set</button>'+
							"</td>"+
							"<td style='text-align:center'>"+
								'W<input type="text" id="INPUTID_StormEditNode_setDisposal_radius" value="0.5" style="width:40px"/>'+
								'<button type="button" id="BUTTONID_StormEditNode_setDisposalR" style="width:100%;padding:0px">set</button>'+
							"</td>"+
						"</tr></table>"+
						'setDirection <button type="button" onclick="stormEngineC.nearNode.setDirection();">0.0</button>'+
						"<button type=\"button\" onclick=\"stormEngineC.nearNode.setDirection('random');\">random</button>";
						
			$('#DIVID_StormEditNode_edits').append(str);
			document.getElementById('INPUTID_StormEditNode_particles_colorButton').onchange=function() {
				var filereader = new FileReader();
				filereader.onload = function(event) {
					var img = new Image();
					img.onload = function() {
						var splitName = $('#INPUTID_StormEditNode_particles_colorButton').val().split('/');
						splitName = splitName[splitName.length-1];
						
						stormEngineC.nearNode.setColor(img);
						$('#INPUTID_StormEditNode_setDisposal_width').val(img.width);
						$('#INPUTID_StormEditNode_setDisposal_height').val(img.height);
						$('#INPUTID_StormEditNode_particlesDestination_width').val(img.width);
						$('#INPUTID_StormEditNode_particlesDestination_height').val(img.height);
						img.style.width = '16px';
						img.style.height = '16px';
						$('#DIVID_StormEditNode_particles_color').html(img);
						$('#DIVID_StormEditNode_particles_color').attr('title',splitName);
					};
					img.src = event.target.result; // Set src from upload, original byte sequence
				};
				filereader.readAsDataURL(this.files[0]);
			};
			$("#BUTTONID_StormEditNode_setDisposalWH").on('click', function() {
												stormEngineC.nearNode.setDisposal({width:$('#INPUTID_StormEditNode_setDisposal_width').val(),
																					height:$('#INPUTID_StormEditNode_setDisposal_height').val()});
											});
			$("#BUTTONID_StormEditNode_setDisposalR").on('click', function() {
												stormEngineC.nearNode.setDisposal({radius:$('#INPUTID_StormEditNode_setDisposal_radius').val()});
											});
			
			var str= '<br />setLifeDistance <input id="INPUTID_StormEditNode_particlesLifeDistance" value="'+stormEngineC.nearNode.lifeDistance+'" style="color:#FFF;width:40px">';
			$('#DIVID_StormEditNode_edits').append(str);
			$("#INPUTID_StormEditNode_particlesLifeDistance").spinner({numberFormat:"n", step: 0.1,
															spin: function(event, ui) {
																stormEngineC.nearNode.setLifeDistance(ui.value);
															}
														});
														
			var currParticlesDestinationEnable = (stormEngineC.nearNode.enDestination == 1) ? 'checked="true"' : '';
			var str= '<fieldset><legend>PARTICLE DESTINATION</legend>'+
						'ENABLE <input type="checkbox" id="INPUTID_StormEditNode_particles_destination" '+currParticlesDestinationEnable+' />'+
						'<br />setDestinationForce <input id="INPUTID_StormEditNode_particlesDestination_spinnerForce" value="'+stormEngineC.nearNode.destinationForce+'" style="color:#FFF;width:40px">'+
						'<br /><button type="button" id="BUTTONID_StormEditNode_particlesDestination_setDestination">setDestinationWidthHeight</button>'+
							'W<input type="text" id="INPUTID_StormEditNode_particlesDestination_width" value="128" style="width:40px"/>'+
							'H<input type="text" id="INPUTID_StormEditNode_particlesDestination_height" value="128" style="width:40px"/>'+
						'<br /><button type="button" id="BUTTONID_StormEditNode_particlesDestination_setDestinationVolume">setDestinationVolume</button>'+
					'</fieldset>';
			$('#DIVID_StormEditNode_edits').append(str);
			$("#INPUTID_StormEditNode_particles_destination").on('click', function() {
												if(stormEngineC.nearNode.enDestination==1) stormEngineC.nearNode.disableDestination();
												else stormEngineC.nearNode.enableDestination();
											});
			$("#INPUTID_StormEditNode_particlesDestination_spinnerForce").spinner({numberFormat:"n", step: 0.1,
															spin: function(event, ui) {
																stormEngineC.nearNode.setDestinationForce(ui.value);
															}
														});
			$("#BUTTONID_StormEditNode_particlesDestination_setDestination").on('click', function() {
												var enableDest = $("#INPUTID_StormEditNode_particles_destination").attr('checked','true');
												stormEngineC.nearNode.setDestinationWidthHeight({width:$('#INPUTID_StormEditNode_particlesDestination_width').val(),
																								height:$('#INPUTID_StormEditNode_particlesDestination_height').val(),
																								force:$('#INPUTID_StormEditNode_particlesDestination_spinnerForce').val()});
											});
			$("#BUTTONID_StormEditNode_particlesDestination_setDestinationVolume").on('click', function() {
												stormEngineC.pickingCall='setDestinationVolume({voxelizator:_selectedNode_});';  
												stormEngineC.PanelListObjects.show();
												$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
												document.body.style.cursor='pointer';
											});
		} else {
			$("#INPUTID_StormEditNode_visible").removeAttr('checked');
		}
	}
	if(stormEngineC.nearNode.objectType == 'camera') {
		if(stormEngineC.nearNode.visibleOnContext == true) {
			$("#INPUTID_StormEditNode_visible").attr('checked','true');
			
			//$('#DIVID_StormEditNode_edits').html(strTranslateRotate);
			
			// checkbox Set Active
			var str = 	'Set Active: <input id="INPUTID_StormEditNode_nodeCam_setActive" type="checkbox" /><br />';
			$('#DIVID_StormEditNode_edits').append(str);
			
			if(stormEngineC.nearNode.idNum == stormEngineC.defaultCamera.idNum) {
				$("#INPUTID_StormEditNode_nodeCam_setActive").attr('checked','true');
			} else {
				$("#INPUTID_StormEditNode_nodeCam_setActive").removeAttr('checked');
			}
			$("#INPUTID_StormEditNode_nodeCam_setActive").on('click', function() {
												stormEngineC.setWebGLCam(stormEngineC.nearNode);
												stormEngineC.PanelEditNode.updateNearNode();
											});
			
			// FOV
			var str = '<br />setFov: <span id="DIVID_StormEditNode_FOV">'+stormEngineC.nearNode.fov+'</span>'+
						'<div id="DIVID_StormEditNode_FOV_SLIDER"></div>';
			$("#DIVID_StormEditNode_edits").append(str);
			$("#DIVID_StormEditNode_FOV_SLIDER").slider({max:180.0,
												min:0.1,
												value:stormEngineC.nearNode.fov,
												step:0.1,
												slide:function(event,ui){
														stormEngineC.nearNode.setFov(ui.value);
														$('#DIVID_StormEditNode_FOV').text(ui.value);
													}});
													
			// input Focus distance
			var str = 	'Focus distance: <input id="INPUTID_StormEditNode_focusExtern" type="text" value="'+stormEngineC.nearNode.focusExtern+'" style="width:40px"/>m<br />';
						//'FocusInt: <input type="text" value="'+stormEngineC.nearNode.focusIntern+'" style="width:200px"/>m';
			$('#DIVID_StormEditNode_edits').append(str);
			
			$("#INPUTID_StormEditNode_focusExtern").on('keyup', function() {
												if($(this).val() > 0.55) {
													stormEngineC.nearNode.focusExtern = $(this).val();
													stormEngineC.nearNode.setFocusIntern();
												} else {
													$(this).val(0.55);
													stormEngineC.nearNode.focusExtern = $(this).val();
													stormEngineC.nearNode.setFocusIntern();
												}
											});
											
			// checkbox View focus
			var str = 	'View focus: <input id="INPUTID_StormEditNode_nodeCam_viewFocus" type="checkbox" />';
			$('#DIVID_StormEditNode_edits').append(str);
			
			if(stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext == true) {
				$("#INPUTID_StormEditNode_nodeCam_viewFocus").attr('checked','true');
			} else {
				$("#INPUTID_StormEditNode_nodeCam_viewFocus").removeAttr('checked');
			}
			$("#INPUTID_StormEditNode_nodeCam_viewFocus").on('click', function() {
												if(stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext == true) {
													stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext = false;
												} else {
													stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext = true;
												}
												
											});
			
			// checkbox DOF
			var dofStatus = stormEngineC.defaultCamera.DOFenable == false ? '' : 'checked';
			var str = '<br />enableDOF: <input id="INPUTID_StormEditNode_useDOF" type="checkbox" '+dofStatus+'/>';
			$('#DIVID_StormEditNode_edits').append(str);
			
			$("#INPUTID_StormEditNode_useDOF").on('click', function() {
				stormEngineC.defaultCamera.DOFenable = stormEngineC.defaultCamera.DOFenable == false ? true : false;
			});
			
			// checkbox DOF autofocus
			var dofautoStatus = stormEngineC.defaultCamera.autofocus == false ? '' : 'checked';
			var str = '<br />enableAutofocus: <input id="INPUTID_StormEditNode_useAUTOFOCUS" type="checkbox" '+dofautoStatus+'/>';
			$('#DIVID_StormEditNode_edits').append(str);
			
			$("#INPUTID_StormEditNode_useAUTOFOCUS").on('click', function() {
				stormEngineC.defaultCamera.autofocus = stormEngineC.defaultCamera.autofocus == false ? true : false;
			});
	
		} else {
			$("#INPUTID_StormEditNode_visible").removeAttr('checked');
		}
		
	}
	if(stormEngineC.nearNode.objectType == 'light') {
		if(stormEngineC.nearNode.visibleOnContext == true) {
			$("#INPUTID_StormEditNode_visible").attr('checked','true');
			
			if(stormEngineC.nearNode.type != "sun") {
				lines_position();
			}
			// FOV
			var str = '<br />setFov: <span id="DIVID_StormEditNode_FOV">'+stormEngineC.nearNode.fov+'</span>'+
						'<div id="DIVID_StormEditNode_FOV_SLIDER"></div>';
			$("#DIVID_StormEditNode_edits").append(str);
			$("#DIVID_StormEditNode_FOV_SLIDER").slider({max:180.0,
												min:0.1,
												value:stormEngineC.nearNode.fov,
												step:0.1,
												slide:function(event,ui){
														stormEngineC.nearNode.setFov(ui.value);
														$('#DIVID_StormEditNode_FOV').text(ui.value);
													}});
			// COLOR
			var str = 'Color: <div id="DIVID_StormEditNode_color_paramColor" style="width:16px;height:16px;border:1px solid #CCC;cursor:pointer;background:rgb('+parseInt(stormEngineC.nearNode.color.e[0]*255)+','+parseInt(stormEngineC.nearNode.color.e[1]*255)+','+parseInt(stormEngineC.nearNode.color.e[2]*255)+');" ></div>'+
						'<input id="INPUTID_StormEditNode_color" type="text" style="display:none"/>'+
						'Kelvins: <span id="SPANID_StormEditNode_currentKelvins">5770</span>K'+
						'<div id="INPUTID_StormEditNode_kelvins" style="width:200px"></div>'; 
			$('#DIVID_StormEditNode_edits').append(str);
			
			$('#INPUTID_StormEditNode_color').ColorPicker({'onChange':function(hsb, hex, rgb) {
																			stormEngineC.nearNode.setLightColor($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
																			$('#DIVID_StormEditNode_color_paramColor').css('background','rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
																		}
															});
			$('#INPUTID_StormEditNode_color').ColorPickerSetColor({'r':stormEngineC.nearNode.color.e[0], 'g': stormEngineC.nearNode.color.e[1], 'b':stormEngineC.nearNode.color.e[2]});//normalizado 0.0-1.0
			$("#DIVID_StormEditNode_color_paramColor").on('click', function() {
												$('#INPUTID_StormEditNode_color').css('display','block');
												$('#INPUTID_StormEditNode_color').click();
												$('#INPUTID_StormEditNode_color').css('display','none');
												$('.colorpicker').css('zIndex',currentStormZIndex);
											});
											
			$('#INPUTID_StormEditNode_kelvins').slider({ 'value': 5770,
														'max':15000,
														'min':1000,
														'slide':function(event, ui) {
																			stormEngineC.nearNode.setLightColor(ui.value);
																			$('#DIVID_StormEditNode_color_paramColor').css('background','rgb('+parseInt(stormEngineC.nearNode.color.e[0]*255)+','+parseInt(stormEngineC.nearNode.color.e[1]*255)+','+parseInt(stormEngineC.nearNode.color.e[2]*255)+')');
																			$('#SPANID_StormEditNode_currentKelvins').html(ui.value);
																		}});
																		
			// DIRECTION
			if(stormEngineC.nearNode.type == "sun") {
				var str = 	'Direction<br />'+
							'X: <span id="SPANID_StormEditNode_xDirVal">'+stormEngineC.nearNode.direction.e[0].toFixed(2)+'</span>'+
							'<div id="SPANID_StormEditNode_xSlider"></div>'+
							'Z: <span id="SPANID_StormEditNode_zDirVal">'+stormEngineC.nearNode.direction.e[2].toFixed(2)+'</span>'+
							'<div id="SPANID_StormEditNode_zSlider"></div>';
				$('#DIVID_StormEditNode_edits').append(str);
				
				$("#SPANID_StormEditNode_xSlider").slider({	min: -1.0,
										max: 1.0,
										step: 0.001,
										value: parseInt(stormEngineC.nearNode.direction.e[0]),
										slide: function( event, ui ) {
													$('#SPANID_StormEditNode_xDirVal').text(ui.value);
													stormEngineC.lights[0].setDirection($V3([$('#SPANID_StormEditNode_xDirVal').text(), -0.5, $('#SPANID_StormEditNode_zDirVal').text()])); 
												}
									});

				$("#SPANID_StormEditNode_zSlider").slider({	min: -1.0,
										max: 1.0,
										step: 0.001,
										value: parseInt(stormEngineC.nearNode.direction.e[2]),
										slide: function( event, ui ) {
													$('#SPANID_StormEditNode_zDirVal').text(ui.value);
													stormEngineC.lights[0].setDirection($V3([$('#SPANID_StormEditNode_xDirVal').text(), -0.5, $('#SPANID_StormEditNode_zDirVal').text()]));
												}
									}); 

			}
		} else {
			$("#INPUTID_StormEditNode_visible").removeAttr('checked');
		}
	}
	
	if(stormEngineC.nearNode.objectType == 'line') {
		if(stormEngineC.nearNode.visibleOnContext == true) {
			$("#INPUTID_StormEditNode_visible").attr('checked','true');
			
			var strMoves = 	'<div>'+
								'setOrigin: '+
								'<input id="StormEN_spinnerTranslX" name="value" value="'+stormEngineC.nearNode.origin.e[0]+'" style="color:#FFF;width:40px">'+
								'<input id="StormEN_spinnerTranslY" name="value" value="'+stormEngineC.nearNode.origin.e[1]+'" style="color:#FFF;width:40px">'+
								'<input id="StormEN_spinnerTranslZ" name="value" value="'+stormEngineC.nearNode.origin.e[2]+'" style="color:#FFF;width:40px">'+
								'<br />setEnd:'+
								'<input id="StormEN_spinnerETranslX" name="value" value="'+stormEngineC.nearNode.end.e[0]+'" style="color:#FFF;width:40px">'+
								'<input id="StormEN_spinnerETranslY" name="value" value="'+stormEngineC.nearNode.end.e[1]+'" style="color:#FFF;width:40px">'+
								'<input id="StormEN_spinnerETranslZ" name="value" value="'+stormEngineC.nearNode.end.e[2]+'" style="color:#FFF;width:40px">'+
							'</div>';
			$('#DIVID_StormEditNode_edits').html(strMoves);
			$("#StormEN_spinnerTranslX").spinner({numberFormat:"n", step: 0.1,
												spin: function(event, ui) {
													var vecOrigin = $V3([ui.value, $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), $("#StormEN_spinnerETranslY").val(), $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setOrigin(vecOrigin);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												},
												change: function(event, ui) {
													var vecOrigin = $V3([$(this).val(), $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), $("#StormEN_spinnerETranslY").val(), $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setOrigin(vecOrigin);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												}
												});
				$("#StormEN_spinnerTranslY").spinner({numberFormat:"n", step: 0.1,
												spin: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), ui.value, $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), $("#StormEN_spinnerETranslY").val(), $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setOrigin(vecOrigin);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												},
												change: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), $(this).val(), $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), $("#StormEN_spinnerETranslY").val(), $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setOrigin(vecOrigin);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												}
												});
				$("#StormEN_spinnerTranslZ").spinner({numberFormat:"n", step: 0.1,
												spin: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), ui.value]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), $("#StormEN_spinnerETranslY").val(), $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setOrigin(vecOrigin);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												},
												change: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), $(this).val()]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), $("#StormEN_spinnerETranslY").val(), $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setOrigin(vecOrigin);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												}
												});
				$("#StormEN_spinnerETranslX").spinner({numberFormat:"n", step: 0.1,
												spin: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([ui.value, $("#StormEN_spinnerETranslY").val(), $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setEnd(vecEnd);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												},
												change: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([$(this).val(), $("#StormEN_spinnerETranslY").val(), $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setEnd(vecEnd);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												}
												});
				$("#StormEN_spinnerETranslY").spinner({numberFormat:"n", step: 0.1,
												spin: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), ui.value, $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setEnd(vecEnd);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												},
												change: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), $(this).val(), $("#StormEN_spinnerETranslZ").val()]);
													stormEngineC.nearNode.setEnd(vecEnd);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												}
												});
				$("#StormEN_spinnerETranslZ").spinner({numberFormat:"n", step: 0.1,
												spin: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), $("#StormEN_spinnerETranslY").val(), ui.value]);
													stormEngineC.nearNode.setEnd(vecEnd);
													stormEngineC.debugValues = [];
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end');
												},
												change: function(event, ui) {
													var vecOrigin = $V3([$("#StormEN_spinnerTranslX").val(), $("#StormEN_spinnerTranslY").val(), $("#StormEN_spinnerTranslZ").val()]);
													var vecEnd = $V3([$("#StormEN_spinnerETranslX").val(), $("#StormEN_spinnerETranslY").val(), $(this).val()]);
													stormEngineC.nearNode.setEnd(vecEnd);
													stormEngineC.debugValues = []; 
													stormEngineC.setDebugValue(0, vecOrigin, stormEngineC.nearNode.name+' origin');
													stormEngineC.setDebugValue(1, vecEnd, stormEngineC.nearNode.name+' end'); 
												}
												});
		} else {
			$("#INPUTID_StormEditNode_visible").removeAttr('checked');
		}
	}
	
	if(stormEngineC.nearNode.objectType == 'voxelizator') {
		var str = ''+ 
			'<br />Grid size: <span id="DIVID_StormEditNode_GImake_size"></span>m'+
			'<div id="DIVID_StormEditNode_GImake_SLIDER_size"></div>'+
			'<br />Grid resolution: <span id="DIVID_StormEditNode_GImake_resolution"></span>'+
			'<div id="DIVID_StormEditNode_GImake_SLIDER_resolution"></div>'+
			'<br />Fill mode:'+
			'<div>'+
				'Albedo:<input type="checkbox" id="CHECKBOX_StormEditNode_GImake_albedo"/>'+
				'Position:<input type="checkbox" id="CHECKBOX_StormEditNode_GImake_position"/>'+
				'Normal:<input type="checkbox" id="CHECKBOX_StormEditNode_GImake_normal"/>'+
			'</div>'+
			'<button type="button" id="DIVID_StormEditNode_GImake">generateFromScene</button>'+
			'<div id="DIVID_StormEditNode_GImakeOUTPUT"></div>'; 
		$("#DIVID_StormEditNode_edits").append(str);
		
		$('#DIVID_StormEditNode_GImake_size').text(stormEngineC.nearNode.size); 
		$('#DIVID_StormEditNode_GImake_resolution').text(stormEngineC.nearNode.resolution); 
		$('#DIVID_StormEditNode_GImakeOUTPUT').html(''); 
		if(stormEngineC.nearNode.image3D_VoxelsColor != undefined) {
			var image = stormEngineC.nearNode.image3D_VoxelsColor;
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('3D ImageElement Albedo<br />'); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
			document.getElementById('CHECKBOX_StormEditNode_GImake_albedo').checked = true;
		}
		if(stormEngineC.nearNode.image3D_VoxelsPositionX != undefined) {
			var image = stormEngineC.nearNode.image3D_VoxelsPositionX;
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionX<br />'); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
			document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked = true;
		}
		if(stormEngineC.nearNode.image3D_VoxelsPositionY != undefined) {
			var image = stormEngineC.nearNode.image3D_VoxelsPositionY;
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionY<br />'); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
			document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked = true;
		}
		if(stormEngineC.nearNode.image3D_VoxelsPositionZ != undefined) {
			var image = stormEngineC.nearNode.image3D_VoxelsPositionZ;
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionZ<br />'); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
			document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked = true;
		}
		if(stormEngineC.nearNode.image3D_VoxelsNormal != undefined) {
			var image = stormEngineC.nearNode.image3D_VoxelsNormal;
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement Normal<br />'); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
			document.getElementById('CHECKBOX_StormEditNode_GImake_normal').checked = true;
		}
		
		// GI functions
		$("#DIVID_StormEditNode_GImake_SLIDER_size").slider({max:150.0,
													min:1.0,
													value:stormEngineC.nearNode.size,
													step:1,
													slide:function(event,ui){
															stormEngineC.nearNode.size = ui.value;
															$('#DIVID_StormEditNode_GImake_size').text(ui.value); 
														}});

		var currentResSLIDER = 0; 
		for(var cr=2, maxr=stormEngineC.nearNode.resolution; cr <= maxr; cr*=2) currentResSLIDER++;
		$("#DIVID_StormEditNode_GImake_SLIDER_resolution").slider({max:9,
													min:4,
													value:currentResSLIDER,
													step:1,
													slide:function(event,ui){
															var res = 2;
															for(var n=1; n < ui.value; n++) res *= 2;
															
															stormEngineC.nearNode.resolution = res;
															$('#DIVID_StormEditNode_GImake_resolution').text(res);
														}});
		$("#DIVID_StormEditNode_GImake").on('click', function() { 
				$('#DIVID_StormEditNode_GImakeOUTPUT').text('Performing voxelization...');
				
				setTimeout(function() { 
								var arraFillmodes = [];
								if(document.getElementById('CHECKBOX_StormEditNode_GImake_albedo').checked == true) arraFillmodes.push("albedo");
								if(document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked == true) arraFillmodes.push("position");
								if(document.getElementById('CHECKBOX_StormEditNode_GImake_normal').checked == true) arraFillmodes.push("normal");
								if(arraFillmodes.length > 0) {
									var voxelizator = stormEngineC.nearNode;   
									voxelizator.generateFromScene({size: stormEngineC.nearNode.size,
																	resolution: stormEngineC.nearNode.resolution,
																	fillmode: arraFillmodes,
																	ongenerate:function() {
																		$('#DIVID_StormEditNode_GImakeOUTPUT').html('');
																		var image = voxelizator.get3DImageElement("albedo");
																		if(image) {
																			image.style.width = '50px';
																			image.style.border = '1px solid #FFF';
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('3D ImageElement Albedo<br />');  
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																		}
																		var image = voxelizator.get3DImageElement("positionX")
																		if(image) {
																			image.style.width = '50px';
																			image.style.border = '1px solid #FFF';
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionX<br />');  
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																		}
																		var image = voxelizator.get3DImageElement("positionY")
																		if(image) {
																			image.style.width = '50px';
																			image.style.border = '1px solid #FFF';
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionY<br />');  
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																		}
																		var image = voxelizator.get3DImageElement("positionZ")
																		if(image) {
																			image.style.width = '50px';
																			image.style.border = '1px solid #FFF';
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionZ<br />');  
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																		}
																		var image = voxelizator.get3DImageElement("normal")
																		if(image) {
																			image.style.width = '50px';
																			image.style.border = '1px solid #FFF';
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement Normal<br />');  
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																			$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																		}
																	}});      
								} else {
									alert("Check at least one fillmode");
									$('#DIVID_StormEditNode_GImakeOUTPUT').text('');
								}
							},10);
			});	
	}
	
	
};
