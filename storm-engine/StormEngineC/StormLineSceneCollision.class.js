/**
* @class
* @constructor
*/
StormLineSceneCollision = function() {
	this.nodes = stormEngineC.nodes;
	this.lines = stormEngineC.lines;
};

/**
* Check collision
* @type Void
* @param {StormV3} origin StormLine origin property
* @param {StormV3} end StormLine end property
*/
StormLineSceneCollision.prototype.checkCollision = function(vecOrigin, vecEnd) {	
	/*var line = new Object; // mostrar normales
	line.origin = vecRayOrigin;
	line.end = vecRayEnd;
	this.lines.push(line);*/
	
	this.nearNode = null;
	this.nearDistance = 1000000000.0;
	this.nearNormal = null;
	
	var n;
	var nb;
	var b;
	var margin = 0.02;
	for(n = 0, f = this.nodes.length; n < f; n++) {
		// recorremos de nuevo objetos de la escena para comprobar si existe interseccion con algun triangulo de la escena del vector vecRayOrigin-vecRayEnd
		if(this.nodes[n].visibleOnContext == true) {
			for(nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {
				// recorremos vertices del objeto(nodo) segun su indice
				var bO = this.nodes[n].buffersObjects[nb];
				for(b = 0, fbb = bO.nodeMeshIndexArray.length/3; b < fbb; b++) {
					// AABB por caras
					var saltosIdx = b*3; 
					var idxA = bO.nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
					var idxB = bO.nodeMeshIndexArray[saltosIdx+1] * 3;
					var idxC = bO.nodeMeshIndexArray[saltosIdx+2] * 3;
					
					// vertice
					var matVertexA = $M16([
											 1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idxA],
											 0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idxA+1],
											 0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idxA+2],
											 0.0, 0.0, 0.0, 1.0
											 ]);
					matVertexA = this.nodes[n].MPOSFrame.x(matVertexA);
					
					var matVertexB = $M16([
											 1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idxB],
											 0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idxB+1],
											 0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idxB+2],
											 0.0, 0.0, 0.0, 1.0
											 ]);
					matVertexB = this.nodes[n].MPOSFrame.x(matVertexB);
					
					var matVertexC = $M16([
											 1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idxC],
											 0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idxC+1],
											 0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idxC+2],
											 0.0, 0.0, 0.0, 1.0
											 ]);
					matVertexC = this.nodes[n].MPOSFrame.x(matVertexC);

						
						
						
					var vecVertexA = $V3([matVertexA.e[3], matVertexA.e[7], matVertexA.e[11]]); // posicion xyz en WORLD SPACE de un vertice
					var vecVertexB = $V3([matVertexB.e[3], matVertexB.e[7], matVertexB.e[11]]);
					var vecVertexC = $V3([matVertexC.e[3], matVertexC.e[7], matVertexC.e[11]]);
					
					
					// tenemos 3 vertices podemos comprobar interseccion de vecRayOrigin, vecRayEnd con el triangulo dado por los 3 vertices
					var stormRayTriangle = new StormRayTriangle();
					stormRayTriangle.setRayTriangle(vecOrigin, vecEnd, vecVertexA, vecVertexB, vecVertexC);
					var p = stormRayTriangle.getP();
					var normal = stormRayTriangle.getN();
					
					if(p > 0.0){
						if(p < this.nearDistance) {
							this.nearDistance = p;			    		
							this.nearNode = this.nodes[n];
							this.nearNormal = normal;
							this.s = stormRayTriangle.getS();
							this.t = stormRayTriangle.getT();
						}
					}
					
				}
			}
		}
	}
};
/**
* Get the collision distance
* @returns {Float} 
*/
StormLineSceneCollision.prototype.getCollisionDistance = function() {	
	return this.nearDistance;
};
/**
* Get the collision node
* @returns {StormNode} 
*/
StormLineSceneCollision.prototype.getCollisionNode = function() {	
	return this.nearNode;
};
/**
* Get the collision normal
* @returns {StormV3} 
*/
StormLineSceneCollision.prototype.getCollisionNormal = function() {	
	return this.nearNormal;
};
/**
* Get the S parameter of the triangle impacted
* @returns {Float} 
*/
StormLineSceneCollision.prototype.getCollisionS = function() {	
	return this.s;
};
/**
* Get the T parameter of the triangle impacted
* @returns {Float} 
*/
StormLineSceneCollision.prototype.getCollisionT = function() {	
	return this.t;
};