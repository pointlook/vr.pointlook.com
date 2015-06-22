 /*
 Triangle-Box Overlap
 http://fileadmin.cs.lth.se/cs/Personal/Tomas_Akenine-Moller/code/tribox3.txt
 
 */
/**
* @class
* @constructor
*/
StormTriangleBox = function() {
	this.min;
	this.max;
	this.p0;
	this.p1;
	this.p2;
	this.rad;
	this.v0;
	this.v1;
	this.v2;
	this.boxhalfsize;
};

/**
* Test Triangle-Box overlap
* @type Void
* @param Array boxcenter - Array of three values
* @param Array boxhalfsize - Array of three values
* @param Array triverts - Array of three arrays with three values [ [x.y,z],[x.y,z],[x.y,z]]
*/
StormTriangleBox.prototype.triBoxOverlap = function(boxcenter, boxhalfsize, triverts) {
	var X = 0;
	var Y = 1;
	var Z = 2;
	var fex,fey,fez;		// -NJMP- "d" local variable removed 

	this.boxhalfsize = boxhalfsize;
	
	this.v0 = this.SUB(triverts[0],boxcenter);
	this.v1 = this.SUB(triverts[1],boxcenter);
	this.v2 = this.SUB(triverts[2],boxcenter);

	var e0 = this.SUB(this.v1,this.v0);      /* tri edge 0 */
	var e1 = this.SUB(this.v2,this.v1);      /* tri edge 1 */
	var e2 = this.SUB(this.v0,this.v2);      /* tri edge 2 */


	fex = Math.abs(e0[X]);
	fey = Math.abs(e0[Y]);
	fez = Math.abs(e0[Z]);
	this.AXISTEST_X01(e0[Z], e0[Y], fez, fey);
	this.AXISTEST_Y02(e0[Z], e0[X], fez, fex);
	this.AXISTEST_Z12(e0[Y], e0[X], fey, fex);


	fex = Math.abs(e1[X]);
	fey = Math.abs(e1[Y]);
	fez = Math.abs(e1[Z]);
	this.AXISTEST_X01(e1[Z], e1[Y], fez, fey);
	this.AXISTEST_Y02(e1[Z], e1[X], fez, fex);
	this.AXISTEST_Z0(e1[Y], e1[X], fey, fex);


	fex = Math.abs(e2[X]);
	fey = Math.abs(e2[Y]);
	fez = Math.abs(e2[Z]);
	this.AXISTEST_X2(e2[Z], e2[Y], fez, fey);
	this.AXISTEST_Y1(e2[Z], e2[X], fez, fex);
	this.AXISTEST_Z12(e2[Y], e2[X], fey, fex);




	this.FINDMINMAX(this.v0[X],this.v1[X],this.v2[X]);
	if(this.min>this.boxhalfsize[X] || this.max<-this.boxhalfsize[X]) return 0;



	this.FINDMINMAX(this.v0[Y],this.v1[Y],this.v2[Y]);
	if(this.min>this.boxhalfsize[Y] || this.max<-this.boxhalfsize[Y]) return 0;



	this.FINDMINMAX(this.v0[Z],this.v1[Z],this.v2[Z]);
	if(this.min>this.boxhalfsize[Z] || this.max<-this.boxhalfsize[Z]) return 0;




	var normal = this.CROSS(e0,e1);
	if(!this.planeBoxOverlap(normal,this.v0,this.boxhalfsize)) return 0;	// -NJMP-



	return 1;   /* box and triangle overlaps */
};
/**  @private  */
StormTriangleBox.prototype.AXISTEST_X01 = function(a, b, fa, fb) {
	var X = 0;
	var Y = 1;
	var Z = 2;
	this.p0 = a*this.v0[Y] - b*this.v0[Z];

	this.p2 = a*this.v2[Y] - b*this.v2[Z];

	if(this.p0<this.p2) {this.min=this.p0; this.max=this.p2;} else {this.min=this.p2; this.max=this.p0;}

	this.rad = fa * this.boxhalfsize[Y] + fb * this.boxhalfsize[Z];

	if(this.min>this.rad || this.max<-this.rad) return 0;
};
/**  @private  */
StormTriangleBox.prototype.AXISTEST_X2 = function(a, b, fa, fb) {
	var X = 0;
	var Y = 1;
	var Z = 2;
	this.p0 = a*this.v0[Y] - b*this.v0[Z];

	this.p1 = a*this.v1[Y] - b*this.v1[Z];

	if(this.p0<this.p1) {this.min=this.p0; this.max=this.p1;} else {this.min=this.p1; this.max=this.p0;}

	this.rad = fa * this.boxhalfsize[Y] + fb * this.boxhalfsize[Z];

	if(this.min>this.rad || this.max<-this.rad) return 0;
};
/**  @private  */
StormTriangleBox.prototype.AXISTEST_Y02 = function(a, b, fa, fb) {
	var X = 0;
	var Y = 1;
	var Z = 2;
	this.p0 = -a*this.v0[X] + b*this.v0[Z];

	this.p2 = -a*this.v2[X] + b*this.v2[Z];

	if(this.p0<this.p2) {this.min=this.p0; this.max=this.p2;} else {this.min=this.p2; this.max=this.p0;}

	this.rad = fa * this.boxhalfsize[X] + fb * this.boxhalfsize[Z];

	if(this.min>this.rad || this.max<-this.rad) return 0;
};
/**  @private  */
StormTriangleBox.prototype.AXISTEST_Y1 = function(a, b, fa, fb) {
	var X = 0;
	var Y = 1;
	var Z = 2;
	this.p0 = -a*this.v0[X] + b*this.v0[Z];

	this.p1 = -a*this.v1[X] + b*this.v1[Z];

	if(this.p0<this.p1) {this.min=this.p0; this.max=this.p1;} else {this.min=this.p1; this.max=this.p0;}

	this.rad = fa * this.boxhalfsize[X] + fb * this.boxhalfsize[Z];

	if(this.min>this.rad || this.max<-this.rad) return 0;
};
/**  @private  */
StormTriangleBox.prototype.AXISTEST_Z12 = function(a, b, fa, fb) {
	var X = 0;
	var Y = 1;
	var Z = 2;
	this.p1 = a*this.v1[X] - b*this.v1[Y];

	this.p2 = a*this.v2[X] - b*this.v2[Y];

	if(this.p2<this.p1) {this.min=this.p2; this.max=this.p1;} else {this.min=this.p1; this.max=this.p2;}

	this.rad = fa * this.boxhalfsize[X] + fb * this.boxhalfsize[Y];

	if(this.min>this.rad || this.max<-this.rad) return 0;
};
/**  @private  */
StormTriangleBox.prototype.AXISTEST_Z0 = function(a, b, fa, fb) {
	var X = 0;
	var Y = 1;
	var Z = 2;
	this.p0 = a*this.v0[X] - b*this.v0[Y];

	this.p1 = a*this.v1[X] - b*this.v1[Y];

	if(this.p0<this.p1) {this.min=this.p0; this.max=this.p1;} else {this.min=this.p1; this.max=this.p0;}

	this.rad = fa * this.boxhalfsize[X] + fb * this.boxhalfsize[Y];

	if(this.min>this.rad || this.max<-this.rad) return 0;
};
/**  @private  */
StormTriangleBox.prototype.planeBoxOverlap = function(normal, vert, maxbox) {
	var X = 0;
	var Y = 1;
	var Z = 2;
	
	var q;

	var vmin = [], vmax = [], v;

	for(var q=X;q<=Z;q++) {

		v=vert[q];					// -NJMP-

		if(normal[q]>0.0) {
			vmin[q]=-maxbox[q] - v;	// -NJMP-

			vmax[q]= maxbox[q] - v;	// -NJMP-
		} else {
			vmin[q]= maxbox[q] - v;	// -NJMP-

			vmax[q]=-maxbox[q] - v;	// -NJMP-
		}

	}

	if(this.DOT(normal,vmin)>0.0) return 0;	// -NJMP-

	if(this.DOT(normal,vmax)>=0.0) return 1;	// -NJMP-

	return 0;
};
/**  @private  */
StormTriangleBox.prototype.FINDMINMAX = function(x0,x1,x2) {
	this.min = this.max = x0;

	if(x1<this.min) this.min=x1;

	if(x1>this.max) this.max=x1;

	if(x2<this.min) this.min=x2;

	if(x2>this.max) this.max=x2;
};
/**  @private  */
StormTriangleBox.prototype.CROSS = function(v1,v2) {
	var dest = [];
	dest[0]=v1[1]*v2[2]-v1[2]*v2[1];

	dest[1]=v1[2]*v2[0]-v1[0]*v2[2];

	dest[2]=v1[0]*v2[1]-v1[1]*v2[0];
	return dest;
}
/**  @private  */
StormTriangleBox.prototype.DOT = function(v1,v2) {
	return v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2];
}
/**  @private  */
StormTriangleBox.prototype.SUB = function(v1,v2) {
	var dest = [];
	dest[0]=v1[0]-v2[0];

	dest[1]=v1[1]-v2[1];

	dest[2]=v1[2]-v2[2]; 
	return dest;
}