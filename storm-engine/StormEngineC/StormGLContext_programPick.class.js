/*----------------------------------------------------------------------------------------
     									PICK
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Pick = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = _this.precision+
		'attribute vec3 aVertexPosition;\n'+
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'uniform float uNodeId;\n'+
		'uniform int uIsTransform;\n'+
		'uniform mat4 u_matrixNodeTranform;\n'+
		
		'uniform float uFar;\n'+
		'float LinearDepthConstant = 1.0/uFar;'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			'if(uIsTransform == 0) {'+ // nodes
				'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * vec4(vp, 1.0);\n'+
			'} else {'+ // overlay transforms
				'vec4 scaleVec = u_cameraWMatrix * u_nodeWMatrix * u_matrixNodeTranform * vec4(vp, 1.0);\n'+
				'float scale = (length(scaleVec) * LinearDepthConstant)*50.0;'+
				'vec4 pos;'+
				'if(uNodeId == 0.1 || uNodeId == 0.2 || uNodeId == 0.3 || uNodeId == 0.7 || uNodeId == 0.8 || uNodeId == 0.9)'+
					'pos = vec4(0.0,-0.5,0.0,1.0)+vec4(vp, 1.0);'+
				'else '+
					'pos = vec4(vp, 1.0);'+
				'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * u_matrixNodeTranform * vec4(vec3(pos.x*scale,pos.y*scale,pos.z*scale), 1.0);\n'+
			'}'+
		'}';
	var sourceFragment = _this.precision+
		'uniform float uNodeId;\n'+
		'uniform float uCurrentMousePosX;\n'+
		'uniform float uCurrentMousePosY;\n'+
		'uniform int uIsTransform;\n'+
		
		'void main(void) {\n'+// gl_FragCoord.x muestra de 0.0 a width (Ej: 0 a 512.0)
			//'if( (uCurrentMousePosX < (gl_FragCoord.x+1.0) && uCurrentMousePosX > (gl_FragCoord.x-1.0)) &&'+
			//	'(uCurrentMousePosY < (gl_FragCoord.y+1.0) && uCurrentMousePosY > (gl_FragCoord.y-1.0)) ) {\n'+
				'if(uIsTransform == 0) {'+
					'gl_FragColor = vec4(uNodeId+0.001, 0.0, 0.0, 1.0);\n'+
				'} else {'+
					'gl_FragColor = vec4(0.0, uNodeId, 0.0, 1.0);\n'+
				'}'+
			//'}\n'+
		'}';
	_this.shader_Pick = _this.gl.createProgram();
	_this.createShader(_this.gl, "PICK", sourceVertex, sourceFragment, _this.shader_Pick, _this.pointers_Pick);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_Pick = function() {
	_this = stormEngineC.stormGLContext;
	_this.attr_Pick_pos = _this.gl.getAttribLocation(_this.shader_Pick, "aVertexPosition");
	
	_this.u_Pick_nodeId = _this.gl.getUniformLocation(_this.shader_Pick, "uNodeId");
	_this.u_Pick_isTransform = _this.gl.getUniformLocation(_this.shader_Pick, "uIsTransform");
	_this.u_Pick_currentMousePosX = _this.gl.getUniformLocation(_this.shader_Pick, "uCurrentMousePosX");
	_this.u_Pick_currentMousePosY = _this.gl.getUniformLocation(_this.shader_Pick, "uCurrentMousePosY");
	
	_this.u_Pick_far = _this.gl.getUniformLocation(_this.shader_Pick, "uFar");
	
	_this.u_Pick_PMatrix = _this.gl.getUniformLocation(_this.shader_Pick, "uPMatrix");
	_this.u_Pick_cameraWMatrix = _this.gl.getUniformLocation(_this.shader_Pick, "u_cameraWMatrix");
	_this.u_Pick_nodeWMatrix = _this.gl.getUniformLocation(_this.shader_Pick, "u_nodeWMatrix");
	_this.u_Pick_nodeVScale = _this.gl.getUniformLocation(_this.shader_Pick, "u_nodeVScale");
	_this.u_Pick_matrixNodeTranform = _this.gl.getUniformLocation(_this.shader_Pick, "u_matrixNodeTranform");
	_this.Shader_Pick_READY = true;
};



/** @private */
StormGLContext.prototype.queryNodePick = function() {
	this.gl.enable(this.gl.BLEND);
	this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA); 
	this.gl.useProgram(this.shader_Pick);
	
	this.gl.uniform1f(this.u_Pick_far, this.far);
	//alert(node.idNum/this.nodes.length);
	
	//alert((stormEngineC.mousePosX/this.viewportWidth)); 
	this.gl.uniform1f(this.u_Pick_currentMousePosX, stormEngineC.mousePosX);  
	this.gl.uniform1f(this.u_Pick_currentMousePosY, (stormEngineC.$.height()-(stormEngineC.mousePosY))); 
	
	this.gl.uniformMatrix4fv(this.u_Pick_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_Pick_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
	
	
	if(stormEngineC.draggingNodeNow === false && this.queryNodePickType == 1)
		this.queryNodeMouseDown();
	else if(this.queryNodePickType == 2)
		this.queryNodeMouseUp();  
	this.queryNodePickType = 0; 	
	if(stormEngineC.editMode) 
		this.queryNodeMouseMove();  
		
	this.gl.disable(this.gl.BLEND);
};
/** @private */
StormGLContext.prototype.queryNodeMouseDown = function() {
	this.makeQuerySelect = false;
	this.queryDraw(this.nodes);
	if(this.makeQuerySelect == true) {
		if(stormEngineC.stormGLContext.transformOverlaySelected == 0) {
			var selectedNode = this.querySelect(this.nodes);
			if(selectedNode !== false && selectedNode instanceof StormNode) {
				if(selectedNode.isDraggable) {
					stormEngineC.selectNode(selectedNode);
					selectedNode.bodyActive(false);
					selectedNode.setPosition(selectedNode.getPosition());  
					stormEngineC.draggingNodeNow = selectedNode;
				}
				if(selectedNode.onmousedownFunction != undefined) selectedNode.onmousedownFunction();
			}
		}
	} 
	
	this.makeQuerySelect = false;
	this.queryDraw(this.polarityPoints);
	if(this.makeQuerySelect == true) {
		if(stormEngineC.stormGLContext.transformOverlaySelected == 0) {
			var selectedNode = this.querySelect(this.polarityPoints);
			if(selectedNode !== false && selectedNode instanceof StormPolarityPoint) {
				if(selectedNode.isDraggable) {
					stormEngineC.selectNode(selectedNode);
					selectedNode.bodyActive(false);
					selectedNode.setPosition(selectedNode.getPosition());  
					stormEngineC.draggingNodeNow = selectedNode;
				}
				if(selectedNode.onmousedownFunction != undefined) selectedNode.onmousedownFunction();
			}
		}
	} 
};

/** @private */
StormGLContext.prototype.queryNodeMouseMove = function() {
	this.makeQuerySelect = false;
	this.queryDraw(this.nodes);
	if(this.makeQuerySelect == true)
		var selectedNode = this.querySelect(this.nodes);
		
	this.makeQuerySelect = false;
	this.queryDraw(this.polarityPoints);
	if(this.makeQuerySelect == true)
		var selectedNode = this.querySelect(this.polarityPoints);
};

/** @private */
StormGLContext.prototype.queryNodeMouseUp = function() {
	if(stormEngineC.draggingNodeNow !== false) {
		stormEngineC.getSelectedNode().bodyActive(true);
		var dir = stormEngineC.utils.getDraggingScreenVector();
		stormEngineC.getSelectedNode().bodyApplyImpulse({vector: dir.x(100), milis: 10});
		stormEngineC.draggingNodeNow = false;
	}
	
	
	this.makeQuerySelect = false;
	this.queryDraw(this.nodes); 
	if(this.makeQuerySelect == true) {
		var selectedNode = this.querySelect(this.nodes);
		if(selectedNode !== false) {
			if(	stormEngineC.mousePosX == stormEngineC.oldMousePosClickX &&
				stormEngineC.mousePosY == stormEngineC.oldMousePosClickY) {
					stormEngineC.selectNode(selectedNode);
			}
			if(selectedNode.onmouseupFunction != undefined) selectedNode.onmouseupFunction();
		}
	}
	
	this.makeQuerySelect = false;
	this.queryDraw(this.polarityPoints); 
	if(this.makeQuerySelect == true) {
		var selectedNode = this.querySelect(this.polarityPoints);
		if(selectedNode !== false) {
			if(	stormEngineC.mousePosX == stormEngineC.oldMousePosClickX &&
				stormEngineC.mousePosY == stormEngineC.oldMousePosClickY) {
					stormEngineC.selectNode(selectedNode);
			}
			if(selectedNode.onmouseupFunction != undefined) selectedNode.onmouseupFunction();
		}
	}
};
/** @private */
StormGLContext.prototype.queryDraw = function(nodes) { 
	for(var n = 0, f = nodes.length; n < f; n++) { 
		if(	nodes[n].visibleOnContext && nodes[n].objectType != 'light') {
			var node = nodes[n];
			this.gl.uniform1f(this.u_Pick_nodeId, ((node.idNum+1)/nodes.length));
			for(var nb = 0, fb = node.buffersObjects.length; nb < fb; nb++) {	
				this.makeQuerySelect = true;
				
				this.gl.uniform1i(this.u_Pick_isTransform, 0); // nodes
				
				this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOSFrame.transpose().e); 
				this.gl.uniform3f(this.u_Pick_nodeVScale, node.VSCALE.e[0], node.VSCALE.e[1], node.VSCALE.e[2]);   
				
				
				this.gl.enableVertexAttribArray(this.attr_Pick_pos);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, node.buffersObjects[nb].nodeMeshVertexBuffer);
				this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
					
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, node.buffersObjects[nb].nodeMeshIndexBuffer);
				
				this.gl.drawElements(this.gl.TRIANGLES, node.buffersObjects[nb].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
			}
		}
	}
	
	for(var n = 0, f = nodes.length; n < f; n++) { 
		if(	nodes[n].visibleOnContext && nodes[n].objectType != 'light') {
			var node = nodes[n];
			this.gl.uniform1f(this.u_Pick_nodeId, ((node.idNum+1)/nodes.length));
			if(stormEngineC.editMode && stormEngineC.getSelectedNode() != undefined && stormEngineC.getSelectedNode().idNum == this.nodes[n].idNum) {
				for(var nb = 0, fb = node.buffersObjects.length; nb < fb; nb++) {	
					this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
					this.gl.uniform1i(this.u_Pick_isTransform, 1); // overlay transforms 
					
					if(stormEngineC.defaultTransformMode == 0) // world
						this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOS.transpose().e); 
					else // local
						this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOSFrame.transpose().e); 
						
					// (detector)
					if(stormEngineC.defaultTransform == 0) {
						// overlay pos X
						this.gl.uniform1f(this.u_Pick_nodeId, 0.1); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayPosX.MPOS.x(this.nodeOverlayPosX.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayPosX.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayPosX.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayPosX.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay pos Y
						this.gl.uniform1f(this.u_Pick_nodeId, 0.2); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayPosY.MPOS.x(this.nodeOverlayPosY.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayPosY.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayPosY.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayPosY.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay pos Z
						this.gl.uniform1f(this.u_Pick_nodeId, 0.3); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayPosZ.MPOS.x(this.nodeOverlayPosZ.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayPosZ.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayPosZ.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayPosZ.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
					} else if(stormEngineC.defaultTransform == 1) {
						// overlay rot X
						this.gl.uniform1f(this.u_Pick_nodeId, 0.4); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayRotDetX.MPOS.x(this.nodeOverlayRotDetX.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayRotDetX.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayRotDetX.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayRotDetX.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay rot Y
						this.gl.uniform1f(this.u_Pick_nodeId, 0.5); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayRotDetY.MPOS.x(this.nodeOverlayRotDetY.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayRotDetY.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayRotDetY.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayRotDetY.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay rot Z
						this.gl.uniform1f(this.u_Pick_nodeId, 0.6); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayRotDetZ.MPOS.x(this.nodeOverlayRotDetZ.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayRotDetZ.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayRotDetZ.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayRotDetZ.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
					} else if(stormEngineC.defaultTransform == 2 && stormEngineC.defaultTransformMode == 1) {
						// overlay scale X
						this.gl.uniform1f(this.u_Pick_nodeId, 0.7); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayScaDetX.MPOS.x(this.nodeOverlayScaDetX.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayScaDetX.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayScaDetX.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayScaDetX.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay scale Y
						this.gl.uniform1f(this.u_Pick_nodeId, 0.8); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayScaDetY.MPOS.x(this.nodeOverlayScaDetY.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayScaDetY.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayScaDetY.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayScaDetY.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay scale Z
						this.gl.uniform1f(this.u_Pick_nodeId, 0.9); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayScaDetZ.MPOS.x(this.nodeOverlayScaDetZ.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayScaDetZ.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayScaDetZ.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayScaDetZ.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
					}
				}
			}
		}
	}
};
/** @private */
StormGLContext.prototype.querySelect = function(nodes) {
	if(stormEngineC.draggingNodeNow === false) {
		var arrayPick = new Uint8Array(4);  
		this.gl.readPixels(stormEngineC.mousePosX, (stormEngineC.$.height()-(stormEngineC.mousePosY)), 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, arrayPick);
		if(arrayPick[0] != 0 || arrayPick[1] != 0) {
			var nodeIdNum = Math.floor(parseFloat(arrayPick[0]/255)*(nodes.length-1));
			var selectedNode = nodes[nodeIdNum];  
			var transformNum = parseFloat(arrayPick[1]/255).toFixed(1);
			
			if(transformNum == 0.1) {  
				stormEngineC.stormGLContext.transformOverlaySelected = 1; // mouse over transform pos x 
				return false;
			} else if(transformNum == 0.2) {
				stormEngineC.stormGLContext.transformOverlaySelected = 2; // mouse over transform pos y
				return false;
			} else if(transformNum == 0.3) {
				stormEngineC.stormGLContext.transformOverlaySelected = 3; // mouse over transform pos z
				return false;
			} else if(transformNum == 0.4) {
				stormEngineC.stormGLContext.transformOverlaySelected = 4; // mouse over transform rot x
				return false;
			} else if(transformNum == 0.5) {
				stormEngineC.stormGLContext.transformOverlaySelected = 5; // mouse over transform rot y
				return false;
			} else if(transformNum == 0.6) {
				stormEngineC.stormGLContext.transformOverlaySelected = 6; // mouse over transform rot z
				return false;
			} else if(transformNum == 0.7) {
				stormEngineC.stormGLContext.transformOverlaySelected = 7; // mouse over transform sca x
				return false;
			} else if(transformNum == 0.8) {
				stormEngineC.stormGLContext.transformOverlaySelected = 8; // mouse over transform sca y
				return false;
			} else if(transformNum == 0.9) {
				stormEngineC.stormGLContext.transformOverlaySelected = 9; // mouse over transform sca z
				return false;
			} else if(selectedNode != undefined) {
				stormEngineC.stormGLContext.transformOverlaySelected = 0;
				return selectedNode;
			} else {
				stormEngineC.stormGLContext.transformOverlaySelected = 0;
				return false; 
			}
		} else {
			stormEngineC.stormGLContext.transformOverlaySelected = 0;  
			return false;
		}
	}
};