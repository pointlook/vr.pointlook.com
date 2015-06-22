/**
* @class
* @constructor
*/
StormEngineC_PanelListObjects = function() {
	
};

/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.loadPanel = function() {
	var html = '<div id="DIVID_STORMOBJECTS_LIST"></div>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelListObjects', 'LIST OBJECTS', html);
};

/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
	
	this.showListObjects();
};

/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.showListObjects = function() {
	var str = '';
	for(var n=0, f = stormEngineC.nodes.length; n < f; n++) {
		if(stormEngineC.nodes[n].objectType != 'light' && stormEngineC.nodes[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'node' && stormEngineC.nearNode == stormEngineC.nodes[n]) ? '#444' : '#000';
			var colorText = (stormEngineC.nodes[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.nodes["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.nodes[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.nodesCam.length; n < f; n++) {
		if(stormEngineC.nodesCam[n].systemVisible == true && stormEngineC.nodesCam[n].idNum != 0) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'camera' && stormEngineC.nearNode == stormEngineC.nodesCam[n]) ? '#444' : '#000';
			var colorText = (stormEngineC.nodesCam[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.nodesCam["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.nodesCam[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.lines.length; n < f; n++) {
		if(stormEngineC.lines[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'line' && stormEngineC.nearNode == stormEngineC.lines[n]) ? '#444' : '#000';
			var colorText = (stormEngineC.lines[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.lines["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.lines[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.lights.length; n < f; n++) {
		if(stormEngineC.lights[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'light' && stormEngineC.nearNode == stormEngineC.lights[n]) ? '#444' : '#000';
			var colorText = (stormEngineC.lights[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.lights["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.lights[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		if(stormEngineC.polarityPoints[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'polarityPoint' && stormEngineC.nearNode == stormEngineC.polarityPoints[n]) ? '#444' : '#000';
			var colorText = (stormEngineC.polarityPoints[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.polarityPoints["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.polarityPoints[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.forceFields.length; n < f; n++) {
		if(stormEngineC.forceFields[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'forceField' && stormEngineC.nearNode == stormEngineC.forceFields[n]) ? '#444' : '#000';
			var colorText = (stormEngineC.forceFields[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.forceFields["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.forceFields[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.particles.length; n < f; n++) {
		if(stormEngineC.particles[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'particles' && stormEngineC.nearNode == stormEngineC.particles[n]) ? '#444' : '#000';
			var colorText = (stormEngineC.particles[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.particles["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.particles[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.voxelizators.length; n < f; n++) {
		var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'voxelizator' && stormEngineC.nearNode == stormEngineC.voxelizators[n]) ? '#444' : '#000';
		var colorText = '#FFF';
		str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.voxelizators["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.voxelizators[n].name+"</div>";
	} 
	str += '';
	$('#DIVID_STORMOBJECTS_LIST').html(str);
	
	
	$("#DIVID_STORMOBJECTS_LIST div").css({	'cursor':'pointer',
											'border':'1px solid #444'});
	$("#DIVID_STORMOBJECTS_LIST div").bind('mouseover', function() {
											$(this).css({'border':'1px solid #CCC'});
										});
	$("#DIVID_STORMOBJECTS_LIST div").bind('mouseout', function() {
											$(this).css({'border':'1px solid #444'});
										});
};
/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.select = function(element, node) {
	var selectedNode = node; 
	if(stormEngineC.pickingCall != undefined) {
		if(element != undefined) element.css("background-color","#444");
		var strEv = "stormEngineC.nearNode."+stormEngineC.pickingCall.replace(/_selectedNode_/g,"selectedNode"); 
		try {
			eval(strEv);
		}catch(e) {
		}
		stormEngineC.pickingCall = undefined;
		document.body.style.cursor='default'; 
		if(element != undefined) element.css("background-color","#000");
		stormEngineC.PanelEditNode.updateNearNode(); 
	} else {
		$("#DIVID_STORMOBJECTS_LIST div").css("background-color","#000");
		if(element != undefined) element.css("background-color","#444");  
		stormEngineC.selectNode(node);
	}
};

