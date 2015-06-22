/*----------------------------------------------------------------------------------------
										LINES
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Lines = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = 	_this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aVertexLocPosition;\n'+
		
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
			
		'varying vec3 vVertexLocPosition;\n'+
		
		'void main(void) {\n'+
			'gl_Position = uPMatrix * u_cameraWMatrix * vec4(aVertexPosition, 1.0);\n'+
			
			'vVertexLocPosition = aVertexLocPosition;\n'+
		'}';
	var sourceFragment = _this.precision+
		
		'varying vec3 vVertexLocPosition;\n'+
		
		'void main(void) {\n'+
			'gl_FragColor = vec4(vec3(vVertexLocPosition[0], vVertexLocPosition[1], vVertexLocPosition[2]), 1.0);\n'+
		'}';
	_this.shader_Lines = _this.gl.createProgram();
	_this.createShader(_this.gl, "LINES", sourceVertex, sourceFragment, _this.shader_Lines, _this.pointers_Lines);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_Lines = function() {
	_this = stormEngineC.stormGLContext;
	_this.attr_Lines_pos = _this.gl.getAttribLocation(_this.shader_Lines, "aVertexPosition");
	_this.attr_Lines_posLoc = _this.gl.getAttribLocation(_this.shader_Lines, "aVertexLocPosition");
	
	
	_this.u_Lines_PMatrix = _this.gl.getUniformLocation(_this.shader_Lines, "uPMatrix");
	_this.u_Lines_cameraWMatrix = _this.gl.getUniformLocation(_this.shader_Lines, "u_cameraWMatrix");
	_this.Shader_Lines_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_Lines = function() {
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	} else {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer); 
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureObject_DOF, 0);
		//this.gl.enable(this.gl.BLEND);
		//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
	}
	this.gl.useProgram(this.shader_Lines);
	
	this.gl.uniformMatrix4fv(this.u_Lines_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_Lines_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
	
	for(var n = 0, f = this.lines.length; n < f; n++) {
		this.gl.enableVertexAttribArray(this.attr_Lines_pos);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lines[n].vertexBuffer);
		this.gl.vertexAttribPointer(this.attr_Lines_pos, 3, this.gl.FLOAT, false, 0, 0);
		
		this.gl.enableVertexAttribArray(this.attr_Lines_posLoc);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lines[n].vertexLocBuffer);
		this.gl.vertexAttribPointer(this.attr_Lines_posLoc, 3, this.gl.FLOAT, false, 0, 0);
	
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.lines[n].indexBuffer);
		
		
		//this.gl.drawArrays(this.gl.LINES, 0, this.lines.length*2);
		this.gl.drawElements(this.gl.LINES, 2, this.gl.UNSIGNED_SHORT, 0);
	}
	
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
	} else {
		//this.gl.disable(this.gl.BLEND);
	}
};