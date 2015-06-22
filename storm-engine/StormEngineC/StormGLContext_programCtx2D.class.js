/*----------------------------------------------------------------------------------------
     									CTX2D
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Ctx2D = function() {
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
		
		'varying vec2 vTextureCoord;\n'+
		
		'uniform sampler2D sampler_2D;\n'+
		
		'void main(void) {\n'+
			'vec4 texture = texture2D(sampler_2D, vTextureCoord.xy);\n'+
			
			'gl_FragColor = vec4(texture.r, texture.g, texture.b, texture.a);\n'+
		'}';
	_this.shader_Ctx2D = _this.gl.createProgram();
	_this.createShader(_this.gl, "CTX2D", sourceVertex, sourceFragment, _this.shader_Ctx2D, _this.pointers_Ctx2D);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_Ctx2D = function() {	
	_this = stormEngineC.stormGLContext;
	_this.attr_Ctx2D_pos = _this.gl.getAttribLocation(_this.shader_Ctx2D, "aVertexPosition");
	_this.attr_Ctx2D_tex = _this.gl.getAttribLocation(_this.shader_Ctx2D, "aTextureCoord");
	_this.sampler_Ctx2D_2D = _this.gl.getUniformLocation(_this.shader_Ctx2D, "sampler_2D");
	_this.Shader_Ctx2D_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_Ctx2D = function() {	
	this.gl.enable(this.gl.BLEND);
	this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA); 
	this.gl.useProgram(this.shader_Ctx2D);

	
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureObject_Ctx2D);   
	this.gl.uniform1i(this.sampler_Ctx2D_2D, 0);
	
	
	this.gl.enableVertexAttribArray(this.attr_Ctx2D_pos);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_QUAD);
	this.gl.vertexAttribPointer(this.attr_Ctx2D_pos, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.enableVertexAttribArray(this.attr_Ctx2D_tex);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer_QUAD);
	this.gl.vertexAttribPointer(this.attr_Ctx2D_tex, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_QUAD);
	this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
	
	
	this.gl.disable(this.gl.BLEND);
};