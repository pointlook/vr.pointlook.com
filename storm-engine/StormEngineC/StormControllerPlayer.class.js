/**
* Controller type player
* @class
* @constructor
* @param {Float} camDistance Distance to target
*/
StormControllerPlayer = function(camDistance) {
	this.controllerType = 2; // 2 StormControllerPlayer
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
StormControllerPlayer.prototype.keyDownFC = function(event) {
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
StormControllerPlayer.prototype.keyUpFC = function(event) {
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
StormControllerPlayer.prototype.mouseMoveFC = function(event) {
	this.updateCameraGoalFC(event);
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerPlayer.prototype.mouseDownFC = function(event) {
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
StormControllerPlayer.prototype.mouseUpFC = function(event) {
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
StormControllerPlayer.prototype.cameraSetupFC = function(cameraNode, meshNode) {
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
StormControllerPlayer.prototype.updateFC = function(elapsed) {
	if(this.meshNode.body != undefined && this.meshNode.body._collideBodies.length > 0) {
		if(this.g_forwardFC == 1) {
			var dir = this.meshNode.getForward().x(-10.0);
			this.meshNode.body.setLineVelocity( new Vector3D( dir.e[0],dir.e[1],dir.e[2]));
		}
		if(this.g_backwardFC == 1) {
			var dir = this.meshNode.getForward().x(10.0);
			this.meshNode.body.setLineVelocity( new Vector3D( dir.e[0],dir.e[1],dir.e[2]));
		}
		if(this.g_strafeLeftFC == 1) {
			var dir = this.meshNode.getLeft().x(-10.0);
			this.meshNode.body.setLineVelocity( new Vector3D( dir.e[0],dir.e[1],dir.e[2]));
		}
		if(this.g_strafeRightFC == 1) {
			var dir = this.meshNode.getLeft().x(10.0);
			this.meshNode.body.setLineVelocity( new Vector3D( dir.e[0],dir.e[1],dir.e[2]));
		}	
	}	
	
	this.cameraNode.nodePivot.setPosition(this.meshNode.getPosition());

	
	var newPosGoal = this.cameraNode.nodePivot.getPosition().add(this.cameraNode.nodePivot.MROTXYZ.getForward().x(this.camDistance));
	var vecForGoal = newPosGoal.subtract(this.cameraNode.nodeGoal.getPosition());
	this.cameraNode.nodeGoal.setPosition(this.cameraNode.nodeGoal.getPosition().add(vecForGoal.x(0.5)));   
	
	if(this.meshNode != undefined) {
		this.meshNode.setRotationX(0.0, false);
		this.meshNode.setRotationZ(0.0, false);
	}
	
	
	
	
	var timeNow = new Date().getTime();
	var elap = timeNow - this.lastTime;
	if(elap > (1000/20)) {  
		this.lastTime = timeNow;
		if(ws != undefined) {
			ws.emit('dataclient', {
				netID: stormEngineC.netID,
				WM0: this.meshNode.MPOS.e[0],
				WM1: this.meshNode.MPOS.e[1],
				WM2: this.meshNode.MPOS.e[2],
				WM3: this.meshNode.MPOS.e[3],
				WM4: this.meshNode.MPOS.e[4],
				WM5: this.meshNode.MPOS.e[5],
				WM6: this.meshNode.MPOS.e[6],
				WM7: this.meshNode.MPOS.e[7],
				WM8: this.meshNode.MPOS.e[8],
				WM9: this.meshNode.MPOS.e[9],
				WM10: this.meshNode.MPOS.e[10],
				WM11: this.meshNode.MPOS.e[11],
				WM12: this.meshNode.MPOS.e[12],
				WM13: this.meshNode.MPOS.e[13],
				WM14: this.meshNode.MPOS.e[14],
				WM15: this.meshNode.MPOS.e[15],
				RM0: this.meshNode.MROTXYZ.e[0],
				RM1: this.meshNode.MROTXYZ.e[1],
				RM2: this.meshNode.MROTXYZ.e[2],
				RM3: this.meshNode.MROTXYZ.e[3],
				RM4: this.meshNode.MROTXYZ.e[4],
				RM5: this.meshNode.MROTXYZ.e[5],
				RM6: this.meshNode.MROTXYZ.e[6],
				RM7: this.meshNode.MROTXYZ.e[7],
				RM8: this.meshNode.MROTXYZ.e[8],
				RM9: this.meshNode.MROTXYZ.e[9],
				RM10: this.meshNode.MROTXYZ.e[10],
				RM11: this.meshNode.MROTXYZ.e[11],
				RM12: this.meshNode.MROTXYZ.e[12],
				RM13: this.meshNode.MROTXYZ.e[13],
				RM14: this.meshNode.MROTXYZ.e[14],
				RM15: this.meshNode.MROTXYZ.e[15]
			});
		}
	}
};

/**
* @type Void
* @private 
*/
StormControllerPlayer.prototype.updateCameraGoalFC = function(event) {
	if(stormEngineC.defaultCamera.mouseControls == true) {
		var factorRot = 0.01;
		if(this.lastX > event.screenX) {
			this.cameraNode.nodePivot.setRotationY((this.lastX - event.screenX)*factorRot);  
			 
			if(this.meshNode != undefined) this.meshNode.setRotationY((this.lastX - event.screenX)*factorRot);
		} else {
			this.cameraNode.nodePivot.setRotationY(-(event.screenX - this.lastX)*factorRot);
			
			if(this.meshNode != undefined) this.meshNode.setRotationY(-(event.screenX - this.lastX)*factorRot);
		}
		
		if(this.lastY > event.screenY) 
			this.cameraNode.nodePivot.setRotationX((this.lastY - event.screenY)*factorRot);
		else
			this.cameraNode.nodePivot.setRotationX(-(event.screenY - this.lastY)*factorRot);
	}
	
	this.lastX = event.screenX;
	this.lastY = event.screenY;
};