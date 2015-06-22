 /**
* @class
* @constructor

* @property {StormV3} origin 
* @property {StormV3} end 
*/
StormLine = function() {
	this.idNum;
	this.name = '';
	this.objectType = 'line';
	this.visibleOnContext = true; 
	this.visibleOnRender = true; 
	this.systemVisible = true; 
	
	
	this.origin;//$V3
	this.end;//$V3
	this.vecOriginColor = $V3([1.0,1.0,1.0]);
	this.vecEndColor = $V3([0.0,0.0,0.0]);
	
	this.vertexBuffer;this.vertexLocBuffer;this.indexBuffer;
	
	this.gl = stormEngineC.stormGLContext.gl;
};

/**
* Set the line origin
* @type Void
* @param {StormV3} vecOrigin Origin point
*/
StormLine.prototype.setOrigin = function(vecOrigin) {
	this.origin = vecOrigin;
	this.refresh();
};

/**
* Set the line end
* @type Void
* @param {StormV3} vecEnd End point
*/
StormLine.prototype.setEnd = function(vecEnd) {
	this.end = vecEnd;
	this.refresh();
};

/**
* Set the line origin color
* @type Void
* @param {StormV3} vecOriginColor Origin color normalized
*/
StormLine.prototype.setOriginColor = function(vecOriginColor) {
	this.vecOriginColor = vecOriginColor;
	this.refresh();
};

/**
* Set the line end color
* @type Void
* @param {StormV3} vecEndColor End color normalized
*/
StormLine.prototype.setEndColor = function(vecEndColor) {
	this.vecEndColor = vecEndColor;
	this.refresh();
};

/**
 * @private 
 */
StormLine.prototype.refresh = function() {
	var linesVertexArray = [];
	var linesVertexLocArray = [];
	var linesIndexArray = [];
	linesVertexArray.push(this.origin.e[0], this.origin.e[1], this.origin.e[2], this.end.e[0], this.end.e[1], this.end.e[2]);
	linesVertexLocArray.push(this.vecOriginColor.e[0],this.vecOriginColor.e[1],this.vecOriginColor.e[2], this.vecEndColor.e[0], this.vecEndColor.e[1], this.vecEndColor.e[2]);
	linesIndexArray.push(0, 1);
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(linesVertexArray), this.gl.STATIC_DRAW);
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexLocBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(linesVertexLocArray), this.gl.STATIC_DRAW);
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(linesIndexArray), this.gl.STATIC_DRAW);
};
