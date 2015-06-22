// ALIAS
function alias(object, name) {
    var fn = object ? object[name] : null;
    if (typeof fn == 'undefined') return function () {}
    return function () {
        return fn.apply(object, arguments)
    }
}
DGE = alias(document, 'getElementById');
DCE = alias(document, 'createElement'); 
D$ = alias(document, 'querySelector');
D$$ = alias(document, 'querySelectorAll');


/**
* @class
* @constructor
*/
StormUtils = function(elements) {
	
};

/**
* Get HTMLCanvasElement from Uint8Array
* @returns {HTMLCanvasElement}
* @param {Uint8Array} array
* @param {Int} width
* @param {Int} height
*/
StormUtils.prototype.getCanvasFromUint8Array = function(uint8arr, width, height) {
	var e = document.createElement('canvas');
	e.width = width;
	e.height = height;
	var ctx2D = e.getContext("2d");		
	var image = ctx2D.createImageData(width,height);
	for(var i=0; i<image.data.length; i++)image.data[i] = uint8arr[i];
	ctx2D.putImageData(image,0,0);

    return e;
};

/**
* Get HTMLImageElement from canvas
* @returns {HTMLImageElement}
* @param {HTMLCanvasElement} canvasElement
*/
StormUtils.prototype.getImageFromCanvas = function(oldCanvas) {
	var imagen = document.createElement('img');
	imagen.src = oldCanvas.toDataURL();

    return imagen;
};

/**
* Get Uint8Array from HTMLImageElement
* @returns {Uint8Array}
* @param {HTMLImageElement} imageElement
*/
StormUtils.prototype.getUint8ArrayFromHTMLImageElement = function(imageElement) {
	var e = document.createElement('canvas');
	e.width = imageElement.width;
	e.height = imageElement.height;
	var ctx2D_tex = e.getContext("2d");		
	ctx2D_tex.drawImage(imageElement, 0, 0);
	var arrayTex = ctx2D_tex.getImageData(0, 0, imageElement.width, imageElement.height);

    return arrayTex.data;
};

/**
* Get random vector from vecNormal with deviation in degrees
* @returns {StormV3}
* @param {StormV3} normalVector
* @param {Float} degrees
*/
StormUtils.prototype.getVector = function(vecNormal, degrees) {
	var r = Math.sqrt((vecNormal.e[0]*vecNormal.e[0]) + (vecNormal.e[1]*vecNormal.e[1]) + (vecNormal.e[2]*vecNormal.e[2]));
	var angleLat = Math.acos(vecNormal.e[2]/1.0);
	var angleAzim = Math.atan2(vecNormal.e[1],vecNormal.e[0]);
			
	var desvX = -1.0+(Math.random()*2.0);
	var desvY = -1.0+(Math.random()*2.0);
	angleLat += (degrees*desvX)*1.6;
	angleAzim += (degrees*desvY)*1.6;

	var x = Math.sin(angleLat)*Math.cos(angleAzim);
	var y = Math.sin(angleLat)*Math.sin(angleAzim);
	var z = Math.cos(angleLat);
	
	return $V3([x,y,z]);
};

/**
* Refract
* @returns {StormV3}
* @param {StormV3} V
* @param {StormV3} N
* @param {Float} n1 Refract index way 1
* @param {Float} n2 Refract index way 2
*/
StormUtils.prototype.refract = function(V, N, n1, n2) {
	var refrIndex = n1/n2;
	var cosI = N.dot(V)*-1.0;
	var cosT2 = 1.0 - refrIndex * refrIndex * (1.0 - cosI * cosI);
	var vv = V.x(refrIndex);
	return  vv.add( N.x(refrIndex * cosI - Math.sqrt(cosT2)) );
};

/**
* Degrees to radians. Full circle = 360 degrees.
* @returns {Float}
* @param {Float} degrees
*/
StormUtils.prototype.degToRad = function(deg) {
	return (deg*3.14159)/180;
};

/**
* Radians to degrees
* @returns {Float}
* @param {Float} radians
*/
StormUtils.prototype.radToDeg = function(rad) {
	return rad*(180/3.14159);
};

/**
* Inverse sqrt
* @returns {Float}
* @param {Float} value
*/
StormUtils.prototype.invsqrt = function(value) {
	return 1.0/value;
};

/**
* Get vector translation for screen dragging
* @private
* @returns {StormV3}
*/
StormUtils.prototype.getDraggingScreenVector = function() {
	var factordist = stormEngineC.getWebGLCam().getPosition().distance(stormEngineC.getSelectedNode().getPosition());
	var factorxdim = (stormEngineC.mouseOldPosX - stormEngineC.mousePosX) * factordist;
	var factorydim = (stormEngineC.mouseOldPosY - stormEngineC.mousePosY) * factordist;
	var factorx = factorxdim * (this.invsqrt(stormEngineC.stormGLContext.viewportWidth/13000)*1000.0) *0.0000000613; 
	var factory = factorydim * (this.invsqrt(stormEngineC.stormGLContext.viewportHeight/13000)*1000.0) *0.0000000613; 
	var sig = (stormEngineC.getWebGLCam().controller.controllerType == 1) ? -1.0 : 1.0;
	var X = stormEngineC.getWebGLCam().nodePivot.MPOS.x(stormEngineC.getWebGLCam().nodePivot.MROTXYZ).getLeft().x(factorx*sig); 
	var Y = stormEngineC.getWebGLCam().nodePivot.MPOS.x(stormEngineC.getWebGLCam().nodePivot.MROTXYZ).getUp().x(factory); 
	return X.add(Y);
};
/**
* Get vector translation for x local dragging
* @private
* @returns {StormV3}
* @param {Bool} local
*/
StormUtils.prototype.getDraggingPosXVector = function(local) {
	var loc = (local == undefined || local == true) ? true : false;
	var factordist = stormEngineC.getWebGLCam().getPosition().distance(stormEngineC.getSelectedNode().getPosition());
	var factorxdim = (stormEngineC.mouseOldPosX - stormEngineC.mousePosX) * factordist;
	var factorydim = (stormEngineC.mouseOldPosY - stormEngineC.mousePosY) * factordist;
	var factorx = factorxdim * (this.invsqrt(stormEngineC.stormGLContext.viewportWidth/13000)*1000.0) *0.0000000613; 
	var factory = factorydim * (this.invsqrt(stormEngineC.stormGLContext.viewportHeight/13000)*1000.0) *0.0000000613; 
	var X,Y;
	if(loc) {
		X = $V3([1.0,0.0,0.0]).x(-factorx); 
		Y = $V3([1.0,0.0,0.0]).x(-factory); 
	} else {
		X = stormEngineC.getSelectedNode().MPOS.x(stormEngineC.getSelectedNode().MROTXYZ).getLeft().x(-factorx); 
		Y = stormEngineC.getSelectedNode().MPOS.x(stormEngineC.getSelectedNode().MROTXYZ).getLeft().x(-factory); 
	}
	return X.add(Y);
};
/**
* Get vector translation for y local dragging
* @private
* @returns {StormV3}
* @param {Bool} local
*/
StormUtils.prototype.getDraggingPosYVector = function(local) {
	var loc = (local == undefined || local == true) ? true : false;
	var factordist = stormEngineC.getWebGLCam().getPosition().distance(stormEngineC.getSelectedNode().getPosition());
	var factorxdim = (stormEngineC.mouseOldPosX - stormEngineC.mousePosX) * factordist;
	var factorydim = (stormEngineC.mouseOldPosY - stormEngineC.mousePosY) * factordist;
	var factorx = factorxdim * (this.invsqrt(stormEngineC.stormGLContext.viewportWidth/13000)*1000.0) *0.0000000613; 
	var factory = factorydim * (this.invsqrt(stormEngineC.stormGLContext.viewportHeight/13000)*1000.0) *0.0000000613; 
	var X,Y;
	if(loc) {
		X = $V3([0.0,1.0,0.0]).x(-factorx); 
		Y = $V3([0.0,1.0,0.0]).x(factory); 
	} else {
		X = stormEngineC.getSelectedNode().MPOS.x(stormEngineC.getSelectedNode().MROTXYZ).getUp().x(-factorx); 
		Y = stormEngineC.getSelectedNode().MPOS.x(stormEngineC.getSelectedNode().MROTXYZ).getUp().x(-factory); 
	}
	return X.add(Y);
};
/**
* Get vector translation for z local dragging
* @private
* @returns {StormV3}
* @param {Bool} local
*/
StormUtils.prototype.getDraggingPosZVector = function(local) {
	var loc = (local == undefined || local == true) ? true : false;
	var factordist = stormEngineC.getWebGLCam().getPosition().distance(stormEngineC.getSelectedNode().getPosition());
	var factorxdim = (stormEngineC.mouseOldPosX - stormEngineC.mousePosX) * factordist;
	var factorydim = (stormEngineC.mouseOldPosY - stormEngineC.mousePosY) * factordist;
	var factorx = factorxdim * (this.invsqrt(stormEngineC.stormGLContext.viewportWidth/13000)*1000.0) *0.0000000613; 
	var factory = factorydim * (this.invsqrt(stormEngineC.stormGLContext.viewportHeight/13000)*1000.0) *0.0000000613; 
	var X,Y;
	if(loc) {
		X = $V3([0.0,0.0,1.0]).x(-factorx); 
		Y = $V3([0.0,0.0,1.0]).x(-factory); 
	} else {
		X = stormEngineC.getSelectedNode().MPOS.x(stormEngineC.getSelectedNode().MROTXYZ).getForward().x(-factorx); 
		Y = stormEngineC.getSelectedNode().MPOS.x(stormEngineC.getSelectedNode().MROTXYZ).getForward().x(-factory); 
	}
	return X.add(Y);
};
/**
* Smoothstep
* @returns {Float}
* @param {Float} edge0
* @param {Float} edge1
* @param {Float} current
*/
StormUtils.prototype.smoothstep = function(edge0, edge1, x) {
    if (x < edge0) return 0;
    if (x >= edge1) return 1;
    if (edge0 == edge1) return -1;
    var p = (x - edge0) / (edge1 - edge0);
	
    return (p * p * (3 - 2 * p));
};

/**
* Dot product vector4float
* @param {Array<Float>} vector Vector a
* @param {Array<Float>} vector Vector b
*/
StormUtils.prototype.dot4 = function(vector4A,vector4B) {
	return vector4A[0]*vector4B[0] + vector4A[1]*vector4B[1] + vector4A[2]*vector4B[2] + vector4A[3]*vector4B[3];
};

/**
* Compute the fractional part of the argument. Example: fract(pi)=0.14159265...
* @param {Float} value
*/
StormUtils.prototype.fract = function(number) {
	return number - Math.floor(number);
};

/**
* Pack 1float (0.0-1.0) to 4float rgba (0.0-1.0, 0.0-1.0, 0.0-1.0, 0.0-1.0)
* @returns {Array<Float>}
* @param {Float} value
*/
StormUtils.prototype.pack = function(v) {
	var bias = [1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0];

	var r = v;
	var g = this.fract(r * 255.0);
	var b = this.fract(g * 255.0);
	var a = this.fract(b * 255.0);
	var colour = [r, g, b, a];
	
	var dd = [colour[1]*bias[0],colour[2]*bias[1],colour[3]*bias[2],colour[3]*bias[3]];
	
	return [colour[0]-dd[0],colour[1]-dd[1],colour[2]-dd[2],colour[3]-dd[3] ];
};
/**
* Unpack 4float rgba (0.0-1.0, 0.0-1.0, 0.0-1.0, 0.0-1.0) to 1float (0.0-1.0)
* @returns {Float}
* @param {Array<Float>} value
*/
StormUtils.prototype.unpack = function(colour) {
	var bitShifts = [1.0, 1.0/255.0, 1.0/(255.0*255.0), 1.0/(255.0*255.0*255.0)];
	return this.dot4(colour, bitShifts);
};
/**
* Get pack GLSL function string
* @returns {String}
*/
StormUtils.prototype.packGLSLFunctionString = function() {
	return 'vec4 pack (float depth) {'+
				'const vec4 bias = vec4(1.0 / 255.0,'+
							'1.0 / 255.0,'+
							'1.0 / 255.0,'+
							'0.0);'+

				'float r = depth;'+
				'float g = fract(r * 255.0);'+
				'float b = fract(g * 255.0);'+
				'float a = fract(b * 255.0);'+
				'vec4 colour = vec4(r, g, b, a);'+
				
				'return colour - (colour.yzww * bias);'+
			'}';
};
/**
* Get unpack GLSL function string
* @returns {String}
*/
StormUtils.prototype.unpackGLSLFunctionString = function() {
	return 'float unpack (vec4 colour) {'+
				'const vec4 bitShifts = vec4(1.0,'+
								'1.0 / 255.0,'+
								'1.0 / (255.0 * 255.0),'+
								'1.0 / (255.0 * 255.0 * 255.0));'+
				'return dot(colour, bitShifts);'+
			'}';
};
/** @private  */
StormUtils.prototype.isPowerOfTwo = function(x) {
    return (x & (x - 1)) == 0;
};
/** @private  */
StormUtils.prototype.nextHighestPowerOfTwo = function(x) {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
};
/** @private */
StormUtils.prototype.getElementPosition = function(element) {
	var elem=element, tagname="", x=0, y=0;
   
	while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
	   y += elem.offsetTop;
	   x += elem.offsetLeft;
	   tagname = elem.tagName.toUpperCase();

	   if(tagname == "BODY")
		  elem=0;

	   if(typeof(elem) == "object") {
		  if(typeof(elem.offsetParent) == "object")
			 elem = elem.offsetParent;
	   }
	}

	return {x: x, y: y};
};
/** @private */
StormUtils.prototype.getWebGLContextFromCanvas = function(canvas, ctxOpt) {
	var gl;
	try {
		if(ctxOpt == undefined) gl = canvas.getContext("webgl");
		else gl = canvas.getContext("webgl", ctxOpt);
	} catch(e) {
		gl = null;
    }
	if(gl == null) {
		try {
			if(ctxOpt == undefined) gl = canvas.getContext("experimental-webgl");
			else gl = canvas.getContext("experimental-webgl", ctxOpt);
		} catch(e) {
			gl = null;
		}
	}
	if(gl == null) gl = false;
	return gl;
};
/** @private */
StormUtils.prototype.fullScreen = function() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}; 
/*
var arrayPick = new Uint8Array((this.viewportWidth * this.viewportHeight) * 4); 
this.gl.readPixels(0, 0, this.viewportWidth, this.viewportHeight, this.gl.RGBA, this.gl.UNSIGNED_BYTE, arrayPick);

var ctx2DS = document.getElementById('stormCanvasS').getContext("2d");
cd = ctx2DS.getImageData(0, 0, this.viewportWidth, this.viewportHeight);
for (var row = 0; row < this.viewportHeight; row++) {
		for (var col = 0; col < this.viewportWidth; col++) {
			var idx = ((row * this.viewportWidth) + col);
			var idxData = idx*4;
			cd.data[idxData+0] = arrayPick[idxData];
			cd.data[idxData+1] = arrayPick[idxData+1];
			cd.data[idxData+2] = arrayPick[idxData+2];
			cd.data[idxData+3] = 255;
		}
	}
	
ctx2DS.putImageData(cd, 0, 0);
*/
	
/*
var img = document.getElementById('stormCanvas').toDataURL("image/jpeg");
$('#gg').html("<img src=\"" + img + "\" width=\"320\" height=\"480\"/>");
*/
