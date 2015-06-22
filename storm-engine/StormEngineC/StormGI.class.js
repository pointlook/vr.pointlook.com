/**
* @class
* @constructor
* @property {StormVoxelizator} svo
*/
StormGI = function() {
	this.svo;
	this.maxBounds = 5;    
};
/**
* Set the stormVoxelizator object and enable the GIv2 in the WebGL context
* @type Void
* @param	{StormVoxelizator} voxelizator Voxelizator object with "albedo", "position" and "normal" fillmodes enabled
*/
StormGI.prototype.setVoxelizator = function(svo) {   
	if(	svo instanceof StormVoxelizator == false ||
		svo.image3D_VoxelsColor == undefined ||
		svo.image3D_VoxelsPositionX == undefined ||
		svo.image3D_VoxelsPositionY == undefined ||
		svo.image3D_VoxelsPositionZ == undefined ||
		svo.image3D_VoxelsNormal == undefined) {
			alert("You must select a voxelizator object with albedo,position and normal fillmodes enabled.");
			return false;
	}
	stormEngineC.setStatus({id:'gi', str:'PROCESSING GI'});
	this.svo = svo;
	stormEngineC.setWebGLGI(this);
	stormEngineC.setStatus({id:'gi', str:''});
};

/**
* Stop GI on camera move
* @type Void
* @param {Bool} [stop=true]
*/
StormGI.prototype.stopOncameramove = function(stop) {
	stormEngineC.stormGLContext.GIstopOncameramove = stop;
};

/**
* Enable GI
* @type Void
*/
StormGI.prototype.enable = function() {
	stormEngineC.stormGLContext.GIv2enable = true;
};

/**
* Disable GI
* @type Void
*/
StormGI.prototype.disable = function() {
	stormEngineC.stormGLContext.GIv2enable = false;
};

/**
* Set max bounds
* @param {Int} [maxbounds=5]
*/
StormGI.prototype.setMaxBounds = function(maxbounds) {
	this.maxBounds = (maxbounds != undefined) ? maxbounds : 5; 
};