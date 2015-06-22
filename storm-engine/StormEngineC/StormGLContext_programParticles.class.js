/*----------------------------------------------------------------------------------------
										PARTICLES AUX
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_ParticlesAux = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = _this.precision+
		'attribute vec4 aVertexPositionX;\n'+
		'attribute vec4 aVertexPositionY;\n'+
		'attribute vec4 aVertexPositionZ;\n'+
		'attribute vec4 aColorRGBA;\n'+
		'varying vec4 vColorRGBA;\n'+
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'uniform float uPointSize;\n'+
		'uniform int uLightPass;\n'+
		
		'varying vec4 vpositionLightViewportRegion;\n'+
		'varying vec4 vpositionLight;\n'+
		'varying vec4 vNodeWMatrix;\n'+
		// http://devmaster.net/posts/3002/shader-effects-shadow-mapping
		// The scale matrix is used to push the projected vertex into the 0.0 - 1.0 region.
		// Similar in role to a * 0.5 + 0.5, where -1.0 < a < 1.0.
		'const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);'+
		'uniform mat4 u_lightWMatrix;\n'+
		'uniform mat4 uPMatrixLight;\n'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		
		'void main(void) {\n'+
			// normalized and no needed divide by 255 (unpack(aVertexPositionX/255.0)) 	
			'float texturePosX = (unpack(aVertexPositionX)*'+(stormEngineC.particlesOffset*2).toFixed(2)+')-'+stormEngineC.particlesOffset.toFixed(2)+';\n'+  
			'float texturePosY = (unpack(aVertexPositionY)*'+(stormEngineC.particlesOffset*2).toFixed(2)+')-'+stormEngineC.particlesOffset.toFixed(2)+';\n'+  
			'float texturePosZ = (unpack(aVertexPositionZ)*'+(stormEngineC.particlesOffset*2).toFixed(2)+')-'+stormEngineC.particlesOffset.toFixed(2)+';\n'+  
			
			'vNodeWMatrix = vec4(texturePosX,texturePosY,texturePosZ, 1.0);'+
			'if(uLightPass == 1) vpositionLightViewportRegion = ScaleMatrix * uPMatrixLight * u_lightWMatrix * vNodeWMatrix;\n'+
			'if(uLightPass == 1) vpositionLight = u_lightWMatrix * vNodeWMatrix;\n'+
			
			//'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * vec4(texturePosX,texturePosY,texturePosZ, 1.0);\n'+
			'gl_Position = uPMatrix * u_cameraWMatrix * vNodeWMatrix;\n'+
				
				
				
			'gl_PointSize = uPointSize;\n'+ 
			'vColorRGBA = aColorRGBA;\n'+
		'}';
	var sourceFragment = _this.precision+
		'uniform sampler2D sampler_textureFBLightDepth;\n'+
		
		'varying vec4 vColorRGBA;\n'+
		
		'varying vec4 vpositionLightViewportRegion;\n'+
		'varying vec4 vpositionLight;\n'+
		'uniform float uFar;\n'+
		'uniform float uLightFov;\n'+
		'uniform vec3 uAmbientColor;\n'+
		'uniform int uLightPass;\n'+
		'uniform int uSelfshadows;\n'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		'float LinearDepthConstant = 1.0/uFar;'+
		
		
		'void main(void) {\n'+
			'if(uLightPass == 1) {'+
				'if(uSelfshadows == 1) {'+
					'float depthFromLight = length(vpositionLight) * LinearDepthConstant;'+
					
					'vec3 pixelCoord = vpositionLightViewportRegion.xyz / vpositionLightViewportRegion.w;'+
					'vec4 textureFBLightDepth = texture2D(sampler_textureFBLightDepth, pixelCoord.xy);\n'+
					//'float depthFromTexture = unpack(textureFBLightDepth)+0.001;\n'+
					'float depthFromTexture = textureFBLightDepth.x+(0.00001*(uLightFov/2.0));\n'+
					
					'float light =  depthFromLight > depthFromTexture ? 0.0 : 1.0;\n'+ 
					'if(light == 0.0) gl_FragColor = vec4(((uAmbientColor*(1.0-length(uAmbientColor)))+vec3(vColorRGBA.r*length(uAmbientColor), vColorRGBA.g*length(uAmbientColor), vColorRGBA.b*length(uAmbientColor))), 1.0);\n'+ 
					'else gl_FragColor = vec4(vec3(vColorRGBA.r, vColorRGBA.g, vColorRGBA.b), 1.0);\n'+ 
				'} else {'+
					'gl_FragColor = vec4(vec3(vColorRGBA.r, vColorRGBA.g, vColorRGBA.b), 1.0);\n'+ 
				'}'+
			'} else {'+
				'gl_FragColor = vec4(((uAmbientColor*(1.0-length(uAmbientColor)))+vec3(vColorRGBA.r*length(uAmbientColor), vColorRGBA.g*length(uAmbientColor), vColorRGBA.b*length(uAmbientColor))), 1.0);\n'+ 
			'}'+
		'}';
	_this.shader_ParticlesAux = _this.gl.createProgram();
	_this.createShader(_this.gl, "PARTICLE AUX", sourceVertex, sourceFragment, _this.shader_ParticlesAux, _this.pointers_ParticlesAux);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_ParticlesAux = function() {
	_this = stormEngineC.stormGLContext;
	_this.attr_ParticlesAux_posX = _this.gl.getAttribLocation(_this.shader_ParticlesAux, "aVertexPositionX");
	_this.attr_ParticlesAux_posY = _this.gl.getAttribLocation(_this.shader_ParticlesAux, "aVertexPositionY");
	_this.attr_ParticlesAux_posZ = _this.gl.getAttribLocation(_this.shader_ParticlesAux, "aVertexPositionZ");
	_this.attr_ParticlesAux_ColorRGBA = _this.gl.getAttribLocation(_this.shader_ParticlesAux, "aColorRGBA");
	
	_this.u_ParticlesAux_PMatrix = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "uPMatrix");
	_this.u_ParticlesAux_cameraWMatrix = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "u_cameraWMatrix");
	_this.u_ParticlesAux_nodeWMatrix = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "u_nodeWMatrix");
	
	_this.u_ParticlesAux_uPointSize = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "uPointSize");
	
	_this.u_ParticlesAux_textureFBLightDepth = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "sampler_textureFBLightDepth");// RT1 rgba zdepth light[0]
	_this.u_ParticlesAux_far = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "uFar");
	_this.u_ParticlesAux_LightFov = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "uLightFov");
	_this.u_ParticlesAux_ambientColor = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "uAmbientColor");
	_this.u_ParticlesAux_PMatrixLight = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "uPMatrixLight");
	_this.u_ParticlesAux_lightWMatrix = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "u_lightWMatrix");
	
	_this.u_ParticlesAux_lightPass = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "uLightPass");
	_this.u_ParticlesAux_selfshadows = _this.gl.getUniformLocation(_this.shader_ParticlesAux, "uSelfshadows");
	_this.Shader_ParticlesAux_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_ParticlesAux = function() {
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	} else {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer); 
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureObject_DOF, 0);
		//this.gl.enable(this.gl.BLEND);
		//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
	}
	//this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	//this.gl.clear(this.gl.COLOR_BUFFER_BIT);

	
	this.gl.useProgram(this.shader_ParticlesAux);
	
	this.gl.uniformMatrix4fv(this.u_ParticlesAux_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_ParticlesAux_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
	this.gl.uniform1f(this.u_ParticlesAux_far, this.far);
	this.gl.uniform3f(this.u_ParticlesAux_ambientColor,this.ambientColor.e[0],this.ambientColor.e[1],this.ambientColor.e[2]); 
	
				
	for(var p = 0, f = this.particles.length; p < f; p++) {
		if(this.particles[p].visibleOnContext == true) {
	
			this.gl.uniformMatrix4fv(this.u_ParticlesAux_nodeWMatrix, false, this.particles[p].MPOS.transpose().e); 
			this.gl.uniform1f(this.u_ParticlesAux_uPointSize, this.particles[p].pointSize);		
			
			for(var nb = 0, fb = this.particles[p].buffersObjects.length; nb < fb; nb++) {
				var buffersObject = this.particles[p].buffersObjects[nb];
				
				// WEBCLGL    
				this.particles[p].webCLGL.enqueueNDRangeKernel(this.particles[p].kernelPosX, this.particles[p].buffer_PosTempX); 
				this.particles[p].webCLGL.enqueueNDRangeKernel(this.particles[p].kernelPosY, this.particles[p].buffer_PosTempY); 
				this.particles[p].webCLGL.enqueueNDRangeKernel(this.particles[p].kernelPosZ, this.particles[p].buffer_PosTempZ); 
				
				this.particles[p].webCLGL.enqueueNDRangeKernel(this.particles[p].kernelDirX, this.particles[p].buffer_Dir); 
				
				this.particles[p].webCLGL.copy(this.particles[p].buffer_PosTempX, this.particles[p].buffer_PosX);
				this.particles[p].webCLGL.copy(this.particles[p].buffer_PosTempY, this.particles[p].buffer_PosY);
				this.particles[p].webCLGL.copy(this.particles[p].buffer_PosTempZ, this.particles[p].buffer_PosZ);
				
				var arr4Uint8_X = this.particles[p].webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(this.particles[p].buffer_PosX);
				var arr4Uint8_Y = this.particles[p].webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(this.particles[p].buffer_PosY); 
				var arr4Uint8_Z = this.particles[p].webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(this.particles[p].buffer_PosZ);
				
				this.gl.useProgram(this.shader_ParticlesAux); 
				
				this.gl.enableVertexAttribArray(this.attr_ParticlesAux_posX);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBufferX);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_X, this.gl.DYNAMIC_DRAW);
				this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_X);   
				this.gl.vertexAttribPointer(this.attr_ParticlesAux_posX, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
				
				this.gl.enableVertexAttribArray(this.attr_ParticlesAux_posY);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBufferY);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Y, this.gl.DYNAMIC_DRAW);
				this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Y); 
				this.gl.vertexAttribPointer(this.attr_ParticlesAux_posY, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
				
				this.gl.enableVertexAttribArray(this.attr_ParticlesAux_posZ);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBufferZ);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Z, this.gl.DYNAMIC_DRAW);
				this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Z);  
				this.gl.vertexAttribPointer(this.attr_ParticlesAux_posZ, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
				
				
				
				this.gl.enableVertexAttribArray(this.attr_ParticlesAux_ColorRGBA);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particles[p].buffer_ColorRGBA);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_X, this.gl.DYNAMIC_DRAW);
				//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_X);   
				this.gl.vertexAttribPointer(this.attr_ParticlesAux_ColorRGBA, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
				
				
				this.gl.uniform1i(this.u_ParticlesAux_lightPass, 0);
				this.gl.drawArrays(this.gl.POINTS, 0, this.particles[p].particlesLength); 
				
				for(var nL = 0, fL = this.lights.length; nL < fL; nL++) { 
					if(this.lights[nL].visibleOnContext == true) {
						var light =  this.lights[nL];
						this.gl.uniformMatrix4fv(this.u_ParticlesAux_PMatrixLight, false, light.mPMatrix.transpose().e); 
						this.gl.uniformMatrix4fv(this.u_ParticlesAux_lightWMatrix, false, light.MPOS.transpose().e);
						
						if(this.particles[p].selfshadows == true) this.gl.uniform1i(this.u_ParticlesAux_selfshadows, 1);
						else this.gl.uniform1i(this.u_ParticlesAux_selfshadows, 0);
						
						this.gl.uniform1f(this.u_ParticlesAux_LightFov, light.getFov());
						
						this.gl.activeTexture(this.gl.TEXTURE0);
						if(light.type == 'sun') {
							this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSun); // texture framebuffer light sun
						} else {
							this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSpot); // texture framebuffer light spot
						}
						this.gl.uniform1i(this.u_ParticlesAux_textureFBLightDepth, 0);
						
						this.gl.uniform1i(this.u_ParticlesAux_lightPass, 1);
						this.gl.drawArrays(this.gl.POINTS, 0, this.particles[p].particlesLength); 
						
					}
				}
			}
		
		}
	}
			
		
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
	} else {
		//this.gl.disable(this.gl.BLEND);
	}
};