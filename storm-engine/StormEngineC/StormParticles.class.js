/**
* @class
* @constructor
* @augments StormNode
  
* @property {String} objectType
*/
StormParticles = function() { StormNode.call(this); 
	this.objectType = 'particles';
	
	this.polarity = 1; // positive
	this.arrVertexPoints;
	this.arrayVertexColor;
	this.enDestination = 0;
	this.destinationForce = 1.0;
	this.lifeDistance = 0.0;
	this.pointSize = 2.0;
	
	this.selfshadows = true;
};
StormParticles.prototype = Object.create(StormNode.prototype);

/**
* Delete this particles
* @type Void
*/
StormParticles.prototype.deleteParticles = function() {  
	
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		stormEngineC.polarityPoints[n].removeParticles({node:this});
	}
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		stormEngineC.forceFields[n].removeParticles({node:this});
	}

	var idToRemove = undefined;
	for(var n = 0, f = stormEngineC.particles.length; n < f; n++) {
		if(stormEngineC.particles[n].idNum == this.idNum) idToRemove = n;
	}
	stormEngineC.particles.splice(idToRemove,1);
};

/**
* Generate particles
* @type Void
* @param {Object} jsonIn
* 	@param {Int} jsonIn.amount Number of particles 
*	@param {Array.<StormV3>} [jsonIn.disposal={radius:0.5}] The initial position
* 	@param {Object} [jsonIn.disposal={radius:0.5}] The initial position
* 		@param {Float} jsonIn.disposal.width If type square
* 		@param {Float} jsonIn.disposal.height If type square
* 		@param {Float} jsonIn.disposal.spacing If type square
* 		@param {Float} [jsonIn.disposal.radius=0.5] If type spheric
* 	@param {StormV3} [jsonIn.color=$V3([1.0,1.0,1.0])] Color from StormV3
* 	@param {HTMLImageElement} [jsonIn.color=$V3([1.0,1.0,1.0])] Color from HTMLImageElement
* 	@param {Float} [jsonIn.pointSize=2.0] The point size
* 	@param {Int} [jsonIn.polarity=1] 1=positive 0=negative
* 	@param {String} [jsonIn.direction=undefined] Write "random" for random direction
* 	@param {StormV3} [jsonIn.direction=undefined] Set a vector for the direction
* 	@param {Float} [jsonIn.lifeDistance=0] Life distance from origin. 0=Deactivated
*/
StormParticles.prototype.generateParticles = function(jsonIn) {  
	this.gl = stormEngineC.stormGLContext.gl;
	
	jsonIn.amount = (jsonIn.amount != undefined) ? jsonIn.amount : 16*16; 
	if(jsonIn.pointSize != undefined) this.pointSize = jsonIn.pointSize;
	if(jsonIn.polarity != undefined) this.polarity = jsonIn.polarity;
	if(jsonIn.lifeDistance != undefined) this.lifeDistance = jsonIn.lifeDistance;
	
	cos = function(val) {return Math.cos(stormEngineC.utils.degToRad(val))};
	sin = function(val) {return Math.sin(stormEngineC.utils.degToRad(val))};
	
	this.arrVertexPoints = new Float32Array(jsonIn.amount*3);
	this.particlesLength = jsonIn.amount;
	this.buffer_ColorRGBA = this.gl.createBuffer(); 
	
	this.makeWebCLGL();
	
	var _this = this;
	setTimeout(function() {
			_this.setDisposal(jsonIn.disposal); 
			_this.setDirection(jsonIn.direction);
			_this.setColor(jsonIn.color);
			_this.setPolarity(jsonIn.polarity);
			_this.setDestinationWidthHeight({width: Math.sqrt(_this.particlesLength), height: Math.sqrt(_this.particlesLength)}, false);
		},100);
};
/**
* Set disposal
* @type Void
* @param {Array<StormV3>} disposal For make through a Array
* @param {Object} disposal For make a square or spherical disposal
* 	@param {Float} disposal.width Width
* 	@param {Float} disposal.height Height
* 	@param {Float} disposal.spacing Spacing
* 	@param {Float} [disposal.radius=0.5] Radius for type spherical (Anule width/height)
*/
StormParticles.prototype.setDisposal = function(jsonIn) { 	
	var arra = []; 
	var arrayX = []; 
	var arrayY = []; 
	var arrayZ = []; 
	var h = 0, hP = 0, vP = 0;
	
	for(var n = 0, f = this.particlesLength; n < f; n++) {
		if(jsonIn != undefined && jsonIn.constructor === Array) {
			var v = this.getPosition().add(jsonIn[n]);
			arrayX.push(v.e[0]);
			arrayY.push(v.e[1]);
			arrayZ.push(v.e[2]);
			arra.push(v.e[0],v.e[1],v.e[2],0.0);
		} else if(jsonIn == undefined || jsonIn.radius != undefined) {
			var rad = (jsonIn == undefined) ? 1.0 : jsonIn.radius;
			var currAngleH = Math.random()*360.0;
			var currAngleV = Math.random()*180.0;
			var v = $V3([	cos(currAngleH) * Math.abs(sin(currAngleV)) * rad,  
							cos(currAngleV) * rad * Math.random(),
							sin(currAngleH) * Math.abs(sin(currAngleV)) * rad]);
							
			v = this.getPosition().add(v);
			arrayX.push(v.e[0]);
			arrayY.push(v.e[1]);
			arrayZ.push(v.e[2]);
			arra.push(v.e[0],v.e[1],v.e[2],0.0);
		} else if(jsonIn.width != undefined) {
			var spac = (jsonIn.spacing != undefined) ? jsonIn.spacing : 0.01; 
			var oper = this.MPOS.x($V3([hP,0.0,vP]));
			arrayX.push(oper.e[3]);
			arrayY.push(oper.e[7]);
			arrayZ.push(oper.e[11]);
			arra.push(oper.e[0],oper.e[1],oper.e[2],0.0);
			h++;
			hP+=spac;
			if(h > jsonIn.width-1) {h=0;hP=0;vP+=spac;}
		}
	}
	//console.log(this.buffersObjects);  
	this.buffersObjects = [];
	var bObject = this.attachMeshSeparateXYZ(arrayX,arrayY,arrayZ);
	//var color = (jsonIn.color != undefined) ? jsonIn.color : $V3([1.0,1.0,1.0]);
	//bObject.material.write(color);
	
	this.webCLGL.enqueueWriteBuffer(this.buffer_InitPos, arra);
	this.webCLGL.enqueueWriteBuffer(this.buffer_PosX, arrayX);
	this.webCLGL.enqueueWriteBuffer(this.buffer_PosY, arrayY);
	this.webCLGL.enqueueWriteBuffer(this.buffer_PosZ, arrayZ);
};
/**
* Set direction 
* @type Void
* @param {String|StormV3} [direction=undefined] 'random', StormV3 or undefined(0.0) 
*/
StormParticles.prototype.setDirection = function(direction) { 	
	var arrayDir = []; 
	for(var n = 0, f = this.particlesLength; n < f; n++) {
		var idVertexPoints = n*3;
		if(direction == undefined) {
			arrayDir.push(0.0,0.0,0.0,0.0);
		} else if(direction == 'random') {
			arrayDir.push(1.0-(Math.random()*2.0),1.0-(Math.random()*2.0),1.0-(Math.random()*2.0),0.0);
		} else if(direction instanceof StormV3) {
			arrayDir.push(direction.e[0],direction.e[1],direction.e[2],0.0);
		}
	}
	this.webCLGL.enqueueWriteBuffer(this.buffer_InitDir, arrayDir);
	this.webCLGL.enqueueWriteBuffer(this.buffer_Dir, arrayDir);
};
/**
* Set color
* @type Void
* @param {StormV3|HTMLImageElement} color Vector3 or HTMLImageElement
*/
StormParticles.prototype.setColor = function(color) { 	
	if(color != undefined && color instanceof HTMLImageElement) {
		this.arrayVertexColor = stormEngineC.utils.getUint8ArrayFromHTMLImageElement(color);
	} else if(color != undefined && color instanceof StormV3) {
		this.arrayVertexColor = new Uint8Array([color.e[0]*255, color.e[1]*255, color.e[2]*255, 255]);
	} else {
		this.arrayVertexColor = new Uint8Array([255, 255, 255, 255]);
	}
	
	var arrayColorRGBA = []; 
	var nVertexColors = 0;
	for(var n = 0, f = this.particlesLength; n < f; n++) {
		if(nVertexColors*4 >= this.arrayVertexColor.length) nVertexColors = 0;
		var idVertexColor = nVertexColors*4;
		arrayColorRGBA.push(this.arrayVertexColor[idVertexColor+0],this.arrayVertexColor[idVertexColor+1],this.arrayVertexColor[idVertexColor+2],this.arrayVertexColor[idVertexColor+3]);
		nVertexColors++;
	}	
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer_ColorRGBA);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayColorRGBA), this.gl.STATIC_DRAW);
	//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Uint8Array(arrayColorRGBA));   
};
/**
* Set polarity 
* @type Void
* @param {Int} polarity 1=positive 0=negative  
*/
StormParticles.prototype.setPolarity = function(polarity) { 	
	this.polarity = polarity;
	
	var arrPolaritys = []; 
	for(var n = 0, f = this.particlesLength; n < f; n++) arrPolaritys.push(this.polarity); 
	
	this.webCLGL.enqueueWriteBuffer(this.buffer_ParticlesPolaritys, arrPolaritys);
};
/**
* Set destination plane
* @type Void
* @param {Object} jsonIn
* 	@param {Int} jsonIn.width Width.
* 	@param {Int} jsonIn.height Height.
* 	@param {Float} [jsonIn.spacing=0.01] Spacing.
* 	@param {Float} [jsonIn.force=1.0] Force (from 0.0 to 1.0).
*/
StormParticles.prototype.setDestinationWidthHeight = function(jsonIn, enable) { 	
	this.enDestination = (enable == undefined || enable == true) ? 1 : 0; 
	this.destinationForce = (jsonIn.force != undefined) ? jsonIn.force : this.destinationForce; 
	var len = jsonIn.width*jsonIn.height;
	
	var arrayDest = []; 

	var h = 0, hP = 0, vP = 0;
	var spac = (jsonIn.spacing != undefined) ? jsonIn.spacing : 0.01;
	for(var n = 0, f = len; n < f; n++) {
		var oper = this.MPOS.x($V3([hP,0.0,vP]));
		arrayDest.push(oper.e[3],oper.e[7],oper.e[11], 0.0);
		h++;
		hP+=spac;
		if(h > jsonIn.width-1) {h=0;hP=0;vP+=spac;}
	}
	this.kernelDirX.setKernelArg(8, this.enDestination);
	this.kernelDirX.setKernelArg(9, this.destinationForce);
	this.webCLGL.enqueueWriteBuffer(this.buffer_Destination, arrayDest);
};

/**
* Set destination volume
* @type Void
* @param {Object} jsonIn
* 	@param {StormVoxelizator} jsonIn.voxelizator Voxelizator object.
* 	@param {Float} [jsonIn.force=1.0] Force (from 0.0 to 1.0).
*/
StormParticles.prototype.setDestinationVolume = function(jsonIn, enable) { 	
	this.enDestination = (enable == undefined || enable == true) ? 1 : 0; 
	this.destinationForce = (jsonIn.force != undefined) ? jsonIn.force : this.destinationForce; 
	
	var vo = jsonIn.voxelizator;
	if(vo instanceof StormVoxelizator == false) { alert("You must select a voxelizator object with albedo fillmode enabled."); return false;}
	if(vo.image3D_VoxelsColor == undefined) { alert("You must select a voxelizator object with albedo fillmode enabled."); return false;}
	var data = vo.clglBuff_VoxelsColor.inData;
	var numActCells = 0;
	for(var n = 0, f = data.length/4; n < f; n++) { // num of active cells
		var id = n*4;
		if(data[id+3] > 0) numActCells++;
	}
	var particlesXCell = this.particlesLength/numActCells;
	
	var arrayDestT = []; 
	var arrayColorRGBAT = []; 
	var stackParticles = 0;
	var CCX=0,CCY=0,CCZ=0;
	var CCXMAX=vo.resolution-1, CCYMAX=vo.resolution-1, CCZMAX=vo.resolution-1;
	for(var n = 0, f = data.length/4; n < f; n++) { // num of active cells
		var id = n*4;
		if(data[id+3] > 0) {
			stackParticles += particlesXCell;
			var particlesOk = Math.floor(stackParticles);
			if(particlesOk > 0) {
				stackParticles -= particlesOk;
				var p = $V3([0.0,0.0,0.0]).add($V3([-(vo.size/2.0), -(vo.size/2.0), -(vo.size/2.0)])); // init position  
				p = p.add($V3([vo.cs*CCX, vo.cs*CCY, vo.cs*(128-CCZ)]));   
				for(var nb = 0, fnb = particlesOk; nb < fnb; nb++) { 
					arrayDestT.push(p.e[0]+(vo.cs*Math.random()),p.e[1]+(vo.cs*Math.random()),p.e[2]+(vo.cs*Math.random()), 0.0); 
					arrayColorRGBAT.push(data[id],data[id+1],data[id+2],1.0);
				}
			}			
		}
	
		if(CCX == CCXMAX && CCZ == CCZMAX && CCY == CCYMAX) {
			break;
		} else {
			if(CCX == CCXMAX && CCZ == CCZMAX) {
				CCX=0;CCZ=0;CCY++;
			} else {
				if(CCX == CCXMAX) {
					CCX=0;CCZ++;
				} else {
					CCX++;
				}
			}
		}
	} 
	
	var arrayDest = []; 
	var arrayColorRGBA = []; 
	for(var n = 0, f = this.particlesLength; n < f; n++) {
		var id = n*4;
		arrayDest[id] = (arrayDestT[id] != undefined) ? arrayDestT[id] : 0.0;
		arrayDest[id+1] = (arrayDestT[id+1] != undefined) ? arrayDestT[id+1] : 0.0;
		arrayDest[id+2] = (arrayDestT[id+2] != undefined) ? arrayDestT[id+2] : 0.0;
		arrayDest[id+3] = (arrayDestT[id+3] != undefined) ? arrayDestT[id+3] : 0.0;
		
		arrayColorRGBA[id] = (arrayColorRGBAT[id] != undefined) ? arrayColorRGBAT[id] : 0.0;
		arrayColorRGBA[id+1] = (arrayColorRGBAT[id+1] != undefined) ? arrayColorRGBAT[id+1] : 0.0;
		arrayColorRGBA[id+2] = (arrayColorRGBAT[id+2] != undefined) ? arrayColorRGBAT[id+2] : 0.0;
		arrayColorRGBA[id+3] = (arrayColorRGBAT[id+3] != undefined) ? arrayColorRGBAT[id+3] : 0.0;
	}
	
	this.kernelDirX.setKernelArg(8, this.enDestination);
	this.kernelDirX.setKernelArg(9, this.destinationForce);
	this.webCLGL.enqueueWriteBuffer(this.buffer_Destination, arrayDest);
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer_ColorRGBA);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayColorRGBA), this.gl.STATIC_DRAW);
	//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Uint8Array(arrayColorRGBA));   
};


/**
* Set destination force
* @type Void
* @param {Float} force from 0.0 to 1.0
*/
StormParticles.prototype.setDestinationForce = function(force) { 	
	this.destinationForce = (force != undefined) ? force : this.destinationForce;
	
	this.kernelDirX.setKernelArg(9, this.destinationForce);
};

/**
* Disable destination
* @type Void
*/
StormParticles.prototype.disableDestination = function() { 	
	this.enDestination = 0;
	
	this.kernelDirX.setKernelArg(8, this.enDestination);
};
/**
* Enable destination
* @type Void
*/
StormParticles.prototype.enableDestination = function() { 	
	this.enDestination = 1;
	
	this.kernelDirX.setKernelArg(8, this.enDestination);
};

/**
* Set life distance
* @type Void
* @param {Float} lifeDistance
*/
StormParticles.prototype.setLifeDistance = function(lifeDistance) { 	
	this.lifeDistance = (lifeDistance != undefined) ? lifeDistance : this.lifeDistance;
	
	this.kernelPosX.setKernelArg(5, this.lifeDistance);
	this.kernelPosY.setKernelArg(5, this.lifeDistance);
	this.kernelPosZ.setKernelArg(5, this.lifeDistance);
	this.kernelDirX.setKernelArg(10, this.lifeDistance);
};

/**
* Set the visibility of the particle selfshadows
* @type Void
* @param {Bool} active
*/
StormParticles.prototype.setSelfshadows = function(active) { 	
	this.selfshadows = active;
};

/**
* Set the point size
* @type Void
* @param {Float} point size
*/
StormParticles.prototype.setPointSize = function(pointSize) { 	
	this.pointSize = (pointSize != undefined) ? pointSize : this.pointSize;
};








/**
* @private 
*/
StormParticles.prototype.makeWebCLGL = function() {
	
	// WEBCLGL    
	
	this.webCLGL = new WebCLGL();    
	var offset = stormEngineC.particlesOffset;   
	this.buffer_InitPos = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset);
	this.buffer_InitDir = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset);
	this.buffer_PosX = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT', offset);this.buffer_PosTempX = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT', offset);
	this.buffer_PosY = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT', offset);this.buffer_PosTempY = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT', offset);
	this.buffer_PosZ = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT', offset);this.buffer_PosTempZ = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT', offset); 
	this.buffer_Dir = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset);
	this.buffer_ParticlesPolaritys = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT', offset);
	this.buffer_Destination = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset); 
	
	
	
	
	// POS
	var kernelPos_Source = 'void main(	float4* initPos,'+
										'float* posX,'+
										'float* posY,'+
										'float* posZ,'+
										'float4* dir,'+
										'float lifeDistance) {'+
								'vec2 x = get_global_id();'+	
								'vec3 currentPos = vec3(posX[x],posY[x],posZ[x]);\n'+ 
								'vec4 dir = dir[x];'+
								'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+   
								'vec3 newPos = (currentPos+currentDir);\n'+
								'vec4 initPos = initPos[x];'+
								'if(lifeDistance > 0.0 && distance(vec3(initPos.x,initPos.y,initPos.z),newPos) > lifeDistance)'+
									'newPos = vec3(initPos.x,initPos.y,initPos.z);';
	var kernelPosX_Source = kernelPos_Source+
							'out_float = newPos.x;\n'+
							'}';
	this.kernelPosX = this.webCLGL.createKernel(kernelPosX_Source);
	this.kernelPosX.setKernelArg(0,this.buffer_InitPos);
	this.kernelPosX.setKernelArg(1,this.buffer_PosX);
	this.kernelPosX.setKernelArg(2,this.buffer_PosY);
	this.kernelPosX.setKernelArg(3,this.buffer_PosZ);
	this.kernelPosX.setKernelArg(4,this.buffer_Dir);
	this.kernelPosX.setKernelArg(5,this.lifeDistance);
	
	var kernelPosY_Source = kernelPos_Source+
							'out_float = newPos.y;\n'+
							'}';
	this.kernelPosY = this.webCLGL.createKernel(kernelPosY_Source);
	this.kernelPosY.setKernelArg(0,this.buffer_InitPos);
	this.kernelPosY.setKernelArg(1,this.buffer_PosX);
	this.kernelPosY.setKernelArg(2,this.buffer_PosY);
	this.kernelPosY.setKernelArg(3,this.buffer_PosZ);
	this.kernelPosY.setKernelArg(4,this.buffer_Dir);
	this.kernelPosY.setKernelArg(5,this.lifeDistance);
	
	var kernelPosZ_Source = kernelPos_Source+
							'out_float = newPos.z;\n'+
							'}';
	this.kernelPosZ = this.webCLGL.createKernel(kernelPosZ_Source);
	this.kernelPosZ.setKernelArg(0,this.buffer_InitPos); 
	this.kernelPosZ.setKernelArg(1,this.buffer_PosX); 
	this.kernelPosZ.setKernelArg(2,this.buffer_PosY); 
	this.kernelPosZ.setKernelArg(3,this.buffer_PosZ);   
	this.kernelPosZ.setKernelArg(4,this.buffer_Dir);
	this.kernelPosZ.setKernelArg(5,this.lifeDistance);
	
	 
	// DIR
	var kernelDir_Source = this.generatekernelDir_Source();
	
	var kernelDirX_Source = kernelDir_Source+
							'out_float4 = vec4(newDir,1.0);\n'+
							'}';
	this.kernelDirX = this.webCLGL.createKernel(kernelDirX_Source); 
	
	this.updatekernelDir_Arguments(); 
}; 
/**
* @private 
*/
StormParticles.prototype.generatekernelDir_Source = function() { 
	lines_argumentsPoles = function(idNum) {
		var str = '';
		for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
				if(idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
					str += ',float pole'+n+'X'+
							',float pole'+n+'Y'+
							',float pole'+n+'Z'+
							',float pole'+n+'Polarity'+
							',float pole'+n+'Orbit'+
							',float pole'+n+'Force';
				}
			}
		} 
		return str;
	};
	lines_argumentsForces = function(idNum) {
		var str = '';
		for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
				if(idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
					str += ',float force'+n+'X'+
							',float force'+n+'Y'+
							',float force'+n+'Z';
				}
			}
		} 
		return str;
	};
	
	lines_poles = function(idNum) {
		var str = 'vec3 polePos;float toDir; vec3 cc;float distanceToPole;\n';
		for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
				if(idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
					str += 'polePos = vec3(pole'+n+'X,pole'+n+'Y,pole'+n+'Z);\n'+ 
							'toDir = 1.0;\n'+  
							'if(sign(particlePolarity[x]) == 0.0 && sign(pole'+n+'Polarity) == 1.0) toDir = -1.0;\n'+
							'if(sign(particlePolarity[x]) == 1.0 && sign(pole'+n+'Polarity) == 0.0) toDir = -1.0;\n'+ 
							'distanceToPole = distance(currentPos,polePos);'+
							'cc = normalize(currentPos-polePos)*(inversesqrt(distanceToPole)*1.0)*toDir;\n'+
							'if(pole'+n+'Orbit == 1.0) cc *= sqrt(distanceToPole);'+
							'currentDir = currentDir+(cc*pole'+n+'Force);\n';
				}
			}
		} 
		return str;
	};
	lines_forces = function(idNum) {
		var str = 'vec3 force;\n';
		for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
				if(idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
					str += 'force = vec3(force'+n+'X,force'+n+'Y,force'+n+'Z);\n'+ 
							'currentDir = currentDir+(force*0.0001);\n';      
				}
			}
		} 
		return str;
	};
	var kernelDir_Source =	'void main(float4* initPos'+
										',float4* initDir'+
										',float* posX'+
										',float* posY'+
										',float* posZ'+
										',float4* dir'+
										',float* particlePolarity'+
										',float4* dest'+
										',float enableDestination'+
										',float destinationForce'+
										',float lifeDistance'+
										lines_argumentsPoles(this.idNum)+ 
										lines_argumentsForces(this.idNum)+ 
										') {\n'+
								'vec2 x = get_global_id();\n'+	
								'vec4 dir = dir[x];'+
								'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+ 
								'vec3 currentPos = vec3(posX[x],posY[x],posZ[x]);\n'+ 
								'vec4 dest = dest[x];'+
								'vec3 destinationPos = vec3(dest.x,dest.y,dest.z);\n'+ 
								
								
								/*'int width = '+Math.sqrt(this.particlesLength)+';'+
								'int height = '+Math.sqrt(this.particlesLength)+';'+
								'float workItemWidth = 1.0/float(width);'+
								'float workItemHeight = 1.0/float(height);'+
								'int currentCol = 0;'+
								'int currentRow = 0;'+
								'const int f = '+this.particlesLength+';\n'+
								'vec3 dirOthers = vec3(0.0,0.0,0.0);\n'+ 
								'int h = 0;'+ 
								'for(int i =0; i < 32*32; i++) {'+
									'vec2 xb = vec2(float(currentCol)*workItemWidth, float(currentRow)*workItemHeight);'+
									'vec3 currentDirB = vec3(dirX[xb],dirY[xb],dirZ[xb]);\n'+ 
									'vec3 currentPosB = vec3(posX[xb],posY[xb],posZ[xb]);\n'+ 
									
									'float dist = distance(currentPos,currentPosB);'+
									'if(abs(dist) < 0.1) {'+
										'float ww = (0.1-abs(dist))/0.1;'+
										'dirOthers += (currentDirB*ww);'+    
										'h++;'+
									'}'+
									
									'if(currentCol >= width) {'+
										'currentRow++;'+
										'currentCol = 0;'+
									'} else currentCol++;'+
								'}'+
								'dirOthers = (dirOthers/float(h))*0.1;'+
								'currentDir = currentDir+(dirOthers);'+*/
								
								lines_poles(this.idNum)+
								
								'if(enableDestination == 1.0) {\n'+
									'vec3 dirDestination = normalize(destinationPos-currentPos);\n'+
									'float distan = abs(distance(currentPos,destinationPos));\n'+
									'float dirDestWeight = sqrt(distan);\n'+  
									'currentDir = (currentDir+(dirDestination*dirDestWeight*destinationForce))*dirDestWeight*0.1;\n'+
								'}\n'+
								
								lines_forces(this.idNum)+
								
								'currentDir = currentDir*0.8;'+ // air resistence
								
								'vec3 newPos = (currentPos+currentDir);\n'+
								'vec4 initPos = initPos[x];'+
								'if(lifeDistance > 0.0 && distance(vec3(initPos.x,initPos.y,initPos.z),newPos) > lifeDistance) {'+
									'vec4 initDir = vec4(initDir[x]);'+
									'currentDir = vec3(initDir.x,initDir.y,initDir.z);'+
								'}'+
								'vec3 newDir = currentDir;\n';
	return kernelDir_Source;
};
/**
* @private 
*/
StormParticles.prototype.updatekernelDir_Arguments = function() { 
	var ar = 0;
	this.kernelDirX.setKernelArg(ar,this.buffer_InitPos); ar++; // 0
	this.kernelDirX.setKernelArg(ar,this.buffer_InitDir); ar++; // 1
	this.kernelDirX.setKernelArg(ar,this.buffer_PosX); ar++; // 2
	this.kernelDirX.setKernelArg(ar,this.buffer_PosY); ar++; // 3
	this.kernelDirX.setKernelArg(ar,this.buffer_PosZ); ar++; // 4
	this.kernelDirX.setKernelArg(ar,this.buffer_Dir); ar++; // 5
	this.kernelDirX.setKernelArg(ar,this.buffer_ParticlesPolaritys); ar++; // 6
	this.kernelDirX.setKernelArg(ar,this.buffer_Destination); ar++; // 7
	this.kernelDirX.setKernelArg(ar,this.enDestination); ar++; // 8
	this.kernelDirX.setKernelArg(ar,this.destinationForce); ar++; // 9
	this.kernelDirX.setKernelArg(ar,this.lifeDistance); ar++; // 10
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
			if(this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
				var oper = this.MPOS.x(stormEngineC.polarityPoints[n].getPosition());
				this.kernelDirX.setKernelArg(ar, oper.e[3]); ar++;
				this.kernelDirX.setKernelArg(ar, oper.e[7]); ar++;
				this.kernelDirX.setKernelArg(ar, oper.e[11]); ar++;
				this.kernelDirX.setKernelArg(ar, stormEngineC.polarityPoints[n].polarity); ar++;
				this.kernelDirX.setKernelArg(ar, stormEngineC.polarityPoints[n].orbit); ar++;
				this.kernelDirX.setKernelArg(ar, stormEngineC.polarityPoints[n].force); ar++;
			}
		}
	}	
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
			if(this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
				var oper = stormEngineC.forceFields[n].direction;
				this.kernelDirX.setKernelArg(ar, oper.e[0]); ar++;
				this.kernelDirX.setKernelArg(ar, oper.e[1]); ar++;
				this.kernelDirX.setKernelArg(ar, oper.e[2]); ar++;
			}
		}
	}	
	this.kernelDirX.compile();
};