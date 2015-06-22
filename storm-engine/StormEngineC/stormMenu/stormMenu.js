/**
* @class
* @constructor
* @param {Object} jsonIn
* @param {HTMLDivElement} jsonIn.content targetcontent
* @param {Hex} [jsonIn.color="#FFF"]
* @param {Hex} [jsonIn.background="#262626"]
* @param {Hex} [jsonIn.hovercolor="#262626"]
* @param {Hex} [jsonIn.hoverbackground="#CCC"]
* @param {Function} [jsonIn.mouseover]
*/
StormMenu = function(jsonIn) {
	this.mouseover = jsonIn.mouseover;
	this.color = jsonIn.color || "#FFF";
	this.background = jsonIn.background || "#262626";
	this.hovercolor = jsonIn.hovercolor || "#262626";
	this.hoverbackground = jsonIn.hoverbackground || "#CCC";
	
	this.content = jsonIn.content;
	this.content.style.backgroundColor = this.background;
	this.content.style.position = "absolute";
	this.content.style.display = "none";
	this.content.style.padding = "1px";
	
	this.content.addEventListener('mouseout', function(e) {
		var obj = e.relatedTarget;//prevent if over childs
		while(obj != undefined) {
			if(obj == this) return;
			obj=obj.parentNode;
		}
	
		_this.content.style.display = "none";
		_this.button.style.backgroundColor = _this.background;
		_this.button.style.color = _this.color;
		
		for(var n = 0;n < _this.content.childNodes.length;n++) {
			if(_this.content.childNodes[n].getAttribute('data-menucontent') != undefined)
				_this.content.childNodes[n].style.display = "none";
		}
	}, true);	
	
	for(var n = 0;n < this.content.childNodes.length;n++) {
		var childNode = this.content.childNodes[n];
		if(childNode.getAttribute('data-menucontent') != undefined) {
			var menu = new StormMenu({content:childNode});
		} else {
			childNode.style.cursor = "pointer";
			childNode.addEventListener('mouseover', function(e) {
				this.style.backgroundColor = _this.hoverbackground;
				this.style.color = _this.hovercolor;
			}, false);
			childNode.addEventListener('mouseout', function(e) {
				this.style.backgroundColor = _this.background;
				this.style.color = _this.color;
			}, false);	
		}
	}
	
	
	
	
	this.button = jsonIn.content.nextSibling;
	this.button.style.cursor = "pointer";
	this.button.style.padding = "2px";
	
	var _this = this;
	this.button.addEventListener('mouseover', function(e) {
		for(var n = 0;n < this.parentNode.childNodes.length;n++) {
			var chilnode = this.parentNode.childNodes[n];
			if(chilnode.getAttribute('data-menucontent') != undefined) // close content around of this
				chilnode.style.display = "none";
		}
	
		_this.button.style.backgroundColor = _this.hoverbackground;
		_this.button.style.color = _this.hovercolor;
		
		_this.content.style.display = "table-cell";
		_this.content.style.marginTop = -(_this.content.offsetHeight-3)+"px"; 
		_this.content.style.marginLeft = (_this.button.offsetWidth/2)+"px";

		if(_this.mouseover != undefined) _this.mouseover();
	}, false);	
	
};
StormMenu.prototype.close = function() {
	this.content.dispatchEvent(new Event('mouseout'));
};