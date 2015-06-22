/**
* @class
* @constructor
*/
StormRayTriangle = function() {
	this.vecN = null;
	this.p = 0.0;
};

/**
* Aqui damos el conjunto linea-triangulo que debe ser procesado
* @type Void
* @private 
* @param $V3 vecRayOrigin - posicion del origen de la linea
* @param $V3 vecRayEnd - posicion del fin de la linea
* @param $V3 vecVertexA - posicion del 1º vertice del triangulo
* @param $V3 vecVertexB - posicion del 2º vertice del triangulo
* @param $V3 vecVertexC - posicion del 3º vertice del triangulo
*/
StormRayTriangle.prototype.setRayTriangle = function(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC) {
	/*
	RayTriangleIntersect of softSurfer modified y ported to javascript by Roberto Gonzalez.
	Copyright 2001, softSurfer (www.softsurfer.com)
	This code may be freely used and modified for any purpose
	providing that this copyright notice is included with it.
	SoftSurfer makes no warranty for this code, and cannot be held
	liable for any real or imagined damage resulting from its use.
	Users of this code must verify correctness for their application.
	*/
	this.p = 0.0;
	var SMALL_NUM = 0.00000001;

	var u = vecVertexB.subtract(vecVertexA);
	var v = vecVertexC.subtract(vecVertexA);
	this.vecN = u.cross(v); // normal al triangulo
	
	if(this.vecN.equal($V3([0.0, 0.0, 0.0]))) { // triangulo mal formado
		return 0;
	}
	var vecDir = vecRayEnd.subtract(vecRayOrigin); // direccion del rayo
	var vecW0 = vecRayOrigin.subtract(vecVertexA);
	var a = -this.vecN.dot(vecW0);
	var b = this.vecN.dot(vecDir);
	if(Math.abs(b) < SMALL_NUM) {
		if(a == 0) { // intersecta paralelo a triangulo 
			//this.p = SMALL_NUM; 
			//return 0;
		} else return 0; // no intersecta
	}

	
	var r = a / b; // distancia al punto de interseccion
	if(r < 0.0) return 0; // no intersecta
	if(r > 1.0) return 0; // no intersecta

	var vecIntersect = vecRayOrigin.add(vecDir.x(r)); // vector desde origen a punto de intersección


	var uu = u.dot(u);
	var uv = u.dot(v);
	var vv = v.dot(v);
	var vecW = vecIntersect.subtract(vecVertexA);
	var wu = vecW.dot(u);
	var wv = vecW.dot(v);
	var D = (uv * uv) - (uu * vv);
	
	
	this.s = ((uv * wv) - (vv * wu)) / D;
	if (this.s < 0.0 || this.s > 1.0) return 0; // interseccion esta fuera del triangulo
	this.t = ((uv * wu) - (uu * wv)) / D;
	if (this.t < 0.0 || (this.s + this.t) > 1.0) return 0; // interseccion esta fuera del triangulo

	this.p = vecDir.modulus()*r; // interseccion esta dentro del triangulo
	
	return 0;
};

/**
* Si existe interseccion a lo largo de la linea dada devuelve la distancia desde vecRayOrigin al punto de interseccion
* de lo contrario devuelve null
* Ejemplo: si la linea tiene un modulo de 10.0 y a la mitad de la linea hay algo intersectando, getP devuelve 5.0
* si intersecta por el principio: de 0.0 a 5.0; por el final: de 5.0 a 10.0
* @returns {Float} p Intersection distance
* @private 
*/
StormRayTriangle.prototype.getP = function() {
	return this.p;
};

/**
* Si existe interseccion devuelve la normal de lo contrario devuelve null
* @returns {StormV3} vecN
* @private 
*/
StormRayTriangle.prototype.getN = function() {
	return this.vecN.normalize();
};

/**
* @returns {Float} s
* @private 
*/
StormRayTriangle.prototype.getS = function() {
	return this.s;
};

/**
* @returns {Float} t
* @private 
*/
StormRayTriangle.prototype.getT = function() {
	return this.t;
};


/*
* Aqui damos el conjunto linea-triangulo que debe ser procesado
* @type Void
* @private 
* @param $V3 vecRayOrigin - posicion del origen de la linea
* @param $V3 vecRayEnd - posicion del fin de la linea
* @param $V3 vecVertexA - posicion del 1º vertice del triangulo
* @param $V3 vecVertexB - posicion del 2º vertice del triangulo
* @param $V3 vecVertexC - posicion del 3º vertice del triangulo
*
StormRayTriangle.prototype.setRayTriangleB = function(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC) {
	//Möller–Trumbore intersection algorithm
	//http://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
	this.p = 0.0;
	var EPSILON = 0.000001;
	var e1, e2;  //Edge1, Edge2
	var PP, QQ, TT;
	var det, inv_det, u, v;
	var t;
  
	//Find vectors for two edges sharing V0
	e1 = vecVertexB.subtract(vecVertexA);
	e2 = vecVertexC.subtract(vecVertexA);
	//Begin calculating determinant - also used to calculate u parameter
	PP = vecRayEnd.cross(e2);
	//if determinant is near zero, ray lies in plane of triangle
	det = e1.dot(PP);
	//NOT CULLING
	if(det > -EPSILON && det < EPSILON) return 0;
	inv_det = 1.0 / det;
  
	//calculate distance from V0 to ray origin
	TT = vecRayOrigin.subtract(vecVertexA);

	//Calculate u parameter and test bound
	u = TT.dot(PP) * inv_det;
	//The intersection lies outside of the triangle
	if(u < 0.0 || u > 1.0) return 0;
  
	//Prepare to test v parameter
	QQ = TT.cross(e1);

	//Calculate V parameter and test bound
	v = vecRayEnd.dot(QQ) * inv_det;
	//The intersection lies outside of the triangle
	if(v < 0.0 || u + v  > 1.0) return 0;

	t = e2.dot(QQ) * inv_det;

	if(t > EPSILON) { //ray intersection
		this.p = t;
		return 1; 
	}

	// No hit, no win
	return 0;
};*/