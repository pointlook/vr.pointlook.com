/**
* @class
* @constructor
*/
StormRender_Timeline = function() {
	this.frames = [];
	this.tempFrames = [];
};

/**
* @type Void
* @private
*/
StormRender_Timeline.prototype.loadPanel = function() {
	var html = '<div id="DIVID_STORMTIMELINE_LIST" style="cursor:pointer"></div>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelTimeline', 'FRAMES', html);	
	
	
	
	var html = '<div id="DIVID_STORMTIMELINE_PREV" style="cursor:pointer"></div>'+
				'<canvas id="pathTracingCanvas"></canvas>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelTimelinePrev', 'FRAMES PREV', html);	
	
	
										
										
	this.ctx2Drender = document.getElementById('pathTracingCanvas').getContext("2d");
};

/**
* @type Void
* @private
*/
StormRender_Timeline.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
};

/**
* @type Void
* @private
*/
StormRender_Timeline.prototype.setFrameTotalColorX = function(frameNumber, arrayTotalColorX, width, height, offset) {
	var length = width*height;

	var newLength = false;
	if(this.frames[frameNumber] != undefined) {
		if((this.frames[frameNumber].width*this.frames[frameNumber].height) != length) {
			newLength = true;
		}
	}
	if(this.frames[frameNumber] == undefined || newLength == true) {
		this.tempFrames[frameNumber] = {'width':width,
									'height':height,
									'arrayTotalColorX':new Float32Array(length),
									'arrayTotalColorY':new Float32Array(length),
									'arrayTotalColorZ':new Float32Array(length),
									'arrayTotalShadow':new Float32Array(length),
									'arraySample':new Uint32Array(length)
									}
		this.frames[frameNumber] = {'width':width,
									'height':height,
									'arrayTotalColorX':new Float32Array(length),
									'arrayTotalColorY':new Float32Array(length),
									'arrayTotalColorZ':new Float32Array(length),
									'arrayTotalShadow':new Float32Array(length),
									'arraySample':new Uint32Array(length)
									}
		for(var n = 0, f = this.tempFrames[frameNumber].arrayTotalColorX.length; n < f; n++) {
			this.tempFrames[frameNumber].arrayTotalColorX[n] = 0;
			this.tempFrames[frameNumber].arrayTotalColorY[n] = 0;
			this.tempFrames[frameNumber].arrayTotalColorZ[n] = 0;
			this.tempFrames[frameNumber].arrayTotalShadow[n] = 0;
			this.tempFrames[frameNumber].arraySample[n] = 0;
		}
		
	}
	var iddOffset = 0;
	var netPacketSize = 64*64;
	for(var n = 0, f = this.tempFrames[frameNumber].arrayTotalColorX.length; n < f; n++) {
		if(offset != undefined) {
			if(n >= offset && iddOffset < netPacketSize) {
				this.tempFrames[frameNumber].arrayTotalColorX[n] += arrayTotalColorX[iddOffset];
				iddOffset++;
			}
		} else {
			this.tempFrames[frameNumber].arrayTotalColorX[n] += arrayTotalColorX[n];
		}
	}
};

/**
* @type Void
* @private
*/
StormRender_Timeline.prototype.setFrameTotalColorY = function(frameNumber, arrayTotalColorY, offset) {
	var iddOffset = 0;
	var netPacketSize = 64*64;
	for(var n = 0, f = this.tempFrames[frameNumber].arrayTotalColorY.length; n < f; n++) {
		if(offset != undefined) {
			if(n >= offset && iddOffset < netPacketSize) {
				this.tempFrames[frameNumber].arrayTotalColorY[n] += arrayTotalColorY[iddOffset];
				iddOffset++;
			}
		} else {
			this.tempFrames[frameNumber].arrayTotalColorY[n] += arrayTotalColorY[n];
		}
	}
};

/**
* @type Void
* @private
*/
StormRender_Timeline.prototype.setFrameTotalColorZ = function(frameNumber, arrayTotalColorZ, offset) {
	var iddOffset = 0;
	var netPacketSize = 64*64;
	for(var n = 0, f = this.tempFrames[frameNumber].arrayTotalColorZ.length; n < f; n++) {
		if(offset != undefined) {
			if(n >= offset && iddOffset < netPacketSize) {
				this.tempFrames[frameNumber].arrayTotalColorZ[n] += arrayTotalColorZ[iddOffset];
				iddOffset++;
			}
		} else {
			this.tempFrames[frameNumber].arrayTotalColorZ[n] += arrayTotalColorZ[n];
		}
	}
};

/**
* @type Void
* @private
*/
StormRender_Timeline.prototype.setFrameTotalShadow = function(frameNumber, arrayTotalShadow, offset) {
	var iddOffset = 0;
	var netPacketSize = 64*64;
	for(var n = 0, f = this.tempFrames[frameNumber].arrayTotalShadow.length; n < f; n++) {
		if(offset != undefined) {
			if(n >= offset && iddOffset < netPacketSize) {
				this.tempFrames[frameNumber].arrayTotalShadow[n] += arrayTotalShadow[iddOffset];
				iddOffset++;
			}
		} else {
			this.tempFrames[frameNumber].arrayTotalShadow[n] += arrayTotalShadow[n];
		}
	}
};

/**
* @type Void
* @private
*/
StormRender_Timeline.prototype.setFrameSample = function(frameNumber, arraySample, hostUnhold) {
	for(var n = 0, f = this.tempFrames[frameNumber].arraySample.length; n < f; n++) {
		this.tempFrames[frameNumber].arraySample[n] += arraySample;
	}
	
	this.frames[frameNumber] = this.tempFrames[frameNumber];
	
	$('#DIVID_STORMTIMELINE_LIST').html('');
	var n = 0;
	for(n=0, f = $('#INPUTID_StormRenderSettings_frameEnd').val(); n <= f; n++) {
		if(this.frames[n] != undefined) {
			$('#DIVID_STORMTIMELINE_LIST').append('<button onclick="stormEngineC.timelinePathTracing.showFramePrev('+n+');">Frame '+n+' - s '+this.frames[n].arraySample[0]+' - '+this.frames[frameNumber].width+'*'+this.frames[frameNumber].height+'</button><br />');
		}
	}
	
	
	if(hostUnhold == true) {
		var nextClientFrame =(this.frames[frameNumber].arraySample[0] > $('#INPUTID_StormRenderSettings_maxSamples').val()) ? 1 : 0;
		wsPathTracing.emit('hostUnhold', {
			nextFrame: nextClientFrame //unused
		});
	}
};





/**
* @type Void
* @private
*/
StormRender_Timeline.prototype.showFramePrev = function(frameNumber) {
	this.canvasData = this.ctx2Drender.getImageData(0, 0, this.frames[frameNumber].width, this.frames[frameNumber].height);
	
	for(var row = 0, frow = this.frames[frameNumber].height; row < frow; row++) {
		for(var col = 0, fcol = this.frames[frameNumber].width; col < fcol; col++) {
			var idx = ((row * this.frames[frameNumber].width) + col);
			var idxData = idx*4;
			this.canvasData.data[idxData+0] = (this.frames[frameNumber].arrayTotalColorX[idx]/this.frames[frameNumber].arraySample[idx])*(this.frames[frameNumber].arrayTotalShadow[idx]/this.frames[frameNumber].arraySample[idx])*255;
			this.canvasData.data[idxData+1] = (this.frames[frameNumber].arrayTotalColorY[idx]/this.frames[frameNumber].arraySample[idx])*(this.frames[frameNumber].arrayTotalShadow[idx]/this.frames[frameNumber].arraySample[idx])*255;
			this.canvasData.data[idxData+2] = (this.frames[frameNumber].arrayTotalColorZ[idx]/this.frames[frameNumber].arraySample[idx])*(this.frames[frameNumber].arrayTotalShadow[idx]/this.frames[frameNumber].arraySample[idx])*255;
			this.canvasData.data[idxData+3] = 255;
		}
	}
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
	$('#pathTracingCanvas').attr('width', this.frames[frameNumber].width);
	$('#pathTracingCanvas').attr('height', this.frames[frameNumber].height);
	
	
	
	this.ctx2Drender.putImageData(this.canvasData, 0, 0);
		
	/*var canvasImg = stormEngineC.utils.getImageFromCanvas(stormEngineC.timelinePathTracing.frames[frameNumber]);
	canvasImg.style.width = '16px';
	canvasImg.style.height = '16px';
	$('#DIVID_STORMTIMELINE_PREV').append(canvasImg);*/
};

/**
* @type Void
* @private
*/
StormRender_Timeline.prototype.getFrame = function(frameNumber) {
	return {'arrayTotalColorX':this.frames[frameNumber].arrayTotalColorX,
			'arrayTotalColorY':this.frames[frameNumber].arrayTotalColorY,
			'arrayTotalColorZ':this.frames[frameNumber].arrayTotalColorZ,
			'arrayTotalShadow':this.frames[frameNumber].arrayTotalShadow,
			'arraySample':this.frames[frameNumber].arraySample
			};
};

