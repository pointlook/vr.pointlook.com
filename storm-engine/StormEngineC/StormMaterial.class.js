/**
* @class
* @constructor
*/
StormMaterial = function() {
	this.gl = stormEngineC.stormGLContext.gl;
	
	this.idNum;
	this.Ns = 0.8928571428571429; // roughness 0.0-100.0 ->/112=(0.0 - 0.8928571428571429) 
	this.illumination = 0.0;
	this.solid = true;
	this.name = '';
	
	
	this.typeTexture = 'albedo'; // temporal variable. albedo|bump
	
	this.textureKdName = undefined; // string name map albedo
	this.textureObjectKd = stormEngineC.clgl.createBuffer([1,1], "FLOAT4", 0, false); // WebGL texture albedo
	stormEngineC.clgl.enqueueWriteBuffer(this.textureObjectKd, [1,1,1,1]);	
	
	this.textureBumpName = undefined; // string name map bump
	this.textureObjectBump = undefined; // WebGL texture map bump
};

/** @private */
StormMaterial.prototype.writeNow = function(arr, arrDimensions) {
	this.solid = false;
	if(this.typeTexture == 'albedo') {
		this.textureObjectKd = stormEngineC.clgl.createBuffer(arrDimensions, "FLOAT4", 0, true); 
		stormEngineC.clgl.enqueueWriteBuffer(this.textureObjectKd, arr, true);
	} else if(this.typeTexture == 'bump') {
		this.textureObjectBump = stormEngineC.clgl.createBuffer(arrDimensions, "FLOAT4", 0, true);  
		stormEngineC.clgl.enqueueWriteBuffer(this.textureObjectKd, arr, true); 
	}
	
	if(this.typeTexture == 'albedo')
		this.textureKdName = this.name;
	else if(this.typeTexture == 'bump')
		this.textureBumpName = this.name;
};
/**
* Set color
* @type Void
* @param {StormV3|String|Array|Float32Array|Uint8Array|WebGLTexture|HTMLImageElement} color
* @param {String} [typeTexture="albedo"] 'albedo' or 'bump'
*/
StormMaterial.prototype.write = function(color, typeTexture) { 
	this.typeTexture = typeTexture == undefined ? 'albedo' : typeTexture;
	
	if(color instanceof StormV3) { 
		this.writeNow([color.e[0],color.e[1],color.e[2],1], [1,1]);  
	} else if(typeof color === 'string') { 
		var explTextureUrl = color.split('/');
		this.name = explTextureUrl[explTextureUrl.length-1];
		
		var req = new XMLHttpRequest();
		req.material = this;
		req.open("GET", color, true);
		req.responseType = "blob";
		
		req.onload = function() {
			var filereader = new FileReader();
			filereader.onload = function(event) {
				var dataUrl = event.target.result;
				
				var image = new Image();
				image.onload = function() {
					stormEngineC.setStatus({id:'texture'+color,
											str:''});
					req.material.writeNow(image, [image.width, image.height]);
				};
				image.src = dataUrl;
			};
			filereader.readAsDataURL(req.response);
		};
		stormEngineC.setStatus({id:'texture'+color,
								str:'Loading texture...'+color,
								req:req});
		req.send(null);
	} else {
		this.writeNow(color, color.length);
	}
};

/**
* Set the corresponding values of 'materialName' from the MTL file
* @type Void
* @param {String} materialName
* @param {String} materialFileUrl .mtl file url
* @param {Object} jsonIn
* 	@param {Object} [jsonIn.albedo=true] Use albedo values
* 	@param {Object} [jsonIn.roughness=true] Use roughness values
*/
StormMaterial.prototype.writeFromMTLFile = function(materialName, mtlsFile, jsonIn) { 
	var albedo = (jsonIn.albedo != undefined) ? jsonIn.albedo : true;
	var roughness = (jsonIn.roughness != undefined) ? jsonIn.roughness : true;
	
	var req = new XMLHttpRequest();
	req.material = this; 
	req.open("GET", mtlsFile, true);
	req.responseType = "blob";
	
	req.onload = function () {
		var filereader = new FileReader();
		filereader.onload = function(event) {
			var text = event.target.result;
			
			stormEngineC.setStatus({id:'material'+mtlsFile,
									str:''});
								
			var stringObjDirectory = '';
			var separat = '';
			var expl = mtlsFile.split("/");
			for(var n = 0, f = expl.length-1; n < f; n++) {
				stringObjDirectory = stringObjDirectory+expl[n]+'/';
			}
			
			var encontradoMaterial;
			var lines = text.split("\r\n");
			for(var n = 0, f = lines.length; n < f; n++) {
				
				var line = lines[n].replace(/\t+/gi,"");
				
				if (line[0] == "#") {
					continue;
				}

				if(encontradoMaterial == true) {
					if(line.match(/^Ns/gi) != null && roughness) { // roughness (.obj exports = 0.0 - 100.0) 
						var array = line.split(" ");
						req.material.Ns = array[1]/112.0; // 100/112.0 -> 0.0-0.8928571428571429
					}
					if(line.match(/^Kd/gi) != null) { // albedo
						var array = line.split(" ");
						req.material.textureObjectKd.inData[0] = array[1];
						req.material.textureObjectKd.inData[1] = array[2];
						req.material.textureObjectKd.inData[2] = array[3];
					}
					if(line.match(/^map_Kd/gi) != null) { // map albedo
						if(albedo) {
							var array = line.split("\\");
							req.material.write(stringObjDirectory+array[array.length-1], 'albedo');
							req.material.textureKdName = array[array.length-1];
						} else {
							req.material.write($V3([Math.random(), Math.random(), Math.random()]), 'albedo');
						}
					}
					if(line.match(/^bump/gi) != null) { // map bump
						var array = line.split("\\");
						req.material.write(stringObjDirectory+array[array.length-1], 'bump');
						req.material.textureBumpName = array[array.length-1];
					}
					if(line.match(/^newmtl /gi) != null) {
						encontradoMaterial = false;
					}
				}
				if(line == "newmtl "+materialName) {
					encontradoMaterial = true;
				}
			}
		}; 
		filereader.readAsText(req.response);
	}; 
	stormEngineC.setStatus({id:'material'+mtlsFile,
							str:'Loading material...'+mtlsFile,
							req:req});
	req.send(null);
};

/**
* Set the illumination of this material. Default = 0.0.
* @type Void
* @param {Float} value
*/
StormMaterial.prototype.setIllumination = function(value) { 
	this.illumination = value;
};
