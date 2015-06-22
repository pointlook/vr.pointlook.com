/**
* @class
* @constructor
* @augments StormNode

* @property {String} objectType
*/
StormForceField = function(jsonIn) { StormNode.call(this); 
	this.objectType = 'forceField';
	this.forceFieldType = 'direction'; // direction or gravity
	
	this.direction = (jsonIn != undefined && jsonIn.direction != undefined) ? jsonIn.direction : $V3([0.0,-9.8,0.0]);   
	this.nodesProc = [];
};
StormForceField.prototype = Object.create(StormNode.prototype);

/** @private */
StormForceField.prototype.updateJigLib = function() {  
	if(this.forceFieldType == 'gravity') {  
		stormEngineC.stormJigLibJS.dynamicsWorld.setGravity(new Vector3D( this.direction.e[0], this.direction.e[1], this.direction.e[2], 0 ));
	} else {
	
	} 
};
/**
* Set the direction
* @type Void
* @param {StormV3} direction
*/
StormForceField.prototype.setDirection = function(direction) {  
	this.direction = direction;
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) this.nodesProc[n].updatekernelDir_Arguments(); 
	
	this.updateJigLib();
};
/**
* Delete this force field
* @type Void
*/
StormForceField.prototype.deleteForceField = function() {
	var idToRemove = undefined;
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		if(stormEngineC.forceFields[n].idNum == this.idNum) idToRemove = n;
	}
	stormEngineC.forceFields.splice(idToRemove,1);
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) {
		var kernelDir_Source = this.nodesProc[n].generatekernelDir_Source(); 
		var kernelDirX_Source = kernelDir_Source+
								'out_float4 = vec4(newDir,1.0);\n'+
								'}';
		this.nodesProc[n].kernelDirX.setKernelSource(kernelDirX_Source);
		this.nodesProc[n].updatekernelDir_Arguments(); 
	}
	
	this.updateJigLib();
};

/**
* Get a node of particles
* @type Void
* @param {Object} jsonIn
* 	@param {StormNode} jsonIn.node The node
*/
StormForceField.prototype.get = function(jsonIn) {   
	var push = true;
	if(jsonIn.node.objectType != 'particles') {
		alert('No particle node');
		return;
	}
	for(var n = 0, f = this.nodesProc.length; n < f; n++) if(jsonIn.node.idNum == this.nodesProc[n].idNum) {push = false; break;}
	if(push == true) {
		this.nodesProc.push(jsonIn.node);
		
		var kernelDir_Source = jsonIn.node.generatekernelDir_Source(); 
		var kernelDirX_Source = kernelDir_Source+
								'out_float4 = vec4(newDir,1.0);\n'+
								'}';
		jsonIn.node.kernelDirX.setKernelSource(kernelDirX_Source);
		jsonIn.node.updatekernelDir_Arguments(); 
	} else alert('This particle already exist in this polarity point');
};

/**
* Remove a node of particles
* @type Void
* @param {Object} jsonIn
* 	@param {StormNode} jsonIn.node The node
*/
StormForceField.prototype.removeParticles = function(jsonIn) {
	var idToRemove = undefined;
	for(var n = 0, f = this.nodesProc.length; n < f; n++) {
		if(jsonIn.node.idNum == this.nodesProc[n].idNum) idToRemove = n;
	}
	this.nodesProc.splice(idToRemove,1);
};


