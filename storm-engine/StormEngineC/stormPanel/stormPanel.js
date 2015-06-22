/**
* @class
* @constructor
  
* @property {JqueryElement} $
* @property {HTMLElement} De

* @param {String} DIVID
* @param {String} paneltitle
* @param {String} [html]
*/
StormPanel = function(strAttrID, paneltitle, html) {
	this.strAttrID = strAttrID;
	
	var str = ''+
		'<div id="'+strAttrID+'_MENU" class="SECmenu SECround5" style="left:50%;top:20%;">'+ 
			'<div class="SECround5TL SECround5TR SECmenuTitle">'+
				'<div class="SECmenuTitleText">'+paneltitle+'</div>'+
				'<div class="SECmenuTitleClose"><div class="SECmenuTitleCloseImg"></div></div>'+
			'</div>'+
			'<div id="'+strAttrID+'_content" class="SECround5BL SECround5BR SECmenuContent">'+ 
				
			'</div>'+
		'</div>';
	$('body').append(str);
	if(html == undefined) {
		var node = document.getElementById(strAttrID);
		node.parentNode.removeChild(node);
		document.getElementById(strAttrID+'_content').appendChild(node);  
	} else document.getElementById(strAttrID+'_content').innerHTML = html;  
	
	this.$ = $("#"+strAttrID+"_MENU");
	this.De = DGE(strAttrID+"_MENU");
	
	var _this = this;
	$("#"+strAttrID+"_MENU").draggable({stop:function(event, ui) {
											localStorage[_this.strAttrID+'_left'] = ui.position.left;
											localStorage[_this.strAttrID+'_top'] = ui.position.top;
										}});
	
	$(document).ready(function(){
		var left=screen.availWidth/4, top=screen.availWidth/6;
		if(localStorage[_this.strAttrID+'_left'] != undefined) {
			left = localStorage[_this.strAttrID+'_left'];
			top = localStorage[_this.strAttrID+'_top'];
		}
		DGE(_this.strAttrID+'_MENU').style.left = left+'px';
		DGE(_this.strAttrID+'_MENU').style.top = top+'px';
	});
	
	$("#"+strAttrID+"_MENU").resizable({resize:function(event, ui) {
			$("#"+strAttrID+"_MENU").css({width: ui.size.width, height: ui.size.height});
			$("#"+strAttrID+"_MENU .SECmenuContent").css({	width: (ui.size.width-10)+'px',
															height: (ui.size.height-$("#"+strAttrID+"_MENU .SECmenuTitle").height()-10)+'px'});
		}});
	$("#"+strAttrID+"_MENU .SECmenuTitle").on('mousedown', function() {
		$(".SECmenu").css('z-index','0');
		$("#"+strAttrID+"_MENU").css('z-index','99');    
	});	
	
	$("#"+strAttrID+"_MENU .SECmenuTitleCloseImg").on('mousedown', function(e) {
		e.stopPropagation(); 
	});		
	$("#"+strAttrID+"_MENU .SECmenuTitleCloseImg").on('click', function(e) {
		$("#"+strAttrID+"_MENU").hide(200);
	});	
	
	$("#"+strAttrID+"_MENU .SECmenuContent").on('mousedown', function(e) {
		e.stopPropagation();
		$(".SECmenu").css('z-index','0');
		$("#"+strAttrID+"_MENU").css('z-index','99'); 
	});	
};
StormPanel.prototype.show = function(strAttrID) {
	$(".SECmenu").css('z-index','0');
	$("#"+this.strAttrID+"_MENU").css('z-index','99').show(200); 
};