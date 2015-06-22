/*----------------------------------------------------------------------------------------
									SCENE
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Scene = function() {
	_this = stormEngineC.stormGLContext;
	_this.OCCUPIEDSAMPLES_SHADERSCENE = 5;
	_this.MAX_TEXTURESKD = _this.gl.getParameter(_this.gl.MAX_TEXTURE_IMAGE_UNITS)-_this.OCCUPIEDSAMPLES_SHADERSCENE;
	var sourceVertex = _this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aVertexNormal;\n'+
		'attribute vec3 aTextureCoord;\n'+
		'attribute float aTextureUnit;\n'+
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform vec3 u_cameraPos;\n'+
		'uniform mat4 uPMatrix;\n'+
		'uniform mat4 u_nodeWMatrixInverse;\n'+
		'uniform mat4 u_nodeWVMatrixInverse;\n'+
		
		'varying vec3 vTextureCoord;\n'+
		'varying float vTextureUnit;\n'+
		'varying vec4 vposition;\n'+
		'varying vec4 vpositionViewportRegion;\n'+
		'uniform mat4 uWLight;\n'+
		
		'varying vec4 vWNMatrix;\n'+
		'varying vec4 vWVNMatrix;\n'+
		'varying vec4 vWPos;\n'+
		'varying vec3 vReflect;\n'+
		
		// http://devmaster.net/posts/3002/shader-effects-shadow-mapping
		// The scale matrix is used to push the projected vertex into the 0.0 - 1.0 region.
		// Similar in role to a * 0.5 + 0.5, where -1.0 < a < 1.0.
		'const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			'vWPos = u_nodeWMatrix * vec4(vp, 1.0);\n'+
			'vposition = u_cameraWMatrix * u_nodeWMatrix * vec4(vp, 1.0);\n'+
			
			'vpositionViewportRegion = ScaleMatrix * uPMatrix * u_cameraWMatrix * u_nodeWMatrix * vec4(vp, 1.0);\n'+
			'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * vec4(vp, 1.0);\n'+
			'gl_PointSize = 2.0;\n'+
			
			'vTextureCoord = aTextureCoord;\n'+
			'vTextureUnit = aTextureUnit;\n'+
			
			'vWNMatrix = u_nodeWMatrixInverse * vec4(aVertexNormal, 1.0);\n'+
			'vWVNMatrix = u_nodeWVMatrixInverse * vec4(aVertexNormal, 1.0);\n'+
			'vReflect = normalize( reflect(normalize(vWPos.xyz - u_cameraPos.xyz), normalize(vWVNMatrix.xyz)) );\n'+
		'}';
		
	var sourceFragment;
	if(!_this._typeMobile) { 
		sourceFragment = _this.precision+ 
			'uniform mat4 u_cameraWMatrix;\n'+
			'uniform mat4 u_nodeWMatrixInverse;\n'+
			
			'uniform float uFar;\n'+
			'uniform int uShadows;\n'+
			'uniform vec3 uSpecularColor;\n'+
				
			'uniform vec3 uAmbientColor;\n'+
			
			'uniform vec3 uLightColor00;\n'+ // 00 sun
			'uniform vec3 uLightDirection00;\n'+
			'uniform vec3 uLightColor01;\n'+
			'uniform vec3 uLightDirection01;\n'+
			'uniform vec3 uLightColor02;\n'+
			'uniform vec3 uLightDirection02;\n'+
			'uniform vec3 uLightColor03;\n'+
			'uniform vec3 uLightDirection03;\n'+
			'uniform vec3 uLightColor04;\n'+
			'uniform vec3 uLightDirection04;\n'+
			'uniform vec3 uLightColor05;\n'+
			'uniform vec3 uLightDirection05;\n'+
			'uniform vec3 uLightColor06;\n'+
			'uniform vec3 uLightDirection06;\n'+
			'uniform vec3 uLightColor07;\n'+
			'uniform vec3 uLightDirection07;\n'+
			'uniform vec3 uLightColor08;\n'+
			'uniform vec3 uLightDirection08;\n'+
			'uniform vec3 uLightColor09;\n'+
			'uniform vec3 uLightDirection09;\n'+
			
			
			'uniform sampler2D sampler_textureFBNormals;\n'+
			'uniform sampler2D sampler_textureRandom;\n'+
			'uniform sampler2D sampler_textureFBShadows;\n'+
			'uniform sampler2D sampler_reflectionMap;\n'+ 
			'uniform sampler2D sampler_textureFBGIVoxel;\n'+
			//'uniform sampler2D sampler_kdTexture;\n'+
			//'uniform sampler2D sampler_bumpTexture;\n'+
			'uniform sampler2D objectTexturesKd['+_this.MAX_TEXTURESKD+'];\n\n\n'+
			'uniform float uRoughness['+_this.MAX_TEXTURESKD+'];\n'+
			'uniform float uIllumination;\n'+
			
			'uniform float uOcclusionLevel;\n'+
			'uniform float uViewportWidth;\n'+
			'uniform float uViewportHeight;\n'+
			
			'uniform int uUseTextureFBGIVoxel;\n'+
			'uniform int uUseBump;\n'+
			'uniform int uUseSSAO;\n'+
			'uniform int uUseShadows;\n'+
			'uniform int uSelectedNode;\n'+
			
			'varying vec3 vTextureCoord;\n'+
			'varying float vTextureUnit;\n'+
			'varying vec4 vposition;\n'+
			'varying vec4 vpositionViewportRegion;\n'+
			'varying vec4 vWNMatrix;\n'+
			'varying vec4 vWVNMatrix;\n'+
			'varying vec4 vWPos;\n'+
			'varying vec3 vReflect;\n'+
			
			'float unpack (vec4 colour) {'+
				'const vec4 bitShifts = vec4(1.0,'+
								'1.0 / 255.0,'+
								'1.0 / (255.0 * 255.0),'+
								'1.0 / (255.0 * 255.0 * 255.0));'+
				'return dot(colour, bitShifts);'+
			'}'+
			'float LinearDepthConstant = 1.0/uFar;'+
			
			'void main(void) {\n'+
				'vec2 vecRandomA[36];\n'+
				'vecRandomA[0] = vec2(0.009, 1.0);\n'+
				'vecRandomA[1] = vec2(0.87, 0.492);\n'+
				'vecRandomA[2] = vec2(0.862, -0.508);\n'+
				'vecRandomA[3] = vec2(-0.009, -1.0);\n'+
				'vecRandomA[4] = vec2(-0.87, -0.492);\n'+
				'vecRandomA[5] = vec2(-0.862, 0.508);\n'+
				
				'vecRandomA[6] = vec2(0.508, 0.862);\n'+
				'vecRandomA[7] = vec2(1.0, -0.009);\n'+
				'vecRandomA[8] = vec2(0.492, -0.87);\n'+
				'vecRandomA[9] = vec2(-0.508, -0.862);\n'+
				'vecRandomA[10] = vec2(-1.0, 0.009);\n'+
				'vecRandomA[11] = vec2(-0.492, 0.87);\n'+
				
				'vecRandomA[12] = vec2(0.182, 0.983);\n'+
				'vecRandomA[13] = vec2(0.943, 0.334);\n'+
				'vecRandomA[14] = vec2(0.76, -0.649);\n'+
				'vecRandomA[15] = vec2(-0.182, -0.983);\n'+
				'vecRandomA[16] = vec2(-0.943, -0.334);\n'+
				'vecRandomA[17] = vec2(-0.76, 0.649);\n'+

				'vecRandomA[18] = vec2(0.35, 0.937);\n'+
				'vecRandomA[19] = vec2(0.986, 0.165);\n'+
				'vecRandomA[20] = vec2(0.636, -0.772);\n'+
				'vecRandomA[21] = vec2(-0.35, -0.937);\n'+
				'vecRandomA[22] = vec2(-0.986, -0.165);\n'+
				'vecRandomA[23] = vec2(-0.636, 0.772);\n'+
				
				'vecRandomA[24] = vec2(0.649, 0.76);\n'+
				'vecRandomA[25] = vec2(0.983, -0.182);\n'+
				'vecRandomA[26] = vec2(0.334, -0.943);\n'+
				'vecRandomA[27] = vec2(-0.649, -0.76);\n'+
				'vecRandomA[28] = vec2(-0.983, 0.182);\n'+
				'vecRandomA[29] = vec2(-0.334, 0.943);\n'+
				
				'vecRandomA[30] = vec2(0.772, 0.636);\n'+
				'vecRandomA[31] = vec2(0.937, -0.35);\n'+
				'vecRandomA[32] = vec2(0.165, -0.986);\n'+
				'vecRandomA[33] = vec2(-0.772, -0.636);\n'+
				'vecRandomA[34] = vec2(-0.937, 0.35);\n'+
				'vecRandomA[35] = vec2(-0.165, 0.986);\n'+
				
				
				'float depthFromCam = length(vposition) * LinearDepthConstant;'+
				
				'vec3 pixelCoord = vpositionViewportRegion.xyz / vpositionViewportRegion.w;'+
				
				'vec4 textureFBGIVoxel = texture2D(sampler_textureFBGIVoxel, pixelCoord.xy);\n'+
				//'float GIVoxelsShadow = textureFBGIVoxel.x/(textureFBGIVoxel.g);'+
				'vec3 GIVoxelsShadow = vec3((textureFBGIVoxel.r/textureFBGIVoxel.a), (textureFBGIVoxel.g/textureFBGIVoxel.a), (textureFBGIVoxel.b/textureFBGIVoxel.a));'+
				
				'vec4 textureFBCameraDepth = texture2D(sampler_textureFBNormals, pixelCoord.xy);\n'+
				'float AFragmentDepth = textureFBCameraDepth.a;\n'+
				
				'float depthShadows = (1.0-pixelCoord.z)*0.2;\n'+
				'float depthSSAO = (1.0-pixelCoord.z);\n'+ 
				
				
				'vec4 BFragmentDepthMap;\n'+
				'float ABDepthDifference;\n'+
				'vec4 AFragmentShadowLayer;\n'+
				'vec4 BFragmentShadowLayer;\n'+
				
				'vec2 noiseCoord = vec2(pixelCoord.x*(uViewportWidth/32.0),pixelCoord.y*(uViewportHeight/32.0));\n'+ // 32px map noise
				
				'vec2 vecRandomB;\n'+
				
				// BLUR SHADOW MAP
				'float light = 1.0;\n'+  
				'if(uShadows == 1) {\n'+
					'if(uUseShadows == 1) {\n'+   
					
						'vec2 vecTextureCoordLight;\n'+
						'int hl = 0;\n'+
						'float lightB = 0.0;\n'+
						'const int f = 12;\n'+
						'for(int i =0; i < f; i++) {\n'+
							'vecRandomB = texture2D(sampler_textureRandom, noiseCoord+(vecRandomA[i].xy)).xy;\n'+
							'vecRandomB = vecRandomA[i].xy*vecRandomB.xy;\n'+
							'if(i < 6) {\n'+
								'vecTextureCoordLight = vecRandomB*(2.0*depthShadows);\n'+
							'} else if(i >= 6 && i < 12) {\n'+
								'vecTextureCoordLight = vecRandomB*(2.0*depthShadows);\n'+
							'}\n'+
					
							'BFragmentDepthMap = texture2D(sampler_textureFBNormals, pixelCoord.xy+vecTextureCoordLight.xy);\n'+
							'float BFragmentDepthL = BFragmentDepthMap.a+0.00005;\n'+
							
							'ABDepthDifference = abs(AFragmentDepth-BFragmentDepthL);\n'+
							'if((ABDepthDifference<0.005)) {\n'+
								'BFragmentShadowLayer = texture2D(sampler_textureFBShadows, pixelCoord.xy+vecTextureCoordLight.xy);\n'+
								'lightB += BFragmentShadowLayer.r;\n'+
								'hl++;'+
							'}\n'+
						'}\n'+
						'light = lightB/float(hl);\n'+
						
						/*'BFragmentShadowLayer = texture2D(sampler_textureFBShadows, pixelCoord.xy);\n'+
						'light = BFragmentShadowLayer.r;\n'+*/
					'}\n'+ 
				'} else {\n'+
					'light = 1.0;\n'+
				'}\n'+
				
				
				// SSAO STORMENGINEC
				'float ssao = 1.0;\n'+ 
				'if(uUseSSAO == 1) {\n'+
					'vec4 AFragmentNormal = texture2D(sampler_textureFBNormals, pixelCoord.xy);\n'+
					'vec3 normalA = vec3((AFragmentNormal.x*2.0)-1.0,(AFragmentNormal.y*2.0)-1.0,(AFragmentNormal.z*2.0)-1.0);'+ 
					
					'vec2 vecTextureCoordB;\n'+
					
					'int h = 0;\n'+
					'float acum = 0.0;\n'+
					'const int f = 36;\n'+
					'for(int i =0; i < f; i++) {\n'+
						'vecRandomB = texture2D(sampler_textureRandom, noiseCoord+(vecRandomA[i].xy)).xy;\n'+
						'vecRandomB = vecRandomA[i].xy*vecRandomB.xy;\n'+
						'if(i < 6) {\n'+
							'vecTextureCoordB = vecRandomB*(0.02*depthSSAO);\n'+
						'} else if(i >= 6 && i < 12) {\n'+
							'vecTextureCoordB = vecRandomB*(0.02*depthSSAO);\n'+
						'} else if(i >= 12 && i < 18) {\n'+
							'vecTextureCoordB = vecRandomB*(2.0*depthSSAO);\n'+
						'} else if(i >= 18 && i < 24) {\n'+
							'vecTextureCoordB = vecRandomB*(6.0*depthSSAO);\n'+
						'} else if(i >= 24 && i < 30) {\n'+
							'vecTextureCoordB = vecRandomB*(10.0*depthSSAO);\n'+
						'} else if(i >= 30 && i < 36) {\n'+
							'vecTextureCoordB = vecRandomB*(15.0*depthSSAO);\n'+
						'}\n'+
						
						'BFragmentDepthMap = texture2D(sampler_textureFBNormals, pixelCoord.xy+(vecTextureCoordB.xy*AFragmentDepth*20.0));\n'+
						'float BFragmentDepth = BFragmentDepthMap.a+0.00005;\n'+
						'vec3 normalB = vec3((BFragmentDepthMap.x*2.0)-1.0,(BFragmentDepthMap.y*2.0)-1.0,(BFragmentDepthMap.z*2.0)-1.0);'+
						
						'ABDepthDifference = abs(AFragmentDepth-BFragmentDepth);\n'+
						'if(ABDepthDifference < 0.02) {\n'+
							'float ABNormalDifference = 1.0-abs(dot(normalA, normalB));\n'+
							'float t = (1.0-(ABDepthDifference/0.02))*ABNormalDifference;\n'+
							'float oAB = (ABNormalDifference+t)/uOcclusionLevel;\n'+
							'acum += oAB;\n'+
							'h++;\n'+
						'}\n'+
					'}\n'+
					'ssao = 1.0-(acum/float(h));\n'+
				'}\n'+
				
				'vec4 textureColor;'+
				'float roughness;'+
				'float texUnit = vTextureUnit;'+      
				'if(texUnit < 0.1 ) {';
				for(var n = 0, fn = _this.MAX_TEXTURESKD; n < fn; n++) {
				sourceFragment += ''+
					'textureColor = texture2D(objectTexturesKd['+n+'], vec2(vTextureCoord.s, vTextureCoord.t));\n'+
					'roughness = uRoughness['+n+'];\n';
				if(n < _this.MAX_TEXTURESKD-1) sourceFragment += '} else if(texUnit < '+(n+1)+'.1) {';
				}
				sourceFragment += ''+
				'} else {'+
					'textureColor = texture2D(objectTexturesKd[0], vec2(vTextureCoord.s, vTextureCoord.t));\n'+ 
					'roughness = 0.8928571428571429;\n'+
				'}'+	
				
				
				'vec3 weightAmbient = uAmbientColor;\n'+
				'vec3 restWeight = vec3(1.0,1.0,1.0)-weightAmbient;\n'+
				
				'vec3 eyeDirection = normalize(vec3(u_cameraWMatrix * vec4(vWPos.xyz,1.0)));\n'+
				

				'vec3 lightColor[10];\n'+
				'vec3 lightDirection[10];\n'+
				'lightColor[0] = uLightColor00;\n'+
				'lightDirection[0] = uLightDirection00;\n'+
				'lightColor[1] = uLightColor01;\n'+
				'lightDirection[1] = uLightDirection01;\n'+
				'lightColor[2] = uLightColor02;\n'+
				'lightDirection[2] = uLightDirection02;\n'+
				'lightColor[3] = uLightColor03;\n'+
				'lightDirection[3] = uLightDirection03;\n'+
				'lightColor[4] = uLightColor04;\n'+
				'lightDirection[4] = uLightDirection04;\n'+
				'lightColor[5] = uLightColor05;\n'+
				'lightDirection[5] = uLightDirection05;\n'+
				'lightColor[6] = uLightColor06;\n'+
				'lightDirection[6] = uLightDirection06;\n'+
				'lightColor[7] = uLightColor07;\n'+
				'lightDirection[7] = uLightDirection07;\n'+
				'lightColor[8] = uLightColor08;\n'+
				'lightDirection[8] = uLightDirection08;\n'+
				'lightColor[9] = uLightColor09;\n'+
				'lightDirection[9] = uLightDirection09;\n'+
				
				
				'vec3 acum = vec3(0.0,0.0,0.0);\n'+
				'vec3 weights = vec3(0.0,0.0,0.0);\n'+ 
				'float acumBump = 0.0;\n'+
				'const int f = 10;\n'+
				'int acumLights = 0;'+
				'for(int i =0; i<f; i++) {\n'+		
					
					'float weightBump = 0.0;\n'+
					'if((lightColor[i].x != 0.0) || (lightColor[i].y != 0.0) || (lightColor[i].z != 0.0)) {\n'+
						// difusa
						'vec3 lightDirection = normalize(lightDirection[i] * -1.0);\n'+ // direccion hacia arriba
						'float lightWeighting = max(dot(normalize(vWNMatrix.xyz), -lightDirection)*-1.0, 0.0);\n'+
						'vec3 weightDiffuse = min(vec3(1.0,1.0,1.0),vec3(lightWeighting,lightWeighting,lightWeighting)+uIllumination);\n'+
						
						// especular
						'vec3 reflectionDirection = reflect(-lightDirection, normalize(vWVNMatrix.xyz));\n'+
						'float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection*-1.0), 0.0), roughness);\n'+
						'vec3 weightSpecular = uSpecularColor * specularLightWeighting;\n'+
						
						//'float restDiffuse = length(vec3(1.0,1.0,1.0)-(weightDiffuse));\n'+
						'weights = min(vec3(1.0,1.0,1.0),(weightDiffuse + weightSpecular)) * min(1.0,(light+uIllumination));\n'+
						
						// bump
						/*'if(uUseBump == 1) {\n'+
							'vec4 textureColorBump = texture2D(sampler_bumpTexture, vec2(vTextureCoord.s, vTextureCoord.t));\n'+ 
							'weightBump = dot(vec3(-1.0+(textureColorBump.g*2.0),textureColorBump.b,-(-1.0+(textureColorBump.r*2.0))), lightDirection);'+ 
						'}\n'+*/
						'acumLights++;'+
					'}\n'+
					
					
					//'acumBump += min(vec3(1.0,1.0,1.0),weightBump);\n'+
				'}\n'+
				'acum = weights/float(acumLights);\n'+
				// bump
				'if(uUseBump == 1) {\n'+
					//'acum *= acumBump;\n'+
				'}\n'+
				'vec4 asd = (textureColor.rgba-normalize(textureColor.rgba))*uIllumination;\n'+ 
				'textureColor += asd;\n'+
				
				// reflection (http://www.clicktorelease.com/code/streetViewReflectionMapping/)
				'float PI = 3.14159265358979323846264;\n'+ 
				'float yaw = .5 - atan( vReflect.z, - vReflect.x ) / ( 2.0 * PI );\n'+ 
				'float pitch = .5 - asin( vReflect.y ) / PI;\n'+ 
				'vec4 reflectionColor = texture2D(sampler_reflectionMap, vec2(yaw, pitch));\n'+
				'float reflectionWeight = smoothstep(0.0, 0.8928571428571429, roughness);\n'+
				
				
				'acum = ((textureColor.rgb*reflectionWeight)+(reflectionColor.rgb*(1.0-reflectionWeight)))* min(vec3(1.0,1.0,1.0), acum + weightAmbient);\n'+  	
				
				'if(uUseSSAO == 1) acum *= min(1.0,ssao+uIllumination);\n'+			
				
				'if(uSelectedNode == 0) {\n'+
					'if(uUseTextureFBGIVoxel == 1) {'+
						'if(light == 1.0) gl_FragColor = vec4(acum*(0.75+(length(GIVoxelsShadow)/4.0)), textureColor.a);\n'+ 
						'else gl_FragColor = vec4(((GIVoxelsShadow*acum)+(acum*GIVoxelsShadow)), textureColor.a);\n'+ // blend type SOURCE:DST_COLOR DEST:SRC_COLOR
					'} else gl_FragColor = vec4(acum, textureColor.a);\n'+
				'} else {\n'+
					'gl_FragColor = vec4( min(1.0,acum.x+0.6), acum.y, acum.z, textureColor.a);\n'+
				'}\n'+
				//'if(uUseTextureFBGIVoxel == 1) gl_FragColor = vec4(GIVoxelsShadow,1.0);\n'+ 
				//'if(uUseTextureFBGIVoxel == 1) gl_FragColor = textureFBGIVoxel;\n'+ 
			'}';
	} else {
		sourceFragment = _this.precision+
			'uniform mat4 u_cameraWMatrix;\n'+
			'uniform mat4 u_nodeWMatrixInverse;\n'+
			
			'uniform float uFar;\n'+
			'uniform int uShadows;\n'+
			'uniform vec3 uSpecularColor;\n'+
				
			'uniform vec3 uAmbientColor;\n'+
			
			'uniform vec3 uLightColor00;\n'+ // 00 sun
			'uniform vec3 uLightDirection00;\n'+
			'uniform vec3 uLightColor01;\n'+
			'uniform vec3 uLightDirection01;\n'+
			'uniform vec3 uLightColor02;\n'+
			'uniform vec3 uLightDirection02;\n'+
			'uniform vec3 uLightColor03;\n'+
			'uniform vec3 uLightDirection03;\n'+
			'uniform vec3 uLightColor04;\n'+
			'uniform vec3 uLightDirection04;\n'+
			'uniform vec3 uLightColor05;\n'+
			'uniform vec3 uLightDirection05;\n'+
			'uniform vec3 uLightColor06;\n'+
			'uniform vec3 uLightDirection06;\n'+
			'uniform vec3 uLightColor07;\n'+
			'uniform vec3 uLightDirection07;\n'+
			'uniform vec3 uLightColor08;\n'+
			'uniform vec3 uLightDirection08;\n'+
			'uniform vec3 uLightColor09;\n'+
			'uniform vec3 uLightDirection09;\n'+
			
			
			'uniform sampler2D sampler_textureFBNormals;\n'+
			'uniform sampler2D sampler_textureRandom;\n'+
			'uniform sampler2D sampler_textureFBShadows;\n'+
			'uniform sampler2D sampler_reflectionMap;\n'+ 
			'uniform sampler2D sampler_textureFBGIVoxel;\n'+
			//'uniform sampler2D sampler_kdTexture;\n'+
			//'uniform sampler2D sampler_bumpTexture;\n'+
			'uniform sampler2D objectTexturesKd['+_this.MAX_TEXTURESKD+'];\n\n\n'+
			'uniform float uRoughness['+_this.MAX_TEXTURESKD+'];\n'+
			'uniform float uIllumination;\n'+
			
			'uniform float uOcclusionLevel;\n'+
			'uniform float uViewportWidth;\n'+
			'uniform float uViewportHeight;\n'+
			
			'uniform int uUseTextureFBGIVoxel;\n'+
			'uniform int uUseBump;\n'+
			'uniform int uUseSSAO;\n'+
			'uniform int uUseShadows;\n'+
			'uniform int uSelectedNode;\n'+
			
			'varying vec3 vTextureCoord;\n'+
			'varying float vTextureUnit;\n'+
			'varying vec4 vposition;\n'+
			'varying vec4 vpositionViewportRegion;\n'+
			'varying vec4 vWNMatrix;\n'+
			'varying vec4 vWVNMatrix;\n'+
			'varying vec4 vWPos;\n'+
			'varying vec3 vReflect;\n'+
			
			'float unpack (vec4 colour) {'+
				'const vec4 bitShifts = vec4(1.0,'+
								'1.0 / 255.0,'+
								'1.0 / (255.0 * 255.0),'+
								'1.0 / (255.0 * 255.0 * 255.0));'+
				'return dot(colour, bitShifts);'+
			'}'+
			'float LinearDepthConstant = 1.0/uFar;'+
			
			'void main(void) {\n'+   
				'vec2 vecRandomA[36];\n'+
				'vecRandomA[0] = vec2(0.009, 1.0);\n'+
				'vecRandomA[1] = vec2(0.87, 0.492);\n'+
				'vecRandomA[2] = vec2(0.862, -0.508);\n'+
				'vecRandomA[3] = vec2(-0.009, -1.0);\n'+
				'vecRandomA[4] = vec2(-0.87, -0.492);\n'+
				'vecRandomA[5] = vec2(-0.862, 0.508);\n'+
				
				'vecRandomA[6] = vec2(0.508, 0.862);\n'+
				'vecRandomA[7] = vec2(1.0, -0.009);\n'+
				'vecRandomA[8] = vec2(0.492, -0.87);\n'+
				'vecRandomA[9] = vec2(-0.508, -0.862);\n'+
				'vecRandomA[10] = vec2(-1.0, 0.009);\n'+
				'vecRandomA[11] = vec2(-0.492, 0.87);\n'+
				
				'vecRandomA[12] = vec2(0.182, 0.983);\n'+
				'vecRandomA[13] = vec2(0.943, 0.334);\n'+
				'vecRandomA[14] = vec2(0.76, -0.649);\n'+
				'vecRandomA[15] = vec2(-0.182, -0.983);\n'+
				'vecRandomA[16] = vec2(-0.943, -0.334);\n'+
				'vecRandomA[17] = vec2(-0.76, 0.649);\n'+
				  
				'vec3 pixelCoord = vpositionViewportRegion.xyz / vpositionViewportRegion.w;'+
				'float light = 1.0;\n';
				if(_this._supportFormat == _this.gl.FLOAT) {
					sourceFragment += ''+
					'vec4 textureFBCameraDepth = texture2D(sampler_textureFBNormals, pixelCoord.xy);\n'+
					'float AFragmentDepth = textureFBCameraDepth.a;\n'+
					
					'float depthShadows = (1.0-pixelCoord.z)*0.2;\n'+
					'float depthSSAO = (1.0-pixelCoord.z);\n'+ 
					
					
					'vec4 BFragmentDepthMap;\n'+
					'float ABDepthDifference;\n'+
					'vec4 AFragmentShadowLayer;\n'+
					'vec4 BFragmentShadowLayer;\n'+
					
					'vec2 noiseCoord = vec2(pixelCoord.x*(uViewportWidth/32.0),pixelCoord.y*(uViewportHeight/32.0));\n'+ // 32px map noise
					
					'vec2 vecRandomB;\n'+
				
					// BLUR SHADOW MAP
					'if(uShadows == 1) {\n'+
						'if(uUseShadows == 1) {\n'+   
						
							'vec2 vecTextureCoordLight;\n'+
							'int hl = 0;\n'+
							'float lightB = 0.0;\n'+
							'const int f = 12;\n'+
							'for(int i =0; i < f; i++) {\n'+
								'vecRandomB = texture2D(sampler_textureRandom, noiseCoord+(vecRandomA[i].xy)).xy;\n'+
								'vecRandomB = vecRandomA[i].xy*vecRandomB.xy;\n'+
								'if(i < 6) {\n'+
									'vecTextureCoordLight = vecRandomB*(2.0*depthShadows);\n'+
								'} else if(i >= 6 && i < 12) {\n'+
									'vecTextureCoordLight = vecRandomB*(2.0*depthShadows);\n'+
								'}\n'+
						
								'BFragmentDepthMap = texture2D(sampler_textureFBNormals, pixelCoord.xy+vecTextureCoordLight.xy);\n'+
								'float BFragmentDepthL = BFragmentDepthMap.a+0.00005;\n'+
								
								'ABDepthDifference = abs(AFragmentDepth-BFragmentDepthL);\n'+
								'if((ABDepthDifference<0.005)) {\n'+
									'BFragmentShadowLayer = texture2D(sampler_textureFBShadows, pixelCoord.xy+vecTextureCoordLight.xy);\n'+
									'lightB += BFragmentShadowLayer.r;\n'+
									'hl++;'+
								'}\n'+
							'}\n'+
							'light = lightB/float(hl);\n'+
							
							/*'BFragmentShadowLayer = texture2D(sampler_textureFBShadows, pixelCoord.xy);\n'+
							'light = BFragmentShadowLayer.r;\n'+*/
						'}\n'+ 
					'} else {\n'+
						'light = 1.0;\n'+
					'}\n'+
					
					// SSAO STORMENGINEC
					'float ssao = 1.0;\n'+ 
					'if(uUseSSAO == 1) {\n'+
						'vec4 AFragmentNormal = texture2D(sampler_textureFBNormals, pixelCoord.xy);\n'+
						'vec3 normalA = vec3((AFragmentNormal.x*2.0)-1.0,(AFragmentNormal.y*2.0)-1.0,(AFragmentNormal.z*2.0)-1.0);'+ 
						
						'vec2 vecTextureCoordB;\n'+
						
						'int h = 0;\n'+
						'float acum = 0.0;\n'+
						'const int f = 18;\n'+
						'for(int i =0; i < f; i++) {\n'+
							'vecRandomB = texture2D(sampler_textureRandom, noiseCoord+(vecRandomA[i].xy)).xy;\n'+
							'vecRandomB = vecRandomA[i].xy*vecRandomB.xy;\n'+
							'if(i < 6) {\n'+
								'vecTextureCoordB = vecRandomB*(0.5*depthSSAO);\n'+
							'} else if(i >= 6 && i < 12) {\n'+
								'vecTextureCoordB = vecRandomB*(3.0*depthSSAO);\n'+
							'} else if(i >= 12 && i < 18) {\n'+
								'vecTextureCoordB = vecRandomB*(15.0*depthSSAO);\n'+
							'}\n'+
							
							'BFragmentDepthMap = texture2D(sampler_textureFBNormals, pixelCoord.xy+(vecTextureCoordB.xy*AFragmentDepth*20.0));\n'+
							'float BFragmentDepth = BFragmentDepthMap.a+0.00005;\n'+
							'vec3 normalB = vec3((BFragmentDepthMap.x*2.0)-1.0,(BFragmentDepthMap.y*2.0)-1.0,(BFragmentDepthMap.z*2.0)-1.0);'+
							
							'ABDepthDifference = abs(AFragmentDepth-BFragmentDepth);\n'+
							'if(ABDepthDifference < 0.02) {\n'+
								'float ABNormalDifference = 1.0-abs(dot(normalA, normalB));\n'+
								'float t = (1.0-(ABDepthDifference/0.02))*ABNormalDifference;\n'+
								'float oAB = (ABNormalDifference+t)/uOcclusionLevel;\n'+
								'acum += oAB;\n'+
								'h++;\n'+
							'}\n'+
						'}\n'+
						'ssao = 1.0-(acum/float(h));\n'+
					'}\n';
				}
				sourceFragment += ''+
				'vec4 textureColor;'+
				'float roughness;'+
				'float texUnit = vTextureUnit;'+      
				'if(texUnit < 0.1 ) {';
				for(var n = 0, fn = _this.MAX_TEXTURESKD; n < fn; n++) {
				sourceFragment += ''+
					'textureColor = texture2D(objectTexturesKd['+n+'], vec2(vTextureCoord.s, vTextureCoord.t));\n'+
					'roughness = uRoughness['+n+'];\n';
				if(n < _this.MAX_TEXTURESKD-1) sourceFragment += '} else if(texUnit < '+(n+1)+'.1) {';
				}
				sourceFragment += ''+
				'} else {'+
					'textureColor = texture2D(objectTexturesKd[0], vec2(vTextureCoord.s, vTextureCoord.t));\n'+ 
					'roughness = 0.8928571428571429;\n'+
				'}'+	
				
				
				'vec3 weightAmbient = uAmbientColor;\n'+
				'vec3 restWeight = vec3(1.0,1.0,1.0)-weightAmbient;\n'+
				
				'vec3 eyeDirection = normalize(vec3(u_cameraWMatrix * vec4(vWPos.xyz,1.0)));\n'+
				

				'vec3 lightColor[10];\n'+
				'vec3 lightDirection[10];\n'+
				'lightColor[0] = uLightColor00;\n'+
				'lightDirection[0] = uLightDirection00;\n'+
				'lightColor[1] = uLightColor01;\n'+
				'lightDirection[1] = uLightDirection01;\n'+
				'lightColor[2] = uLightColor02;\n'+
				'lightDirection[2] = uLightDirection02;\n'+
				'lightColor[3] = uLightColor03;\n'+
				'lightDirection[3] = uLightDirection03;\n'+
				'lightColor[4] = uLightColor04;\n'+
				'lightDirection[4] = uLightDirection04;\n'+
				'lightColor[5] = uLightColor05;\n'+
				'lightDirection[5] = uLightDirection05;\n'+
				'lightColor[6] = uLightColor06;\n'+
				'lightDirection[6] = uLightDirection06;\n'+
				'lightColor[7] = uLightColor07;\n'+
				'lightDirection[7] = uLightDirection07;\n'+
				'lightColor[8] = uLightColor08;\n'+
				'lightDirection[8] = uLightDirection08;\n'+
				'lightColor[9] = uLightColor09;\n'+
				'lightDirection[9] = uLightDirection09;\n'+
				
				
				'vec3 acum = vec3(0.0,0.0,0.0);\n'+
				'vec3 weights = vec3(0.0,0.0,0.0);\n'+ 
				'float acumBump = 0.0;\n'+
				'const int f = 10;\n'+
				'int acumLights = 0;'+
				'for(int i =0; i<f; i++) {\n'+		
					
					'float weightBump = 0.0;\n'+
					'if((lightColor[i].x != 0.0) || (lightColor[i].y != 0.0) || (lightColor[i].z != 0.0)) {\n'+
						// difusa
						'vec3 lightDirection = normalize(lightDirection[i] * -1.0);\n'+ // direccion hacia arriba
						'float lightWeighting = max(dot(normalize(vWNMatrix.xyz), -lightDirection)*-1.0, 0.0);\n'+
						'vec3 weightDiffuse = min(vec3(1.0,1.0,1.0),vec3(lightWeighting,lightWeighting,lightWeighting)+uIllumination);\n'+
						
						// especular
						'vec3 reflectionDirection = reflect(-lightDirection, normalize(vWVNMatrix.xyz));\n'+
						'float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection*-1.0), 0.0), roughness);\n'+
						'vec3 weightSpecular = uSpecularColor * specularLightWeighting;\n'+
						
						//'float restDiffuse = length(vec3(1.0,1.0,1.0)-(weightDiffuse));\n'+
						'weights = min(vec3(1.0,1.0,1.0),(weightDiffuse + weightSpecular)) * min(1.0,(light+uIllumination));\n'+
						
						// bump
						/*'if(uUseBump == 1) {\n'+
							'vec4 textureColorBump = texture2D(sampler_bumpTexture, vec2(vTextureCoord.s, vTextureCoord.t));\n'+ 
							'weightBump = dot(vec3(-1.0+(textureColorBump.g*2.0),textureColorBump.b,-(-1.0+(textureColorBump.r*2.0))), lightDirection);'+ 
						'}\n'+*/
						'acumLights++;'+
					'}\n'+
					
					
					//'acumBump += min(vec3(1.0,1.0,1.0),weightBump);\n'+
				'}\n'+
				'acum = weights/float(acumLights);\n'+
				// bump
				'if(uUseBump == 1) {\n'+
					//'acum *= acumBump;\n'+
				'}\n'+
				'vec4 asd = (textureColor.rgba-normalize(textureColor.rgba))*uIllumination;\n'+ 
				'textureColor += asd;\n'+
				
				// reflection (http://www.clicktorelease.com/code/streetViewReflectionMapping/)
				'float PI = 3.14159265358979323846264;\n'+ 
				'float yaw = .5 - atan( vReflect.z, - vReflect.x ) / ( 2.0 * PI );\n'+ 
				'float pitch = .5 - asin( vReflect.y ) / PI;\n'+ 
				'vec4 reflectionColor = texture2D(sampler_reflectionMap, vec2(yaw, pitch));\n'+
				'float reflectionWeight = smoothstep(0.0, 0.8928571428571429, roughness);\n'+
				
				
				'acum = ((textureColor.rgb*reflectionWeight)+(reflectionColor.rgb*(1.0-reflectionWeight)))* min(vec3(1.0,1.0,1.0), acum + weightAmbient);\n';
				
				if(_this._supportFormat == _this.gl.FLOAT) 
					sourceFragment += 	'if(uUseSSAO == 1) acum *= min(1.0,ssao+uIllumination);\n'+			
										'gl_FragColor = vec4(acum, textureColor.a);\n';
				else sourceFragment += 'gl_FragColor = textureColor;\n'; 
				
				sourceFragment += ''+
			'}';
	}
	_this.shader_Scene = _this.gl.createProgram();
	_this.createShader(_this.gl, "SCENE", sourceVertex, sourceFragment, _this.shader_Scene, _this.pointers_Scene);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_Scene = function() {
	_this = stormEngineC.stormGLContext;
	_this.u_Scene_far = _this.gl.getUniformLocation(_this.shader_Scene, "uFar");
	_this.u_Scene_ambientColor = _this.gl.getUniformLocation(_this.shader_Scene, "uAmbientColor");

	_this.u_Scene_lightColor00 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor00");
	_this.u_Scene_lightDirection00 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection00");
	_this.u_Scene_lightColor01 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor01");
	_this.u_Scene_lightDirection01 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection01");
	_this.u_Scene_lightColor02 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor02");
	_this.u_Scene_lightDirection02 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection02");
	_this.u_Scene_lightColor03 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor03");
	_this.u_Scene_lightDirection03 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection03");
	_this.u_Scene_lightColor04 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor04");
	_this.u_Scene_lightDirection04 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection04");
	_this.u_Scene_lightColor05 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor05");
	_this.u_Scene_lightDirection05 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection05");
	_this.u_Scene_lightColor06 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor06");
	_this.u_Scene_lightDirection06 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection06");
	_this.u_Scene_lightColor07 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor07");
	_this.u_Scene_lightDirection07 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection07");
	_this.u_Scene_lightColor08 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor08");
	_this.u_Scene_lightDirection08 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection08");
	_this.u_Scene_lightColor09 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightColor09");
	_this.u_Scene_lightDirection09 = _this.gl.getUniformLocation(_this.shader_Scene, "uLightDirection09");
	
	//_this.sampler_Scene_kdTexture = _this.gl.getUniformLocation(_this.shader_Scene, "sampler_kdTexture");
	//_this.sampler_Scene_bumpTexture = _this.gl.getUniformLocation(_this.shader_Scene, "sampler_bumpTexture");
	_this.sampler_Scene_textureFBNormals = _this.gl.getUniformLocation(_this.shader_Scene, "sampler_textureFBNormals");
	_this.sampler_Scene_textureRandom = _this.gl.getUniformLocation(_this.shader_Scene, "sampler_textureRandom");
	_this.sampler_Scene_textureFBShadows = _this.gl.getUniformLocation(_this.shader_Scene, "sampler_textureFBShadows");
	_this.sampler_Scene_reflectionMap = _this.gl.getUniformLocation(_this.shader_Scene, "sampler_reflectionMap");
	_this.sampler_Scene_textureFB_GIVoxel = _this.gl.getUniformLocation(_this.shader_Scene, "sampler_textureFBGIVoxel");
	_this.samplers_Scene_objectTexturesKd = [];
	_this.us_Scene_roughness = [];
	for(var n = 0; n < _this.MAX_TEXTURESKD; n++) {
		_this.samplers_Scene_objectTexturesKd[n] = _this.gl.getUniformLocation(_this.shader_Scene, "objectTexturesKd["+n+"]");
		_this.us_Scene_roughness[n] = _this.gl.getUniformLocation(_this.shader_Scene, "uRoughness["+n+"]");
	}
	
	_this.u_Scene_ssaoLevel = _this.gl.getUniformLocation(_this.shader_Scene, "uOcclusionLevel");
	_this.u_Scene_viewportWidth = _this.gl.getUniformLocation(_this.shader_Scene, "uViewportWidth");
	_this.u_Scene_viewportHeight = _this.gl.getUniformLocation(_this.shader_Scene, "uViewportHeight");
	
	_this.u_Scene_useTextureFBGIVoxel = _this.gl.getUniformLocation(_this.shader_Scene, "uUseTextureFBGIVoxel");
	_this.u_Scene_useBump = _this.gl.getUniformLocation(_this.shader_Scene, "uUseBump");
	_this.u_Scene_useSsao = _this.gl.getUniformLocation(_this.shader_Scene, "uUseSSAO");
	_this.u_Scene_useShadows = _this.gl.getUniformLocation(_this.shader_Scene, "uUseShadows");
	_this.u_Scene_selectedNode = _this.gl.getUniformLocation(_this.shader_Scene, "uSelectedNode");
	
	
	_this.u_Scene_illumination = _this.gl.getUniformLocation(_this.shader_Scene, "uIllumination");
	_this.u_Scene_shadows = _this.gl.getUniformLocation(_this.shader_Scene, "uShadows");
	_this.u_Scene_colorSpecular = _this.gl.getUniformLocation(_this.shader_Scene, "uSpecularColor");

	_this.attr_Scene_pos = _this.gl.getAttribLocation(_this.shader_Scene, "aVertexPosition");
	_this.attr_Scene_normal = _this.gl.getAttribLocation(_this.shader_Scene, "aVertexNormal");
	_this.attr_Scene_UV = _this.gl.getAttribLocation(_this.shader_Scene, "aTextureCoord");
	_this.attr_Scene_textureUnit = _this.gl.getAttribLocation(_this.shader_Scene, "aTextureUnit");

	
	_this.u_Scene_PMatrix = _this.gl.getUniformLocation(_this.shader_Scene, "uPMatrix");
	_this.u_Scene_cameraWMatrix = _this.gl.getUniformLocation(_this.shader_Scene, "u_cameraWMatrix");
	_this.u_Scene_cameraPos = _this.gl.getUniformLocation(_this.shader_Scene, "u_cameraPos");
	_this.u_Scene_nodeWMatrix = _this.gl.getUniformLocation(_this.shader_Scene, "u_nodeWMatrix");
	_this.u_Scene_nodeVScale = _this.gl.getUniformLocation(_this.shader_Scene, "u_nodeVScale");
	_this.u_Scene_nodeWMatrixInverse = _this.gl.getUniformLocation(_this.shader_Scene, "u_nodeWMatrixInverse");
	_this.u_Scene_nodeWVMatrixInverse = _this.gl.getUniformLocation(_this.shader_Scene, "u_nodeWVMatrixInverse");
	_this.Shader_Scene_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_Scene = function() {
	this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	} else {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer); 
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureObject_DOF, 0);
	}
	
	if(this.useEnvironment == true) {
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA); 
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
	} else {
		if(this.useBGAmbient == true) {
			this.gl.clearColor(this.ambientColor.e[0], this.ambientColor.e[1], this.ambientColor.e[2], 1.0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		} else if(this.useBGSolid == true) {
			this.gl.clearColor(this.useBGSolidColor.e[0], this.useBGSolidColor.e[1], this.useBGSolidColor.e[2], 1.0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		} else if(this.useBGTrans == true) {
			this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
		}
	}
	
	this.gl.useProgram(this.shader_Scene);
	
	this.gl.uniform1f(this.u_Scene_far, this.far);
	this.gl.uniform3f(this.u_Scene_ambientColor,this.ambientColor.e[0],this.ambientColor.e[1],this.ambientColor.e[2]); 
	for(var n = 0, f = 10; n < f; n++) {
		var light =  this.lights[n];
		if(light != undefined && light.visibleOnContext == true) {
			var adjustedLD = light.direction;
			if(n == 0) {
				this.gl.uniform3f(this.u_Scene_lightDirection00, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor00, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 1) {
				this.gl.uniform3f(this.u_Scene_lightDirection01, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor01, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 2) {
				this.gl.uniform3f(this.u_Scene_lightDirection02, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor02, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 3) {
				this.gl.uniform3f(this.u_Scene_lightDirection03, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor03, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 4) {
				this.gl.uniform3f(this.u_Scene_lightDirection04, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor04, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 5) {
				this.gl.uniform3f(this.u_Scene_lightDirection05, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor05, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 6) {
				this.gl.uniform3f(this.u_Scene_lightDirection06, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor06, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 7) {
				this.gl.uniform3f(this.u_Scene_lightDirection07, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor07, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 8) {
				this.gl.uniform3f(this.u_Scene_lightDirection08, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor08, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 9) {
				this.gl.uniform3f(this.u_Scene_lightDirection09, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.u_Scene_lightColor09, light.color.e[0], light.color.e[1], light.color.e[2]);
			}
		} else {
			if(n == 0) {
				this.gl.uniform3f(this.u_Scene_lightDirection00, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor00, 0.0, 0.0, 0.0);
			} else if(n == 1) {
				this.gl.uniform3f(this.u_Scene_lightDirection01, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor01, 0.0, 0.0, 0.0);
			} else if(n == 2) {
				this.gl.uniform3f(this.u_Scene_lightDirection02, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor02, 0.0, 0.0, 0.0);
			} else if(n == 3) {
				this.gl.uniform3f(this.u_Scene_lightDirection03, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor03, 0.0, 0.0, 0.0);
			} else if(n == 4) {
				this.gl.uniform3f(this.u_Scene_lightDirection04, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor04, 0.0, 0.0, 0.0);
			} else if(n == 5) {
				this.gl.uniform3f(this.u_Scene_lightDirection05, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor05, 0.0, 0.0, 0.0);
			} else if(n == 6) {
				this.gl.uniform3f(this.u_Scene_lightDirection06, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor06, 0.0, 0.0, 0.0);
			} else if(n == 7) {
				this.gl.uniform3f(this.u_Scene_lightDirection07, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor07, 0.0, 0.0, 0.0);
			} else if(n == 8) {
				this.gl.uniform3f(this.u_Scene_lightDirection08, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor08, 0.0, 0.0, 0.0);
			} else if(n == 9) {
				this.gl.uniform3f(this.u_Scene_lightDirection09, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.u_Scene_lightColor09, 0.0, 0.0, 0.0);
			}
		}
	}
	
	this.gl.uniform1i(this.u_Scene_useShadows,this.shadowsEnable?1:0);
	this.gl.uniform1i(this.u_Scene_useSsao, this.SSAOenable?1:0);
    this.gl.uniform1f(this.u_Scene_ssaoLevel, this.SSAOlevel);
	this.gl.uniform1f(this.u_Scene_viewportWidth, this.viewportWidth);
	this.gl.uniform1f(this.u_Scene_viewportHeight, this.viewportHeight);
	
	this.gl.uniformMatrix4fv(this.u_Scene_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_Scene_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
	this.gl.uniform3f(this.u_Scene_cameraPos, stormEngineC.defaultCamera.MPOS.e[3], stormEngineC.defaultCamera.MPOS.e[7], stormEngineC.defaultCamera.MPOS.e[11]);
	
	var kdName;
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnContext == true) {
			kdName = this.nodes[n].materialUnits[0].textureKdName;
			if(kdName != undefined && kdName.match(/.png$/gim) == null) {
				for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {
					this.renderSceneNow(this.nodes[n],this.nodes[n].buffersObjects[nb]);
				}
			}
		}
	}
	this.gl.enable(this.gl.BLEND);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnContext == true) {
			kdName = this.nodes[n].materialUnits[0].textureKdName;
			if(kdName != undefined && kdName.match(/.png$/gim) != null) {
				for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {
					this.renderSceneNow(this.nodes[n],this.nodes[n].buffersObjects[nb]);
				}
			}
		}
	}
	
	var polPoints = stormEngineC.polarityPoints;
	for(var n = 0, f = polPoints.length; n < f; n++) {
		if(polPoints[n].visibleOnContext == true) {
			for(var nb = 0, fb = polPoints[n].buffersObjects.length; nb < fb; nb++) {
				this.renderSceneNow(polPoints[n], polPoints[n].buffersObjects[nb]); 
			}
		}
	}
	this.gl.disable(this.gl.BLEND);
	
	
};
/**
 * @private 
 */
StormGLContext.prototype.renderSceneNow = function(node, buffersObject) {
	if((this.Shader_GIv2_READY == true && this.GIv2enable == true)) {
		this.gl.uniform1i(this.u_Scene_useTextureFBGIVoxel, 1);
		this.sampleGiVoxels = this.sampleGiVoxels+1.0;
		//console.log(this.sampleGiVoxels);
	} else this.gl.uniform1i(this.u_Scene_useTextureFBGIVoxel, 0); 
		
	
	//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.useProgram(this.shader_Scene);
	this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
	
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_Normals);
	this.gl.uniform1i(this.sampler_Scene_textureFBNormals, 0);
	
	this.gl.activeTexture(this.gl.TEXTURE1);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRandom);
	this.gl.uniform1i(this.sampler_Scene_textureRandom, 1);
	
	this.gl.activeTexture(this.gl.TEXTURE2);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_Shadows);
	this.gl.uniform1i(this.sampler_Scene_textureFBShadows, 2);
	
	this.gl.activeTexture(this.gl.TEXTURE3);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.environmentMap);
	this.gl.uniform1i(this.sampler_Scene_reflectionMap, 3);
	
	this.gl.activeTexture(this.gl.TEXTURE4);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIVoxel);
	this.gl.uniform1i(this.sampler_Scene_textureFB_GIVoxel, 4);
		
	var next = this.OCCUPIEDSAMPLES_SHADERSCENE; 
	for(var n = 0; (n < node.materialUnits.length && n < _this.MAX_TEXTURESKD); n++) {
		if(next == 5) this.gl.activeTexture(this.gl.TEXTURE5);
		else if(next == 6) this.gl.activeTexture(this.gl.TEXTURE6);
		else if(next == 7) this.gl.activeTexture(this.gl.TEXTURE7);
		else if(next == 8) this.gl.activeTexture(this.gl.TEXTURE8);
		else if(next == 9) this.gl.activeTexture(this.gl.TEXTURE9);
		else if(next == 10) this.gl.activeTexture(this.gl.TEXTURE10);
		else if(next == 11) this.gl.activeTexture(this.gl.TEXTURE11);
		else if(next == 12) this.gl.activeTexture(this.gl.TEXTURE12);
		else if(next == 13) this.gl.activeTexture(this.gl.TEXTURE13);
		else if(next == 14) this.gl.activeTexture(this.gl.TEXTURE14);
		else if(next == 15) this.gl.activeTexture(this.gl.TEXTURE15);
		else if(next == 16) this.gl.activeTexture(this.gl.TEXTURE16);
		else this.gl.activeTexture(this.gl.TEXTURE16);
		if(node.materialUnits[n].textureObjectKd.textureData != undefined) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, node.materialUnits[n].textureObjectKd.textureData);    
			this.gl.uniform1i(this.samplers_Scene_objectTexturesKd[n], next);
		}
		next++;
		
		this.gl.uniform1f(this.us_Scene_roughness[n], node.materialUnits[n].Ns);
	}
		

	this.gl.uniform1i(this.u_Scene_useBump, 0);
	//if(node.materialUnits[0].textureObjectBump != undefined) this.gl.uniform1i(this.u_Scene_useBump, 1);
	
	this.gl.uniform1i(this.u_Scene_selectedNode, 0);
	if(stormEngineC.editMode == true && stormEngineC.nearNode != null && node == stormEngineC.nearNode)
		this.gl.uniform1i(this.u_Scene_selectedNode, 1);
	
	
	this.gl.uniform1f(this.u_Scene_illumination, node.materialUnits[0].illumination);
	var nodeShadows = (node.shadows == true) ? 1 : 0;
	this.gl.uniform1i(this.u_Scene_shadows, nodeShadows);
	this.gl.uniform3f(this.u_Scene_colorSpecular, 1.0, 1.0, 1.0);
	
	
	
	this.gl.uniformMatrix4fv(this.u_Scene_nodeWMatrix, false, node.MPOSFrame.transpose().e);
	this.gl.uniform3f(this.u_Scene_nodeVScale, node.VSCALE.e[0], node.VSCALE.e[1], node.VSCALE.e[2]); 
	this.gl.uniformMatrix4fv(this.u_Scene_nodeWMatrixInverse, false, node.MPOSFrame.inverse().e);
	this.gl.uniformMatrix4fv(this.u_Scene_nodeWVMatrixInverse, false, node.MCAMPOSFrame.inverse().e);
	
	
	this.gl.enableVertexAttribArray(this.attr_Scene_pos);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBuffer);
	this.gl.vertexAttribPointer(this.attr_Scene_pos, 3, this.gl.FLOAT, false, 0, 0);
	
	if(buffersObject.nodeMeshNormalArray != undefined) {
		this.gl.enableVertexAttribArray(this.attr_Scene_normal);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshNormalBuffer);
		this.gl.vertexAttribPointer(this.attr_Scene_normal, 3, this.gl.FLOAT, false, 0, 0);
	}
	if(buffersObject.nodeMeshTextureArray != undefined) {
		this.gl.enableVertexAttribArray(this.attr_Scene_UV);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshTextureBuffer);
		this.gl.vertexAttribPointer(this.attr_Scene_UV, 3, this.gl.FLOAT, false, 0, 0);
	}
	if(buffersObject.nodeMeshTextureUnitArray != undefined) {
		this.gl.enableVertexAttribArray(this.attr_Scene_textureUnit);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshTextureUnitBuffer);
		this.gl.vertexAttribPointer(this.attr_Scene_textureUnit, 1, this.gl.FLOAT, false, 0, 0);
	}
	if(buffersObject.nodeMeshIndexArray != undefined) {
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffersObject.nodeMeshIndexBuffer);
		this.gl.drawElements(buffersObject.drawElementsMode, buffersObject.nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
	} else {
		this.gl.drawArrays(buffersObject.drawElementsMode, 0, buffersObject.nodeMeshVertexBufferNumItems); 
	}  
};