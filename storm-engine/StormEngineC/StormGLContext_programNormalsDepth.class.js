/*----------------------------------------------------------------------------------------
     									RGB NORMALS ALPHA DEPTH
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Normals = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = 	_this.precision+
		'attribute vec3 aVertexPosition;\n'+ 
		'attribute vec3 aVertexNormal;\n'+
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'varying vec4 vposition;\n'+
		'varying vec4 vNormal;\n'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			'vposition = u_cameraWMatrix * u_nodeWMatrix * vec4(vp, 1.0);\n'+
			'gl_Position = uPMatrix * vposition;\n'+
			
			'vNormal = vec4(aVertexNormal, 1.0);\n'+
		'}';
	var sourceFragment = _this.precision+
		'uniform float uFar;\n'+
		
		'varying vec4 vposition;\n'+
		'varying vec4 vNormal;\n'+
		
		'float LinearDepthConstant = 1.0/uFar;'+ 
		
		'void main(void) {\n'+
			'float linearDepth = length(vposition) * LinearDepthConstant;'+
			'gl_FragColor = vec4((vNormal.r+1.0)/2.0,(vNormal.g+1.0)/2.0,(vNormal.b+1.0)/2.0, linearDepth);\n'+
		'}';
	_this.shader_Normals = _this.gl.createProgram();
	_this.createShader(_this.gl, "NORMALS", sourceVertex, sourceFragment, _this.shader_Normals, stormEngineC.stormGLContext.pointers_Normals);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_Normals = function() {
	_this = stormEngineC.stormGLContext;
	_this.attr_Normals_pos = _this.gl.getAttribLocation(_this.shader_Normals, "aVertexPosition");
	_this.attr_Normals_normal = _this.gl.getAttribLocation(_this.shader_Normals, "aVertexNormal");
	
	_this.u_Normals_far = _this.gl.getUniformLocation(_this.shader_Normals, "uFar");
	
	_this.u_Normals_PMatrix = _this.gl.getUniformLocation(_this.shader_Normals, "uPMatrix");
	_this.u_Normals_cameraWMatrix = _this.gl.getUniformLocation(_this.shader_Normals, "u_cameraWMatrix");
	_this.u_Normals_nodeWMatrix = _this.gl.getUniformLocation(_this.shader_Normals, "u_nodeWMatrix");
	_this.u_Normals_nodeVScale = _this.gl.getUniformLocation(_this.shader_Normals, "u_nodeVScale");
	_this.Shader_Normals_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_Normals = function() {
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.view_Normals ? null : this.fBuffer);
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_Normals, 0);
	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	this.gl.useProgram(this.shader_Normals);
	
	this.gl.uniform1f(this.u_Normals_far, this.far);
	
	for(var n = 0, f = this.nodes.length; n < f; n++) { 
		if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light') { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
			for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {	
				this.gl.uniformMatrix4fv(this.u_Normals_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
				this.gl.uniformMatrix4fv(this.u_Normals_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
				this.gl.uniformMatrix4fv(this.u_Normals_nodeWMatrix, false, this.nodes[n].MPOSFrame.transpose().e); 
				this.gl.uniform3f(this.u_Normals_nodeVScale, this.nodes[n].VSCALE.e[0], this.nodes[n].VSCALE.e[1], this.nodes[n].VSCALE.e[2]);   
				
				this.gl.enableVertexAttribArray(this.attr_Normals_pos);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshVertexBuffer);
				this.gl.vertexAttribPointer(this.attr_Normals_pos, 3, this.gl.FLOAT, false, 0, 0);
				if(this.nodes[n].buffersObjects[nb].nodeMeshNormalArray != undefined) {
					this.gl.enableVertexAttribArray(this.attr_Normals_normal);
					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshNormalBuffer);
					this.gl.vertexAttribPointer(this.attr_Normals_normal, 3, this.gl.FLOAT, false, 0, 0);
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