/**
* Controller type car
* @class
* @constructor
* @param {Float} camDistance Distance to pivot
*/
StormControllerPlayerCar = function(camDistance) {
	this.controllerType = 3; // 3 StormControllerPlayerCar
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
	
	this.nodeCar;
	this.inactiveMouseTime = 0;
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerPlayerCar.prototype.keyDownFC = function(event) {
	if (String.fromCharCode(event.keyCode) == "W") {
		this.g_forwardFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "S") {
		this.g_backwardFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "A") {
		this.g_strafeLeftFC = 1;
		this.nodeCar.car.setSteer([0, 1], 1);
    }
	if (String.fromCharCode(event.keyCode) == "D") {
		this.g_strafeRightFC = 1;
		this.nodeCar.car.setSteer([0, 1], -1);
    }
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerPlayerCar.prototype.keyUpFC = function(event) {
	if (String.fromCharCode(event.keyCode) == "W") {
		this.g_forwardFC = 0;
    }
	if (String.fromCharCode(event.keyCode) == "S") {
		this.g_backwardFC = 0;
    }
	if (String.fromCharCode(event.keyCode) == "A") {
		this.g_strafeLeftFC = 0;
		this.nodeCar.car.setSteer([0, 1], 0);
    }
	if (String.fromCharCode(event.keyCode) == "D") {
		this.g_strafeRightFC = 0;
		this.nodeCar.car.setSteer([0, 1], 0);
    }
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerPlayerCar.prototype.mouseMoveFC = function(event) {
	this.updateCameraGoalFC(event);
	this.inactiveMouseTime = 0;
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerPlayerCar.prototype.mouseDownFC = function(event) {
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
StormControllerPlayerCar.prototype.mouseUpFC = function(event) {
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
StormControllerPlayerCar.prototype.cameraSetupFC = function(cameraNode, meshNode, nodeCar) {
	this.cameraNode = cameraNode;
	this.meshNode = (meshNode == undefined) ? new StormNode() : meshNode;
	this.meshNode.shadows = false;
	this.nodeCar = nodeCar;
	
	if(this.meshNode != undefined) {
		this.cameraNode.nodePivot.MROTX = this.meshNode.MROTX;
		this.cameraNode.nodePivot.MROTY = this.meshNode.MROTY;
		this.cameraNode.nodePivot.MROTZ = this.meshNode.MROTZ;
		this.cameraNode.nodePivot.MROTXYZ = this.meshNode.MROTXYZ;
		
		if(this.meshNode.body != undefined) {
			this.meshNode.body.setInactive();
			stormEngineC.stormJigLibJS.dynamicsWorld.removeBody(this.meshNode.body);
			stormEngineC.stormJigLibJS.colSystem.removeCollisionBody(this.meshNode.body);
		}
	} 
		
	this.cameraNode.nodePivot.setPosition(this.nodeCar.getPosition());
	this.meshNode.setPosition(this.nodeCar.getPosition());
	
	this.lastTime = new Date().getTime();
};

/**
* @type Void
* @private 
* @param {Float} elapsed
*/
StormControllerPlayerCar.prototype.updateFC = function(elapsed) {
	var maxVelocity = this.nodeCar.getMaxVelocityValue();
	var currentVel = this.nodeCar.getCurrentVelocity();
	var engineBreak = this.nodeCar.getEngineBreakValue();
	
	if(this.g_forwardFC == 1) {
		this.nodeCar.car.setHBrake(0);
		this.nodeCar.car.setAccelerate(-0.1);  
		//if(currentVel > maxVelocity) this.nodeCar.car.setAccelerate(0);
	}
	if(this.g_backwardFC == 1) {
		this.nodeCar.car.setHBrake(0);
		this.nodeCar.car.setAccelerate(0.1);
		//if(currentVel < -maxVelocity) this.nodeCar.car.setAccelerate(0);
	}
	
	if(this.g_strafeLeftFC == 1) {
	}
	if(this.g_strafeRightFC == 1) {
	}
	
	if(this.g_forwardFC == 0 && this.g_backwardFC == 0) {
		//this.nodeCar.car.setHBrake(1);
		if(currentVel > 0.1) this.nodeCar.car.setAccelerate((engineBreak/1000)*(Math.abs(currentVel)/maxVelocity));
		if(currentVel < -0.1) this.nodeCar.car.setAccelerate((-engineBreak/1000)*(Math.abs(currentVel)/maxVelocity));
	}
	if((this.g_forwardFC == 0 && this.g_backwardFC == 0) && currentVel < 0.2 && currentVel > -0.2) this.nodeCar.car.setHBrake(1);
			
	this.cameraNode.nodePivot.setPosition(this.nodeCar.getPosition());
	
	
	
	this.inactiveMouseTime++;
	if(this.inactiveMouseTime > 50) {
		var newPosGoal = this.nodeCar.getPosition().add(this.nodeCar.getForward().x(this.camDistance));
		newPosGoal = newPosGoal.add(this.nodeCar.getUp().x(2.0));
		var vecForGoal = newPosGoal.subtract(this.cameraNode.nodeGoal.getPosition());
		this.cameraNode.nodeGoal.setPosition(this.cameraNode.nodeGoal.getPosition().add(vecForGoal.x(0.5)));
	} else {
		var newPosGoal = this.cameraNode.nodePivot.getPosition().add(this.cameraNode.nodePivot.MROTXYZ.getForward().x(this.camDistance));
		var vecForGoal = newPosGoal.subtract(this.cameraNode.nodeGoal.getPosition());
		this.cameraNode.nodeGoal.setPosition(this.cameraNode.nodeGoal.getPosition().add(vecForGoal.x(0.5)));  
	}
	
	
	
	
	
	
	var timeNow = new Date().getTime();
	var elap = timeNow - this.lastTime;
	if(elap > (1000/20)) {  
		this.lastTime = timeNow;
		if(ws != undefined) {
			ws.emit('dataclient', {
				netID: stormEngineC.netID,
				WM0: this.nodeCar.MPOS.e[0],
				WM1: this.nodeCar.MPOS.e[1],
				WM2: this.nodeCar.MPOS.e[2],
				WM3: this.nodeCar.MPOS.e[3],
				WM4: this.nodeCar.MPOS.e[4],
				WM5: this.nodeCar.MPOS.e[5],
				WM6: this.nodeCar.MPOS.e[6],
				WM7: this.nodeCar.MPOS.e[7],
				WM8: this.nodeCar.MPOS.e[8],
				WM9: this.nodeCar.MPOS.e[9],
				WM10: this.nodeCar.MPOS.e[10],
				WM11: this.nodeCar.MPOS.e[11],
				WM12: this.nodeCar.MPOS.e[12],
				WM13: this.nodeCar.MPOS.e[13],
				WM14: this.nodeCar.MPOS.e[14],
				WM15: this.nodeCar.MPOS.e[15],
				RM0: this.nodeCar.MROTXYZ.e[0],
				RM1: this.nodeCar.MROTXYZ.e[1],
				RM2: this.nodeCar.MROTXYZ.e[2],
				RM3: this.nodeCar.MROTXYZ.e[3],
				RM4: this.nodeCar.MROTXYZ.e[4],
				RM5: this.nodeCar.MROTXYZ.e[5],
				RM6: this.nodeCar.MROTXYZ.e[6],
				RM7: this.nodeCar.MROTXYZ.e[7],
				RM8: this.nodeCar.MROTXYZ.e[8],
				RM9: this.nodeCar.MROTXYZ.e[9],
				RM10: this.nodeCar.MROTXYZ.e[10],
				RM11: this.nodeCar.MROTXYZ.e[11],
				RM12: this.nodeCar.MROTXYZ.e[12],
				RM13: this.nodeCar.MROTXYZ.e[13],
				RM14: this.nodeCar.MROTXYZ.e[14],
				RM15: this.nodeCar.MROTXYZ.e[15]
			});
		}
	}
};

/**
* @type Void
* @private 
*/
StormControllerPlayerCar.prototype.updateCameraGoalFC = function(event) {
	if(stormEngineC.defaultCamera.mouseControls == true) {	
		if(this.lastX > event.screenX) 
			this.cameraNode.nodePivot.setRotationY(0.01*(this.lastX - event.screenX));
		else
			this.cameraNode.nodePivot.setRotationY(-0.01*(event.screenX - this.lastX));
		
		
		if(this.lastY > event.screenY)
			this.cameraNode.nodePivot.setRotationX(0.01*(this.lastY - event.screenY));
		else
			this.cameraNode.nodePivot.setRotationX(-0.01*(event.screenY - this.lastY));
			
		
		this.lastX = event.screenX;
		this.lastY = event.screenY;
	}
};

// REWRITE JIGLIB WHEEL UPDATE 
jiglib.JWheel.prototype.update = function(dt) {
	var carMaxVelocity = (stormEngineC.defaultCamera.controller.nodeCar != undefined) ? stormEngineC.defaultCamera.controller.nodeCar.carMaxVelocity : 100;
	
	if(dt <= 0) return;
	
	var origAngVel = this._angVel;
	this._upSpeed = (this._displacement - this._lastDisplacement) / Math.max(dt, 0.000001);

	if(this._locked) {
		this._angVel = 0;
		this._torque = 0;
	} else {
		this._angVel += (this._torque * dt / this._inertia);
		this._torque = 0;

		if(((origAngVel > this._angVelForGrip) && (this._angVel < this._angVelForGrip)) || ((origAngVel < this._angVelForGrip) && (this._angVel > this._angVelForGrip))) 
			this._angVel = this._angVelForGrip;
		

		this._angVel += this._driveTorque * dt / this._inertia;
		this._driveTorque = 0;

		if(this._angVel < -carMaxVelocity) {
			this._angVel = -carMaxVelocity;
		} else if(this._angVel > carMaxVelocity) {
			this._angVel = carMaxVelocity;
		}
		this._angVel *= this._rotDamping;
		this._axisAngle += (this._angVel * dt * 180 / Math.PI);
	}
}