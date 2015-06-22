/*----------------------------------------------------------------------------------------
     									LIGHT DEPTH
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_LightDepth = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = 	 _this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aTextureCoord;\n'+
		
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_lightWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'uniform int uLightType;\n'+
		
		'varying vec4 vNormal;\n'+
		'varying vec4 vposition;\n'+
		'varying vec3 vTextureCoord;\n'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			'vposition = u_lightWMatrix * u_nodeWMatrix * vec4(vp, 1.0);\n'+
			'gl_Position = uPMatrix * vposition;\n'+
			
			'vTextureCoord = aTextureCoord;\n'+
		'}';
	var sourceFragment = _this.precision+
		
		'uniform float uFar;\n'+
		
		'uniform sampler2D sampler_kdTexture;\n'+
		'uniform int viewLightDepth;\n'+
		
		'varying vec4 vNormal;\n'+
		'varying vec4 vposition;\n'+
		'varying vec3 vTextureCoord;\n'+
		
		'vec4 pack (float depth) {'+
			'const vec4 bias = vec4(1.0 / 255.0,'+
						'1.0 / 255.0,'+
						'1.0 / 255.0,'+
						'0.0);'+

			'float r = depth;'+
			'float g = fract(r * 255.0);'+
			'float b = fract(g * 255.0);'+
			'float a = fract(b * 255.0);'+
			'vec4 colour = vec4(r, g, b, a);'+
			
			'return colour - (colour.yzww * bias);'+
		'}'+
		'float LinearDepthConstant = 1.0/uFar;'+
		
		'void main(void) {\n'+
			
			'vec4 kdTexture = texture2D(sampler_kdTexture, vec2(vTextureCoord.s, vTextureCoord.t));\n'+
			
			'float depth;\n'+
			'if(kdTexture.a == 0.0) {\n'+
				//'depth = length(uFar)*LinearDepthConstant;'+
				'depth = 1.0*LinearDepthConstant;'+
			'} else {\n'+
				'depth = length(vposition)*LinearDepthConstant;'+
			'}\n'+
			
			//'gl_FragColor = pack(depth);\n'+
			//'if(viewLightDepth==0) gl_FragColor = pack(depth); else gl_FragColor = vec4(kdTexture);\n'+  
			'if(viewLightDepth==0) gl_FragColor = vec4(depth,depth,depth,1.0); else gl_FragColor = vec4(kdTexture);\n'+  
			
		'}';
	_this.shader_LightDepth = _this.gl.createProgram();
	_this.createShader(_this.gl, "LIGHT DEPTH", sourceVertex, sourceFragment, _this.shader_LightDepth, _this.pointers_LightDepth);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_LightDepth = function() {
	_this = stormEngineC.stormGLContext;
	_this.u_LightDepth_far = _this.gl.getUniformLocation(_this.shader_LightDepth, "uFar");
	
	_this.sampler_LightDepth_kdTexture = _this.gl.getUniformLocation(_this.shader_LightDepth, "sampler_kdTexture");
		
	_this.attr_LightDepth_pos = _this.gl.getAttribLocation(_this.shader_LightDepth, "aVertexPosition");
	_this.attr_LightDepth_UV = _this.gl.getAttribLocation(_this.shader_LightDepth, "aTextureCoord");
	
	
	_this.u_LightDepth_lightType = _this.gl.getUniformLocation(_this.shader_LightDepth, "uLightType");
	_this.u_LightDepth_viewLightDepth = _this.gl.getUniformLocation(_this.shader_LightDepth, "viewLightDepth");
	
	_this.u_LightDepth_PMatrix = _this.gl.getUniformLocation(_this.shader_LightDepth, "uPMatrix");
	_this.u_LightDepth_lightWMatrix = _this.gl.getUniformLocation(_this.shader_LightDepth, "u_lightWMatrix");
	_this.u_LightDepth_nodeWMatrix = _this.gl.getUniformLocation(_this.shader_LightDepth, "u_nodeWMatrix");
	_this.u_LightDepth_nodeVScale = _this.gl.getUniformLocation(_this.shader_LightDepth, "u_nodeVScale");
	_this.Shader_LightDepth_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.initShader_LightDepthParticles = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = 	_this.precision+
		'uniform float uPointSize;\n'+
		
		'attribute vec4 aVertexPositionX;\n'+
		'attribute vec4 aVertexPositionY;\n'+
		'attribute vec4 aVertexPositionZ;\n'+
		//'attribute vec4 aColorRGBA;\n'+
		//'varying vec4 vColorRGBA;\n'+
		
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform mat4 u_lightWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		 
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		'varying vec4 vposition;\n'+
		
		'void main(void) {\n'+
			// normalized and no needed divide by 255 (unpack(aVertexPositionX/255.0))
			'float texturePosX = ((aVertexPositionX.x)*'+(stormEngineC.particlesOffset*2).toFixed(2)+')-'+stormEngineC.particlesOffset.toFixed(2)+';\n'+  
			'float texturePosY = ((aVertexPositionY.x)*'+(stormEngineC.particlesOffset*2).toFixed(2)+')-'+stormEngineC.particlesOffset.toFixed(2)+';\n'+  
			'float texturePosZ = ((aVertexPositionZ.x)*'+(stormEngineC.particlesOffset*2).toFixed(2)+')-'+stormEngineC.particlesOffset.toFixed(2)+';\n'+  
			
			//'gl_Position = uPMatrix * u_lightWMatrix * u_nodeWMatrix * vec4(texturePosX,texturePosY,texturePosZ, 1.0);\n'+
			//'gl_Position = uPMatrix * u_lightWMatrix * vec4(texturePosX,texturePosY,texturePosZ, 1.0);\n'+
			
			'vposition = u_lightWMatrix  * vec4(texturePosX,texturePosY,texturePosZ, 1.0);\n'+
			'gl_Position = uPMatrix * vposition;\n'+
			
			
			'gl_PointSize = uPointSize;\n'+ 
			//'vColorRGBA = aColorRGBA;\n'+
		'}';
	var sourceFragment = _this.precision+
		'uniform float uFar;\n'+
		'uniform sampler2D sampler_kdTexture;\n'+
		'varying vec4 vposition;\n'+
		//'varying vec4 vColorRGBA;\n'+
		'vec4 pack (float depth) {'+
			'const vec4 bias = vec4(1.0 / 255.0,'+
						'1.0 / 255.0,'+
						'1.0 / 255.0,'+
						'0.0);'+

			'float r = depth;'+
			'float g = fract(r * 255.0);'+
			'float b = fract(g * 255.0);'+
			'float a = fract(b * 255.0);'+
			'vec4 colour = vec4(r, g, b, a);'+
			
			'return colour - (colour.yzww * bias);'+
		'}'+
		'float LinearDepthConstant = 1.0/uFar;'+
		
		'void main(void) {\n'+
			//'vec4 textureColor = texture2D(sampler_kdTexture, vec2(0.0, 0.0));\n'+
			//'gl_FragColor = vec4(vec3(textureColor.r, textureColor.g, textureColor.b), 1.0);\n'+
			'float depth = length(vposition)*LinearDepthConstant;'+
			//'gl_FragColor = pack(depth);\n'+   
			'gl_FragColor = vec4(depth,depth,depth,1.0);\n'+   
		'}';
	_this.shader_LightDepthParticles = _this.gl.createProgram();
	_this.createShader(_this.gl, "LIGHT DEPTH PARTICLES", sourceVertex, sourceFragment, _this.shader_LightDepthParticles, _this.pointers_LightDepthParticles);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_LightDepthParticles = function() {
	_this = stormEngineC.stormGLContext;
	_this.u_LightDepthParticles_far = _this.gl.getUniformLocation(_this.shader_LightDepthParticles, "uFar");
	
	_this.u_LightDepthParticles_pointSize = _this.gl.getUniformLocation(_this.shader_LightDepthParticles, "uPointSize");
	
	_this.attr_LightDepthParticles_posX = _this.gl.getAttribLocation(_this.shader_LightDepthParticles, "aVertexPositionX");
	_this.attr_LightDepthParticles_posY = _this.gl.getAttribLocation(_this.shader_LightDepthParticles, "aVertexPositionY");
	_this.attr_LightDepthParticles_posZ = _this.gl.getAttribLocation(_this.shader_LightDepthParticles, "aVertexPositionZ");
	
	_this.u_LightDepthParticles_PMatrix = _this.gl.getUniformLocation(_this.shader_LightDepthParticles, "uPMatrix");
	_this.u_LightDepthParticles_lightWMatrix = _this.gl.getUniformLocation(_this.shader_LightDepthParticles, "u_lightWMatrix");
	_this.u_LightDepthParticles_nodeWMatrix = _this.gl.getUniformLocation(_this.shader_LightDepthParticles, "u_nodeWMatrix");
	_this.Shader_LightDepthParticles_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_LightDepth = function() {
	//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer); 
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_Shadows, 0);
	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	
							
	for(var nL = 0, fL = this.lights.length; nL < fL; nL++) { 
		if(this.lights[nL].visibleOnContext == true) {
			if((this.view_LightDepth && nL == this.view_LightDepthNum) || !this.view_LightDepth) {
				if(this.lights[nL].type == 'sun') { 
					this.gl.viewport(0, 0, this.view_LightDepth ? this.viewportWidth : this.maxViewportWidth, this.view_LightDepth ? this.viewportHeight : this.maxViewportHeight);
					this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.view_LightDepth ? null : this.fBufferLightSun);
					this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_LightSun, 0);
				} else {
					this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
					this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.view_LightDepth ? null : this.fBufferLightSpot);
					this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_LightSpot, 0);
				}
				//guardamos en this.textureRTLightXX mapa de profundidad de la escena desde la vista de la luz
				var light =  this.lights[nL];
				this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
				
				
				
				for(var n = 0, f = this.nodes.length; n < f; n++) {
					if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light' && this.nodes[n].shadows==true) { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
						for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {	
							var kdName = this.nodes[n].materialUnits[0].textureKdName;
							if(kdName != undefined && kdName.match(/.png$/gim) == null) {
								this.renderFromLight(this.nodes[n], this.nodes[n].buffersObjects[nb], light);
							}
						}
					}
				}
				for(var n = 0, f = this.nodes.length; n < f; n++) {
					if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light' && this.nodes[n].shadows==true) { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
						for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {	
							var kdName = this.nodes[n].materialUnits[0].textureKdName;
							if(kdName != undefined && kdName.match(/.png$/gim) != null) {
								this.renderFromLight(this.nodes[n],this.nodes[n].buffersObjects[nb],light);
							}
						}
					}
				}
				for(var p = 0, f = this.particles.length; p < f; p++) {	
					if(this.particles[p].visibleOnContext == true) {
						if(this.particles[p].shadows == true) {
							for(var nb = 0, fb = this.particles[p].buffersObjects.length; nb < fb; nb++) {
								this.renderFromLight(this.particles[p],this.particles[p].buffersObjects[nb],light);
							}
						}
					}
				}
			}
			if(!this.view_LightDepth) {
				this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.view_Shadows ? null : this.fBuffer);
				if(!this.view_Shadows) this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_Shadows, 0);
				if(nL > 0) {
					this.gl.enable(this.gl.BLEND);
					this.gl.blendEquation(this.gl.FUNC_ADD);
					this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
				}
				this.gl.useProgram(this.shader_Shadows);
				// una vez obtenemos (para la luz actual) el mapa de profundidad de la escena vista desde la luz y está guardado
				// en this.textureRTLightXX, renderizaremos una mascara desde la vista actual de la cámara (vposition en vertex program)
				// y que guardaremos en this.textureFB_Shadows para aplicar despues en RENDER ESCENE dando las zonas con luz o sombra.
				// Para obtener la máscara (en vista de cámara) para esta luz, desde el fragment program determinaremos si el pixel actual
				// debería ser blanco o negro. Para ello comprobamos la distancia de ese pixel visto desde la posición de la luz
				// comparándola con la que tenemos en el mapa de profundidad de this.textureRTLightXX.
				// Recorreremos todas las luces sumándolos a this.textureFB_Shadows.
				this.render_Shadows(light);
				if(nL > 0) {
					this.gl.disable(this.gl.BLEND);
				}
			}
		}
	}
	
	
};
/**
 * @private 
 */
StormGLContext.prototype.renderFromLight = function(node, buffersObject, light) {  
	if(node.objectType == 'particles') {
		this.gl.useProgram(this.shader_LightDepthParticles);
		
		this.gl.uniform1f(this.u_LightDepthParticles_far, this.far);
		this.gl.uniformMatrix4fv(this.u_LightDepthParticles_PMatrix, false, light.mPMatrix.transpose().e);
		this.gl.uniformMatrix4fv(this.u_LightDepthParticles_lightWMatrix, false, light.MPOS.transpose().e);
		this.gl.uniformMatrix4fv(this.u_LightDepthParticles_nodeWMatrix, false, node.MPOS.transpose().e);
		
		this.gl.uniform1f(this.u_LightDepthParticles_pointSize, node.pointSize);
		
		this.gl.enableVertexAttribArray(this.attr_LightDepthParticles_posX);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBufferX);
		this.gl.vertexAttribPointer(this.attr_LightDepthParticles_posX, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
		
		this.gl.enableVertexAttribArray(this.attr_LightDepthParticles_posY);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBufferY);
		this.gl.vertexAttribPointer(this.attr_LightDepthParticles_posY, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
		
		this.gl.enableVertexAttribArray(this.attr_LightDepthParticles_posZ);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBufferZ);
		this.gl.vertexAttribPointer(this.attr_LightDepthParticles_posZ, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
		
		
		this.gl.drawArrays(this.gl.POINTS, 0, node.particlesLength); 
	} else {
		this.gl.useProgram(this.shader_LightDepth);
		
		this.gl.uniform1i(this.u_LightDepth_viewLightDepth, this.view_LightDepth);
		this.gl.uniform1i(this.u_LightDepth_lightType, (light.type == 'sun')?0:1); // sun 0 ; spot 1   (light.type == 'sun')?0:1
					
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, node.materialUnits[0].textureObjectKd.textureData);
		this.gl.uniform1i(this.sampler_LightDepth_kdTexture, 0);
		 
		this.gl.uniform1f(this.u_LightDepth_far, this.far);
		this.gl.uniformMatrix4fv(this.u_LightDepth_PMatrix, false, light.mPMatrix.transpose().e);
		this.gl.uniformMatrix4fv(this.u_LightDepth_lightWMatrix, false, light.MPOS.transpose().e);
		this.gl.uniformMatrix4fv(this.u_LightDepth_nodeWMatrix, false, node.MPOSFrame.transpose().e);
		this.gl.uniform3f(this.u_LightDepth_nodeVScale, node.VSCALE.e[0], node.VSCALE.e[1], node.VSCALE.e[2]);   

		this.gl.enableVertexAttribArray(this.attr_LightDepth_pos);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBuffer);
		this.gl.vertexAttribPointer(this.attr_LightDepth_pos, 3, this.gl.FLOAT, false, 0, 0);
		if(buffersObject.nodeMeshTextureArray != undefined) {
			this.gl.enableVertexAttribArray(this.attr_LightDepth_UV);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshTextureBuffer);
			this.gl.vertexAttribPointer(this.attr_LightDepth_UV, 3, this.gl.FLOAT, false, 0, 0);
		}
		if(buffersObject.nodeMeshIndexArray != undefined) {
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffersObject.nodeMeshIndexBuffer);
			this.gl.drawElements(this.gl.TRIANGLES, buffersObject.nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
		} else {
			this.gl.drawArrays(this.gl.TRIANGLES, 0, buffersObject.nodeMeshVertexBufferNumItems);
		} 
	}
};


/*----------------------------------------------------------------------------------------
									SHADOW LAYER
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Shadows = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = 	_this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec4 aVertexPositionX;\n'+
		'attribute vec4 aVertexPositionY;\n'+
		'attribute vec4 aVertexPositionZ;\n'+
		
		'uniform mat4 uPMatrix;\n'+
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 u_lightWMatrix;\n'+
		'uniform mat4 uPMatrixLight;\n'+
		
		'uniform int uLightType;\n'+
		'uniform int uTypeParticles;\n'+
		
		'varying vec4 vpositionLightViewportRegion;\n'+
		'varying vec4 vpositionLight;\n'+
		'varying vec4 vNodeWMatrix;\n'+
		
		// http://devmaster.net/posts/3002/shader-effects-shadow-mapping
		// The scale matrix is used to push the projected vertex into the 0.0 - 1.0 region.
		// Similar in role to a * 0.5 + 0.5, where -1.0 < a < 1.0.
		'const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			'if(uTypeParticles == 0) {'+
				'vNodeWMatrix = u_nodeWMatrix * vec4(vp, 1.0);'+
				
				'vpositionLightViewportRegion = ScaleMatrix * uPMatrixLight * u_lightWMatrix * vNodeWMatrix;\n'+
				'vpositionLight = u_lightWMatrix * vNodeWMatrix;\n'+
				
				'gl_Position = uPMatrix * u_cameraWMatrix * vNodeWMatrix;\n'+
			'} else {'+
				'float texturePosX = ((aVertexPositionX.x*u_nodeVScale.x)*'+(stormEngineC.particlesOffset*2).toFixed(2)+')-'+stormEngineC.particlesOffset.toFixed(2)+';\n'+  
				'float texturePosY = ((aVertexPositionY.x*u_nodeVScale.y)*'+(stormEngineC.particlesOffset*2).toFixed(2)+')-'+stormEngineC.particlesOffset.toFixed(2)+';\n'+  
				'float texturePosZ = ((aVertexPositionZ.x*u_nodeVScale.z)*'+(stormEngineC.particlesOffset*2).toFixed(2)+')-'+stormEngineC.particlesOffset.toFixed(2)+';\n'+  
			
				'vNodeWMatrix = vec4(texturePosX,texturePosY,texturePosZ, 1.0);'+
				
				'vpositionLightViewportRegion = ScaleMatrix * uPMatrixLight * u_lightWMatrix * vNodeWMatrix;\n'+
				'vpositionLight = u_lightWMatrix * vNodeWMatrix;\n'+
				
				'gl_Position = uPMatrix * u_cameraWMatrix * vNodeWMatrix;\n'+
			'}'+
		'}';
	var sourceFragment = _this.precision+
		
		'uniform float uFar;\n'+
		'uniform float uLightFov;\n'+
		
		'uniform sampler2D sampler_textureFBLightDepth;\n'+
		
		'uniform int uUseLight;\n'+
		'uniform int uLightType;\n'+
		'uniform vec3 uLightColor;\n'+
		
		'varying vec4 vpositionLightViewportRegion;\n'+
		'varying vec4 vpositionLight;\n'+
		'varying vec4 vNodeWMatrix;\n'+
		'uniform vec3 u_PositionLight;\n'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		'float LinearDepthConstant = 1.0/uFar;'+
		
		'void main(void) {\n'+
			'float light;\n'+

			'if(uUseLight == 1) {\n'+
				'float depthFromLight = length(vpositionLight) * LinearDepthConstant;'+
				
				'vec3 pixelCoord = vpositionLightViewportRegion.xyz / vpositionLightViewportRegion.w;'+
				'vec4 textureFBLightDepth = texture2D(sampler_textureFBLightDepth, pixelCoord.xy);\n'+
				//'float depthFromTexture = unpack(textureFBLightDepth)+0.001;\n'+
				'float depthFromTexture = textureFBLightDepth.x+(0.00001*(uLightFov/2.0));\n'+
				
				
				'light =  depthFromLight > depthFromTexture ? 0.0 : 1.0;\n'+  
				
				
				'if(uLightType == 1) {\n'+ // spot
					'light *=  1.0-smoothstep(0.45, 0.5, length(pixelCoord.xy - vec2(0.5, 0.5)));\n'+
				'} else {\n'+
					'light *=  1.0-smoothstep(0.0, 0.9, length(pixelCoord.xy - vec2(0.5, 0.5)));\n'+
					'light +=  smoothstep(0.0, 0.9, length(pixelCoord.xy - vec2(0.5, 0.5)));\n'+
				'}\n'+
				
				
				'gl_FragColor = vec4(uLightColor*light, 1.0);\n'+
				//'gl_FragColor = vec4(depthFromLight,depthFromLight,depthFromLight, 1.0);\n'+ // for testing depth from light
				//'gl_FragColor = vec4(depthFromTexture,depthFromTexture,depthFromTexture, 1.0);\n'+ // for testing depth from texture
			'} else {\n'+
				'gl_FragColor = vec4(0.0,0.0,0.0,1.0);\n'+
			'}\n'+
		'}';
	_this.shader_Shadows = _this.gl.createProgram();
	_this.createShader(_this.gl, "SHADOWS", sourceVertex, sourceFragment, _this.shader_Shadows, _this.pointers_Shadows);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_Shadows = function() {
	_this = stormEngineC.stormGLContext;
	_this.u_Shadows_far = _this.gl.getUniformLocation(_this.shader_Shadows, "uFar");
	
	_this.u_Shadows_textureFBLightDepth = _this.gl.getUniformLocation(_this.shader_Shadows, "sampler_textureFBLightDepth");// RT1 rgba zdepth light[0]
	_this.u_Shadows_typeParticles = _this.gl.getUniformLocation(_this.shader_Shadows, "uTypeParticles");
	
	_this.u_Shadows_useLight = _this.gl.getUniformLocation(_this.shader_Shadows, "uUseLight");
	_this.u_Shadows_lightType = _this.gl.getUniformLocation(_this.shader_Shadows, "uLightType");
	_this.u_Shadows_lightColor = _this.gl.getUniformLocation(_this.shader_Shadows, "uLightColor");
	_this.u_Shadows_lightFov = _this.gl.getUniformLocation(_this.shader_Shadows, "uLightFov");
	

	_this.attr_Shadows_pos = _this.gl.getAttribLocation(_this.shader_Shadows, "aVertexPosition");
	_this.attr_Shadows_posX = _this.gl.getAttribLocation(_this.shader_Shadows, "aVertexPositionX");
	_this.attr_Shadows_posY = _this.gl.getAttribLocation(_this.shader_Shadows, "aVertexPositionY");
	_this.attr_Shadows_posZ = _this.gl.getAttribLocation(_this.shader_Shadows, "aVertexPositionZ");

	_this.u_Shadows_PMatrix = _this.gl.getUniformLocation(_this.shader_Shadows, "uPMatrix");
	_this.u_Shadows_PMatrixLight = _this.gl.getUniformLocation(_this.shader_Shadows, "uPMatrixLight");
	_this.u_Shadows_cameraWMatrix = _this.gl.getUniformLocation(_this.shader_Shadows, "u_cameraWMatrix");
	_this.u_Shadows_nodeWMatrix = _this.gl.getUniformLocation(_this.shader_Shadows, "u_nodeWMatrix");
	_this.u_Shadows_nodeVScale = _this.gl.getUniformLocation(_this.shader_Shadows, "u_nodeVScale");
	_this.u_Shadows_lightWMatrix = _this.gl.getUniformLocation(_this.shader_Shadows, "u_lightWMatrix");
	
	_this.u_Shadows_positionLight = _this.gl.getUniformLocation(_this.shader_Shadows, "u_positionLight");
	_this.Shader_Shadows_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_Shadows = function(currentLight) {
	
	var light =  currentLight;
	this.gl.uniform1i(this.u_Shadows_lightType, (light.type == 'sun')?0:1); // sun 0 ; spot 1   (light.type == 'sun')?0:1
	this.gl.uniform3f(this.u_Shadows_lightColor, light.color.e[0], light.color.e[1], light.color.e[2]);
    this.gl.uniform1f(this.u_Shadows_lightFov, light.getFov());
    this.gl.uniform1i(this.u_Shadows_useLight, currentLight.visibleOnContext);
	this.gl.uniform1f(this.u_Shadows_far, this.far);
	
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light' && this.nodes[n].shadows==true) { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
			for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {			
				this.gl.activeTexture(this.gl.TEXTURE0);
				
				if(light.type == 'sun') {
					this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSun); // texture framebuffer light sun
				} else {
					this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSpot); // texture framebuffer light spot
				}
				
				this.gl.uniform1i(this.u_Shadows_textureFBLightDepth, 0);
				this.gl.uniform1i(this.u_Shadows_typeParticles, 0);

				this.gl.uniformMatrix4fv(this.u_Shadows_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e); 
				this.gl.uniformMatrix4fv(this.u_Shadows_PMatrixLight, false, light.mPMatrix.transpose().e); 
				this.gl.uniformMatrix4fv(this.u_Shadows_lightWMatrix, false, light.MPOS.transpose().e);
				this.gl.uniformMatrix4fv(this.u_Shadows_nodeWMatrix, false, this.nodes[n].MPOSFrame.transpose().e);
				this.gl.uniform3f(this.u_Shadows_nodeVScale, this.nodes[n].VSCALE.e[0], this.nodes[n].VSCALE.e[1], this.nodes[n].VSCALE.e[2]); 
				this.gl.uniformMatrix4fv(this.u_Shadows_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
				this.gl.uniform3f(this.u_Shadows_positionLight, false, light.getPosition().e[0], light.getPosition().e[1], light.getPosition().e[2]);
				
				this.gl.disableVertexAttribArray(this.attr_Shadows_posX);
				this.gl.disableVertexAttribArray(this.attr_Shadows_posY);
				this.gl.disableVertexAttribArray(this.attr_Shadows_posZ);
				
				this.gl.enableVertexAttribArray(this.attr_Shadows_pos);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshVertexBuffer);
				this.gl.vertexAttribPointer(this.attr_Shadows_pos, 3, this.gl.FLOAT, false, 0, 0);
				
				if(this.nodes[n].buffersObjects[nb].nodeMeshIndexArray != undefined) {
					this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshIndexBuffer);
					this.gl.drawElements(this.gl.TRIANGLES, this.nodes[n].buffersObjects[nb].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
				} else {
					this.gl.drawArrays(this.gl.TRIANGLES, 0, this.nodes[n].buffersObjects[nb].nodeMeshVertexBufferNumItems);
				} 
				
				
				
			}
		}
	}
	for(var n = 0, f = this.particles.length; n < f; n++) {
		if(this.particles[n].visibleOnContext == true) {
			if(this.particles[n].selfshadows == true) {
				for(var nb = 0, fb = this.particles[n].buffersObjects.length; nb < fb; nb++) {			
					this.gl.activeTexture(this.gl.TEXTURE0);
					
					if(light.type == 'sun') {
						this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSun); // texture framebuffer light sun
					} else {
						this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSpot); // texture framebuffer light spot
					}
					
					this.gl.uniform1i(this.u_Shadows_textureFBLightDepth, 0);
					this.gl.uniform1i(this.u_Shadows_typeParticles, 1);
				

					this.gl.uniformMatrix4fv(this.u_Shadows_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e); 
					this.gl.uniformMatrix4fv(this.u_Shadows_PMatrixLight, false, light.mPMatrix.transpose().e); 
					this.gl.uniformMatrix4fv(this.u_Shadows_lightWMatrix, false, light.MPOS.transpose().e);
					this.gl.uniformMatrix4fv(this.u_Shadows_nodeWMatrix, false, this.particles[n].MPOS.transpose().e);
					this.gl.uniformMatrix4fv(this.u_Shadows_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
					this.gl.uniform3f(this.u_Shadows_positionLight, false, light.getPosition().e[0], light.getPosition().e[1], light.getPosition().e[2]);
					
					var buffersObject = this.particles[n].buffersObjects[nb]; 
					
					this.gl.disableVertexAttribArray(this.attr_Shadows_pos);
					
					this.gl.enableVertexAttribArray(this.attr_Shadows_posX);
					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBufferX);
					this.gl.vertexAttribPointer(this.attr_Shadows_posX, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
					
					this.gl.enableVertexAttribArray(this.attr_Shadows_posY);
					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBufferY);
					this.gl.vertexAttribPointer(this.attr_Shadows_posY, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
					
					this.gl.enableVertexAttribArray(this.attr_Shadows_posZ);
					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBufferZ);
					this.gl.vertexAttribPointer(this.attr_Shadows_posZ, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
					
					
					this.gl.drawArrays(this.gl.POINTS, 0, this.particles[n].particlesLength); 
					
					
					
				}
			}
		}
	}
};