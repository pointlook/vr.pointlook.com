 // ELECTROMAGNETIC RADIATION RENDER BY ROBERTO GONZALEZ DOMINGUEZ

// 2 degree field of view
// table of 1931 CIE XYZ matching functions.
// data from: http://cvrl.ioo.ucl.ac.uk/database/data/cmfs/ciexyz31_1.txt
/**
* @class
* @constructor
*/
StormRenderEMR = function(jsonin) {
	this.canvasRenderObject = document.getElementById(jsonin.target);
	this.callback = (jsonin.callback != undefined) ? jsonin.callback : undefined;
	this.viewportWidth = (jsonin.width != undefined) ? jsonin.width : 256;
	this.viewportHeight = (jsonin.height != undefined) ? jsonin.height : 256;
	
	this.currentFrameNumber = 0;
	this.frameStart = (jsonin.frameStart != undefined) ? jsonin.frameStart : 0;
	this.frameEnd = (jsonin.frameEnd != undefined) ? jsonin.frameEnd : 0;
	
	this.ctx2Drender = this.canvasRenderObject.getContext("2d");
	this.canvasData = this.ctx2Drender.getImageData(0, 0, this.viewportWidth, this.viewportHeight);
	
	this.canvasDataNoise = stormEngineC.stormGLContext.arrayTEX_noise;
	this.ambientColor = stormEngineC.stormGLContext.ambientColor;
	
	this.nodes = stormEngineC.nodes;
	this.lights = stormEngineC.lights;
	this.EMR_Materials = stormEngineC.EMR_Materials;
	
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnRender == true) {
			if(this.nodes[n].materialEMR == undefined) {
				alert('All objects must have EMR absorption spectrum');
				return;
			}
		}
	}
	for(var n = 0, f = this.lights.length; n < f; n++) {
		if(this.lights[n].materialEMR == undefined) {
			alert('All lights must have EMR emission spectrum (for now only one light)');
			return;
		}
	}
	
	
	
	
	this.CIEXYZ_1931 = [];
	var idCIE_360_830 = 0;
	for(var n=360, f = 830; n<=f; n++) {
		if(n>=380 && n<=780) {
			var idxC = stormEngineC.MaterialEditor._CIEXYZ_1931_table[idCIE_360_830];
			this.CIEXYZ_1931.push([idxC[0], idxC[1], idxC[2], idxC[3]]);
		}
		idCIE_360_830++;
	}
	
	this.sample = 1;
	this.SHOWRAYS = false;
	this.selectedPassLight = 0;
	
	var strXYZ_colorX = '__constant float xyzX[401] = {';
	var strXYZ_colorY = '__constant float xyzY[401] = {';
	var strXYZ_colorZ = '__constant float xyzZ[401] = {';
	var strDeltasX = '__constant float deltasX[401] = {';
	var strDeltasY = '__constant float deltasY[401] = {';
	var strDeltasZ = '__constant float deltasZ[401] = {';
	
	var tableLength = this.CIEXYZ_1931.length;
	var _xyz_colors = []; // 359-831
	var _xyz_deltas = []; // 360-830
	
	_xyz_colors[0] = stormEngineC.MaterialEditor.xyz_color(0.0, 0.0, 0.0);
	var separat = '';
	for(var i = 0, fi = tableLength; i < fi; i++) {
		_xyz_colors[i+1] = stormEngineC.MaterialEditor.xyz_color(this.CIEXYZ_1931[i][1], this.CIEXYZ_1931[i][2], this.CIEXYZ_1931[i][3]);
		strXYZ_colorX += separat+this.CIEXYZ_1931[i][1].toFixed(12)+'f';
		strXYZ_colorY += separat+this.CIEXYZ_1931[i][2].toFixed(12)+'f';
		strXYZ_colorZ += separat+this.CIEXYZ_1931[i][3].toFixed(12)+'f';
		separat = ',';
	}
	_xyz_colors[tableLength+1] = stormEngineC.MaterialEditor.xyz_color(0.0, 0.0, 0.0);
	
	strXYZ_colorX += '};\n';
	strXYZ_colorY += '};\n';
	strXYZ_colorZ += '};\n';
	
	separat = '';
	for(var i = 0, fi = tableLength; i < fi; i++) {
		_xyz_deltas[i] = _xyz_colors[i+1].subtract(_xyz_colors[i]);
		strDeltasX += separat+_xyz_deltas[i].e[0].toFixed(12)+'f';
		strDeltasY += separat+_xyz_deltas[i].e[1].toFixed(12)+'f';
		strDeltasZ += separat+_xyz_deltas[i].e[2].toFixed(12)+'f';
		separat = ',';
	}
	strDeltasX += '};\n';
	strDeltasY += '};\n';
	strDeltasZ += '};\n';
			
			
	var kernelSrc_X = ''+
	'__constant float3 ambientColor = (float3)('+this.ambientColor.e[0].toFixed(4)+'f,'+this.ambientColor.e[1].toFixed(4)+'f,'+this.ambientColor.e[2].toFixed(4)+'f);\n'+
	strXYZ_colorX+
	strXYZ_colorY+
	strXYZ_colorZ+
	strDeltasX+
	strDeltasY+
	strDeltasZ;

	for(var nA = 0, fnA = this.EMR_Materials.length; nA < fnA; nA++) {
		kernelSrc_X +='__constant float mat'+nA+'[401] = {';
		var separat = ',';
		for(var n = 0, f = 400; n <= f; n++) {
			if(n == 400) {separat = '';}
			kernelSrc_X += (Math.min(1.0,this.EMR_Materials[nA].spectrum[n])).toFixed(4)+'f'+separat;
		}
		kernelSrc_X += '};\n';
	}
	kernelSrc_X += ''+
	//'__constant uint MAXBOUNCES = 3;\n'+
	
	/*'float randR(float2 co){\n'+
		'float i;\n'+
		'return fabs(fract(sin(dot(co.xy ,(float2)(12.9898, 78.233))) * 43758.5453, &i));\n'+
	'}\n'+*/
	
	// xyz_from_wavelength - ColorPy - Mark Kness - mkness@alumni.utexas.net (http://markkness.net/colorpy/ColorPy.html)
	'float3 xyz_from_wavelength(uint wl_nm) {\n'+ // Given a wavelength (nm), return the corresponding xyz color, for unit intensity.
		'uint start_wl_nm = 360;\n'+
		'uint end_wl_nm   = 830;\n'+
		// separate wl_nm into integer and fraction
		'uint int_wl_nm = wl_nm;\n'+
		'float frac_wl_nm = wl_nm - (float)(int_wl_nm);\n'+
		
		'if((int_wl_nm < start_wl_nm - 1) || (int_wl_nm > end_wl_nm + 1)){return (float3)(0.0, 0.0, 0.0);}\n'+ // skip out of range (invisible) wavelengths
		
		'uint index = int_wl_nm - start_wl_nm + 1;\n'+ // get index into main table
		// apply linear interpolation to get the color
		'return (float3)(xyzX[index], xyzY[index], xyzZ[index])+((float3)(deltasX[index], deltasY[index], deltasZ[index])*frac_wl_nm);\n'+
	'}\n'+
	// XYZtoRGB @author dvs, hlp (http://rsbweb.nih.gov/ij/plugins/download/Color_Space_Converter.java)
	'float3 XYZtoRGB(float3 XYZ) {\n'+
		'float3 MsrgbR = (float3)(3.2406f, -1.5372f, -0.4986f);\n'+
		'float3 MsrgbG = (float3)(-0.9689f,  1.8758f,  0.0415f);\n'+
		'float3 MsrgbB = (float3)(0.0557f, -0.2040f,  1.0570f);\n'+
		
		'float x = XYZ.x / 100.0f;\n'+
		'float y = XYZ.y / 100.0f;\n'+
		'float z = XYZ.z / 100.0f;\n'+

		// [r g b] = [X Y Z][Msrgb]
		'float r = (x * MsrgbR.x) + (y * MsrgbR.y) + (z * MsrgbR.z);\n'+
		'float g = (x * MsrgbG.x) + (y * MsrgbG.y) + (z * MsrgbG.z);\n'+
		'float b = (x * MsrgbB.x) + (y * MsrgbB.y) + (z * MsrgbB.z);\n'+

		// assume sRGB
		'if(r > 0.0031308f) {\n'+
			'r = ((1.055f * pow(r, 1.0f / 2.4f)) - 0.055f);\n'+
		'} else {\n'+
			'r = (r * 12.92f);\n'+
		'}\n'+
		'if(g > 0.0031308f) {\n'+
			'g = ((1.055f * pow(g, 1.0f / 2.4f)) - 0.055f);\n'+
		'} else {\n'+
			'g = (g * 12.92f);\n'+
		'}\n'+
		'if(b > 0.0031308f) {\n'+
			'b = ((1.055f * pow(b, 1.0f / 2.4f)) - 0.055f);\n'+
		'} else {\n'+
			'b = (b * 12.92f);\n'+
		'}\n'+

		'r = (r < 0.0f) ? 0.0f : r;\n'+
		'g = (g < 0.0f) ? 0.0f : g;\n'+
		'b = (b < 0.0f) ? 0.0f : b;\n'+

		'return (float3)(r, g, b);\n'+
	'}\n'+
	
	'float3 refract(float3 V, float3 N, float n1, float n2) {\n'+
		'float refrIndex = n1/n2;\n'+
        'float cosI = -dot( N, V );\n'+
        'float cosT2 = 1.0f - refrIndex * refrIndex * (1.0f - cosI * cosI);\n'+
        'return (refrIndex * V) + (refrIndex * cosI - sqrt( cosT2 )) * N;\n'+
	'}\n'+
	'float3 reflectA(float3 I, float3 N) {'+
		'return I - 2.0f * dot(N,I) * N;\n'+
	'}'+
	'float3 getVector(float3 vecNormal, float Ns, float2 vecNoise) {\n'+
		'float angleLat = acos(vecNormal.z);\n'+
		'float angleAzim = atan2(vecNormal.y,vecNormal.x);\n'+
				
		'float desvX = -1.0f+(vecNoise.x*2.0f);\n'+
		'float desvY = -1.0f+(vecNoise.y*2.0f);\n'+
		'angleLat += (Ns*desvX)*1.6f;\n'+
		'angleAzim += (Ns*desvY)*1.6f;\n'+

		'float x = sin(angleLat)*cos(angleAzim);\n'+
		'float y = sin(angleLat)*sin(angleAzim);\n'+
		'float z = cos(angleLat);\n'+
		
		'return (float3)(x,y,z);\n'+
	'}\n'+
	
	/*'float16 transpose(float16 m) {\n'+
		'return (float16) (m.s0,m.s4,m.s8,m.sc,m.s1,m.s5,m.s9,m.sd,m.s2,m.s6,m.sa,m.se,m.s3,m.s7,m.sb,m.sf);\n'+
	'}\n'+
	'float16 inverse(float16 m) {\n'+
		'float16 src = transpose(m);\n'+
		'float16 tmp;\n'+
		'float16 dst;\n'+
		
		'tmp.s0 = src.sa * src.sf;\n'+
		'tmp.s1 = src.sb * src.se;\n'+
		'tmp.s2 = src.s9  * src.sf;\n'+
		'tmp.s3 = src.sb * src.sd;\n'+
		'tmp.s4 = src.s9  * src.se;\n'+
		'tmp.s5 = src.sa * src.sd;\n'+
		'tmp.s6 = src.s8  * src.sf;\n'+
		'tmp.s7 = src.sb * src.sc;\n'+
		'tmp.s8 = src.s8  * src.se;\n'+
		'tmp.s9 = src.sa * src.sc;\n'+
		'tmp.sa = src.s8 * src.sd;\n'+
		'tmp.sb = src.s9 * src.sc;\n'+
		'dst.s0  = tmp.s0*src.s5 + tmp.s3*src.s6 + tmp.s4*src.s7;\n'+
		'dst.s0 -= tmp.s1*src.s5 + tmp.s2*src.s6 + tmp.s5*src.s7;\n'+
		'dst.s1  = tmp.s1*src.s4 + tmp.s6*src.s6 + tmp.s9*src.s7;\n'+
		'dst.s1 -= tmp.s0*src.s4 + tmp.s7*src.s6 + tmp.s8*src.s7;\n'+
		'dst.s2  = tmp.s2*src.s4 + tmp.s7*src.s5 + tmp.sa*src.s7;\n'+
		'dst.s2 -= tmp.s3*src.s4 + tmp.s6*src.s5 + tmp.sb*src.s7;\n'+
		'dst.s3  = tmp.s5*src.s4 + tmp.s8*src.s5 + tmp.sb*src.s6;\n'+
		'dst.s3 -= tmp.s4*src.s4 + tmp.s9*src.s5 + tmp.sa*src.s6;\n'+
		'dst.s4  = tmp.s1*src.s1 + tmp.s2*src.s2 + tmp.s5*src.s3;\n'+
		'dst.s4 -= tmp.s0*src.s1 + tmp.s3*src.s2 + tmp.s4*src.s3;\n'+
		'dst.s5  = tmp.s0*src.s0 + tmp.s7*src.s2 + tmp.s8*src.s3;\n'+
		'dst.s5 -= tmp.s1*src.s0 + tmp.s6*src.s2 + tmp.s9*src.s3;\n'+
		'dst.s6  = tmp.s3*src.s0 + tmp.s6*src.s1 + tmp.sb*src.s3;\n'+
		'dst.s6 -= tmp.s2*src.s0 + tmp.s7*src.s1 + tmp.sa*src.s3;\n'+
		'dst.s7  = tmp.s4*src.s0 + tmp.s9*src.s1 + tmp.sa*src.s2;\n'+
		'dst.s7 -= tmp.s5*src.s0 + tmp.s8*src.s1 + tmp.sb*src.s2;\n'+
		
		'tmp.s0  = src.s2*src.s7;\n'+
		'tmp.s1  = src.s3*src.s6;\n'+
		'tmp.s2  = src.s1*src.s7;\n'+
		'tmp.s3  = src.s3*src.s5;\n'+
		'tmp.s4  = src.s1*src.s6;\n'+
		'tmp.s5  = src.s2*src.s5;\n'+
		'tmp.s6  = src.s0*src.s7;\n'+
		'tmp.s7  = src.s3*src.s4;\n'+
		'tmp.s8  = src.s0*src.s6;\n'+
		'tmp.s9  = src.s2*src.s4;\n'+
		'tmp.sa = src.s0*src.s5;\n'+
		'tmp.sb = src.s1*src.s4;\n'+
		'dst.s8   = tmp.s0 * src.sd  + tmp.s3 * src.se  + tmp.s4 * src.sf;\n'+
		'dst.s8  -= tmp.s1 * src.sd  + tmp.s2 * src.se  + tmp.s5 * src.sf;\n'+
		'dst.s9   = tmp.s1 * src.sc  + tmp.s6 * src.se  + tmp.s9 * src.sf;\n'+
		'dst.s9  -= tmp.s0 * src.sc  + tmp.s7 * src.se  + tmp.s8 * src.sf;\n'+
		'dst.sa  = tmp.s2 * src.sc  + tmp.s7 * src.sd  + tmp.sa* src.sf;\n'+
		'dst.sa -= tmp.s3 * src.sc  + tmp.s6 * src.sd  + tmp.sb* src.sf;\n'+
		'dst.sb  = tmp.s5 * src.sc  + tmp.s8 * src.sd  + tmp.sb* src.se;\n'+
		'dst.sb -= tmp.s4 * src.sc  + tmp.s9 * src.sd  + tmp.sa* src.se;\n'+
		'dst.sc  = tmp.s2 * src.sa  + tmp.s5 * src.sb  + tmp.s1 * src.s9;\n'+
		'dst.sc -= tmp.s4 * src.sb  + tmp.s0 * src.s9   + tmp.s3 * src.sa;\n'+
		'dst.sd  = tmp.s8 * src.sb  + tmp.s0 * src.s8   + tmp.s7 * src.sa;\n'+
		'dst.sd -= tmp.s6 * src.sa  + tmp.s9 * src.sb  + tmp.s1 * src.s8;\n'+
		'dst.se  = tmp.s6 * src.s9   + tmp.sb* src.sb  + tmp.s3 * src.s8;\n'+
		'dst.se -= tmp.sa* src.sb + tmp.s2 * src.s8   + tmp.s7 * src.s9;\n'+
		'dst.sf  = tmp.sa* src.sa  + tmp.s4 * src.s8   + tmp.s9 * src.s9;\n'+
		'dst.sf -= tmp.s8 * src.s9   + tmp.sb* src.sa  + tmp.s5 * src.s8;\n'+
		
		'float det = src.s0*dst.s0 + src.s1*dst.s1 + src.s2*dst.s2 + src.s3*dst.s3;\n'+
		
		'return (float16) (dst.s0*det,dst.s1*det,dst.s2*det,dst.s3*det,dst.s4*det,dst.s5*det,dst.s6*det,dst.s7*det,dst.s8*det,dst.s9*det,dst.sa*det,dst.sb*det,dst.sc*det,dst.sd*det,dst.se*det,dst.sf*det);\n'+
	'}'+
	'float16 mul(float16 mA, float16 mB) {\n'+
		'return (float16)(	(mA.s0*mB.s0) + (mA.s1*mB.s4) + (mA.s2*mB.s8) + (mA.s3*mB.sc),'+
							'(mA.s0*mB.s1) + (mA.s1*mB.s5) + (mA.s2*mB.s9) + (mA.s3*mB.sd),'+
							'(mA.s0*mB.s2) + (mA.s1*mB.s6) + (mA.s2*mB.sa) + (mA.s3*mB.se),'+
							'(mA.s0*mB.s3) + (mA.s1*mB.s7) + (mA.s2*mB.sb) + (mA.s3*mB.sf),'+
							'(mA.s4*mB.s0) + (mA.s5*mB.s4) + (mA.s6*mB.s8) + (mA.s7*mB.sc),'+
							'(mA.s4*mB.s1) + (mA.s5*mB.s5) + (mA.s6*mB.s9) + (mA.s7*mB.sd),'+
							'(mA.s4*mB.s2) + (mA.s5*mB.s6) + (mA.s6*mB.sa) + (mA.s7*mB.se),'+
							'(mA.s4*mB.s3) + (mA.s5*mB.s7) + (mA.s6*mB.sb) + (mA.s7*mB.sf),'+
							'(mA.s8*mB.s0) + (mA.s9*mB.s4) + (mA.sa*mB.s8) + (mA.sb*mB.sc),'+
							'(mA.s8*mB.s1) + (mA.s9*mB.s5) + (mA.sa*mB.s9) + (mA.sb*mB.sd),'+
							'(mA.s8*mB.s2) + (mA.s9*mB.s6) + (mA.sa*mB.sa) + (mA.sb*mB.se),'+
							'(mA.s8*mB.s3) + (mA.s9*mB.s7) + (mA.sa*mB.sb) + (mA.sb*mB.sf),'+
							'(mA.sc*mB.s0) + (mA.sd*mB.s4) + (mA.se*mB.s8) + (mA.sf*mB.sc),'+
							'(mA.sc*mB.s1) + (mA.sd*mB.s5) + (mA.se*mB.s9) + (mA.sf*mB.sd),'+
							'(mA.sc*mB.s2) + (mA.sd*mB.s6) + (mA.se*mB.sa) + (mA.sf*mB.se),'+
							'(mA.sc*mB.s3) + (mA.sd*mB.s7) + (mA.se*mB.sb) + (mA.sf*mB.sf));'+
	'}\n'+*/
	
	//RAY TRIANGLE INTERSECT http://www.softsurfer.com/Archive/algorithm_0105/algorithm_0105.htm
	'float3 setRayTriangle(float3 vecRayOrigin, float3 vecRayEnd, float3 vecVertexA, float3 vecVertexB, float3 vecVertexC, float3 u, float3 v, float3 n) {\n'+
		'float SMALL_NUM = 0.00000001f;\n'+

		'float3 dir = vecRayEnd-vecRayOrigin;\n'+ // direccion del rayo
		'float3 w0 = vecRayOrigin-vecVertexA;\n'+
		'float a = -dot(n, w0);\n'+
		'float b = dot(n, dir);\n'+
		'if(fabs(b) < SMALL_NUM) {\n'+
			'if(a == 0.0f) {\n'+ // intersecta paralelo a triangulo 
				//this.p = 0.01;
				//return 0.0;
			'} else {return (float3)(0.0f,0.0f,0.0f);}\n'+
		'}\n'+

		'float r = a / b;\n'+ // distancia al punto de interseccion
		'if (r < 0.0f && r > 1.0f) {return (float3)(0.0f,0.0f,0.0f);}\n'+ // si mayor a vecRayEnd no intersecta

		'float3 I = vecRayOrigin+r*dir;\n'+ // vector desde origen a punto de intersección

		'float uu = dot(u,u);\n'+
		'float uv = dot(u,v);\n'+
		'float vv = dot(v,v);\n'+
		'float3 w = I-vecVertexA;\n'+
		'float wu = dot(w,u);\n'+
		'float wv = dot(w,v);\n'+
		'float D = (uv * uv) - (uu * vv);\n'+
		
		'float s = ((uv * wv) - (vv * wu)) / D;\n'+
		'if(s < 0.0f || s > 1.0f) {return (float3)(0.0f,0.0f,0.0f);}\n'+ // interseccion esta fuera del triangulo
			 
		'float t = ((uv * wu) - (uu * wv)) / D;\n'+
		'if(t < 0.0f || (s + t) > 1.0f) {return (float3)(0.0f,0.0f,0.0f);}\n'+ // interseccion esta fuera del triangulo
		
		'return (float3)(fast_length(dir)*r, s, t);\n'+ // interseccion esta dentro del triangulo
	'}\n\n'+
	
	'float8 setRayLens(float3 vecRayOrigin, float3 vecRayEnd, float3 vecView, float3 centroPlanoProyeccion, float3 vecXPlanoProyeccion, float3 vecYPlanoProyeccion, float m1, float m2) {\n'+
		'float col = -1.0f;\n'+
		
		'float3 rayOrigin = (float3)(vecRayOrigin.x, vecRayOrigin.y, vecRayOrigin.z);\n'+
		'float3 rayEnd = (float3)(vecRayEnd.x, vecRayEnd.y, vecRayEnd.z);\n'+
		
		'float3 dir = rayEnd-rayOrigin;\n'+
		'dir = fast_normalize(dir);\n'+
		
		'float widthLens = 0.5f;'+
		'float heightLens = 0.5f;'+
		'float3 vecVertexA = centroPlanoProyeccion+(vecXPlanoProyeccion*-widthLens);\n'+ //top-left
		'vecVertexA += vecYPlanoProyeccion*heightLens;\n'+
		'float3 vecVertexB = centroPlanoProyeccion+(vecXPlanoProyeccion*-widthLens);\n'+ //bottom-left
		'vecVertexB += vecYPlanoProyeccion*-heightLens;\n'+
		'float3 vecVertexC = centroPlanoProyeccion+(vecXPlanoProyeccion*widthLens);\n'+ //top-right
		'vecVertexC += vecYPlanoProyeccion*heightLens;\n'+
		'float3 vecVertexD = centroPlanoProyeccion+(vecXPlanoProyeccion*widthLens);\n'+ //bottom-right
		'vecVertexD += vecYPlanoProyeccion*-heightLens;\n'+
		
		'float ang = 0.4f;\n'+ // lens curvature TODO
		'float3 rayEndF; float3 outRayend; float3 norA; float3 norB; float3 norC; float3 norD; float3 normal; float wA; float wB; float wC; float3 vecNormalRefract;\n'+
		'float3 u; float3 v;float3 tmpNormal;\n'+
		
		'u = vecVertexB-vecVertexA;\n'+
		'v = vecVertexC-vecVertexA;\n'+
		'tmpNormal = cross(u,v);\n'+
		
		'float3 rt = setRayTriangle(rayOrigin, rayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
		'float intersectDistance = rt.s0;\n'+
		'if(intersectDistance != 0.0f) {\n'+
			'if((rt.s1 > 0.1f && rt.s1 < 0.9f) && (rt.s2 > 0.1f && rt.s2 < 0.9f)) {'+ // diafragma
				'rayEndF = rayOrigin+(dir*intersectDistance);\n'+
				
					'norA = fast_normalize( vecView+((vecXPlanoProyeccion*-ang)+(vecYPlanoProyeccion*ang)) );\n'+
					'norB = fast_normalize( vecView+((vecXPlanoProyeccion*-ang)+(vecYPlanoProyeccion*-ang)) );\n'+
					'norC = fast_normalize( vecView+((vecXPlanoProyeccion*ang)+(vecYPlanoProyeccion*ang)) );\n'+
					
					'wA = (1.0f-(rt.s1+rt.s2));\n'+
					'wB = rt.s1;\n'+
					'wC = rt.s2;\n'+
					
					'norA = (norA-vecView)*wA;\n'+
					'norB = (norB-vecView)*wB;\n'+
					'norC = (norC-vecView)*wC;\n'+
					'normal = vecView+norA;\n'+
					'normal += norB;\n'+
					'normal += norC;\n'+
					'normal = fast_normalize(normal);\n'+
					
				'vecNormalRefract = refract(dir, normal, m1, m2);\n'+
				'outRayend = fast_normalize(vecNormalRefract);\n'+
				
				'col = 1.0f;\n'+
			'}\n'+
		'}\n'+
	 
		'u = vecVertexB-vecVertexD;\n'+
		'v = vecVertexC-vecVertexD;\n'+
		'tmpNormal = cross(u,v);\n'+
		
		'if(col == -1.0f) {\n'+
			'rt = setRayTriangle(rayOrigin, rayEnd, vecVertexD, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
			'intersectDistance = rt.s0;\n'+
			'if(intersectDistance != 0.0f) {\n'+
				'if((rt.s1 > 0.1f && rt.s1 < 0.9f) && (rt.s2 > 0.1f && rt.s2 < 0.9f)) {'+ // diafragma
					'rayEndF = rayOrigin+(dir*intersectDistance);\n'+
						
						'norD = fast_normalize( vecView+((vecXPlanoProyeccion*ang)+(vecYPlanoProyeccion*-ang)) );\n'+ 
						'norB = fast_normalize( vecView+((vecXPlanoProyeccion*-ang)+(vecYPlanoProyeccion*-ang)) );\n'+ 
						'norC = fast_normalize( vecView+((vecXPlanoProyeccion*ang)+(vecYPlanoProyeccion*ang)) );\n'+
					
						'wA = (1.0f-(rt.s1+rt.s2));\n'+
						'wB = rt.s1;\n'+
						'wC = rt.s2;\n'+
						
						'norD = (norD-vecView)*wA;\n'+
						'norB = (norB-vecView)*wB;\n'+
						'norC = (norC-vecView)*wC;\n'+
						'normal = vecView+norD;\n'+
						'normal += norB;\n'+
						'normal += norC;\n'+
						'normal = fast_normalize(normal);\n'+
						
					'vecNormalRefract = refract(dir, normal, m1, m2);\n'+
					'outRayend = fast_normalize(vecNormalRefract);\n'+
					
					'col = 1.0f;\n'+
				'}\n'+
			'}\n'+
		'}\n'+
		
		
		'return (float8)(col, rayEndF.s0, rayEndF.s1, rayEndF.s2, outRayend.s0, outRayend.s1, outRayend.s2, 0.0f);\n'+
	'}\n'+
	
	
	
	
	
	
	
	
	// PIXEL LOCATION IN TEXTURE
	'uint3 getUVTextureIdx(float3 coordTexA, float3 coordTexB, float3 coordTexC, float u, float v, int TEXwidth, int TEXheight, __read_only image2d_t image) {\n'+
		'const sampler_t sampler = CLK_NORMALIZED_COORDS_FALSE|CLK_ADDRESS_CLAMP|CLK_FILTER_NEAREST;'+
		'float wA = (1.0f-(u+v));\n'+
		'float wB = u;\n'+
		'float wC = v;\n'+
		
		'float s = ((coordTexA.x*wA)+(coordTexB.x*wB)+(coordTexC.x*wC))/(wA+wB+wC);\n'+
		'float t = ((coordTexA.y*wA)+(coordTexB.y*wB)+(coordTexC.y*wC))/(wA+wB+wC);\n'+
		
		//'s = 1.0-s;'+
		't = 1.0f-t;'+
		
		's *= TEXwidth;\n'+
		't *= TEXheight;\n'+
		
		'return read_imageui(image, sampler, (int2)(s, t)).xyz;'+
		
		//'return ( ((uint)(t) * TEXwidth) +(uint)(s))*4;'+
	'}\n'+
	

	
	'__kernel void kernelSetZero('+
							'__global float* NearDistance,'+ // 0
							'__global float* SecNearDistance,'+ // 1
							'__global float* noiseX,'+ // 2
							'__global float* noiseY,'+ // 3
							'__global float* Ns,'+ // 4
							'__global uint* sample,'+ // 5
							'__global float* TotalColorX,'+ // 6
							'__global float* TotalColorY,'+ // 7
							'__global float* TotalColorZ,'+ // 8
							'__global float* TotalShadow'+ // 9
							') {\n'+
							
			'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
			
			
			
			'Ns[x] = -1.0f;\n'+
			
			'NearDistance[x] = 1000000.0f;\n'+
			'SecNearDistance[x] = 1000000.0f;\n'+
			
			'sample[x] = 0;\n'+
			'TotalColorX[x] = 0.0f;\n'+
			'TotalColorY[x] = 0.0f;\n'+
			'TotalColorZ[x] = 0.0f;\n'+
			'TotalShadow[x] = 1.0f;\n'+
	'}'+
	

	'float3 vcross(float3 vec1, float3 vec2) {'+
		'return (float3)( vec1.y * vec2.z - vec1.z * vec2.y, vec1.z * vec2.x - vec1.x * vec2.z, vec1.x * vec2.y - vec1.y * vec2.x );'+
	'}'+
	'__kernel void kernelPrimary('+
							'__global float* noiseX,'+ // 0
							'__global float* noiseY,'+ // 1
							'__global float* Ns,'+ // 2
							'__global float* RayOriginx,'+ // 3
							'__global float* RayOriginy,'+ // 4
							'__global float* RayOriginz,'+ // 5
							'__global float* Normalx,'+ // 6
							'__global float* Normaly,'+ // 7
							'__global float* Normalz,'+ // 8
							'__global float* DirInix,'+ // 9
							'__global float* DirIniy,'+ // 10
							'__global float* DirIniz,'+ // 11
							'__global float* RayEndX,'+ // 12
							'__global float* RayEndY,'+ // 13
							'__global float* RayEndZ,'+ // 14
							'float LightPosX,'+ // 15
							'float LightPosY,'+ // 16
							'float LightPosZ,'+ // 17
							'uint CurrentMaterialLight,'+ // 18
							this.argumentsNm()+
							') {\n'+

		'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
		
		'float3 vecRayEnd;'+
		'float3 dirInicial;\n'+
		'if(Ns[x] == -1.0f) {\n'+
			this.setInitialPower()+ 
			'RayOriginx[x] = LightPosX;\n'+
			'RayOriginy[x] = LightPosY;\n'+
			'RayOriginz[x] = LightPosZ;\n'+ 
			'DirInix[x] = 0.01f;'+ // TODO 
			'DirIniy[x] = -1.0f;'+
			'DirIniz[x] = 0.01f;'+
			'dirInicial = fast_normalize((float3)(DirInix[x], DirIniy[x], DirIniz[x]));\n'+ 
			'float3 vecBRDF = getVector(dirInicial, 0.8928571428571429f*2.0f, (float2)(noiseX[x],noiseY[x]));\n'+ // TODO lightAperture. Now 360.
			'vecRayEnd =fast_normalize(vecBRDF);\n'+ 
		'} else {\n'+
			'float3 pNormal = (float3)(Normalx[x],Normaly[x],Normalz[x]);\n'+
			'dirInicial = (float3)(DirInix[x], DirIniy[x], DirIniz[x]);\n'+
			'if(Ns[x] == 0.0f) {\n'+ // specular
				'float3 vecSPECULAR = reflectA(dirInicial, pNormal);\n'+
				'vecRayEnd = fast_normalize(vecSPECULAR);\n'+ 
			'} else if(Ns[x] == 0.8928571428571429) {\n'+ // lambertian
				'float3 vecBRDF = getVector(pNormal, Ns[x], (float2)(noiseX[x],noiseY[x]));\n'+
				'vecRayEnd = fast_normalize(vecBRDF);\n'+
			'} else {'+
				'float3 vecSPECULAR = reflectA(dirInicial, pNormal);\n'+
				'float3 vecBRDF = getVector(vecSPECULAR, Ns[x]*fmax(0.0f,dot(pNormal,vecSPECULAR)), (float2)(noiseX[x],noiseY[x]));\n'+
				'vecRayEnd = fast_normalize(vecBRDF);\n'+ 
			'}\n'+
			
		'}\n'+ 
		'RayEndX[x] = vecRayEnd.x;'+
		'RayEndY[x] = vecRayEnd.y;'+
		'RayEndZ[x] = vecRayEnd.z;'+

		
	'}\n'+
	'__kernel void kernelSecundaryRays('+
							'__global float* noiseX,'+ // 0
							'__global float* noiseY,'+ // 1
							'float VAx,'+ // 2
							'float VAy,'+ // 3
							'float VAz,'+ // 4
							'float VBx,'+ // 5
							'float VBy,'+ // 6
							'float VBz,'+ // 7
							'float VCx,'+ // 8
							'float VCy,'+ // 9
							'float VCz,'+ // 10
							'float TEXAx,'+ // 11
							'float TEXAy,'+ // 12
							'float TEXAz,'+ // 13
							'float TEXBx,'+ // 14
							'float TEXBy,'+ // 15
							'float TEXBz,'+ // 16
							'float TEXCx,'+ // 17
							'float TEXCy,'+ // 18
							'float TEXCz,'+ // 19
							'float NORAx,'+ // 20
							'float NORAy,'+ // 21
							'float NORAz,'+ // 22
							'unsigned int TEXwidth,'+ // 23
							'unsigned int TEXheight,'+ // 24
							'unsigned int NodeTypeLight,'+ // 25
							'unsigned int CurrentLightType,'+ // 26		0 sun - 1 omni
							'float CurrentNs,'+ // 27
							'__global uint* SecNearNodeTypeLight,'+ // 28
							'__global float* SecNearDistance,'+ // 29
							'__global float* Ns,'+ // 30
							'__global float* NsSec,'+ // 31
							'__global float* RayOriginx,'+ // 32
							'__global float* RayOriginy,'+ // 33
							'__global float* RayOriginz,'+ // 34
							'__global float* RayOriginSecx,'+ // 35
							'__global float* RayOriginSecy,'+ // 36
							'__global float* RayOriginSecz,'+ // 37
							'__global float* Normalx,'+ // 38
							'__global float* Normaly,'+ // 39
							'__global float* Normalz,'+ // 40
							'__global float* NormalSecx,'+ // 41
							'__global float* NormalSecy,'+ // 42
							'__global float* NormalSecz,'+ // 43
							'__global float* DirInix,'+ // 44
							'__global float* DirIniy,'+ // 45
							'__global float* DirIniz,'+ // 46
							'__global float* SecDirInix,'+ // 47
							'__global float* SecDirIniy,'+ // 48
							'__global float* SecDirIniz,'+ // 49
							'__global float* RayEndX,'+ // 50
							'__global float* RayEndY,'+ // 51
							'__global float* RayEndZ,'+ // 52
							'__global float* SecundaryColorx,'+ // 53
							'__global float* SecundaryColory,'+ // 54
							'__global float* SecundaryColorz,'+ // 55
							'__global float* SecundaryColorAcumx,'+ // 56
							'__global float* SecundaryColorAcumy,'+ // 57
							'__global float* SecundaryColorAcumz,'+ // 58
							'uint sinNombre,'+ // 59
							'uint final,'+ // 60
							'uint currBounce,'+ // 61
							'__global float* StoreRayOriginx,'+ // 62
							'__global float* StoreRayOriginy,'+ // 63
							'__global float* StoreRayOriginz,'+ // 64
							'__global float* StoreNormalx,'+ // 65
							'__global float* StoreNormaly,'+ // 66
							'__global float* StoreNormalz,'+ // 67
							'__global float* StoreDirInix,'+ // 68
							'__global float* StoreDirIniy,'+ // 69
							'__global float* StoreDirIniz,'+ // 70
							'__global float* StoreSecNs,'+ // 71
							'__global float* light,'+ // 72
							'__global float* TotalColorX,'+ // 73
							'__global float* TotalColorY,'+ // 74
							'__global float* TotalColorZ,'+ // 75
							'__global float* TotalShadow,'+ // 76
							'__global float* NearDistance,'+ // 77
							'__global uint* NearNodeTypeLight,'+ // 78
							'__global uint* sample,'+ // 79
							'__global uint* OutColorx,'+ // 80
							'__global uint* OutColory,'+ // 81
							'__global uint* OutColorz,'+ // 82
							'__global float* PrimaryColorMx,'+ // 83
							'__global float* PrimaryColorMy,'+ // 84
							'__global float* PrimaryColorMz,'+ // 85
							'__global float* hitFilm,'+ // 86
							'__global uint* idpix,'+ // 87
							'__global float* reflectWeight,'+ // 88
							'__global uint* material,'+ // 89
							'uint CurrentMaterial'+ // 90
							') {\n'+

		'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
		
		'float3 dataRayTriangle;float3 vecRayOrigin;float3 vecRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;float3 tmpNormal;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;\n'+
		'float3 vecNorA;\n'+
		
		'vecVertexA = (float3)(VAx, VAy, VAz);\n'+
		'vecVertexB = (float3)(VBx, VBy, VBz);\n'+
		'vecVertexC = (float3)(VCx, VCy, VCz);\n'+
		'coordTexA = (float3)(TEXAx, TEXAy, TEXAz);\n'+
		'coordTexB = (float3)(TEXBx, TEXBy, TEXBz);\n'+
		'coordTexC = (float3)(TEXCx, TEXCy, TEXCz);\n'+
		'u = vecVertexB-vecVertexA;\n'+
		'v = vecVertexC-vecVertexA;\n'+
		'tmpNormal = cross(u,v);\n'+
		
		'vecRayOrigin = (float3)(RayOriginx[x],RayOriginy[x],RayOriginz[x]);'+
		'vecRayEnd = (float3)(RayEndX[x],RayEndY[x],RayEndZ[x]);'+
		
		'dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayOrigin+(vecRayEnd*20000.0f), vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
		'if(dataRayTriangle.s0 > 0.0f){\n'+
			'float3 vecRayOriginSec = vecRayOrigin+(vecRayEnd*(dataRayTriangle.s0-0.005f));\n'+
			'float distA = 0.0f;'+
			'distA = fabs(fast_length(vecRayOrigin-vecRayOriginSec));'+
			'if(distA < SecNearDistance[x]) {\n'+
				'SecNearDistance[x] = distA;\n'+
				 
				'RayOriginSecx[x] = vecRayOriginSec.x;\n'+
				'RayOriginSecy[x] = vecRayOriginSec.y;\n'+
				'RayOriginSecz[x] = vecRayOriginSec.z;\n'+
				
				'vecNorA = (float3)(NORAx, NORAy, NORAz);\n'+
				'float3 pNormalSec = fast_normalize(vecNorA);\n'+
				'NormalSecx[x] = pNormalSec.x;\n'+
				'NormalSecy[x] = pNormalSec.y;\n'+
				'NormalSecz[x] = pNormalSec.z;\n'+
				
				'SecNearNodeTypeLight[x] = NodeTypeLight;\n'+
				'NsSec[x] = CurrentNs;\n'+ 
				
				'material[x] = CurrentMaterial;\n'+
				
				'SecDirInix[x] = vecRayEnd.x;\n'+ 
				'SecDirIniy[x] = vecRayEnd.y;\n'+
				'SecDirIniz[x] = vecRayEnd.z;\n'+
				
				/*'uint3 pix = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, TEXwidth, TEXheight, image);\n'+
				'SecundaryColorAcumx[x] = pix.x/255.0f;\n'+
				'SecundaryColorAcumy[x] = pix.y/255.0f;\n'+
				'SecundaryColorAcumz[x] = pix.z/255.0f;\n'+*/
			'}\n'+
		'}\n'+
		
	'}\n'+
	
	'__kernel void kernelSecundaryRaysP('+
							'__global float* SecNearDistance,'+ // 0
							'__global float* Ns,'+ // 1
							'__global float* NsSec,'+ // 2
							'__global float* RayOriginx,'+ // 3
							'__global float* RayOriginy,'+ // 4
							'__global float* RayOriginz,'+ // 5
							'__global float* RayOriginSecx,'+ // 6
							'__global float* RayOriginSecy,'+ // 7
							'__global float* RayOriginSecz,'+ // 8
							'__global float* Normalx,'+ // 9
							'__global float* Normaly,'+ // 10
							'__global float* Normalz,'+ // 11
							'__global float* NormalSecx,'+ // 12
							'__global float* NormalSecy,'+ // 13
							'__global float* NormalSecz,'+ // 14
							'__global float* DirInix,'+ // 15
							'__global float* DirIniy,'+ // 16
							'__global float* DirIniz,'+ // 17
							'__global float* SecDirInix,'+ // 18
							'__global float* SecDirIniy,'+ // 19
							'__global float* SecDirIniz,'+ // 20
							'__global float* TotalShadow,'+ // 21
							'__global float* hitFilm,'+ // 22
							'__global uint* idpix,'+ // 23
							'__global float* reflectWeight,'+ // 24
							'__global uint* material,'+ // 25
							'float camerax,'+ // 26
							'float cameray,'+ // 27
							'float cameraz,'+ // 28
							'float cameraPivotx,'+ // 29
							'float cameraPivoty,'+ // 30
							'float cameraPivotz,'+ // 31
							'float focusIntern'+ // 32
							') {\n'+

		'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
		
		'float3 dataRayTriangle;float3 vecShadowRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 vecVertexD;float3 u; float3 v;float3 tmpNormal;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;float3 coordTexD;\n'+
		'float3 vecNorA;\n'+
		
		'float3 vecRayOrigin = (float3)(RayOriginx[x], RayOriginy[x], RayOriginz[x]);\n'+
		'float3 vecRayEnd = (float3)(SecDirInix[x], SecDirIniy[x], SecDirIniz[x]);\n'+
		
		// PROCESATION
		'hitFilm[x] = 0.0f;'+
		'float reflectW = 0.0f;'+
		'if(Ns[x] != -1.0f) {\n'+
			'float Iangle = fabs(dot(vecRayEnd,(float3)(Normalx[x],Normaly[x],Normalz[x])));\n'+
			'float Rangle = fabs(dot((float3)(DirInix[x], DirIniy[x], DirIniz[x]),(float3)(Normalx[x],Normaly[x],Normalz[x])));\n'+
			'reflectW = Iangle*Rangle;\n'+
		'}\n'+
		'reflectWeight[x] = reflectW;\n'+
		
		'uint change = 1;\n'+
		
		'float Fz = focusIntern;'+ // lens-film distance
		'float ratioFilm = (focusIntern/22.23990000000007f)*8.09f;\n'+
		'float widthFilm = ratioFilm;'+
		'float heightFilm = ratioFilm;'+
		'float IOR = 1.46f;'+ // TODO
		'float3 posCamera = (float3)(camerax, cameray, cameraz+0.00001f);'+
		'float3 posCameraPivot = (float3)(cameraPivotx, cameraPivoty, cameraPivotz);'+
		'float3 vecView = posCameraPivot-posCamera;\n'+
		'float3 centroPlanoProyeccion = posCamera+(vecView*1.0f);\n'+
		'float3 vecXPlanoProyeccion = -fast_normalize(cross((float3)(0.0f,1.0f,0.0f), vecView));\n'+
		'float3 vecYPlanoProyeccion = -fast_normalize(cross(vecView, vecXPlanoProyeccion));\n'+   
					
		//col, rayEndF.s0, rayEndF.s1, rayEndF.s2, outRayend.s0, outRayend.s1, outRayend.s2, 0.0f
		'float8 rl = setRayLens(vecRayOrigin, vecRayOrigin+(vecRayEnd*20000.0f), vecView, centroPlanoProyeccion, vecXPlanoProyeccion, vecYPlanoProyeccion, 1.00029f, IOR);\n'+
		 
		'if( (rl.s0 == 1.0f) && (dot(vecRayEnd,vecView) < 0.0f)) {\n'+  
			'float dst = fabs(fast_length(vecRayOrigin-(float3)(rl.s1, rl.s2, rl.s3)));\n'+ 
			'if(dst < SecNearDistance[x]) {'+
				'change = 0;\n'+ 
				
				'vecRayOrigin = (float3)(rl.s1, rl.s2, rl.s3);\n'+ 
				'vecRayEnd = vecRayOrigin+((float3)(rl.s4, rl.s5, rl.s6)*20000.0f);\n'+
			
				'vecVertexA = centroPlanoProyeccion+(vecXPlanoProyeccion*-widthFilm);\n'+ //top-left
				'vecVertexA += vecYPlanoProyeccion*heightFilm;\n'+
				'vecVertexA += vecView*-Fz;\n'+ 
				'vecVertexB = centroPlanoProyeccion+(vecXPlanoProyeccion*-widthFilm);\n'+ //bottom-left
				'vecVertexB += vecYPlanoProyeccion*-heightFilm;\n'+
				'vecVertexB += vecView*-Fz;\n'+
				'vecVertexC = centroPlanoProyeccion+(vecXPlanoProyeccion*widthFilm);\n'+ //top-right
				'vecVertexC += vecYPlanoProyeccion*heightFilm;\n'+
				'vecVertexC += vecView*-Fz;\n'+
				'vecVertexD = centroPlanoProyeccion+(vecXPlanoProyeccion*widthFilm);\n'+ //bottom-right
				'vecVertexD += vecYPlanoProyeccion*-heightFilm;\n'+
				'vecVertexD += vecView*-Fz;\n'+ 
				
				'coordTexA = (float3)(0.0f, 1.0f, 0.0f);\n'+
				'coordTexB = (float3)(0.0f, 0.0f, 0.0f);\n'+
				'coordTexC = (float3)(1.0f, 1.0f, 0.0f);\n'+
				'coordTexD = (float3)(1.0f, 0.0f, 0.0f);\n'+
				
				'u = vecVertexB-vecVertexA;\n'+
				'v = vecVertexC-vecVertexA;\n'+
				'tmpNormal = cross(u,v);\n'+
				'dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+ 
				'if(dataRayTriangle.s0 > 0.0f){\n'+
					//'if(dataRayTriangle.s0 < SecNearDistance[x]) {\n'+
					
						'float wA = (1.0f-(dataRayTriangle.s1+dataRayTriangle.s2));\n'+
						'float wB = dataRayTriangle.s1;\n'+
						'float wC = dataRayTriangle.s2;\n'+
						
						'float s = ((coordTexA.x*wA)+(coordTexB.x*wB)+(coordTexC.x*wC))/(wA+wB+wC);\n'+
						'float t = ((coordTexA.y*wA)+(coordTexB.y*wB)+(coordTexC.y*wC))/(wA+wB+wC);\n'+
						
						's = 1.0f-s;'+ 
						//'t = 1.0f-t;'+
						
						's *= '+this.viewportWidth+';\n'+
						't *= '+this.viewportHeight+';\n'+
						
						'hitFilm[x] = 1.0f;'+
						'idpix[x] = ( ((uint)(t) * (uint)('+this.viewportWidth+')) +(uint)(s));'+

					//'}\n'+
				'}\n'+
				
				'u = vecVertexB-vecVertexD;\n'+
				'v = vecVertexC-vecVertexD;\n'+
				'tmpNormal = cross(u,v);\n'+
				'dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexD, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
				'if(dataRayTriangle.s0 > 0.0f){\n'+
					//'if(dataRayTriangle.s0 < SecNearDistance[x]) {\n'+
					
						'float wA = (1.0f-(dataRayTriangle.s1+dataRayTriangle.s2));\n'+
						'float wB = dataRayTriangle.s1;\n'+
						'float wC = dataRayTriangle.s2;\n'+
						
						'float s = ((coordTexD.x*wA)+(coordTexB.x*wB)+(coordTexC.x*wC))/(wA+wB+wC);\n'+
						'float t = ((coordTexD.y*wA)+(coordTexB.y*wB)+(coordTexC.y*wC))/(wA+wB+wC);\n'+
						
						's = 1.0f-s;'+ 
						//'t = 1.0f-t;'+
						
						's *= '+this.viewportWidth+';\n'+
						't *= '+this.viewportHeight+';\n'+
						
						'hitFilm[x] = 1.0f;'+
						'idpix[x] = ( ((uint)(t) * (uint)('+this.viewportWidth+')) +(uint)(s));'+
							
					//'}\n'+
				'}\n'+
			'}\n'+
			
		'}\n'+
		
		'if(SecNearDistance[x] == 1000000.0f) {\n'+
			'change = 0;\n'+
		'}\n'+
		'if(TotalShadow[x] <= 0.2f) {\n'+
			'change = 0;\n'+  
		'}\n'+
		
		'if(change == 0) {\n'+
			'Ns[x] = -1.0f;\n'+
		'} else {\n'+
			'Ns[x] = NsSec[x];\n'+
			'RayOriginx[x] = RayOriginSecx[x];\n'+
			'RayOriginy[x] = RayOriginSecy[x];\n'+
			'RayOriginz[x] = RayOriginSecz[x];\n'+
			'Normalx[x] = NormalSecx[x];\n'+
			'Normaly[x] = NormalSecy[x];\n'+
			'Normalz[x] = NormalSecz[x];\n'+
			'DirInix[x] = SecDirInix[x];\n'+
			'DirIniy[x] = SecDirIniy[x];\n'+
			'DirIniz[x] = SecDirIniz[x];\n'+
		'}\n'+
		
		
		'SecNearDistance[x] = 1000000.0f;\n'+
		
	'}\n'+
	
	'__kernel void kernelSecundaryRaysF('+
										'__global float* hitFilm,'+ // 0
										'__global uint* idpix,'+ // 1
										'__global float* TotalColorX,'+ // 2
										'__global float* TotalColorY,'+ // 3
										'__global float* TotalColorZ,'+ // 4
										'__global float* TotalShadow,'+ // 5
										'__global uint* sample,'+ // 6
										'__global uint* OutColorx,'+ // 7
										'__global uint* OutColory,'+ // 8
										'__global uint* OutColorz,'+ // 9
										'__global float* reflectWeight,'+ // 10
										'__global float* Ns,'+ // 11
										'__global uint* material,'+ // 12
										this.argumentsNm()+
										') {\n'+
		
		'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
		

		'if(Ns[x] == -1.0f) {'+
			'TotalShadow[x] = 1.0f;\n'+ 
		'} else {\n'+
			this.setPower()+
			'TotalShadow[x] -= 0.1f;\n'+
		'}'+
		
	'}\n'+
	
	'__kernel void kernelSecundaryRaysC('+
										'__global float* hitFilm,'+ // 0
										'__global uint* idpix,'+ // 1
										'__global float* TotalColorX,'+ // 2
										'__global float* TotalColorY,'+ // 3
										'__global float* TotalColorZ,'+ // 4
										'__global float* TotalShadow,'+ // 5
										'__global uint* sample,'+ // 6
										'__global uint* OutColorx,'+ // 7
										'__global uint* OutColory,'+ // 8
										'__global uint* OutColorz,'+ // 9
										'__global float* reflectWeight,'+ // 10
										'__global float* Ns,'+ // 11
										this.argumentsNm()+
										') {\n'+
		
		'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
		
		'if(hitFilm[x] == 1.0f) {'+
			this.getColors()+
			'float3 rgb = XYZtoRGB(XYZ);\n'+
			
			//'if( (rgb.x>=0.0f && rgb.y>=0.0f && rgb.z>=0.0f)&&(rgb.x<=1.0f && rgb.y<=1.0f && rgb.z<=1.0f) ) {'+
				/*'sample[idpix[x]]++;\n'+
				'TotalColorX[idpix[x]] += rgb.x;\n'+
				'TotalColorY[idpix[x]] += rgb.y;\n'+
				'TotalColorZ[idpix[x]] += rgb.z;\n'+
				'OutColorx[idpix[x]] = (TotalColorX[idpix[x]]/(float)(sample[idpix[x]]))*255;\n'+
				'OutColory[idpix[x]] = (TotalColorY[idpix[x]]/(float)(sample[idpix[x]]))*255;\n'+
				'OutColorz[idpix[x]] = (TotalColorZ[idpix[x]]/(float)(sample[idpix[x]]))*255;\n'+*/
				
				//'if(sample[idpix[x]] < 10) {'+
					'sample[idpix[x]]++;\n'+
					'TotalColorX[idpix[x]] += rgb.x*TotalShadow[x];\n'+ 
					'TotalColorY[idpix[x]] += rgb.y*TotalShadow[x];\n'+
					'TotalColorZ[idpix[x]] += rgb.z*TotalShadow[x];\n'+
					'OutColorx[idpix[x]] = (uint)(TotalColorX[idpix[x]]*255.0f)/sample[idpix[x]];\n'+
					'OutColory[idpix[x]] = (uint)(TotalColorY[idpix[x]]*255.0f)/sample[idpix[x]];\n'+
					'OutColorz[idpix[x]] = (uint)(TotalColorZ[idpix[x]]*255.0f)/sample[idpix[x]];\n'+  
				//'}'+ 
			//'}'+ 
			
		'}'+
		
	'}\n';
		
	var clProgram_X = clContext.createProgramWithSource(kernelSrc_X);
	try {
		clProgram_X.buildProgram([clDevices[0]], "");
	} catch(e) {
		alert("Failed to build WebCL program. Error "+clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_STATUS)+":  "+ clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_LOG));
		throw e;
	}
	this.clKernel_setZero = clProgram_X.createKernel("kernelSetZero");
	this.clKernel_Primary = clProgram_X.createKernel("kernelPrimary");
	this.clKernel_SecundaryRays = clProgram_X.createKernel("kernelSecundaryRays");
	this.clKernel_SecundaryRaysP = clProgram_X.createKernel("kernelSecundaryRaysP");
	this.clKernel_SecundaryRaysC = clProgram_X.createKernel("kernelSecundaryRaysC");
	this.clKernel_SecundaryRaysF = clProgram_X.createKernel("kernelSecundaryRaysF");
	
	this.arrSize = (this.viewportWidth*this.viewportHeight); // typed arrays length
	this.bufferSize = (this.arrSize*4); // buffers length
	


	this.updateObjects();
	
	this.buffPrimaryColorx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffPrimaryColory = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffPrimaryColorz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffPrimaryColorMx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffPrimaryColorMy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffPrimaryColorMz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	
	this.buffSecundaryColorAcumx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecundaryColorAcumy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecundaryColorAcumz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	

	
	this.buffSecundaryColorx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecundaryColory = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecundaryColorz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.bufflight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	
	
	
	this.buffTotalColorX = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffTotalColorY = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffTotalColorZ = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffTotalShadow = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffOutColorx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayOutColorx = new Uint32Array(this.arrSize);
	this.buffOutColory = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayOutColory = new Uint32Array(this.arrSize);
	this.buffOutColorz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayOutColorz = new Uint32Array(this.arrSize);
	this.buffSample = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.arrBuffersNm = [];
	for(var n = 0, f = 400; n <= f; n++) {
		this.arrBuffersNm[n] = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	}
	//CL_MEM_READ_ONLY - CL_MEM_WRITE_ONLY - CL_MEM_READ_WRITE	
	this.buffNearNodeTypeLight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecNearNodeTypeLight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffNearDistance = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNearDistance = new Float32Array(this.arrSize);
	this.buffSecNearDistance = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecNearDistance = new Float32Array(this.arrSize);
	
	this.buffNs = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffNsSec = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreSecNs = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffRayOriginx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayOriginx = new Float32Array(this.arrSize);
	this.buffRayOriginy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayOriginy = new Float32Array(this.arrSize);
	this.buffRayOriginz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayOriginz = new Float32Array(this.arrSize);
	this.buffSecRayOriginx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecRayOriginx = new Float32Array(this.arrSize);
	this.buffSecRayOriginy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecRayOriginy = new Float32Array(this.arrSize);
	this.buffSecRayOriginz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecRayOriginz = new Float32Array(this.arrSize);
	this.buffStoreRayOriginx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreRayOriginy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreRayOriginz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffRayEndx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffRayEndy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffRayEndz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffHitFilm = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffIDPIX = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffReflectWeight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffMaterials = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffNormalx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffNormaly = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffNormalz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecNormalx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecNormaly = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecNormalz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreNormalx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreNormaly = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreNormalz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffDirInix = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffDirIniy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffDirIniz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecDirInix = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecDirIniy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecDirIniz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreDirInix = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreDirIniy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreDirIniz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffNoisex = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNoisex = new Float32Array(this.arrSize);
	this.buffNoisey = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNoisey = new Float32Array(this.arrSize);

		
	//setZero
	this.clKernel_setZero.setKernelArg(0, this.buffNearDistance);
	this.clKernel_setZero.setKernelArg(1, this.buffSecNearDistance);
	this.clKernel_setZero.setKernelArg(2, this.buffNoisex);
	this.clKernel_setZero.setKernelArg(3, this.buffNoisey);
	this.clKernel_setZero.setKernelArg(4, this.buffNs);
	this.clKernel_setZero.setKernelArg(5, this.buffSample); 
	this.clKernel_setZero.setKernelArg(6, this.buffTotalColorX); 
	this.clKernel_setZero.setKernelArg(7, this.buffTotalColorY); 
	this.clKernel_setZero.setKernelArg(8, this.buffTotalColorZ); 
	this.clKernel_setZero.setKernelArg(9, this.buffTotalShadow); 
	

	
	
	// primary
	this.clKernel_Primary.setKernelArg(0, this.buffNoisex);
	this.clKernel_Primary.setKernelArg(1, this.buffNoisey);
	this.clKernel_Primary.setKernelArg(2, this.buffNs);
	this.clKernel_Primary.setKernelArg(3, this.buffRayOriginx);
	this.clKernel_Primary.setKernelArg(4, this.buffRayOriginy);
	this.clKernel_Primary.setKernelArg(5, this.buffRayOriginz);
	this.clKernel_Primary.setKernelArg(6, this.buffNormalx);
	this.clKernel_Primary.setKernelArg(7, this.buffNormaly);
	this.clKernel_Primary.setKernelArg(8, this.buffNormalz);
	this.clKernel_Primary.setKernelArg(9, this.buffDirInix);
	this.clKernel_Primary.setKernelArg(10, this.buffDirIniy);
	this.clKernel_Primary.setKernelArg(11, this.buffDirIniz);
	this.clKernel_Primary.setKernelArg(12, this.buffRayEndx);
	this.clKernel_Primary.setKernelArg(13, this.buffRayEndy);
	this.clKernel_Primary.setKernelArg(14, this.buffRayEndz);
	this.globalsPrimary(19);
	// secundary rays
	this.clKernel_SecundaryRays.setKernelArg(0, this.buffNoisex);
	this.clKernel_SecundaryRays.setKernelArg(1, this.buffNoisey);
	this.clKernel_SecundaryRays.setKernelArg(28, this.buffSecNearNodeTypeLight);
	this.clKernel_SecundaryRays.setKernelArg(29, this.buffSecNearDistance);
	this.clKernel_SecundaryRays.setKernelArg(30, this.buffNs);
	this.clKernel_SecundaryRays.setKernelArg(31, this.buffNsSec);
	this.clKernel_SecundaryRays.setKernelArg(32, this.buffRayOriginx);
	this.clKernel_SecundaryRays.setKernelArg(33, this.buffRayOriginy);
	this.clKernel_SecundaryRays.setKernelArg(34, this.buffRayOriginz);
	this.clKernel_SecundaryRays.setKernelArg(35, this.buffSecRayOriginx);
	this.clKernel_SecundaryRays.setKernelArg(36, this.buffSecRayOriginy);
	this.clKernel_SecundaryRays.setKernelArg(37, this.buffSecRayOriginz);
	this.clKernel_SecundaryRays.setKernelArg(38, this.buffNormalx);
	this.clKernel_SecundaryRays.setKernelArg(39, this.buffNormaly);
	this.clKernel_SecundaryRays.setKernelArg(40, this.buffNormalz);
	this.clKernel_SecundaryRays.setKernelArg(41, this.buffSecNormalx);
	this.clKernel_SecundaryRays.setKernelArg(42, this.buffSecNormaly);
	this.clKernel_SecundaryRays.setKernelArg(43, this.buffSecNormalz);
	this.clKernel_SecundaryRays.setKernelArg(44, this.buffDirInix);
	this.clKernel_SecundaryRays.setKernelArg(45, this.buffDirIniy);
	this.clKernel_SecundaryRays.setKernelArg(46, this.buffDirIniz);
	this.clKernel_SecundaryRays.setKernelArg(47, this.buffSecDirInix);
	this.clKernel_SecundaryRays.setKernelArg(48, this.buffSecDirIniy);
	this.clKernel_SecundaryRays.setKernelArg(49, this.buffSecDirIniz);
	this.clKernel_SecundaryRays.setKernelArg(50, this.buffRayEndx);
	this.clKernel_SecundaryRays.setKernelArg(51, this.buffRayEndy);
	this.clKernel_SecundaryRays.setKernelArg(52, this.buffRayEndz);
	this.clKernel_SecundaryRays.setKernelArg(53, this.buffSecundaryColorx);
	this.clKernel_SecundaryRays.setKernelArg(54, this.buffSecundaryColory);
	this.clKernel_SecundaryRays.setKernelArg(55, this.buffSecundaryColorz);
	this.clKernel_SecundaryRays.setKernelArg(56, this.buffSecundaryColorAcumx);
	this.clKernel_SecundaryRays.setKernelArg(57, this.buffSecundaryColorAcumy);
	this.clKernel_SecundaryRays.setKernelArg(58, this.buffSecundaryColorAcumz);
	this.clKernel_SecundaryRays.setKernelArg(62, this.buffStoreRayOriginx);
	this.clKernel_SecundaryRays.setKernelArg(63, this.buffStoreRayOriginy);
	this.clKernel_SecundaryRays.setKernelArg(64, this.buffStoreRayOriginz);
	this.clKernel_SecundaryRays.setKernelArg(65, this.buffStoreNormalx);
	this.clKernel_SecundaryRays.setKernelArg(66, this.buffStoreNormaly);
	this.clKernel_SecundaryRays.setKernelArg(67, this.buffStoreNormalz);
	this.clKernel_SecundaryRays.setKernelArg(68, this.buffStoreDirInix);
	this.clKernel_SecundaryRays.setKernelArg(69, this.buffStoreDirIniy);
	this.clKernel_SecundaryRays.setKernelArg(70, this.buffStoreDirIniz);
	this.clKernel_SecundaryRays.setKernelArg(71, this.buffStoreSecNs);
	this.clKernel_SecundaryRays.setKernelArg(72, this.bufflight);
	this.clKernel_SecundaryRays.setKernelArg(73, this.buffTotalColorX);
	this.clKernel_SecundaryRays.setKernelArg(74, this.buffTotalColorY);
	this.clKernel_SecundaryRays.setKernelArg(75, this.buffTotalColorZ);
	this.clKernel_SecundaryRays.setKernelArg(76, this.buffTotalShadow);
	this.clKernel_SecundaryRays.setKernelArg(77, this.buffNearDistance);
	this.clKernel_SecundaryRays.setKernelArg(78, this.buffNearNodeTypeLight);
	this.clKernel_SecundaryRays.setKernelArg(79, this.buffSample);
	this.clKernel_SecundaryRays.setKernelArg(80, this.buffOutColorx);
	this.clKernel_SecundaryRays.setKernelArg(81, this.buffOutColory);
	this.clKernel_SecundaryRays.setKernelArg(82, this.buffOutColorz);
	this.clKernel_SecundaryRays.setKernelArg(83, this.buffPrimaryColorMx);
	this.clKernel_SecundaryRays.setKernelArg(84, this.buffPrimaryColorMy);
	this.clKernel_SecundaryRays.setKernelArg(85, this.buffPrimaryColorMz);
	this.clKernel_SecundaryRays.setKernelArg(86, this.buffHitFilm);
	this.clKernel_SecundaryRays.setKernelArg(87, this.buffIDPIX);
	this.clKernel_SecundaryRays.setKernelArg(88, this.buffReflectWeight);
	this.clKernel_SecundaryRays.setKernelArg(89, this.buffMaterials);
	
	// secundary rays P
	this.clKernel_SecundaryRaysP.setKernelArg(0, this.buffSecNearDistance);
	this.clKernel_SecundaryRaysP.setKernelArg(1, this.buffNs);
	this.clKernel_SecundaryRaysP.setKernelArg(2, this.buffNsSec);
	this.clKernel_SecundaryRaysP.setKernelArg(3, this.buffRayOriginx);
	this.clKernel_SecundaryRaysP.setKernelArg(4, this.buffRayOriginy);
	this.clKernel_SecundaryRaysP.setKernelArg(5, this.buffRayOriginz);
	this.clKernel_SecundaryRaysP.setKernelArg(6, this.buffSecRayOriginx);
	this.clKernel_SecundaryRaysP.setKernelArg(7, this.buffSecRayOriginy);
	this.clKernel_SecundaryRaysP.setKernelArg(8, this.buffSecRayOriginz);
	this.clKernel_SecundaryRaysP.setKernelArg(9, this.buffNormalx);
	this.clKernel_SecundaryRaysP.setKernelArg(10, this.buffNormaly);
	this.clKernel_SecundaryRaysP.setKernelArg(11, this.buffNormalz);
	this.clKernel_SecundaryRaysP.setKernelArg(12, this.buffSecNormalx);
	this.clKernel_SecundaryRaysP.setKernelArg(13, this.buffSecNormaly);
	this.clKernel_SecundaryRaysP.setKernelArg(14, this.buffSecNormalz);
	this.clKernel_SecundaryRaysP.setKernelArg(15, this.buffDirInix);
	this.clKernel_SecundaryRaysP.setKernelArg(16, this.buffDirIniy);
	this.clKernel_SecundaryRaysP.setKernelArg(17, this.buffDirIniz);
	this.clKernel_SecundaryRaysP.setKernelArg(18, this.buffSecDirInix);
	this.clKernel_SecundaryRaysP.setKernelArg(19, this.buffSecDirIniy);
	this.clKernel_SecundaryRaysP.setKernelArg(20, this.buffSecDirIniz);
	this.clKernel_SecundaryRaysP.setKernelArg(21, this.buffTotalShadow);
	this.clKernel_SecundaryRaysP.setKernelArg(22, this.buffHitFilm);
	this.clKernel_SecundaryRaysP.setKernelArg(23, this.buffIDPIX);
	this.clKernel_SecundaryRaysP.setKernelArg(24, this.buffReflectWeight);
	this.clKernel_SecundaryRaysP.setKernelArg(25, this.buffMaterials);
							
	// secundary rays color
	this.clKernel_SecundaryRaysC.setKernelArg(0, this.buffHitFilm);
	this.clKernel_SecundaryRaysC.setKernelArg(1, this.buffIDPIX);
	this.clKernel_SecundaryRaysC.setKernelArg(2, this.buffTotalColorX);
	this.clKernel_SecundaryRaysC.setKernelArg(3, this.buffTotalColorY);
	this.clKernel_SecundaryRaysC.setKernelArg(4, this.buffTotalColorZ);
	this.clKernel_SecundaryRaysC.setKernelArg(5, this.buffTotalShadow);
	this.clKernel_SecundaryRaysC.setKernelArg(6, this.buffSample);
	this.clKernel_SecundaryRaysC.setKernelArg(7, this.buffOutColorx);
	this.clKernel_SecundaryRaysC.setKernelArg(8, this.buffOutColory);
	this.clKernel_SecundaryRaysC.setKernelArg(9, this.buffOutColorz);
	this.clKernel_SecundaryRaysC.setKernelArg(10, this.buffReflectWeight);
	this.clKernel_SecundaryRaysC.setKernelArg(11, this.buffNs);
	this.globalsNmC(12);
	
	// secundary rays final
	this.clKernel_SecundaryRaysF.setKernelArg(0, this.buffHitFilm);
	this.clKernel_SecundaryRaysF.setKernelArg(1, this.buffIDPIX);
	this.clKernel_SecundaryRaysF.setKernelArg(2, this.buffTotalColorX);
	this.clKernel_SecundaryRaysF.setKernelArg(3, this.buffTotalColorY);
	this.clKernel_SecundaryRaysF.setKernelArg(4, this.buffTotalColorZ);
	this.clKernel_SecundaryRaysF.setKernelArg(5, this.buffTotalShadow);
	this.clKernel_SecundaryRaysF.setKernelArg(6, this.buffSample);
	this.clKernel_SecundaryRaysF.setKernelArg(7, this.buffOutColorx);
	this.clKernel_SecundaryRaysF.setKernelArg(8, this.buffOutColory);
	this.clKernel_SecundaryRaysF.setKernelArg(9, this.buffOutColorz);
	this.clKernel_SecundaryRaysF.setKernelArg(10, this.buffReflectWeight);
	this.clKernel_SecundaryRaysF.setKernelArg(11, this.buffNs);
	this.clKernel_SecundaryRaysF.setKernelArg(12, this.buffMaterials);
	this.globalsNmF(13);
	
	
	
	var maxLocalWS = clDevices[0].getDeviceInfo(WebCL.CL_DEVICE_MAX_WORK_GROUP_SIZE);
	this.localWS = [16,16];
	this.globalWS = [this.viewportWidth,this.viewportHeight]; // Global work item size. Numero total de work-items (kernel en ejecucion)

	var d = new Date();
	this.oldTime = d.getTime();
	
	
};
/** @private */
StormRenderEMR.prototype.argumentsNm = function() {
	var str = '';
	var separat = ',';
	for(var n = 380, f = 780; n <= f; n++) {
		if(n == 780) separat = '';
		str += '__global float* Nm'+n+separat;
	}
	return str;
};
/** @private */
StormRenderEMR.prototype.globalsPrimary = function(numArg) {
	var num = 0;
	for(var n = numArg, f = (numArg+400); n <= f; n++) {
		this.clKernel_Primary.setKernelArg(n, this.arrBuffersNm[num]);
		num++;
	}
};
/** @private */
StormRenderEMR.prototype.globalsNmC = function(numArg) {
	var num = 0;
	for(var n = numArg, f = (numArg+400); n <= f; n++) {
		this.clKernel_SecundaryRaysC.setKernelArg(n, this.arrBuffersNm[num]);
		num++;
	}
};
/** @private */
StormRenderEMR.prototype.globalsNmF = function(numArg) {
	var num = 0;
	for(var n = numArg, f = (numArg+400); n <= f; n++) {
		this.clKernel_SecundaryRaysF.setKernelArg(n, this.arrBuffersNm[num]);
		num++;
	}
};
/** @private */
StormRenderEMR.prototype.setInitialPower = function() {
	var num = 0;
	var str = '';
	for(var n = 380, f = 780; n <= f; n++) {
		//str += 'Nm'+n+'[x] = spd0['+num+']*5.0f;';  // TODO from spectrum of light EMR source. Now continuous spectrum 1.0 intensity.
		//str += 'Nm'+n+'[x] = 1.0f;';
		for(var nA = 0, fnA = this.EMR_Materials.length; nA < fnA; nA++) {
			var matId = this.EMR_Materials[nA].idMaterial;
			str += ''+
			'if(CurrentMaterialLight == '+matId+') {'+
				'Nm'+n+'[x] = mat'+matId+'['+num+'];'+
			'}';
		}
		num++;
	}
	return str;
};
/** @private */
StormRenderEMR.prototype.setPower = function() {
	var num = 0;
	var str = '';
	for(var n = 380, f = 780; n <= f; n++) {
		for(var nA = 0, fnA = this.EMR_Materials.length; nA < fnA; nA++) {
			var matId = this.EMR_Materials[nA].idMaterial;
			str += ''+
			'if(material[x] == '+matId+') {'+
				'Nm'+n+'[x] -= (mat'+matId+'['+num+'])*reflectWeight[x]; Nm'+n+'[x] = fmax(0.0f,Nm'+n+'[x]);\n'+
			'}';
		}
		num++;
	}
	return str;
};
/** @private */
StormRenderEMR.prototype.getColors = function() {
	var num = 0;
	var str = 'float3 XYZ = (float3)(0.0f,0.0f,0.0f);\n';
	for(var n = 380, f = 780; n <= f; n++) {
		str += 'XYZ += xyz_from_wavelength('+n+')*Nm'+n+'[x];\n';
		num++;
	}
	return str;
};
/** @private */
StormRenderEMR.prototype.updateObjects = function() {
	var N_VAx = [];	var N_VAy = [];	var N_VAz = [];
	var N_VBx = [];	var N_VBy = [];	var N_VBz = [];
	var N_VCx = [];	var N_VCy = [];	var N_VCz = [];
	var N_TAx = [];	var N_TAy = [];	var N_TAz = [];
	var N_TBx = [];	var N_TBy = [];	var N_TBz = [];
	var N_TCx = [];	var N_TCy = [];	var N_TCz = [];
	var N_NAx = [];	var N_NAy = [];	var N_NAz = [];
	var numNB = 0;
	var numTRIS = 0;
	this.arrayBuffersTextures = []; 
	
	var format = {channelOrder:WebCL.CL_RGBA, channelDataType:WebCL.CL_UNSIGNED_INT8};
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnRender == true) {
			if(this.nodes[n].materialEMR != undefined) {
				for(var nb = 0, fnb = this.nodes[n].buffersObjects.length; nb < fnb; nb++) {
					for(var b = 0, fb = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b < fb; b++) {
						var saltosIdx = b*3;
						var idxA = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
						var idxB = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+1] * 3;
						var idxC = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+2] * 3;
						
						// VERTEXS
						var VA = this.nodes[n].MPOSFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxA],
																	0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxA+1],
																	0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxA+2],
																	0.0,0.0,0.0,1.0])); // posicion xyz en WORLD SPACE de un vertice
						N_VAx.push(VA.e[3]);N_VAy.push(VA.e[7]);N_VAz.push(VA.e[11]);
						var VB = this.nodes[n].MPOSFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxB],
																	0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxB+1],
																	0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxB+2],
																	0.0,0.0,0.0,1.0]));
						N_VBx.push(VB.e[3]);N_VBy.push(VB.e[7]);N_VBz.push(VB.e[11]);
						var VC = this.nodes[n].MPOSFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxC],
																	0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxC+1],
																	0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxC+2],
																	0.0,0.0,0.0,1.0]));
						N_VCx.push(VC.e[3]);N_VCy.push(VC.e[7]);N_VCz.push(VC.e[11]);
						
						// TEXTURES
						var TEXA = $V3([this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxA], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxA+1], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxA+2]]);
						N_TAx.push('0.'+TEXA.e[0].toString().split('.')[1]);N_TAy.push('0.'+TEXA.e[1].toString().split('.')[1]);N_TAz.push('0.'+TEXA.e[2].toString().split('.')[1]);
						var TEXB = $V3([this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxB], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxB+1], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxB+2]]);
						N_TBx.push('0.'+TEXB.e[0].toString().split('.')[1]);N_TBy.push('0.'+TEXB.e[1].toString().split('.')[1]);N_TBz.push('0.'+TEXB.e[2].toString().split('.')[1]);
						var TEXC = $V3([this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxC], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxC+1], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxC+2]]);
						N_TCx.push('0.'+TEXC.e[0].toString().split('.')[1]);N_TCy.push('0.'+TEXC.e[1].toString().split('.')[1]);N_TCz.push('0.'+TEXC.e[2].toString().split('.')[1]);
						
						// NORMALS
						var NORA = this.nodes[n].MPOSFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshNormalArray[idxA],
																	0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshNormalArray[idxA+1],
																	0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshNormalArray[idxA+2],
																	0.0,0.0,0.0,1.0]));
						N_NAx.push(NORA.e[0]);N_NAy.push(NORA.e[1]);N_NAz.push(NORA.e[2]);
						
						numTRIS++;
					}
					//this.arrayBuffersTextures[numNB] = clContext.createImage2D(WebCL.CL_MEM_READ_ONLY, format,this.nodes[n].materialUnits[0].textureObjectKd.W, this.nodes[n].materialUnits[0].textureObjectKd.H, 0);	
					//var ar = this.nodes[n].materialUnits[0].textureObjectKd.inData;
					//clCmdQueue.enqueueWriteImage(this.arrayBuffersTextures[numNB], true, [0,0,0], [this.nodes[n].materialUnits[0].textureObjectKd.W,this.nodes[n].materialUnits[0].textureObjectKd.H,1], 0, 0, new Uint8Array([ar[0],ar[1],ar[2],ar[3]]), []);
					numNB++;
				}
			}
		}
	}

	this.totalNumbTRIS = numTRIS;
	this.arrayN_VAx = new Float32Array(N_VAx);	this.arrayN_VAy = new Float32Array(N_VAy);	this.arrayN_VAz = new Float32Array(N_VAz);
	this.arrayN_VBx = new Float32Array(N_VBx);	this.arrayN_VBy = new Float32Array(N_VBy);	this.arrayN_VBz = new Float32Array(N_VBz);
	this.arrayN_VCx = new Float32Array(N_VCx);	this.arrayN_VCy = new Float32Array(N_VCy);	this.arrayN_VCz = new Float32Array(N_VCz);
	this.arrayN_TAx = new Float32Array(N_TAx);	this.arrayN_TAy = new Float32Array(N_TAy);	this.arrayN_TAz = new Float32Array(N_TAz);
	this.arrayN_TBx = new Float32Array(N_TBx);	this.arrayN_TBy = new Float32Array(N_TBy);	this.arrayN_TBz = new Float32Array(N_TBz);
	this.arrayN_TCx = new Float32Array(N_TCx);	this.arrayN_TCy = new Float32Array(N_TCy);	this.arrayN_TCz = new Float32Array(N_TCz);
	this.arrayN_NAx = new Float32Array(N_NAx);	this.arrayN_NAy = new Float32Array(N_NAy);	this.arrayN_NAz = new Float32Array(N_NAz);
	
	
};
/** @private */
StormRenderEMR.prototype.setCam = function(nodeCam) {
	// PRIMARY RAYS
	this.sample = 1;
	
	clCmdQueue.enqueueNDRangeKernel(this.clKernel_setZero, this.globalWS.length, [], this.globalWS, this.localWS, []);
	clCmdQueue.finish();

	this.clKernel_SecundaryRaysP.setKernelArg(26, nodeCam.nodeGoal.MPOS.e[3], WebCL.types.FLOAT);
	this.clKernel_SecundaryRaysP.setKernelArg(27, nodeCam.nodeGoal.MPOS.e[7], WebCL.types.FLOAT);
	this.clKernel_SecundaryRaysP.setKernelArg(28, nodeCam.nodeGoal.MPOS.e[11], WebCL.types.FLOAT);
	this.clKernel_SecundaryRaysP.setKernelArg(29, nodeCam.nodePivot.MPOS.e[3], WebCL.types.FLOAT);
	this.clKernel_SecundaryRaysP.setKernelArg(30, nodeCam.nodePivot.MPOS.e[7], WebCL.types.FLOAT);
	this.clKernel_SecundaryRaysP.setKernelArg(31, nodeCam.nodePivot.MPOS.e[11], WebCL.types.FLOAT);
	this.clKernel_SecundaryRaysP.setKernelArg(32, nodeCam.focusIntern, WebCL.types.FLOAT);
	

};
/** @private */
StormRenderEMR.prototype.makeRender = function() {	
	if(typeof(this.callback)== 'function') {
		var d = new Date();
		var currTime = d.getTime();
		var diffTime = (currTime-this.oldTime)/1000;
		this.oldTime = currTime;
		var req = {'sample':this.sample, 'sampleTime':diffTime}
		this.callback(req);
	}
	
	
	

	for(var row = 0, frow = this.viewportHeight; row < frow; row++) {
		for(var col = 0, fcol = this.viewportWidth; col < fcol; col++) {
			var idx = ((row * this.viewportWidth) + col);
			
			this.arrayNoisey[idx] = Math.random();
			this.arrayNoisex[idx] = Math.random();
		}
	}
	clCmdQueue.enqueueWriteBuffer(this.buffNoisex, false, 0, this.bufferSize, this.arrayNoisex, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffNoisey, false, 0, this.bufferSize, this.arrayNoisey, []);// this.bufferSize = vectorLength * 4
	
	this.selectedPassLight++;
	if(this.selectedPassLight == this.lights.length) {this.selectedPassLight=0;}
	this.clKernel_Primary.setKernelArg(15, this.lights[this.selectedPassLight].mrealWMatrixFrame.e[3], WebCL.types.FLOAT);
	this.clKernel_Primary.setKernelArg(16, this.lights[this.selectedPassLight].mrealWMatrixFrame.e[7], WebCL.types.FLOAT);
	this.clKernel_Primary.setKernelArg(17, this.lights[this.selectedPassLight].mrealWMatrixFrame.e[11], WebCL.types.FLOAT);
	this.clKernel_Primary.setKernelArg(18, this.lights[this.selectedPassLight].materialEMR.idMaterial, WebCL.types.UINT);
	clCmdQueue.enqueueNDRangeKernel(this.clKernel_Primary, this.globalWS.length, [], this.globalWS, this.localWS, []);
	clCmdQueue.finish();
	
	if(this.SHOWRAYS) {
		clCmdQueue.enqueueReadBuffer(this.buffRayOriginx, false, 0, (this.bufferSize), this.arrayRayOriginx, []);
		clCmdQueue.enqueueReadBuffer(this.buffRayOriginy, false, 0, (this.bufferSize), this.arrayRayOriginy, []);
		clCmdQueue.enqueueReadBuffer(this.buffRayOriginz, false, 0, (this.bufferSize), this.arrayRayOriginz, []);
		var vo = $V3([this.arrayRayOriginx[0],this.arrayRayOriginy[0],this.arrayRayOriginz[0]]);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////// SECUNDARY RAYS ///////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	//this.LNx = -0.3+(Math.random()*0.6);
	//this.LNy = -0.3+(Math.random()*0.6);
	//this.LNz = -0.3+(Math.random()*0.6); 
	
	var numb = 0;
	var numbNB = 0;
	var numTRIS = 0;
	this.clKernel_SecundaryRays.setKernelArg(61, 1, WebCL.types.UINT);//currBounce
	this.clKernel_SecundaryRays.setKernelArg(25, 0, WebCL.types.UINT);//NodeTypeLight
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnRender == true) {
			if(this.nodes[n].materialEMR != undefined) {
				this.clKernel_SecundaryRays.setKernelArg(26, (this.nodes[n].type == 'sun')?0:1, WebCL.types.UINT);
				this.clKernel_SecundaryRays.setKernelArg(90, this.nodes[n].materialEMR.idMaterial, WebCL.types.UINT);
				for(var nb = 0, fnb = this.nodes[n].buffersObjects.length; nb < fnb; nb++) {
					this.clKernel_SecundaryRays.setKernelArg(23, this.nodes[n].buffersObjects[nb].materialUnits[0].textureObjectKd.W, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(24, this.nodes[n].buffersObjects[nb].materialUnits[0].textureObjectKd.H, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(27, (this.nodes[n].materialEMR.Ns/100.0), WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(59, 1, WebCL.types.UINT);
					for(var b = 0, fb = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b < fb; b++) {
						this.clKernel_SecundaryRays.setKernelArg(2, this.arrayN_VAx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(3, this.arrayN_VAy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(4, this.arrayN_VAz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(5, this.arrayN_VBx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(6, this.arrayN_VBy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(7, this.arrayN_VBz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(8, this.arrayN_VCx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(9, this.arrayN_VCy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(10, this.arrayN_VCz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(11, this.arrayN_TAx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(12, this.arrayN_TAy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(13, this.arrayN_TAz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(14, this.arrayN_TBx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(15, this.arrayN_TBy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(16, this.arrayN_TBz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(17, this.arrayN_TCx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(18, this.arrayN_TCy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(19, this.arrayN_TCz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(20, this.arrayN_NAx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(21, this.arrayN_NAy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(22, this.arrayN_NAz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(60, (numTRIS == this.totalNumbTRIS-1)?1:0, WebCL.types.UINT);//final
						
						clCmdQueue.enqueueNDRangeKernel(this.clKernel_SecundaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
						clCmdQueue.flush();
						numb++;
						numTRIS++;
					}
					numbNB++;
				}
			}
		}
	}
	clCmdQueue.finish();
	clCmdQueue.enqueueNDRangeKernel(this.clKernel_SecundaryRaysP, this.globalWS.length, [], this.globalWS, this.localWS, []);
	clCmdQueue.finish();
	clCmdQueue.enqueueNDRangeKernel(this.clKernel_SecundaryRaysF, this.globalWS.length, [], this.globalWS, this.localWS, []);
	clCmdQueue.finish();
	clCmdQueue.enqueueNDRangeKernel(this.clKernel_SecundaryRaysC, this.globalWS.length, [], this.globalWS, this.localWS, []);
	clCmdQueue.finish();
	if(this.SHOWRAYS) {
		clCmdQueue.enqueueReadBuffer(this.buffSecRayOriginx, false, 0, (this.bufferSize), this.arraySecRayOriginx, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecRayOriginy, false, 0, (this.bufferSize), this.arraySecRayOriginy, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecRayOriginz, false, 0, (this.bufferSize), this.arraySecRayOriginz, []);
		var ve = $V3([this.arraySecRayOriginx[0],this.arraySecRayOriginy[0],this.arraySecRayOriginz[0]]);
		stormEngineC.createLine(vo,ve);
	}
	

	clCmdQueue.enqueueReadBuffer(this.buffOutColorx, false, 0, (this.bufferSize), this.arrayOutColorx, []);
	clCmdQueue.enqueueReadBuffer(this.buffOutColory, false, 0, (this.bufferSize), this.arrayOutColory, []);
	clCmdQueue.enqueueReadBuffer(this.buffOutColorz, false, 0, (this.bufferSize), this.arrayOutColorz, []);
	for(var row = 0, frow = this.viewportHeight; row < frow; row++) {
		for(var col = 0, fcol = this.viewportWidth; col < fcol; col++) {
			var idx = ((row * this.viewportWidth) + col);
			var idxData = idx*4;
			this.canvasData.data[idxData+0] = this.arrayOutColorx[idx];
			this.canvasData.data[idxData+1] = this.arrayOutColory[idx];
			this.canvasData.data[idxData+2] = this.arrayOutColorz[idx];
			this.canvasData.data[idxData+3] = 255;
		}
	}
	
	
	
	
    this.ctx2Drender.putImageData(this.canvasData, 0, 0);
    this.sample++;
	
    if(!stormEngineC.pauseRender){
		this.timerRender = setTimeout("stormEngineC.stormRender.makeRender();",2);
	}
	
	
    /*var pixels =  new Uint8Array(this.canvasData.data);
	
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT0);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);*/
	
	
	//this.glMiniCam.readPixels(0, 0, this.widthHeightMiniCam, this.widthHeightMiniCam, this.glMiniCam.RGBA, this.glMiniCam.UNSIGNED_BYTE, this.arrayImageMiniCam);
};


