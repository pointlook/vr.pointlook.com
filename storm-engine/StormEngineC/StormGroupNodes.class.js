/**
* @class
* @constructor

* @property {Int} idNum
* @property {String} name
* @property {Array} nodes
* @property {StormM16} MPOS

*/
StormGroupNodes = function() {	
	this.idNum;
	this.name = '';
	this.MPOS = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.nodes = [];
	this.onloadFunction = undefined; 
};

/**
* Load a object on this group from url of collada file 
* @type Void
* @param	{Object} jsonIn
* 	@param {String} jsonIn.daeUrl Collada (.DAE) file url
* 	@param {String} [jsonIn.textureUniqueUrl] Image file url for apply a unique texture
* 	@param {String} [jsonIn.setCam] Set the camera for the WebGL Context by the name of the imported camera
* 	@param {Function} [jsonIn.onload] Function to call after load
*/
StormGroupNodes.prototype.loadCollada = function(jsonIn) {		
	var mesh = new StormMesh();
	mesh.loadCollada({	'group':this,
					'daeUrl':jsonIn.daeUrl,
					'textureUniqueUrl':jsonIn.textureUniqueUrl,
					'setCam':jsonIn.setCam,
					'onload':jsonIn.onload});
};
/**
* Load a object on this group from text-plain on collada format 
* @type Void
* @param	{Object} jsonIn
* 	@param {String} jsonIn.sourceText The source text
* 	@param {String} [jsonIn.daeDirectory] Collada (.DAE) Directory of Collada (.DAE) file for obtain the textures
* 	@param {String} [jsonIn.textureUniqueUrl] Image file url for apply a unique texture
* 	@param {String} [jsonIn.setCam] Set the camera for the WebGL Context by the name of the imported camera
*/
StormGroupNodes.prototype.loadColladaFromSourceText = function(jsonIn) {
	var mesh = new StormMesh();
	mesh.loadColladaFromSourceText({	'group':this,
										'sourceText':jsonIn.sourceText,
										'daeDirectory':jsonIn.daeDirectory,
										'textureUniqueUrl':jsonIn.textureUniqueUrl,
										'setCam':jsonIn.setCam});
};

/**
* Add a node to this group
* @type Void
* @param {StormNode} node Add a node to group
 */
StormGroupNodes.prototype.addNode = function(node) {
	this.nodes.push(node);
};

/**
* Get the array StormNodes from this group
* @returns {Array}
*/
StormGroupNodes.prototype.getNodes = function() {
	return this.nodes;
};

/**
* Positioning the group
* @type Void
* @param {StormV3} position Position vector
*/
StormGroupNodes.prototype.setPosition = function(vec) {
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		this.nodes[n].setPosition(vec);
	}
};

/**
* Rotate the group
* @type Void
* @param {Float} radians
* @param {Bool} [relative=true] false for absolute rotation
* @param {StormV3} [axis=$V3([0.0,1.0,0.0])]
*/
StormGroupNodes.prototype.setRotation = function(radians, relative, axis) {
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		this.nodes[n].setRotation(radians, relative, axis);
	}
};

/**
* Add physics to this group 
* @type Void
* @param {Object} jsonIn
*	 @param {String} jsonIn.type 'box'|'sphere'|'capsule'|'ground'|'trimesh'|'car'
*	 @param {StormV3} jsonIn.dimensions Dimension vector for type 'box'|'car'. Width, length and height
*	 @param {Float} jsonIn.dimensions Radius for type 'sphere'
*	 @param {Float} jsonIn.r Radius for type 'capsule'
*	 @param {Float} jsonIn.l Length for type 'capsule'
*	 @param {Float} jsonIn.mass Only if type is 'box'|'sphere'|'capsule'|'trimesh'|'car'. 0 mass = static body.
*	 @param {Float} jsonIn.friction The friction
*	 @param {Float} jsonIn.restitution The restitution (elasticity)
*	 @param {Float} jsonIn.maxVelocity Only if type is 'car'
*	 @param {Float} jsonIn.engineBreak Only if type is 'car'
*	 @param {Float} jsonIn.steerAngle Only if type is 'car'
* @example
* group.setCollision({type:'sphere',
*                    dimensions:0.5,
*                    mass':0.38,
*                    friction:0.5,
*                    restitution:0.2});
*/
StormGroupNodes.prototype.setCollision = function(jsonIn) {
	for(var n = 0, f = this.nodes.length; n < f; n++) this.nodes[n].setCollision(jsonIn);
};
