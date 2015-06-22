/*----------------------------------------------------------------------------------------
     									GI VOXEL TRAVERSAL
----------------------------------------------------------------------------------------*/ 
/** @private  */
StormGLContext.prototype.initShader_GIv2 = function() {
	_this = stormEngineC.stormGLContext; 
	
	var sourceVertex = 	_this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aVertexNormal;\n'+
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'varying vec4 vposition;\n'+
		'varying vec4 vnormal;\n'+
		'varying vec4 vposScreen;\n'+
		
		'const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			'vposition = u_nodeWMatrix * vec4(vp*vec3(1.0,1.0,1.0), 1.0);\n'+
			'vnormal = vec4(aVertexNormal*vec3(1.0,1.0,1.0), 1.0);\n'+
			'vec4 pos = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * vec4(vp, 1.0);'+
			'vposScreen = ScaleMatrix * pos;\n'+
			'gl_Position = pos;\n'+
		'}';
	var sourceFragment = _this.precision+
		'uniform float randX1;\n'+
		'uniform float randY1;\n'+
		'uniform float uTotalSamples;\n'+
		'uniform int uTypePass;\n'+
		'uniform int uMaxBounds;\n'+
		
		'uniform sampler2D sampler_voxelPosX;\n\n\n'+
		'uniform sampler2D sampler_voxelPosY;\n\n\n'+
		'uniform sampler2D sampler_voxelPosZ;\n\n\n'+
		'uniform sampler2D sampler_voxelNormal;\n\n\n'+
		'uniform sampler2D sampler_screenPos;\n\n\n'+
		'uniform sampler2D sampler_screenNormal;\n\n\n'+
		'uniform sampler2D sampler_finalShadow;\n\n\n'+
		
		'varying vec4 vposition;\n'+
		'varying vec4 vnormal;\n'+
		'varying vec4 vposScreen;\n'+
		
		'vec3 getVector(vec3 vecNormal, float Ns, vec2 vecNoise) {\n'+
			'float angleLat = acos(vecNormal.z);\n'+
			'float angleAzim = atan(vecNormal.y,vecNormal.x);\n'+
					
			'float desvX = (vecNoise.x*2.0)-1.0;\n'+
			'float desvY = (vecNoise.y*2.0)-1.0;\n'+
			'angleLat += (Ns*desvX)*1.6;\n'+
			'angleAzim += (Ns*desvY)*1.6;\n'+

			'float x = sin(angleLat)*cos(angleAzim);\n'+
			'float y = sin(angleLat)*sin(angleAzim);\n'+
			'float z = cos(angleLat);\n'+
			
			'return vec3(x,y,z);\n'+ 
		'}\n'+		
		
		stormEngineC.utils.unpackGLSLFunctionString()+
		 
		this.stormVoxelizatorObject.rayTraversalInitSTR()+
		'vec4 getVoxel_Pos(vec3 voxel, vec3 RayOrigin) {\n'+
			'vec4 rgba = vec4(0.0,0.0,0.0,0.0);\n'+
			
			'int tex3dId = (int(voxel.y)*('+this.stormVoxelizatorObject.resolution+'*'+this.stormVoxelizatorObject.resolution+'))+(int(voxel.z)*('+this.stormVoxelizatorObject.resolution+'))+int(voxel.x);\n'+ 	   
			'float num = float(tex3dId)/wh;\n'+
			'float col = fract(num)*wh;\n'+ 	 
			'float row = floor(num);\n'+ 
			'vec2 texVec = vec2(col*texelSize, row*texelSize);\n'+
			'vec4 texture = texture2D(sampler_voxelNormal,vec2(texVec.x, texVec.y));\n'+
			'if(texture.a/255.0 > 0.5) {\n'+ // existen triángulos dentro? 
				'float texVoxelPosX = unpack(texture2D(sampler_voxelPosX,  vec2(texVec.x,texVec.y))/255.0);\n'+ 
				'float texVoxelPosY = unpack(texture2D(sampler_voxelPosY,  vec2(texVec.x,texVec.y))/255.0);\n'+ 
				'float texVoxelPosZ = unpack(texture2D(sampler_voxelPosZ,  vec2(texVec.x,texVec.y))/255.0);\n'+ 
				
				'rgba = vec4(texVoxelPosX,texVoxelPosY,texVoxelPosZ,1.0);\n'+  
			'}\n'+
					
			'return rgba;\n'+
		'}\n'+
		'vec4 getVoxel_Normal(vec3 voxel, vec3 RayOrigin) {\n'+
			'vec4 rgba = vec4(0.0,0.0,0.0,0.0);\n'+
			
			'int tex3dId = (int(voxel.y)*('+this.stormVoxelizatorObject.resolution+'*'+this.stormVoxelizatorObject.resolution+'))+(int(voxel.z)*('+this.stormVoxelizatorObject.resolution+'))+int(voxel.x);\n'+ 	   
			'float num = float(tex3dId)/wh;\n'+
			'float col = fract(num)*wh;\n'+ 	 
			'float row = floor(num);\n'+ 
			'vec2 texVec = vec2(col*texelSize, row*texelSize);\n'+
			'vec4 texture = texture2D(sampler_voxelNormal,vec2(texVec.x, texVec.y));\n'+
			'if(texture.a/255.0 > 0.5) {\n'+ // existen triángulos dentro? 				
				'rgba = vec4(texture.rgb/255.0,1.0);\n'+  
			'}\n'+
					
			'return rgba;\n'+
		'}\n'+
		
		this.stormVoxelizatorObject.rayTraversalSTR(''+
			'if(uTypePass == 0) gv = getVoxel_Pos(voxel, RayOrigin);'+ 
			'else gv = getVoxel_Normal(voxel, RayOrigin);'+ 
			'if(gv.a != 0.0) {'+
				'color = gv;\n'+
				'break;\n'+
			'}'+
		'')+ 
		
		'void main(void) {\n'+
			'vec3 pixelCoord = vposScreen.xyz / vposScreen.w;'+
			'vec3 RayOrigin; vec3 RayDir; vec3 ro; vec3 rd;'+
			
			'vec4 texScreenNormal = texture2D(sampler_screenNormal,  vec2(pixelCoord.x,pixelCoord.y));\n'+ 
			'vec4 texScreenPos = texture2D(sampler_screenPos,  vec2(pixelCoord.x,pixelCoord.y));\n'+ 
			'if(texScreenNormal.a == 0.0) {'+ // IF texScreenNormal.a == 0.0 (found light). was added to textureFB_GIVoxel. Return to origin.
				'RayOrigin = vec3(vposition.x,vposition.y,vposition.z);\n'+
				'RayDir = vec3(vnormal.x,vnormal.y,vnormal.z);\n'+
				'ro = RayOrigin*vec3(1.0,1.0,-1.0);'+
				'rd = RayDir*vec3(1.0,1.0,-1.0);'+
			'} else {'+
				'RayOrigin = vec3(texScreenPos.xyz);\n'+
				'RayDir = vec3(texScreenNormal.x,texScreenNormal.y,texScreenNormal.z);\n'+
				'ro = RayOrigin;'+
				'rd = RayDir;'+
			'}'+
			
			
			'float maxBound = float(uMaxBounds);'+
			'vec4 color;'+
			
			'float maxang=(uTotalSamples == 0.0)?0.0:0.8928571428571429;'+  
			//'float maxang=(uTotalSamples == 0.0)?0.0:1.0;'+ 
			'vec4 rayT = rayTraversal(ro+(rd*(cs+cs+cs+cs+cs)), getVector(rd, maxang, vec2(randX1,randY1)));\n'+     // rX 0.0 perpend to normal; 0.5 parallel; 1.0 perpend    
			'if(texScreenPos.a < maxBound && rayT.a > 0.0) {'+  // hit in solid    
				'if(texScreenNormal.a == 0.0) {'+  // starting
					'if(uTypePass == 0) color = vec4(rayT.r,rayT.g,rayT.b, 0.0);\n'+ // save in textureFB_GIv2_screenPosTEMP
					'else color = vec4(rayT.r,rayT.g,rayT.b, 1.0);\n'+ // save in textureFB_GIv2_screenNormalTEMP // alpha 1.0 (found solid)
				'} else {'+
					'if(uTypePass == 0) color = vec4(rayT.r,rayT.g,rayT.b,texScreenPos.a+1.0);\n'+ // save in textureFB_GIv2_screenPosTEMP
					'else color = vec4(rayT.r,rayT.g,rayT.b, 1.0);\n'+ // save in textureFB_GIv2_screenNormalTEMP // alpha 1.0 (found solid)
				'}'+
			'} else if(rayT.a == 0.0) {'+ // hit in light
				'if(texScreenNormal.a == 0.0) {'+  // starting       
					'if(uTypePass == 0) color = vec4(1.0,1.0,1.0, sqrt(0.0/maxBound)*maxBound);\n'+ // save in textureFB_GIv2_screenPosTEMP
					'else color = vec4(1.0,1.0,1.0, 0.0);\n'+ // save in textureFB_GIv2_screenNormalTEMP  // alpha 0.0 (found light).  
				'} else {'+
					'if(uTypePass == 0) color = vec4(1.0,1.0,1.0, sqrt((texScreenPos.a+1.0)/maxBound)*maxBound);\n'+ // save in textureFB_GIv2_screenPosTEMP
					'else color = vec4(1.0,1.0,1.0, 0.0);\n'+ // save in textureFB_GIv2_screenNormalTEMP  // alpha 0.0 (found light).   
				'}'+
			'} else if(texScreenPos.a == maxBound) {'+		 
				'if(uTypePass == 0) color = vec4(0.0,0.0,0.0, texScreenPos.a);\n'+ // save in textureFB_GIv2_screenPosTEMP
				'else color = vec4(1.0,1.0,1.0, 0.0);\n'+ // save in textureFB_GIv2_screenNormalTEMP  // alpha 0.0 (found light).  
			'}'+
				
			//'color = vec4(RayOrigin, 1.0);\n'+              
			//'color = vec4(RayDir, 1.0);\n'+ 
			
			'gl_FragColor = color;\n'+
			
		'}';
	_this.shader_GIv2 = _this.gl.createProgram();
	_this.createShader(_this.gl, "GIv2", sourceVertex, sourceFragment, _this.shader_GIv2, _this.pointers_GIv2);
};
/** @private  */
StormGLContext.prototype.pointers_GIv2 = function() { 
	_this = stormEngineC.stormGLContext;
	
	_this.attr_GIv2_pos = _this.gl.getAttribLocation(_this.shader_GIv2, "aVertexPosition");
	_this.attr_GIv2_normal = _this.gl.getAttribLocation(_this.shader_GIv2, "aVertexNormal");
	
	_this.sampler_GIv2_voxelPosX = _this.gl.getUniformLocation(_this.shader_GIv2, "sampler_voxelPosX");
	_this.sampler_GIv2_voxelPosY = _this.gl.getUniformLocation(_this.shader_GIv2, "sampler_voxelPosY");
	_this.sampler_GIv2_voxelPosZ = _this.gl.getUniformLocation(_this.shader_GIv2, "sampler_voxelPosZ");
	_this.sampler_GIv2_voxelNormal = _this.gl.getUniformLocation(_this.shader_GIv2, "sampler_voxelNormal");
	_this.sampler_GIv2_screenPos = _this.gl.getUniformLocation(_this.shader_GIv2, "sampler_screenPos");
	_this.sampler_GIv2_screenNormal = _this.gl.getUniformLocation(_this.shader_GIv2, "sampler_screenNormal");
	_this.sampler_GIv2_finalShadow = _this.gl.getUniformLocation(_this.shader_GIv2, "sampler_finalShadow");
	
	_this.u_GIv2_randX1 = _this.gl.getUniformLocation(_this.shader_GIv2, "randX1");
	_this.u_GIv2_randY1 = _this.gl.getUniformLocation(_this.shader_GIv2, "randY1");
	_this.u_GIv2_totalSamples = _this.gl.getUniformLocation(_this.shader_GIv2, "uTotalSamples");
	_this.u_GIv2_typePass = _this.gl.getUniformLocation(_this.shader_GIv2, "uTypePass");
	_this.u_GIv2_maxBounds = _this.gl.getUniformLocation(_this.shader_GIv2, "uMaxBounds");
	
	_this.u_GIv2_PMatrix = _this.gl.getUniformLocation(_this.shader_GIv2, "uPMatrix");
	_this.u_GIv2_cameraWMatrix = _this.gl.getUniformLocation(_this.shader_GIv2, "u_cameraWMatrix");
	_this.u_GIv2_nodeWMatrix = _this.gl.getUniformLocation(_this.shader_GIv2, "u_nodeWMatrix");
	_this.u_GIv2_nodeVScale = _this.gl.getUniformLocation(_this.shader_GIv2, "u_nodeVScale");
	_this.Shader_GIv2_READY = true;
	stormEngineC.setZeroSamplesGIVoxels();
};
/** @private  */
StormGLContext.prototype.render_GIv2 = function() { 
	this.render_GIv2_AUX();
	this.gl.uniform1i(this.u_GIv2_maxBounds, stormEngineC.giv2.maxBounds);
};
/** @private  */
StormGLContext.prototype.render_GIv2_AUX = function() { 
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light') { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
			for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {	
				this.gl.uniformMatrix4fv(this.u_GIv2_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
				this.gl.uniformMatrix4fv(this.u_GIv2_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
				this.gl.uniformMatrix4fv(this.u_GIv2_nodeWMatrix, false, this.nodes[n].MPOSFrame.transpose().e); 
				this.gl.uniform3f(this.u_GIv2_nodeVScale, this.nodes[n].VSCALE.e[0], this.nodes[n].VSCALE.e[1], this.nodes[n].VSCALE.e[2]);   
				
				this.gl.activeTexture(this.gl.TEXTURE0);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.stormVoxelizatorObject.clglBuff_VoxelsPositionX.textureData);
				this.gl.uniform1i(this.sampler_GIv2_voxelPosX, 0);
				
				this.gl.activeTexture(this.gl.TEXTURE1);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.stormVoxelizatorObject.clglBuff_VoxelsPositionY.textureData);
				this.gl.uniform1i(this.sampler_GIv2_voxelPosY, 1);
				
				this.gl.activeTexture(this.gl.TEXTURE2);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.stormVoxelizatorObject.clglBuff_VoxelsPositionZ.textureData);
				this.gl.uniform1i(this.sampler_GIv2_voxelPosZ, 2);
				
				this.gl.activeTexture(this.gl.TEXTURE3);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.stormVoxelizatorObject.clglBuff_VoxelsNormal.textureData);
				this.gl.uniform1i(this.sampler_GIv2_voxelNormal, 3);
				
				this.gl.activeTexture(this.gl.TEXTURE4);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPos);
				this.gl.uniform1i(this.sampler_GIv2_screenPos, 4);		
				
				this.gl.activeTexture(this.gl.TEXTURE5);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormal);
				this.gl.uniform1i(this.sampler_GIv2_screenNormal, 5);		
	
				this.gl.activeTexture(this.gl.TEXTURE6);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIVoxel);
				this.gl.uniform1i(this.sampler_GIv2_finalShadow, 6);
				
				this.gl.uniform1f(this.u_GIv2_randX1, Math.random());
				this.gl.uniform1f(this.u_GIv2_randY1, Math.random());
				this.gl.uniform1f(this.u_GIv2_totalSamples, this.sampleGiVoxels);
				
				this.gl.enableVertexAttribArray(this.attr_GIv2_pos);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshVertexBuffer);
				this.gl.vertexAttribPointer(this.attr_GIv2_pos, 3, this.gl.FLOAT, false, 0, 0);
				if(this.nodes[n].buffersObjects[nb].nodeMeshNormalArray != undefined) {
					this.gl.enableVertexAttribArray(this.attr_GIv2_normal);
					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshNormalBuffer);
					this.gl.vertexAttribPointer(this.attr_GIv2_normal, 3, this.gl.FLOAT, false, 0, 0);
				}
				if(this.nodes[n].buffersObjects[nb].nodeMeshIndexArray != undefined) {
					this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshIndexBuffer);
					this.gl.drawElements(this.gl.TRIANGLES, this.nodes[n].buffersObjects[nb].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
				} else {
					this.gl.drawArrays(this.gl.TRIANGLES, 0, this.nodes[n].buffersObjects[nb].nodeMeshVertexBufferNumItems);
				}
			}
		}
	}
};





/*----------------------------------------------------------------------------------------
     									GI VOXEL TRAVERSAL EXEC
----------------------------------------------------------------------------------------*/
/** @private  */
StormGLContext.prototype.initShader_GIv2Exec = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = 	_this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec2 aTextureCoord;\n'+
	
		'varying vec2 vTextureCoord;\n'+ 
		
		'void main(void) {\n'+
			'gl_Position = vec4(aVertexPosition, 1.0);\n'+
			'vTextureCoord = aTextureCoord;\n'+
		'}';
	var sourceFragment = _this.precision+
		
		'uniform int uMaxBounds;\n'+
		
		'uniform sampler2D sampler_GIVoxel;\n'+
		'uniform sampler2D sampler_screenPos;\n'+
		'uniform sampler2D sampler_screenNormal;\n'+
		
		'varying vec2 vTextureCoord;\n'+ 
		
		'void main(void) {\n'+
			'float maxBound = float(uMaxBounds);'+
			'vec4 color;'+
			'vec4 texScreenPos = texture2D(sampler_screenPos, vTextureCoord);\n'+ 
			'vec4 texScreenNormal = texture2D(sampler_screenNormal, vTextureCoord);\n'+ 
			'vec4 texScreenGIVoxel = texture2D(sampler_GIVoxel, vTextureCoord);\n'+ 
			'if(texScreenNormal.a == 0.0) {'+ // texScreenNormal.a == 0.0 (Se encontro luz). 
				'float am = ((maxBound)-texScreenPos.a)/(maxBound);'+
				'vec3 amount = vec3(am, am, am);'+ 
				'color = vec4(texScreenGIVoxel.xyz+amount, texScreenGIVoxel.a+1.0);'+
			'} else {'+ // golpea en solido. No hacemos nada
				'color = texScreenGIVoxel;'+
			'}'+
			'gl_FragColor = color;'+
		'}';
	_this.shader_GIv2Exec = _this.gl.createProgram();
	_this.createShader(_this.gl, "GIv2 EXEC", sourceVertex, sourceFragment, _this.shader_GIv2Exec, _this.pointers_GIv2Exec);
};
/** @private  */
StormGLContext.prototype.pointers_GIv2Exec = function() { 
	_this = stormEngineC.stormGLContext;
	
	_this.u_GIv2EXEC_maxBounds = _this.gl.getUniformLocation(_this.shader_GIv2Exec, "uMaxBounds");
	
	_this.attr_GIv2EXEC_pos = _this.gl.getAttribLocation(_this.shader_GIv2Exec, "aVertexPosition");
	_this.attr_GIv2EXEC_tex = _this.gl.getAttribLocation(_this.shader_GIv2Exec, "aTextureCoord");
	
	_this.sampler_GIv2EXEC_GIVoxel = _this.gl.getUniformLocation(_this.shader_GIv2Exec, "sampler_GIVoxel");
	_this.sampler_GIv2EXEC_screenPos = _this.gl.getUniformLocation(_this.shader_GIv2Exec, "sampler_screenPos");
	_this.sampler_GIv2EXEC_screenNormal = _this.gl.getUniformLocation(_this.shader_GIv2Exec, "sampler_screenNormal");
	
	_this.Shader_GIv2Exec_READY = true;
};
/** @private  */
StormGLContext.prototype.render_GIv2Exec = function() { 
	this.gl.useProgram(this.shader_GIv2Exec);
	
	this.gl.uniform1i(this.u_GIv2EXEC_maxBounds, stormEngineC.giv2.maxBounds); 
	
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIVoxel);
	this.gl.uniform1i(this.sampler_GIv2EXEC_GIVoxel, 0);				
	
	this.gl.activeTexture(this.gl.TEXTURE1);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPos);
	this.gl.uniform1i(this.sampler_GIv2EXEC_screenPos, 1);		
	
	this.gl.activeTexture(this.gl.TEXTURE2);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormal);
	this.gl.uniform1i(this.sampler_GIv2EXEC_screenNormal, 2);		
	
	
	
	this.gl.enableVertexAttribArray(this.attr_GIv2EXEC_pos);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_QUAD);
	this.gl.vertexAttribPointer(this.attr_GIv2EXEC_pos, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.enableVertexAttribArray(this.attr_GIv2EXEC_tex);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer_QUAD);
	this.gl.vertexAttribPointer(this.attr_GIv2EXEC_tex, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_QUAD);
	this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);	

};