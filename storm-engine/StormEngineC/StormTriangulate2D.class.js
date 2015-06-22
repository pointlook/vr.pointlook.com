/*
This class has been ported to Javascript by Roberto Gonzalez.
The original code is in: http://www.flipcode.com/archives/Efficient_Polygon_Triangulation.shtml
Original author: John W. Ratcliff [jratcliff@verant.com]
 */
/**
* @class
* @constructor
*/
StormTriangulate2D = function() {
	this.EPSILON = 0.0000000001;
};

/**
 * @private 
 */
StormTriangulate2D.prototype.area = function(arr) {		
	var n = arr.length;

	var A = 0.0;

	for(var p = n-1, q = 0; q < n; p = q++) A += arr[p][0]*arr[q][1] - arr[q][0]*arr[p][1];
	
	return A*0.5;
};
/**
 * @private 
 */
StormTriangulate2D.prototype.insideTriangle = function(Ax,Ay,Bx,By,Cx,Cy,Px,Py) {		
	var ax, ay, bx, by, cx, cy, apx, apy, bpx, bpy, cpx, cpy;
	var cCROSSap, bCROSScp, aCROSSbp;

	ax = Cx - Bx;  ay = Cy - By;
	bx = Ax - Cx;  by = Ay - Cy;
	cx = Bx - Ax;  cy = By - Ay;
	apx= Px - Ax;  apy= Py - Ay;
	bpx= Px - Bx;  bpy= Py - By;
	cpx= Px - Cx;  cpy= Py - Cy;

	aCROSSbp = ax*bpy - ay*bpx;
	cCROSSap = cx*apy - cy*apx;
	bCROSScp = bx*cpy - by*cpx;

	return ((aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0));
};
/**
 * @private 
 */
StormTriangulate2D.prototype.snip = function(arr, u,v,w,n,V) {		
	var p;
	var Ax, Ay, Bx, By, Cx, Cy, Px, Py;

	Ax = arr[V[u]][0];
	Ay = arr[V[u]][1];

	Bx = arr[V[v]][0];
	By = arr[V[v]][1];

	Cx = arr[V[w]][0];
	Cy = arr[V[w]][1];

	if ( this.EPSILON > (((Bx-Ax)*(Cy-Ay)) - ((By-Ay)*(Cx-Ax))) ) return false;

	for (p=0;p<n;p++) {
		if( (p == u) || (p == v) || (p == w) ) continue;
		Px = arr[V[p]][0];
		Py = arr[V[p]][1];
		if (this.insideTriangle(Ax,Ay,Bx,By,Cx,Cy,Px,Py)) return false;
	}

	return true;
};
/**
 * @private 
 */
StormTriangulate2D.prototype.process = function(arr) {		
	/* allocate and initialize list of Vertices in polygon */
	var result = [];
	var n = arr.length; 
	if ( n < 3 ) return 'Array must be greater than 2';

	var V = [];

	/* we want a counter-clockwise polygon in V */

	if ( 0.0 < this.area(arr) )
	for (var v=0; v<n; v++) V[v] = v;
	else
	for(var v=0; v<n; v++) V[v] = (n-1)-v;

	var nv = n;

	/*  remove nv-2 Vertices, creating 1 triangle every time */
	var count = 2*nv;   /* error detection */
	 
	for(v=nv-1; nv>2; ) {
		/* if we loop, it is probably a non-simple polygon */
		if (0 >= (count--)) return result;//'Triangulate: ERROR - probable bad polygon'; 

		/* three consecutive vertices in current polygon, <u,v,w> */
		var u = v;
		if (nv <= u) u = 0; /* previous */
		v = u+1;
		if (nv <= v) v = 0; /* new v    */
		var w = v+1;
		if (nv <= w) w = 0; /* next     */

		if (this.snip(arr,u,v,w,nv,V)) {
			var a,b,c,s,t;

			/* true names of the vertices */
			a = V[u]; b = V[v]; c = V[w];

			/* output Triangle */
			result.push( arr[a], arr[b], arr[c] );

			/* remove v from remaining polygon */
			for(s=v,t=v+1;t<nv;s++,t++) V[s] = V[t];
			nv--;

			/* resest error detection counter */
			count = 2*nv;
		}
	}

	return result;
};
