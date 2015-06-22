/**
* @class
* @constructor

* @property {WebGLBuffer} nodeMeshVertexBuffer
* @property {WebGLBuffer} nodeMeshNormalBuffer
* @property {WebGLBuffer} nodeMeshTextureBuffer
* @property {WebGLBuffer} nodeMeshIndexBuffer

* @property {Array} nodeMeshVertexArray
* @property {Int} nodeMeshVertexArrayItemSize
* @property {Int} nodeMeshVertexArrayNumItems

* @property {Array} nodeMeshNormalArray
* @property {Int} nodeMeshNormalArrayItemSize
* @property {Int} nodeMeshNormalArrayNumItems

* @property {Array} nodeMeshTextureArray
* @property {Int} nodeMeshTextureArrayItemSize
* @property {Int} nodeMeshTextureArrayNumItems

* @property {Array} nodeMeshIndexArray
* @property {Int} nodeMeshIndexArrayItemSize
* @property {Int} nodeMeshIndexArrayNumItems

* @property {Int} [drawElementsMode=4] 0=POINTS, 3=LINE_STRIP, 2=LINE_LOOP, 1=LINES, 5=TRIANGLE_STRIP, 6=TRIANGLE_FAN and 4=TRIANGLES
*/
StormBufferObject = function() {
	this.gl = stormEngineC.stormGLContext.gl;
	
	this.node;
	
	
	// buffers del objeto para opengl
	this.nodeMeshVertexBuffer;
	this.nodeMeshVertexBufferItemSize;
	this.nodeMeshVertexBufferNumItems;

	this.nodeMeshNormalBuffer;
	this.nodeMeshNormalBufferItemSize;
	this.nodeMeshNormalBufferNumItems;
	
	this.nodeMeshTextureBuffer;
	this.nodeMeshTextureBufferItemSize;
	this.nodeMeshTextureBufferNumItems;
	
		this.nodeMeshTextureUnitBuffer;
		this.nodeMeshTextureUnitBufferItemSize;
		this.nodeMeshTextureUnitBufferNumItems;
	
	this.nodeMeshIndexBuffer;
	this.nodeMeshIndexBufferItemSize;
	this.nodeMeshIndexBufferNumItems;
	
	// arrays nativos del objeto
	this.nodeMeshVertexArray;
	this.nodeMeshVertexArrayItemSize;
	this.nodeMeshVertexArrayNumItems;
	this.nodeMeshVertexArrayFrameWSpace;
	
	this.nodeMeshNormalArray = undefined;
	this.nodeMeshNormalArrayItemSize;
	this.nodeMeshNormalArrayNumItems;
	
	this.nodeMeshTextureArray = undefined;
	this.nodeMeshTextureArrayItemSize;
	this.nodeMeshTextureArrayNumItems;
	
		this.nodeMeshTextureUnitArray = undefined;
		this.nodeMeshTextureUnitArrayItemSize;
		this.nodeMeshTextureUnitArrayNumItems;
	
	this.nodeMeshIndexArray = undefined;
	this.nodeMeshIndexArrayItemSize;
	this.nodeMeshIndexArrayNumItems;
	
	// matrix WSpace temporal de este bufferObject. (por cada frame se actualiza)
	this.MPOSFrame = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	
	this.drawElementsMode = 4;
};
/**
* @type Void
* @param	{Object} jsonIn
* 	@param {Array|Float32Array} jsonIn.vertexArray Vertices
* 	@param {Array|Float32Array} jsonIn.normalArray Normals
* 	@param {Array|Float32Array} jsonIn.textureArray Texture coords
* 	@param {Array|Float32Array} jsonIn.textureUnitArray Texture unit numbers
* 	@param {Array|Uint16Array} jsonIn.indexArray Indices
*/
StormBufferObject.prototype.attachBuffers = function(stormMeshObject) {
	if(stormMeshObject.vertexArray != undefined) {
		var vertexItemSize = 3, vertexNumItems = stormMeshObject.vertexArray.length/3;
		var vArray = (stormMeshObject.vertexArray instanceof Float32Array) ? stormMeshObject.vertexArray : new Float32Array(stormMeshObject.vertexArray);
		
		this.nodeMeshVertexArray = vArray;// arrays nativos recibidos
		this.nodeMeshVertexArrayItemSize = vertexItemSize;
		this.nodeMeshVertexArrayNumItems = vertexNumItems;
		
		this.nodeMeshVertexBuffer = this.gl.createBuffer();// buffers del objeto para opengl
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshVertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, vArray, this.gl.STATIC_DRAW);
		this.nodeMeshVertexBufferItemSize = vertexItemSize;
		this.nodeMeshVertexBufferNumItems = vertexNumItems;
	}
	if(stormMeshObject.normalArray != undefined) {
		var normalItemSize = 3, normalNumItems = stormMeshObject.normalArray.length/3;
		var nArray = (stormMeshObject.normalArray instanceof Float32Array) ? stormMeshObject.normalArray : new Float32Array(stormMeshObject.normalArray);
		
		this.nodeMeshNormalArray = nArray;
		this.nodeMeshNormalArrayItemSize = normalItemSize;
		this.nodeMeshNormalArrayNumItems = normalNumItems;
		
		this.nodeMeshNormalBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshNormalBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, nArray, this.gl.STATIC_DRAW);
		this.nodeMeshNormalBufferItemSize = normalItemSize;
		this.nodeMeshNormalBufferNumItems = normalNumItems;
	}
	if(stormMeshObject.textureArray != undefined) {
		var textureItemSize = 3, textureNumItems = stormMeshObject.textureArray.length/3;
		var tArray = (stormMeshObject.textureArray instanceof Float32Array) ? stormMeshObject.textureArray : new Float32Array(stormMeshObject.textureArray);
		
		this.nodeMeshTextureArray = tArray;
		this.nodeMeshTextureArrayItemSize = textureItemSize;
		this.nodeMeshTextureArrayNumItems = textureNumItems;
		
		this.nodeMeshTextureBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshTextureBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, tArray, this.gl.STATIC_DRAW);
		this.nodeMeshTextureBufferItemSize = textureItemSize;
		this.nodeMeshTextureBufferNumItems = textureNumItems;
	}
	if(stormMeshObject.textureUnitArray != undefined) {
		var textureUnitItemSize = 1, textureUnitNumItems = stormMeshObject.textureUnitArray.length;
		var tuArray = (stormMeshObject.textureUnitArray instanceof Float32Array) ? stormMeshObject.textureUnitArray : new Float32Array(stormMeshObject.textureUnitArray);
		
		this.nodeMeshTextureUnitArray = tuArray;
		this.nodeMeshTextureUnitArrayItemSize = textureUnitItemSize;
		this.nodeMeshTextureUnitArrayNumItems = textureUnitNumItems;
		
		this.nodeMeshTextureUnitBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshTextureUnitBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, tuArray, this.gl.STATIC_DRAW);
		this.nodeMeshTextureUnitBufferItemSize = textureUnitItemSize;
		this.nodeMeshTextureUnitBufferNumItems = textureUnitNumItems;
	}
	if(stormMeshObject.indexArray != undefined) {
		var indexItemSize = 1, indexNumItems = stormMeshObject.indexArray.length;
		var iArray = (stormMeshObject.indexArray instanceof Uint16Array) ? stormMeshObject.indexArray : new Uint16Array(stormMeshObject.indexArray);
		
		this.nodeMeshIndexArray = iArray;
		this.nodeMeshIndexArrayItemSize = indexItemSize;
		this.nodeMeshIndexArrayNumItems = indexNumItems;
	
		this.nodeMeshIndexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeMeshIndexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, iArray, this.gl.STATIC_DRAW);
		this.nodeMeshIndexBufferItemSize = indexItemSize;
		this.nodeMeshIndexBufferNumItems = indexNumItems;
	}
	
};
/**
* @private
*/
StormBufferObject.prototype.attachBuffersSeparateXYZ = function(arrX,arrY,arrZ) {
	// PACK 1FLOAT (0.0-1.0) TO 4FLOAT RGBA (0.0-1.0, 0.0-1.0, 0.0-1.0, 0.0-1.0)
	var arrayX = new Uint8Array(arrX.length*4); 
	var arrayY = new Uint8Array(arrY.length*4); 
	var arrayZ = new Uint8Array(arrZ.length*4); 
	for(var n = 0, f = arrX.length; n < f; n++) {  
		var idd = n*4;
		var arrPack;
		arrPack = stormEngineC.utils.pack((arrX[n]+1000.0)/2000.0);
		arrayX[idd+0] = arrPack[0]*256;
		arrayX[idd+1] = arrPack[1]*256;
		arrayX[idd+2] = arrPack[2]*256;
		arrayX[idd+3] = arrPack[3]*256;
		arrPack = stormEngineC.utils.pack((arrY[n]+1000.0)/2000.0);
		arrayY[idd+0] = arrPack[0]*256;
		arrayY[idd+1] = arrPack[1]*256;
		arrayY[idd+2] = arrPack[2]*256;
		arrayY[idd+3] = arrPack[3]*256;
		arrPack = stormEngineC.utils.pack((arrZ[n]+1000.0)/2000.0);
		arrayZ[idd+0] = arrPack[0]*256;
		arrayZ[idd+1] = arrPack[1]*256;
		arrayZ[idd+2] = arrPack[2]*256;
		arrayZ[idd+3] = arrPack[3]*256;
	}
	// X
	this.nodeMeshVertexArrayX = new Uint8Array(arrX);// arrays nativos recibidos
	
	this.nodeMeshVertexBufferX = this.gl.createBuffer();// buffers del objeto para opengl
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshVertexBufferX);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayX), this.gl.DYNAMIC_DRAW);
	// Y
	this.nodeMeshVertexArrayY = new Uint8Array(arrY);// arrays nativos recibidos
	
	this.nodeMeshVertexBufferY = this.gl.createBuffer();// buffers del objeto para opengl
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshVertexBufferY);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayY), this.gl.DYNAMIC_DRAW);
	// Z
	this.nodeMeshVertexArrayZ = new Uint8Array(arrZ);// arrays nativos recibidos
	
	this.nodeMeshVertexBufferZ = this.gl.createBuffer();// buffers del objeto para opengl
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshVertexBufferZ); 
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayZ), this.gl.DYNAMIC_DRAW);
	
};
/**
* Extrude all triangles of this buffer
* @type Void
* @param	{Object} jsonIn
* 	@param {StormV3} [jsonIn.direction=$V3([0.0,1.0,0.0])] Direction vector
* 	@param {Float} [jsonIn.dim=0.5] Length of extrusion
* 	@param {Float} [jsonIn.bevel] Length of bevel
* 	@param {Float} [jsonIn.bevelAngle] Angle of bevel
*/
StormBufferObject.prototype.extrude = function(jsonIn) {
	var jIn = {	direction:(jsonIn == undefined || jsonIn.direction == undefined)?undefined:jsonIn.direction,
				dim:(jsonIn == undefined || jsonIn.dim == undefined)?undefined:jsonIn.dim,
				bevel:(jsonIn == undefined || jsonIn.bevel == undefined)?undefined:jsonIn.bevel,
				bevelAngle:(jsonIn == undefined || jsonIn.bevelAngle == undefined)?undefined:jsonIn.bevelAngle};

	var arr = [];
	for(var nB = 0, fB = this.nodeMeshVertexArray.length/9; nB < fB; nB++) {
		var id = nB*9;
		arr.push(	[$V3([this.nodeMeshVertexArray[id],this.nodeMeshVertexArray[id+1],this.nodeMeshVertexArray[id+2]]),
					$V3([this.nodeMeshVertexArray[id+3],this.nodeMeshVertexArray[id+4],this.nodeMeshVertexArray[id+5]]),
					$V3([this.nodeMeshVertexArray[id+6],this.nodeMeshVertexArray[id+7],this.nodeMeshVertexArray[id+8]])]);
	}
	this.node.extrude({	arrayV:arr,
						direction:jIn.direction,
						dim:jIn.dim,
						bevel:jIn.bevel,
						bevelAngle:jIn.bevelAngle});

};