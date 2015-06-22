/**
* Controller type follow
* @class
* @constructor
* @param {Float} camDistance Distance to pivot
*/
StormControllerFollow = function(camDistance) {
	this.controllerType = 4; // 4 StormControllerFollow
	this.g_forwardFC = 0;
	this.g_backwardFC = 0;
	this.g_strafeLeftFC = 0;
	this.g_strafeRightFC = 0;
	this.leftButton = 0;
	this.middleButton = 0;
	this.rightButton = 0;
	
	this.lastX = 0;
	this.lastY = 0;
	this.camDistance = (camDistance==undefined)?5.0:camDistance; 
	
	this.meshNode;
	this.cameraNode;
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerFollow.prototype.keyDownFC = function(event) {
	if (String.fromCharCode(event.keyCode) == "W") {
		this.g_forwardFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "S") {
		this.g_backwardFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "A") {
		this.g_strafeLeftFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "D") {
		this.g_strafeRightFC = 1;
    }
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerFollow.prototype.keyUpFC = function(event) {
	if (String.fromCharCode(event.keyCode) == "W") {
		this.g_forwardFC = 0;
		this.meshNode.body.setLineVelocity( new Vector3D(0,0,0), false );
    }
	if (String.fromCharCode(event.keyCode) == "S") {
		this.g_backwardFC = 0;
		this.meshNode.body.setLineVelocity( new Vector3D(0,0,0), false );
    }
	if (String.fromCharCode(event.keyCode) == "A") {
		this.g_strafeLeftFC = 0;
		this.meshNode.body.setLineVelocity( new Vector3D(0,0,0), false );
    }
	if (String.fromCharCode(event.keyCode) == "D") {
		this.g_strafeRightFC = 0;
		this.meshNode.body.setLineVelocity( new Vector3D(0,0,0), false );
    }
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerFollow.prototype.mouseMoveFC = function(event) {
	this.updateCameraGoalFC(event);
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerFollow.prototype.mouseDownFC = function(event) {
	if(event.button == 0) { // LEFT BUTTON
		this.leftButton = 1;
	} else if(event.button == 1) { // MIDDLE BUTTON
		this.middleButton = 1;
	} else if(event.button == 2) { // RIGHT BUTTON
		this.rightButton = 1;
	}
	this.updateCameraGoalFC(event);
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerFollow.prototype.mouseUpFC = function(event) {
	if(event.button == 0) { // LEFT BUTTON
		this.leftButton = 0;
	} else if(event.button == 1) { // MIDDLE BUTTON
		this.middleButton = 0;
	} else if(event.button == 2) { // RIGHT BUTTON
		this.rightButton = 0;
	}
	this.updateCameraGoalFC(event);
};

/**
* @type Void
* @private 
*/
StormControllerFollow.prototype.cameraSetupFC = function(cameraNode, meshNode) {
	this.cameraNode = cameraNode;
	this.meshNode = (meshNode == undefined) ? new StormNode() : meshNode;
	this.meshNode.shadows = false;
	
	if(this.meshNode != undefined) {
		this.cameraNode.nodePivot.MROTX = this.meshNode.MROTX;
		this.cameraNode.nodePivot.MROTY = this.meshNode.MROTY;
		this.cameraNode.nodePivot.MROTZ = this.meshNode.MROTZ;
		this.cameraNode.nodePivot.MROTXYZ = this.meshNode.MROTXYZ;
		
		if(this.meshNode.body != undefined) {
			this.meshNode.body.setActive();
			this.meshNode.body.moveTo(new Vector3D(this.cameraNode.nodePivot.MPOS.e[3],this.cameraNode.nodePivot.MPOS.e[7],this.cameraNode.nodePivot.MPOS.e[11],0));
			stormEngineC.stormJigLibJS.dynamicsWorld.addBody(this.meshNode.body);
			stormEngineC.stormJigLibJS.colSystem.addCollisionBody(this.meshNode.body);
		}
	} 
	
	this.lastTime = new Date().getTime();	
};

/**
* @type Void
* @private 
* @param {Float} elapsed
*/
StormControllerFollow.prototype.updateFC = function(elapsed) {
	this.cameraNode.nodePivot.setPosition(this.meshNode.getPosition());	
	
	
	var newPosGoal = this.cameraNode.nodePivot.getPosition().add(this.cameraNode.nodePivot.MROTXYZ.getForward().x(this.camDistance));
	var vecForGoal = newPosGoal.subtract(this.cameraNode.nodeGoal.getPosition());
	this.cameraNode.nodeGoal.setPosition(this.cameraNode.nodeGoal.getPosition().add(vecForGoal.x(0.5)));  
};

/**
* @type Void
* @private 
*/
StormControllerFollow.prototype.updateCameraGoalFC = function(event) {
	if(stormEngineC.defaultCamera.mouseControls == true) {
		if(this.lastX > event.screenX)
			this.cameraNode.nodePivot.setRotationY(0.01*(this.lastX - event.screenX));
		else
			this.cameraNode.nodePivot.setRotationY(-0.01*(event.screenX - this.lastX)); 
		

		if(this.lastY > event.screenY)
			this.cameraNode.nodePivot.setRotationX(0.01*(this.lastY - event.screenY));
		else
			this.cameraNode.nodePivot.setRotationX(-0.01*(event.screenY - this.lastY));
	}
	
	this.lastX = event.screenX;
	this.lastY = event.screenY;
};