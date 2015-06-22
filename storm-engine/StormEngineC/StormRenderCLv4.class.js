/**
* @class
* @constructor
*/
StormRender = function(jsonin) {
	this.canvasRenderObject = document.getElementById(jsonin.target);
	this.callback = (jsonin.callback != undefined) ? jsonin.callback : undefined;
	this.viewportWidth = (jsonin.width != undefined) ? jsonin.width : 256;
	this.viewportHeight = (jsonin.height != undefined) ? jsonin.height : 256;
	
	this.ctx2Drender = this.canvasRenderObject.getContext("2d");
	this.canvasData = this.ctx2Drender.getImageData(0, 0, this.viewportWidth, this.viewportHeight);
	
	this.canvasDataNoise = stormEngineC.stormGLContext.arrayTEX_noise;
	
	
	this.sample = 1;
	this.sampleNoise = 0;
	this.currentFrameNumber = (jsonin.frameStart != undefined) ? jsonin.frameStart : 0;
	this.frameStart = (jsonin.frameStart != undefined) ? jsonin.frameStart : 0;
	this.frameEnd = (jsonin.frameEnd != undefined) ? jsonin.frameEnd : 0;
	this.sendFrameToHost = 1;
	this.receiveFromClient = 0;
	
	this.nodes = stormEngineC.nodes;
	this.lights = stormEngineC.lights;
	this.REALLIGHTLENGTH = stormEngineC.lights.length;
	
	this.MAXBOUNCES = 3; 
	this.ambientColor = stormEngineC.stormGLContext.ambientColor;
	var kernelSrc_X = ''+
	'__constant float3 ambientColor = (float3)('+this.ambientColor.e[0].toFixed(4)+'f,'+this.ambientColor.e[1].toFixed(4)+'f,'+this.ambientColor.e[2].toFixed(4)+'f);\n'+
	//'__constant float points[3] = {0.0000,1.0000,-0.0000};\n'+
	//'__constant uint MAXBOUNCES = 3;\n'+
	/*'float randR(float2 co){\n'+
		'float i;\n'+
		'return fabs(fract(sin(dot(co.xy ,(float2)(12.9898, 78.233))) * 43758.5453, &i));\n'+
	'}\n'+*/
	/*
	float3 refract(float3 V, float3 N, float refrIndex) {
        float cosI = -dot( N, V );
        float cosT2 = 1.0f - refrIndex * refrIndex * (1.0f - cosI * cosI);
        return (refrIndex * V) + (refrIndex * cosI - sqrt( cosT2 )) * N;
	}
	*/
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
			'} else {return 0.0f;}\n'+
		'}\n'+

		'float r = a / b;\n'+ // distancia al punto de interseccion
		'if (r < 0.0f && r > 1.0f) {return 0.0f;}\n'+ // si mayor a vecRayEnd no intersecta

		'float3 I = vecRayOrigin+r*dir;\n'+ // vector desde origen a punto de intersección

		'float uu = dot(u,u);\n'+
		'float uv = dot(u,v);\n'+
		'float vv = dot(v,v);\n'+
		'float3 w = I-vecVertexA;\n'+
		'float wu = dot(w,u);\n'+
		'float wv = dot(w,v);\n'+
		'float D = (uv * uv) - (uu * vv);\n'+
		
		'float s = ((uv * wv) - (vv * wu)) / D;\n'+
		'if(s < 0.0f || s > 1.0f) {return 0.0f;}\n'+ // interseccion esta fuera del triangulo
			 
		'float t = ((uv * wu) - (uu * wv)) / D;\n'+
		'if(t < 0.0f || (s + t) > 1.0f) {return 0.0f;}\n'+ // interseccion esta fuera del triangulo
		
		'return (float3)(fast_length(dir)*r, s, t);\n'+ // interseccion esta dentro del triangulo
	'}\n\n'+
	
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
							'float camerax,'+ // 0
							'float cameray,'+ // 1
							'float cameraz,'+ // 2
							'float cameraPivotx,'+ // 3
							'float cameraPivoty,'+ // 4
							'float cameraPivotz,'+ // 5
							'__global float* RayOriginx,'+ // 6
							'__global float* RayOriginy,'+ // 7
							'__global float* RayOriginz,'+ // 8
							'__global float* RayEndx,'+ // 9
							'__global float* RayEndy,'+ // 10
							'__global float* RayEndz,'+ // 11
							'__global float* NearDistance,'+ // 12
							'__global float* SecNearDistance'+ // 13
							this.argumentsSetZero()+ // 14
							') {\n'+
							
			'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
			
			'float3 posCamera = (float3)(camerax,cameray,cameraz);\n'+
			'float3 posCameraPivot = (float3)(cameraPivotx,cameraPivoty,cameraPivotz);\n'+
			
			'float3 vecView = fast_normalize(posCameraPivot-posCamera);\n'+
			
			'float3 centroPlanoProyeccion = posCamera+(vecView*0.6f);\n'+
			
			'float3 vecXPlanoProyeccion = fast_normalize(cross((float3)(0.0f,1.0f,0.0f), vecView));\n'+
			'float3 vecYPlanoProyeccion = fast_normalize(cross(vecView, vecXPlanoProyeccion));\n'+
			
			'float widthPixel = 1.0f/'+this.viewportWidth+';\n'+
			'float heightPixel = 1.0f/'+this.viewportWidth+';\n'+
			
			'float3 locFirstX = vecXPlanoProyeccion*(('+this.viewportWidth+'/2)*widthPixel);\n'+
			'float3 locFirstY = vecYPlanoProyeccion*(('+this.viewportHeight+'/2)*heightPixel);\n'+
			'float3 pixelOrigin = centroPlanoProyeccion+locFirstX;\n'+
			'pixelOrigin += locFirstY;\n'+
			
			
			'float3 pixelPos = pixelOrigin+(-vecXPlanoProyeccion*(get_global_id(0)*widthPixel));\n'+
			'pixelPos += -vecYPlanoProyeccion*(get_global_id(1)*heightPixel);\n'+
			
			'float3 currentPixelDir = fast_normalize(pixelPos-posCamera);\n'+
			'float3 end = posCamera+(currentPixelDir*20000.0f);\n'+
			
			'RayOriginx[x] = camerax;\n'+
			'RayOriginy[x] = cameray;\n'+
			'RayOriginz[x] = cameraz;\n'+
			'RayEndx[x] = end.x;\n'+
			'RayEndy[x] = end.y;\n'+
			'RayEndz[x] = end.z;\n'+
			

			
			'NearDistance[x] = 1000000.0f;\n'+
			'SecNearDistance[x] = 1000000.0f;\n';
			for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
				if(this.lights[nL].visibleOnRender == true) {
					kernelSrc_X += 'ShadowNearDistance'+nL+'[x] = 1000000.0f;\n';
				}
			}
	kernelSrc_X += ''+
	'}'+
	
	'__kernel void kernelPrimaryRays('+
							'float VAx,'+ // 0
							'float VAy,'+ // 1
							'float VAz,'+ // 2
							'float VBx,'+ // 3
							'float VBy,'+ // 4
							'float VBz,'+ // 5
							'float VCx,'+ // 6
							'float VCy,'+ // 7
							'float VCz,'+ // 8
							'float TEXAx,'+ // 9
							'float TEXAy,'+ // 10
							'float TEXAz,'+ // 11
							'float TEXBx,'+ // 12
							'float TEXBy,'+ // 13
							'float TEXBz,'+ // 14
							'float TEXCx,'+ // 15
							'float TEXCy,'+ // 16
							'float TEXCz,'+ // 17
							'float NORAx,'+ // 18
							'float NORAy,'+ // 19
							'float NORAz,'+ // 20
							'unsigned int TEXwidth,'+ // 21
							'unsigned int TEXheight,'+ // 22
							'unsigned int NodeTypeLight,'+ // 23
							'float CurrentNs,'+ // 24
							'__global uint* NearNodeTypeLight,'+ // 25
							'__global float* NearDistance,'+ // 26
							'__global float* NsSec,'+ // 27
							'__global float* RayOriginx,'+ // 28
							'__global float* RayOriginy,'+ // 29
							'__global float* RayOriginz,'+ // 30
							'__global float* SecRayOriginx,'+ // 31
							'__global float* SecRayOriginy,'+ // 32
							'__global float* SecRayOriginz,'+ // 33
							'__global float* RayEndx,'+ // 34
							'__global float* RayEndy,'+ // 35
							'__global float* RayEndz,'+ // 36
							'__global float* SecNormalx,'+ // 37
							'__global float* SecNormaly,'+ // 38
							'__global float* SecNormalz,'+ // 39
							'__global float* SecDirInix,'+ // 40
							'__global float* SecDirIniy,'+ // 41
							'__global float* SecDirIniz,'+ // 42
							'__global float* PrimaryColorx,'+ // 43
							'__global float* PrimaryColory,'+ // 44
							'__global float* PrimaryColorz,'+ // 45
							'__read_only image2d_t image'+ // 46
							') {\n'+

		'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
		
		'float3 vecRayOrigin;float3 vecRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;\n'+
		'float3 vecNorA;float3 vecNorB;float3 vecNorC;\n'+
		
		'vecVertexA = (float3)(VAx, VAy, VAz);\n'+
		'vecVertexB = (float3)(VBx, VBy, VBz);\n'+
		'vecVertexC = (float3)(VCx, VCy, VCz);\n'+
		'coordTexA = (float3)(TEXAx, TEXAy, TEXAz);\n'+
		'coordTexB = (float3)(TEXBx, TEXBy, TEXBz);\n'+
		'coordTexC = (float3)(TEXCx, TEXCy, TEXCz);\n'+
		'u = vecVertexB-vecVertexA;\n'+
		'v = vecVertexC-vecVertexA;\n'+
		'float3 tmpNormal = cross(u,v);\n'+
		
		'vecRayOrigin = (float3)(RayOriginx[x], RayOriginy[x], RayOriginz[x]);\n'+
		
		'vecRayEnd = (float3)(RayEndx[x], RayEndy[x], RayEndz[x]);\n'+
		
		'float3 dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
		'if(dataRayTriangle.s0 > 0.0f){\n'+
			'if(dataRayTriangle.s0 < NearDistance[x]) {\n'+
				'NearDistance[x] = dataRayTriangle.s0;\n'+
				
				'float3 dirInicial = fast_normalize(vecRayEnd-vecRayOrigin);\n'+
				'float3 vecSecRayOrigin = vecRayOrigin+(dirInicial*(dataRayTriangle.s0-0.005f));\n'+
				'SecRayOriginx[x] = vecSecRayOrigin.x;\n'+
				'SecRayOriginy[x] = vecSecRayOrigin.y;\n'+
				'SecRayOriginz[x] = vecSecRayOrigin.z;\n'+
				
				'vecNorA = (float3)(NORAx, NORAy, NORAz);\n'+
				'float3 pNormal = fast_normalize(vecNorA);\n'+
				'SecNormalx[x] = pNormal.x;\n'+
				'SecNormaly[x] = pNormal.y;\n'+
				'SecNormalz[x] = pNormal.z;\n'+
				
				'NearNodeTypeLight[x] = NodeTypeLight;\n'+
				'NsSec[x] = CurrentNs;\n'+
				
				'SecDirInix[x] = dirInicial.x;\n'+
				'SecDirIniy[x] = dirInicial.y;\n'+
				'SecDirIniz[x] = dirInicial.z;\n'+
				
				'uint3 pix = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, TEXwidth, TEXheight, image);\n'+
				'PrimaryColorx[x] = pix.x/255.0f;\n'+
				'PrimaryColory[x] = pix.y/255.0f;\n'+
				'PrimaryColorz[x] = pix.z/255.0f;\n'+
			'}\n'+
		'}\n'+
			
	'}\n'+
	
	'__kernel void kernelSetPrimary('+
							'__global float* SecRayOriginx,'+ // 0
							'__global float* SecRayOriginy,'+ // 1
							'__global float* SecRayOriginz,'+ // 2
							'__global float* StoreRayOriginx,'+ // 3
							'__global float* StoreRayOriginy,'+ // 4
							'__global float* StoreRayOriginz,'+ // 5
							'__global float* SecNormalx,'+ // 6
							'__global float* SecNormaly,'+ // 7
							'__global float* SecNormalz,'+ // 8
							'__global float* StoreNormalx,'+ // 9
							'__global float* StoreNormaly,'+ // 10
							'__global float* StoreNormalz,'+ // 11
							'__global float* SecDirInix,'+ // 12
							'__global float* SecDirIniy,'+ // 13
							'__global float* SecDirIniz,'+ // 14
							'__global float* StoreDirInix,'+ // 15
							'__global float* StoreDirIniy,'+ // 16
							'__global float* StoreDirIniz,'+ // 17
							'__global float* NsSec,'+ // 18
							'__global float* StoreSecNs,'+ // 19
							'__global uint* sample,'+ // 20
							'__global float* TotalColorX,'+ // 21
							'__global float* TotalColorY,'+ // 22
							'__global float* TotalColorZ,'+ // 23
							'__global float* TotalShadow'+ // 24
							') {\n'+
							
			'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
			
			'StoreRayOriginx[x] = SecRayOriginx[x];\n'+
			'StoreRayOriginy[x] = SecRayOriginy[x];\n'+
			'StoreRayOriginz[x] = SecRayOriginz[x];\n'+
			'StoreNormalx[x] = SecNormalx[x];\n'+
			'StoreNormaly[x] = SecNormaly[x];\n'+
			'StoreNormalz[x] = SecNormalz[x];\n'+
			'StoreDirInix[x] = SecDirInix[x];\n'+
			'StoreDirIniy[x] = SecDirIniy[x];\n'+
			'StoreDirIniz[x] = SecDirIniz[x];\n'+
			'StoreSecNs[x] = NsSec[x];\n'+
			'sample[x] = 0;\n'+
			'TotalColorX[x] = 0.0;\n'+
			'TotalColorY[x] = 0.0;\n'+
			'TotalColorZ[x] = 0.0;\n'+
			'TotalShadow[x] = 0.0;\n'+
	'}\n'+
	'__kernel void kernelGetPrimary('+
							'__global float* RayOriginx,'+ // 0
							'__global float* RayOriginy,'+ // 1
							'__global float* RayOriginz,'+ // 2
							'__global float* StoreRayOriginx,'+ // 3
							'__global float* StoreRayOriginy,'+ // 4
							'__global float* StoreRayOriginz,'+ // 5
							'__global float* Normalx,'+ // 6
							'__global float* Normaly,'+ // 7
							'__global float* Normalz,'+ // 8
							'__global float* StoreNormalx,'+ // 9
							'__global float* StoreNormaly,'+ // 10
							'__global float* StoreNormalz,'+ // 11
							'__global float* DirInix,'+ // 12
							'__global float* DirIniy,'+ // 13
							'__global float* DirIniz,'+ // 14
							'__global float* StoreDirInix,'+ // 15
							'__global float* StoreDirIniy,'+ // 16
							'__global float* StoreDirIniz,'+ // 17
							'__global float* Ns,'+ // 18
							'__global float* StoreSecNs'+ // 19
							') {\n'+
							
			'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
			
			'RayOriginx[x] = StoreRayOriginx[x];\n'+
			'RayOriginy[x] = StoreRayOriginy[x];\n'+
			'RayOriginz[x] = StoreRayOriginz[x];\n'+
			'Normalx[x] = StoreNormalx[x];\n'+
			'Normaly[x] = StoreNormaly[x];\n'+
			'Normalz[x] = StoreNormalz[x];\n'+
			'DirInix[x] = StoreDirInix[x];\n'+
			'DirIniy[x] = StoreDirIniy[x];\n'+
			'DirIniz[x] = StoreDirIniz[x];\n'+
			'Ns[x] = StoreSecNs[x];\n'+
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
							'__global float* PrimaryColorx,'+ // 50
							'__global float* PrimaryColory,'+ // 51
							'__global float* PrimaryColorz,'+ // 52
							'__global float* SecundaryColorx,'+ // 53
							'__global float* SecundaryColory,'+ // 54
							'__global float* SecundaryColorz,'+ // 55
							'__global float* SecundaryColorAcumx,'+ // 56
							'__global float* SecundaryColorAcumy,'+ // 57
							'__global float* SecundaryColorAcumz,'+ // 58
							'__read_only image2d_t image,'+ // 59
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
							this.argumentsLightsSource()+ // 86
							') {\n'+

		'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
		
		'float3 dataRayTriangle;float3 vecRayOrigin;float3 vecRayEnd;float3 vecShadowRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;float3 tmpNormal;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;\n'+
		'float3 vecNorA;\n'+
		'float3 BRDF;'+
		
		'vecVertexA = (float3)(VAx, VAy, VAz);\n'+
		'vecVertexB = (float3)(VBx, VBy, VBz);\n'+
		'vecVertexC = (float3)(VCx, VCy, VCz);\n'+
		'coordTexA = (float3)(TEXAx, TEXAy, TEXAz);\n'+
		'coordTexB = (float3)(TEXBx, TEXBy, TEXBz);\n'+
		'coordTexC = (float3)(TEXCx, TEXCy, TEXCz);\n'+
		'u = vecVertexB-vecVertexA;\n'+
		'v = vecVertexC-vecVertexA;\n'+
		'tmpNormal = cross(u,v);\n'+
		
		'vecRayOrigin = (float3)(RayOriginx[x], RayOriginy[x], RayOriginz[x]);\n'+
		
		'float3 pNormal = (float3)(Normalx[x],Normaly[x],Normalz[x]);\n'+
		'float3 dirInicial = (float3)(DirInix[x], DirIniy[x], DirIniz[x]);\n'+
		'if(Ns[x] == 0.0f) {\n'+ // specular
			'float3 vecSPECULAR = reflectA(dirInicial, pNormal);\n'+
			'BRDF.x = vecSPECULAR.x;\n'+
			'BRDF.y = vecSPECULAR.y;\n'+
			'BRDF.z = vecSPECULAR.z;\n'+
			'vecRayEnd = vecRayOrigin+(vecSPECULAR*20000.0f);\n'+
		'} else if(Ns[x] == 0.8928571428571429) {\n'+ // lambertian
			'float3 vecBRDF = getVector(pNormal, Ns[x], (float2)(noiseX[x],noiseY[x]));\n'+
			'BRDF.x = vecBRDF.x;\n'+
			'BRDF.y = vecBRDF.y;\n'+
			'BRDF.z = vecBRDF.z;\n'+
			'vecRayEnd = vecRayOrigin+(vecBRDF*20000.0f);\n'+
		'} else {'+
			'float3 vecSPECULAR = reflectA(dirInicial, pNormal);\n'+
			'float3 vecBRDF = getVector(vecSPECULAR, Ns[x]*fmax(0.0,dot(pNormal,vecSPECULAR)), (float2)(noiseX[x],noiseY[x]));\n'+
			'BRDF.x = vecBRDF.x;\n'+
			'BRDF.y = vecBRDF.y;\n'+
			'BRDF.z = vecBRDF.z;\n'+
			'vecRayEnd = vecRayOrigin+(vecBRDF*20000.0f);\n'+
		'}\n'+
		
		'dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
		'if(dataRayTriangle.s0 > 0.0f){\n'+
			'if(dataRayTriangle.s0 < SecNearDistance[x]) {\n'+
				'SecNearDistance[x] = dataRayTriangle.s0;\n'+
				
				'float3 dirInicialSec = fast_normalize(vecRayEnd-vecRayOrigin);\n'+
				'float3 vecRayOriginSec = vecRayOrigin+(dirInicialSec*(dataRayTriangle.s0-0.005f));\n'+
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
				
				'SecDirInix[x] = dirInicialSec.x;\n'+
				'SecDirIniy[x] = dirInicialSec.y;\n'+
				'SecDirIniz[x] = dirInicialSec.z;\n'+
				
				'uint3 pix = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, TEXwidth, TEXheight, image);\n'+
				'SecundaryColorAcumx[x] = pix.x/255.0f;\n'+
				'SecundaryColorAcumy[x] = pix.y/255.0f;\n'+
				'SecundaryColorAcumz[x] = pix.z/255.0f;\n'+
			'}\n'+
		'}\n';
		
		// SHADOW RAY
		for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
			if(this.lights[nL].visibleOnRender == true) {
				kernelSrc_X += ''+
				'vecShadowRayEnd = (float3)(RayShadowEndx'+nL+', RayShadowEndy'+nL+', RayShadowEndz'+nL+');\n'+
				'dataRayTriangle = setRayTriangle(vecRayOrigin, vecShadowRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
				'if(dataRayTriangle.s0 > 0.0f){\n'+
					'if(dataRayTriangle.s0 < ShadowNearDistance'+nL+'[x]) {\n'+
						
						'ShadowNearDistance'+nL+'[x] = dataRayTriangle.s0;\n'+

						'ShadowNearNodeTypeLight'+nL+'[x] = NodeTypeLight;\n'+
						'ShadowNearNodeTypeOmni'+nL+'[x] = CurrentLightType;\n'+
						
						//'uint3 pix = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, ShadowTEXwidth'+nL+', ShadowTEXheight'+nL+', imageLightRay'+nL+');\n'+
						//'Colorlightx'+nL+'[x] = pix.x/255.0f;\n'+
						//'Colorlighty'+nL+'[x] = pix.y/255.0f;\n'+
						//'Colorlightz'+nL+'[x] = pix.z/255.0f;\n'+
						'Colorlightx'+nL+'[x] = lightColorx'+nL+';\n'+
						'Colorlighty'+nL+'[x] = lightColory'+nL+';\n'+
						'Colorlightz'+nL+'[x] = lightColorz'+nL+';\n'+
					'}\n'+
						
				'}\n';
			}
		}
		
		// SHADOW PROCESATION
		kernelSrc_X += ''+
		'if(final == 1) {\n'+
			'float lightAcums = 0.0f;float ProcShadowx;float ProcShadowy;float ProcShadowz;';
			for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
				if(this.lights[nL].visibleOnRender == true) {
					kernelSrc_X += 'if(ShadowNearDistance'+nL+'[x] == 1000000.0f) {\n'+
						'ProcShadowx += ambientColor.x;\n'+
						'ProcShadowy += ambientColor.y;\n'+
						'ProcShadowz += ambientColor.z;\n'+
						'lightAcums += 1.0f;\n'+
					'} else {'+
						'float3 vecRayOrigin = (float3)(RayOriginx[x],RayOriginy[x],RayOriginz[x]);\n'+
						'float3 lightR = vecRayOrigin-(float3)(RayShadowEndx'+nL+',RayShadowEndy'+nL+',RayShadowEndz'+nL+');\n'+
						'float3 vecBRDF = (float3)(BRDF.x,BRDF.y,BRDF.z);\n'+
						
						'float power = 2.3f;\n'+
						'float maxReflect = fast_length((float3)(SecundaryColorAcumx[x],SecundaryColorAcumy[x],SecundaryColorAcumz[x]));\n'+

						
						'float dif = fmax(0.0f,-dot((vecBRDF),fast_normalize(lightR)));\n'+
						'float IS = ShadowNearNodeTypeOmni'+nL+'[x] == 0 ? dif : (dif*(1.0f-smoothstep(1.0f,26.0f*power,fast_length(lightR))))*power;\n'+
						
						'ProcShadowx += (Colorlightx'+nL+'[x]*IS)*maxReflect;\n'+
						'ProcShadowy += (Colorlighty'+nL+'[x]*IS)*maxReflect;\n'+
						'ProcShadowz += (Colorlightz'+nL+'[x]*IS)*maxReflect;\n'+
						'if(ShadowNearNodeTypeLight'+nL+'[x] == 0) {\n'+
							
						'} else {'+
							'lightAcums += fmin(1.0,IS)*maxReflect;\n'+
						'}'+
						
					'}'+
					
					'ShadowNearDistance'+nL+'[x] = 1000000.0f;'+
					'ShadowNearNodeTypeLight'+nL+'[x] = 0;';
				}
			}
			// BOUNCE PROCESATION
			kernelSrc_X += 'if(NearDistance[x] == 1000000.0f) {\n'+
				'PrimaryColorMx[x] += ambientColor.x;\n'+
				'PrimaryColorMy[x] += ambientColor.y;\n'+
				'PrimaryColorMz[x] += ambientColor.z;\n'+
				'SecundaryColorx[x] += ambientColor.x;\n'+
				'SecundaryColory[x] += ambientColor.y;\n'+
				'SecundaryColorz[x] += ambientColor.z;\n'+
				'light[x] += 1.0f;\n'+
			'} else if(NearNodeTypeLight[x] == 1) {'+
				'PrimaryColorMx[x] += PrimaryColorx[x];\n'+
				'PrimaryColorMy[x] += PrimaryColory[x];\n'+
				'PrimaryColorMz[x] += PrimaryColorz[x];\n'+
				'SecundaryColorx[x] += PrimaryColorx[x];\n'+
				'SecundaryColory[x] += PrimaryColory[x];\n'+
				'SecundaryColorz[x] += PrimaryColorz[x];\n'+
				'light[x] += 1.0f;\n'+
			'} else {'+
				'uint change = 1;\n'+
				'if(SecNearDistance[x] == 1000000.0f) {\n'+
					'PrimaryColorMx[x] += PrimaryColorx[x];\n'+
					'PrimaryColorMy[x] += PrimaryColory[x];\n'+
					'PrimaryColorMz[x] += PrimaryColorz[x];\n'+
					'SecundaryColorx[x] += ambientColor.x;\n'+
					'SecundaryColory[x] += ambientColor.y;\n'+
					'SecundaryColorz[x] += ambientColor.z;\n'+
					'light[x] += 1.0f;\n'+
					'change = 0;\n'+
				'} else if(SecNearNodeTypeLight[x] == 1) {\n'+
					'PrimaryColorMx[x] += PrimaryColorx[x];\n'+
					'PrimaryColorMy[x] += PrimaryColory[x];\n'+
					'PrimaryColorMz[x] += PrimaryColorz[x];\n'+
					'SecundaryColorx[x] += ProcShadowx;\n'+
					'SecundaryColory[x] += ProcShadowy;\n'+
					'SecundaryColorz[x] += ProcShadowz;\n'+
					'light[x] += 1.0f;\n'+
					'change = 0;\n'+
				'} else {\n'+ 
					'PrimaryColorMx[x] += (PrimaryColorx[x]*ProcShadowx);\n'+
					'PrimaryColorMy[x] += (PrimaryColory[x]*ProcShadowy);\n'+
					'PrimaryColorMz[x] += (PrimaryColorz[x]*ProcShadowz);\n'+
					'SecundaryColorx[x] += (SecundaryColorAcumx[x]+ProcShadowx)/2.0f;\n'+
					'SecundaryColory[x] += (SecundaryColorAcumy[x]+ProcShadowy)/2.0f;\n'+
					'SecundaryColorz[x] += (SecundaryColorAcumz[x]+ProcShadowz)/2.0f;\n'+ 
					'light[x] += lightAcums;\n'+
				'}\n'+
				
				'if(change == 0) {\n'+
					'Ns[x] = StoreSecNs[x];\n'+
					'RayOriginx[x] = StoreRayOriginx[x];\n'+
					'RayOriginy[x] = StoreRayOriginy[x];\n'+
					'RayOriginz[x] = StoreRayOriginz[x];\n'+
					'Normalx[x] = StoreNormalx[x];\n'+
					'Normaly[x] = StoreNormaly[x];\n'+
					'Normalz[x] = StoreNormalz[x];\n'+
					'DirInix[x] = StoreDirInix[x];\n'+
					'DirIniy[x] = StoreDirIniy[x];\n'+
					'DirIniz[x] = StoreDirIniz[x];\n'+
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
			'}\n'+
			
			'SecNearDistance[x] = 1000000.0f;\n'+
			'SecNearNodeTypeLight[x] = 0;\n';
			for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
				if(this.lights[nL].visibleOnRender == true) {
					kernelSrc_X += 'Colorlightx'+nL+'[x] = 0.0f;\n'+
								'Colorlighty'+nL+'[x] = 0.0f;\n'+
								'Colorlightz'+nL+'[x] = 0.0f;\n';
				}
			}
			kernelSrc_X += ''+
		'}\n'+
		
		

		
		// BOUNCES PROCESATION
		'if(final == 1 && currBounce == '+this.MAXBOUNCES+') {\n'+
			'sample[x]++;\n'+
		
			'if('+this.MAXBOUNCES+' > 1) {'+
				'PrimaryColorMx[x] /= '+this.MAXBOUNCES+';\n'+
				'PrimaryColorMy[x] /= '+this.MAXBOUNCES+';\n'+
				'PrimaryColorMz[x] /= '+this.MAXBOUNCES+';\n'+
				'SecundaryColorx[x] /= '+this.MAXBOUNCES+';\n'+
				'SecundaryColory[x] /= '+this.MAXBOUNCES+';\n'+
				'SecundaryColorz[x] /= '+this.MAXBOUNCES+';\n'+
				'light[x] /= '+this.MAXBOUNCES+';\n'+
			'}\n'+
			
			'TotalColorX[x] += (PrimaryColorMx[x]+SecundaryColorx[x])/2.0f;\n'+
			'TotalColorY[x] += (PrimaryColorMy[x]+SecundaryColory[x])/2.0f;\n'+
			'TotalColorZ[x] += (PrimaryColorMz[x]+SecundaryColorz[x])/2.0f;\n'+
			
				
			/*'if(get_local_id(0) > 0 && get_local_id(0) < 16 && get_local_id(1) > 0 && get_local_id(1) < 16) {'+
				'barrier(CLK_LOCAL_MEM_FENCE);'+
				'float lightTotalMA = light[x];'+
				'lightTotalMA += light[ (get_global_id(1)-1)*'+this.viewportWidth+'+(get_global_id(0)-1) ];'+
				'lightTotalMA += light[ (get_global_id(1)-1)*'+this.viewportWidth+'+(get_global_id(0)) ];'+
				'lightTotalMA += light[ (get_global_id(1)-1)*'+this.viewportWidth+'+(get_global_id(0)+1) ];'+
				
				'lightTotalMA += light[ (get_global_id(1)+1)*'+this.viewportWidth+'+(get_global_id(0)-1) ];'+
				'lightTotalMA += light[ (get_global_id(1)+1)*'+this.viewportWidth+'+(get_global_id(0)) ];'+
				'lightTotalMA += light[ (get_global_id(1)+1)*'+this.viewportWidth+'+(get_global_id(0)+1) ];'+
				
				'lightTotalMA += light[ (get_global_id(1))*'+this.viewportWidth+'+(get_global_id(0)-1) ];'+
				'lightTotalMA += light[ (get_global_id(1))*'+this.viewportWidth+'+(get_global_id(0)+1) ];'+
				
				'light[x] = lightTotalMA/9;'+
			'}'+*/
			'TotalShadow[x] += light[x];\n'+
			
			/*'OutColorx[x] = ((TotalColorX[x]/(float)(sample[x]))*(TotalShadow[x]/(float)(sample[x])))*255;\n'+
			'OutColory[x] = ((TotalColorY[x]/(float)(sample[x]))*(TotalShadow[x]/(float)(sample[x])))*255;\n'+
			'OutColorz[x] = ((TotalColorZ[x]/(float)(sample[x]))*(TotalShadow[x]/(float)(sample[x])))*255;\n'+*/
			
			'PrimaryColorMx[x] = 0.0f;\n'+
			'PrimaryColorMy[x] = 0.0f;\n'+
			'PrimaryColorMz[x] = 0.0f;\n'+
			'SecundaryColorx[x] = 0.0f;\n'+
			'SecundaryColory[x] = 0.0f;\n'+
			'SecundaryColorz[x] = 0.0f;\n'+
			'light[x] = 0.0f;\n'+
		'}\n'+
	'}\n'+
	
	'__kernel void kernelGetOutColors('+
							'__global uint* OutColorx,'+ // 0
							'__global uint* OutColory,'+ // 1
							'__global uint* OutColorz,'+ // 2
							'__global float* TotalColorX,'+ // 3
							'__global float* TotalColorY,'+ // 4
							'__global float* TotalColorZ,'+ // 5
							'__global float* TotalShadow,'+ // 6
							'__global uint* sample'+ // 7
							') {\n'+
							
			'int x = get_global_id(1)*'+this.viewportWidth+'+get_global_id(0);\n'+
			
			'OutColorx[x] = ((TotalColorX[x]/(float)(sample[x]))*(TotalShadow[x]/(float)(sample[x])))*255;\n'+
			'OutColory[x] = ((TotalColorY[x]/(float)(sample[x]))*(TotalShadow[x]/(float)(sample[x])))*255;\n'+
			'OutColorz[x] = ((TotalColorZ[x]/(float)(sample[x]))*(TotalShadow[x]/(float)(sample[x])))*255;\n'+
			
			'TotalColorX[x] = 0.0;'+
			'TotalColorY[x] = 0.0;'+
			'TotalColorZ[x] = 0.0;'+
			'TotalShadow[x] = 0.0;'+
			'sample[x] = 0;'+
	'}\n';
		
	var clProgram_X = clContext.createProgramWithSource(kernelSrc_X);
	try {
		clProgram_X.buildProgram([clDevices[0]], "");
	} catch(e) {
		alert("Failed to build WebCL program. Error "+clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_STATUS)+":  "+ clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_LOG));
		throw e;
	}
	this.clKernel_PrimaryRays = clProgram_X.createKernel("kernelPrimaryRays");
	this.clKernel_setZero = clProgram_X.createKernel("kernelSetZero");
	this.clKernel_setPrimary = clProgram_X.createKernel("kernelSetPrimary");
	this.clKernel_getPrimary = clProgram_X.createKernel("kernelGetPrimary");
	this.clKernel_SecundaryRays = clProgram_X.createKernel("kernelSecundaryRays");
	this.clKernel_GetOutColors = clProgram_X.createKernel("kernelGetOutColors");

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
	
	this.buffColorlightx = [];
	this.buffColorlighty = [];
	this.buffColorlightz = [];
	for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
		if(this.lights[nL].visibleOnRender == true) {
			this.buffColorlightx[nL] = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
			this.buffColorlighty[nL] = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
			this.buffColorlightz[nL] = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
		}
	}
	
	this.buffSecundaryColorx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecundaryColory = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecundaryColorz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.bufflight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	
	
	
	this.buffTotalColorX = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayTotalColorX = new Float32Array(this.arrSize);
	this.buffTotalColorY = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayTotalColorY = new Float32Array(this.arrSize);
	this.buffTotalColorZ = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayTotalColorZ = new Float32Array(this.arrSize);
	this.buffTotalShadow = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayTotalShadow = new Float32Array(this.arrSize);
	
	this.buffOutColorx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayOutColorx = new Uint32Array(this.arrSize);
	this.buffOutColory = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayOutColory = new Uint32Array(this.arrSize);
	this.buffOutColorz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayOutColorz = new Uint32Array(this.arrSize);
	this.buffSample = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySample = new Uint32Array(this.arrSize);
	
	//CL_MEM_READ_ONLY - CL_MEM_WRITE_ONLY - CL_MEM_READ_WRITE	
	this.buffNearNodeTypeLight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecNearNodeTypeLight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffNearDistance = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNearDistance = new Float32Array(this.arrSize);
	this.buffSecNearDistance = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecNearDistance = new Float32Array(this.arrSize);
	
	this.buffNs = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	this.buffNsSec = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	this.buffStoreSecNs = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	
	this.buffRayOriginx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayOriginx = new Float32Array(this.arrSize);
	this.buffRayOriginy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayOriginy = new Float32Array(this.arrSize);
	this.buffRayOriginz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayOriginz = new Float32Array(this.arrSize);
	this.buffSecRayOriginx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecRayOriginy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffSecRayOriginz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreRayOriginx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreRayOriginy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffStoreRayOriginz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	
	this.buffRayEndx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayEndx = new Float32Array(this.arrSize);
	this.buffRayEndy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayEndy = new Float32Array(this.arrSize);
	this.buffRayEndz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayEndz = new Float32Array(this.arrSize);
	
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
	
	this.buffNoisex = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize); this.arrayNoisex = new Float32Array(this.arrSize);
	this.buffNoisey = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize); this.arrayNoisey = new Float32Array(this.arrSize);
	
	//setZero
	this.clKernel_setZero.setKernelArg(6, this.buffRayOriginx);
	this.clKernel_setZero.setKernelArg(7, this.buffRayOriginy);
	this.clKernel_setZero.setKernelArg(8, this.buffRayOriginz);
	this.clKernel_setZero.setKernelArg(9, this.buffRayEndx);
	this.clKernel_setZero.setKernelArg(10, this.buffRayEndy);
	this.clKernel_setZero.setKernelArg(11, this.buffRayEndz);
	this.clKernel_setZero.setKernelArg(12, this.buffNearDistance);
	this.clKernel_setZero.setKernelArg(13, this.buffSecNearDistance);
	var nLight = 14;
	for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
		if(this.lights[nL].visibleOnRender == true) {
			this.clKernel_setZero.setKernelArg(nLight, this.buffShadowNearDistance[nL]);
			nLight++;
		}
	}
	
	// primary rays
	this.clKernel_PrimaryRays.setKernelArg(25, this.buffNearNodeTypeLight);
	this.clKernel_PrimaryRays.setKernelArg(26, this.buffNearDistance);
	this.clKernel_PrimaryRays.setKernelArg(27, this.buffNsSec);
	this.clKernel_PrimaryRays.setKernelArg(28, this.buffRayOriginx);
	this.clKernel_PrimaryRays.setKernelArg(29, this.buffRayOriginy);
	this.clKernel_PrimaryRays.setKernelArg(30, this.buffRayOriginz);
	this.clKernel_PrimaryRays.setKernelArg(31, this.buffSecRayOriginx);
	this.clKernel_PrimaryRays.setKernelArg(32, this.buffSecRayOriginy);
	this.clKernel_PrimaryRays.setKernelArg(33, this.buffSecRayOriginz);
	this.clKernel_PrimaryRays.setKernelArg(34, this.buffRayEndx);
	this.clKernel_PrimaryRays.setKernelArg(35, this.buffRayEndy);
	this.clKernel_PrimaryRays.setKernelArg(36, this.buffRayEndz);
	this.clKernel_PrimaryRays.setKernelArg(37, this.buffSecNormalx);
	this.clKernel_PrimaryRays.setKernelArg(38, this.buffSecNormaly);
	this.clKernel_PrimaryRays.setKernelArg(39, this.buffSecNormalz);
	this.clKernel_PrimaryRays.setKernelArg(40, this.buffSecDirInix);
	this.clKernel_PrimaryRays.setKernelArg(41, this.buffSecDirIniy);
	this.clKernel_PrimaryRays.setKernelArg(42, this.buffSecDirIniz);
	this.clKernel_PrimaryRays.setKernelArg(43, this.buffPrimaryColorx);
	this.clKernel_PrimaryRays.setKernelArg(44, this.buffPrimaryColory);
	this.clKernel_PrimaryRays.setKernelArg(45, this.buffPrimaryColorz);
	 
	//setPrimary
	this.clKernel_setPrimary.setKernelArg(0, this.buffSecRayOriginx);
	this.clKernel_setPrimary.setKernelArg(1, this.buffSecRayOriginy);
	this.clKernel_setPrimary.setKernelArg(2, this.buffSecRayOriginz);
	this.clKernel_setPrimary.setKernelArg(3, this.buffStoreRayOriginx);
	this.clKernel_setPrimary.setKernelArg(4, this.buffStoreRayOriginy);
	this.clKernel_setPrimary.setKernelArg(5, this.buffStoreRayOriginz);
	this.clKernel_setPrimary.setKernelArg(6, this.buffSecNormalx);
	this.clKernel_setPrimary.setKernelArg(7, this.buffSecNormaly);
	this.clKernel_setPrimary.setKernelArg(8, this.buffSecNormalz);
	this.clKernel_setPrimary.setKernelArg(9, this.buffStoreNormalx);
	this.clKernel_setPrimary.setKernelArg(10, this.buffStoreNormaly);
	this.clKernel_setPrimary.setKernelArg(11, this.buffStoreNormalz);
	this.clKernel_setPrimary.setKernelArg(12, this.buffSecDirInix);
	this.clKernel_setPrimary.setKernelArg(13, this.buffSecDirIniy);
	this.clKernel_setPrimary.setKernelArg(14, this.buffSecDirIniz);
	this.clKernel_setPrimary.setKernelArg(15, this.buffStoreDirInix);
	this.clKernel_setPrimary.setKernelArg(16, this.buffStoreDirIniy);
	this.clKernel_setPrimary.setKernelArg(17, this.buffStoreDirIniz);
	this.clKernel_setPrimary.setKernelArg(18, this.buffNsSec); 
	this.clKernel_setPrimary.setKernelArg(19, this.buffStoreSecNs); 
	this.clKernel_setPrimary.setKernelArg(20, this.buffSample); 
	this.clKernel_setPrimary.setKernelArg(21, this.buffTotalColorX); 
	this.clKernel_setPrimary.setKernelArg(22, this.buffTotalColorY); 
	this.clKernel_setPrimary.setKernelArg(23, this.buffTotalColorZ); 
	this.clKernel_setPrimary.setKernelArg(24, this.buffTotalShadow); 
	
	//getPrimary
	this.clKernel_getPrimary.setKernelArg(0, this.buffRayOriginx);
	this.clKernel_getPrimary.setKernelArg(1, this.buffRayOriginy);
	this.clKernel_getPrimary.setKernelArg(2, this.buffRayOriginz);
	this.clKernel_getPrimary.setKernelArg(3, this.buffStoreRayOriginx);
	this.clKernel_getPrimary.setKernelArg(4, this.buffStoreRayOriginy);
	this.clKernel_getPrimary.setKernelArg(5, this.buffStoreRayOriginz);
	this.clKernel_getPrimary.setKernelArg(6, this.buffNormalx);
	this.clKernel_getPrimary.setKernelArg(7, this.buffNormaly);
	this.clKernel_getPrimary.setKernelArg(8, this.buffNormalz);
	this.clKernel_getPrimary.setKernelArg(9, this.buffStoreNormalx);
	this.clKernel_getPrimary.setKernelArg(10, this.buffStoreNormaly);
	this.clKernel_getPrimary.setKernelArg(11, this.buffStoreNormalz);
	this.clKernel_getPrimary.setKernelArg(12, this.buffDirInix);
	this.clKernel_getPrimary.setKernelArg(13, this.buffDirIniy);
	this.clKernel_getPrimary.setKernelArg(14, this.buffDirIniz);
	this.clKernel_getPrimary.setKernelArg(15, this.buffStoreDirInix);
	this.clKernel_getPrimary.setKernelArg(16, this.buffStoreDirIniy);
	this.clKernel_getPrimary.setKernelArg(17, this.buffStoreDirIniz);
	this.clKernel_getPrimary.setKernelArg(18, this.buffNs); 
	this.clKernel_getPrimary.setKernelArg(19, this.buffStoreSecNs); 
	
	
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
	this.clKernel_SecundaryRays.setKernelArg(50, this.buffPrimaryColorx);
	this.clKernel_SecundaryRays.setKernelArg(51, this.buffPrimaryColory);
	this.clKernel_SecundaryRays.setKernelArg(52, this.buffPrimaryColorz);
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
	this.argumentsLightsGlobal(86);
	
	
	// clKernel_GetOutColors
	this.clKernel_GetOutColors.setKernelArg(0, this.buffOutColorx);
	this.clKernel_GetOutColors.setKernelArg(1, this.buffOutColory);
	this.clKernel_GetOutColors.setKernelArg(2, this.buffOutColorz);
	this.clKernel_GetOutColors.setKernelArg(3, this.buffTotalColorX);
	this.clKernel_GetOutColors.setKernelArg(4, this.buffTotalColorY);
	this.clKernel_GetOutColors.setKernelArg(5, this.buffTotalColorZ);
	this.clKernel_GetOutColors.setKernelArg(6, this.buffTotalShadow);
	this.clKernel_GetOutColors.setKernelArg(7, this.buffSample);
	
	
	
	
	var maxLocalWS = clDevices[0].getDeviceInfo(WebCL.CL_DEVICE_MAX_WORK_GROUP_SIZE);
	this.localWS = [16,16];
	this.globalWS = [this.viewportWidth,this.viewportHeight]; // Global work item size. Numero total de work-items (kernel en ejecucion)

	var d = new Date();
	this.oldTime = d.getTime();
	
	
};
/** @private */
StormRender.prototype.argumentsSetZero = function() {
	var str = '';
	for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
		if(this.lights[nL].visibleOnRender == true) {
			str += ',__global float* ShadowNearDistance'+nL;
		}
	}
	return str;
};
/** @private */
StormRender.prototype.argumentsLightsSource = function() {
	var str = '';
	for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
		if(this.lights[nL].visibleOnRender == true) {
			str += 'float RayShadowEndx'+nL+','+ // 0
					'float RayShadowEndy'+nL+','+ // 1
					'float RayShadowEndz'+nL+','+ // 2
					//'__read_only image2d_t imageLightRay'+nL+','+ // 3
					//'unsigned int ShadowTEXwidth'+nL+','+ // 4
					//'unsigned int ShadowTEXheight'+nL+','+ //5 
					'float lightColorx'+nL+','+ // 3
					'float lightColory'+nL+','+ // 4
					'float lightColorz'+nL+','+ //5 
					'__global uint* ShadowNearNodeTypeLight'+nL+','+ // 6
					'__global uint* ShadowNearNodeTypeOmni'+nL+','+ // 7	0 sun - 1 omni
					'__global float* ShadowNearDistance'+nL+','+ // 8
					'__global float* Colorlightx'+nL+','+ // 9
					'__global float* Colorlighty'+nL+','+ // 10
					'__global float* Colorlightz'+nL+','; // 11
		}
	}
	str += 'unsigned int numLights';
	return str;
};
/** @private */
StormRender.prototype.argumentsLightsGlobal = function(numArg) {
	for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
		if(this.lights[nL].visibleOnRender == true) {
			this.clKernel_SecundaryRays.setKernelArg(numArg+6, this.buffShadowNearNodeTypeLight[nL]); // is light?
			this.clKernel_SecundaryRays.setKernelArg(numArg+7, this.buffShadowNearNodeTypeOmni[nL]); // 0 sun - 1 omni
			this.clKernel_SecundaryRays.setKernelArg(numArg+8, this.buffShadowNearDistance[nL]);
			this.clKernel_SecundaryRays.setKernelArg(numArg+9, this.buffColorlightx[nL]);
			this.clKernel_SecundaryRays.setKernelArg(numArg+10, this.buffColorlighty[nL]);
			this.clKernel_SecundaryRays.setKernelArg(numArg+11, this.buffColorlightz[nL]);
			numArg = numArg+12;
		}
	}
};
/** @private */
StormRender.prototype.argumentsLightsLocal = function(numArg) {
	for(var nL = 0, fnL = this.lights.length; nL < fnL; nL++) {
		if(this.lights[nL].visibleOnRender == true) {
			this.clKernel_SecundaryRays.setKernelArg(numArg, this.lights[nL].mrealWMatrixFrame.e[3]+this.LNx, WebCL.types.FLOAT);
			this.clKernel_SecundaryRays.setKernelArg(numArg+1, this.lights[nL].mrealWMatrixFrame.e[7]+this.LNy, WebCL.types.FLOAT);
			this.clKernel_SecundaryRays.setKernelArg(numArg+2, this.lights[nL].mrealWMatrixFrame.e[11]+this.LNz, WebCL.types.FLOAT);
			this.clKernel_SecundaryRays.setKernelArg(numArg+3, this.lights[nL].color.e[0], WebCL.types.FLOAT);
			this.clKernel_SecundaryRays.setKernelArg(numArg+4, this.lights[nL].color.e[1], WebCL.types.FLOAT);
			this.clKernel_SecundaryRays.setKernelArg(numArg+5, this.lights[nL].color.e[2], WebCL.types.FLOAT);
			numArg = numArg+12;
		}
	}
	this.clKernel_SecundaryRays.setKernelArg(numArg, this.lights.length, WebCL.types.FLOAT);
};
/** @private */
StormRender.prototype.updateObjects = function() {
	var N_VAx = [];	var N_VAy = [];	var N_VAz = [];
	var N_VBx = [];	var N_VBy = [];	var N_VBz = [];
	var N_VCx = [];	var N_VCy = [];	var N_VCz = [];
	var N_TAx = [];	var N_TAy = [];	var N_TAz = [];
	var N_TBx = [];	var N_TBy = [];	var N_TBz = [];
	var N_TCx = [];	var N_TCy = [];	var N_TCz = [];
	var N_NAx = [];	var N_NAy = [];	var N_NAz = [];
	var L_VAx = [];	var L_VAy = [];	var L_VAz = [];
	var L_VBx = [];	var L_VBy = [];	var L_VBz = [];
	var L_VCx = [];	var L_VCy = [];	var L_VCz = [];
	var L_TAx = [];	var L_TAy = [];	var L_TAz = [];
	var L_TBx = [];	var L_TBy = [];	var L_TBz = [];
	var L_TCx = [];	var L_TCy = [];	var L_TCz = [];
	var L_NAx = [];	var L_NAy = [];	var L_NAz = [];
	var numNB = 0;
	var numTRIS = 0;
	this.arrayBuffersTextures = []; 
	
	this.arrayBuffersTexturesLightRay = [];
	this.buffShadowNearDistance = [];
	this.buffShadowNearNodeTypeLight = [];
	this.buffShadowNearNodeTypeOmni = [];
	
	var format = {channelOrder:WebCL.CL_RGBA, channelDataType:WebCL.CL_UNSIGNED_INT8};
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnRender == true) {
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
																0.0,0.0,0.0,1.0])); // posicion xyz en WORLD SPACE de un vertice
					N_NAx.push(NORA.e[3]);N_NAy.push(NORA.e[7]);N_NAz.push(NORA.e[11]);
					
					numTRIS++;
				}
				this.arrayBuffersTextures[numNB] = clContext.createImage2D(WebCL.CL_MEM_READ_ONLY, format,this.nodes[n].materialUnits[0].textureObjectKd.W, this.nodes[n].materialUnits[0].textureObjectKd.H, 0);	
				var ar = this.nodes[n].materialUnits[0].textureObjectKd.inData;
				clCmdQueue.enqueueWriteImage(this.arrayBuffersTextures[numNB], true, [0,0,0], [this.nodes[n].materialUnits[0].textureObjectKd.W,this.nodes[n].materialUnits[0].textureObjectKd.H,1], 0, 0, new Uint8Array([ar[0],ar[1],ar[2],ar[3]]), []);
				numNB++;
			}
		}
	}
	for(var n = 0, f = this.lights.length; n < f; n++) {
		if(this.lights[n].visibleOnRender == true) {
			for(var nb = 0, fnb = this.lights[n].buffersObjects.length; nb < fnb; nb++) {
				for(var b = 0, fb = this.lights[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b < fb; b++) {
					var saltosIdx = b*3;
					var idxA = this.lights[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
					var idxB = this.lights[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+1] * 3;
					var idxC = this.lights[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+2] * 3;
					
					// VERTEXS
					var VA = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxA],
																0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxA+1],
																0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxA+2],
																0.0,0.0,0.0,1.0])); // posicion xyz en WORLD SPACE de un vertice
					L_VAx.push(VA.e[3]);L_VAy.push(VA.e[7]);L_VAz.push(VA.e[11]);
					var VB = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB],
																0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB+1],
																0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB+2],
																0.0,0.0,0.0,1.0]));
					L_VBx.push(VB.e[3]);L_VBy.push(VB.e[7]);L_VBz.push(VB.e[11]);
					var VC = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC],
																0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC+1],
																0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC+2],
																0.0,0.0,0.0,1.0]));
					L_VCx.push(VC.e[3]);L_VCy.push(VC.e[7]);L_VCz.push(VC.e[11]);
					
					// TEXTURES
					var TEXA = $V3([this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxA], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxA+1], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxA+2]]);
					L_TAx.push('0.'+TEXA.e[0].toString().split('.')[1]);L_TAy.push('0.'+TEXA.e[1].toString().split('.')[1]);L_TAz.push('0.'+TEXA.e[2].toString().split('.')[1]);
					var TEXB = $V3([this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxB], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxB+1], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxB+2]]);
					L_TBx.push('0.'+TEXB.e[0].toString().split('.')[1]);L_TBy.push('0.'+TEXB.e[1].toString().split('.')[1]);L_TBz.push('0.'+TEXB.e[2].toString().split('.')[1]);
					var TEXC = $V3([this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxC], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxC+1], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxC+2]]);
					L_TCx.push('0.'+TEXC.e[0].toString().split('.')[1]);L_TCy.push('0.'+TEXC.e[1].toString().split('.')[1]);L_TCz.push('0.'+TEXC.e[2].toString().split('.')[1]);
					
					// NORMALS
					var NORA = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshNormalArray[idxA],
																0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshNormalArray[idxA+1],
																0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshNormalArray[idxA+2],
																0.0,0.0,0.0,1.0])); // posicion xyz en WORLD SPACE de un vertice
					L_NAx.push(NORA.e[3]);L_NAy.push(NORA.e[7]);L_NAz.push(NORA.e[11]);
					
					numTRIS++;
				}
				this.arrayBuffersTextures[numNB] = clContext.createImage2D(WebCL.CL_MEM_READ_ONLY, format,1, 1, 0);	
				var ar = this.lights[n].materialUnits[0].textureObjectKd.inData;
				clCmdQueue.enqueueWriteImage(this.arrayBuffersTextures[numNB], true, [0,0,0], [1,1,1], 0, 0, new Uint8Array([ar[0],ar[1],ar[2],ar[3]]), []);
				numNB++;
			}
			//this.arrayBuffersTexturesLightRay[n] = clContext.createImage2D(WebCL.CL_MEM_READ_ONLY, format,this.nodes[n].materialUnits[0].textureObjectKd.W, this.nodes[n].materialUnits[0].textureObjectKd.H, 0);
			//var ar = this.lights[n].materialUnits[0].textureObjectKd.inData;
			//clCmdQueue.enqueueWriteImage(this.arrayBuffersTexturesLightRay[n], true, [0,0,0], [this.lights[n].materialUnits[0].textureObjectKd.W,this.lights[n].materialUnits[0].textureObjectKd.H,1], 0, 0, new Uint8Array([ar[0],ar[1],ar[2],ar[3]]), []);
			
			this.buffShadowNearDistance[n] = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
			this.buffShadowNearNodeTypeLight[n] = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
			this.buffShadowNearNodeTypeOmni[n] = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
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
	this.arrayL_VAx = new Float32Array(L_VAx);	this.arrayL_VAy = new Float32Array(L_VAy);	this.arrayL_VAz = new Float32Array(L_VAz);
	this.arrayL_VBx = new Float32Array(L_VBx);	this.arrayL_VBy = new Float32Array(L_VBy);	this.arrayL_VBz = new Float32Array(L_VBz);
	this.arrayL_VCx = new Float32Array(L_VCx);	this.arrayL_VCy = new Float32Array(L_VCy);	this.arrayL_VCz = new Float32Array(L_VCz);
	this.arrayL_TAx = new Float32Array(L_TAx);	this.arrayL_TAy = new Float32Array(L_TAy);	this.arrayL_TAz = new Float32Array(L_TAz);
	this.arrayL_TBx = new Float32Array(L_TBx);	this.arrayL_TBy = new Float32Array(L_TBy);	this.arrayL_TBz = new Float32Array(L_TBz);
	this.arrayL_TCx = new Float32Array(L_TCx);	this.arrayL_TCy = new Float32Array(L_TCy);	this.arrayL_TCz = new Float32Array(L_TCz);
	this.arrayL_NAx = new Float32Array(L_NAx);	this.arrayL_NAy = new Float32Array(L_NAy);	this.arrayL_NAz = new Float32Array(L_NAz);
	
	
};
/** @private */
StormRender.prototype.setCam = function(nodeCam) {
	// PRIMARY RAYS
	this.sample = 1;
	
	this.clKernel_setZero.setKernelArg(0, nodeCam.nodeGoal.MPOS.e[3], WebCL.types.FLOAT);
	this.clKernel_setZero.setKernelArg(1, nodeCam.nodeGoal.MPOS.e[7], WebCL.types.FLOAT);
	this.clKernel_setZero.setKernelArg(2, nodeCam.nodeGoal.MPOS.e[11], WebCL.types.FLOAT);
	this.clKernel_setZero.setKernelArg(3, nodeCam.nodePivot.MPOS.e[3], WebCL.types.FLOAT);
	this.clKernel_setZero.setKernelArg(4, nodeCam.nodePivot.MPOS.e[7], WebCL.types.FLOAT);
	this.clKernel_setZero.setKernelArg(5, nodeCam.nodePivot.MPOS.e[11], WebCL.types.FLOAT);
	
	clCmdQueue.enqueueNDRangeKernel(this.clKernel_setZero, this.globalWS.length, [], this.globalWS, this.localWS, []);
	clCmdQueue.flush();
	
	var numb = 0;
	var numbNB = 0;
	this.clKernel_PrimaryRays.setKernelArg(23, 0, WebCL.types.UINT);//NodeTypeLight
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnRender == true) {
			for(var nb = 0, fnb = this.nodes[n].buffersObjects.length; nb < fnb; nb++) {
				this.clKernel_PrimaryRays.setKernelArg(21, this.nodes[n].materialUnits[0].textureObjectKd.W, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(22, this.nodes[n].materialUnits[0].textureObjectKd.H, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(24, this.nodes[n].buffersObjects[nb].material.Ns, WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(46, this.arrayBuffersTextures[numbNB]);
				for(var b = 0, fb = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b < fb; b++) {
					this.clKernel_PrimaryRays.setKernelArg(0, this.arrayN_VAx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(1, this.arrayN_VAy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(2, this.arrayN_VAz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(3, this.arrayN_VBx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(4, this.arrayN_VBy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(5, this.arrayN_VBz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(6, this.arrayN_VCx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(7, this.arrayN_VCy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(8, this.arrayN_VCz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(9, this.arrayN_TAx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(10, this.arrayN_TAy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(11, this.arrayN_TAz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(12, this.arrayN_TBx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(13, this.arrayN_TBy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(14, this.arrayN_TBz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(15, this.arrayN_TCx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(16, this.arrayN_TCy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(17, this.arrayN_TCz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(18, this.arrayN_NAx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(19, this.arrayN_NAy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(20, this.arrayN_NAz[numb], WebCL.types.FLOAT);
					
					clCmdQueue.enqueueNDRangeKernel(this.clKernel_PrimaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
					clCmdQueue.flush();
					numb++;
				}
				numbNB++;
			}
		}
	}
	numb = 0;
	this.clKernel_PrimaryRays.setKernelArg(23, 1, WebCL.types.UINT);//NodeTypeLight
	for(var n = 0, f = this.lights.length; n < f; n++) {
		if(this.lights[n].visibleOnRender == true) {
			for(var nb = 0, fnb = this.lights[n].buffersObjects.length; nb < fnb; nb++) {
				this.clKernel_PrimaryRays.setKernelArg(21, 1, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(22, 1, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(24, this.lights[n].buffersObjects[nb].materialUnits[0].Ns, WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(46, this.arrayBuffersTextures[numbNB]);
				for(var b = 0, fb = this.lights[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b < fb; b++) {
					this.clKernel_PrimaryRays.setKernelArg(0, this.arrayL_VAx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(1, this.arrayL_VAy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(2, this.arrayL_VAz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(3, this.arrayL_VBx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(4, this.arrayL_VBy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(5, this.arrayL_VBz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(6, this.arrayL_VCx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(7, this.arrayL_VCy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(8, this.arrayL_VCz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(9, this.arrayL_TAx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(10, this.arrayL_TAy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(11, this.arrayL_TAz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(12, this.arrayL_TBx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(13, this.arrayL_TBy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(14, this.arrayL_TBz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(15, this.arrayL_TCx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(16, this.arrayL_TCy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(17, this.arrayL_TCz[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(18, this.arrayL_NAx[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(19, this.arrayL_NAy[numb], WebCL.types.FLOAT);
					this.clKernel_PrimaryRays.setKernelArg(20, this.arrayL_NAz[numb], WebCL.types.FLOAT);
					
					clCmdQueue.enqueueNDRangeKernel(this.clKernel_PrimaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
					clCmdQueue.flush();
					numb++;
				}
				numbNB++;
			}
		}
	}
	clCmdQueue.finish();
	

	
	clCmdQueue.enqueueNDRangeKernel(this.clKernel_setPrimary, this.globalWS.length, [], this.globalWS, this.localWS, []);
	clCmdQueue.flush();
};
/** @private */
StormRender.prototype.makeRender = function() {	

	if(typeof(this.callback)== 'function') {
		var d = new Date();
		var currTime = d.getTime();
		var diffTime = (currTime-this.oldTime)/1000;
		this.oldTime = currTime;
		var req = {'sample':this.sample, 'sampleTime':diffTime}
		this.callback(req);
	}

	clCmdQueue.enqueueNDRangeKernel(this.clKernel_getPrimary, this.globalWS.length, [], this.globalWS, this.localWS, []);
	clCmdQueue.flush();
	
	
	for(var currBounce = 1, fCB = this.MAXBOUNCES; currBounce <= fCB; currBounce++) {
	
		if(this.sampleNoise == 33) this.sampleNoise = 0;
		var rowNoise = this.sampleNoise;
		var colNoise = this.sampleNoise;
		for(var row = 0, frow = this.viewportHeight; row < frow; row++) {
			for(var col = 0, fcol = this.viewportWidth; col < fcol; col++) {
				var idx = ((row * this.viewportWidth) + col);
				
				if(rowNoise == 33) rowNoise = this.sampleNoise;
				if(colNoise == 33) colNoise = this.sampleNoise;
				var idxNoise = ((rowNoise * 32) + colNoise)*3;
				//this.clDataObject_Noisey[idx] = this.canvasDataNoise.data[idxNoise+1]/255;
				//this.clDataObject_Noisex[idx] = this.canvasDataNoise.data[idxNoise]/255;
				
				this.arrayNoisey[idx] = Math.random();
				this.arrayNoisex[idx] = Math.random();
				
				rowNoise++;
				colNoise++;
				
			}
		}
		this.sampleNoise++;
		
		clCmdQueue.enqueueWriteBuffer(this.buffNoisex, false, 0, this.bufferSize, this.arrayNoisex, []);// this.bufferSize = vectorLength * 4
		clCmdQueue.enqueueWriteBuffer(this.buffNoisey, false, 0, this.bufferSize, this.arrayNoisey, []);// this.bufferSize = vectorLength * 4

		
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////// SECUNDARY RAYS ///////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		this.LNx = -0.3+(Math.random()*0.6);
		this.LNy = -0.3+(Math.random()*0.6);
		this.LNz = -0.3+(Math.random()*0.6);
		
		var numb = 0;
		var numbNB = 0;
		var numTRIS = 0;
		this.clKernel_SecundaryRays.setKernelArg(61, currBounce, WebCL.types.UINT);//currBounce
		this.argumentsLightsLocal(86);
		this.clKernel_SecundaryRays.setKernelArg(25, 0, WebCL.types.UINT);//NodeTypeLight
		this.clKernel_SecundaryRays.setKernelArg(60, 0, WebCL.types.UINT);//final
		for(var n = 0, f = this.nodes.length; n < f; n++) {
			if(this.nodes[n].visibleOnRender == true) {
			this.clKernel_SecundaryRays.setKernelArg(26, (this.nodes[n].type == 'sun')?0:1, WebCL.types.UINT);
				for(var nb = 0, fnb = this.nodes[n].buffersObjects.length; nb < fnb; nb++) {
					this.clKernel_SecundaryRays.setKernelArg(23, this.nodes[n].buffersObjects[nb].materialUnits[0].textureObjectKd.W, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(24, this.nodes[n].buffersObjects[nb].materialUnits[0].textureObjectKd.H, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(27, this.nodes[n].buffersObjects[nb].materialUnits[0].Ns, WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(59, this.arrayBuffersTextures[numbNB]);
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
						
						clCmdQueue.enqueueNDRangeKernel(this.clKernel_SecundaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
						//clCmdQueue.flush();
						numb++;
						numTRIS++;
					}
					numbNB++;
				}
			}
		}
		numb = 0;
		this.clKernel_SecundaryRays.setKernelArg(25, 1, WebCL.types.UINT);//NodeTypeLight
		for(var n = 0, f = this.lights.length; n < f; n++) {
			if(this.lights[n].visibleOnRender == true) {
				this.clKernel_SecundaryRays.setKernelArg(26, (this.lights[n].type == 'sun')?0:1, WebCL.types.UINT);
				for(var nb = 0, fnb = this.lights[n].buffersObjects.length; nb < fnb; nb++) {
					this.clKernel_SecundaryRays.setKernelArg(23, 1, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(24, 1, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(27, this.lights[n].buffersObjects[nb].materialUnits[0].Ns, WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(59, this.arrayBuffersTextures[numbNB]);
					for(var b = 0, fb = this.lights[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b < fb; b++) {
						if(this.lights[n].id == this.lights[0].id) {
							this.rNVAx = this.arrayL_VAx[numb]+this.LNx;
							this.rNVAy = this.arrayL_VAy[numb]+this.LNy;
							this.rNVAz = this.arrayL_VAz[numb]+this.LNz;
							this.rNVBx = this.arrayL_VBx[numb]+this.LNx;
							this.rNVBy = this.arrayL_VBy[numb]+this.LNy;
							this.rNVBz = this.arrayL_VBz[numb]+this.LNz;
							this.rNVCx = this.arrayL_VCx[numb]+this.LNx;
							this.rNVCy = this.arrayL_VCy[numb]+this.LNy;
							this.rNVCz = this.arrayL_VCz[numb]+this.LNz;
						} else {
							this.rNVAx = this.arrayL_VAx[numb];
							this.rNVAy = this.arrayL_VAy[numb];
							this.rNVAz = this.arrayL_VAz[numb];
							this.rNVBx = this.arrayL_VBx[numb];
							this.rNVBy = this.arrayL_VBy[numb];
							this.rNVBz = this.arrayL_VBz[numb];
							this.rNVCx = this.arrayL_VCx[numb];
							this.rNVCy = this.arrayL_VCy[numb];
							this.rNVCz = this.arrayL_VCz[numb];
						}
						this.clKernel_SecundaryRays.setKernelArg(2, this.rNVAx, WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(3, this.rNVAy, WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(4, this.rNVAz, WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(5, this.rNVBx, WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(6, this.rNVBy, WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(7, this.rNVBz, WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(8, this.rNVCx, WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(9, this.rNVCy, WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(10, this.rNVCz, WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(11, this.arrayL_TAx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(12, this.arrayL_TAy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(13, this.arrayL_TAz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(14, this.arrayL_TBx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(15, this.arrayL_TBy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(16, this.arrayL_TBz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(17, this.arrayL_TCx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(18, this.arrayL_TCy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(19, this.arrayL_TCz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(20, this.arrayL_NAx[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(21, this.arrayL_NAy[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(22, this.arrayL_NAz[numb], WebCL.types.FLOAT);
						this.clKernel_SecundaryRays.setKernelArg(60, (numTRIS == this.totalNumbTRIS-1)?1:0, WebCL.types.UINT);//final
						
						clCmdQueue.enqueueNDRangeKernel(this.clKernel_SecundaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
						//clCmdQueue.flush();
						numb++;
						numTRIS++;
					}
					numbNB++;
				}
			}
		}
		
	} // END FOR BOUNCES
	clCmdQueue.finish();
	
	
	clCmdQueue.enqueueReadBuffer(this.buffTotalColorX, false, 0, (this.bufferSize), this.arrayTotalColorX, []);
	clCmdQueue.enqueueReadBuffer(this.buffTotalColorY, false, 0, (this.bufferSize), this.arrayTotalColorY, []);
	clCmdQueue.enqueueReadBuffer(this.buffTotalColorZ, false, 0, (this.bufferSize), this.arrayTotalColorZ, []);
	clCmdQueue.enqueueReadBuffer(this.buffTotalShadow, false, 0, (this.bufferSize), this.arrayTotalShadow, []);
	clCmdQueue.enqueueReadBuffer(this.buffSample, false, 0, (this.bufferSize), this.arraySample, []);
	var makeFrame = false;
	if(wsPathTracing != undefined && (wsPathTracing.socket.connected == true || wsPathTracing.socket.connecting == true)) {
		if(stormEngineC.netID != 0) { // no es host
			if(wsPathTracing.socket.connected == true && this.sendFrameToHost == 1) {
				//alert('');
				this.sendFrameToHost = 0;
				var netPacketSize = 64*64;
				var tempArrX = new Float32Array(netPacketSize);
				var tempArrY = new Float32Array(netPacketSize);
				var tempArrZ = new Float32Array(netPacketSize);
				var tempArrShad = new Float32Array(netPacketSize);
				var cont = 0;
				for(var n = 0, f = this.arrayTotalColorX.length; n <= f; n++) {
					tempArrX[cont] = this.arrayTotalColorX[n];
					tempArrY[cont] = this.arrayTotalColorY[n];
					tempArrZ[cont] = this.arrayTotalColorZ[n];
					tempArrShad[cont] = this.arrayTotalShadow[n];
					
					if(cont == netPacketSize) {
						cont = 0;
						wsPathTracing.emit('setFrameTotalColorX', {
							netID: stormEngineC.netID,
							frameNumber: this.currentFrameNumber,
							arrayTotalColorX: tempArrX,
							width: this.viewportWidth,
							height: this.viewportHeight,
							offset: (n-netPacketSize)
						});
						wsPathTracing.emit('setFrameTotalColorY', {
							netID: stormEngineC.netID,
							frameNumber: this.currentFrameNumber,
							arrayTotalColorY: tempArrY,
							offset: (n-netPacketSize)
						});
						wsPathTracing.emit('setFrameTotalColorZ', {
							netID: stormEngineC.netID,
							frameNumber: this.currentFrameNumber,
							arrayTotalColorZ: tempArrZ,
							offset: (n-netPacketSize)
						});
						wsPathTracing.emit('setFrameTotalShadow', {
							netID: stormEngineC.netID,
							frameNumber: this.currentFrameNumber,
							arrayTotalShadow: tempArrShad,
							offset: (n-netPacketSize)
						});
					}
					cont++;
				}
				
				wsPathTracing.emit('setFrameSample', {
					netID: stormEngineC.netID,
					frameNumber: this.currentFrameNumber,
					arraySample: this.arraySample[0]
				});
				makeFrame = true;
			}
		} else {
			if(this.receiveFromClient == 0) {
				this.SF();
				makeFrame = true;
			}
		}
	} else {
		this.SF();
		makeFrame = true;
	}

	if(makeFrame == true) {
		clCmdQueue.enqueueNDRangeKernel(this.clKernel_GetOutColors, this.globalWS.length, [], this.globalWS, this.localWS, []);
		clCmdQueue.finish();
		
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
	}
	$('#DIVID_StormPanelCanvas_proc').html('sample '+this.arraySample[0]);
	
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
/** @private */
StormRender.prototype.SF = function() {
	
	
	stormEngineC.timelinePathTracing.setFrameTotalColorX(this.currentFrameNumber, this.arrayTotalColorX, this.viewportWidth, this.viewportHeight); 
	stormEngineC.timelinePathTracing.setFrameTotalColorY(this.currentFrameNumber, this.arrayTotalColorY);
	stormEngineC.timelinePathTracing.setFrameTotalColorZ(this.currentFrameNumber, this.arrayTotalColorZ);
	stormEngineC.timelinePathTracing.setFrameTotalShadow(this.currentFrameNumber, this.arrayTotalShadow);
	stormEngineC.timelinePathTracing.setFrameSample(this.currentFrameNumber, this.arraySample[0]);
	
	var frame = stormEngineC.timelinePathTracing.getFrame(this.currentFrameNumber);
				
	clCmdQueue.enqueueWriteBuffer(this.buffTotalColorX, false, 0, (this.bufferSize), frame.arrayTotalColorX, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTotalColorY, false, 0, (this.bufferSize), frame.arrayTotalColorY, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTotalColorZ, false, 0, (this.bufferSize), frame.arrayTotalColorZ, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTotalShadow, false, 0, (this.bufferSize), frame.arrayTotalShadow, []);
	clCmdQueue.enqueueWriteBuffer(this.buffSample, false, 0, (this.bufferSize), frame.arraySample, []);
	
	if(stormEngineC.runningAnim && stormEngineC.timelinePathTracing.frames[this.currentFrameNumber].arraySample[0] >= $('#INPUTID_StormRenderSettings_maxSamples').val()) {
		this.nextFrame();
	}
};
/** @private */
StormRender.prototype.nextFrame = function() {
	if((this.currentFrameNumber+1) > this.frameEnd) {
		stormEngineC.renderFrameStop();
	} else {
		this.currentFrameNumber++;
		stormEngineC.setWebGLpause(false);
		stormEngineC.PanelAnimationTimeline.setFrame(this.currentFrameNumber);
		this.setCam(stormEngineC.defaultCamera);
		//this.updateObjects();
		stormEngineC.setWebGLpause(true);
	}
	
};

