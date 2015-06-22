var numId = 0;
var numIdBullet = 0;
/**
* @class
* @constructor
  
* @property {Int} idNum
* @property {String} name
* @property {String} objectType 'node'|'camera'|'light'|'particles'|'polarityPoint'|'forceField'
* @property {Array<StormBufferObject>} buffersObjects StormBufferObjects associated with the node
* @property {StormM16} MPOS
* @property {StormM16} MROTX 
* @property {StormM16} MROTY 
* @property {StormM16} MROTZ
* @property {StormM16} MROTXYZ 
*/
StormNode = function() {
	this.childNodes = [];
	this.buffersObjects = [];
	this.onloadFunction = undefined; 
	this.isDraggable = false;
	this.onmousedownFunction = undefined;
	this.onmouseupFunction = undefined;
	this.onCollisionFunction = undefined;
	
	this.idNum;
	this.name = '';
	this.objectType = 'node'; // 'node', 'camera' or 'light'
	
	this.proy = 1; // projection type 1=perspective 2=ortho
	this.mPMatrix = $M16([	1.0, 0.0, 0.0, 0.0,
							0.0, 1.0, 0.0, 0.0,
							0.0, 0.0, 1.0, 0.0,
							0.0, 0.0, 0.0, 1.0]); 
	this.fov = 45;
	this.fovOrtho = 10;
	this.pointSize = 2.0;
	
	this.visibleOnContext = true; 
	this.visibleOnRender = true; 
	this.systemVisible = true; 
	this.shadows = true;
	this.timeImpulse = 0;
	this.timeTorque = 0;
	
	this.MPOS = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTX = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTY = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTZ = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTXYZ = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.rotX = 0.0;
	this.rotY = 0.0;
	this.rotZ = 0.0;
	this.VSCALE = $V3([1.0,1.0,1.0]);
	this.materialUnits = [];
	
	
	// Global Timeline
	this.animController = 'GlobalTimeline'; // GlobalTimeline is default animation controller. GlobalTimeline or LocalTimeline
	this.animWMatrix = []; // array of $M16 sort by frames for Global Timeline
	this.animMax = undefined; // max frame for Global Timeline
	this.animMin = undefined; // min frame for Global Timeline
	
	// Animation Layers for Local Timeline
	this.currLanimL = 0; // current layer if animController is 'LocalTimeline'
	this.animWMatrixLayerLocalTimeline = []; // array of animWMatrix arrays [0 = Array animWMatrix[] for Layer0, ", "]
	this.animMaxLayerLocalTimeline = []; // array of max frame for respective currLanimL
	this.animMinLayerLocalTimeline = []; // array of min frame for respective currLanimL
	this.animCurrentLayerLocalTimeline = []; // array of current frame for respective currLanimL
	this.animLoopLayerLocalTimeline = []; // array of bools for loop the animation for respective currLanimL
	this.playLocalTimeline = false;
	
	// jigLibJS2
	this.body = undefined;
	this.constraint = undefined;
	this.constraintParentNode = undefined;
	this.car = undefined;
	this.wheelFL;
	this.wheelFR;
	this.wheelBL;
	this.wheelBR;
	this.ndWheelFL;
	this.ndWheelFR;
	this.ndWheelBL;
	this.ndWheelBR;
	this.carMaxVelocity = 10;
	this.carEngineBreakValue = 0.5;
	this.carSteerAngle = 50;
	
	this.useJigLibTrimesh = false;
	this.jigLibTrimeshParams = {};
	//
	
	// StormRenderCL
	this.renderTypeEmitter = 0;
	//

	// StormRenderEMR
	this.materialEMR = undefined; // object:type absorption - light:type emission
	//
};
/**
* Allow dragging this node when to be selected
* @param {Bool} draggable
*/
StormNode.prototype.draggable = function(draggable) {
	this.isDraggable = draggable;
};
/**
* Onmousedown callback function
* @param {Function} func
*/
StormNode.prototype.onmousedown = function(func) {
	if(typeof(func) == 'function') this.onmousedownFunction = func;
	else console.log('The argument in event onmousedown is not a function');
};
/**
* Onmouseup callback function
* @param {Function} func
*/
StormNode.prototype.onmouseup = function(func) {
	if(typeof(func) == 'function') this.onmouseupFunction = func;
	else console.log('The argument in event onmouseup is not a function');
};

/**
* Add a StormMesh object to this node and receive the StormBufferObject generated
* @returns {StormBufferObject}
* @param	{Object} jsonIn
* 	@param {Array<Float>|Float32Array} jsonIn.vertexArray Vertices
* 	@param {Array<Float>|Float32Array} jsonIn.normalArray Normals
* 	@param {Array<Float>|Float32Array} jsonIn.textureArray Texture coords
* 	@param {Array<Float>|Float32Array} jsonIn.textureUnitArray Texture unit numbers
* 	@param {Array<Int>|Uint16Array} jsonIn.indexArray Indices
*/
StormNode.prototype.attachMesh = function(stormMeshObject) {
	var bObject = new StormBufferObject();
	this.buffersObjects.push(bObject);
	bObject.attachBuffers(stormMeshObject);
	bObject.node = this;
	
	return bObject;
	
	// actualizar AABB de nodo
	/*for(var n = 0; n < stormMeshObject.vertexArray.length/3; n++) {
		var idx = n * 3;
		if(stormMeshObject.vertexArray[idx] < this.collisionAABB_BLFarX) {
			this.collisionAABB_BLFarX = stormMeshObject.vertexArray[idx];
		} else if(stormMeshObject.vertexArray[idx] > this.collisionAABB_TRNearX) {
			this.collisionAABB_TRNearX = stormMeshObject.vertexArray[idx];
		}
		
		if(stormMeshObject.vertexArray[idx+1] < this.collisionAABB_BLFarY) {
			this.collisionAABB_BLFarY = stormMeshObject.vertexArray[idx+1];
		} else if(stormMeshObject.vertexArray[idx+1] > this.collisionAABB_TRNearY) {
			this.collisionAABB_TRNearY = stormMeshObject.vertexArray[idx+1];
		}
		
		if(stormMeshObject.vertexArray[idx+2] < this.collisionAABB_BLFarZ) {
			this.collisionAABB_BLFarZ = stormMeshObject.vertexArray[idx+2];
		} else if(stormMeshObject.vertexArray[idx+2] > this.collisionAABB_TRNearZ) {
			this.collisionAABB_TRNearZ = stormMeshObject.vertexArray[idx+2];
		}
	}*/
};
/**
* Save buffer on 4Uint for axis
* @private
*/
StormNode.prototype.attachMeshSeparateXYZ = function(arrayX,arrayY,arrayZ) { 
	var bObject = new StormBufferObject();
	this.buffersObjects.push(bObject);
	bObject.attachBuffersSeparateXYZ(arrayX,arrayY,arrayZ);
	bObject.node = this;
	
	return bObject;
};
/**
* Remove all meshes on this node
* @type Void
*/
StormNode.prototype.removeMeshes = function() {
	this.buffersObjects = [];
};

/**
* Load a object on this node from url of obj file
* @type Void
* @param {Object} jsonIn
* 	@param {String} jsonIn.objUrl Obj file url
* 	@param {String} [jsonIn.textureUniqueUrl] Image file url for apply a unique texture
* 	@param {String} [jsonIn.name] Name for this node
* 	@param {Function} [jsonIn.onload] Function to call after load
* 	@param {Bool} [jsonIn.albedo=true] Use albedo values
* 	@param {Bool} [jsonIn.roughness=true] Use roughness values
*/
StormNode.prototype.loadObj = function(jsonIn) {		
	var mesh = new StormMesh();
	mesh.loadObj({	node: this,
					objUrl: jsonIn.objUrl,
					textureUniqueUrl: jsonIn.textureUniqueUrl,
					name: jsonIn.name,
					onload: jsonIn.onload,
					albedo: jsonIn.albedo,
					roughness: jsonIn.roughness	});
};
/**
* Load a object on this node from text-plain on obj format <br>
* (require url of the mtl file)
* @type Void
* @param {Object} jsonIn
* 	@param {String} jsonIn.sourceText The source text
* 	@param {String} jsonIn.objDirectory Directory of the .mtl file for obtain the textures
* 	@param {String} [jsonIn.textureUniqueUrl] Image file url for apply a unique texture
* 	@param {Bool} [jsonIn.albedo=true] Use albedo values
* 	@param {Bool} [jsonIn.roughness=true] Use roughness values
*/
StormNode.prototype.loadObjFromSourceText = function(jsonIn) {
	var mesh = new StormMesh();
	mesh.loadObjFromSourceText({	node: this,
									sourceText: jsonIn.sourceText,
									objDirectory: jsonIn.objDirectory,
									textureUniqueUrl: jsonIn.textureUniqueUrl,
									albedo: jsonIn.albedo,
									roughness: jsonIn.roughness});
};
/**
* Load a point on node
* @type Void
* @param {Object} jsonIn
* 	@param {Float} [jsonIn.pointSize=2.0] The point size
*/
StormNode.prototype.loadPoint = function(jsonIn) {
	var mesh = new StormMesh();
	mesh.loadPoint(this);
};
/**
* Load a triangle on node
* @type Void
*/
StormNode.prototype.loadTriangle = function() {
	var mesh = new StormMesh();
	mesh.loadTriangle(this);
};
/**
* Load a box on node
* @type Void
* @param {StormV3} dimensions
*/
StormNode.prototype.loadBox = function(vecDim) {
	var mesh = new StormMesh();
	mesh.loadBox(this, vecDim);
};
/**
* Load a tube on node
* @type Void
* @param {Object} jsonIn
* 	@param {Float} [jsonIn.height=1.0] Height
* 	@param {Float} [jsonIn.outerRadius=1.0]	Outer radius
* 	@param {Float} [jsonIn.innerRadius=0.7] Inner radius
* 	@param {Int} [jsonIn.segments=6] Segments
* 	@param {StormV3} [jsonIn.color] Color
*/
StormNode.prototype.loadTube = function(jsonIn) {
	var mesh = new StormMesh();
	mesh.loadTube({ node: this,
					height: jsonIn.height,
					outerRadius: jsonIn.outerRadius,
					innerRadius: jsonIn.innerRadius,
					segments: jsonIn.segments,
					color: jsonIn.color});
};
/**
* Load a quad on node
* @type Void
* @param {Float} width
* @param {Float} height
*/
StormNode.prototype.loadQuad = function(length, height) {
	var mesh = new StormMesh();
	mesh.loadQuad(this, length, height);
};
/**
* Load a sphere on node
* @type Void
* @param {Object} jsonIn
* 	@param {StormV3} [jsonIn.color] Color
* 	@param {Float} [jsonIn.radius=1.0] Radius
* 	@param {Int} [jsonIn.segments=6] Segments
*/
StormNode.prototype.loadSphere = function(jsonIn) {
	var jIn = {	radius:(jsonIn!=undefined)?jsonIn.radius:undefined,
				color:(jsonIn!=undefined)?jsonIn.color:undefined,
				segments:(jsonIn!=undefined)?jsonIn.segments:undefined};
	var mesh = new StormMesh();
	mesh.loadSphere({	node:this,
						radius:jIn.radius,
						color:jIn.color,
						segments:jIn.segments});  
};
/**
* Load a text
* @type Void
* @param	{Object} jsonIn
* 	@param {String} jsonIn.svgFontUrl SVG font file.
* 	@param {String} jsonIn.text The text.
* 	@param {StormV3} [jsonIn.color=$V3([0.0,0.0,0.0])] Color.
* 	@param {Float} [jsonIn.kerning=1.0] Kerning.
* 	@param {String} [jsonIn.align="center"] "left"|"center"|"right".
* 	@param {Float} [jsonIn.size=1.0] Font size.
* 	@param {Function} [jsonIn.onload] Call function after load.
* 	@param {Float} [jsonIn.extrudeDimension=0.5] Activate extrusion and set the length.
* 	@param {StormV3} [jsonIn.extrudeDirection=$V3([0.0,1.0,0.0])] Direction vector of the extrusion.
* 	@param {Float} [jsonIn.bevel] Length of bevel
* 	@param {Float} [jsonIn.bevelAngle] Angle of bevel
* 	@param {String} [jsonIn.textureUniqueUrl] Apply image texture to entire node
*/ 
StormNode.prototype.loadText = function(jsonIn) {
	var font;
	for(var n = 0, f = stormEngineC.arrFonts.length; n < f; n++) if(stormEngineC.arrFonts[n].fontId = jsonIn.svgFontUrl) font = stormEngineC.arrFonts[n];

	if(font == undefined) {
		newFont = {fontId:jsonIn.svgFontUrl, glyphs:{}};
		var req = new XMLHttpRequest();
		req.node = this;
		req.onreadystatechange = function () {
			if (req.readyState == 4) {
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(req.responseText, "application/xml");
				//console.log(xmlDoc.getElementsByTagName('glyph')[8].attributes);
				
				var arrGlyphs = xmlDoc.getElementsByTagName('glyph');
				var fontFaceTag = xmlDoc.getElementsByTagName('font-face')[0];
				for(var n = 0, f = arrGlyphs.length; n < f; n++) {
					var horizVal;
					for(var nB = 0, fb = arrGlyphs[n].attributes.length; nB < fb; nB++) if(arrGlyphs[n].attributes[nB].name=="horiz-adv-x") horizVal=arrGlyphs[n].attributes[nB].value;
					if(horizVal == undefined) horizVal=1300;
					
					var vertVal;
					for(var nB = 0, fb = fontFaceTag.attributes.length; nB < fb; nB++) if(fontFaceTag.attributes[nB].name=="cap-height") vertVal=fontFaceTag.attributes[nB].value;
					if(vertVal == undefined) vertVal=1098;
					
					if(arrGlyphs[n].attributes.unicode != undefined && arrGlyphs[n].attributes.unicode.value != undefined && arrGlyphs[n].attributes.d != undefined && arrGlyphs[n].attributes.d.value != undefined) {
						newFont.glyphs[arrGlyphs[n].attributes.unicode.value] = {	d:arrGlyphs[n].attributes.d.value,
																					horiz:horizVal,
																					vert:vertVal};
					} else if(arrGlyphs[n].attributes.unicode != undefined && arrGlyphs[n].attributes.unicode.value != undefined) {
						newFont.glyphs[arrGlyphs[n].attributes.unicode.value] = {	d:"M0 0",
																					horiz:horizVal,
																					vert:vertVal};
					}
				}					
				
				stormEngineC.arrFonts.push(newFont);
				req.node.loadTextNow({	fontObject:newFont,
										text:jsonIn.text,
										color:jsonIn.color,
										kerning:jsonIn.kerning,
										align:jsonIn.align,
										size:jsonIn.size,
										onload:jsonIn.onload,
										extrudeDimension:jsonIn.extrudeDimension,
										extrudeDirection:jsonIn.extrudeDirection,
										bevel:jsonIn.bevel,
										bevelAngle:jsonIn.bevelAngle,
										textureUniqueUrl:jsonIn.textureUniqueUrl});
			}
		};
		req.open("GET", jsonIn.svgFontUrl, true);
		req.send(null);
	} else this.loadTextNow({	fontObject:font,
								text:jsonIn.text,
								color:jsonIn.color,
								kerning:jsonIn.kerning,
								align:jsonIn.align,
								size:jsonIn.size,
								onload:jsonIn.onload,
								extrudeDimension:jsonIn.extrudeDimension,
								extrudeDirection:jsonIn.extrudeDirection,
								bevel:jsonIn.bevel,
								bevelAngle:jsonIn.bevelAngle,
								textureUniqueUrl:jsonIn.textureUniqueUrl});
};
/**
* @private 
*/
StormNode.prototype.loadTextNow = function(jsonIn) {
	var align = (jsonIn.align != undefined) ? jsonIn.align : "center";
	
	this.removeMeshes();
	
	var path,horiz,vert;
	for(var n = 0, f = jsonIn.text.length; n < f; n++) {
		if(jsonIn.fontObject.glyphs[jsonIn.text[n]]) {
			path = jsonIn.fontObject.glyphs[jsonIn.text[n]].d;
			horiz = jsonIn.fontObject.glyphs[jsonIn.text[n]].horiz;
			vert = jsonIn.fontObject.glyphs[jsonIn.text[n]].vert;
		}
		//var path = "M752 111c0 -32.667 -10.333 -59.333 -31 -80s-47.334 -31 -80.001 -31h-516v1565h512c32.667 0 59.334 -10.333 80.001 -31s31 -47.334 31 -80.001v-465c0 -41.333 -18.667 -76 -56 -104l-110 -66l118 -76c34.667 -21.333 52 -54.666 52 -99.999v-532zM608 971.001v471h-344v-565h205zM612 123.001v541l-141 92h-207v-633h348z";
		 
		this.loadShapeFromSVGString({str:path,
									color:jsonIn.color,
									scale:jsonIn.size,
									offset:-(horiz/2.0)*jsonIn.size,
									offsetV:-(vert/2.0)*jsonIn.size,
									extrudeDimension:jsonIn.extrudeDimension,
									extrudeDirection:jsonIn.extrudeDirection,
									bevel:jsonIn.bevel,
									bevelAngle:jsonIn.bevelAngle,
									numPaths:1,
									textureUniqueUrl:jsonIn.textureUniqueUrl});
	}
	
	// text align
	var acumHoriz = 0;
	if(align == "center" || align == "right") {
		var totalHoriz = 0;
		for(var n = 0, f = jsonIn.text.length; n < f; n++) {
			if(jsonIn.fontObject.glyphs[jsonIn.text[n]]) {
				horiz = jsonIn.fontObject.glyphs[jsonIn.text[n]].horiz;
			} else alert('Character '+jsonIn.text[n]+' not exist or can not display page in UTF8');
			totalHoriz += horiz*jsonIn.size; 
		}
		if(align == "center") acumHoriz -= totalHoriz/2; else if(align == "right") acumHoriz -= totalHoriz;
	}
	
	// character separation
	for(var n = 0, f = this.buffersObjects.length; n < f; n++) {
		var BO = this.buffersObjects[n];
		
		if(jsonIn.fontObject.glyphs[jsonIn.text[n]]) {
			horiz = jsonIn.fontObject.glyphs[jsonIn.text[n]].horiz;
		}
		var kerning = (jsonIn.kerning != undefined) ? jsonIn.kerning : 1.0;
		kerning = kerning*jsonIn.size;
		var currentOffset = acumHoriz+kerning;
		
		for(var nB = 0, fb = this.buffersObjects[n].nodeMeshVertexArray.length/3; nB < fb; nB++) {
			var id = nB*3;
			BO.nodeMeshVertexArray[id] = BO.nodeMeshVertexArray[id]+currentOffset-(-(horiz/2.0)*jsonIn.size);
		}
		var meshObject = {};
		meshObject.vertexArray = BO.nodeMeshVertexArray;
		meshObject.vertexItemSize = 3;
		meshObject.vertexNumItems = BO.nodeMeshVertexArray.length/3;   
		if(BO.nodeMeshNormalArray != undefined) {
			meshObject.normalArray = BO.nodeMeshNormalArray;
			meshObject.normalItemSize = 3;
			meshObject.normalNumItems = BO.nodeMeshVertexArray.length/3;
		}
		if(BO.nodeMeshTextureArray != undefined) {
			meshObject.textureArray = BO.nodeMeshTextureArray;
			meshObject.textureItemSize = 3;
			meshObject.textureNumItems = BO.nodeMeshVertexArray.length/3;
		}
		if(BO.nodeMeshTextureUnitArray != undefined) {
			meshObject.textureUnitArray = BO.nodeMeshTextureUnitArray;
			meshObject.textureUnitItemSize = 3;
			meshObject.textureUnitNumItems = BO.nodeMeshVertexArray.length;
		}
		if(BO.nodeMeshIndexArray != undefined) {
			meshObject.indexArray = BO.nodeMeshIndexArray;
			meshObject.indexItemSize = 1;
			meshObject.indexNumItems = BO.nodeMeshIndexArray.length;
		}
		var bObject = new StormBufferObject();
		bObject.attachBuffers(meshObject);
		
		//var materialUnits = BO.materialUnits;
		this.buffersObjects[n] = bObject;
		//this.buffersObjects[n].materialUnits = materialUnits; 
			
		acumHoriz += horiz*jsonIn.size; 
	}
	
	if(jsonIn.onload != undefined) jsonIn.onload();
};
/**
* Load a shape from SVG string.
* @type Void
* @param	{Object} jsonIn
* 	@param {String} jsonIn.str Path string type "M750 111v-381".
* 	@param {StormV3} [jsonIn.color=$V3([0.0,0.0,0.0])] Color.
* 	@param {Float} [jsonIn.scale=1.0] Scale.
* 	@param {Float} [jsonIn.offset=0.0] Horizontal offset value.
* 	@param {Float} [jsonIn.offsetV=0.0] Vertical offset value.
* 	@param {Float} [jsonIn.extrudeDimension=0.5] Length of extrusion.
* 	@param {StormV3} [jsonIn.extrudeDirection=$V3([0.0,1.0,0.0])] Direction vector.
* 	@param {Int} [jsonIn.numPaths=0] Number of paths to get.
* 	@param {Float} [jsonIn.bevel] Length of bevel.
* 	@param {Float} [jsonIn.bevelAngle] Angle of bevel.
* 	@param {String} [jsonIn.textureUniqueUrl] Apply image texture to entire node.
*/
StormNode.prototype.loadShapeFromSVGString = function(jsonIn) {
	var path = jsonIn.str;

	path = path.replace(/M\s?/g, '||||M').replace(/L\s?/g, '||||L').replace(/H\s?/g, '||||H').replace(/V\s?/g, '||||V').replace(/C\s?/g, '||||C').replace(/S\s?/g, '||||S').replace(/Q\s?/g, '||||Q').replace(/T\s?/g, '||||T').replace(/A\s?/g, '||||A').replace(/Z\s?/g, '||||Z');
	path = path.replace(/m\s?/g, '||||m').replace(/l\s?/g, '||||l').replace(/h\s?/g, '||||h').replace(/v\s?/g, '||||v').replace(/c\s?/g, '||||c').replace(/s\s?/g, '||||s').replace(/q\s?/g, '||||q').replace(/t\s?/g, '||||t').replace(/a\s?/g, '||||a').replace(/z\s?/g, '||||z');
	var arrTrace = path.split('||||');
	//console.log(arrTrace);
	
	
	var closeNow = false;
	var numPaths = (jsonIn.numPaths != undefined) ? jsonIn.numPaths : 0;
	var currNumPath = 0;
	var arrX = [],arrY = [], arr2D = [];
	for(var n = 1, f = arrTrace.length; n < f; n++) {
		var traceVal = arrTrace[n].replace(/^./gi, ''); // L20.5 159.333
		var arrTraceVal = traceVal.split(' '); // 20.5 159.333
		if(arrTraceVal[0] != '') {
			if(arrTrace[n][0] == 'M' || arrTrace[n][0] == 'm') { // moveto x,y
				if(closeNow == true) {
					if(numPaths == 0 || currNumPath < numPaths) {
						currNumPath++;
						arr2D = this.getArr2D(arrX,arrY);
						this.loadShapeFromArray2D({	array2D:arr2D,
													color:jsonIn.color,
													scale:jsonIn.scale,
													offset:jsonIn.offset,
													offsetV:jsonIn.offsetV,
													extrudeDimension:jsonIn.extrudeDimension,
													extrudeDirection:jsonIn.extrudeDirection,
													bevel:jsonIn.bevel,
													bevelAngle:jsonIn.bevelAngle,
													textureUniqueUrl:jsonIn.textureUniqueUrl});
					}
				}
				arrX = [],arrY = [];
				closeNow = true;
				if(arrTrace[n][0] == 'M' || arrX.length == 0) {
					arrX.push(parseFloat(arrTraceVal[0])); 
					arrY.push(parseFloat(arrTraceVal[1]));
				} else {
					arrX.push(arrX[arrX.length-1]+parseFloat(arrTraceVal[0])); 
					arrY.push(arrY[arrY.length-1]+parseFloat(arrTraceVal[1]));
				}
			}
			if(arrTrace[n][0] == 'L' || arrTrace[n][0] == 'l') { // lineto x,y
				if(arrTrace[n][0] == 'L' || arrX.length == 0) {
					arrX.push(parseFloat(arrTraceVal[0]));
					arrY.push(parseFloat(arrTraceVal[1]));
				} else {
					arrX.push(arrX[arrX.length-1]+parseFloat(arrTraceVal[0])); 
					arrY.push(arrY[arrY.length-1]+parseFloat(arrTraceVal[1]));
				}
			}
			if(arrTrace[n][0] == 'H' || arrTrace[n][0] == 'h') { //horizontal lineto x
				if(arrTrace[n][0] == 'H' || arrX.length == 0) {
					arrX.push(parseFloat(arrTraceVal[0]));  
					arrY.push(arrY[arrY.length-1]);
				} else {
					arrX.push(arrX[arrX.length-1]+parseFloat(arrTraceVal[0])); 
					arrY.push(arrY[arrY.length-1]);
				}
			}
			if(arrTrace[n][0] == 'V' || arrTrace[n][0] == 'v') { //vertical lineto y
				if(arrTrace[n][0] == 'V' || arrX.length == 0) {
					arrX.push(arrX[arrX.length-1]);
					arrY.push(parseFloat(arrTraceVal[0]));
				} else {
					arrX.push(arrX[arrX.length-1]); 
					arrY.push(arrY[arrY.length-1]+parseFloat(arrTraceVal[0]));
				}
			}
			if(arrTrace[n][0] == 'C' || arrTrace[n][0] == 'c') { //curveto x1 y1 x2 y2 x y
				if(arrTrace[n][0] == 'C' || arrX.length == 0) {
					arrX.push(parseFloat(arrTraceVal[4]));
					arrY.push(parseFloat(arrTraceVal[5]));
				} else {
					arrX.push(arrX[arrX.length-1]+parseFloat(arrTraceVal[4])); 
					arrY.push(arrY[arrY.length-1]+parseFloat(arrTraceVal[5]));
				}
			}
			if(arrTrace[n][0] == 'S' || arrTrace[n][0] == 's') { //smooth curveto x2 y2 x y
				if(arrTrace[n][0] == 'S' || arrX.length == 0) {
					arrX.push(parseFloat(arrTraceVal[2]));
					arrY.push(parseFloat(arrTraceVal[3]));
				} else {
					arrX.push(arrX[arrX.length-1]+parseFloat(arrTraceVal[2])); 
					arrY.push(arrY[arrY.length-1]+parseFloat(arrTraceVal[3]));
				}
			}
			if(arrTrace[n][0] == 'Q' || arrTrace[n][0] == 'q') { //quadratic Bézier curve x1 y1 x y
				if(arrTrace[n][0] == 'Q' || arrX.length == 0) {
					arrX.push(parseFloat(arrTraceVal[2]));
					arrY.push(parseFloat(arrTraceVal[3]));
				} else {
					arrX.push(arrX[arrX.length-1]+parseFloat(arrTraceVal[2])); 
					arrY.push(arrY[arrY.length-1]+parseFloat(arrTraceVal[3]));
				}
			}
			if(arrTrace[n][0] == 'T' || arrTrace[n][0] == 't') { //smooth quadratic Bézier curveto x y
				if(arrTrace[n][0] == 'T' || arrX.length == 0) {
					arrX.push(parseFloat(arrTraceVal[0]));
					arrY.push(parseFloat(arrTraceVal[1])); 
				} else {
					arrX.push(arrX[arrX.length-1]+parseFloat(arrTraceVal[0])); 
					arrY.push(arrY[arrY.length-1]+parseFloat(arrTraceVal[1]));
				}
			}
			
		}
		/*if(arrTrace[n][0] == 'Z' || arrTrace[n][0] == 'z') {
			arrX.push(arrX[0]);
			arrY.push(arrY[0]);
		} */
	}
	
	if(numPaths == 0 || currNumPath < numPaths) {
		arr2D = this.getArr2D(arrX,arrY);
		this.loadShapeFromArray2D({	array2D:arr2D,
									color:jsonIn.color,
									scale:jsonIn.scale,
									offset:jsonIn.offset,
									offsetV:jsonIn.offsetV,
									extrudeDimension:jsonIn.extrudeDimension,
									extrudeDirection:jsonIn.extrudeDirection,
									bevel:jsonIn.bevel,
									bevelAngle:jsonIn.bevelAngle,
									textureUniqueUrl:jsonIn.textureUniqueUrl});
	}
};
/**
 * @private 
 */
StormNode.prototype.getArr2D = function(arrX, arrY) {
	if(arrX[arrX.length-1] == arrX[0] && arrY[arrY.length-1] == arrY[0]) {
		arrX.pop();arrY.pop(); 
	}
	var arr2D = [];
	for(var n = 0, f = arrX.length; n < f; n++) arr2D.push([arrX[n],arrY[n]]); 
	//console.log(arr2D); 
	return arr2D;
};
/**
* Load a shape from array2D
* @type Void
* @param {Object} jsonIn
* 	@param {Array<Array<Float>>} jsonIn.array2D Array of arrays with two values x and y. Example: [[1.0,1.0],[1.0,2.0],[3.0,1.0]].
* 	@param {StormV3} [jsonIn.color=$V3([0.0,0.0,0.0])] Color.
* 	@param {Float} [jsonIn.scale=1.0] Scale.
* 	@param {Float} [jsonIn.offset=0.0] Horizontal offset value.
* 	@param {Float} [jsonIn.offsetV=0.0] Vertical offset value.
* 	@param {Float} [jsonIn.extrudeDimension=0.5] Length of extrusion.
* 	@param {StormV3} [jsonIn.extrudeDirection=$V3([0.0,1.0,0.0])] Direction vector.
* 	@param {Float} [jsonIn.bevel] Length of bevel.
* 	@param {Float} [jsonIn.bevelAngle] Angle of bevel.
* 	@param {String} [jsonIn.textureUniqueUrl] Apply image texture to entire node.
*/
StormNode.prototype.loadShapeFromArray2D = function(jsonIn) {
	var color = (jsonIn.color != undefined) ? jsonIn.color : $V3([0.0,0.0,0.0]);
	var scale = (jsonIn.scale != undefined) ? jsonIn.scale : 1.0;
	var offset = (jsonIn.offset != undefined) ? jsonIn.offset : 0.0;
	var offsetV = (jsonIn.offsetV != undefined) ? jsonIn.offsetV : 0.0;
	 
	for(var n = 0, f = jsonIn.array2D.length; n < f; n++) jsonIn.array2D[n] = [jsonIn.array2D[n][0]*scale,jsonIn.array2D[n][1]*scale];
	 
	var triangulate2D = new StormTriangulate2D();
	var res = triangulate2D.process(jsonIn.array2D); 
	//console.log(res);
	var vert = [];
	var norm = [];
	var tex = [];
	var texUnit = [];
	for(var n = 0, f = res.length; n < f; n++) {
		vert.push(res[n][0]+offset, 0.0, -res[n][1]-offsetV); 
		norm.push(0.0, 1.0, 0.0);
		tex.push(res[n][0], res[n][1], 0.0); 
		texUnit.push(0.0);
	}
	
	var meshObject = {};
	meshObject.vertexArray = vert;
	meshObject.vertexItemSize = 3;
	meshObject.vertexNumItems = vert.length/3;   
	
	meshObject.normalArray = norm;
	meshObject.normalItemSize = 3;
	meshObject.normalNumItems = vert.length/3;
	
	meshObject.textureArray = tex;
	meshObject.textureItemSize = 3;
	meshObject.textureNumItems = vert.length/3;
	
	meshObject.textureUnitArray = texUnit;
	meshObject.textureUnitItemSize = 3;
	meshObject.textureUnitNumItems = vert.length;
	
	var bObject = this.attachMesh(meshObject);
	if(jsonIn.textureUniqueUrl == undefined) { 
		this.materialUnits[0].write($V3([color.e[0], color.e[1], color.e[2]])); 
	} else {
		this.materialUnits[0].write(jsonIn.textureUniqueUrl);
	}
	
	if(jsonIn.extrudeDimension != undefined) {
		var dir = (jsonIn.extrudeDirection != undefined) ? jsonIn.extrudeDirection : $V3([0.0,1.0,0.0]);
		bObject.extrude({	direction: dir,
							dim:jsonIn.extrudeDimension,
							bevel:jsonIn.bevel,
							bevelAngle:jsonIn.bevelAngle});
	}
};

/**
* Extrude all triangles of the node
* @returns {Array<Array<StormV3>>} Array of arrays with three values $V3 with the vertexs locations of the generated cap triangles.
* @param	{Object} jsonIn
* 	@param {StormV3} [jsonIn.direction=$V3([0.0,1.0,0.0])] Direction vector
* 	@param {Float} [jsonIn.dim=0.5] Length of extrusion
* 	@param {Float} [jsonIn.bevel] Length of bevel
* 	@param {Float} [jsonIn.bevelAngle] Angle of bevel
* 	@param {Array<Array<StormV3>>} [jsonIn.arrayV] Specific triangles. Array of arrays with three values $V3 with the vertexs locations to extrude. By default: undefined (All triangles). Example: [[$V3([,,]),$V3([,,],$V3([,,])], [$V3([,,]),$V3([,,],$V3([,,])]]
*/
StormNode.prototype.extrude = function(jsonIn) {
	var arrTri;
	var jIn = {	direction:(jsonIn == undefined || jsonIn.direction == undefined)?undefined:jsonIn.direction,
				dim:(jsonIn == undefined || jsonIn.dim == undefined)?undefined:jsonIn.dim,
				bevel:(jsonIn == undefined || jsonIn.bevel == undefined)?undefined:jsonIn.bevel,
				bevelAngle:(jsonIn == undefined || jsonIn.bevelAngle == undefined)?0.0:jsonIn.bevelAngle,
				arrayV:(jsonIn == undefined || jsonIn.arrayV == undefined)?undefined:jsonIn.arrayV};
				
	if(jIn.arrayV == undefined) {
		var arr = [];
		for(var n = 0, f = this.buffersObjects.length; n < f; n++) {
			for(var nB = 0, fb = this.buffersObjects[n].nodeMeshVertexArray.length/9; nB < fb; nB++) {
				var id = nB*9;
				arr.push(	[$V3([this.buffersObjects[n].nodeMeshVertexArray[id],this.buffersObjects[n].nodeMeshVertexArray[id+1],this.buffersObjects[n].nodeMeshVertexArray[id+2]]),
							$V3([this.buffersObjects[n].nodeMeshVertexArray[id+3],this.buffersObjects[n].nodeMeshVertexArray[id+4],this.buffersObjects[n].nodeMeshVertexArray[id+5]]),
							$V3([this.buffersObjects[n].nodeMeshVertexArray[id+6],this.buffersObjects[n].nodeMeshVertexArray[id+7],this.buffersObjects[n].nodeMeshVertexArray[id+8]])]);
			}
		}
		arrTri = arr;
	} else arrTri = jIn.arrayV;
	
	if(jIn.bevel != undefined) {
		for(var n = 0, f = 4; n < f; n++) {
			var bev;
			if(n == 0) bev = 1.0+jIn.bevelAngle;  
			if(n == 1 || n == 2) bev = 1.0; 
			if(n == 3) bev = 1.0/(1.0+jIn.bevelAngle);
			
			var dims;
			if(n == 0) dims = jIn.bevel; 
			if(n == 1 || n == 2) dims = jIn.dim-(jIn.bevel*2.0); 
			if(n == 3) dims = jIn.bevel;
			arrTri = this.extrudeThisTriangles({	arrayV:arrTri,
													direction:jIn.direction,
													dim:dims,
													bevel:bev});
		}
	} else {
		arrTri = this.extrudeThisTriangles({	arrayV:arrTri,
												direction:jIn.direction,
												dim:jIn.dim});
	}
};
/**
 * @private 
 */
StormNode.prototype.extrudeThisTriangles = function(jsonIn) {
	var direction =(jsonIn.direction != undefined) ? jsonIn.direction : $V3([0.0,1.0,0.0]);
	jsonIn.bevel =(jsonIn.bevel != undefined) ? jsonIn.bevel : 1.0;
	var extrudeLength =(jsonIn.dim != undefined) ? jsonIn.dim : 0.5;
	var arrCapTriangles=[];
	
	for(var B = 0, fB = this.buffersObjects.length; B < fB; B++) {
		var BO = this.buffersObjects[B];
		
		var arrVertex=[],tmpArrVertex=[],arrNormal=[],arrTexture=[],arrTextureUnit=[],arrIndex=[];
		for(var n = 0, f = BO.nodeMeshVertexArray.length; n < f; n++) arrVertex[n] = BO.nodeMeshVertexArray[n];
		if(BO.nodeMeshNormalArray != undefined) for(var n = 0, f = BO.nodeMeshNormalArray.length; n < f; n++) arrNormal[n] = BO.nodeMeshNormalArray[n];
		if(BO.nodeMeshTextureArray != undefined) for(var n = 0, f = BO.nodeMeshTextureArray.length; n < f; n++) arrTexture[n] = BO.nodeMeshTextureArray[n];
		if(BO.nodeMeshTextureUnitArray != undefined) for(var n = 0, f = BO.nodeMeshTextureUnitArray.length; n < f; n++) arrTextureUnit[n] = BO.nodeMeshTextureUnitArray[n];
		if(BO.nodeMeshIndexArray != undefined) for(var n = 0, f = BO.nodeMeshIndexArray.length; n < f; n++) arrIndex[n] = BO.nodeMeshIndexArray[n];
		
		var objIndex = []; // for store new indexes
		
		var indexMax=0;
		if(BO.nodeMeshIndexArray != undefined) {
			for(var nB = 0, fnB = BO.nodeMeshIndexArray.length; nB < fnB; nB++) if(BO.nodeMeshIndexArray[nB] > indexMax) indexMax = BO.nodeMeshIndexArray[nB];
		}
		indexMax++;
		
		for(var n = 0, f = jsonIn.arrayV.length; n < f; n++) {
			var nA,tA,tB,tC,iA,iB,iC;
			var vA = jsonIn.arrayV[n][0];
			var vB = jsonIn.arrayV[n][1];
			var vC = jsonIn.arrayV[n][2];
			
			var foundTriangle = false;
			for(var nB = 0, fnB = BO.nodeMeshVertexArray.length/9; nB < fnB; nB++) {
				var id = nB*9;
				var idInd = nB*3;
				if(	BO.nodeMeshVertexArray[id] == vA.e[0] && BO.nodeMeshVertexArray[id+1] == vA.e[1] && BO.nodeMeshVertexArray[id+2] == vA.e[2] &&
					BO.nodeMeshVertexArray[id+3] == vB.e[0] && BO.nodeMeshVertexArray[id+4] == vB.e[1] && BO.nodeMeshVertexArray[id+5] == vB.e[2] &&
					BO.nodeMeshVertexArray[id+6] == vC.e[0] && BO.nodeMeshVertexArray[id+7] == vC.e[1] && BO.nodeMeshVertexArray[id+8] == vC.e[2]) {
						foundTriangle = true;// vA,vB,vC found (the triangle)
						if(BO.nodeMeshNormalArray != undefined) {
							nA = $V3([BO.nodeMeshNormalArray[id],BO.nodeMeshNormalArray[id+1],BO.nodeMeshNormalArray[id+2]]);
						}
						if(BO.nodeMeshTextureArray != undefined) {
							tA = $V3([BO.nodeMeshTextureArray[id],BO.nodeMeshTextureArray[id+1],BO.nodeMeshTextureArray[id+2]]);
							tB = $V3([BO.nodeMeshTextureArray[id+3],BO.nodeMeshTextureArray[id+4],BO.nodeMeshTextureArray[id+5]]);
							tC = $V3([BO.nodeMeshTextureArray[id+6],BO.nodeMeshTextureArray[id+7],BO.nodeMeshTextureArray[id+8]]);
						}
						if(BO.nodeMeshIndexArray != undefined) {
							iA = BO.nodeMeshIndexArray[idInd];
							iB = BO.nodeMeshIndexArray[idInd+1];
							iC = BO.nodeMeshIndexArray[idInd+2];
						}
						if(BO.nodeMeshTextureUnitArray != undefined) {
							//arrTextureUnit.push(0.0, 0.0, 0.0);
							//arrTextureUnit.push(0.0, 0.0, 0.0);
						}
				}
			}
			if(foundTriangle == true) {
				//console.log(tmpArrVertex);
				// add new extrude triangle
				var EvA = vA.add(direction.x(extrudeLength));
				var EvB = vB.add(direction.x(extrudeLength));
				var EvC = vC.add(direction.x(extrudeLength));
				arrCapTriangles.push([$V3([EvA.e[0]*jsonIn.bevel,EvA.e[1],EvA.e[2]*jsonIn.bevel]), $V3([EvB.e[0]*jsonIn.bevel,EvB.e[1],EvB.e[2]*jsonIn.bevel]), $V3([EvC.e[0]*jsonIn.bevel,EvC.e[1],EvC.e[2]*jsonIn.bevel])]);
				
				// CAP TRIANGLE
				if(BO.nodeMeshIndexArray != undefined) {
					var indexA,indexB,indexC;
					for(var nB = 0, fnB = objIndex.length; nB < fnB; nB++) {
						if(objIndex[nB].v.e[0] == EvA.e[0]*jsonIn.bevel && objIndex[nB].v.e[1] == EvA.e[1]*jsonIn.bevel && objIndex[nB].v.e[2] == EvA.e[2]*jsonIn.bevel) {
							indexA = objIndex[nB].i;
						}
						if(objIndex[nB].v.e[0] == EvB.e[0]*jsonIn.bevel && objIndex[nB].v.e[1] == EvB.e[1]*jsonIn.bevel && objIndex[nB].v.e[2] == EvB.e[2]*jsonIn.bevel) {
							indexB = objIndex[nB].i;
						}
						if(objIndex[nB].v.e[0] == EvC.e[0]*jsonIn.bevel && objIndex[nB].v.e[1] == EvC.e[1]*jsonIn.bevel && objIndex[nB].v.e[2] == EvC.e[2]*jsonIn.bevel) {
							indexC = objIndex[nB].i;
						}
					}
					if(indexA == undefined) {
						indexA = indexMax; 
						objIndex.push({i:indexA,v:$V3([EvA.e[0]*jsonIn.bevel,EvA.e[1]*jsonIn.bevel,EvA.e[2]*jsonIn.bevel])});
						indexMax++; 
						tmpArrVertex.push(EvA.e[0]*jsonIn.bevel,EvA.e[1],EvA.e[2]*jsonIn.bevel);
						if(BO.nodeMeshNormalArray != undefined) arrNormal.push(nA.e[0],nA.e[1],nA.e[2]);
						if(BO.nodeMeshTextureArray != undefined) arrTexture.push(tA.e[0],tA.e[1],tA.e[2]);
						if(BO.nodeMeshTextureUnitArray != undefined) arrTextureUnit.push(0.0);
					}
					if(indexB == undefined) {
						indexB = indexMax;
						objIndex.push({i:indexB,v:$V3([EvB.e[0]*jsonIn.bevel,EvB.e[1]*jsonIn.bevel,EvB.e[2]*jsonIn.bevel])});
						indexMax++;
						tmpArrVertex.push(EvB.e[0]*jsonIn.bevel,EvB.e[1],EvB.e[2]*jsonIn.bevel);
						if(BO.nodeMeshNormalArray != undefined) arrNormal.push(nA.e[0],nA.e[1],nA.e[2]);
						if(BO.nodeMeshTextureArray != undefined) arrTexture.push(tB.e[0],tB.e[1],tB.e[2]);
						if(BO.nodeMeshTextureUnitArray != undefined) arrTextureUnit.push(0.0);
					}
					if(indexC == undefined) {
						indexC = indexMax;
						objIndex.push({i:indexC,v:$V3([EvC.e[0]*jsonIn.bevel,EvC.e[1]*jsonIn.bevel,EvC.e[2]*jsonIn.bevel])});
						indexMax++;
						tmpArrVertex.push(EvC.e[0]*jsonIn.bevel,EvC.e[1],EvC.e[2]*jsonIn.bevel);
						if(BO.nodeMeshNormalArray != undefined) arrNormal.push(nA.e[0],nA.e[1],nA.e[2]);
						if(BO.nodeMeshTextureArray != undefined) arrTexture.push(tC.e[0],tC.e[1],tC.e[2]);
						if(BO.nodeMeshTextureUnitArray != undefined) arrTextureUnit.push(0.0);
					}
					arrIndex.push(indexA,indexB,indexC);
				} else {
					tmpArrVertex.push(EvA.e[0]*jsonIn.bevel,EvA.e[1],EvA.e[2]*jsonIn.bevel, EvB.e[0]*jsonIn.bevel,EvB.e[1],EvB.e[2]*jsonIn.bevel, EvC.e[0]*jsonIn.bevel,EvC.e[1],EvC.e[2]*jsonIn.bevel);					
					if(BO.nodeMeshNormalArray != undefined) arrNormal.push(nA.e[0],nA.e[1],nA.e[2], nA.e[0],nA.e[1],nA.e[2], nA.e[0],nA.e[1],nA.e[2]);
					if(BO.nodeMeshTextureArray != undefined) arrTexture.push(tA.e[0],tA.e[1],tA.e[2], tB.e[0],tB.e[1],tB.e[2], tC.e[0],tC.e[1],tC.e[2]);
					if(BO.nodeMeshTextureUnitArray != undefined) arrTextureUnit.push(0.0, 0.0, 0.0);
				}
				
				// SIDE TRIANGLES	
				if(BO.nodeMeshIndexArray != undefined) {
					arrIndex.push(iC,iA,indexC);
					arrIndex.push(indexA,indexC,iA);
				} else {
					tmpArrVertex.push(vC.e[0],vC.e[1],vC.e[2], vA.e[0],vA.e[1],vA.e[2], EvC.e[0]*jsonIn.bevel,EvC.e[1],EvC.e[2]*jsonIn.bevel);
					tmpArrVertex.push(EvA.e[0]*jsonIn.bevel,EvA.e[1],EvA.e[2]*jsonIn.bevel, EvC.e[0]*jsonIn.bevel,EvC.e[1],EvC.e[2]*jsonIn.bevel, vA.e[0],vA.e[1],vA.e[2]);
					if(BO.nodeMeshNormalArray != undefined) {
						var tmpEVC = $V3([EvC.e[0]*jsonIn.bevel,EvC.e[1],EvC.e[2]*jsonIn.bevel]);
						var norm = vA.subtract(vC).cross(tmpEVC.subtract(vC)).normalize();
						arrNormal.push(norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2]);
						arrNormal.push(norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2]);
					}
					if(BO.nodeMeshTextureArray != undefined) {
						arrTexture.push(tC.e[0],tC.e[1],tC.e[2], tA.e[0],tA.e[1],tA.e[2], tC.e[0],tC.e[1],tC.e[2]);
						arrTexture.push(tA.e[0],tA.e[1],tA.e[2], tC.e[0],tC.e[1],tC.e[2], tA.e[0],tA.e[1],tA.e[2]);
					}
					if(BO.nodeMeshTextureUnitArray != undefined) {
						arrTextureUnit.push(0.0, 0.0, 0.0);
						arrTextureUnit.push(0.0, 0.0, 0.0);
					}
				}
				
				if(BO.nodeMeshIndexArray != undefined) {
					arrIndex.push(iA,iB,indexA);
					arrIndex.push(indexB,indexA,iB);
				} else {
					tmpArrVertex.push(vA.e[0],vA.e[1],vA.e[2], vB.e[0],vB.e[1],vB.e[2], EvA.e[0]*jsonIn.bevel,EvA.e[1],EvA.e[2]*jsonIn.bevel);
					tmpArrVertex.push(EvB.e[0]*jsonIn.bevel,EvB.e[1],EvB.e[2]*jsonIn.bevel, EvA.e[0]*jsonIn.bevel,EvA.e[1],EvA.e[2]*jsonIn.bevel, vB.e[0],vB.e[1],vB.e[2]);
					if(BO.nodeMeshNormalArray != undefined) {
						var tmpEVA = $V3([EvA.e[0]*jsonIn.bevel,EvA.e[1],EvA.e[2]*jsonIn.bevel]);
						norm = vB.subtract(vA).cross(tmpEVA.subtract(vA)).normalize();
						arrNormal.push(norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2]);
						arrNormal.push(norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2]);
					}
					if(BO.nodeMeshTextureArray != undefined) {
						arrTexture.push(tA.e[0],tA.e[1],tA.e[2], tB.e[0],tB.e[1],tB.e[2], tA.e[0],tA.e[1],tA.e[2]);
						arrTexture.push(tB.e[0],tB.e[1],tB.e[2], tA.e[0],tA.e[1],tA.e[2], tB.e[0],tB.e[1],tB.e[2]);
					}
					if(BO.nodeMeshTextureUnitArray != undefined) {
						arrTextureUnit.push(0.0, 0.0, 0.0);
						arrTextureUnit.push(0.0, 0.0, 0.0);
					}
				}
				
				if(BO.nodeMeshIndexArray != undefined) {
					arrIndex.push(iB,iC,indexB);
					arrIndex.push(indexC,indexB,iC);
				} else {
					tmpArrVertex.push(vB.e[0],vB.e[1],vB.e[2], vC.e[0],vC.e[1],vC.e[2], EvB.e[0]*jsonIn.bevel,EvB.e[1],EvB.e[2]*jsonIn.bevel);
					tmpArrVertex.push(EvC.e[0]*jsonIn.bevel,EvC.e[1],EvC.e[2]*jsonIn.bevel, EvB.e[0]*jsonIn.bevel,EvB.e[1],EvB.e[2]*jsonIn.bevel, vC.e[0],vC.e[1],vC.e[2]);
					if(BO.nodeMeshNormalArray != undefined) {
						var tmpEVB = $V3([EvB.e[0]*jsonIn.bevel,EvB.e[1],EvB.e[2]*jsonIn.bevel]);
						norm = vC.subtract(vB).cross(tmpEVB.subtract(vB)).normalize();
						arrNormal.push(norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2]);
						arrNormal.push(norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2], norm.e[0],norm.e[1],norm.e[2]);
					}
					if(BO.nodeMeshTextureArray != undefined) {
						arrTexture.push(tB.e[0],tB.e[1],tB.e[2], tC.e[0],tC.e[1],tC.e[2], tB.e[0],tB.e[1],tB.e[2]);
						arrTexture.push(tC.e[0],tC.e[1],tC.e[2], tB.e[0],tB.e[1],tB.e[2], tC.e[0],tC.e[1],tC.e[2]);
					}
					if(BO.nodeMeshTextureUnitArray != undefined) {
						arrTextureUnit.push(0.0, 0.0, 0.0);
						arrTextureUnit.push(0.0, 0.0, 0.0);
					}
				}
				
			}
		}

		for(var n = 0, f = tmpArrVertex.length; n < f; n++) arrVertex.push(tmpArrVertex[n]);
		
		
		var meshObject = {};
		meshObject.vertexArray = arrVertex;
		meshObject.vertexItemSize = 3;
		meshObject.vertexNumItems = arrVertex.length/3;   
		if(BO.nodeMeshNormalArray != undefined) {
			meshObject.normalArray = arrNormal;
			meshObject.normalItemSize = 3;
			meshObject.normalNumItems = arrNormal.length/3;
		}
		if(BO.nodeMeshTextureArray != undefined) {
			meshObject.textureArray = arrTexture;
			meshObject.textureItemSize = 3;
			meshObject.textureNumItems = arrTexture.length/3;
		}
		if(BO.nodeMeshTextureUnitArray != undefined) {
			meshObject.textureUnitArray = arrTextureUnit;
			meshObject.textureUnitItemSize = 3;
			meshObject.textureUnitNumItems = arrTextureUnit.length;
		}
		if(BO.nodeMeshIndexArray != undefined) {
			meshObject.indexArray = arrIndex;
			meshObject.indexItemSize = 1;
			meshObject.indexNumItems = arrIndex.length;
		}
		var bObject = new StormBufferObject();
		bObject.attachBuffers(meshObject);
		
		//var materialUnits = BO.materialUnits;
		this.buffersObjects[B] = bObject;
		//this.materialUnits[0].write($V3([color.e[0], color.e[1], color.e[2]])); 
		//this.buffersObjects[B].materialUnits = materialUnits; 
	}
	return arrCapTriangles;
};

/**
* Apply albedo color to node
* @type Void
* @param {StormV3|String|Array|Float32Array|Uint8Array|WebGLTexture|HTMLImageElement} color color
*/
StormNode.prototype.setAlbedo = function(color) {
	for(var n = 0, f = this.materialUnits.length; n < f; n++)
		this.materialUnits[n].write(color); 
};

/**
* Set the illumination of the materials for this node. Default = 0.0.
* @type Void
* @param {Float} value
*/
StormNode.prototype.setIllumination = function(value) { 
	for(var n = 0, f = this.materialUnits.length; n < f; n++)
		this.materialUnits[n].setIllumination(value);
};

/**
* Set the roughness of the materials for this node. 0.0(Reflective) 100.0(Lambertian) Default = 100.0
* @type Void
* @param {Float} value 0.0-100
*/
StormNode.prototype.setRoughness = function(value) { 
	for(var n = 0, f = this.materialUnits.length; n < f; n++)
		this.materialUnits[n].Ns = value/112.0; //(0.0 - 0.8928571428571429) 
};

/**
* Node visibility
* @type Void
* @param {Bool} visible
*/
StormNode.prototype.visible = function(visible) {
	if(this.objectType == 'node') {
		if(visible == false) {
			this.visibleOnContext = false;
			this.visibleOnRender = false;
		} else {
			this.visibleOnContext = true;
			this.visibleOnRender = true;
		}
	}
	if(this.objectType == 'camera') {
		if(visible == false) {
			this.visibleOnContext = false;
			this.nodePivot.nodeFocus.visibleOnContext = false;
		} else {
			this.visibleOnContext = true;
			this.nodePivot.nodeFocus.visibleOnContext = true;
		}
	}
	if(this.objectType == 'light') {
		if(visible == false) {
			this.visibleOnContext = false;
			this.visibleOnRender = false;
			this.nodeCtxWebGL.visibleOnContext = false;
			//this.nodeCtxWebGL.visibleOnRender = false;
		} else {
			this.visibleOnContext = true;
			this.visibleOnRender = true;
			this.nodeCtxWebGL.visibleOnContext = true;
			//this.nodeCtxWebGL.visibleOnRender = true;
		}
	}
	if(this.objectType == 'polarityPoint') {
		if(visible == false) {
			this.visibleOnContext = false;
			this.visibleOnRender = false;
		} else {
			this.visibleOnContext = true;
			this.visibleOnRender = true;
		}
	}
	if(this.objectType == 'particles') {
		if(visible == false) {
			this.visibleOnContext = false;
			this.visibleOnRender = false;
		} else {
			this.visibleOnContext = true;
			this.visibleOnRender = true;
		}
	}
};

/**
* Set the visibility of the node shadows
* @type Void
* @param {Bool} active
*/
StormNode.prototype.setShadows = function(active) {
	this.shadows = active;
};

/**
* Projection type for cameras and lights
* @type Void
* @param {String} [value="p"] "p" for perspective type or "o" for orthographic
 */
StormNode.prototype.setProjectionType = function(value) {
	this.proy = (value != undefined) ? (value=="p")?1:2 : 1;// p=1 o=2
	
	this.updateProjectionMatrix();
};
/**
* Fov angle for cameras and lights
* @type Void
* @param {Int} [value=45]
 */
StormNode.prototype.setFov = function(value) {
	if(this.proy == 1) this.fov = (value != undefined) ? value : 45;
	else this.fovOrtho = (value != undefined) ? value : 10;
	
	if(this.proy == 1 && this.fov >= 180) this.fov = 179;
	if(this.fov <= 0) this.fov = 1; 
	
	this.updateProjectionMatrix(); 
}; 
/**
* Get current Fov angle
* @returns {Int}
 */
StormNode.prototype.getFov = function() {
	return (this.proy == 1)?this.fov:this.fovOrtho;
}; 
/**
 * Update projection for cameras and lights
 * @private 
 */
StormNode.prototype.updateProjectionMatrix = function() {
	var fovy =(this.proy == 1) ? this.fov : this.fovOrtho;
	var aspect = stormEngineC.stormGLContext.viewportWidth / stormEngineC.stormGLContext.viewportHeight;
	var znear = 0.1;
	var zfar = stormEngineC.stormGLContext.far;
	
	if(this.proy == 1) this.mPMatrix = $M16().setPerspectiveProjection(fovy, aspect, znear, zfar);
	else this.mPMatrix = $M16().setOrthographicProjection(-fovy, fovy, -fovy, fovy, -1000.0, 1000.0);
		//this.mPMatrix = $M16().setOrthographicProjection(-20, 20, -20, 20, 0.1, 100.0); 
};



/**
* Translate the node
* @type Void
* @param {StormV3} vector The translation vector  
*/
StormNode.prototype.setTranslate = function(vec) {					
	this.MPOS.setPosition(this.getPosition().add(vec));
};

/**
* Positioning the node type StormNode, StormCamera or StormLight
* @type Void
* @param {StormV3} position Position vector
*/
StormNode.prototype.setPosition = function(vec) {
	if(this.objectType == 'light') {
		this.mrealWMatrix = this.MPOS.setPosition(vec);
		
		var vecEyeLight = this.getPosition();
		var vecPosLight = vecEyeLight.add(this.direction);

		this.MPOS = $M16().makeLookAt(	vecEyeLight.e[0], vecEyeLight.e[1], vecEyeLight.e[2],
										vecPosLight.e[0], vecPosLight.e[1], vecPosLight.e[2],
										0.0,1.0,0.0);
					
		this.nodeCtxWebGL.MPOS = this.MPOS.inverse();
		this.nodeCtxWebGL.MROTXYZ = this.MROTXYZ.inverse();
	} else if(this.objectType == 'polarityPoint') {
		this.MPOS = this.MPOS.setPosition(vec);
		for(var n = 0, f = this.nodesProc.length; n < f; n++) this.nodesProc[n].updatekernelDir_Arguments();  
	} else if(this.objectType == 'camera') {
		if(this.body != undefined)
			this.nodePivot.body.moveTo(new Vector3D(vec.e[0],vec.e[1],vec.e[2]));
		else
			this.nodePivot.MPOS = this.nodePivot.MPOS.setPosition(vec);  
	} else {
		if(this.body != undefined)
			this.body.moveTo(new Vector3D(vec.e[0],vec.e[1],vec.e[2]));
		else
			this.MPOS = this.MPOS.setPosition(vec);
	}
};

/**
* Get the position of the node type StormNode, StormCamera or StormLight
* @returns {StormV3}
*/
StormNode.prototype.getPosition = function() {
	if(this.objectType == 'light')
		return $V3([this.mrealWMatrix.e[3], this.mrealWMatrix.e[7], this.mrealWMatrix.e[11]]);
	else if(this.objectType == 'camera')
		return $V3([this.nodePivot.MPOS.e[3], this.nodePivot.MPOS.e[7], this.nodePivot.MPOS.e[11]]);
	else
		return $V3([this.MPOS.e[3], this.MPOS.e[7], this.MPOS.e[11]]);
};

/**
* Rotate the node
* @type Void
* @param {Float} radians
* @param {Bool} [relative=true] false for absolute rotation
* @param {StormV3} [axis=$V3([0.0,1.0,0.0])]
*/
StormNode.prototype.setRotation = function(radians, relative, axis) {
	if(this.nodePivot != undefined) {
		this.nodePivot.setRotation(radians, relative, axis);
		if(this.body != undefined) {
			this.body._currState.orientation._rawData = $M16([	this.nodePivot.MROTXYZ.e[0], this.nodePivot.MROTXYZ.e[1], this.nodePivot.MROTXYZ.e[2], 0.0,
																this.nodePivot.MROTXYZ.e[4], this.nodePivot.MROTXYZ.e[5], this.nodePivot.MROTXYZ.e[6], 0.0,
																this.nodePivot.MROTXYZ.e[8], this.nodePivot.MROTXYZ.e[9], this.nodePivot.MROTXYZ.e[10], 0.0,
																0.0, 0.0, 0.0, 1.0]).e;
		}
		return;
	}
	
	if(axis != undefined && axis.e[0]) {
		if(relative == undefined || relative == true) {
			this.MROTX = this.MROTX.setRotationX(radians,true);
			this.rotX = this.rotX+radians;
		} else {
			this.MROTX = this.MROTX.setRotationX(radians,false);  
			this.rotX = radians;
		}
		if(this.body != undefined) this.body.set_rotationX(stormEngineC.utils.radToDeg(this.rotX));
	}
	if(axis == undefined || axis.e[1]) {
		if(relative == undefined || relative == true) {
			this.MROTY = this.MROTY.setRotationY(radians,true);
			this.rotY = this.rotY+radians;
		} else {
			this.MROTY = this.MROTY.setRotationY(radians,false);
			this.rotY = radians;
		}
		if(this.body != undefined) this.body.set_rotationY(stormEngineC.utils.radToDeg(this.rotY));
	}
	if(axis != undefined && axis.e[2]) {  
		if(relative == undefined || relative == true) {
			this.MROTZ = this.MROTZ.setRotationZ(radians,true);
			this.rotZ = this.rotZ+radians;
		} else {
			this.MROTZ = this.MROTZ.setRotationZ(radians,false); 
			this.rotZ = radians;
		} 
		if(this.body != undefined) this.body.set_rotationZ(stormEngineC.utils.radToDeg(this.rotZ));
	}
	
	this.MROTXYZ = this.MROTZ.x(this.MROTY.x(this.MROTX));
	

};
/**
* Rotate the node in x axis
* @type Void
* @param {Float} radians
* @param {Bool} [relative=true] false for absolute rotation
*/
StormNode.prototype.setRotationX = function(radians, relative) {
	this.setRotation(radians, relative, $V3([1.0,0.0,0.0]));
};
/**
* Rotate the node in y axis
* @type Void
* @param {Float} radians
* @param {Bool} [relative=true] false for absolute rotation
*/
StormNode.prototype.setRotationY = function(radians, relative) {
	this.setRotation(radians, relative, $V3([0.0,1.0,0.0]));
};
/**
* Rotate the node in z axis
* @type Void
* @param {Float} radians
* @param {Bool} [relative=true] false for absolute rotation
*/
StormNode.prototype.setRotationZ = function(radians, relative) {
	this.setRotation(radians, relative, $V3([0.0,0.0,1.0]));
};
/**
* Rotate the node in x axis
* @returns {Float}
*/
StormNode.prototype.getRotationX = function() {
	return this.rotX;
};
/**
* Rotate the node in y axis
* @returns {Float}
*/
StormNode.prototype.getRotationY = function() {
	return this.rotY;
};
/**
* Rotate the node in z axis
* @returns {Float}
*/
StormNode.prototype.getRotationZ = function() {
	return this.rotZ;
};
/**
* Scale the node
* @type Void
* @param {Float} scale
* @param {Bool} [relative=true] false for absolute scale
* @param {StormV3} [axis=$V3([0.0,1.0,0.0])]
*/
StormNode.prototype.setScale = function(scale, relative, axis) {	
	if(axis != undefined && axis.e[0]) {
		if(relative == undefined || relative == true)
			this.VSCALE.e[0] = this.VSCALE.e[0]+scale;
		else
			this.VSCALE.e[0] = scale;
	}
	if(axis == undefined || axis.e[1]) {
		if(relative == undefined || relative == true)
			this.VSCALE.e[1] = this.VSCALE.e[1]+scale;
		else
			this.VSCALE.e[1] = scale;
	}
	if(axis != undefined && axis.e[2]) {  
		if(relative == undefined || relative == true)
			this.VSCALE.e[2] = this.VSCALE.e[2]+scale;
		else
			this.VSCALE.e[2] = scale;
	}
};
/**
* Scale the node in x axis
* @type Void
* @param {Float} scale
* @param {Bool} [relative=true] false for absolute scale
*/
StormNode.prototype.setScaleX = function(scale, relative) {
	this.setScale(scale, relative, $V3([1.0,0.0,0.0]));
};
/**
* Scale the node in y axis
* @type Void
* @param {Float} scale
* @param {Bool} [relative=true] false for absolute scale
*/
StormNode.prototype.setScaleY = function(scale, relative) {
	this.setScale(scale, relative, $V3([0.0,1.0,0.0]));
};
/**
* Scale the node in z axis
* @type Void
* @param {Float} scale
* @param {Bool} [relative=true] false for absolute scale
*/
StormNode.prototype.setScaleZ = function(scale, relative) {
	this.setScale(scale, relative, $V3([0.0,0.0,1.0]));
};
/**
* Get vector left
* @returns {StormV3}
*/
StormNode.prototype.getLeft = function() {
	return this.MROTXYZ.getLeft();
};
/**
* Get vector up
* @returns {StormV3}
*/
StormNode.prototype.getUp = function() {
	return this.MROTXYZ.getUp();
};
/**
* Get vector forward
* @returns {StormV3}
*/
StormNode.prototype.getForward = function() {
	return this.MROTXYZ.getForward();
};

/**
* Reset the rotation matrix
* @type Void
*/
StormNode.prototype.resetAxisRotation = function() {
	this.MROTX = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTY = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTZ = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTXYZ = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]); 
};
/**
* Reset the rotation and position matrix
* @type Void
*/
StormNode.prototype.resetAxis = function() {
	this.MPOS = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTX = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTY = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTZ = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.MROTXYZ = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
};

/**
* Add child node
* @returns {StormNode}
*/
StormNode.prototype.createChildNode = function() {
	var node = new StormNode();
	this.childNodes.push(node);
	return node;
};

/**
* Add physics to this node 
* @type Void
* @param {Object} jsonIn
*	 @param {String} jsonIn.type 'box'|'sphere'|'capsule'|'ground'|'trimesh'|'car'
*	 @param {StormV3} jsonIn.dimensions Dimension vector for type 'box'|'car'. Width, length and height
*	 @param {Float} jsonIn.dimensions Radius for type 'sphere'
*	 @param {Float} jsonIn.r Radius for type 'capsule'
*	 @param {Float} jsonIn.l Length for type 'capsule'
*	 @param {Float} jsonIn.mass Only if type is 'box'|'sphere'|'capsule'|'trimesh'|'car'. 0 mass = static body.
*	 @param {Float} jsonIn.friction The friction
*	 @param {Float} jsonIn.restitution The restitution (elasticity)
*	 @param {Float} jsonIn.maxVelocity Only if type is 'car'
*	 @param {Float} jsonIn.engineBreak Only if type is 'car'
*	 @param {Float} jsonIn.steerAngle Only if type is 'car'
* @example
* node.bodyEnable({	type: 'sphere',
*                   dimensions: 0.5,
*                   mass': 0.38,
*                   friction: 0.5,
*                   restitution: 0.2	});
*/
StormNode.prototype.bodyEnable = function(jsonIn) {
	this.jigLibTrimeshParams = jsonIn;
	
	var makeNow = false;
	if(jsonIn.oncollision != undefined) this.onCollision(jsonIn.oncollision);

	if(jsonIn.type == "box") {
		var shape = new jiglib.JBox(null,jsonIn.dimensions.e[0],jsonIn.dimensions.e[2],jsonIn.dimensions.e[1]);//width, depth, height
		makeNow = true;
	}
	if(jsonIn.type == "sphere") {
		var shape = new jiglib.JSphere(null, jsonIn.dimensions);
		makeNow = true;
	}
	if(jsonIn.type == "capsule") { // no funciona?
		var shape=new jiglib.JCapsule(null,jsonIn.r,jsonIn.l);
		makeNow = true;
	}
	if(jsonIn.type == "ground") {
		var shape = new jiglib.JPlane(null,new Vector3D(0, 1, 0, 0));
		this.jigLibTrimeshParams.mass = 0;
		makeNow = true;
	}
	if(jsonIn.type == "trimesh") {
		this.useJigLibTrimesh = true;
		
	}
	if(jsonIn.type == "car") {
		this.carMaxVelocity = (jsonIn.maxVelocity != undefined) ? jsonIn.maxVelocity : this.carMaxVelocity;
		this.carEngineBreakValue = (jsonIn.engineBreak != undefined) ? jsonIn.engineBreak : this.carEngineBreakValue;
		
		this.car = new jiglib.JCar(null);
		this.carSteerAngle = (jsonIn.steerAngle != undefined) ? jsonIn.steerAngle : this.carSteerAngle; // 45
		var steerRate = 8; // 1
		var driveTorque = 500; // 500
		this.car.setCar(this.carSteerAngle, steerRate, driveTorque);
		//this.car.setHBrake(1);
		this.body = this.car.get_chassis();
		this.body.set_sideLengths(new Vector3D(jsonIn.dimensions.e[0],jsonIn.dimensions.e[2],jsonIn.dimensions.e[1], 0)); // width , height depth
		this.body._material.friction = 0.5;
		this.body._material.restitution = 0.1;
		this.body.set_mass(jsonIn.mass);
		this.shadows = false;
		
		stormEngineC.stormJigLibJS.dynamicsWorld.addBody(this.body);
		
		this.body.moveTo(new Vector3D(this.MPOS.e[3],this.MPOS.e[7],this.MPOS.e[11],0));
	}
	
	if(makeNow) this.setCollisionBody(shape);
};
/** @private */
StormNode.prototype.setCollision = function(jsonIn) {this.bodyEnable(jsonIn);}; // deprecated

/**
* Active the body
* @param {Bool} [active=true]
*/
StormNode.prototype.bodyActive = function(active) { 
	if(this.body != undefined) {
		if(!active) this.body.setInactive();
		else this.body.setActive();
	}
};

/**
* Add wheels to car node
* @type Void
* @param	{Object} jsonIn
*	 @param {Array<StormNode>} jsonIn.nodesWheels Nodes frontLeft, frontRight, backLeft and backRight.
*	 @param {Float} [jsonIn.r=1.0] Radius
*	 @param {Float} [jsonIn.damping=0.7] Suspension
*/
StormNode.prototype.bodySetCarWheels = function(jsonIn) { 
	var sideFriction = (jsonIn.damping != undefined) ? (2.0+(jsonIn.damping*2.0)) : 4.0; //2.0; 0.0-4.0
	var fwdFriction = (jsonIn.damping != undefined) ? (2.0+(jsonIn.damping*2.0)) : 4.0; // 2.0; 0.0-4.0
	var travel = 2.0; // 1.0-2.0
	var wheelRadius = (jsonIn.r != undefined) ? jsonIn.r : 1.0; //10.0
	var restingFrac = 0.5; // 0.5 elasticity coefficient
	var dampingFrac = 0.5; // 0.5 suspension damping
	var rays = 1; // 1
	
	this.ndWheelFL = jsonIn.nodesWheels[0];
	this.ndWheelFL.shadows = false;
	this.car.setupWheel(0, new Vector3D(this.ndWheelFL.MPOS.e[3], this.ndWheelFL.MPOS.e[7],  this.ndWheelFL.MPOS.e[11]), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, false);
	this.wheelFL = this.car.get_wheels()[0];
	
	this.ndWheelFR = jsonIn.nodesWheels[1];
	this.ndWheelFR.shadows = false;
	this.car.setupWheel(1, new Vector3D(this.ndWheelFR.MPOS.e[3], this.ndWheelFR.MPOS.e[7],  this.ndWheelFR.MPOS.e[11]), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, false);
	this.wheelFR = this.car.get_wheels()[1];
	
	this.ndWheelBL = jsonIn.nodesWheels[2];
	this.ndWheelBL.shadows = false;
	this.car.setupWheel(2, new Vector3D(this.ndWheelBL.MPOS.e[3], this.ndWheelBL.MPOS.e[7],  this.ndWheelBL.MPOS.e[11]), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, true);
	this.wheelBL = this.car.get_wheels()[2];
	
	this.ndWheelBR = jsonIn.nodesWheels[3];
	this.ndWheelBR.shadows = false;
	this.car.setupWheel(3, new Vector3D(this.ndWheelBR.MPOS.e[3], this.ndWheelBR.MPOS.e[7],  this.ndWheelBR.MPOS.e[11]), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, true);
	this.wheelBR = this.car.get_wheels()[3];
};
/** @private */
StormNode.prototype.setCarWheels = function(jsonIn) {this.bodySetCarWheels(jsonIn);}; // deprecated

/** @private */
StormNode.prototype.generateTrimesh = function(stormMeshObject) {
	arrayVertex = [];
	arrayIndex = [];
	for(var b = 0, fb = stormMeshObject.vertexArray.length/3; b < fb; b++) {
		var idx = b*3;
		arrayVertex.push(new Vector3D(stormMeshObject.vertexArray[idx], stormMeshObject.vertexArray[idx+1], stormMeshObject.vertexArray[idx+2]));
	}
	for(var b = 0, fb = stormMeshObject.indexArray.length/3; b < fb; b++) {
		var idx = b*3;
		arrayIndex.push(new Vector3D(stormMeshObject.indexArray[idx], stormMeshObject.indexArray[idx+1], stormMeshObject.indexArray[idx+2]));
	}

	var skin = {'vertices':arrayVertex, 'indices':arrayIndex}
	var shape=new jiglib.JTriangleMesh(skin,new Vector3D(this.MPOS.e[3],this.MPOS.e[7],this.MPOS.e[11],0), new jiglib.Matrix3D(),40,5);
	//shape.createMesh(arrayVertex, arrayIndex);
	
	this.setCollisionBody(shape);
};

/** @private */
StormNode.prototype.setCollisionBody = function(shape) {
	var jsonIn = this.jigLibTrimeshParams;
	
	shape.set_friction(jsonIn.friction);
	shape.set_restitution(jsonIn.restitution);
	if(jsonIn.mass != 0) {
		shape.set_rotVelocityDamping(new Vector3D(0.999,0.999,0.999,0));
		shape.set_linVelocityDamping(new Vector3D(0.999,0.999,0.999,0));
		
		shape.set_mass(jsonIn.mass);
	} else {
		shape.set_movable(false);
	}
	
	this.body=shape;
	this.body.id=this.id;
	
	this.body._currState.orientation._rawData = $M16([	this.MROTXYZ.e[0], this.MROTXYZ.e[1], this.MROTXYZ.e[2], 0.0,
														this.MROTXYZ.e[4], this.MROTXYZ.e[5], this.MROTXYZ.e[6], 0.0,
														this.MROTXYZ.e[8], this.MROTXYZ.e[9], this.MROTXYZ.e[10], 0.0,
														0.0, 0.0, 0.0, 1.0]).e;
														
	this.body.moveTo(new Vector3D(this.MPOS.e[3],this.MPOS.e[7],this.MPOS.e[11],0));
	
	stormEngineC.stormJigLibJS.dynamicsWorld.addBody(this.body);
	stormEngineC.stormJigLibJS.colSystem.addCollisionBody(this.body);
};

/**
* Set the gravity for this node
* @param {StormV3} vector for the force and direction
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodySetGravity = function(value) {
	this.body._gravity = new Vector3D(value.e[0],value.e[1],value.e[2],0); 
};
/** @private */
StormNode.prototype.setGravity = function(value) {this.bodySetGravity(value);}; // deprecated

/**
* Set the friction for this node
* @param {Float} value Values from 0.0 to 1.0
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodySetFriction = function(value) {
	this.body._material.friction = value; 
};
/** @private */
StormNode.prototype.setFriction = function(value) {this.bodySetFriction(value);}; // deprecated

/**
* Set the restitution for this node
* @param {Float} value Values from 0.0 to 1.0
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodySetRestitution = function(value) {
	this.body._material.restitution = value; 
};
/** @private */
StormNode.prototype.setRestitution = function(value) {this.bodySetRestitution(value);}; // deprecated


/**
* Get the collision normal of this node with other node if collision exists. Otherwise return false.
* @returns {StormV3|Bool}
* @requires Enable collisions on the two nodes with setCollision function
*/
StormNode.prototype.bodyGetCollisionNormalWithNode = function(node) {
	if(this.nodePivot != undefined) {
		if(this.nodePivot.body != undefined) body = this.nodePivot.body;
	} else {
		if(this.body != undefined) body = this.body;
	}

	for(var n = 0, f = body.collisions.length; n < f; n++) {
		if(node.nodePivot != undefined) {
			if(body.collisions[n].objInfo.body1.id == node.nodePivot.body.id) return body.collisions[n].dirToBody;
		} else {
			if(body.collisions[n].objInfo.body1.id == node.body.id) return body.collisions[n].dirToBody;
		}
	}
	
	return false;
};
/** @private */
StormNode.prototype.getCollisionNormalWithNode = function(node) {return this.bodyGetCollisionNormalWithNode(node);}; // deprecated

/**
* Set the function to execute when occurred collision event 
* @param {Function} eventFunction
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyOnCollision = function(func) {
	if(typeof(func) == 'function') {
		this.onCollisionFunction = func;
	} else {
		console.log('The argument in event onCollision is not a function');
	}
};
/** @private */
StormNode.prototype.onCollision = function(func) {this.bodyOnCollision(func);}; // deprecated

/**
* Get the current direction vector.
* @returns {StormV3}
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyGetCurrentDir = function() {
	return $V3([this.body._currState.linVelocity.x, this.body._currState.linVelocity.y, this.body._currState.linVelocity.z]);
};
/** @private */
StormNode.prototype.getCurrentDir = function() {return this.bodyGetCurrentDir();}; // deprecated

/**
* Get the current velocity.
* @returns {Float}
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyGetCurrentVelocity = function() {
	var velocityDir = $V3([this.body._currState.linVelocity.x, this.body._currState.linVelocity.y, this.body._currState.linVelocity.z]);
 
	//var meshDir = $V3([this.MPOS.e[2], this.MPOS.e[6], this.MPOS.e[10]]);

	return velocityDir.modulus();
};
/** @private */
StormNode.prototype.getCurrentVelocity = function() {return this.bodyGetCurrentVelocity();}; // deprecated

/**
* Apply a impulse.
* @type Void
* @param {Object} jsonIn
*	 @param {StormV3} jsonIn.vector Direction and force.
*	 @param {Int} [jsonIn.milis=1000] Miliseconds
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyApplyImpulse = function(jsonIn) {
	if(this.body != undefined) {
		this.timeImpulse = new Date().getTime();
		clearTimeout(this.intervalImpulse);
		
		this.body.setActive();
		this.applyImpulseNow(jsonIn);
	}
};
/** @private */
StormNode.prototype.applyImpulse = function(jsonIn) {this.bodyApplyImpulse(jsonIn);}; // deprecated

/** @private */
StormNode.prototype.applyImpulseNow = function(jsonIn) {
	var milis = (jsonIn.milis != undefined) ? jsonIn.milis : 1000;
	var timeNow = new Date().getTime();
	if((timeNow-this.timeImpulse) < milis) {
		//this.body.applyBodyWorldImpulse(new Vector3D(jsonIn.vector.e[0], jsonIn.vector.e[1], jsonIn.vector.e[2], 0), new Vector3D(jsonIn.vector.e[0], jsonIn.vector.e[1], jsonIn.vector.e[2], 0), true); //impulse, delta, active
		
		//var cForce = $V3([this.body._force.x,this.body._force.y,this.body._force.z]).add(jsonIn.vector);
		//this.body._force = new Vector3D(cForce.e[0], cForce.e[1], cForce.e[2], 0); 
		this.body._force = new Vector3D(jsonIn.vector.e[0], jsonIn.vector.e[1], jsonIn.vector.e[2], 0); 
		
		//this.body._torque = new Vector3D(0.0, 0.0, 0.0, 0);
		//this.body.addWorldForce(new Vector3D(jsonIn.vector.e[0], jsonIn.vector.e[1], jsonIn.vector.e[2], 0), new Vector3D(0.0, 0.0, 0.0, 0), true);//f, p, active
		
		var _this = this;
		this.intervalImpulse = setTimeout(function(){_this.applyImpulseNow(jsonIn);},50);
	}
};

/**
* Apply torque.
* @type Void
* @param {Object} jsonIn
*	 @param {StormV3} jsonIn.vector Direction and force.
*	 @param {Int} [jsonIn.milis=1000] Miliseconds
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyApplyTorque = function(jsonIn) {
	if(this.body != undefined) {
		this.timeTorque = new Date().getTime();
		clearTimeout(this.intervalTorque);
		
		this.body.setActive();
		this.applyTorqueNow(jsonIn);
	}
};

/** @private */
StormNode.prototype.applyTorqueNow = function(jsonIn) {
	var milis = (jsonIn.milis != undefined) ? jsonIn.milis : 1000;
	var timeNow = new Date().getTime();
	if((timeNow-this.timeTorque) < milis) {

		this.body._torque = new Vector3D(jsonIn.vector.e[0], jsonIn.vector.e[1], jsonIn.vector.e[2], 0); 
		
		var _this = this;
		this.intervalTorque = setTimeout(function(){_this.applyTorqueNow(jsonIn);},50);
	}
};

/**
* Add a constraint.
* @type Void
* @param {Object} jsonIn
*	 @param {StormNode} jsonIn.parentNode The parent node.
*	 @param {StormV3} jsonIn.parentOffset Offset.
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyAddConstraint = function(jsonIn) {
	this.setPosition(jsonIn.parentNode.getPosition().add(jsonIn.parentOffset));
	this.constraint = new jiglib.JConstraintWorldPoint(this.body, new Vector3D(jsonIn.parentOffset.e[0]*-1.0, jsonIn.parentOffset.e[1]*-1.0, jsonIn.parentOffset.e[2]*-1.0, 0), new Vector3D(jsonIn.parentNode.getPosition().e[0], jsonIn.parentNode.getPosition().e[1], jsonIn.parentNode.getPosition().e[2], 0));
	stormEngineC.stormJigLibJS.dynamicsWorld.addConstraint(this.constraint);
	this.body.setActive();
	this.constraintParentNode = jsonIn.parentNode;
};
/** @private */
StormNode.prototype.addConstraint = function(jsonIn) {this.bodyAddConstraint(jsonIn);}; // deprecated

/**
* Remove a constraint.
* @type Void
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyRemoveConstraint = function() {
	stormEngineC.stormJigLibJS.dynamicsWorld.removeConstraint(this.constraint);
	this.constraint = undefined;
	this.constraintParentNode = undefined;
	this.body.setActive();
};
/** @private */
StormNode.prototype.removeConstraint = function() {this.bodyRemoveConstraint();}; // deprecated
 
/**
* Get the maximum speed of the car.
* @returns {Float}
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyGetMaxVelocityValue = function() {
	return this.carMaxVelocity;
};
/** @private */
StormNode.prototype.getMaxVelocityValue = function() {return this.bodyGetMaxVelocityValue();}; // deprecated

/**
* Get the braking value of the car.
* @returns {Float}
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyGetEngineBreakValue = function() {
	return this.carEngineBreakValue;
};
/** @private */
StormNode.prototype.getEngineBreakValue = function() {return this.bodyGetEngineBreakValue();}; // deprecated

/**
* Flip the car.
* @type Void
* @requires Enable collisions with setCollision function
*/
StormNode.prototype.bodyCarFlip = function() {
	this.body.roll(180);
};
/** @private */
StormNode.prototype.carFlip = function() {this.bodyCarFlip();}; // deprecated



/**
* Set key frame animation for StormNode, StormLight or StormCamera 
* @type Void
* @param {Int} frameNumber <br>
* @param {StormM16} [matrix1=CURRENT] If objectType of node is 'node' or 'light', set the matrix. If is 'camera' set the target matrix for this frame. <br>
* @param {StormM16} [matrix2=CURRENT] If objectType of node is 'camera', set the camera matrix for this frame. <br>
*/
StormNode.prototype.setAnimKey = function(frame, matrix1, matrix2) {
	if(this.animController == 'GlobalTimeline') {
		if(this.animMax == undefined || this.animMax < frame) {
			this.animMax = frame;
		}
		if(this.animMin == undefined || this.animMin > frame) {
			this.animMin = frame;
		}
		
		
		if(this.nodePivot == undefined) { // asignando a objeto
			this.animWMatrix[frame] = (matrix1 != undefined) ? matrix1 : $M16(this.MPOS.e);
		} else { // asignando a objeto del pivote de la cámara
			if(matrix1 != undefined) {
				this.nodePivot.animWMatrix[frame] = matrix1;
			} else {
				if(this.nodePivot.animWMatrix[frame] == undefined) {
					this.nodePivot.animWMatrix[frame] = $M16(this.nodePivot.MPOS.e);
				}
			}
			if(matrix2 != undefined) {
				this.nodeGoal.animWMatrix[frame] = matrix2;
			} else {
				if(this.nodeGoal.animWMatrix[frame] == undefined) {
					this.nodeGoal.animWMatrix[frame] = $M16(this.nodeGoal.MPOS.e);
				}
			}
		}
		stormEngineC.PanelAnimationTimeline.drawTimelineGrid();
	} else if(this.animController == 'LocalTimeline') {
		if(this.animCurrentLayerLocalTimeline[this.currLanimL] == undefined) this.animCurrentLayerLocalTimeline[this.currLanimL] = 0;
		if(this.animLoopLayerLocalTimeline[this.currLanimL] == undefined) this.animLoopLayerLocalTimeline[this.currLanimL] = false;
		
		if(this.animMaxLayerLocalTimeline[this.currLanimL] == undefined || this.animMaxLayerLocalTimeline[this.currLanimL] < frame) {
			this.animMaxLayerLocalTimeline[this.currLanimL] = frame;
		}
		if(this.animMinLayerLocalTimeline[this.currLanimL] == undefined || this.animMinLayerLocalTimeline[this.currLanimL] > frame) {
			this.animMinLayerLocalTimeline[this.currLanimL] = frame;
		}
		
		
		if(this.nodePivot == undefined) { // asignando a objeto
			if(this.animWMatrixLayerLocalTimeline[this.currLanimL] == undefined) this.animWMatrixLayerLocalTimeline[this.currLanimL] = [];
			
			this.animWMatrixLayerLocalTimeline[this.currLanimL][frame] = (matrix1 != undefined) ? matrix1 : $M16(this.MPOS.e);
		} else { // asignando a objeto del pivote de la cámara
			if(this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL] == undefined) this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL] = [];
			
			if(matrix1 != undefined) {
				this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][frame] = matrix1;
			} else {
				if(this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][frame] == undefined) {
					this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][frame] = $M16(this.nodePivot.MPOS.e);
				}
			}
			
			if(this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL] == undefined) this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL] = [];
			
			if(matrix2 != undefined) {
				this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL][frame] = matrix2;
			} else {
				if(this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL][frame] == undefined) {
					this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL][frame] = $M16(this.nodeGoal.MPOS.e);
				}
			}
		}
	}
};

/**
* Change position of existing key frame for StormNode, StormLight or StormCamera on 'GlobalTimeline'
* @type Void
* @param {Int} keyStart <br>
* @param {Int} keyEnd <br>
*/
StormNode.prototype.changeAnimKey = function(keyStart, keyEnd) {
	if(this.nodePivot == undefined) { // asignando a objeto
		this.animWMatrix[keyEnd] = this.animWMatrix[keyStart];
		this.animWMatrix[keyStart] = undefined;
	} else { // asignando a objeto del pivote de la cámara
		this.nodePivot.animWMatrix[keyEnd] = this.nodePivot.animWMatrix[keyStart];
		this.nodeGoal.animWMatrix[keyEnd] = this.nodeGoal.animWMatrix[keyStart];
		this.nodePivot.animWMatrix[keyStart] = undefined;
		this.nodeGoal.animWMatrix[keyStart] = undefined;
	}
	
	if(this.animMax < keyEnd) {
		this.animMax = keyEnd;
	}
	if(this.animMin > keyStart) {
		this.animMin = keyStart;
	}
};

/**
* Apply LocalTimeline animation matrixs to this node if LocalTimeline is activated
* @type Void
* @private
* @param {Int} frame 
*/
StormNode.prototype.applyAnimFrame = function(frame) { 
	this.animCurrentLayerLocalTimeline[this.currLanimL] = frame;

	if(this.objectType == 'node' && this.animMinLayerLocalTimeline[this.currLanimL] != undefined) { // existe animación
		var jsonM = this.getNodeMatrixForFrame(this.animCurrentLayerLocalTimeline[this.currLanimL]);
		this.MPOS = jsonM.vec;
	}
	if(this.objectType == 'light' && this.animMinLayerLocalTimeline[this.currLanimL] != undefined) { // existe animación
		var jsonM = this.getNodeMatrixForFrame(this.animCurrentLayerLocalTimeline[this.currLanimL]);
		this.MPOS = jsonM.vec;
		this.nodeCtxWebGL.MPOS = jsonM.vec.inverse();
	}
	if(this.objectType == 'camera' && this.animMinLayerLocalTimeline[this.currLanimL] != undefined) { // existe animación
		var jsonM = this.getNodeMatrixForFrame(this.animCurrentLayerLocalTimeline[this.currLanimL]);
		this.nodePivot.MPOS = jsonM.vec;
		this.nodeGoal.MPOS = jsonM.vecb;
	}
};

/**
* Get the matrix from LocalTimelineAnimation for a node in a desired frame
* @type Void
* @private  
* @param {Int} frameNumber
*/
StormNode.prototype.getNodeMatrixForFrame = function(frame) {
	
	if(this.animMinLayerLocalTimeline[this.currLanimL] != undefined) { // animation exists
			
			if(this.nodePivot == undefined) { // objects and lights
				if(this.animWMatrixLayerLocalTimeline[this.currLanimL][frame] != undefined) {
					return {'vec':$M16(this.animWMatrixLayerLocalTimeline[this.currLanimL][frame].e)};
				} else {
					for(var nb = frame, fb = this.animMinLayerLocalTimeline[this.currLanimL]; nb >= fb; nb--) {
						if(this.animWMatrixLayerLocalTimeline[this.currLanimL][nb] != undefined) {
							var prevFrame = nb;	break;
						}
					}
					for(var nb = frame, fb = this.animMaxLayerLocalTimeline[this.currLanimL]; nb <= fb; nb++) {
						if(this.animWMatrixLayerLocalTimeline[this.currLanimL][nb] != undefined) {
							var nextFrame = nb;	break;
						}
					}
					if(prevFrame == undefined) return {'vec':$M16(this.animWMatrixLayerLocalTimeline[this.currLanimL][nextFrame].e)};
					if(nextFrame == undefined) return {'vec':$M16(this.animWMatrixLayerLocalTimeline[this.currLanimL][prevFrame].e)};
					
					
					var unitPosPrevNext = (nextFrame-frame)/(nextFrame-prevFrame);
					var pivotPrevFrameWMatrix = this.animWMatrixLayerLocalTimeline[this.currLanimL][prevFrame].e; var ppM = pivotPrevFrameWMatrix;
					var pivotNextFrameWMatrix = this.animWMatrixLayerLocalTimeline[this.currLanimL][nextFrame].e; var pnM = pivotNextFrameWMatrix;
					var arrWMatrix = [];
					var tt;
					arrWMatrix[0] = pnM[0]-((pnM[0]-ppM[0])*unitPosPrevNext);
					arrWMatrix[1] = pnM[1]-((pnM[1]-ppM[1])*unitPosPrevNext);
					arrWMatrix[2] = pnM[2]-((pnM[2]-ppM[2])*unitPosPrevNext);
					arrWMatrix[3] = pnM[3]-((pnM[3]-ppM[3])*unitPosPrevNext);
					arrWMatrix[4] = pnM[4]-((pnM[4]-ppM[4])*unitPosPrevNext);
					arrWMatrix[5] = pnM[5]-((pnM[5]-ppM[5])*unitPosPrevNext);
					arrWMatrix[6] = pnM[6]-((pnM[6]-ppM[6])*unitPosPrevNext);
					arrWMatrix[7] = pnM[7]-((pnM[7]-ppM[7])*unitPosPrevNext);
					arrWMatrix[8] = pnM[8]-((pnM[8]-ppM[8])*unitPosPrevNext);
					arrWMatrix[9] = pnM[9]-((pnM[9]-ppM[9])*unitPosPrevNext);
					arrWMatrix[10] = pnM[10]-((pnM[10]-ppM[10])*unitPosPrevNext);
					arrWMatrix[11] = pnM[11]-((pnM[11]-ppM[11])*unitPosPrevNext);
					arrWMatrix[12] = pnM[12]-((pnM[12]-ppM[12])*unitPosPrevNext);
					arrWMatrix[13] = pnM[13]-((pnM[13]-ppM[13])*unitPosPrevNext);
					arrWMatrix[14] = pnM[14]-((pnM[14]-ppM[14])*unitPosPrevNext);
					arrWMatrix[15] = pnM[15]-((pnM[15]-ppM[15])*unitPosPrevNext);
					return {'vec':$M16(arrWMatrix)};
				}
			} else { // cámaras
				if(this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][frame] != undefined) {
					return {'vec':$M16(this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][frame].e),'vecb':$M16(this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL][frame].e)};
				} else {
					for(var nb = frame, fb = this.animMinLayerLocalTimeline[this.currLanimL]; nb >= fb; nb--) {
						if(this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][nb] != undefined) {
							var prevFrame = nb;	break;
						}
					}
					for(var nb = frame, fb = this.animMaxLayerLocalTimeline[this.currLanimL]; nb <= fb; nb++) {
						if(this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][nb] != undefined) {
							var nextFrame = nb;	break;
						}
					}
					if(prevFrame == undefined) return {'vec':$M16(this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][nextFrame].e),'vecb':$M16(this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL][nextFrame].e)};
					if(nextFrame == undefined) return {'vec':$M16(this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][prevFrame].e),'vecb':$M16(this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL][prevFrame].e)};
					
					
					var unitPosPrevNext = (nextFrame-frame)/(nextFrame-prevFrame);
					var pivotPrevFrameWMatrix = this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][prevFrame].e; var ppM = pivotPrevFrameWMatrix;
					var pivotNextFrameWMatrix = this.nodePivot.animWMatrixLayerLocalTimeline[this.currLanimL][nextFrame].e; var pnM = pivotNextFrameWMatrix;
					var arrPivotWMatrix = [];
					var tt;
					arrPivotWMatrix[0] = pnM[0]-((pnM[0]-ppM[0])*unitPosPrevNext);
					arrPivotWMatrix[1] = pnM[1]-((pnM[1]-ppM[1])*unitPosPrevNext);
					arrPivotWMatrix[2] = pnM[2]-((pnM[2]-ppM[2])*unitPosPrevNext);
					arrPivotWMatrix[3] = pnM[3]-((pnM[3]-ppM[3])*unitPosPrevNext);
					arrPivotWMatrix[4] = pnM[4]-((pnM[4]-ppM[4])*unitPosPrevNext);
					arrPivotWMatrix[5] = pnM[5]-((pnM[5]-ppM[5])*unitPosPrevNext);
					arrPivotWMatrix[6] = pnM[6]-((pnM[6]-ppM[6])*unitPosPrevNext);
					arrPivotWMatrix[7] = pnM[7]-((pnM[7]-ppM[7])*unitPosPrevNext);
					arrPivotWMatrix[8] = pnM[8]-((pnM[8]-ppM[8])*unitPosPrevNext);
					arrPivotWMatrix[9] = pnM[9]-((pnM[9]-ppM[9])*unitPosPrevNext);
					arrPivotWMatrix[10] = pnM[10]-((pnM[10]-ppM[10])*unitPosPrevNext);
					arrPivotWMatrix[11] = pnM[11]-((pnM[11]-ppM[11])*unitPosPrevNext);
					arrPivotWMatrix[12] = pnM[12]-((pnM[12]-ppM[12])*unitPosPrevNext);
					arrPivotWMatrix[13] = pnM[13]-((pnM[13]-ppM[13])*unitPosPrevNext);
					arrPivotWMatrix[14] = pnM[14]-((pnM[14]-ppM[14])*unitPosPrevNext);
					arrPivotWMatrix[15] = pnM[15]-((pnM[15]-ppM[15])*unitPosPrevNext);
					
					var goalPrevFrameWMatrix = this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL][prevFrame].e; var gpM = goalPrevFrameWMatrix;
					var goalNextFrameWMatrix = this.nodeGoal.animWMatrixLayerLocalTimeline[this.currLanimL][nextFrame].e; var gnM = goalNextFrameWMatrix;
					var arrGoalWMatrix = [];
					arrGoalWMatrix[0] = gnM[0]-((gnM[0]-gpM[0])*unitPosPrevNext);
					arrGoalWMatrix[1] = gnM[1]-((gnM[1]-gpM[1])*unitPosPrevNext);
					arrGoalWMatrix[2] = gnM[2]-((gnM[2]-gpM[2])*unitPosPrevNext);
					arrGoalWMatrix[3] = gnM[3]-((gnM[3]-gpM[3])*unitPosPrevNext);
					arrGoalWMatrix[4] = gnM[4]-((gnM[4]-gpM[4])*unitPosPrevNext);
					arrGoalWMatrix[5] = gnM[5]-((gnM[5]-gpM[5])*unitPosPrevNext);
					arrGoalWMatrix[6] = gnM[6]-((gnM[6]-gpM[6])*unitPosPrevNext);
					arrGoalWMatrix[7] = gnM[7]-((gnM[7]-gpM[7])*unitPosPrevNext);
					arrGoalWMatrix[8] = gnM[8]-((gnM[8]-gpM[8])*unitPosPrevNext);
					arrGoalWMatrix[9] = gnM[9]-((gnM[9]-gpM[9])*unitPosPrevNext);
					arrGoalWMatrix[10] = gnM[10]-((gnM[10]-gpM[10])*unitPosPrevNext);
					arrGoalWMatrix[11] = gnM[11]-((gnM[11]-gpM[11])*unitPosPrevNext);
					arrGoalWMatrix[12] = gnM[12]-((gnM[12]-gpM[12])*unitPosPrevNext);
					arrGoalWMatrix[13] = gnM[13]-((gnM[13]-gpM[13])*unitPosPrevNext);
					arrGoalWMatrix[14] = gnM[14]-((gnM[14]-gpM[14])*unitPosPrevNext);
					arrGoalWMatrix[15] = gnM[15]-((gnM[15]-gpM[15])*unitPosPrevNext);
					
					return {'vec':$M16(arrPivotWMatrix),'vecb':$M16(arrGoalWMatrix)};
				}
			}
			
		
	} else {
		if(this.nodePivot == undefined) { // objects and lights
			return {'vec':$M16(this.MPOS.e)};
		} else { // cámaras
			return {'vec':$M16(this.nodePivot.MPOS.e),'vecb':$M16(this.nodeGoal.MPOS.e)};
		}
	}
		
};

/**
* Set the timeline controller. 'GlobalTimeline' or 'LocalTimeline'
* @type Void
* @param {String} [timeline="GlobalTimeline"] 'GlobalTimeline' or 'LocalTimeline'<br>
* @param {Int} [layer=0] The active layer for the 'LocalTimeline' controller <br>
*/
StormNode.prototype.setTimelineControl = function(timeline, layer) {
	this.animController = (timeline != undefined) ? timeline : 'GlobalTimeline'; 
	this.currLanimL = (layer != undefined) ? layer : 0; 
};

/**
* Enable animation loop for the current layer if the timeline controller for this node is 'LocalTimeline'
* @type Void
* @param {Bool} [loop=false] <br>
*/
StormNode.prototype.enableLocalTimelineLayerLoop = function(loop) {
	if(this.animController == 'LocalTimeline') {
		this.animLoopLayerLocalTimeline[this.currLanimL] = (loop != undefined) ? loop : false;
	} else {
		alert('Loop must be applied on "LocalTimeline"'); 
	}
};

/**
* Set the animation frame for the current layer if the timeline controller for this node is 'LocalTimeline'
* @type Void
* @param {Int} [frame=0] <br>
*/
StormNode.prototype.setLocalTimelineLayerFrame = function(frame) {
	if(this.animController == 'LocalTimeline') {
		this.animCurrentLayerLocalTimeline[this.currLanimL] = (frame != undefined) ? frame : 0;
	} else {
		alert('Frame must be applied on "LocalTimeline"'); 
	}
};

/**
* Play LocalTimeline animation
* @type Void
*/
StormNode.prototype.playLocal = function() {
	this.playLocalTimeline = true; 
};

/**
* Stop LocalTimeline animation
* @type Void
*/
StormNode.prototype.stopLocal = function() {
	this.playLocalTimeline = false; 
};

 

