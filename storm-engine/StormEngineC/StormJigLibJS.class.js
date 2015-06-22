/**
* @class
* @constructor
*/
StormJigLibJS = function() {
	this.dynamicsWorld;
	var t0=new Date().getTime(),ta=0,oi=0;
	this.nodes = stormEngineC.nodes;
	this.nodesCam = stormEngineC.nodesCam;
};

/**
 * @private 
 */
StormJigLibJS.prototype.createJigLibWorld = function() {
	this.dynamicsWorld = jiglib.PhysicsSystem.getInstance();
	this.dynamicsWorld.setCollisionSystem(false);
	//this.dynamicsWorld.setCollisionSystem(true,-100,-100,-100,20,20,20,200,200,200);
	this.colSystem = this.dynamicsWorld.getCollisionSystem();
	

	this.dynamicsWorld.setGravity(new Vector3D( 0, 0.0, 0, 0 )); 
	//this.dynamicsWorld.setSolverType("ACCUMULATED"); // FAST, NORMAL, ACCUMULATED
	jiglib.JConfig.solverType =  "ACCUMULATED"; // ACCUMULATED  can be one of FAST NORMAL or ACCUMULATED
	jiglib.JConfig.rotationType =  "DEGREES"; // DEGREES  can be one of DEGREES or RADIANS
	jiglib.JConfig.doShockStep =  false; // false. whether to perform the shock step (helps with stacking)
	jiglib.JConfig.allowedPenetration =  0.01; // 0.01 the amount of penetration to be permitted
	jiglib.JConfig.collToll =  0.01; // 0.05 collision detection tolerance
	jiglib.JConfig.velThreshold =  0.5; // 0.5 the line velocity threshold for freezing
	jiglib.JConfig.angVelThreshold =  0.5; // 0.5 the angle velocity threshold for freezing
	jiglib.JConfig.posThreshold =  0.2; // 0.2 the threshold for detecting position changes during deactivation
	jiglib.JConfig.orientThreshold =  0.2; // 0.2 the threshold for detecting orientation changes during deactivation
	jiglib.JConfig.deactivationTime =  10000000000000.5; // 0.5 how long it takes to go from active to frozen when stationary
	jiglib.JConfig.numPenetrationRelaxationTimesteps =  1; // 10 the number of timesteps over which to resolve penetration
	jiglib.JConfig.numCollisionIterations =  1; // 1 the number of collision iterations 
	jiglib.JConfig.numContactIterations =  2; // 2 the number of contact iterations
	jiglib.JConfig.numConstraintIterations =  2; // 2 number of constraint iterations
};

/**
 * @private 
 */
StormJigLibJS.prototype.update = function(elapsed) {
	if(elapsed > 0) this.dynamicsWorld.integrate(0.04);  

	// NODOS
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].constraint != undefined) {
			this.nodes[n].constraint.set_worldPosition(new Vector3D( this.nodes[n].constraintParentNode.getPosition().e[0], this.nodes[n].constraintParentNode.getPosition().e[1], this.nodes[n].constraintParentNode.getPosition().e[2], 0 ));
		}
		if(this.nodes[n].body != undefined) {
			var x = this.nodes[n].body.get_currentState().position.x;
			var y = this.nodes[n].body.get_currentState().position.y;
			var z = this.nodes[n].body.get_currentState().position.z;
			this.nodes[n].MPOS.setPosition($V3([x,y,z]));
			
			var b = this.nodes[n].body._currState.orientation._rawData;
			this.nodes[n].MROTXYZ = $M16([	b[0], b[1], b[2], 0.0,
											b[4], b[5], b[6], 0.0,
											b[8], b[9], b[10], 0.0,
											0.0, 0.0, 0.0, 1.0]);
		}
		if(this.nodes[n].body != undefined && this.nodes[n].onCollisionFunction != undefined) {
			var nodesColl = [];
			for(var c = 0, fc = this.nodes[n].body._collideBodies.length; c < fc; c++) {
				for(var nB = 0, fb = this.nodes.length; nB < fb; nB++) {
					if(this.nodes[n].body != undefined && this.nodes[nB].body != undefined) {
						if((this.nodes[n].body._collideBodies[c]._id == this.nodes[nB].body._id)) { 
							nodesColl.push(this.nodes[nB]);
						}
					}
				}
			}
			if(nodesColl.length > 0) this.nodes[n].onCollisionFunction(nodesColl);
		}
		if(this.nodes[n].car != undefined && this.nodes[n].wheelFL.worldPos != undefined) {
			var currVel = -(this.nodes[n].getCurrentVelocity());
			var mWorld = $M16([this.nodes[n].MROTXYZ.e[0],this.nodes[n].MROTXYZ.e[1],this.nodes[n].MROTXYZ.e[2],0.0,
								this.nodes[n].MROTXYZ.e[4],this.nodes[n].MROTXYZ.e[5],this.nodes[n].MROTXYZ.e[6],0.0,
								this.nodes[n].MROTXYZ.e[8],this.nodes[n].MROTXYZ.e[9],this.nodes[n].MROTXYZ.e[10],0.0,
								0.0,0.0,0.0,1.0]);
								
								
			// WHEELFL
			this.nodes[n].ndWheelFL.MPOS.setPosition($V3([this.nodes[n].wheelFL.worldPos.x, this.nodes[n].wheelFL.worldPos.y, this.nodes[n].wheelFL.worldPos.z]));
			
			var mSteer = $M16().setRotationY(stormEngineC.utils.degToRad(this.nodes[n].wheelFL.getSteerAngle()), false);
			var mVel = $M16().setRotationX(currVel, false);
			//var mRoll = $M16().setRotationZ(stormEngineC.utils.degToRad(this.nodes[n].wheelFL.getRollAngle()), false);
			this.nodes[n].ndWheelFL.MROTXYZ = mWorld.x(mSteer.x(mVel));
			
			
			// WHEELFR
			this.nodes[n].ndWheelFR.MPOS.setPosition($V3([this.nodes[n].wheelFR.worldPos.x, this.nodes[n].wheelFR.worldPos.y, this.nodes[n].wheelFR.worldPos.z]));
			
			var mSteer = $M16().setRotationY(stormEngineC.utils.degToRad(this.nodes[n].wheelFL.getSteerAngle()), false);
			var mVel = $M16().setRotationX(currVel, false);
			//var mRoll = $M16().setRotationZ(stormEngineC.utils.degToRad(this.nodes[n].wheelFL.getRollAngle()), false);
			this.nodes[n].ndWheelFR.MROTXYZ = mWorld.x(mSteer.x(mVel));	

			
			// WHEELBL
			this.nodes[n].ndWheelBL.MPOS.setPosition($V3([this.nodes[n].wheelBL.worldPos.x, this.nodes[n].wheelBL.worldPos.y, this.nodes[n].wheelBL.worldPos.z]));
			
			var mSteer = $M16().setRotationY(stormEngineC.utils.degToRad(this.nodes[n].wheelFL.getSteerAngle()), false);
			var mVel = $M16().setRotationX(currVel, false);
			//var mRoll = $M16().setRotationZ(stormEngineC.utils.degToRad(this.nodes[n].wheelFL.getRollAngle()), false);
			this.nodes[n].ndWheelBL.MROTXYZ = mWorld.x(mVel);	

			// WHEELBR
			this.nodes[n].ndWheelBR.MPOS.setPosition($V3([this.nodes[n].wheelBR.worldPos.x, this.nodes[n].wheelBR.worldPos.y, this.nodes[n].wheelBR.worldPos.z]));
			
			var mSteer = $M16().setRotationY(stormEngineC.utils.degToRad(this.nodes[n].wheelFL.getSteerAngle()), false);
			var mVel = $M16().setRotationX(currVel, false);
			//var mRoll = $M16().setRotationZ(stormEngineC.utils.degToRad(this.nodes[n].wheelFL.getRollAngle()), false);
			this.nodes[n].ndWheelBR.MROTXYZ = mWorld.x(mVel);
		}
		
	}
	
};