/**
* @class
* @constructor
*/
StormVoxelizator = function() {
	this.idNum;
	this.name;
	this.objectType = 'voxelizator'; 
	this.CLGL_Voxels; // WebCLGL object
	
	this.clglBuff_VoxelsColor;  // 
	this.clglBuff_VoxelsPositionX;
	this.clglBuff_VoxelsPositionY;
	this.clglBuff_VoxelsPositionZ;
	this.clglBuff_VoxelsNormal;
	
	this.image3D_VoxelsColor; 
	this.image3D_VoxelsPositionX; 
	this.image3D_VoxelsPositionY; 
	this.image3D_VoxelsPositionZ; 
	this.image3D_VoxelsNormal; 
	
	this.rayTraversalInitSTR;
	this.rayTraversalSTR;
	this.size = 2.1; // grid size (one axis)
	this.resolution = 32;// grid resolution (one axis)
	this.cs;// cell size
	this.chs;// cell half size
	this.wh;// 3dtexture resolution (one axis)
	
	this.ongeneratefunction; 
	
	
	// generateFromScene variables
	this.canvas = document.createElement('canvas');
	this.canvas.style.border = "1px solid #FFF";
	this.glVoxelizator;
	this.BOS = []; // Array StormBufferObjects
	this.MATS = []; // Array StormMaterials
	this.arr_VoxelsColor; // 3dtexture
	this.arr_VoxelsPositionX; // 3dtexture
	this.arr_VoxelsPositionY; // 3dtexture
	this.arr_VoxelsPositionZ; // 3dtexture
	this.arr_VoxelsNormal; // 3dtexture
};
/** @private */
StormVoxelizator.prototype.initShader_VoxelizatorMaker = function() {
	this.canvas.width = this.resolution;
	this.canvas.height = this.resolution;
	this.glVoxelizator = stormEngineC.utils.getWebGLContextFromCanvas(this.canvas, {antialias: false});
	
	var highPrecisionSupport = this.glVoxelizator.getShaderPrecisionFormat(this.glVoxelizator.FRAGMENT_SHADER, this.glVoxelizator.HIGH_FLOAT);
	this.precision = (highPrecisionSupport.precision != 0) ? 'precision highp float;\n\nprecision highp int;\n\n' : 'precision lowp float;\n\nprecision lowp int;\n\n';
	
	var mesh = new StormMesh();
	mesh.loadQuad(undefined,1.0,1.0);
	this.vertexBuffer_QUAD = this.glVoxelizator.createBuffer();
	this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, this.vertexBuffer_QUAD);
	this.glVoxelizator.bufferData(this.glVoxelizator.ARRAY_BUFFER, new Float32Array(mesh.vertexArray), this.glVoxelizator.STATIC_DRAW);
	this.textureBuffer_QUAD = this.glVoxelizator.createBuffer();
	this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, this.textureBuffer_QUAD);
	this.glVoxelizator.bufferData(this.glVoxelizator.ARRAY_BUFFER, new Float32Array(mesh.textureArray), this.glVoxelizator.STATIC_DRAW);
	this.indexBuffer_QUAD = this.glVoxelizator.createBuffer();
	this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, this.indexBuffer_QUAD);
	this.glVoxelizator.bufferData(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indexArray), this.glVoxelizator.STATIC_DRAW);
	
	
	var sv = this.precision+
			'attribute vec3 aVertexPosition;\n'+  
			'attribute vec3 aVertexNormal;\n'+
			'attribute vec3 aTextureCoord;\n'+
			'attribute float aTextureUnitCoord;\n'+
			
			'uniform mat4 uPMatrix;\n'+
			'uniform mat4 u_cameraWMatrix;\n'+
			'uniform mat4 u_nodeWMatrix;\n'+
			'uniform vec3 u_nodeVScale;\n'+
			
			'uniform int uCurrentOffset;\n'+
			'uniform float uGridsize;\n'+
			
			'varying vec3 vVertexNormal;\n'+
			'varying vec3 vTextureCoord;\n'+
			'varying float vTextureUnit;\n'+
			
			'void main(void) {\n'+
				'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
				'vec3 vertexPositionFlipX = vp*vec3(1.0,1.0,1.0);'+
				'vec4 vPosition = uPMatrix*u_cameraWMatrix*u_nodeWMatrix*vec4(vertexPositionFlipX,1.0);'+  
				'vec3 verP; float doffset = 0.01*uGridsize*vPosition.z;'+       
				'if(uCurrentOffset == 0) verP = vec3(vertexPositionFlipX)+(vec3(	doffset,	0.0,	doffset));'+  
				'if(uCurrentOffset == 1) verP = vec3(vertexPositionFlipX)+(vec3(	-doffset,	0.0,	-doffset));'+  
				'if(uCurrentOffset == 2) verP = vec3(vertexPositionFlipX)+(vec3(	-doffset,	0.0,	doffset));'+  
				'if(uCurrentOffset == 3) verP = vec3(vertexPositionFlipX)+(vec3(	doffset,	0.0,	-doffset));'+  
				
				'if(uCurrentOffset == 4) verP = vec3(vertexPositionFlipX)+(vec3(	0.0,		0.0,	doffset));'+  
				'if(uCurrentOffset == 5) verP = vec3(vertexPositionFlipX)+(vec3(	0.0,		0.0,	-doffset));'+  
				'if(uCurrentOffset == 6) verP = vec3(vertexPositionFlipX)+(vec3(	doffset,	0.0,	0.0));'+  
				'if(uCurrentOffset == 7) verP = vec3(vertexPositionFlipX)+(vec3(	-doffset,	0.0,	0.0));'+  
				'gl_Position = uPMatrix*u_cameraWMatrix*u_nodeWMatrix*vec4(verP,1.0);\n'+  
				
				'vVertexNormal = aVertexNormal;\n'+
				'vTextureCoord = aTextureCoord;\n'+
				'vTextureUnit = aTextureUnitCoord;\n'+
			'}';
	var sf = this.precision+
			'uniform sampler2D objectTexturesKd['+stormEngineC.stormGLContext.MAX_TEXTURESKD+'];\n\n\n'+
			
			'uniform int uTypeFillMode;\n'+
			'uniform int uFillModePos;\n'+
			'uniform int uCurrentHeight;\n'+
			
			'varying vec3 vVertexNormal;\n'+
			'varying vec3 vTextureCoord;\n'+
			'varying float vTextureUnit;\n'+
			
			stormEngineC.utils.packGLSLFunctionString()+
			
			'void main(void) {\n'+// RGB=COLOR, ALPHA=CELL BIT
				
				'if(uTypeFillMode == 0) {'+ // fill with albedo
					'vec4 textureColor;'+
					'float texUnit = vTextureUnit;'+      
					'if(texUnit < 0.1 ) {';
					for(var n = 0, fn = stormEngineC.stormGLContext.MAX_TEXTURESKD; n < fn; n++) {
					sf += ''+
						'textureColor = texture2D(objectTexturesKd['+n+'], vec2(vTextureCoord.s, vTextureCoord.t));\n';
					if(n < stormEngineC.stormGLContext.MAX_TEXTURESKD-1) sf += '} else if(texUnit < '+(n+1)+'.1) {';
					}
					sf += ''+
					'} else {'+
						'textureColor = texture2D(objectTexturesKd[0], vec2(vTextureCoord.s, vTextureCoord.t));\n'+ 
					'}'+	
					
					'gl_FragColor = vec4(textureColor.rgb, 1.0);\n'+
				'} else if(uTypeFillMode == 1) {'+ // fill with position
					'float gridSize = float('+this.size+');'+
					'int maxLevelCells = '+this.resolution+';'+
					'float cs = gridSize/float(maxLevelCells);\n'+ // cell size
					'float chs = cs/2.0;\n'+
					
					'vec3 p = vec3(0.0,0.0,0.0)+vec3(-(gridSize/2.0), -(gridSize/2.0), -(gridSize/2.0));\n'+ // init position
					'float ccX = gl_FragCoord.x;'+
					'float ccZ = gl_FragCoord.y;'+
					'int ccY = uCurrentHeight;'+
					'p = p+vec3(cs*(float(ccX)), cs*float(ccY), cs*(float(ccZ)));\n'+
					'p = p+vec3(cs, cs, cs);\n'+
					
					'if(uFillModePos == 0) {'+ // posX
						'gl_FragColor = pack((p.x+(gridSize/2.0))/gridSize);\n'+
					'} else if(uFillModePos == 1) {'+ // posY
						'gl_FragColor = pack((p.y+(gridSize/2.0))/gridSize);\n'+
					'} else {'+ // posZ
						'gl_FragColor = pack((p.z+(gridSize/2.0))/gridSize);\n'+
					'}'+
				'} else if(uTypeFillMode == 2) {'+ // fill with normal
					'gl_FragColor = vec4((vVertexNormal.r+1.0)/2.0,(vVertexNormal.g+1.0)/2.0,(vVertexNormal.b+1.0)/2.0, 1.0);\n'+
				'}'+
			'}';
	this.shader_Voxelizator = this.glVoxelizator.createProgram();   
	stormEngineC.stormGLContext.createShader(this.glVoxelizator, "VOXELIZATOR", sv, sf, this.shader_Voxelizator);
	this.pointers_VoxelizatorMaker();
};
/** @private */
StormVoxelizator.prototype.pointers_VoxelizatorMaker = function() {	
	this.u_Voxelizator_PMatrix = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "uPMatrix");
	this.u_Voxelizator_cameraWMatrix = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "u_cameraWMatrix");
	this.u_Voxelizator_nodeWMatrix = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "u_nodeWMatrix");
	this.u_Voxelizator_nodeVScale = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "u_nodeVScale");
	
	this.samplers_Voxelizator_objectTexturesKd = [];
	for(var n = 0; n < stormEngineC.stormGLContext.MAX_TEXTURESKD; n++) {
		this.samplers_Voxelizator_objectTexturesKd[n] = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "objectTexturesKd["+n+"]");
	}
	
	this.u_Voxelizator_gridsize = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "uGridsize");
	this.attr_Voxelizator_currentOffset = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "uCurrentOffset");
	this.attr_Voxelizator_currentHeight = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "uCurrentHeight");
	this.attr_Voxelizator_typeFillMode = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "uTypeFillMode");
	this.attr_Voxelizator_fillModePos = this.glVoxelizator.getUniformLocation(this.shader_Voxelizator, "uFillModePos");
	
	this.attr_Voxelizator_pos = this.glVoxelizator.getAttribLocation(this.shader_Voxelizator, "aVertexPosition");
	this.attr_Voxelizator_nor = this.glVoxelizator.getAttribLocation(this.shader_Voxelizator, "aVertexNormal");
	this.attr_Voxelizator_tex = this.glVoxelizator.getAttribLocation(this.shader_Voxelizator, "aTextureCoord");
	this.attr_Voxelizator_texUnit = this.glVoxelizator.getAttribLocation(this.shader_Voxelizator, "aTextureUnitCoord");
};
/**
* Generate the voxelizator from the current scene.
* @param	{Object} jsonIn
* 	@param {Float} [jsonIn.size=2.1] Grid size.
* 	@param {Int} [jsonIn.resolution=32] Grid resolution.
* 	@param {Array<String>} [jsonIn.fillmode=["albedo"]] Modes of data fill. "albedo"|"position"|"normal"
* 	@param {Function} [jsonIn.ongenerate] On generate event.
*/
StormVoxelizator.prototype.generateFromScene = function(jsonIn) { 
	stormEngineC.setStatus({id:'voxelizator', str:'Performing voxelization...'});
	var _this = this;
	setTimeout(function(){
		_this.generateFromSceneNow(jsonIn);
	},30);
};
/** @private */
StormVoxelizator.prototype.generateFromSceneNow = function(jsonIn) { 	
	this.ongeneratefunction = jsonIn.ongenerate;
	
	this.CLGL_Voxels = new WebCLGL(stormEngineC.stormGLContext.gl);  
	
	this.size = (jsonIn.size != undefined) ? jsonIn.size: 2.1; 
	this.resolution = (jsonIn.resolution != undefined) ? jsonIn.resolution: 32;
	this.cs = this.size/this.resolution;
	this.chs = this.cs/2.0;
	this.wh = Math.ceil(Math.sqrt(this.resolution*this.resolution*this.resolution));
	
	
	
	this.initShader_VoxelizatorMaker();
	
	var nodes = stormEngineC.nodes;
	this.BOS = [];
	this.MATS = [];
	for(var n = 0, f = nodes.length; n < f; n++) {
		if(nodes[n].visibleOnContext == true && nodes[n].objectType == 'node') { 
		
			for(var mu = 0, fmu = nodes[n].materialUnits.length; mu < fmu; mu++) { 
				this.MATS[mu] = new StormMaterial();
				this.glVoxelizator.pixelStorei(this.glVoxelizator.UNPACK_FLIP_Y_WEBGL, false);      	 
				this.glVoxelizator.pixelStorei(this.glVoxelizator.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
				this.MATS[mu].textureObjectKd.textureData = this.glVoxelizator.createTexture();
				this.glVoxelizator.bindTexture(this.glVoxelizator.TEXTURE_2D, this.MATS[mu].textureObjectKd.textureData); 
				var ar = nodes[n].materialUnits[mu].textureObjectKd.inData;
				this.glVoxelizator.texImage2D(this.glVoxelizator.TEXTURE_2D, 0, this.glVoxelizator.RGBA,
												nodes[n].materialUnits[mu].textureObjectKd.W,
												nodes[n].materialUnits[mu].textureObjectKd.H,
												0, this.glVoxelizator.RGBA, this.glVoxelizator.UNSIGNED_BYTE,
												new Uint8Array(ar));
				this.glVoxelizator.texParameteri(this.glVoxelizator.TEXTURE_2D, this.glVoxelizator.TEXTURE_MAG_FILTER, this.glVoxelizator.NEAREST);
				this.glVoxelizator.texParameteri(this.glVoxelizator.TEXTURE_2D, this.glVoxelizator.TEXTURE_MIN_FILTER, this.glVoxelizator.NEAREST);
				this.glVoxelizator.texParameteri(this.glVoxelizator.TEXTURE_2D, this.glVoxelizator.TEXTURE_WRAP_S, this.glVoxelizator.CLAMP_TO_EDGE);
				this.glVoxelizator.texParameteri(this.glVoxelizator.TEXTURE_2D, this.glVoxelizator.TEXTURE_WRAP_T, this.glVoxelizator.CLAMP_TO_EDGE);
			}
				
			for(var B = 0, fB = nodes[n].buffersObjects.length; B < fB; B++) { 
				BO = nodes[n].buffersObjects[B];
				
				var NEWBO = {};
				NEWBO.drawElementsMode = BO.drawElementsMode;
				NEWBO.node = nodes[n];
				
				NEWBO.nodeMeshVertexBuffer = this.glVoxelizator.createBuffer();
				this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, NEWBO.nodeMeshVertexBuffer);
				this.glVoxelizator.bufferData(this.glVoxelizator.ARRAY_BUFFER, BO.nodeMeshVertexArray, this.glVoxelizator.STATIC_DRAW);
				NEWBO.nodeMeshVertexBufferItemSize = BO.nodeMeshVertexBufferItemSize;
				NEWBO.nodeMeshVertexBufferNumItems = BO.nodeMeshVertexBufferNumItems;
				
				if(BO.nodeMeshTextureArray != undefined) {
					NEWBO.nodeMeshTextureBuffer = this.glVoxelizator.createBuffer();
					this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, NEWBO.nodeMeshTextureBuffer);
					this.glVoxelizator.bufferData(this.glVoxelizator.ARRAY_BUFFER, BO.nodeMeshTextureArray, this.glVoxelizator.STATIC_DRAW);
					NEWBO.nodeMeshTextureBufferItemSize = BO.nodeMeshTextureBufferItemSize;
					NEWBO.nodeMeshTextureBufferNumItems = BO.nodeMeshTextureBufferNumItems;
				}
				
				if(BO.nodeMeshTextureUnitArray != undefined) {
					NEWBO.nodeMeshTextureUnitBuffer = this.glVoxelizator.createBuffer();
					this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, NEWBO.nodeMeshTextureUnitBuffer);
					this.glVoxelizator.bufferData(this.glVoxelizator.ARRAY_BUFFER, BO.nodeMeshTextureUnitArray, this.glVoxelizator.STATIC_DRAW);
					NEWBO.nodeMeshTextureUnitBufferItemSize = BO.nodeMeshTextureUnitBufferItemSize;
					NEWBO.nodeMeshTextureUnitBufferNumItems = BO.nodeMeshTextureUnitBufferNumItems;
				}
				
				if(BO.nodeMeshNormalArray != undefined) {
					NEWBO.nodeMeshNormalBuffer = this.glVoxelizator.createBuffer();
					this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, NEWBO.nodeMeshNormalBuffer);
					this.glVoxelizator.bufferData(this.glVoxelizator.ARRAY_BUFFER, BO.nodeMeshNormalArray, this.glVoxelizator.STATIC_DRAW);
					NEWBO.nodeMeshNormalBufferItemSize = BO.nodeMeshNormalBufferItemSize;
					NEWBO.nodeMeshNormalBufferNumItems = BO.nodeMeshNormalBufferNumItems;
				}
				
				if(BO.nodeMeshIndexArray != undefined) {
					NEWBO.nodeMeshIndexBuffer = this.glVoxelizator.createBuffer();
					this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, NEWBO.nodeMeshIndexBuffer);
					this.glVoxelizator.bufferData(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, BO.nodeMeshIndexArray, this.glVoxelizator.STATIC_DRAW);
					NEWBO.nodeMeshIndexBufferItemSize = BO.nodeMeshIndexBufferItemSize;
					NEWBO.nodeMeshIndexBufferNumItems = BO.nodeMeshIndexBufferNumItems;
				}
				this.BOS.push(NEWBO);
			}
			
		}
	}
	
	this.glVoxelizator.clearColor(0.0,0.0,0.0,0.0); 
	//this.glVoxelizator.clearDepth(1.0);
	//this.glVoxelizator.enable(this.glVoxelizator.DEPTH_TEST);
	//this.glVoxelizator.depthFunc(this.glVoxelizator.LEQUAL);  
	this.glVoxelizator.bindFramebuffer(this.glVoxelizator.FRAMEBUFFER, null);
	this.glVoxelizator.useProgram(this.shader_Voxelizator); 	 
	this.glVoxelizator.viewport(0, 0, this.resolution, this.resolution);
	
	var fovy = this.size/2;
	var Mprojection = $M16().setOrthographicProjection(-fovy, fovy, -fovy, fovy, 0.0, this.cs);      
	/*var fovy = 179.1;
	var Mprojection = $M16().setPerspectiveProjection(fovy, this.resolution/this.resolution, 0.000001, this.cs+0.000002);  */ 	
	this.glVoxelizator.uniformMatrix4fv(this.u_Voxelizator_PMatrix, false, Mprojection.transpose().e); 
	
	this.glVoxelizator.uniform1f(this.u_Voxelizator_gridsize, this.size);
	
	
	
	this.arr_VoxelsColor = new Uint8Array(this.wh*this.wh*4); 
	this.arr_VoxelsPositionX = new Uint8Array(this.wh*this.wh*4); 
	this.arr_VoxelsPositionY = new Uint8Array(this.wh*this.wh*4); 
	this.arr_VoxelsPositionZ = new Uint8Array(this.wh*this.wh*4); 
	this.arr_VoxelsNormal = new Uint8Array(this.wh*this.wh*4); 
	
	
	if(jsonIn.fillmode == undefined) {
		this.typeFillMode = "albedo";
		this.renderVoxelHeight(0);  
	} else {
		for(var n = 0; n < jsonIn.fillmode.length; n++) {
			this.typeFillMode = jsonIn.fillmode[n];
			this.renderVoxelHeight(0);  
		}
	}
	if(this.ongeneratefunction != undefined) this.ongeneratefunction();
	stormEngineC.setStatus({id:'voxelizator', str:''});
};
/** @private  */
StormVoxelizator.prototype.renderVoxelHeight = function(currentHeight) { 
	// CAMERA CURRENT HEIGHT POSITION
	var p = $V3([0.0,0.0,0.0]).add($V3([0.0, -(this.size/2.0), 0.0])); // init position  
	p = p.add($V3([0.0, this.cs, 0.0]));  
	p = p.add($V3([0.0, this.cs*(currentHeight), 0.0]));  
	var pc = p.add($V3([0.0,-1.0,0.0]));
	/*var Mpos = $M16().setPosition(p);
	var rot = 0; 
	var MrotX = $M16().setRotationX(stormEngineC.utils.degToRad(-90+rot)); 
	var MrotZ = $M16().setRotationZ(stormEngineC.utils.degToRad(rot));*/ 
	var Mcamera = $M16().makeLookAt(p.e[0], p.e[1], p.e[2],
									pc.e[0], pc.e[1], pc.e[2], 
									0.0,0.0,1.0);	 
	var MrotY = $M16().setRotationY(stormEngineC.utils.degToRad(180));  
	var Mcamera = Mcamera.x(MrotY);
	this.glVoxelizator.uniformMatrix4fv(this.u_Voxelizator_cameraWMatrix, false, Mcamera.transpose().e);   
	
	this.glVoxelizator.uniform1i(this.attr_Voxelizator_currentHeight, currentHeight);
	
	var idx3d = (currentHeight*(this.resolution*this.resolution))*4;  
	var num = idx3d/this.wh;
	var col = stormEngineC.utils.fract(num)*this.wh; 
	var row = Math.floor(num);
	
	var fm;
	if(this.typeFillMode == "albedo") fm = 0;
	if(this.typeFillMode == "position") fm = 1;
	if(this.typeFillMode == "normal") fm = 2;
	this.glVoxelizator.uniform1i(this.attr_Voxelizator_typeFillMode, fm);
	
	// RENDER THE CURRENT HEIGHT & FILL THE 3D TEXTURE AT CORRESPONDING ID IN arrVoxel
	if(this.typeFillMode == "albedo") {
		this.renderVoxelHeightPass();
		var heightImageResult = new Uint8Array(this.resolution*this.resolution*4);
		this.glVoxelizator.readPixels(0, 0, this.resolution, this.resolution, this.glVoxelizator.RGBA, this.glVoxelizator.UNSIGNED_BYTE, heightImageResult);
		this.arr_VoxelsColor.set(heightImageResult, idx3d);
	} else if(this.typeFillMode == "position") {
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_fillModePos, 0); // X
		this.renderVoxelHeightPass();
		var heightImageResult = new Uint8Array(this.resolution*this.resolution*4);
		this.glVoxelizator.readPixels(0, 0, this.resolution, this.resolution, this.glVoxelizator.RGBA, this.glVoxelizator.UNSIGNED_BYTE, heightImageResult);
		this.arr_VoxelsPositionX.set(heightImageResult, idx3d);
		
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_fillModePos, 1); // Y
		this.renderVoxelHeightPass();
		var heightImageResult = new Uint8Array(this.resolution*this.resolution*4);
		this.glVoxelizator.readPixels(0, 0, this.resolution, this.resolution, this.glVoxelizator.RGBA, this.glVoxelizator.UNSIGNED_BYTE, heightImageResult);
		this.arr_VoxelsPositionY.set(heightImageResult, idx3d);
		
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_fillModePos, 2); // Z
		this.renderVoxelHeightPass();
		var heightImageResult = new Uint8Array(this.resolution*this.resolution*4);
		this.glVoxelizator.readPixels(0, 0, this.resolution, this.resolution, this.glVoxelizator.RGBA, this.glVoxelizator.UNSIGNED_BYTE, heightImageResult);
		this.arr_VoxelsPositionZ.set(heightImageResult, idx3d);
	} else if(this.typeFillMode == "normal") {
		this.renderVoxelHeightPass();
		var heightImageResult = new Uint8Array(this.resolution*this.resolution*4);
		this.glVoxelizator.readPixels(0, 0, this.resolution, this.resolution, this.glVoxelizator.RGBA, this.glVoxelizator.UNSIGNED_BYTE, heightImageResult);
		this.arr_VoxelsNormal.set(heightImageResult, idx3d);
	}
	
	
	
	
	
	currentHeight++;
	if(currentHeight < this.resolution) {    
		var _this = this;
		//setTimeout(function() { 
						this.renderVoxelHeight(currentHeight);
					//},100);
	} else {
		if(this.typeFillMode == "albedo") {
			this.setVoxels({'image':this.arr_VoxelsColor, 'wh':this.wh});
		} else if(this.typeFillMode == "position") {
			this.typeFillMode = "positionX";
			this.setVoxels({'image':this.arr_VoxelsPositionX, 'posChannel':0, 'wh':this.wh});
			this.typeFillMode = "positionY";
			this.setVoxels({'image':this.arr_VoxelsPositionY, 'posChannel':1, 'wh':this.wh});
			this.typeFillMode = "positionZ";
			this.setVoxels({'image':this.arr_VoxelsPositionZ, 'posChannel':2, 'wh':this.wh});
		} else if(this.typeFillMode == "normal") {
			this.setVoxels({'image':this.arr_VoxelsNormal, 'wh':this.wh});
		}
	}
};
/** @private */
StormVoxelizator.prototype.renderVoxelHeightPass = function() { 
	this.glVoxelizator.clear(this.glVoxelizator.COLOR_BUFFER_BIT | this.glVoxelizator.DEPTH_BUFFER_BIT);   
	
	for(var B = 0, fB = this.BOS.length; B < fB; B++) { 
		BO = this.BOS[B];
		this.glVoxelizator.uniformMatrix4fv(this.u_Voxelizator_nodeWMatrix, false, BO.node.MPOS.x(BO.node.MROTXYZ).transpose().e);
		this.glVoxelizator.uniform3f(this.u_Voxelizator_nodeVScale, BO.node.VSCALE.e[0], BO.node.VSCALE.e[1], BO.node.VSCALE.e[2]);   
		
		var next = 0; 
		for(var n = 0; (n < this.MATS.length); n++) {
			eval("this.glVoxelizator.activeTexture(this.glVoxelizator.TEXTURE"+(next)+");")
			this.glVoxelizator.bindTexture(this.glVoxelizator.TEXTURE_2D, this.MATS[n].textureObjectKd.textureData);    
			this.glVoxelizator.uniform1i(this.samplers_Voxelizator_objectTexturesKd[n], next);
			next++;
		}
	
		this.glVoxelizator.enableVertexAttribArray(this.attr_Voxelizator_pos);
		this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, BO.nodeMeshVertexBuffer);
		this.glVoxelizator.vertexAttribPointer(this.attr_Voxelizator_pos, 3, this.glVoxelizator.FLOAT, false, 0, 0);
		
		this.glVoxelizator.enableVertexAttribArray(this.attr_Voxelizator_nor);
		this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, BO.nodeMeshNormalBuffer);
		this.glVoxelizator.vertexAttribPointer(this.attr_Voxelizator_nor, 3, this.glVoxelizator.FLOAT, false, 0, 0);
		
		this.glVoxelizator.enableVertexAttribArray(this.attr_Voxelizator_tex);
		this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, BO.nodeMeshTextureBuffer);
		this.glVoxelizator.vertexAttribPointer(this.attr_Voxelizator_tex, 3, this.glVoxelizator.FLOAT, false, 0, 0);
		
		this.glVoxelizator.enableVertexAttribArray(this.attr_Voxelizator_texUnit);
		this.glVoxelizator.bindBuffer(this.glVoxelizator.ARRAY_BUFFER, BO.nodeMeshTextureUnitBuffer);
		this.glVoxelizator.vertexAttribPointer(this.attr_Voxelizator_texUnit, 1, this.glVoxelizator.FLOAT, false, 0, 0);
		
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_currentOffset, 0);
		if(BO.nodeMeshIndexBuffer != undefined) {
			this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, BO.nodeMeshIndexBuffer);
			this.glVoxelizator.drawElements(BO.drawElementsMode, BO.nodeMeshIndexBufferNumItems, this.glVoxelizator.UNSIGNED_SHORT, 0);
		} else {
			this.glVoxelizator.drawArrays(BO.drawElementsMode, 0, BO.nodeMeshVertexBufferNumItems); 
		}  	
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_currentOffset, 1);
		if(BO.nodeMeshIndexBuffer != undefined) {
			this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, BO.nodeMeshIndexBuffer);
			this.glVoxelizator.drawElements(BO.drawElementsMode, BO.nodeMeshIndexBufferNumItems, this.glVoxelizator.UNSIGNED_SHORT, 0);
		} else {
			this.glVoxelizator.drawArrays(BO.drawElementsMode, 0, BO.nodeMeshVertexBufferNumItems); 
		}  	
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_currentOffset, 2);
		if(BO.nodeMeshIndexBuffer != undefined) {
			this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, BO.nodeMeshIndexBuffer);
			this.glVoxelizator.drawElements(BO.drawElementsMode, BO.nodeMeshIndexBufferNumItems, this.glVoxelizator.UNSIGNED_SHORT, 0);
		} else {
			this.glVoxelizator.drawArrays(BO.drawElementsMode, 0, BO.nodeMeshVertexBufferNumItems); 
		}  	
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_currentOffset, 3);
		if(BO.nodeMeshIndexBuffer != undefined) {
			this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, BO.nodeMeshIndexBuffer);
			this.glVoxelizator.drawElements(BO.drawElementsMode, BO.nodeMeshIndexBufferNumItems, this.glVoxelizator.UNSIGNED_SHORT, 0);
		} else {
			this.glVoxelizator.drawArrays(BO.drawElementsMode, 0, BO.nodeMeshVertexBufferNumItems); 
		}  	 
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_currentOffset, 4);
		if(BO.nodeMeshIndexBuffer != undefined) {
			this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, BO.nodeMeshIndexBuffer);
			this.glVoxelizator.drawElements(BO.drawElementsMode, BO.nodeMeshIndexBufferNumItems, this.glVoxelizator.UNSIGNED_SHORT, 0);
		} else {
			this.glVoxelizator.drawArrays(BO.drawElementsMode, 0, BO.nodeMeshVertexBufferNumItems); 
		}  	
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_currentOffset, 5);
		if(BO.nodeMeshIndexBuffer != undefined) {
			this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, BO.nodeMeshIndexBuffer);
			this.glVoxelizator.drawElements(BO.drawElementsMode, BO.nodeMeshIndexBufferNumItems, this.glVoxelizator.UNSIGNED_SHORT, 0);
		} else {
			this.glVoxelizator.drawArrays(BO.drawElementsMode, 0, BO.nodeMeshVertexBufferNumItems); 
		}  	
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_currentOffset, 6);
		if(BO.nodeMeshIndexBuffer != undefined) {
			this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, BO.nodeMeshIndexBuffer);
			this.glVoxelizator.drawElements(BO.drawElementsMode, BO.nodeMeshIndexBufferNumItems, this.glVoxelizator.UNSIGNED_SHORT, 0);
		} else {
			this.glVoxelizator.drawArrays(BO.drawElementsMode, 0, BO.nodeMeshVertexBufferNumItems); 
		}  	
		this.glVoxelizator.uniform1i(this.attr_Voxelizator_currentOffset, 7);
		if(BO.nodeMeshIndexBuffer != undefined) {
			this.glVoxelizator.bindBuffer(this.glVoxelizator.ELEMENT_ARRAY_BUFFER, BO.nodeMeshIndexBuffer);
			this.glVoxelizator.drawElements(BO.drawElementsMode, BO.nodeMeshIndexBufferNumItems, this.glVoxelizator.UNSIGNED_SHORT, 0);
		} else {
			this.glVoxelizator.drawArrays(BO.drawElementsMode, 0, BO.nodeMeshVertexBufferNumItems); 
		}  	
	}
};  
/**
* get3DImageElement
* 	@param {String} [fillmode="albedo"] Mode of data fill to get. "albedo"|"positionX"|"positionY"|"positionZ"|"normal"
* @returns {HTMLImageElement}
*/
StormVoxelizator.prototype.get3DImageElement = function(fillmode) { 
	if(fillmode == undefined || fillmode == "albedo") {
		if(this.image3D_VoxelsColor != undefined)
			return this.image3D_VoxelsColor; 
		else return false;
	} else if(fillmode == "positionX") {
		if(this.image3D_VoxelsPositionX != undefined)
			return this.image3D_VoxelsPositionX; 
		else return false;
	} else if(fillmode == "positionY") {
		if(this.image3D_VoxelsPositionY != undefined)
			return this.image3D_VoxelsPositionY; 
		else return false;
	} else if(fillmode == "positionZ") {
		if(this.image3D_VoxelsPositionZ != undefined)
			return this.image3D_VoxelsPositionZ; 
		else return false;
	} else if(fillmode == "normal") {
		if(this.image3D_VoxelsNormal != undefined)
			return this.image3D_VoxelsNormal; 
		else return false;
	}
	
};

  

/**
* Generate the voxelizator from 3DImageElement
* @returns {StormVoxelizator}
* @param	{Object} jsonIn
* 	@param {Float} jsonIn.size Grid size.
* 	@param {Int} jsonIn.resolution Grid resolution. (No 3Dtexture resolution)
* 	@param {Array<String>} [jsonIn.fillmode=["albedo"]] Modes of data fill. "albedo"|"positionX"|"positionY"|"positionZ"|"normal"
* 	@param {Array<String|HTMLImageElement>} jsonIn.image 3Dtexture urls or HTMLImageElements array.
* 	@param {Function} [jsonIn.ongenerate] On generate event.
*/
StormVoxelizator.prototype.generateFrom3DImageElement = function(jsonIn) {  
	this.ongeneratefunction = jsonIn.ongenerate;
	
	this.CLGL_Voxels = new WebCLGL(stormEngineC.stormGLContext.gl);  
	
	this.size = (jsonIn.size != undefined) ? jsonIn.size: 2.1; 
	this.resolution = jsonIn.resolution;  
	this.cs = this.size/this.resolution;
	this.chs = this.cs/2.0;
	this.wh = Math.ceil(Math.sqrt(this.resolution*this.resolution*this.resolution));
	
	
	if(jsonIn.fillmode == undefined) {
		this.typeFillMode = "albedo";
		this.setVoxels({'image':jsonIn.image[0], 'wh':this.wh});
	} else {
		for(var n = 0; n < jsonIn.fillmode.length; n++) {
			this.typeFillMode = jsonIn.fillmode[n];
			this.setVoxels({'image':jsonIn.image[n], 'wh':this.wh});
		}
	}
	if(this.ongeneratefunction != undefined) this.ongeneratefunction();
	return this;
};









/** @private */
StormVoxelizator.prototype.setVoxels = function(jsonIn) { 
	if(jsonIn.image instanceof Uint8Array || jsonIn.image instanceof HTMLImageElement) {
		var buffer = this.CLGL_Voxels.createBuffer(jsonIn.wh*jsonIn.wh, 'FLOAT4', this.size/1.9);
		this.CLGL_Voxels.enqueueWriteBuffer(buffer, jsonIn.image);
		
		if(this.typeFillMode == "albedo") {
			this.clglBuff_VoxelsColor = buffer; 
			var canvas = stormEngineC.utils.getCanvasFromUint8Array(jsonIn.image,jsonIn.wh,jsonIn.wh);
			this.image3D_VoxelsColor = stormEngineC.utils.getImageFromCanvas(canvas);
		} else if(this.typeFillMode == "positionX") {
			this.clglBuff_VoxelsPositionX = buffer; 
			var canvas = stormEngineC.utils.getCanvasFromUint8Array(jsonIn.image,jsonIn.wh,jsonIn.wh);
			this.image3D_VoxelsPositionX = stormEngineC.utils.getImageFromCanvas(canvas);
		} else if(this.typeFillMode == "positionY") {
			this.clglBuff_VoxelsPositionY = buffer; 
			var canvas = stormEngineC.utils.getCanvasFromUint8Array(jsonIn.image,jsonIn.wh,jsonIn.wh);
			this.image3D_VoxelsPositionY = stormEngineC.utils.getImageFromCanvas(canvas);
		} else if(this.typeFillMode == "positionZ") {
			this.clglBuff_VoxelsPositionZ = buffer; 
			var canvas = stormEngineC.utils.getCanvasFromUint8Array(jsonIn.image,jsonIn.wh,jsonIn.wh);
			this.image3D_VoxelsPositionZ = stormEngineC.utils.getImageFromCanvas(canvas);
		} else if(this.typeFillMode == "normal") {
			this.clglBuff_VoxelsNormal = buffer; 
			var canvas = stormEngineC.utils.getCanvasFromUint8Array(jsonIn.image,jsonIn.wh,jsonIn.wh);
			this.image3D_VoxelsNormal = stormEngineC.utils.getImageFromCanvas(canvas);
		}
	} else { 
		var imageElement = new Image();
		var _this = this;
		imageElement.onload = function() {
			var buffer = _this.CLGL_Voxels.createBuffer(this.width*this.height, 'FLOAT4', _this.size/1.9);      
			_this.CLGL_Voxels.enqueueWriteBuffer(buffer, this);  
			
			if(_this.typeFillMode == "albedo") {
				_this.clglBuff_VoxelsColor = buffer; 
				_this.image3D_VoxelsColor = this;
			} else if(_this.typeFillMode == "positionX") {
				_this.clglBuff_VoxelsPositionX = buffer; 
				_this.image3D_VoxelsPositionX = this;
			} else if(_this.typeFillMode == "positionY") {
				_this.clglBuff_VoxelsPositionY = buffer; 
				_this.image3D_VoxelsPositionY = this;
			} else if(_this.typeFillMode == "positionZ") {
				_this.clglBuff_VoxelsPositionZ = buffer; 
				_this.image3D_VoxelsPositionZ = this;
			} else if(_this.typeFillMode == "normal"){
				_this.clglBuff_VoxelsNormal = buffer;
				_this.image3D_VoxelsNormal = this;
			}
		};
		imageElement.src = jsonIn.image;
	}
};






 /** @private  */
StormVoxelizator.prototype.worldToVoxel = function(world) {
	var gl = $V3([-(this.size/2.0), -(this.size/2.0), -(this.size/2.0)]);
	var _r = $V3([this.size, this.size, this.size]);
	var _rRes = $V3([this.resolution, this.resolution, this.resolution]);
	var _len = $V3([_r.e[0]/_rRes.e[0], _r.e[1]/_rRes.e[1], _r.e[2]/_rRes.e[2]]);
	
	var ijk = (world.subtract(gl));
	ijk = $V3([ijk.e[0]/_len.e[0], ijk.e[1]/_len.e[1], ijk.e[2]/_len.e[2]]);
	ijk = $V3([Math.floor(ijk.e[0]), Math.floor(ijk.e[1]), Math.floor(ijk.e[2])]); 
	return ijk;
};
/** @private  */
StormVoxelizator.prototype.rayTraversalInitSTR = function() {  
	return ''+
	'const float gridSize = float('+this.size+');\n'+ // grid size  	 
	'float wh = ceil(sqrt(float('+this.resolution+')*float('+this.resolution+')*float('+this.resolution+')));\n'+  	
	'const float cs = gridSize/float('+this.resolution+');\n'+ // cell size 
	'const float chs = cs/2.0;\n'+ // cell size 
	'float texelSize = 1.0/(wh-1.0);\n'+  // 1.0/(wh-1.0)??
	
	// Fast Voxel Traversal Algorithm for Ray Tracing. John Amanatides & Andrew Woo.
	// http://www.cse.chalmers.se/edu/course/TDA361/grid.pdf
	// More info:
	// http://www.researchgate.net/publication/228770849_Ray_tracing_on_GPU/file/79e415105577b914fd.pdf
	// http://www.clockworkcoders.com/oglsl/rt/gpurt3.htm
	// http://www.gamerendering.com/2009/07/20/grid-traversal/
	'const vec3 gl = vec3(-(gridSize/2.0), -(gridSize/2.0), -(gridSize/2.0));\n'+    
	'const vec3 _r = vec3(gridSize, gridSize, gridSize);\n'+
	'const vec3 _rRes = vec3(float('+this.resolution+'), float('+this.resolution+'), float('+this.resolution+'));\n'+
	'const vec3 _len = _r/_rRes;\n'+  
	'vec3 worldToVoxel(vec3 world) {\n'+
		'vec3 ijk = (world - gl) / _len;\n'+ // (1.0-(-1.0)) / (2/64) = 64 
		'ijk = vec3(floor(ijk.x), floor(ijk.y), floor(ijk.z));\n'+
		'return ijk;\n'+
	'}\n'+
	'float voxelToWorldX(float x) {return x * _len.x + gl.x;}\n'+ // 64*(2/64)+(-1.0) = 1.0
	'float voxelToWorldY(float y) {return y * _len.y + gl.y;}\n'+
	'float voxelToWorldZ(float z) {return z * _len.z + gl.z;}\n';
};
/** @private  */
StormVoxelizator.prototype.rayTraversalSTR = function(getVoxelFunctionGLSLStr) {  
	return ''+
	'vec4 rayTraversal(vec3 RayOrigin, vec3 RayDir) {\n'+
		'vec3 voxel = worldToVoxel(RayOrigin);'+   
		'vec3 _dir = normalize(RayDir);'+   
		'vec3 tMax;'+  
		'if(RayDir.x < 0.0) tMax.x = (voxelToWorldX(voxel.x)-RayOrigin.x)/RayDir.x;'+ 	      
		'else tMax.x = (voxelToWorldX((voxel.x+1.0))-RayOrigin.x)/RayDir.x;'+
		'if(RayDir.y < 0.0) tMax.y = (voxelToWorldY(voxel.y)-RayOrigin.y)/RayDir.y;'+
		'else tMax.y = (voxelToWorldY((voxel.y+1.0))-RayOrigin.y)/RayDir.y;'+
		'if(RayDir.z < 0.0) tMax.z = (voxelToWorldZ(voxel.z)-RayOrigin.z)/RayDir.z;'+
		'else tMax.z = (voxelToWorldZ((voxel.z+1.0))-RayOrigin.z)/RayDir.z;'+
		 
		'float tDeltaX = _r.x/abs(RayDir.x);'+// hasta qué punto se debe avanzar en la dirección del rayo antes de que nos encontramos con un nuevo voxel en la dirección x
		'float tDeltaY = _r.y/abs(RayDir.y);'+
		'float tDeltaZ = _r.z/abs(RayDir.z);'+   

		'float stepX = 1.0; float stepY = 1.0; float stepZ = 1.0;\n'+
		'float outX = _r.x; float outY = _r.y; float outZ = _r.z;\n'+
		'if(RayDir.x < 0.0) {stepX = -1.0; outX = -1.0;}'+
		'if(RayDir.y < 0.0) {stepY = -1.0; outY = -1.0;}'+
		'if(RayDir.z < 0.0) {stepZ = -1.0; outZ = -1.0;}'+ 
			
		'vec4 color = vec4(0.0,0.0,0.0,0.0);\n'+
		'vec4 gv = vec4(0.0,0.0,0.0,0.0);\n'+
		'bool c1; bool c2; bool c3; bool isOut;'+
		'for(int c = 0; c < '+(this.resolution*2)+'; c++) {\n'+      
			'c1 = bool(tMax.x < tMax.y);'+
			'c2 = bool(tMax.x < tMax.z);'+
			'c3 = bool(tMax.y < tMax.z);'+
			'isOut = false;'+
			'if (c1 && c2) {'+
				'voxel.x += stepX;'+
				'if(voxel.x==outX) isOut=true;'+
				'tMax.x += tDeltaX;'+
			'} else if(( (c1 && !c2) || (!c1 && !c3) )) {'+
				'voxel.z += stepZ;'+
				'if(voxel.z==outZ) isOut=true;'+
				'tMax.z += tDeltaZ;'+
			'} else if(!c1 && c3) {'+
				'voxel.y += stepY;'+
				'if(voxel.y==outY) isOut=true;'+
				'tMax.y += tDeltaY;'+
			'}'+       
			'if(isOut == true) break;\n'+  
			'else {'+
				'if((voxel.x >= 0.0 && voxel.x <= _rRes.x && voxel.y >= 0.0 && voxel.y <= _rRes.y && voxel.z >= 0.0 && voxel.z <= _rRes.z)) {;\n'+  
					getVoxelFunctionGLSLStr+ 
				'}'+ 
			'}'+
		'}'+
		'return color;'+
	'}\n';
};