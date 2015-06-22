/**
* @class
* @constructor
*/
StormMesh = function() {
	this.vertexArray;	
	this.normalArray;	
	this.textureArray;	
	this.textureUnitArray;
	this.indexArray;
	
	this.objIndex = []; // for store new indexes
	this.indexMax=0; 
};

/**
* Load a point on node
* @private 
* @type Void
*/
StormMesh.prototype.loadPoint = function(node) {
	this.vertexArray = [0.0, 0.0, 0.0];
	
	var meshObject = new Object;
	meshObject.vertexArray = this.vertexArray;
	
	if(node != undefined) { 
		var bObject = node.attachMesh(meshObject);
		node.materialUnits[0] = stormEngineC.createMaterial();
		node.materialUnits[0].write($V3([Math.random(), Math.random(), Math.random()]));
		bObject.drawElementsMode = 0;
	} else {
		return this; 
	}
};

/**
* Load a triangle on node
* @private 
* @type Void
*/
StormMesh.prototype.loadTriangle = function(node) {
	this.vertexArray = [0.0, 1.0, 0.0,
						1.0, 0.0, 0.0,
						0.0, 0.0, 0.0];	
	this.normalArray = [0.0, 0.0, 1.0,
	                    0.0, 0.0, 1.0,
	                    0.0, 0.0, 1.0];	
	this.textureArray = [0.0, 0.0, 0.0,
	                     1.0, 0.0, 0.0,
	                     1.0, 1.0, 0.0];
	this.textureUnitArray = [0.0, 0.0, 0.0];
	this.indexArray = [0, 1, 2];
	
	var meshObject = new Object;
	meshObject.vertexArray = this.vertexArray;
	meshObject.normalArray = this.normalArray;
	meshObject.textureArray = this.textureArray;
	meshObject.textureUnitArray = this.textureUnitArray;
	meshObject.indexArray = this.indexArray;
	
	if(node != undefined) { 
		var bObject = node.attachMesh(meshObject);
		node.materialUnits[0] = stormEngineC.createMaterial();
		node.materialUnits[0].write($V3([Math.random(), Math.random(), Math.random()]));
	} else {
		return this; 
	}
};

/**
* Load a box on node
* @private 
* @type Void
*/
StormMesh.prototype.loadBox = function(node, vecDim) {
	var d = (vecDim != undefined) ? vecDim.x(0.5).e : new Float32Array([0.5,0.5,0.5]);
	this.vertexArray = [-1.0*d[0], -1.0*d[1],  1.0*d[2],// Front face
	                     1.0*d[0], -1.0*d[1],  1.0*d[2],
	                     1.0*d[0],  1.0*d[1],  1.0*d[2],
	                    -1.0*d[0],  1.0*d[1],  1.0*d[2],
	                    // Back face
	                    -1.0*d[0], -1.0*d[1], -1.0*d[2],
	                    -1.0*d[0],  1.0*d[1], -1.0*d[2],
	                     1.0*d[0],  1.0*d[1], -1.0*d[2],
	                     1.0*d[0], -1.0*d[1], -1.0*d[2],
	                    // Top face
	                    -1.0*d[0],  1.0*d[1], -1.0*d[2],
	                    -1.0*d[0],  1.0*d[1],  1.0*d[2],
	                     1.0*d[0],  1.0*d[1],  1.0*d[2],
	                     1.0*d[0],  1.0*d[1], -1.0*d[2],
	                    // Bottom face
	                    -1.0*d[0], -1.0*d[1], -1.0*d[2],
	                     1.0*d[0], -1.0*d[1], -1.0*d[2],
	                     1.0*d[0], -1.0*d[1],  1.0*d[2],
	                    -1.0*d[0], -1.0*d[1],  1.0*d[2],
	                    // Right face
	                     1.0*d[0], -1.0*d[1], -1.0*d[2],
	                     1.0*d[0],  1.0*d[1], -1.0*d[2],
	                     1.0*d[0],  1.0*d[1],  1.0*d[2],
	                     1.0*d[0], -1.0*d[1],  1.0*d[2],
	                    // Left face
	                    -1.0*d[0], -1.0*d[1], -1.0*d[2],
	                    -1.0*d[0], -1.0*d[1],  1.0*d[2],
	                    -1.0*d[0],  1.0*d[1],  1.0*d[2],
	                    -1.0*d[0],  1.0*d[1], -1.0*d[2]];	
	this.normalArray = [0.0,  0.0,  1.0,// Front face
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0,
	                   // Back face
	                    0.0,  0.0, -1.0,
	                    0.0,  0.0, -1.0,
	                    0.0,  0.0, -1.0,
	                    0.0,  0.0, -1.0,
	                   // Top face
	                    0.0,  1.0,  0.0,
	                    0.0,  1.0,  0.0,
	                    0.0,  1.0,  0.0,
	                    0.0,  1.0,  0.0,
	                   // Bottom face
	                    0.0, -1.0,  0.0,
	                    0.0, -1.0,  0.0,
	                    0.0, -1.0,  0.0,
	                    0.0, -1.0,  0.0,
	                   // Right face
	                    1.0,  0.0,  0.0,
	                    1.0,  0.0,  0.0,
	                    1.0,  0.0,  0.0,
	                    1.0,  0.0,  0.0,
	                   // Left face
	                   -1.0,  0.0,  0.0,
	                   -1.0,  0.0,  0.0,
	                   -1.0,  0.0,  0.0,
	                   -1.0,  0.0,  0.0];	
	this.textureArray = [0.0, 0.0, 0.0,// Front face
	                     1.0, 0.0, 0.0,
	                     1.0, 1.0, 0.0,
	                     0.0, 1.0, 0.0,
	                     // Back face
	                     1.0, 0.0, 0.0,
	                     1.0, 1.0, 0.0,
	                     0.0, 1.0, 0.0,
	                     0.0, 0.0, 0.0,
	                     // Top face
	                     0.0, 1.0, 0.0,
	                     0.0, 0.0, 0.0,
	                     1.0, 0.0, 0.0,
	                     1.0, 1.0, 0.0,
	                     // Bottom face
	                     1.0, 1.0, 0.0,
	                     0.0, 1.0, 0.0,
	                     0.0, 0.0, 0.0,
	                     1.0, 0.0, 0.0,
	                     // Right face
	                     1.0, 0.0, 0.0,
	                     1.0, 1.0, 0.0,
	                     0.0, 1.0, 0.0,
	                     0.0, 0.0, 0.0,
	                     // Left face
	                     0.0, 0.0, 0.0,
	                     1.0, 0.0, 0.0,
	                     1.0, 1.0, 0.0,
	                     0.0, 1.0, 0.0];
	this.textureUnitArray = [0.0,0.0,0.0,0.0,// Front face
							 // Back face
							 0.0,0.0,0.0,0.0,
							 // Top face
							 0.0,0.0,0.0,0.0,
							 // Bottom face
							 0.0,0.0,0.0,0.0,
							 // Right face
							 0.0,0.0,0.0,0.0,
							 // Left face
							 0.0,0.0,0.0,0.0];
	this.indexArray = [0, 1, 2,      0, 2, 3,    // Front face
	                   4, 5, 6,      4, 6, 7,    // Back face
	                   8, 9, 10,     8, 10, 11,  // Top face
	                   12, 13, 14,   12, 14, 15, // Bottom face
	                   16, 17, 18,   16, 18, 19, // Right face
	                   20, 21, 22,   20, 22, 23];  // Left face
	
	var meshObject = {};
	meshObject.vertexArray = this.vertexArray;
	meshObject.normalArray = this.normalArray;
	meshObject.textureArray = this.textureArray;
	meshObject.textureUnitArray = this.textureUnitArray;
	meshObject.indexArray = this.indexArray;
	
	if(node != undefined) { 
		var bObject = node.attachMesh(meshObject);
		node.materialUnits[0] = stormEngineC.createMaterial();
		node.materialUnits[0].write($V3([Math.random(), Math.random(), Math.random()]));
	} else {
		return this; 
	}
};

/**
* Load a quad on node
* @private 
* @type Void
*/
StormMesh.prototype.loadQuad = function(node, length, height) {
	var l=(length==undefined)?0.5:length;
	var h=(height==undefined)?0.5:height;
	this.vertexArray = [-l, -h, 0.0,// Front face
	                     l, -h, 0.0,
	                     l,  h, 0.0,
	                    -l,  h, 0.0];	
	this.normalArray = [0.0,  0.0,  1.0,// Front face
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0];	
	this.textureArray = [0.0, 0.0, 0.0,// Front face
	                     1.0, 0.0, 0.0,
	                     1.0, 1.0, 0.0,
	                     0.0, 1.0, 0.0];
	this.textureUnitArray = [0.0,0.0,0.0,0.0];
	this.indexArray = [0, 1, 2,	 	0, 2, 3];// Front face
	
	var meshObject = new Object;
	meshObject.vertexArray = this.vertexArray;
	meshObject.normalArray = this.normalArray;
	meshObject.textureArray = this.textureArray;
	meshObject.textureUnitArray = this.textureUnitArray;
	meshObject.indexArray = this.indexArray;
	
	if(node != undefined) { 
		var bObject = node.attachMesh(meshObject);
		node.materialUnits[0] = stormEngineC.createMaterial();
		node.materialUnits[0].write($V3([Math.random(), Math.random(), Math.random()]));
	} else {
		return this; 
	}
};
StormMesh.prototype.testIfInIndices = function(vA1, norm, tA1) {
	var indexA = undefined;
	for(var nB = 0, fb = this.objIndex.length; nB < fb; nB++) {
		if(this.objIndex[nB].v.e[0] == vA1.e[0] && this.objIndex[nB].v.e[1] == vA1.e[1] && this.objIndex[nB].v.e[2] == vA1.e[2]) {
			indexA = this.objIndex[nB].i;
		}
	}
	if(indexA == undefined) {
		indexA = this.indexMax; 
		this.objIndex.push({i:indexA,v:$V3([vA1.e[0],vA1.e[1],vA1.e[2]])});
		this.indexMax++;
		this.vertexArray.push(vA1.e[0],vA1.e[1],vA1.e[2]);
		this.normalArray.push(norm.e[0],norm.e[1],norm.e[2]);
		this.textureArray.push(tA1.e[0],tA1.e[1],tA1.e[2]);
		this.textureUnitArray.push(0.0);
	}
	return indexA;
};
/**
* Load a tube on node
* @private 
* @type Void
*/
StormMesh.prototype.loadTube = function(jsonIn) {  
	var hei = (jsonIn.height != undefined) ? jsonIn.height : 1.0;  
	var segments = (jsonIn.segments != undefined) ? jsonIn.segments : 6;  
	var outerRadius = (jsonIn.outerRadius != undefined) ? jsonIn.outerRadius : 1.0;  
	var innerRadius = (jsonIn.innerRadius != undefined) ? jsonIn.innerRadius : 0.7;  

	this.vertexArray = [];
	this.normalArray = [];
	this.textureArray = [];
	this.textureUnitArray = [];
	this.indexArray = [];
	
	this.objIndex = [];
	this.indexMax=0; 
	
	
	cos = function(val) {return Math.cos(stormEngineC.utils.degToRad(val))};
	sin = function(val) {return Math.sin(stormEngineC.utils.degToRad(val))};
	var stepAngle = 180.0/(segments+1); 
	var numSegH = 360.0/stepAngle;
	for(var h=1, fh = numSegH; h <= fh; h++) { 
		var currAngleH = stepAngle*h;
	
		// OUTER FACE
		var currAngleV = 90.0;
		// vertices
		var vA1 = $V3([	cos(currAngleH-stepAngle) * outerRadius, 	0.0, sin(currAngleH-stepAngle) * outerRadius]);
		var vB1 = $V3([	cos(currAngleH) * outerRadius, 				0.0, sin(currAngleH) * outerRadius]);
		var vC1 = $V3([	cos(currAngleH-stepAngle) * outerRadius, 	hei, sin(currAngleH-stepAngle) * outerRadius]);
		var vD1 = $V3([	cos(currAngleH) * outerRadius, 				hei, sin(currAngleH) * outerRadius]);
		// normales
		var norm = vB1.subtract(vA1).cross(vC1.subtract(vA1)).normalize();
		// texturas
		var tA1 = $V3([(currAngleH-stepAngle)/360.0, 	0.0, 0.0]);
		var tB1 = $V3([(currAngleH)/360.0,				0.0, 0.0]);
		var tC1 = $V3([(currAngleH-stepAngle)/360.0, 	1.0, 0.0]);
		var tD1 = $V3([(currAngleH)/360.0,				1.0, 0.0]);
		//indices
		var indexA = this.testIfInIndices(vA1, norm, tA1);
		var indexB = this.testIfInIndices(vB1, norm, tB1);
		var indexC = this.testIfInIndices(vC1, norm, tC1);
		var indexD = this.testIfInIndices(vD1, norm, tD1);
		
		this.indexArray.push(indexA,indexB,indexD, indexD,indexC,indexA); 	 
		
		// INNER FACE
		var currAngleV = 90.0;
		// vertices
		var vA1 = $V3([	cos(currAngleH-stepAngle) * innerRadius, 	0.0, sin(currAngleH-stepAngle) * innerRadius]);
		var vB1 = $V3([	cos(currAngleH) * innerRadius, 				0.0, sin(currAngleH) * innerRadius]);
		var vC1 = $V3([	cos(currAngleH-stepAngle) * innerRadius, 	hei, sin(currAngleH-stepAngle) * innerRadius]);
		var vD1 = $V3([	cos(currAngleH) * innerRadius, 				hei, sin(currAngleH) * innerRadius]);
		// normales
		var norm = vB1.subtract(vA1).cross(vC1.subtract(vA1)).normalize();
		// texturas
		var tA1 = $V3([(currAngleH-stepAngle)/360.0, 	0.0, 0.0]);
		var tB1 = $V3([(currAngleH)/360.0,				0.0, 0.0]);
		var tC1 = $V3([(currAngleH-stepAngle)/360.0, 	1.0, 0.0]);
		var tD1 = $V3([(currAngleH)/360.0,				1.0, 0.0]);
		//indices
		var indexA = this.testIfInIndices(vA1, norm, tA1);
		var indexB = this.testIfInIndices(vB1, norm, tB1);
		var indexC = this.testIfInIndices(vC1, norm, tC1);
		var indexD = this.testIfInIndices(vD1, norm, tD1);
		
		this.indexArray.push(indexA,indexB,indexD, indexD,indexC,indexA); 	 
		
		// BOTTOM FACE
		var currAngleV = 0.0;
		// vertices
		var vA1 = $V3([	cos(currAngleH-stepAngle) * outerRadius, 	0.0, sin(currAngleH-stepAngle) * outerRadius]);
		var vB1 = $V3([	cos(currAngleH) * outerRadius, 				0.0, sin(currAngleH) * outerRadius]);
		var vC1 = $V3([	cos(currAngleH-stepAngle) * innerRadius, 	0.0, sin(currAngleH-stepAngle) * innerRadius]);
		var vD1 = $V3([	cos(currAngleH) * innerRadius, 				0.0, sin(currAngleH) * innerRadius]);
		// normales
		var norm = vB1.subtract(vA1).cross(vC1.subtract(vA1)).normalize();
		// texturas
		var tA1 = $V3([(currAngleH-stepAngle)/360.0, 	1.0-((currAngleV-stepAngle)/180.0), 0.0]);
		var tB1 = $V3([(currAngleH)/360.0,				1.0-(currAngleV/180.0), 			0.0]);
		var tC1 = $V3([(currAngleH-stepAngle)/360.0, 	1.0-((currAngleV-stepAngle)/180.0), 0.0]);
		var tD1 = $V3([(currAngleH)/360.0,				1.0-((currAngleV)/180.0),			0.0]);
		//indices
		var indexA = this.testIfInIndices(vA1, norm, tA1);
		var indexB = this.testIfInIndices(vB1, norm, tB1);
		var indexC = this.testIfInIndices(vC1, norm, tC1);
		var indexD = this.testIfInIndices(vD1, norm, tD1);
		
		this.indexArray.push(indexA,indexB,indexD, indexD,indexC,indexA); 	 

		// TOP FACE
		var currAngleV = 0.0;
		// vertices
		var vA1 = $V3([	cos(currAngleH-stepAngle) * outerRadius, 	hei, sin(currAngleH-stepAngle) * outerRadius]);
		var vB1 = $V3([	cos(currAngleH) * outerRadius, 				hei, sin(currAngleH) * outerRadius]);
		var vC1 = $V3([	cos(currAngleH-stepAngle) * innerRadius, 	hei, sin(currAngleH-stepAngle) * innerRadius]);
		var vD1 = $V3([	cos(currAngleH) * innerRadius, 				hei, sin(currAngleH) * innerRadius]);
		// normales
		var norm = vB1.subtract(vA1).cross(vC1.subtract(vA1)).normalize();
		// texturas
		var tA1 = $V3([(currAngleH-stepAngle)/360.0, 	1.0-((currAngleV-stepAngle)/180.0), 0.0]);
		var tB1 = $V3([(currAngleH)/360.0,				1.0-(currAngleV/180.0), 			0.0]);
		var tC1 = $V3([(currAngleH-stepAngle)/360.0, 	1.0-((currAngleV-stepAngle)/180.0), 0.0]);
		var tD1 = $V3([(currAngleH)/360.0,				1.0-((currAngleV)/180.0),			0.0]);
		//indices
		var indexA = this.testIfInIndices(vA1, norm, tA1);
		var indexB = this.testIfInIndices(vB1, norm, tB1);
		var indexC = this.testIfInIndices(vC1, norm, tC1);
		var indexD = this.testIfInIndices(vD1, norm, tD1);
		
		this.indexArray.push(indexA,indexB,indexD, indexD,indexC,indexA);
	}		

	var meshObject = new Object;
	meshObject.vertexArray = this.vertexArray;
	meshObject.normalArray = this.normalArray;
	meshObject.textureArray = this.textureArray;
	meshObject.textureUnitArray = this.textureUnitArray;
	meshObject.indexArray = this.indexArray;
	
	if(jsonIn.node != undefined) { 
		var bObject = jsonIn.node.attachMesh(meshObject);
		jsonIn.node.materialUnits[0] = stormEngineC.createMaterial();
		if(jsonIn.color != undefined) {
			jsonIn.node.materialUnits[0].write($V3([jsonIn.color.e[0], jsonIn.color.e[1], jsonIn.color.e[2]]));
		} else {
			jsonIn.node.materialUnits[0].write($V3([Math.random(), Math.random(), Math.random()]));
		}
	} else {
		return this; 
	}
};
/**
* Load a sphere on node
* @private 
* @type Void
*/
StormMesh.prototype.loadSphere = function(jsonIn) { 
	var segments = (jsonIn.segments != undefined) ? jsonIn.segments : 6;  
	var rad = (jsonIn.radius != undefined) ? jsonIn.radius : 1.0;  

	this.vertexArray = [];
	this.normalArray = [];
	this.textureArray = [];
	this.textureUnitArray = [];
	this.indexArray = [];
	
	this.objIndex = []; // for store new indexes
	this.indexMax=0;  
	
	
	var stepAngle = 180.0/(segments+1); 
	var numSegV = 180.0/stepAngle;
	var numSegH = 360.0/stepAngle;
	
	cos = function(val) {return Math.cos(stormEngineC.utils.degToRad(val))};
	sin = function(val) {return Math.sin(stormEngineC.utils.degToRad(val))};
	for(var v=1, fv = numSegV; v <= fv; v++) {
		var currAngleV = stepAngle*v;
	
		for(var h=1, fh = numSegH; h <= fh; h++) { 
			var currAngleH = stepAngle*h;
			
			if(v<numSegV) { // primero(1 triángulo hacia arriba) e intermedios
				// PRIMER TRIÁNGULO
				// vertices
				var vA1 = $V3([	cos(currAngleH) * Math.abs(sin(currAngleV)) *rad, 
								cos(currAngleV) *rad,
								sin(currAngleH) * Math.abs(sin(currAngleV)) *rad]);
				var vB1 = $V3([	cos(currAngleH-stepAngle) * Math.abs(sin(currAngleV)) *rad,
								cos(currAngleV) *rad,
								sin(currAngleH-stepAngle) * Math.abs(sin(currAngleV)) *rad]);
				var vC1 = $V3([	cos(currAngleH) * Math.abs(sin(currAngleV-stepAngle)) *rad,
								cos(currAngleV-stepAngle) *rad,
								sin(currAngleH) * Math.abs(sin(currAngleV-stepAngle)) *rad]);
				// normales
				var norm = vB1.subtract(vA1).cross(vC1.subtract(vA1)).normalize();
				// texturas
				var tA1 = $V3([currAngleH/360.0, 1.0-(currAngleV/180.0), 0.0]);
				var tB1 = $V3([(currAngleH-stepAngle)/360.0, 1.0-(currAngleV/180.0), 0.0]);
				var tC1 = $V3([currAngleH/360.0, 1.0-((currAngleV-stepAngle)/180.0), 0.0]);
				//indices
				var indexA = this.testIfInIndices(vA1, norm, tA1);
				var indexB = this.testIfInIndices(vB1, norm, tB1);
				var indexC = this.testIfInIndices(vC1, norm, tC1);
				
				this.indexArray.push(indexA,indexB,indexC);
			}
			if(v>1) { // último(1 triángulo hacia abajo) e intermedios
				// SEGUNDO TRIÁNGULO
				// vertices
				var vA2 = $V3([	cos(currAngleH-stepAngle) * Math.abs(sin(currAngleV-stepAngle)) *rad,
								cos(currAngleV-stepAngle) *rad,
								sin(currAngleH-stepAngle) * Math.abs(sin(currAngleV-stepAngle)) *rad]);
				var vB2 = $V3([	cos(currAngleH) * Math.abs(sin(currAngleV-stepAngle)) *rad,
								cos(currAngleV-stepAngle) *rad,
								sin(currAngleH) * Math.abs(sin(currAngleV-stepAngle)) *rad]);
				var vC2 = $V3([	cos(currAngleH-stepAngle) * Math.abs(sin(currAngleV)) *rad,
								cos(currAngleV) *rad,
								sin(currAngleH-stepAngle) * Math.abs(sin(currAngleV)) *rad]); 
				// normales
				var norm = vB2.subtract(vA2).cross(vC2.subtract(vA2)).normalize();
				// texturas
				var tA2 = $V3([(currAngleH-stepAngle)/360.0, 1.0-((currAngleV-stepAngle)/180.0), 0.0]);
				var tB2 = $V3([currAngleH/360.0, 1.0-((currAngleV-stepAngle)/180.0), 0.0]);
				var tC2 = $V3([(currAngleH-stepAngle)/360.0, 1.0-(currAngleV/180.0), 0.0]);
				//indices
				var indexA = this.testIfInIndices(vA2, norm, tA2);
				var indexB = this.testIfInIndices(vB2, norm, tB2);
				var indexC = this.testIfInIndices(vC2, norm, tC2);
				
				this.indexArray.push(indexA,indexB,indexC);
			}
		}		
	}

	var meshObject = new Object;
	meshObject.vertexArray = this.vertexArray;
	meshObject.normalArray = this.normalArray;
	meshObject.textureArray = this.textureArray;
	meshObject.textureUnitArray = this.textureUnitArray;
	meshObject.indexArray = this.indexArray;
	
	if(jsonIn.node != undefined) { 
		var bObject = jsonIn.node.attachMesh(meshObject);
		jsonIn.node.materialUnits[0] = stormEngineC.createMaterial();
		if(jsonIn.color != undefined) {
			jsonIn.node.materialUnits[0].write($V3([jsonIn.color.e[0], jsonIn.color.e[1], jsonIn.color.e[2]]));
		} else {
			jsonIn.node.materialUnits[0].write($V3([Math.random(), Math.random(), Math.random()]));
		}
	} else {
		return this; 
	}
};

/**
* Load a object from url of obj file
* @private 
* @type Void
*/
StormMesh.prototype.loadObj = function(jsonIn) {
	var _node,_objUrl,_textureUniqueUrl;
	if(arguments.length == 1) {
		_node = (jsonIn.node != undefined) ? jsonIn.node : undefined;
		_objUrl = (jsonIn.objUrl != undefined) ? jsonIn.objUrl : undefined;
		_textureUniqueUrl = (jsonIn.textureUniqueUrl != undefined) ? jsonIn.textureUniqueUrl : undefined;
		_name = (jsonIn.name != undefined) ? jsonIn.name : undefined;
		_node.onloadFunction = (jsonIn.onload != undefined && typeof(jsonIn.onload) == 'function') ? jsonIn.onload : undefined;
	} else { // obsolete method
		_node = (arguments[0] != undefined) ? arguments[0] : undefined;
		_objUrl = (arguments[1] != undefined) ? arguments[1] : undefined;
		_textureUniqueUrl = (arguments[2] != undefined) ? arguments[2] : undefined;
		_name = undefined;
		_node.onloadFunction = undefined;
	}
	
	stormEngineC.preloads++;
    
	
    if(_node != undefined && _name != undefined) _node.name = _name;
     
    var objDirectory = '';
    var expl = _objUrl.split("/");
    for(var n = 0, f = expl.length-1; n < f; n++) {
    	objDirectory = objDirectory+expl[n]+'/';
    }
	
	var req = new XMLHttpRequest();
	req.open("GET", _objUrl, true);
	req.responseType = "blob";
	
	req.onload = function() { 
		var filereader = new FileReader();
		filereader.onload = function(event) {
			var text = event.target.result;
			
			stormEngineC.setStatus({id:'node'+_objUrl, 
									str:'Opening obj...'+_objUrl});
			stormEngineC.stormMesh.loadObjFromSourceText({	node: _node,
															sourceText: text,
															objDirectory: objDirectory,
															textureUniqueUrl: _textureUniqueUrl,
															albedo: jsonIn.albedo,
															roughness: jsonIn.roughness	});
															
			stormEngineC.setStatus({id:'node'+_objUrl,
									str:''});
			stormEngineC.preloads--;
			if(_node.onloadFunction != undefined && typeof(_node.onloadFunction) == 'function') _node.onloadFunction();
		};
		filereader.readAsText(req.response);
	};

	stormEngineC.setStatus({id:'node'+_objUrl,
							str:'Loading obj...'+_objUrl,
							req:req}); // only show progress if call later of req.open()
    req.send(null);
};

/**
* Load a object from text-plain on obj format <br>
* (require url of the mtl file)
* @private 
* @type Void
*/
StormMesh.prototype.loadObjFromSourceText = function(jsonIn) {
	var _node,_sourceText,_objDirectory,_textureUniqueUrl;
	if(arguments.length == 1) {
		_node = (jsonIn.node != undefined) ? jsonIn.node : undefined;
		_sourceText = (jsonIn.sourceText != undefined) ? jsonIn.sourceText : undefined;
		_objDirectory = (jsonIn.objDirectory != undefined) ? jsonIn.objDirectory : undefined;
		_textureUniqueUrl = (jsonIn.textureUniqueUrl != undefined) ? jsonIn.textureUniqueUrl : undefined;
	} else { // obsolete method
		_node = (arguments[0] != undefined) ? arguments[0] : undefined;
		_sourceText = (arguments[1] != undefined) ? arguments[1] : undefined;
		_objDirectory = (arguments[2] != undefined) ? arguments[2] : undefined;
		_textureUniqueUrl = (arguments[3] != undefined) ? arguments[3] : undefined;
	}
	
	var lines = _sourceText.split("\r\n");
	if(lines[0].match(/OBJ/gim) == null) {alert('Not OBJ file');	return;}
	
	
	var vertexArrayX = [];var vertexArrayY = [];var vertexArrayZ = [];
	var normalArrayX = [];var normalArrayY = [];var normalArrayZ = [];
	var textureArrayX = [];var textureArrayY = [];var textureArrayZ = [];
	var textureUnitArray = [];
	var currentTextureUnit = 0;
	var indexArray = [];
	var currentIDX = 0;
	var currentIDX_INDEX = 0;
	
	var bufferEnCola = false;
	var currBO = new StormBufferObject();
	_node.buffersObjects.push(currBO);
	currBO.node = _node;
	
	var vertexX = [];var vertexY = [];var vertexZ = [];
	var normalX = [];var normalY = [];var normalZ = [];
	var textureX = [];var textureY = [];var textureZ = [];
	var currentIDX_vertex = 0;var currentIDX_normal = 0;var currentIDX_texture = 0;
	var indexVNT = []; 
	var currentIndex = 0;
	
	
	var groups = {};
	var currentGroup = [-1, 0];
	groups["_unnamed"] = currentGroup;

	var mtlFile = "";
	var currentMtlName = "";
	
	for(var n = 0, f = lines.length; n < f; n++) {
		var line = lines[n].replace(/\t+/gi, " ").replace(/\s+$/gi, "").replace(/\s+/gi, " ");
		if(line[0] == "#") continue;// ignore comments
		
		var array = line.split(" ");
		
		if(array[0] == "mtllib") {
			mtlFile = array[1];
		}
		if(array[0] == "g") {
			currentGroup = [indexArray.length, 0];
			groups[array[1]] = currentGroup;
		}
		if(array[0] == "v") {
			vertexX[currentIDX_vertex] = parseFloat(array[1]); 
			vertexY[currentIDX_vertex] = parseFloat(array[2]);
			vertexZ[currentIDX_vertex] = parseFloat(array[3]);
			currentIDX_vertex++; 
		}
		if(array[0] == "vn") {
			normalX[currentIDX_normal] = parseFloat(array[1]);
			normalY[currentIDX_normal] = parseFloat(array[2]);
			normalZ[currentIDX_normal] = parseFloat(array[3]);
			currentIDX_normal++;
		}
		if(array[0] == "vt") {
			textureX[currentIDX_texture] = parseFloat(array[1]);
			textureY[currentIDX_texture] = parseFloat(array[2]);
			textureZ[currentIDX_texture] = parseFloat(array[3]);
			currentIDX_texture++;
		}
		if(array[0] == "usemtl") {
			_node.materialUnits[currentTextureUnit] = stormEngineC.createMaterial();
			currentMtlName = array[1];
			
			if(_textureUniqueUrl == undefined) {
				if(_objDirectory != undefined) {
					_node.materialUnits[currentTextureUnit].writeFromMTLFile(currentMtlName, _objDirectory+mtlFile, {albedo:jsonIn.albedo, roughness:jsonIn.roughness});
				} else {
					_node.materialUnits[currentTextureUnit].write($V3([Math.random(), Math.random(), Math.random()]));
				}
			} else {
				_node.materialUnits[currentTextureUnit].write(_textureUniqueUrl)
			}
			currentTextureUnit++;
		}
		if(array[0] == "f") {
			if(array.length != 4) {
				obj.ctx.console.log("*** Error: face '"+line+"' not handled");
				continue;
			}

			// recorremos cada vtx/tex/nor de la linea 'f vtxA/texA/norA vtxB/texB/norB vtxC/texC/norC'
			// puede ser tambien de tipo f vtx vtx vtx
			for(var i = 1, fi = 4; i < fi; ++i) { // primero vtxA/texA/norA, luego vtxB/texB/norB y luego vtxC/texC/norC
				bufferEnCola = true;
				var expl = array[i].split("/"); // array[i] = "vtxX/texX/norX"
				if(indexVNT[array[i]] == undefined) {  //si no existe current "vtxX/texX/norX" en array indexVNT se añade nuevo indice				
					var vtx, nor, tex;
					if(expl.length == 1) { // si es de tipo solo vtx
						vtx = parseInt(expl[0]) - 1; // usamos vtx en todos
						nor = vtx;
						tex = vtx;
					} else if(expl.length == 3) { // si es de tipo vtx/tex/nor
						vtx = parseInt(expl[0]) - 1;
						tex = parseInt(expl[1]) - 1;
						nor = parseInt(expl[2]) - 1;
						// se resta 1 por que en el formato obj el primero comienza en 1.
						// en los arrays donde hemos almacenado vertex, normal y texture el primero comienza en 0.
					} else {
						obj.ctx.console.log("*** Error: did not understand face '"+array[i]+"'");
						return null;
					}
					
					textureUnitArray[currentIDX] = (currentTextureUnit-1);
					
					vertexArrayX[currentIDX] = 0.0;
					vertexArrayY[currentIDX] = 0.0;
					vertexArrayZ[currentIDX] = 0.0;
					if(vtx < vertexZ.length) { 
						vertexArrayX[currentIDX] = vertexX[vtx];
						vertexArrayY[currentIDX] = vertexY[vtx];
						vertexArrayZ[currentIDX] = vertexZ[vtx];
					}
					
					textureArrayX[currentIDX] = 0.0;
					textureArrayY[currentIDX] = 0.0;
					textureArrayZ[currentIDX] = 0.0;
					if(tex < textureZ.length) { 
						textureArrayX[currentIDX] = textureX[tex];
						textureArrayY[currentIDX] = textureY[tex];
						textureArrayZ[currentIDX] = textureZ[tex];
					}
					
					normalArrayX[currentIDX] = 0.0;
					normalArrayY[currentIDX] = 0.0;
					normalArrayZ[currentIDX] = 1.0;
					if(nor < normalZ.length) { 
						normalArrayX[currentIDX] = normalX[nor];
						normalArrayY[currentIDX] = normalY[nor];
						normalArrayZ[currentIDX] = normalZ[nor];
					}
					currentIDX++;
					
					indexVNT[array[i]] = currentIndex; // indexVNT[vtxX/texX/norX] = currentIndex; 
					currentIndex++;
				}
				indexArray[currentIDX_INDEX] = indexVNT[array[i]];
				currentIDX_INDEX++;
				
				currentGroup[1]++;
			}
			//if(vertexArrayX.length > 60000) break;       
			if(vertexArrayX.length > 60000) {   
				if(bufferEnCola == true) {
					var mesh = {};
					
					mesh.vertexArray = new Float32Array(vertexArrayX.length*3);
					for(var nb = 0, fnb = vertexArrayX.length; nb < fnb; nb++) {
						mesh.vertexArray[nb*3] = vertexArrayX[nb];
						mesh.vertexArray[(nb*3)+1] = vertexArrayY[nb];
						mesh.vertexArray[(nb*3)+2] = vertexArrayZ[nb];
					}
					mesh.normalArray = new Float32Array(normalArrayX.length*3);
					for(var nb = 0, fnb = normalArrayX.length; nb < fnb; nb++) {
						mesh.normalArray[nb*3] = normalArrayX[nb];
						mesh.normalArray[(nb*3)+1] = normalArrayY[nb];
						mesh.normalArray[(nb*3)+2] = normalArrayZ[nb];
					}
					mesh.textureArray = new Float32Array(textureArrayX.length*3);
					for(var nb = 0, fnb = textureArrayX.length; nb < fnb; nb++) {
						mesh.textureArray[nb*3] = textureArrayX[nb];
						mesh.textureArray[(nb*3)+1] = textureArrayY[nb];
						mesh.textureArray[(nb*3)+2] = textureArrayZ[nb];
					}
					mesh.textureUnitArray = textureUnitArray;
					mesh.indexArray = indexArray;
					
					currBO.attachBuffers(mesh);
					if(_node.useJigLibTrimesh) _node.generateTrimesh(mesh);
					
					// RESET
					var bufferEnCola = false;
					currBO = new StormBufferObject();
					_node.buffersObjects.push(currBO);
					currBO.node = _node; 
					
					vertexArrayX = [];vertexArrayY = [];vertexArrayZ = [];
					normalArrayX = [];normalArrayY = [];normalArrayZ = [];
					textureArrayX = [];textureArrayY = [];textureArrayZ = [];
					textureUnitArray = [];
					//currentTextureUnit = 0;  
					indexArray = [];
					currentIDX = 0;
					currentIDX_INDEX = 0;
					 
					//vertexX = [];vertexY = [];vertexZ = [];
					//normalX = [];normalY = [];normalZ = [];
					//textureX = [];textureY = [];textureZ = [];
					//currentIDX_vertex = 0;currentIDX_normal = 0;currentIDX_texture = 0;    
					indexVNT = [];
					currentIndex = 0;
					
				}
			}
			
		}
	}
	
	if(bufferEnCola == true) {
		var mesh = {};
		
		mesh.vertexArray = new Float32Array(vertexArrayX.length*3);
		for(var n = 0, fn = vertexArrayX.length; n < fn; n++) {
			mesh.vertexArray[n*3] = vertexArrayX[n];
			mesh.vertexArray[(n*3)+1] = vertexArrayY[n];
			mesh.vertexArray[(n*3)+2] = vertexArrayZ[n];
		}
		mesh.normalArray = new Float32Array(normalArrayX.length*3);
		for(var n = 0, fn = normalArrayX.length; n < fn; n++) {
			mesh.normalArray[n*3] = normalArrayX[n];
			mesh.normalArray[(n*3)+1] = normalArrayY[n];
			mesh.normalArray[(n*3)+2] = normalArrayZ[n];
		}
		mesh.textureArray = new Float32Array(textureArrayX.length*3);
		for(var n = 0, fn = textureArrayX.length; n < fn; n++) {
			mesh.textureArray[n*3] = textureArrayX[n];
			mesh.textureArray[(n*3)+1] = textureArrayY[n];
			mesh.textureArray[(n*3)+2] = textureArrayZ[n];
		}
		mesh.textureUnitArray = textureUnitArray;
		mesh.indexArray = indexArray;
		
		currBO.attachBuffers(mesh);
		if(_node.useJigLibTrimesh) _node.generateTrimesh(mesh);
	} else { 
		_node.buffersObjects.pop();
	}     
};



/* ============================================================================================================ */
/*																												*/
/*											COLLADA																*/
/*																												*/
/* ============================================================================================================= */
/**
* Load a object from url of collada file 
* @private 
* @type Void
*/
StormMesh.prototype.loadCollada = function(jsonIn) {
	// Multimaterial con plugin FBX de 3ds max requiere al menos la versión fbx20133
	stormEngineC.preloads++;
    var reqA = new XMLHttpRequest();
     
    var colladaDirectory = ''; 
    var expl = jsonIn.daeUrl.split("/");
    for(var n = 0, f = expl.length-1; n < f; n++) {
    	colladaDirectory = colladaDirectory+expl[n]+'/';
    }
    
    reqA.onreadystatechange = function () {
    	if (reqA.readyState == 4) {
			stormEngineC.setStatus({id:jsonIn.daeUrl,
									str:'Opening dae...'+jsonIn.daeUrl});
			stormEngineC.stormMesh.loadColladaFromSourceText({	'group':jsonIn.group,
																'sourceText':reqA.responseText,
																'daeDirectory':colladaDirectory,
																'textureUniqueUrl':jsonIn.textureUniqueUrl,
																'setCam':jsonIn.setCam});
			setTimeout(function() {
							stormEngineC.setStatus({id:jsonIn.daeUrl,
													str:''});
						},1);
			stormEngineC.preloads--;
			if(jsonIn.onload != undefined && typeof(jsonIn.onload) == 'function') {
				jsonIn.group.onloadFunction = jsonIn.onload;
				jsonIn.group.onloadFunction();
			}
        }
    };
	//reqA.setRequestHeader('Content-Type',  'text/xml');
    reqA.open("GET", jsonIn.daeUrl, true);
	stormEngineC.setStatus({id:jsonIn.daeUrl,
							str:'Loading dae...'+jsonIn.daeUrl,
							req:reqA}); // only show progress if call later of reqA.open()
    reqA.send(null);
};

/**
* Load a object from text-plain on collada format
* @private 
* @type Void
*/
StormMesh.prototype.loadColladaFromSourceText = function(jsonIn) {
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(jsonIn.sourceText, "application/xml");
	
	var asset = xmlDoc.getElementsByTagName('asset');
	var library_images = xmlDoc.getElementsByTagName('library_images');
	var library_materials = xmlDoc.getElementsByTagName('library_materials');
	var library_effects = xmlDoc.getElementsByTagName('library_effects');
	var library_geometries = xmlDoc.getElementsByTagName('library_geometries');
	var library_visual_scenes = xmlDoc.getElementsByTagName('library_visual_scenes');
	var library_animations = xmlDoc.getElementsByTagName('library_animations');
	var library_cameras = xmlDoc.getElementsByTagName('library_cameras');
	var library_lights = xmlDoc.getElementsByTagName('library_lights');
	
	var scene = xmlDoc.getElementsByTagName('scene');
	
	var ATOOL = asset[0].getElementsByTagName('authoring_tool')[0].textContent;
	if(ATOOL.match(/^OpenCOLLADA/gim) == null) {
		alert('Collada file must be exported with OPENCOLLADA (bake matrices)');
		exit;
	}
	
	for(var g = 0, fg = library_visual_scenes[0].getElementsByTagName('node').length; g < fg; g++) {
		var currentTagNode = library_visual_scenes[0].getElementsByTagName('node')[g];
		
		// GET THE MATRIX FOR THIS NODE
		var sn = new StormNode();
		
		if(currentTagNode.getElementsByTagName('node')[0] != undefined) {
			if(currentTagNode.getElementsByTagName('node')[0].getElementsByTagName('matrix')[0] != undefined) {
				var nativeMatrix = currentTagNode.getElementsByTagName('node')[0].getElementsByTagName('matrix')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
				sn.MPOS = $M16(nativeMatrix);
			}
		}
		
		if(currentTagNode.getElementsByTagName('matrix')[0] != undefined) {
			var mat = currentTagNode.getElementsByTagName('matrix')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
			sn.MPOS = $M16(mat).x(sn.MPOS);
		}
		/* TODO OPENCOLLADA WITHOUT BAKE MATRICES
		if(currentTagNode.getElementsByTagName('translate')[0] != undefined) {
			var tra = currentTagNode.getElementsByTagName('translate')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
			
			var m = $M16([1.0, 0.0, 0.0, tra[0],
						  0.0, 1.0, 0.0, tra[1],
						  0.0, 0.0, 1.0, tra[2],
						  0.0, 0.0, 0.0, 1.0]); 
			var matTmp = currentNodeMatrix;
			matTmp = matTmp.x(m);
			
			currentNodeMatrix.e[3] = matTmp.e[3];
			currentNodeMatrix.e[7] = matTmp.e[7];
			currentNodeMatrix.e[11] = matTmp.e[11];
		}
		if(currentTagNode.getElementsByTagName('rotate')[0] != undefined) {
			var rot = currentTagNode.getElementsByTagName('rotate')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
			
			var m16 = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
			var m = m16.rotation(stormEngineC.utils.radToDeg(rot[3]), $V3([rot[0],rot[1],rot[2]]));
			var mm = $M16([
						   m.e[0], m.e[1], m.e[2], 0.0,
						   m.e[4], m.e[5], m.e[6], 0.0,
						   m.e[8], m.e[9], m.e[10], 0.0,
						   0.0, 0.0, 0.0, 1.0
						 ]);
			currentNodeMatrix = currentNodeMatrix.x(mm);
		}
		if(currentTagNode.getElementsByTagName('scale')[0] != undefined) {
			var sca = currentTagNode.getElementsByTagName('scale')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
			//currentNodeMatrix.e[0] = sca[0];
			//currentNodeMatrix.e[5] = sca[1];
			//currentNodeMatrix.e[10] = sca[2];
		}
		*/
		var currentNodeMatrix = sn.MPOS;
			
			
			
		// DETECT TYPE OF CURRENT TAG NODE
		var currentInstanceGeometry = undefined;
		
		var currentInstanceCamera = undefined;
		var currentInstanceCameraName = undefined;
		var currentInstanceCameraTarget = undefined; 
		
		var currentInstanceLight = undefined; 
		var currentInstanceLightColor = undefined; 
		
		if(currentTagNode.attributes.id != undefined) {
			if(currentTagNode.getElementsByTagName('instance_geometry')[0] != undefined) {
				currentInstanceGeometry = currentTagNode.getElementsByTagName('instance_geometry')[0].attributes.url.value.replace(/^#/g,'');
			}
			if(currentTagNode.getElementsByTagName('instance_camera')[0] != undefined) {
				currentInstanceCamera = currentTagNode.getElementsByTagName('instance_camera')[0].attributes.url.value.replace(/^#/g,'');
				currentInstanceCameraName = currentTagNode.attributes.name.value;
				currentInstanceCameraTarget = currentTagNode.attributes.id.value;
				
				if(library_cameras[0] != undefined) {
					for(var lc = 0, flc = library_cameras[0].getElementsByTagName('camera').length; lc < flc; lc++) {
						var currentTagCamera = library_cameras[0].getElementsByTagName('camera')[lc];
						
						if(currentInstanceCamera == currentTagCamera.attributes.id.value) {
							// TODO
						}
					}
				}
			}
			if(currentTagNode.getElementsByTagName('instance_light')[0] != undefined) {
				currentInstanceLight = currentTagNode.getElementsByTagName('instance_light')[0].attributes.url.value.replace(/^#/g,'');
				
				if(library_lights[0] != undefined) {
					for(var ll = 0, fll = library_lights[0].getElementsByTagName('light').length; ll < fll; ll++) {
						var currentTagLight = library_lights[0].getElementsByTagName('light')[ll];
						
						if(currentInstanceLight == currentTagLight.attributes.id.value) {
							var cTLcolor = currentTagLight.getElementsByTagName('color')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
							currentInstanceLightColor = $V3([cTLcolor[0],cTLcolor[1],cTLcolor[2]]);
						}
					}
				}
			}
		}
		// END DETECT TYPE OF CURRENT TAG NODE
		
		// IS GEOMETRY
		if(currentInstanceGeometry != undefined) {
			var nodeC = stormEngineC.createNode();
			jsonIn.group.addNode(nodeC);
			
			for(var m = 0, fm = library_geometries[0].getElementsByTagName('geometry').length; m < fm; m++) {
				var instanceGeometry = library_geometries[0].getElementsByTagName('geometry')[m].attributes.id.value;
				
				if(currentInstanceGeometry == instanceGeometry) {
					
					//nodeC.MPOS = currentNodeMatrix;
					
					// PREPARE TEXTURES FOR THIS TRIANGLES (FOR NEW STORMBUFFEROBJECT)
					var nameTextureKd = '';
					var nameTextureBump = ''; // TODO
					var colorKd = '';
					
					var currentInstanceMaterial = undefined;
					if(currentTagNode.getElementsByTagName('instance_geometry')[0].getElementsByTagName('instance_material')[0] != undefined) currentInstanceMaterial = currentTagNode.getElementsByTagName('instance_geometry')[0].getElementsByTagName('instance_material')[0].attributes.target.value.replace(/^#/g,'');
		
					if(currentInstanceMaterial != undefined) {
						for(var mat = 0, fmat = library_materials[0].getElementsByTagName('material').length; mat < fmat; mat++) {
							var tagMaterial = library_materials[0].getElementsByTagName('material')[mat];
							
							if(tagMaterial.attributes.id.value == currentInstanceMaterial) {
								var instance_effectId = tagMaterial.getElementsByTagName('instance_effect')[0].attributes.url.value.replace(/^#/g,'');
								
								for(var eff = 0, feff = library_effects[0].getElementsByTagName('effect').length; eff < feff; eff++) {
									var currentTagEffect = library_effects[0].getElementsByTagName('effect')[eff];
									
									if(currentTagEffect.attributes.id.value == instance_effectId) {
										
										
										if(currentTagEffect.getElementsByTagName('diffuse')[0].getElementsByTagName('texture')[0] != undefined) {
											var imageId = currentTagEffect.getElementsByTagName('diffuse')[0].getElementsByTagName('texture')[0].attributes.texture.value.replace(/-sampler$/g,'');;

											for(var img = 0, fimg = library_images[0].getElementsByTagName('image').length; img < fimg; img++) {
												var currentTagImage = library_images[0].getElementsByTagName('image')[img];
												if(currentTagImage.attributes.id.value == imageId) {
													var imgUrl = currentTagImage.getElementsByTagName('init_from')[0].textContent.replace(/\\/g,'|').replace(/\//g,'|');
													
													var array = imgUrl.split("|");
													nameTextureKd = array[array.length-1];
													//console.log(nameTextureKd);
												}
											}
										} else {
											colorKd = currentTagEffect.getElementsByTagName('diffuse')[0].getElementsByTagName('color')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
											
										}
										
										
									}
								}
							}
						}
					}
					
						
					// DRAW THIS GEOMETRY
					var currentMesh = library_geometries[0].getElementsByTagName('geometry')[m].getElementsByTagName('mesh')[0];
					//console.log(currentMesh);
					
					
					
					
					var vertex = currentMesh.getElementsByTagName('source')[0].getElementsByTagName('float_array')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' '); 
					var normal = currentMesh.getElementsByTagName('source')[1].getElementsByTagName('float_array')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
					var texture = undefined;
					if(currentMesh.getElementsByTagName('source')[2] != undefined) {
						texture = currentMesh.getElementsByTagName('source')[2].getElementsByTagName('float_array')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
					}
					//console.log(vertex);
					//console.log(normal);
					//console.log(texture);
					
					for(var t = 0, ft = currentMesh.getElementsByTagName('triangles').length; t < ft; t++) {
						// DRAW TRIANGLES
						var mesh = {};
						mesh.vertexArray = [];
						mesh.normalArray = [];
						mesh.textureArray = [];
						mesh.textureUnitArray = [];
						mesh.indexArray = [];
						
						facemap = [];
						index = 0;
						
						var numsInputs = currentMesh.getElementsByTagName('triangles')[t].getElementsByTagName('input').length;
						var currentP = currentMesh.getElementsByTagName('triangles')[t].getElementsByTagName('p')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'');
						var arrayP = currentP.split(' ');
						//console.log(arrayP);
						if(texture != undefined) {
							for(var i = 0, fi = arrayP.length/numsInputs; i < fi; i++) {
								var idx = i*numsInputs;
								vtx = parseInt(arrayP[idx]);
								nor = parseInt(arrayP[idx+1]);
								tex = (arrayP[idx+2] != undefined) ? parseInt(arrayP[idx+2]) : 0.0; 
								
								if(facemap[vtx+'/'+nor+'/'+tex] == undefined) {
									var tmp,mm;
									tmp = $M16([	1.0, 0.0, 0.0, parseFloat(vertex[vtx*3]),
														0.0, 1.0, 0.0, parseFloat(vertex[vtx*3+1]),
														0.0, 0.0, 1.0, parseFloat(vertex[vtx*3+2]),
														0.0, 0.0, 0.0, 1.0]);
									mm = currentNodeMatrix.x(tmp);  
									mesh.vertexArray.push(parseFloat(mm.e[3]));
									mesh.vertexArray.push(parseFloat(mm.e[7]));
									mesh.vertexArray.push(parseFloat(mm.e[11]));
									
									mesh.normalArray.push(parseFloat(normal[nor*3])); 
									mesh.normalArray.push(parseFloat(normal[nor*3+1]));
									mesh.normalArray.push(parseFloat(normal[nor*3+2]));
									
									mesh.textureArray.push((texture != undefined) ? texture[tex*2] : vertex[vtx*3]);
									mesh.textureArray.push((texture != undefined) ? texture[tex*2+1] : vertex[vtx*3+1]);
									mesh.textureArray.push((texture != undefined) ? texture[tex*2+1] : vertex[vtx*3+1]);
									
									mesh.textureUnitArray.push(0.0);
									
									facemap[vtx+'/'+nor+'/'+tex] = index; // facemap[current vtx/tex/nor] = int
									index++;
								}
								
								mesh.indexArray.push(facemap[vtx+'/'+nor+'/'+tex]); // req.indexArray.push(int)
							}
						} else {
							for(var i = 0, fi = arrayP.length/numsInputs; i < fi; i++) {
								var idx = i*numsInputs;
								vtx = parseInt(arrayP[idx]);
								nor = parseInt(arrayP[idx+1]);
								
								if(facemap[vtx+'/'+nor] == undefined) {
									var tmp,mm;
									tmp = $M16([	1.0, 0.0, 0.0, vertex[vtx*3],
														0.0, 1.0, 0.0, vertex[vtx*3+1],
														0.0, 0.0, 1.0, vertex[vtx*3+2],
														0.0, 0.0, 0.0, 1.0]);
									mm = currentNodeMatrix.x(tmp);  
									mesh.vertexArray.push(mm.e[3]);
									mesh.vertexArray.push(mm.e[7]);
									mesh.vertexArray.push(mm.e[11]);
									
									mesh.normalArray.push(normal[nor*3]); 
									mesh.normalArray.push(normal[nor*3+1]);
									mesh.normalArray.push(normal[nor*3+2]);
									
									mesh.textureArray.push(vertex[vtx*3]);
									mesh.textureArray.push(vertex[vtx*3+1]);
									mesh.textureArray.push(vertex[vtx*3+2]);
									
									mesh.textureUnitArray.push(0.0);
									
									facemap[vtx+'/'+nor] = index; // facemap[current vtx/tex/nor] = int
									index++;
								}
								
								mesh.indexArray.push(facemap[vtx+'/'+nor]); // req.indexArray.push(int)
							}
						}
						 
						var bObject = nodeC.attachMesh(mesh);
						
						
						// ATTACH THE TEXTURES FOR THIS TRIANGLES
						if(jsonIn.textureUniqueUrl == undefined) {
							if(jsonIn.daeDirectory != undefined) {
								if(nameTextureKd != '') {
									nodeC.materialUnits[0].write(jsonIn.daeDirectory+nameTextureKd); 
									//if(nameTextureBump != '') nodeC.materialUnits[0].write(jsonIn.daeDirectory+nameTextureBump, 'bump');
								} else {
									nodeC.materialUnits[0].write($V3([colorKd[0], colorKd[1], colorKd[2]]));
								}
							} else {
								nodeC.materialUnits[0].write($V3([Math.random(), Math.random(), Math.random()]));
							}
						} else {
							nodeC.materialUnits[0].write(jsonIn.textureUniqueUrl)
						}
						if(nodeC.useJigLibTrimesh)nodeC.generateTrimesh(mesh);
						
						
					} // END CURRENT TRIANGLES (End of this StormBufferObject)
			
					
					nodeC.setRotationX(stormEngineC.utils.degToRad(-90.0)); 
					
				}
				
				
			}
			
			// Geometry Keyframes
			if(library_animations[0] != undefined) {
				for(var la = 0, fla = library_animations[0].getElementsByTagName('animation').length; la < fla; la++) {
					var currentTagAnimation = library_animations[0].getElementsByTagName('animation')[la];
					
					for(var aChan = 0, faChan = currentTagAnimation.getElementsByTagName('channel').length; aChan < faChan; aChan++) {
						var currentTagChannel = currentTagAnimation.getElementsByTagName('channel')[aChan];
						
						if(currentTagChannel.attributes.target.value.replace(/\/matrix/gi, "") == currentTagNode.attributes.id.value) {
							var cTCattrSource = currentTagChannel.attributes.source.value.replace(/^#/g,'');
							for(var aSampl = 0, faSampl = currentTagAnimation.getElementsByTagName('sampler').length; aSampl < faSampl; aSampl++) {
								var currentTagSampler = currentTagAnimation.getElementsByTagName('sampler')[aSampl];
								
								if(currentTagSampler.attributes.id.value == cTCattrSource) {
									var cTSattrSourceINPUT = currentTagSampler.getElementsByTagName('input')[0].attributes.source.value.replace(/^#/g,'');
									var cTSattrSourceOUTPUT = currentTagSampler.getElementsByTagName('input')[1].attributes.source.value.replace(/^#/g,'');
									var cTSattrSourceINTERPOLATION = currentTagSampler.getElementsByTagName('input')[2].attributes.source.value.replace(/^#/g,'');
									
									for(var aSource = 0, faSource = currentTagAnimation.getElementsByTagName('source').length; aSource < faSource; aSource++) {
										var currentTagSource = currentTagAnimation.getElementsByTagName('source')[aSource];
										
										if(currentTagSource.attributes.id.value == cTSattrSourceOUTPUT) {
											var countVal = parseInt(currentTagSource.getElementsByTagName('accessor')[0].attributes.count.value);
											var strideVal = parseInt(currentTagSource.getElementsByTagName('accessor')[0].attributes.stride.value); //16
											var arrSourceMat = currentTagSource.getElementsByTagName('float_array')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
											for(var fram = 0, ffram = arrSourceMat.length/strideVal; fram < ffram; fram++) {
												var idxFr = fram*strideVal;
												
												var matFrame = $M16([arrSourceMat[idxFr],arrSourceMat[idxFr+1],arrSourceMat[idxFr+2],arrSourceMat[idxFr+3],
																arrSourceMat[idxFr+4],arrSourceMat[idxFr+5],arrSourceMat[idxFr+6],arrSourceMat[idxFr+11],
																arrSourceMat[idxFr+8],arrSourceMat[idxFr+9],arrSourceMat[idxFr+10],arrSourceMat[idxFr+7]*-1.0,
																arrSourceMat[idxFr+12],arrSourceMat[idxFr+13],arrSourceMat[idxFr+14],arrSourceMat[idxFr+15]]);
												
												nodeC.setAnimKey(fram, matFrame); 
												
											}
										}
									}
								}
							}
						}
					}
				}
			}
			// End Geometry Keyframes
		}
		// END IS GEOMETRY
		
		// IS CAMERA
		if(currentInstanceCamera != undefined) {
			var nodeCam = stormEngineC.createCamera($V3([0.0, 10.0, 0.0]) , 1.0);
			
			var matTarget = undefined;
			for(var gB = 0, fgb = library_visual_scenes[0].getElementsByTagName('node').length; gB < fgb; gB++) {
				var currentTagNodeB = library_visual_scenes[0].getElementsByTagName('node')[gB];
				if(currentTagNodeB.attributes.id != undefined) {
				
					if(currentTagNodeB.attributes.id.value == currentInstanceCameraTarget+'.Target') {						
						matTarget = $M16(currentTagNodeB.getElementsByTagName('matrix')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' '));
						
						nodeCam.nodeGoal.setPosition($V3([currentNodeMatrix.e[3], currentNodeMatrix.e[11], currentNodeMatrix.e[7]*-1.0]));
						nodeCam.nodePivot.setPosition($V3([matTarget.e[3], matTarget.e[11], matTarget.e[7]*-1.0]));
						
						nodeCam.controller.camDistance = nodeCam.nodeGoal.getPosition().distance(nodeCam.nodePivot.getPosition());
						
						if(jsonIn.setCam == currentInstanceCameraName) {
							stormEngineC.setWebGLCam(nodeCam);
						}
					}
					
				}
			}
			
			// Camera Keyframes
			if(library_animations[0] != undefined) {
				for(var la = 0, fla = library_animations[0].getElementsByTagName('animation').length; la < fla; la++) {
					var currentTagAnimation = library_animations[0].getElementsByTagName('animation')[la];
					
					for(var aChan = 0, faChan = currentTagAnimation.getElementsByTagName('channel').length; aChan < faChan; aChan++) {
						var currentTagChannel = currentTagAnimation.getElementsByTagName('channel')[aChan];
						
						if(currentTagChannel.attributes.target.value.replace(/\/matrix/gi, "") == currentTagNode.attributes.id.value || currentTagChannel.attributes.target.value.replace(/\/matrix/gi, "") == currentInstanceCameraTarget+'.Target') {
							var cTCattrSource = currentTagChannel.attributes.source.value.replace(/^#/g,'');
							for(var aSampl = 0, faSampl = currentTagAnimation.getElementsByTagName('sampler').length; aSampl < faSampl; aSampl++) {
								var currentTagSampler = currentTagAnimation.getElementsByTagName('sampler')[aSampl];
								
								if(currentTagSampler.attributes.id.value == cTCattrSource) {
									var cTSattrSourceINPUT = currentTagSampler.getElementsByTagName('input')[0].attributes.source.value.replace(/^#/g,'');
									var cTSattrSourceOUTPUT = currentTagSampler.getElementsByTagName('input')[1].attributes.source.value.replace(/^#/g,'');
									var cTSattrSourceINTERPOLATION = currentTagSampler.getElementsByTagName('input')[2].attributes.source.value.replace(/^#/g,'');
									
									for(var aSource = 0, faSource = currentTagAnimation.getElementsByTagName('source').length; aSource < faSource; aSource++) {
										var currentTagSource = currentTagAnimation.getElementsByTagName('source')[aSource];
										
										if(currentTagSource.attributes.id.value == cTSattrSourceOUTPUT) {
											var countVal = parseInt(currentTagSource.getElementsByTagName('accessor')[0].attributes.count.value);
											var strideVal = parseInt(currentTagSource.getElementsByTagName('accessor')[0].attributes.stride.value); //16
											var arrSourceMat = currentTagSource.getElementsByTagName('float_array')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
											for(var fram = 0, ffram = arrSourceMat.length/strideVal; fram < ffram; fram++) {
												var idxFr = fram*strideVal;
												
												var matFrame = $M16([arrSourceMat[idxFr],arrSourceMat[idxFr+1],arrSourceMat[idxFr+2],arrSourceMat[idxFr+3],
																arrSourceMat[idxFr+4],arrSourceMat[idxFr+5],arrSourceMat[idxFr+6],arrSourceMat[idxFr+11],
																arrSourceMat[idxFr+8],arrSourceMat[idxFr+9],arrSourceMat[idxFr+10],arrSourceMat[idxFr+7]*-1.0,
																arrSourceMat[idxFr+12],arrSourceMat[idxFr+13],arrSourceMat[idxFr+14],arrSourceMat[idxFr+15]]);
												
												if(currentTagChannel.attributes.target.value.replace(/\/matrix/gi, "") == currentTagNode.attributes.id.value) {
													nodeCam.setAnimKey(fram, undefined, matFrame);
												} else if(currentTagChannel.attributes.target.value.replace(/\/matrix/gi, "") == currentInstanceCameraTarget+'.Target') {
													nodeCam.setAnimKey(fram, matFrame, undefined); 
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			// End camera Keyframes
			
		}
		// END IS CAMERA
		
		// IS LIGHT
		if(currentInstanceLight != undefined) {
			var nodeLight = stormEngineC.createLight({'type':'spot',
														'position': $V3([currentNodeMatrix.e[3], currentNodeMatrix.e[11], currentNodeMatrix.e[7]*-1.0]),
														'color':currentInstanceLightColor});
														
														
			// Light Keyframes
			if(library_animations[0] != undefined) {
				for(var la = 0, fla = library_animations[0].getElementsByTagName('animation').length; la < fla; la++) {
					var currentTagAnimation = library_animations[0].getElementsByTagName('animation')[la];
					
					for(var aChan = 0, faChan = currentTagAnimation.getElementsByTagName('channel').length; aChan < faChan; aChan++) {
						var currentTagChannel = currentTagAnimation.getElementsByTagName('channel')[aChan];
						
						if(currentTagChannel.attributes.target.value.replace(/\/matrix/gi, "") == currentTagNode.attributes.id.value) {
							var cTCattrSource = currentTagChannel.attributes.source.value.replace(/^#/g,'');
							for(var aSampl = 0, faSampl = currentTagAnimation.getElementsByTagName('sampler').length; aSampl < faSampl; aSampl++) {
								var currentTagSampler = currentTagAnimation.getElementsByTagName('sampler')[aSampl];
								
								if(currentTagSampler.attributes.id.value == cTCattrSource) {
									var cTSattrSourceINPUT = currentTagSampler.getElementsByTagName('input')[0].attributes.source.value.replace(/^#/g,'');
									var cTSattrSourceOUTPUT = currentTagSampler.getElementsByTagName('input')[1].attributes.source.value.replace(/^#/g,'');
									var cTSattrSourceINTERPOLATION = currentTagSampler.getElementsByTagName('input')[2].attributes.source.value.replace(/^#/g,'');
									
									for(var aSource = 0, faSource = currentTagAnimation.getElementsByTagName('source').length; aSource < faSource; aSource++) {
										var currentTagSource = currentTagAnimation.getElementsByTagName('source')[aSource];
										
										if(currentTagSource.attributes.id.value == cTSattrSourceOUTPUT) {
											var countVal = parseInt(currentTagSource.getElementsByTagName('accessor')[0].attributes.count.value);
											var strideVal = parseInt(currentTagSource.getElementsByTagName('accessor')[0].attributes.stride.value); //16
											var arrSourceMat = currentTagSource.getElementsByTagName('float_array')[0].textContent.replace(/\t+/gi, " ").replace(/\s+/gi, " ").replace(/^\s+/g,'').replace(/\s+$/g,'').split(' ');
											for(var fram = 0, ffram = arrSourceMat.length/strideVal; fram < ffram; fram++) {
												var idxFr = fram*strideVal;
												
												var matFrame = $M16([arrSourceMat[idxFr],arrSourceMat[idxFr+1],arrSourceMat[idxFr+2],arrSourceMat[idxFr+3],
																arrSourceMat[idxFr+4],arrSourceMat[idxFr+5],arrSourceMat[idxFr+6],arrSourceMat[idxFr+11],
																arrSourceMat[idxFr+8],arrSourceMat[idxFr+9],arrSourceMat[idxFr+10],arrSourceMat[idxFr+7]*-1.0,
																arrSourceMat[idxFr+12],arrSourceMat[idxFr+13],arrSourceMat[idxFr+14],arrSourceMat[idxFr+15]]);
												
												
												nodeLight.setAnimKey(fram, matFrame.inverse());
												
											}
										}
									}
								}
							}
						}
					}
				}
			}
			// End Light Keyframes
			
		}
		// END IS LIGHT
		
	}
	
};