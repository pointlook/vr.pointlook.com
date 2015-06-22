/*----------------------------------------------------------------------------------------
     									BACKGROUND
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_BG = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = 	_this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aTextureCoord;\n'+
		
		'uniform mat4 uPMatrix;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 u_node;\n'+
		
		'varying vec3 vTextureCoord;\n'+ 
		
		'void main(void) {\n'+
			'gl_Position = uPMatrix * u_cameraWMatrix*u_node*vec4(aVertexPosition, 1.0);\n'+
			
			'vTextureCoord = aTextureCoord;\n'+
			
		'}';
	var sourceFragment = _this.precision+
		
		'varying vec3 vTextureCoord;\n'+
		
		'uniform sampler2D sampler_2D;\n'+
		
		'void main(void) {\n'+
			
			'vec4 texture = texture2D(sampler_2D, vTextureCoord.xy);\n'+  
			
			'gl_FragColor = vec4(texture.r, texture.g, texture.b, texture.a);\n'+
		'}';
	_this.shader_BG = _this.gl.createProgram();
	_this.createShader(_this.gl, "BG", sourceVertex, sourceFragment, _this.shader_BG, _this.pointers_BG);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_BG = function() {
	_this = stormEngineC.stormGLContext;
	_this.u_BG_PMatrix = _this.gl.getUniformLocation(_this.shader_BG, "uPMatrix");
	_this.u_BG_cameraWMatrix = _this.gl.getUniformLocation(_this.shader_BG, "u_cameraWMatrix");
	_this.u_BG_node = _this.gl.getUniformLocation(_this.shader_BG, "u_node");
	
	_this.nodeEnvironment = new StormNode(); 
	var mesh = new StormMesh();
	mesh.loadSphere({radius:300,segments:4});

	_this.vertexBuffer_BG = _this.gl.createBuffer();
	_this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, _this.vertexBuffer_BG);
	_this.gl.bufferData(_this.gl.ARRAY_BUFFER, new Float32Array(mesh.vertexArray), _this.gl.STATIC_DRAW);
	
	_this.textureBuffer_BG = _this.gl.createBuffer();
	_this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, _this.textureBuffer_BG);
	_this.gl.bufferData(_this.gl.ARRAY_BUFFER, new Float32Array(mesh.textureArray), _this.gl.STATIC_DRAW);
	
	_this.indexBuffer_BGLength = mesh.indexArray.length;
	_this.indexBuffer_BG = _this.gl.createBuffer();
	_this.gl.bindBuffer(_this.gl.ELEMENT_ARRAY_BUFFER, _this.indexBuffer_BG);
	_this.gl.bufferData(_this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indexArray), _this.gl.STATIC_DRAW);
	
	_this.attr_BG_pos = _this.gl.getAttribLocation(_this.shader_BG, "aVertexPosition");
	_this.attr_BG_tex = _this.gl.getAttribLocation(_this.shader_BG, "aTextureCoord");
	_this.sampler_BG_2D = _this.gl.getUniformLocation(_this.shader_BG, "sampler_2D");
	_this.Shader_BG_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_BG = function() {
	this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	} else {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer); 
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureObject_DOF, 0);
	}
	//this.gl.enable(this.gl.BLEND);
	//this.gl.blendFunc(this.gl.ONE, this.gl.ONE); 
	
	this.gl.useProgram(this.shader_BG);

	this.gl.uniformMatrix4fv(this.u_BG_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_BG_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
	this.nodeEnvironment.setPosition(stormEngineC.defaultCamera.nodePivot.getPosition());  
	this.gl.uniformMatrix4fv(this.u_BG_node, false, this.nodeEnvironment.MPOS.transpose().e);
	
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.environmentMap);   
	this.gl.uniform1i(this.sampler_BG_2D, 0);
	
	this.gl.enableVertexAttribArray(this.attr_BG_pos);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_BG);
	this.gl.vertexAttribPointer(this.attr_BG_pos, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.enableVertexAttribArray(this.attr_BG_tex);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer_BG);
	this.gl.vertexAttribPointer(this.attr_BG_tex, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_BG); 
	this.gl.drawElements(this.gl.TRIANGLES, this.indexBuffer_BGLength, this.gl.UNSIGNED_SHORT, 0);
	
	//this.gl.disable(this.gl.BLEND);
};