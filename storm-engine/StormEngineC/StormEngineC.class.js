/*
The MIT License (MIT)

Copyright (c) <2010> <Roberto Gonzalez. http://stormcolour.appspot.com/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
var e = document.createElement('canvas');
e.width = 32;
e.height = 32;

var webglExist = undefined;
try {
	webglExist = e.getContext("webgl");
} catch (x) {}
if(webglExist == undefined) {
	try {
		webglExist = e.getContext("experimental-webgl");
	} catch (x) {
		webglExist = undefined;
	}
}
if(webglExist != undefined) {

// includes
var stormEngineCDirectory = document.querySelector('script[src$="StormEngineC.class.js"]').getAttribute('src');
var page = stormEngineCDirectory.split('/').pop(); 
stormEngineCDirectory = stormEngineCDirectory.replace('/'+page,"");

// CSS
if(window.jQuery == undefined) {
	document.write('<link rel="stylesheet" type="text/css" href="'+stormEngineCDirectory+'/JQuery/ui/jquery-ui-1.10.3.custom.min.css" />');
}
document.write('<link rel="stylesheet" type="text/css" href="'+stormEngineCDirectory+'/colorPicker/css/colorpicker.css" />');
document.write('<link rel="stylesheet" type="text/css" href="'+stormEngineCDirectory+'/css/style.css" />');
document.write('<link rel="stylesheet" type="text/css" href="'+stormEngineCDirectory+'/stormPanel/stormPanel.css" />');
document.write('<link rel="stylesheet" type="text/css" href="'+stormEngineCDirectory+'/stormMenu/stormMenu.css" />');

// JS
if(window.jQuery == undefined) {
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JQuery/jquery-1.9.1.js"></script>');	
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JQuery/ui/jquery-ui-1.10.3.custom.min.js"></script>');
}
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/colorPicker/colorpicker.js"></script>');


var includesF = [//'/StormMathMin.class.js', 
				 '/StormMath.class.js',
				'/StormMaterial.class.js',
				'/StormGLContext.class.js',
				'/StormGLContext_programBackground.class.js',
				'/StormGLContext_programCtx2D.class.js',
				'/StormGLContext_programDOF.class.js',
				'/StormGLContext_programGIv2.class.js',
				'/StormGLContext_programLines.class.js',
				'/StormGLContext_programNormalsDepth.class.js',
				'/StormGLContext_programParticles.class.js',
				'/StormGLContext_programPick.class.js',
				'/StormGLContext_programOverlay.class.js',
				'/StormGLContext_programScene.class.js',
				'/StormGLContext_programShadows.class.js',
				/*'/WebCLGL_2.0.Min.class.js',*/
				'/WebCLGLUtils.class.js',
				'/WebCLGLBuffer.class.js',
				'/WebCLGLKernel.class.js',
				'/WebCLGL.class.js',  
				'/StormNode.class.js',
				'/StormGroupNodes.class.js',
				'/StormMesh.class.js',
				'/StormBufferObject.class.js',
				'/StormLine.class.js',
				'/StormCamera.class.js',
				'/StormLight.class.js',
				'/StormParticles.class.js',
				'/StormPolarityPoint.class.js',
				'/StormForceField.class.js',
				'/StormTriangulate2D.class.js',
				'/StormRayLens.class.js',
				'/StormTriangleBox.class.js',
				'/StormVoxelizator.class.js',
				'/StormGI.class.js',
				'/StormRayTriangle.class.js',
				'/StormLineSceneCollision.class.js',
				'/stormPanel/stormPanel.js',
				'/stormMenu/stormMenu.js',
				'/StormPanelEnvironment.class.js',
				'/StormPanelListObjects.class.js',
				'/StormPanelEditNode.class.js',
				'/StormPanelMaterials.class.js',
				'/StormPanelRenderSettings.class.js',
				'/StormPanelCanvas.class.js',
				'/StormPanelAnimationTimeline.class.js',
				'/StormRenderCLv4_Timeline.class.js',
				'/StormRenderCL_EMR_MaterialEditor.class.js',
				'/StormPanelEMRMaterialsDatabase.class.js',
				'/JigLibJS/geom/glMatrix.js',
				'/JigLibJS/jiglib.js',
				'/JigLibJS/geom/Vector3D.js',
				'/JigLibJS/geom/Matrix3D.js',
				'/JigLibJS/math/JMatrix3D.js',
				'/JigLibJS/math/JMath3D.js',
				'/JigLibJS/math/JNumber3D.js',
				'/JigLibJS/cof/JConfig.js',
				'/JigLibJS/data/CollOutData.js',
				'/JigLibJS/data/ContactData.js',
				'/JigLibJS/data/PlaneData.js',
				'/JigLibJS/data/EdgeData.js',
				'/JigLibJS/data/TerrainData.js',
				'/JigLibJS/data/OctreeCell.js',
				'/JigLibJS/data/CollOutBodyData.js',
				'/JigLibJS/data/TriangleVertexIndices.js',
				'/JigLibJS/data/SpanData.js',
				'/JigLibJS/physics/constraint/JConstraint.js',
				'/JigLibJS/physics/constraint/JConstraintMaxDistance.js',
				'/JigLibJS/physics/constraint/JConstraintWorldPoint.js',
				'/JigLibJS/physics/constraint/JConstraintPoint.js',
				'/JigLibJS/physics/MaterialProperties.js',
				'/JigLibJS/collision/CollPointInfo.js',
				'/JigLibJS/collision/CollisionInfo.js',
				'/JigLibJS/collision/CollDetectInfo.js',
				'/JigLibJS/collision/CollDetectFunctor.js',
				'/JigLibJS/collision/CollDetectBoxTerrain.js',
				'/JigLibJS/collision/CollDetectSphereMesh.js',
				'/JigLibJS/collision/CollDetectCapsuleBox.js',
				'/JigLibJS/collision/CollDetectSphereCapsule.js',
				'/JigLibJS/collision/CollDetectCapsuleTerrain.js',
				'/JigLibJS/collision/CollDetectSphereBox.js',
				'/JigLibJS/collision/CollDetectSphereTerrain.js',
				'/JigLibJS/collision/CollDetectBoxBox.js',
				'/JigLibJS/collision/CollDetectBoxMesh.js',
				'/JigLibJS/collision/CollDetectBoxPlane.js',
				'/JigLibJS/collision/CollDetectCapsuleCapsule.js',
				'/JigLibJS/collision/CollDetectSphereSphere.js',
				'/JigLibJS/collision/CollDetectSpherePlane.js',
				'/JigLibJS/collision/CollDetectCapsulePlane.js',
				'/JigLibJS/collision/CollisionSystemAbstract.js',
				'/JigLibJS/collision/CollisionSystemGridEntry.js',
				'/JigLibJS/collision/CollisionSystemGrid.js',
				'/JigLibJS/collision/CollisionSystemBrute.js',
				'/JigLibJS/geometry/JIndexedTriangle.js',
				'/JigLibJS/geometry/JOctree.js',
				'/JigLibJS/geometry/JRay.js',
				'/JigLibJS/geometry/JAABox.js',
				'/JigLibJS/geometry/JTriangle.js',
				'/JigLibJS/geometry/JSegment.js',
				'/JigLibJS/events/JCollisionEvent.js',
				'/JigLibJS/physics/constraint/JConstraint.js',
				'/JigLibJS/physics/constraint/JConstraintMaxDistance.js',
				'/JigLibJS/physics/constraint/JConstraintWorldPoint.js',
				'/JigLibJS/physics/constraint/JConstraintPoint.js',
				'/JigLibJS/physics/PhysicsController.js',
				'/JigLibJS/physics/CachedImpulse.js',
				'/JigLibJS/physics/HingeJoint.js',
				'/JigLibJS/physics/BodyPair.js',
				'/JigLibJS/physics/PhysicsState.js',
				'/JigLibJS/physics/PhysicsSystem.js',
				'/JigLibJS/physics/RigidBody.js',
				'/JigLibJS/geometry/JSphere.js',
				'/JigLibJS/geometry/JTriangleMesh.js',
				'/JigLibJS/geometry/JPlane.js',
				'/JigLibJS/geometry/JTerrain.js',
				'/JigLibJS/geometry/JBox.js',
				'/JigLibJS/geometry/JCapsule.js',
				'/JigLibJS/debug/Stats.js',
				'/JigLibJS/vehicles/JChassis.js',
				'/JigLibJS/vehicles/JWheel.js',
				'/JigLibJS/vehicles/JCar.js',
				'/StormJigLibJS.class.js',
				'/StormUtils.class.js',
				'/StormControllerFreeCam.class.js',
				'/StormControllerTargetCam.class.js',
				'/StormControllerPlayerCar.class.js',
				'/StormControllerPlayer.class.js',
				'/StormControllerFollow.class.js',
				'/nodeClient/socket.io.min.js'];
for(var n = 0, f = includesF.length; n < f; n++) document.write('<script type="text/javascript" src="'+stormEngineCDirectory+includesF[n]+'"></script>');

if(window.WebCL == undefined) {
	//document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormRender.class.js"></script>'); // raytracing cpu
} else {
	var clPlatforms = WebCL.getPlatformIDs();
	//CL_DEVICE_TYPE_GPU - CL_DEVICE_TYPE_CPU - CL_DEVICE_TYPE_DEFAULT - CL_DEVICE_TYPE_ACCELERATOR - CL_DEVICE_TYPE_ALL
    var clContext = WebCL.createContextFromType([WebCL.CL_CONTEXT_PLATFORM, clPlatforms[0]], WebCL.CL_DEVICE_TYPE_GPU); 
    var clDevices = clContext.getContextInfo(WebCL.CL_CONTEXT_DEVICES);
    var clCmdQueue = clContext.createCommandQueue(clDevices[0], 0); // CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE - CL_QUEUE_PROFILING_ENABLE
    //var utils = WebCL.getUtils();
    
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormRenderCLv4.class.js"></script>'); // path tracing
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormRenderCL_EMR.class.js"></script>'); // Electromagnetic radiation
}
/** @private */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback){
				window.setTimeout(callback, 1000 / 60);
			};
})();
 
/**
* Engine contructor
* @class
* @constructor
* @property {HTMLCanvasElement} target
* @property {JqueryDivElement} $
* @property {Int} mousePosX x mouse position on the canvas
* @property {Int} mousePosY y mouse position on the canvas
* @property {StormGLContext} stormGLContext object
* @property {WebCLGL} clgl WebCLGL object
* @property {StormUtils} utils StormUtils object
* @property {StormMesh} stormMesh StormMesh object
*/
StormEngineC = function() {
	this.target;
	this.divPositionX = 0;
	this.divPositionY = 0;
	this.mousePosX = 0;
	this.mousePosY = 0;
	this.mouseOldPosX = 0;
	this.mouseOldPosY = 0;
	this.oldMousePosClickX = 0;
	this.oldMousePosClickY = 0; 
	this.isMouseDown = false;
	this.draggingNodeNow = false;
	
	this.stormGLContext,this.clgl,this.utils,this.stormMesh;
	this.giv2;
	this.callback;
	this.nodes = [];this.idxNodes = 0;
	this.groups = [];this.idxGroups = 0;
	this.nodesCam = [];this.idxNodesCam = 0;
	this.lines = [];this.idxLines = 0;
	this.lights = [];this.idxLights = 0;
	this.particles = [];this.idxParticles = 0;
	this.particlesOffset = 300.0;
	this.polarityPoints = [];this.idxPolarityPoint = 0;
	this.forceFields = [];this.idxForceField = 0;
	this.materials = [];this.idxMaterials = 0;
	this.voxelizators = [];this.idxVoxelizators = 0;
	this.arrHitsRectRegions = [];this.idxHitsRectRegions = 0;
	this.arrFonts = [];
	
	this.defaultCamera;
	
	this.nearNode; // selectedNode
	this.nearDistance = 1000000000.0;
	this.nearNormal;
	
	this.pickingCall;
	
	this.selectedMaterial;
	
	this.pause = false;
	this.pauseRender = true;
	
	this.preloads = 0;
	
	this.debugValues = [];
	this.debugResult;
	this.statusValues = [];
	
	this.runningAnim = false;
	
	this.lastTime = 0;
	this.elapsed;
	
	this.arrNetUsers = [];
	this.netID;
	this.netNode;
};

/**
* Init WebGL Context
* @type Void
* @param	{Object} jsonIn
* 	@param {HTMLCanvasElement|String} jsonIn.target Name of the atribute ID of the canvas or one element HTMLCanvasElement.
* 	@param {Function} jsonIn.callback Function fired at every frame
* 	@param {Bool} [jsonIn.editMode=true] Edit mode
* 	@param {Int} [jsonIn.resizable=2] 0:No resizable, 1:resizable(maintain the aspect ratio), 2:resizable, 3:screen autoadjust(maintain the aspect ratio)
* 	@param {Bool} [jsonIn.enableRender=true] Enable render
*/
StormEngineC.prototype.createWebGL = function(jsonIn) {
	if(jsonIn != undefined && jsonIn.target != undefined) {
		this.target = (jsonIn.target instanceof HTMLCanvasElement) ? jsonIn.target : DGE(jsonIn.target);
		var e = DCE('div');
		e.id = "SEC_"+this.target.id;
		this.target.parentNode.insertBefore(e,this.target);
		this.target.parentNode.removeChild(this.target);
		e.appendChild(this.target);  
		this.$ = $('#'+this.target.id);
		
		this.editMode = (jsonIn != undefined && jsonIn.editMode != undefined) ? jsonIn.editMode : true;
		this.resizable = (jsonIn != undefined && jsonIn.resizable != undefined) ? jsonIn.resizable : 2; 
		this.enableRender = (jsonIn != undefined && jsonIn.enableRender != undefined) ? jsonIn.enableRender : true;
		
		if(jsonIn.callback != undefined) {this.callback = jsonIn.callback;}
		
		this.loadManager();
		this.next();
	} else {
		alert('Target canvas required');
	}
};

/** @private */
StormEngineC.prototype.loadManager = function() {
	this.stormGLContext = new StormGLContext(this.target);
		
	// INIT SHADERS
	if(!this.stormGLContext._typeMobile && this.stormGLContext._supportFormat == this.stormGLContext.gl.FLOAT) console.log('PC');
	else console.log('MOBILE');
	
	if(!this.stormGLContext._typeMobile && this.stormGLContext._supportFormat == this.stormGLContext.gl.FLOAT) {
		this.stormGLContext.addToStackShaders('CTX2D', this.stormGLContext.initShader_Ctx2D);
		this.update2DContext();
	}
	
	this.stormGLContext.addToStackShaders('NORMALS', this.stormGLContext.initShader_Normals);
	if(this.stormGLContext._supportFormat == this.stormGLContext.gl.FLOAT) { 
		this.stormGLContext.addToStackShaders('LIGHT DEPTH', this.stormGLContext.initShader_LightDepth);
		this.stormGLContext.addToStackShaders('LIGHT DEPTH PARTICLES', this.stormGLContext.initShader_LightDepthParticles);
			this.stormGLContext.addToStackShaders('SHADOWS', this.stormGLContext.initShader_Shadows);
	}
	
	if(!this.stormGLContext._typeMobile && this.stormGLContext._supportFormat == this.stormGLContext.gl.FLOAT)
		this.stormGLContext.addToStackShaders('BG', this.stormGLContext.initShader_BG); 
	this.stormGLContext.addToStackShaders('SCENE', this.stormGLContext.initShader_Scene);
	
	if(!this.stormGLContext._typeMobile && this.stormGLContext._supportFormat == this.stormGLContext.gl.FLOAT) {
		this.stormGLContext.addToStackShaders('PARTICLE AUX', this.stormGLContext.initShader_ParticlesAux);
		this.stormGLContext.addToStackShaders('LINES', this.stormGLContext.initShader_Lines);
		this.stormGLContext.addToStackShaders('DOF', this.stormGLContext.initShader_DOF);
	} 
	
	this.stormGLContext.addToStackShaders('PICK', this.stormGLContext.initShader_Pick);
	if(!this.stormGLContext._typeMobile && this.stormGLContext._supportFormat == this.stormGLContext.gl.FLOAT)
		this.stormGLContext.addToStackShaders('OVERLAY', this.stormGLContext.initShader_Overlay);  

	
	
	
	this.clgl = new WebCLGL(this.stormGLContext.gl);
	this.utils = new StormUtils();
	this.stormMesh = new StormMesh();
	this.giv2 = new StormGI();
	
	// OVERLAY TRANSFORMS  
	this.defaultTransform = 0; // 0=position, 1=rotation, 2=scale
	this.defaultTransformMode = 0; // 0=world, 1=local
	// ►pos detector and display
	this.stormGLContext.nodeOverlayPosX = new StormNode();
	this.stormGLContext.nodeOverlayPosX.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayPosX.setRotationZ(stormEngineC.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayPosY = new StormNode();
	this.stormGLContext.nodeOverlayPosY.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayPosY.setRotationZ(stormEngineC.utils.degToRad(180));
	
	this.stormGLContext.nodeOverlayPosZ = new StormNode();
	this.stormGLContext.nodeOverlayPosZ.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayPosZ.setRotationX(stormEngineC.utils.degToRad(-90));
	
	// ►rot detector
	this.stormGLContext.nodeOverlayRotDetX = new StormNode();
	this.stormGLContext.nodeOverlayRotDetX.loadTube({height: 0.1, outerRadius: 1.0, innerRadius: 0.9, segments: 14}); 
	this.stormGLContext.nodeOverlayRotDetX.setRotationZ(stormEngineC.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayRotDetY = new StormNode();
	this.stormGLContext.nodeOverlayRotDetY.loadTube({height: 0.1, outerRadius: 1.0, innerRadius: 0.9, segments: 14}); 
	//this.stormGLContext.nodeOverlayRotDetY.setRotationZ(stormEngineC.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayRotDetZ = new StormNode();
	this.stormGLContext.nodeOverlayRotDetZ.loadTube({height: 0.1, outerRadius: 1.0, innerRadius: 0.9, segments: 14}); 
	this.stormGLContext.nodeOverlayRotDetZ.setRotationX(stormEngineC.utils.degToRad(-90));
	// ►rot display
	this.stormGLContext.nodeOverlayRotX = new StormNode();
	this.stormGLContext.nodeOverlayRotX.loadTube({height: 0.01, outerRadius: 1.0, innerRadius: 0.99, segments: 14}); 
	this.stormGLContext.nodeOverlayRotX.setRotationZ(stormEngineC.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayRotY = new StormNode();
	this.stormGLContext.nodeOverlayRotY.loadTube({height: 0.01, outerRadius: 1.0, innerRadius: 0.99, segments: 14}); 
	//this.stormGLContext.nodeOverlayRotY.setRotationZ(stormEngineC.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayRotZ = new StormNode();
	this.stormGLContext.nodeOverlayRotZ.loadTube({height: 0.01, outerRadius: 1.0, innerRadius: 0.99, segments: 14}); 
	this.stormGLContext.nodeOverlayRotZ.setRotationX(stormEngineC.utils.degToRad(-90));
	
	// ►scale detector
	this.stormGLContext.nodeOverlayScaDetX = new StormNode();
	this.stormGLContext.nodeOverlayScaDetX.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayScaDetX.setRotationZ(stormEngineC.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayScaDetY = new StormNode();
	this.stormGLContext.nodeOverlayScaDetY.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayScaDetY.setRotationZ(stormEngineC.utils.degToRad(180));
	
	this.stormGLContext.nodeOverlayScaDetZ = new StormNode();
	this.stormGLContext.nodeOverlayScaDetZ.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayScaDetZ.setRotationX(stormEngineC.utils.degToRad(-90));
	
	// ►scale display
	this.stormGLContext.nodeOverlayScaX = new StormNode();
	this.stormGLContext.nodeOverlayScaX.loadBox($V3([0.1,0.1,0.1]));
	this.stormGLContext.nodeOverlayScaX.setRotationZ(stormEngineC.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayScaY = new StormNode();
	this.stormGLContext.nodeOverlayScaY.loadBox($V3([0.1,0.1,0.1]));
	this.stormGLContext.nodeOverlayScaY.setRotationZ(stormEngineC.utils.degToRad(180));
	
	this.stormGLContext.nodeOverlayScaZ = new StormNode();
	this.stormGLContext.nodeOverlayScaZ.loadBox($V3([0.1,0.1,0.1]));
	this.stormGLContext.nodeOverlayScaZ.setRotationX(stormEngineC.utils.degToRad(-90));
	
	// DEFAULT CAMERA AND SUN LIGHT
	var nodeCam = this.createCamera($V3([0.0, 0.0, 0.0]));
	this.setWebGLCam(nodeCam); 
	this.cameraGoalCurrentPos = this.defaultCamera.nodeGoal.getPosition();
	
	var light = this.createLight({	'type':'sun', // first light must be sun light
							'direction':$V3([-0.12,-0.5,0.20]),
							'color':5770
							});
	light.visibleOnContext = false;
	light.visibleOnRender = false;
	light.nodeCtxWebGL.visibleOnContext = false;
	
	// PHYSICS
	this.stormJigLibJS = new StormJigLibJS();
	this.stormJigLibJS.createJigLibWorld();
	
	
	// PANELS
	this.PanelEnvironment = new StormEngineC_PanelEnvironment();
	this.PanelEnvironment.loadPanel();
	this.PanelListObjects = new StormEngineC_PanelListObjects();
	this.PanelListObjects.loadPanel();
	this.PanelEditNode = new StormEngineC_PanelEditNode();
	this.PanelEditNode.loadPanel();
	this.PanelMaterials = new StormEngineC_PanelMaterials();
	this.PanelMaterials.loadPanel();
	this.PanelCanvas = new StormEngineC_PanelCanvas();
	this.PanelCanvas.loadPanel();
	this.PanelRenderSettings = new StormEngineC_PanelRenderSettings();
	this.PanelRenderSettings.loadPanel();
	this.PanelAnimationTimeline = new StormEngineC_PanelAnimationTimeline();
	this.PanelAnimationTimeline.loadPanel();  
	//if(window.WebCL != undefined) {
		this.timelinePathTracing = new StormRender_Timeline();
		this.timelinePathTracing.loadPanel();
		
		this.EMR_Materials = [];this.idxEMR_Materials = 0;
		this.selectedEMRMaterial = undefined;
		this.MaterialEditor = new StormRenderEMR_MaterialEditor();
		this.MaterialEditor.loadMaterialEditor();
		this.PanelEMRMaterialsDatabase = new StormEngineC_PanelEMRMaterialsDatabase();
		this.PanelEMRMaterialsDatabase.loadPanel();
	//}
	
	if(this.editMode) {
		var strBtns = ''+
		"<div id='TABLEID_STORMMENU' style='display:table;background-color:#262626;font-size:11px;color:#FFF;'>"+
			"<div style='display:table-cell'>"+ 
				"<div style='padding:2px'>LOCAL<input type='checkbox' id='CHECKID_STOMTOOLBAR_LOCAL' /></div>"+
			"</div>"+
			"<div style='display:table-cell'>"+
				"<div id='STORMMENU0' data-menucontent>"+  
					"<div><a id='STORMMENUBTN_C0_01'>Import Wavefront (.obj)..</a> <input id='INPUTID_StormFileImport' type='file' style='display:none;'/></div>"+
					"<div><a id='STORMMENUBTN_C0_02'>Import Collada (.DAE)..</a> <input id='INPUTID_StormFileImportCollada' type='file' style='display:none;'/></div>"+
				"</div>"+
				"<div>File</div>"+
			"</div>"+
			"<div style='display:table-cell'>"+
				"<div id='STORMMENU1' data-menucontent>"+
					"<div><a id='STORMMENUBTN_C1_01'>List Objects..</a></div>"+
					"<div><a id='STORMMENUBTN_C1_02'>Edit object..</a></div>"+
					"<div><a id='STORMMENUBTN_C1_03'>Environment..</a></div>"+
				"</div>"+
				"<div>Edit</div>"+
			"</div>"+
			"<div style='display:table-cell'>"+
				"<div id='STORMMENU2' data-menucontent>"+
					"<div data-menucontent>"+
						"<div><a id='STORMMENUBTN_C2_01_PE'>PERSPECTIVE</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_OR'>ORTHOGRAPHIC</a></div>"+
						"<div><div style='height:2px;background-color:#FFF;'></div></div>"+
						"<div><a id='STORMMENUBTN_C2_01_LEFT'>LEFT</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_RIGHT'>RIGHT</a></div>"+ 
						"<div><a id='STORMMENUBTN_C2_01_FRONT'>FRONT</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_BACK'>BACK</a></div>"+ 
						"<div><a id='STORMMENUBTN_C2_01_TOP'>TOP</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_BOTTOM'>BOTTOM</a></div>"+  
						"<div><div style='height:2px;background-color:#FFF;'></div></div>"+
						"<div><a id='STORMMENUBTN_C2_01_01'>TRIANGLES</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_02'>TRIANGLE_FAN</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_03'>TRIANGLE_STRIP</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_04'>LINES</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_05'>LINE_LOOP</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_06'>LINE_STRIP</a></div>"+
						"<div><a id='STORMMENUBTN_C2_01_07'>POINTS</a></div>"+
					"</div>"+
					"<div><a id='STORMMENU_C2_01'>View</a></div>"+
					"<div><a id='STORMMENUBTN_C2_02'>Pause viewport</a></div>"+
					"<div><a id='STORMMENUBTN_C2_03'>Timeline</a></div>"+
				"</div>"+
				"<div>View</div>"+
			"</div>"+
			"<div style='display:table-cell'>"+
				"<div id='STORMMENU3' data-menucontent>"+
					"<div><a id='STORMMENUBTN_C3_01'>Spot light</a></div>"+
					"<div><a id='STORMMENUBTN_C3_02'>Sun light</a></div>"+
					"<div><a id='STORMMENUBTN_C3_03'>Camera</a></div>"+
					"<div><a id='STORMMENUBTN_C3_04'>Line</a></div>"+
					"<div><a id='STORMMENUBTN_C3_05'>Particles</a></div>"+
					"<div><a id='STORMMENUBTN_C3_06'>Polarity point</a></div>"+
					"<div><a id='STORMMENUBTN_C3_07'>Force field</a></div>"+
					"<div><a id='STORMMENUBTN_C3_08'>Gravity force</a></div>"+
					"<div><a id='STORMMENUBTN_C3_09'>Voxelizator</a></div>"+
				"</div>"+
				"<div>Create</div>"+
			"</div>"+
			"<div style='display:table-cell'>"+
				"<div id='STORMMENU4' data-menucontent>"+
					"<div><a id='STORMMENUBTN_C4_01'>EMR Spectrum Editor..</a></div>"+
					"<div><a id='STORMMENUBTN_C4_02'>Material Editor..</a></div>"+
				"</div>"+
				"<div>Materials</div>"+
			"</div>"+
			"<div style='display:table-cell'>"+
				"<div id='STORMMENU5' data-menucontent>"+
					"<div><a id='STORMMENUBTN_C5_01'>Render settings..</a></div>"+
				"</div>"+
				"<div>Render</div>"+
			"</div>"+
		"</div>"+
		"<div id='STORMMENU_MOUSE'>"+
			"<div><a id='BTNID_STOMTOOLBAR_MOVE'>MOVE</a></div>"+
			"<div><a id='BTNID_STOMTOOLBAR_ROTATE'>ROTATE</a></div>"+
			"<div><a id='BTNID_STOMTOOLBAR_SCALE'>SCALE</a></div>"+
		"</div>";
		var e = DCE('div');
		e.innerHTML = strBtns;
		this.target.parentNode.appendChild(e);
		
		if(this.enableRender == false) {
			$('#STORMMENU5').hide();
			$('#STORMMENUBTN_C4_01').hide();
		} 
		
		
		// MOUSE MENU
		DGE('STORMMENU_MOUSE').addEventListener("contextmenu", function(e){
			e.preventDefault();
		}, false);
		DGE('STORMMENU_MOUSE').classList.add("SECmenuMouse");
		DGE('STORMMENU_MOUSE').addEventListener('mouseout', function(e) {
			var obj = e.relatedTarget;//prevent if over childs
			while(obj != undefined) {
				if(obj == this) return;
				obj=obj.parentNode;
			}
		
			this.style.display = "none";
		}, true);	
		
		DGE("BTNID_STOMTOOLBAR_MOVE").addEventListener("click", function(e) {
			stormEngineC.defaultTransform = 0; // 0=position, 1=rotation, 2=scale
			var event = new CustomEvent("mouseout");
			DGE('STORMMENU_MOUSE').dispatchEvent(event);
		}, false);
		
		DGE("BTNID_STOMTOOLBAR_ROTATE").addEventListener("click", function(e) {
			stormEngineC.defaultTransform = 1; // 0=position, 1=rotation, 2=scale
			var event = new CustomEvent("mouseout");
			DGE('STORMMENU_MOUSE').dispatchEvent(event);
		}, false);
		
		DGE("BTNID_STOMTOOLBAR_SCALE").addEventListener("click", function(e) {
			stormEngineC.defaultTransform = 2; // 0=position, 1=rotation, 2=scale
			var event = new CustomEvent("mouseout");
			DGE('STORMMENU_MOUSE').dispatchEvent(event);
		}, false); 
		
		
		// BOTTOM MENU
		// local checkbox
		DGE("CHECKID_STOMTOOLBAR_LOCAL").addEventListener("click", function(e) {
			stormEngineC.defaultTransformMode = (stormEngineC.defaultTransformMode == 0) ? 1 : 0; // 0=world, 1=local
		}, false);
		
		// menus
		var menuObjs = [];
		var menu = new StormMenu({	content: DGE('STORMMENU0'),
									mouseover: function() {
													for(var nb = 0;nb < menuObjs.length;nb++)
														if(this != menuObjs[nb]) menuObjs[nb].close();
												}});  
		menuObjs.push(menu);
		var menu = new StormMenu({	content: DGE('STORMMENU1'),
									mouseover: function() {
													for(var nb = 0;nb < menuObjs.length;nb++)
														if(this != menuObjs[nb]) menuObjs[nb].close();
												}});
		menuObjs.push(menu);
		var menu = new StormMenu({	content: DGE('STORMMENU2'),
									mouseover: function() {
													for(var nb = 0;nb < menuObjs.length;nb++)
														if(this != menuObjs[nb]) menuObjs[nb].close();
												}}); 
		menuObjs.push(menu);
		var menu = new StormMenu({	content: DGE('STORMMENU3'),
									mouseover: function() {
													for(var nb = 0;nb < menuObjs.length;nb++)
														if(this != menuObjs[nb]) menuObjs[nb].close();
												}});
		menuObjs.push(menu);
		var menu = new StormMenu({	content: DGE('STORMMENU4'),
									mouseover: function() {
													for(var nb = 0;nb < menuObjs.length;nb++)
														if(this != menuObjs[nb]) menuObjs[nb].close();
												}});
		menuObjs.push(menu);		
		var menu = new StormMenu({	content: DGE('STORMMENU5'),
									mouseover: function() {
													for(var nb = 0;nb < menuObjs.length;nb++)
														if(this != menuObjs[nb]) menuObjs[nb].close();
												}});
		menuObjs.push(menu);
		
		
		
	
	
		// SUBBTN ACTIONS
		$("#STORMMENUBTN_C0_01").on('click', function() {
			$('#INPUTID_StormFileImport').click();
			$('#INPUTID_StormFileImport').on('change', function() {
				var filereader = new FileReader();
				filereader.onload = function(event) {
					var nodeF = stormEngineC.createNode();
					stormEngineC.stormMesh.loadObjFromSourceText(nodeF, event.target.result);
				};
				filereader.readAsText(this.files[0]);
			});
		});
		$("#STORMMENUBTN_C0_02").on('click', function() {
			$('#INPUTID_StormFileImportCollada').click();
			$('#INPUTID_StormFileImportCollada').on('change', function() {
				var filereader = new FileReader();
				filereader.onload = function(event) {
					var nodeF = stormEngineC.createNode();
					stormEngineC.stormMesh.loadColladaFromSourceText(nodeF, event.target.result);
				};
				filereader.readAsText(this.files[0]);
			});
		});
		$("#STORMMENUBTN_C1_01").on('click', function() {
			stormEngineC.PanelListObjects.show();
		});
		$("#STORMMENUBTN_C1_02").on('click', function() {
			stormEngineC.PanelEditNode.show();
		});
		$("#STORMMENUBTN_C1_03").on('click', function() {
			stormEngineC.PanelEnvironment.show();
		});
		$("#STORMMENUBTN_C2_01_PE").on('click', function() {stormEngineC.defaultCamera.setProjectionType("p");}); 
		$("#STORMMENUBTN_C2_01_OR").on('click', function() {stormEngineC.defaultCamera.setProjectionType("o");});
		$("#STORMMENUBTN_C2_01_LEFT").on('click', function() {stormEngineC.defaultCamera.setView("LEFT");});
		$("#STORMMENUBTN_C2_01_RIGHT").on('click', function() {stormEngineC.defaultCamera.setView("RIGHT");}); 
		$("#STORMMENUBTN_C2_01_FRONT").on('click', function() {stormEngineC.defaultCamera.setView("FRONT");});
		$("#STORMMENUBTN_C2_01_BACK").on('click', function() {stormEngineC.defaultCamera.setView("BACK");}); 
		$("#STORMMENUBTN_C2_01_TOP").on('click', function() {stormEngineC.defaultCamera.setView("TOP");});
		$("#STORMMENUBTN_C2_01_BOTTOM").on('click', function() {stormEngineC.defaultCamera.setView("BOTTOM");});  
		$("#STORMMENUBTN_C2_01_01").on('click', function() {stormEngineC.stormGLContext.drawElementsMode(4);}); // TRIANGLES
		$("#STORMMENUBTN_C2_01_02").on('click', function() {stormEngineC.stormGLContext.drawElementsMode(6);}); // TRIANGLE_FAN
		$("#STORMMENUBTN_C2_01_03").on('click', function() {stormEngineC.stormGLContext.drawElementsMode(5);}); // TRIANGLE_STRIP
		$("#STORMMENUBTN_C2_01_04").on('click', function() {stormEngineC.stormGLContext.drawElementsMode(1);}); // LINES
		$("#STORMMENUBTN_C2_01_05").on('click', function() {stormEngineC.stormGLContext.drawElementsMode(2);}); // LINE_LOOP
		$("#STORMMENUBTN_C2_01_06").on('click', function() {stormEngineC.stormGLContext.drawElementsMode(3);}); // LINE_STRIP
		$("#STORMMENUBTN_C2_01_07").on('click', function() {stormEngineC.stormGLContext.drawElementsMode(0);}); // POINTS
		$("#STORMMENUBTN_C2_02").on('click', function() {
			stormEngineC.setWebGLpause();
		});	
		$("#STORMMENUBTN_C2_03").on('click', function() {
			stormEngineC.PanelAnimationTimeline.show();
		});	
		$("#STORMMENUBTN_C3_01").on('click', function() {
			var node = stormEngineC.createLight({	'type':'spot', // TYPE SPOT (MAX 10)
													'position':$V3([0.0,2.5,0.0]),
													'direction':$V3([0.01,-1.0,0.01]), //on render spot is omni
													'color':3200 // V3 color or int kelvins(1000K-15000K http://en.wikipedia.org/wiki/Color_temperature)
			});
			stormEngineC.selectNode(node);
		});
		$("#STORMMENUBTN_C3_02").on('click', function() {
			var node = stormEngineC.createLight({	'type':'sun', // TYPE SUN (MAX 1) Enabled by default. New sun overrides the current
													'direction':$V3([-0.12,-0.5,0.20]),
													'color':5770
									});
			stormEngineC.selectNode(node);
		});	
		$("#STORMMENUBTN_C3_03").on('click', function() {
			var node = stormEngineC.createCamera($V3([0.0, 0.0, 0.0]), 1.0);
			stormEngineC.selectNode(node);
		});	
		$("#STORMMENUBTN_C3_04").on('click', function() {
			var node = stormEngineC.createLine($V3([0.0,0.0,0.0]), $V3([1.0,0.0,0.0]), $V3([1.0,1.0,1.0]), $V3([0.0,0.0,0.0])); // vecOrigin, vecEnd, vecOriginColor, vecEndColor
			stormEngineC.selectNode(node);
		});			
		$("#STORMMENUBTN_C3_05").on('click', function() {
			var tamW = prompt('width?','128'); if(tamW == '') tamW = 128;
			var tamH = prompt('height?','128'); if(tamH == '') tamH = 128;
			var node = stormEngineC.createParticles();
			node.generateParticles({amount:parseInt(tamW)*parseInt(tamH),   
									disposal:{radius:0.5}, 
									color:$V3([1.0,1.0,1.0]),
									pointSize:1.0,  
									polarity:0,
									direction:undefined}); 
			stormEngineC.selectNode(node);
		});		
		$("#STORMMENUBTN_C3_06").on('click', function() {
			var node = stormEngineC.createPolarityPoint({polarity:1,force:0.5});
			stormEngineC.selectNode(node);
		});	
		$("#STORMMENUBTN_C3_07").on('click', function() {
			var node = stormEngineC.createForceField();  
			stormEngineC.selectNode(node);
		});		
		$("#STORMMENUBTN_C3_08").on('click', function() {
			var node = stormEngineC.createGravityForce();  
			stormEngineC.selectNode(node); 
		});				
		$("#STORMMENUBTN_C3_09").on('click', function() {
			var node = stormEngineC.createVoxelizator();   
			stormEngineC.selectNode(node); 
		});	
		$("#STORMMENUBTN_C4_01").on('click', function() {
			stormEngineC.MaterialEditor.show();
		});
		$("#STORMMENUBTN_C4_02").on('click', function() {
			stormEngineC.PanelMaterials.show();
		});						 				
		$("#STORMMENUBTN_C5_01").on('click', function() {
			if(window.WebCL == undefined) {
				alert('Your browser does not support experimental-nokia-webcl. See http://webcl.nokiaresearch.com/ for rendering.');
			} else {
				stormEngineC.PanelRenderSettings.show();
			}
		});
	}// END EDIT MODE
	
	
	$(document).ready(stormEngineC.updateDivPosition);
	window.addEventListener("resize", stormEngineC.updateDivPosition, false);
	window.addEventListener("orientationchange", stormEngineC.updateDivPosition, false); 
	
	this.orientation = {alpha:0.0, beta:0.0, gamma:0.0}
	if(navigator.accelerometer) { // DEVICEORIENTATION FOR APACHE CORDOVA XYZ
		navigator.accelerometer.watchAcceleration(stormEngineC.handleOrientationEvent, console.log('NO ACCELEROMETER FOR CORDOVA'), {frequency: 3000});	
	}
	if(window.DeviceOrientationEvent) { // DEVICEORIENTATION FOR DOM gamma beta alpha
		window.addEventListener("MozOrientation", stormEngineC.handleOrientationEvent, true);
		window.addEventListener("deviceorientation", stormEngineC.handleOrientationEvent, true);
	} 	
	if(window.DeviceMotionEvent) { // DEVICEMOTION FOR DOM event.accelerationIncludingGravity.x event.accelerationIncludingGravity.y event.accelerationIncludingGravity.z
		window.addEventListener("devicemotion", stormEngineC.handleOrientationEvent, true);
	}
	
	document.body.addEventListener("keydown", function(e) { 
		//e.preventDefault();   
		stormEngineC.setZeroSamplesGIVoxels();
		
		if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.controller.keyDownFC(e);
	},false);
	
	document.body.addEventListener("keyup", function(e) {
		//e.preventDefault();
		stormEngineC.setZeroSamplesGIVoxels();
		
    	if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.controller.keyUpFC(e);
    },false);
	
	document.body.addEventListener("mouseup", stormEngineC.mouseup, false);
	document.body.addEventListener("touchend", stormEngineC.mouseup, false);
	this.target.addEventListener("mousedown", stormEngineC.mousedown, false);
	this.target.addEventListener("touchstart", stormEngineC.mousedown, false);
	document.body.addEventListener("mousemove", stormEngineC.mousemove, false); 
	document.body.addEventListener("touchmove", stormEngineC.mousemove, false); 
	
	this.target.addEventListener("click", function(e) {
		stormEngineC.runningAnim = false;
		stormEngineC.defaultCamera.enableAnimFrames = false;
    }, false);
	
	this.target.addEventListener("mousewheel", function(e) {
		e.preventDefault();
		stormEngineC.setZeroSamplesGIVoxels();
		
		if(stormEngineC.defaultCamera.controller.mouseWheel != undefined) stormEngineC.defaultCamera.controller.mouseWheel(e); 
	}, false);
	
	if(this.resizable == 1 || this.resizable == 2) {
		var ar = (this.resizable == 1) ? true : false;
		this.$.resizable({	aspectRatio: ar,
							resize:function(event,ui) {
								stormEngineC.setWebGLResize(ui.size.width, ui.size.height);  
							}});
	}
	
	if(this.resizable == 3) { // screen autoadjust(maintain the aspect ratio)
		this.resizable = 0; // Set no-resizable and we make autoadjust
		
		var width = this.target.getAttribute('width');
		var height = this.target.getAttribute('height');
		function gcd (width, height) { // greatest common divisor (GCD) 
			return (height == 0) ? width : gcd(height, width%height);
		}
		
		var widthScreen = document.documentElement.clientWidth;
		var heightScreen = document.documentElement.clientHeight;
		
		var r = gcd(width, height);
		var aspectW = (width/r); // 800/r = 4
		var aspectH = (height/r); // 600/r = 3
		
		// scale style 
		var newCanvasWidth = ((heightScreen/aspectH)*aspectW);
		var newCanvasHeight = ((widthScreen/aspectW)*aspectH);
		if(newCanvasHeight <= heightScreen)
			this.setWebGLResize(widthScreen, newCanvasHeight);
		else
			this.setWebGLResize(newCanvasWidth, heightScreen);
	}
};
/** @private */
StormEngineC.prototype.handleOrientationEvent = function(event) {
	var gamma = event.x || event.gamma || event.accelerationIncludingGravity.x*-1000.0;// gamma is the left-to-right tilt in degrees, where right is positive
	var beta = event.y || event.beta || event.accelerationIncludingGravity.y*1000.0;// beta is the front-to-back tilt in degrees, where front is positive
	var alpha = event.z || event.alpha || event.accelerationIncludingGravity.z*1000.0;// alpha is the compass direction the device is facing in degrees
	stormEngineC.orientation.gamma = gamma;
	stormEngineC.orientation.beta = beta;
	stormEngineC.orientation.alpha = alpha;
	
	/*console.log('tiltLR GAMMA X: '+stormEngineC.orientation.gamma+'<br />'+
				'tiltFB BETA Y: '+stormEngineC.orientation.beta+'<br />'+
				'dir ALPHA Z: '+stormEngineC.orientation.alpha+'<br />');*/
};
/**
* Get the device orientation tiltLeftRight (GAMMA X)
* @returns {Float} Float tiltLR.
*/
StormEngineC.prototype.getDeviceGamma = function() {
	return this.orientation.gamma;
};
/**
* Get the device orientation tiltFrontBack (BETA Y)
* @returns {Float} Float tiltFB.
*/
StormEngineC.prototype.getDeviceBeta = function() {
	return this.orientation.beta;
};
/**
* Get the device orientation dir (ALPHA Z)
* @returns {Float} Float dir.
*/
StormEngineC.prototype.getDeviceAlpha = function() {
	return this.orientation.alpha;
};
/**
* Set the tranform
* @type Void
* @param {Int} [mode=0] 0 for world transform; 1 for local transform
*/
StormEngineC.prototype.transformMode = function(mode) {
	this.defaultTransformMode = mode||0;
};
/**  @private */
StormEngineC.prototype.updateDivPosition = function(e) {
	stormEngineC.divPositionX = stormEngineC.utils.getElementPosition(stormEngineC.target).x;
	stormEngineC.divPositionY = stormEngineC.utils.getElementPosition(stormEngineC.target).y;
};
/**  @private */
StormEngineC.prototype.makePanel = function(panelobj, strAttrID, paneltitle, html) {
	var p = new StormPanel(strAttrID, paneltitle, html);
	panelobj.$ = p.$;
	panelobj.De = p.De;
};
/**  @private */
StormEngineC.prototype.mouseup = function(e) {
	stormEngineC.isMouseDown = false;
	//e.preventDefault();
	stormEngineC.stormGLContext.queryNodePickType = 2; // 0=noquery, 1=mousedown, 2=mouseup
	
	stormEngineC.setZeroSamplesGIVoxels();
	
	if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.controller.mouseUpFC(e);
	if(stormEngineC.stormRender != undefined && stormEngineC.renderStop == false) {
		stormEngineC.pauseRender = false;
		stormEngineC.stormRender.setCam(stormEngineC.defaultCamera);
		stormEngineC.stormRender.makeRender();
		
		stormEngineC.pause = true;
	}
};
/**  @private */
StormEngineC.prototype.mousedown = function(e) {
	stormEngineC.isMouseDown = true;
	if(stormEngineC.draggingNodeNow === false) {
		if(e.targetTouches != undefined) {
			//console.log(e.targetTouches)
			e = e.targetTouches[0];
			e.button = 0;
			stormEngineC.identifierTouchMoveOwner = e.identifier;
			
			stormEngineC.oldMousePosClickX = stormEngineC.mousePosX;
			stormEngineC.oldMousePosClickY = stormEngineC.mousePosY; 
			stormEngineC.mousePosX = (e.clientX - stormEngineC.divPositionX);
			stormEngineC.mousePosY = (e.clientY - stormEngineC.divPositionY);
			stormEngineC.mouseOldPosX = stormEngineC.mousePosX;   
			stormEngineC.mouseOldPosY = stormEngineC.mousePosY;  
		}
	}
	//e.preventDefault(); // si se habilita no funciona sobre un iframe
	
	if(e.button == 2) { // right button
		if(stormEngineC.editMode) {
			DGE('STORMMENU_MOUSE').style.display = "block";
			DGE('STORMMENU_MOUSE').style.left = stormEngineC.mousePosX+"px";
			DGE('STORMMENU_MOUSE').style.top = stormEngineC.mousePosY+"px";
			return false;
		}
	} else {
		stormEngineC.oldMousePosClickX = stormEngineC.mousePosX;
		stormEngineC.oldMousePosClickY = stormEngineC.mousePosY; 
		
		stormEngineC.stormGLContext.queryNodePickType = 1; // 0=noquery, 1=mousedown, 2=mouseup 
		if(	stormEngineC.isMouseDown == true &&
			stormEngineC.getSelectedNode() != undefined &&
			stormEngineC.stormGLContext.transformOverlaySelected != 0) {
				stormEngineC.getSelectedNode().bodyActive(false);
				stormEngineC.draggingNodeNow = true;
		}
			
		stormEngineC.setZeroSamplesGIVoxels();
		
		stormEngineC.PanelAnimationTimeline.stop();
		stormEngineC.runningAnim = false;
		stormEngineC.defaultCamera.enableAnimFrames = false;
		if(stormEngineC.preloads == 0) {
			stormEngineC.defaultCamera.controller.lastX = e.screenX;
			stormEngineC.defaultCamera.controller.lastY = e.screenY;
			stormEngineC.defaultCamera.controller.mouseDownFC(e);
		}
		if(stormEngineC.stormRender != undefined && stormEngineC.renderStop == false) {
			stormEngineC.pauseRender = true;
			clearTimeout(stormEngineC.stormRender.timerRender);
			
			stormEngineC.pause = false;
		}
	}
};
/**  @private */
StormEngineC.prototype.mousemove = function(e) {
	e.preventDefault();
	var isMoveOwner = false;
	if(e.targetTouches != undefined) {
		for(var n = 0, fn = e.targetTouches.length; n < fn; n++) {
			if(e.targetTouches[n].identifier == stormEngineC.identifierTouchMoveOwner) {
				//console.log(e.targetTouches)
				e = e.targetTouches[n];
				e.button = 0;
				isMoveOwner = true;
			}
		}
	}
	if(e.targetTouches == undefined || (e.targetTouches != undefined && isMoveOwner)) {
		stormEngineC.mouseOldPosX = stormEngineC.mousePosX;   
		stormEngineC.mouseOldPosY = stormEngineC.mousePosY;
		stormEngineC.mousePosX = (e.clientX - stormEngineC.divPositionX);
		stormEngineC.mousePosY = (e.clientY - stormEngineC.divPositionY);
		//console.log(stormEngineC.mousePosX+' '+stormEngineC.mousePosY);
		
		if(stormEngineC.draggingNodeNow !== false) { 
			var selOver = stormEngineC.stormGLContext.transformOverlaySelected;
			if(selOver != 0) {
				if(selOver == 1 || selOver == 2 || selOver == 3) {
					var dir;
					if(selOver == 1) {
						if(stormEngineC.defaultTransformMode == 0)
							dir = stormEngineC.utils.getDraggingPosXVector(); 
						else 
							dir = stormEngineC.utils.getDraggingPosXVector(false); 
					} else if(selOver == 2) {
						if(stormEngineC.defaultTransformMode == 0)
							dir = stormEngineC.utils.getDraggingPosYVector(); 
						else 
							dir = stormEngineC.utils.getDraggingPosYVector(false); 
					} else if(selOver == 3) {
						if(stormEngineC.defaultTransformMode == 0)
							dir = stormEngineC.utils.getDraggingPosZVector(); 
						else 
							dir = stormEngineC.utils.getDraggingPosZVector(false); 
					}
					stormEngineC.getSelectedNode().setPosition(stormEngineC.getSelectedNode().getPosition().add(dir));
				} else if(selOver == 4 || selOver == 5 || selOver == 6) {
					if(selOver == 4) {
						if(stormEngineC.defaultTransformMode == 0) {
							var val = stormEngineC.utils.getDraggingScreenVector(); 
							stormEngineC.getSelectedNode().setRotationX(val.e[0]+val.e[1]+val.e[2]);
						} else {
							var val = stormEngineC.utils.getDraggingScreenVector(); 
							stormEngineC.getSelectedNode().MROTXYZ = stormEngineC.getSelectedNode().MROTXYZ.setRotationX(val.e[0]+val.e[1]+val.e[2]);
						}
					} else if(selOver == 5) {
						if(stormEngineC.defaultTransformMode == 0) {
							var val = stormEngineC.utils.getDraggingScreenVector(); 
							stormEngineC.getSelectedNode().setRotationY(val.e[0]+val.e[1]+val.e[2]);
						} else {
							var val = stormEngineC.utils.getDraggingScreenVector(); 
							stormEngineC.getSelectedNode().MROTXYZ = stormEngineC.getSelectedNode().MROTXYZ.setRotationY(val.e[0]+val.e[1]+val.e[2]);
						}
					} else if(selOver == 6) {
						if(stormEngineC.defaultTransformMode == 0) {
							var val = stormEngineC.utils.getDraggingScreenVector(); 
							stormEngineC.getSelectedNode().setRotationZ(val.e[0]+val.e[1]+val.e[2]);
						} else {
							var val = stormEngineC.utils.getDraggingScreenVector(); 
							stormEngineC.getSelectedNode().MROTXYZ = stormEngineC.getSelectedNode().MROTXYZ.setRotationZ(val.e[0]+val.e[1]+val.e[2]);
						}
					}
				} else if(stormEngineC.defaultTransformMode == 1 && (selOver == 7 || selOver == 8 || selOver == 9)) {
					var val;
					if(selOver == 7) {
						val = stormEngineC.utils.getDraggingScreenVector();  
						stormEngineC.getSelectedNode().setScaleX(val.e[0]+val.e[1]+val.e[2]);
					} else if(selOver == 8) {
						val = stormEngineC.utils.getDraggingScreenVector(); 
						stormEngineC.getSelectedNode().setScaleY(val.e[0]+val.e[1]+val.e[2]);
					} else if(selOver == 9) {
						val = stormEngineC.utils.getDraggingScreenVector(); 
						stormEngineC.getSelectedNode().setScaleZ(val.e[0]+val.e[1]+val.e[2]);
					}
				}
			} else {
				var dir = stormEngineC.utils.getDraggingScreenVector(); 
				stormEngineC.getSelectedNode().setPosition(stormEngineC.getSelectedNode().getPosition().add(dir));  
			}
		}
		
		if(stormEngineC.defaultCamera.controller.leftButton == 1 || stormEngineC.defaultCamera.controller.middleButton == 1) {
			stormEngineC.setZeroSamplesGIVoxels();
			if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.controller.mouseMoveFC(e);
		}
	}
};
/**  @private */
StormEngineC.prototype.setZeroSamplesGIVoxels = function() {
	if(this.intervalCheckCameraGoalStaticStatus != undefined) {
		clearInterval(this.intervalCheckCameraGoalStaticStatus);
		this.intervalCheckCameraGoalStaticStatus = undefined;
	}
	
	this.intervalCheckCameraGoalStaticStatus = setInterval(function() {
		stormEngineC.stormGLContext.sampleGiVoxels = 0;  
		stormEngineC.stormGLContext.cameraIsStatic = 0;  
		//console.log('nostatic');
		if((stormEngineC.defaultCamera.nodeGoal.getPosition().distance(stormEngineC.cameraGoalCurrentPos) < 0.0001)) {  
			clearInterval(stormEngineC.intervalCheckCameraGoalStaticStatus);
			stormEngineC.intervalCheckCameraGoalStaticStatus = undefined;
			stormEngineC.stormGLContext.sampleGiVoxels = 0;  
			stormEngineC.stormGLContext.cameraIsStatic = 1;  
		}
		stormEngineC.cameraGoalCurrentPos = stormEngineC.defaultCamera.nodeGoal.getPosition();
	}, 30);
};
/**  @private */
StormEngineC.prototype.selectNode = function(node) {
	this.nearNode = node;   
	
	if(this.editMode) {
		if(this.PanelAnimationTimeline.De.style.display == 'block')
			this.PanelAnimationTimeline.drawTimelineGrid();
			
		//if(this.PanelListObjects.De.style.display == "block") {
			this.PanelListObjects.showListObjects(); 
			this.PanelListObjects.show();
		//}
		//if(this.PanelListObjects.De.style.display == "block") {
			this.PanelEditNode.show();
			this.PanelEditNode.updateNearNode();
		//}
		
		this.debugValues = [];
		if(this.nearNode.objectType == 'line') {
			var vecTranslation = stormEngineC.nearNode.origin;
			var vecTranslationE = stormEngineC.nearNode.end; 
			this.debugValues = [];
			stormEngineC.setDebugValue(0, vecTranslation, stormEngineC.nearNode.name+' origin');
			stormEngineC.setDebugValue(1, vecTranslationE, stormEngineC.nearNode.name+' end');
		} else if(this.nearNode.objectType == 'camera') {
			var vecGoal = stormEngineC.nearNode.nodeGoal.getPosition();
			var vecPivot = stormEngineC.nearNode.nodePivot.getPosition();
			this.debugValues = [];
			stormEngineC.setDebugValue(0, vecGoal, stormEngineC.nearNode.name+' nodeGoal');
			stormEngineC.setDebugValue(1, vecPivot, stormEngineC.nearNode.name+' nodePivot');
		} else if(stormEngineC.nearNode.getPosition != undefined) {    
			var vec = stormEngineC.nearNode.getPosition();
			this.debugValues = [];
			stormEngineC.setDebugValue(0, vec, stormEngineC.nearNode.name); 
		} 
	}
};

/**
* Get the selected node
* @returns {StormNode} 
*/
StormEngineC.prototype.getSelectedNode = function() {
	return this.nearNode;
};

/** @private */
StormEngineC.prototype.go = function() {};
/** @private */
StormEngineC.prototype.next = function() {
	window.requestAnimFrame(stormEngineC.next);
	stormEngineC.render();
	stormEngineC.nextFrameLocalTimeline();
};
/** @private */
StormEngineC.prototype.render = function() {
	if(!this.pause) {
		if(this.preloads == 0) {
			this.stormJigLibJS.update(this.elapsed);
		}
		
		if(this.callback != undefined) this.callback();
		
		var timeNow = new Date().getTime();
		if(this.lastTime != 0) this.elapsed = timeNow - this.lastTime;
		this.lastTime = timeNow;
	   
		

		this.defaultCamera.posCamera = $V3([this.defaultCamera.nodeGoal.MPOS.e[3], this.defaultCamera.nodeGoal.MPOS.e[7], this.defaultCamera.nodeGoal.MPOS.e[11]]);
		this.defaultCamera.posCameraPivot = $V3([this.defaultCamera.nodePivot.MPOS.e[3], this.defaultCamera.nodePivot.MPOS.e[7], this.defaultCamera.nodePivot.MPOS.e[11]]);
		this.defaultCamera.vecView = this.defaultCamera.posCameraPivot.subtract(this.defaultCamera.posCamera).normalize();
		this.defaultCamera.centroPlanoProyeccion = this.defaultCamera.posCamera.add(this.defaultCamera.vecView.x(this.defaultCamera.distanciaAlPlano));
		this.defaultCamera.vecXPlanoProyeccion = $V3([0.0, 1.0, 0.0]).cross(this.defaultCamera.vecView).normalize();//◄
		this.defaultCamera.vecYPlanoProyeccion = this.defaultCamera.vecView.cross(this.defaultCamera.vecXPlanoProyeccion).normalize();//▲
		
		var xcc = this.defaultCamera.vecView.x(1.0).x(this.defaultCamera.focusExtern); 
		var posFF = this.defaultCamera.getPosition().add(xcc);
		this.defaultCamera.nodePivot.nodeFocus.setPosition(posFF);
		
		if(	this.runningAnim == false &&
			this.defaultCamera.enableAnimFrames == false &&
			this.defaultCamera.animController == 'GlobalTimeline') {
			this.defaultCamera.controller.updateFC(this.elapsed);
		}
		
		
		var cameraP, center;
		if(this.defaultCamera.controller.controllerType == 0) {
			cameraP = this.defaultCamera.nodePivot.getPosition();
			var vec = this.defaultCamera.nodePivot.getForward();
			center = cameraP.add(vec);
		} else { 
			cameraP = this.defaultCamera.nodeGoal.getPosition();
			center = this.defaultCamera.nodePivot.getPosition();
		}
		this.defaultCamera.MPOS = $M16().makeLookAt(cameraP.e[0], cameraP.e[1], cameraP.e[2],
													center.e[0], center.e[1], center.e[2],
													0.0,1.0,0.0);
		
		
		// update sun light
		this.lights[0].setDirection(this.lights[0].direction);
		
		// guardar operaciones generales para este frame
		for(var n = 0, f = this.nodes.length; n < f; n++) {
			this.nodes[n].MPOSFrame = this.nodes[n].MPOS.x(this.nodes[n].MROTXYZ);
			this.nodes[n].MCAMPOSFrame = this.defaultCamera.MPOS.x(this.nodes[n].MPOSFrame);
		}
		for(var n = 0, f = this.polarityPoints.length; n < f; n++) {
			this.polarityPoints[n].MPOSFrame = this.polarityPoints[n].MPOS.x(this.polarityPoints[n].MROTXYZ);
			this.polarityPoints[n].MCAMPOSFrame = this.defaultCamera.MPOS.x(this.polarityPoints[n].MPOSFrame);
		}
		for(var n = 0, f = this.lights.length; n < f; n++) {
			this.lights[n].MPOSFrame = this.lights[n].MPOS.x(this.lights[n].MROTXYZ);
			this.lights[n].MCAMPOSFrame = this.defaultCamera.MPOS.x(this.lights[n].MPOSFrame);
			
			this.lights[n].mrealWMatrixFrame = this.lights[n].mrealWMatrix.x(this.lights[n].mrealRotationLocalSpaceMatrix);
			this.lights[n].mrealWVMatrixFrame = this.defaultCamera.MPOS.x(this.lights[n].mrealWMatrixFrame);
		}
		
		this.stormGLContext.renderGLContext();
		
		// debug values
		this.showDebugValues();
	}
};

/** @private */
StormEngineC.prototype.nextFrameLocalTimeline = function() { 
	for(n = 0, f = stormEngineC.nodes.length; n < f; n++) {
		if(stormEngineC.nodes[n].animController == 'LocalTimeline' && stormEngineC.nodes[n].playLocalTimeline == true) {  
			var start = stormEngineC.nodes[n].animMinLayerLocalTimeline[stormEngineC.nodes[n].currLanimL];
			var end = stormEngineC.nodes[n].animMaxLayerLocalTimeline[stormEngineC.nodes[n].currLanimL];
			var curr = stormEngineC.nodes[n].animCurrentLayerLocalTimeline[stormEngineC.nodes[n].currLanimL];
			
			if(curr >= end) {
				if(stormEngineC.nodes[n].animLoopLayerLocalTimeline[stormEngineC.nodes[n].currLanimL]) {
					curr = start
					stormEngineC.nodes[n].applyAnimFrame(curr); 
				}
			} else {
				curr = curr+1;
				stormEngineC.nodes[n].applyAnimFrame(curr); 
			} 
			//this.SL.slider("option", "value", parseInt(this.current));  
		}
	}
	for(n = 0, f = stormEngineC.lights.length; n < f; n++) {
		if(stormEngineC.lights[n].animController == 'LocalTimeline' && stormEngineC.lights[n].playLocalTimeline == true) {  
			var start = stormEngineC.lights[n].animMinLayerLocalTimeline[stormEngineC.lights[n].currLanimL];
			var end = stormEngineC.lights[n].animMaxLayerLocalTimeline[stormEngineC.lights[n].currLanimL];
			var curr = stormEngineC.lights[n].animCurrentLayerLocalTimeline[stormEngineC.lights[n].currLanimL];
			
			if(curr >= end) {
				if(stormEngineC.lights[n].animLoopLayerLocalTimeline[stormEngineC.lights[n].currLanimL]) {
					curr = start
					stormEngineC.lights[n].applyAnimFrame(curr); 
				}
			} else {
				curr = curr+1;
				stormEngineC.lights[n].applyAnimFrame(curr); 
			} 
			//this.SL.slider("option", "value", parseInt(this.current));  
		}
	}
	for(n = 0, f = stormEngineC.nodesCam.length; n < f; n++) {
		if(stormEngineC.nodesCam[n].animController == 'LocalTimeline' && stormEngineC.nodesCam[n].playLocalTimeline == true) {  
			var start = stormEngineC.nodesCam[n].animMinLayerLocalTimeline[stormEngineC.nodesCam[n].currLanimL];
			var end = stormEngineC.nodesCam[n].animMaxLayerLocalTimeline[stormEngineC.nodesCam[n].currLanimL];
			var curr = stormEngineC.nodesCam[n].animCurrentLayerLocalTimeline[stormEngineC.nodesCam[n].currLanimL];
			
			if(curr >= end) {
				if(stormEngineC.nodesCam[n].animLoopLayerLocalTimeline[stormEngineC.nodesCam[n].currLanimL]) {
					curr = start
					stormEngineC.nodesCam[n].applyAnimFrame(curr); 
				}
			} else {
				curr = curr+1;
				stormEngineC.nodesCam[n].applyAnimFrame(curr);  
			} 
			//this.SL.slider("option", "value", parseInt(this.current));  
		}
	}
};

/**
* Up Google App Engine Channel
* @type Void
* @param {String} userId Google userId
* @param {String} userNickname Google userNickname
* @param {String} scene Name for the scene
* @param {String} token Token generated by Java object StormNetScene 
*/
StormEngineC.prototype.upGAEChannel = function(userId, userNickname, scene, token) {
	this.netID = userId;
	this.userNickname = userNickname;
	this.GAESceneChannel = scene;
	
	channel = new goog.appengine.Channel(token);
	socket = channel.open();
	socket.onopen = function(evt) {
		stormEngineC.emitGAEMsg('newNetNode=true');
		stormEngineC.emitGAEMsg('getNetNodes=true');
	};
	
	
	socket.onmessage = function(evt) {
		var obj = JSON.parse(evt.data);
		obj = obj[0];
		//console.log(obj); 
		
		if(obj.newconnection != undefined) {
			if(obj.newconnection != stormEngineC.netID ) {
				stormEngineC.arrNetUsers.push({	'netID':obj.newconnection});
				stormEngineC.onGAENicknameConnect(obj.netNickname);    
			}
		}
		if(obj.getNetNodesResponse != undefined) { // clientes que se encuentran conectados
			if(obj.getNetNodesResponse != stormEngineC.netID ) {
				stormEngineC.arrNetUsers.push({	'netID':obj.getNetNodesResponse});
				stormEngineC.onGAENicknameAlreadyConnect(obj.netNickname);     
			}
		}
		if(obj.serverNodeData != undefined) {
			if(obj.netID != stormEngineC.netID ) {
				//console.log(obj.netID);  
				stormEngineC.onGAEReceiveMsg(obj.netNickname+'-'+obj.param1);       
			}
		}
		if(obj.disconnectNetNode != undefined) {
			if(obj.netID != stormEngineC.netID ) {
				//console.log(obj.netID);  
				stormEngineC.onGAENicknameDisconnect(obj.netNickname);        
			}
		}
	};
	socket.onerror = function(evt) {
		console.log(evt);
	};
    socket.onclose = function(evt) {
		stormEngineC.emitGAEMsg('disconnect=true'); 
	};
	window.onunload=function(){
		stormEngineC.emitGAEMsg('disconnect=true');  
	};
};

/** @private */
StormEngineC.prototype.emitGAEMsg = function(extraParams) {
	var extra =(extraParams!=undefined)?extraParams:"";
	var params = 'scene='+this.GAESceneChannel+'&netID='+this.netID+'&netNickname='+this.userNickname+'&'+extra; 
	var req = new XHR();
	req.open('POST', stormEngineCDirectory+'/xhr_emitGAEMsg.jsp', true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send(params);
};
/**
* Emit GAE Channel Msg to everybody
* @type Void
* @param {String} params
*/
StormEngineC.prototype.dataGAEMsg = function(extraParams) {
	var extra =(extraParams!=undefined)?extraParams:"";
	var params = 'scene='+this.GAESceneChannel+'&netID='+this.netID+'&netNickname='+this.userNickname+'&dataclient=true&param1='+extra; 
	var req = new XHR();
	req.open('POST', stormEngineCDirectory+'/xhr_emitGAEMsg.jsp', true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send(params); 
};


var ws = undefined;
/**
* Up Websocket Game Server
* @type Void
* @param {String} ip
* @param {Int} port
*/
StormEngineC.prototype.upWebsocket = function(ip, port) {
	ws = io.connect('ws://'+ip+':'+port+'/');
	
	ws.on('newconnection', function(data) {
		if(data.netID != stormEngineC.netID ) {
			console.log(data);
			
			var node = new StormNode();
			node.idNum = stormEngineC.nodes.length;
			node.name = 'node '+stormEngineC.idxNodes++;
			stormEngineC.nodes.push(node);
			
			node.netID = data.netID;
			stormEngineC.arrNetUsers.push({	'netID':data.netID,
											'node':node});
			var mesh = new StormMesh();
			//mesh.loadBox(node, $V3([1.0,1.0,1.0]));
			//node.setAlbedo($V3([1.0,1.0,1.0])); 
			mesh.loadBox($V3([1.0,1.0,1.0])); // the mesh to be used should be placed at the point 0,0,0 before exporting
			node.setPosition($V3([-13.0, 2.0, -30.0]));
		}
	});
	
	ws.emit('getNetNodes', {
		notinuse: stormEngineC.nodes.length
	});
	ws.on('getNetNodesResponse', function(data) { // clientes que se encuentran conectados
		var node = new StormNode();
		node.idNum = stormEngineC.nodes.length;
		node.name = 'node '+stormEngineC.idxNodes++;
		stormEngineC.nodes.push(node);
		
		node.netID = data.netID;
		stormEngineC.arrNetUsers.push({	'netID':data.netID,
										'node':node});
		
		var mesh = new StormMesh();
		//mesh.loadBox(node, $V3([1.0,1.0,1.0]));
		//node.setAlbedo($V3([1.0,1.0,1.0])); 
		mesh.loadBox($V3([1.0,1.0,1.0])); // the mesh to be used should be placed at the point 0,0,0 before exporting
		node.setPosition($V3([-13.0, 2.0, -30.0]));
	});
	
	
	ws.on('newNetNodeConnectionResponse', function(data) { // data.netID = my net id
		stormEngineC.netID = data.netID;
		
		stormEngineC.netNode = new StormNode();
		stormEngineC.netNode.idNum = stormEngineC.nodes.length;
		stormEngineC.netNode.name = 'node '+stormEngineC.idxNodes++;
		stormEngineC.nodes.push(stormEngineC.netNode);
		
		stormEngineC.netNode.netID = data.netID;
		stormEngineC.arrNetUsers.push({	'netID':data.netID,
										'node':stormEngineC.netNode});
										
		stormEngineC.newNetNodeConnectionResponse(stormEngineC.netNode); 
		//alert(data.netID);
	});
	
	/*ws.onerror = function(error) {
		alert(error); 
	};*/
	/*ws.onclose = function() {

	};*/
	
	ws.on('serverNodeData', function(data) {
		//alert('serverNodeData '+data.netID);
		if(data.netID != stormEngineC.netID ) {
			var nodeIdNum = 0;
			for(var n = 0, f = stormEngineC.arrNetUsers.length; n < f; n++) {
				if(stormEngineC.arrNetUsers[n].netID == data.netID) {
					nodeIdNum = stormEngineC.arrNetUsers[n].node.idNum;
					break;
				}
			}
			for(var n = 0, f = stormEngineC.nodes.length; n < f; n++) {
				if(stormEngineC.nodes[n].idNum == nodeIdNum) {
					stormEngineC.nodes[n].MPOS = $M16([
									  data.WM0, data.WM1, data.WM2, data.WM3,
									  data.WM4, data.WM5, data.WM6, data.WM7,
									  data.WM8, data.WM9, data.WM10, data.WM11,
									  data.WM12, data.WM13, data.WM14, data.WM15
									]);
					stormEngineC.nodes[n].MROTXYZ = $M16([
									  data.RM0, data.RM1, data.RM2, data.RM3,
									  data.RM4, data.RM5, data.RM6, data.RM7,
									  data.RM8, data.RM9, data.RM10, data.RM11,
									  data.RM12, data.RM13, data.RM14, data.RM15
									]);
				}
			}
			
			
		}
	});	
	ws.on('disconnectNetNode', function(data) {
		//alert('disconnectNetNode '+data.netID);
		var nodeIdNum = 0;
		for(var n = 0, f = stormEngineC.arrNetUsers.length; n < f; n++) {
			if(stormEngineC.arrNetUsers[n].netID == data.netID) {
				nodeIdNum = stormEngineC.arrNetUsers[n].node.idNum;
				break;
			}
		}
		for(var n = 0, f = stormEngineC.nodes.length; n < f; n++) {
			if(stormEngineC.nodes[n].idNum == nodeIdNum) {
				stormEngineC.nodes[n].visibleOnContext = false; 
			}
		}
	});
	
	ws.on('setPrincipalNetNodeResponse', function(data) {
		//alert('setPrincipalNetNodeResponse '+data.netID);
		var nodeIdNum = 0;
		for(var n = 0, f = stormEngineC.arrNetUsers.length; n < f; n++) {
			if(stormEngineC.arrNetUsers[n].netID == data.netID) {
				nodeIdNum = stormEngineC.arrNetUsers[n].node.idNum;
				break;
			}
		}
		for(var n = 0, f = stormEngineC.nodes.length; n < f; n++) {
			if(stormEngineC.nodes[n].idNum == nodeIdNum) {
				if(data.netID != stormEngineC.netID) { 
					stormEngineC.globalResponsePrincipalNetNode(stormEngineC.nodes[n]);
				}
			}
		}
	});
};

/**
* Create StormNode object
* @returns {StormNode}
*/
StormEngineC.prototype.createNode = function() {
	var node = new StormNode();
	node.idNum = this.nodes.length;
	node.name = 'node '+this.idxNodes++;
	var material = stormEngineC.createMaterial();
	node.materialUnits[0] = material; 
	this.nodes.push(node);
	return node;
};

/**
* Make a websocket player
* @type Void
*/
StormEngineC.prototype.createNetNode = function() { // llamar al final del código, después de cargar todos los nodos estáticos
	if(this.GAESceneChannel != undefined) {
		stormEngineC.netID = stormEngineC.netID; // my net id
		
		stormEngineC.netNode = new StormNode();
		stormEngineC.netNode.idNum = stormEngineC.nodes.length;
		stormEngineC.netNode.name = 'node '+stormEngineC.idxNodes++;
		var material = stormEngineC.createMaterial();
		stormEngineC.netNode.materialUnits[0] = material; 
		stormEngineC.nodes.push(stormEngineC.netNode);
		
		stormEngineC.netNode.netID = stormEngineC.netID;
		stormEngineC.arrNetUsers.push({	'netID':stormEngineC.netID,
										'node':stormEngineC.netNode});
										
		stormEngineC.newNetNodeConnectionResponse(stormEngineC.netNode); 
	} else {
		if(ws != undefined && (ws.socket.connected == true || ws.socket.connecting == true)) {
			ws.emit('newNetNode', {
				notinuse: stormEngineC.nodes.length
			});
		} else {
			this.netNode = new StormNode();
			this.netNode.idNum = stormEngineC.nodes.length;
			this.netNode.name = 'node '+stormEngineC.idxNodes++;
			var material = stormEngineC.createMaterial();
			this.netNode.materialUnits[0] = material; 
			stormEngineC.nodes.push(this.netNode);
		
			stormEngineC.newNetNodeConnectionResponse(this.netNode); 
		}
	}
};

/**
* @private 
* @returns {Array} Net Nodes Connected
*/
StormEngineC.prototype.getArrayNetNodes = function() {
	var arrNetNodes = [];
	for(var n = 0, f = stormEngineC.arrNetUsers.length; n < f; n++) {
		arrNetNodes.push(stormEngineC.arrNetUsers[n].node);
	}
	return arrNetNodes;
};

/**
* Make this client the principal Net Player
* @type Void
*/
StormEngineC.prototype.setPrincipalNetNode = function() {
	//alert(stormEngineC.netID);
	ws.emit('setPrincipalNetNode', {
		netID: stormEngineC.netID
	});
};

/**
* Return websocket status for Game Server
* @returns {String} 
*/
StormEngineC.prototype.getServerStatus = function() {
	return ws.socket.connected.toString();
};


wsPathTracing = undefined;
/**
* Up Websocket PathTracing Server
* @type Void
* @param {String} ip
* @param {Int} port
*/
StormEngineC.prototype.upWebsocketPathTracing = function(ip, port) {
	wsPathTracing = io.connect('ws://'+ip+':'+port+'/', {
		'connect timeout':1000000
	});
	
	wsPathTracing.emit('newNetNode', {
		notinuse: stormEngineC.nodes.length
	});
		
	wsPathTracing.on('newNetNodeConnectionResponse', function(data) { // data.netID = my net id
		stormEngineC.netID = data.netID;
		if(data.netID == 0) {
			$('#DIVID_StormRenderTypeNet').html('<span style="font-weight:bold;color:green;">CLOUD RENDER DETECTED</span><br /><span style="font-weight:bold;color:#000;">HOST MACHINE</span>');
		} else {
			$('#DIVID_StormRenderTypeNet').html('<span style="font-weight:bold;color:green;">CLOUD RENDER DETECTED</span><br /><span style="font-weight:bold;color:#000;">CLIENT '+data.netID+'</span>');
			$('#DIVID_StormRenderConf').css("display",'none'); 
			$('#BTNID_StormRenderBtn').html("Collaborate");
			$('#BTNID_StormRenderTimelineBtn').css('display','none');
		}
		stormEngineC.arrNetUsers.push({	'netID':data.netID});
	});
		
	wsPathTracing.on('newconnection', function(data) {
		if(data.netID != stormEngineC.netID ) {
			console.log(data);
			
			stormEngineC.arrNetUsers.push({	'netID':data.netID});
		}
	});
	
	wsPathTracing.emit('getNetNodes', {
		notinuse: stormEngineC.nodes.length
	});
	wsPathTracing.on('getNetNodesResponse', function(data) { // clientes que se encuentran conectados
		stormEngineC.arrNetUsers.push({	'netID':data.netID});
	});
	
	wsPathTracing.on('setFrameTotalColorXResponse', function(data) {
		if(stormEngineC.netID == 0) {
			if(stormEngineC.stormRender != undefined) stormEngineC.stormRender.receiveFromClient = 1;
			$('#DIVID_StormRenderNetReceive').html('<span style="color:blue;">- Receiving <span style="font-weight:bold;">FRAME '+data.frameNumber+'</span> from <span style="font-weight:bold;">CLIENT '+data.netID+'</span></span>');
			stormEngineC.timelinePathTracing.setFrameTotalColorX(data.frameNumber, data.arrayTotalColorX, data.width, data.height, data.offset);
		}
	});	
	wsPathTracing.on('setFrameTotalColorYResponse', function(data) {
		if(stormEngineC.netID == 0) {
			if(stormEngineC.stormRender != undefined) stormEngineC.stormRender.receiveFromClient = 1;
			stormEngineC.timelinePathTracing.setFrameTotalColorY(data.frameNumber, data.arrayTotalColorY, data.offset);
		}
	});	
	wsPathTracing.on('setFrameTotalColorZResponse', function(data) {
		if(stormEngineC.netID == 0) {
			if(stormEngineC.stormRender != undefined) stormEngineC.stormRender.receiveFromClient = 1;
			stormEngineC.timelinePathTracing.setFrameTotalColorZ(data.frameNumber, data.arrayTotalColorZ, data.offset);
		}
	});	
	wsPathTracing.on('setFrameTotalShadowResponse', function(data) {
		if(stormEngineC.netID == 0) {
			if(stormEngineC.stormRender != undefined) stormEngineC.stormRender.receiveFromClient = 1;
			stormEngineC.timelinePathTracing.setFrameTotalShadow(data.frameNumber, data.arrayTotalShadow, data.offset);
		}
	});	
	wsPathTracing.on('setFrameSampleResponse', function(data) {
		if(stormEngineC.netID == 0) {
			if(stormEngineC.stormRender != undefined) stormEngineC.stormRender.receiveFromClient = 0;
			$('#DIVID_StormRenderNetReceive').html('');
			stormEngineC.timelinePathTracing.setFrameSample(data.frameNumber, data.arraySample, true);
		}
	});	
	wsPathTracing.on('disconnectNetNode', function(data) {
		//alert('disconnectNetNode '+data.netID);
	});
	wsPathTracing.on('getFrame', function(data) {		
		if(data.netID == stormEngineC.netID && stormEngineC.netID != 0) {
			if(stormEngineC.pauseRender == false) {
				stormEngineC.stormRender.sendFrameToHost = 1;
			} else {
				wsPathTracing.emit('hostUnhold', {
					notinuse: stormEngineC.nodes.length
				});
			}
		}
	});
	wsPathTracing.on('nextFrame', function(data) {		
		if(data.netID == stormEngineC.netID && stormEngineC.netID != 0) {
			stormEngineC.stormRender.nextFrame();
		}
	});
	wsPathTracing.on('getRenderDimensionsResponse', function(data) {
		if(stormEngineC.netID == 0) {
			var jsonS = [];
			for(var n = stormEngineC.defaultCamera.animMin, f = stormEngineC.defaultCamera.animMax; n <= f; n++) {
				if(stormEngineC.defaultCamera.nodePivot.animWMatrix[n] != undefined) {
					jsonS.push({'frame':n,
								'WMatrixPivot':stormEngineC.defaultCamera.nodePivot.animWMatrix[n].e,
								'WMatrixGoal':stormEngineC.defaultCamera.nodeGoal.animWMatrix[n].e});
				}
			}
			wsPathTracing.emit('sendRenderDimensions', {
				netID: data.netID,
				width: $('#INPUTID_StormRenderSettings_width').val(),
				height: $('#INPUTID_StormRenderSettings_height').val(),
				camMatrixFrames: jsonS
			}); 
		}
	});
	wsPathTracing.on('sendRenderDimensionsResponse', function(data) {	
		if(data.netID == stormEngineC.netID && stormEngineC.netID != 0) {
			//console.log(data.camMatrixFrames);
			for(var n = 0, f = data.camMatrixFrames.length; n < f; n++) {
				var arrPivot = [];
				var arrGoal = [];
				$.each(data.camMatrixFrames[n].WMatrixPivot, function(k,v){
					arrPivot.push(v);
				});
				$.each(data.camMatrixFrames[n].WMatrixGoal, function(k,v){
					arrGoal.push(v);
				});
				stormEngineC.defaultCamera.setAnimKey(data.camMatrixFrames[n].frame, $M16(arrPivot), $M16(arrGoal));
			}
			stormEngineC.PanelRenderSettings.render(data.width, data.height);
		}
	});
};

/**
* Create material
* @returns {StormMaterial}
*/
StormEngineC.prototype.createMaterial = function() {
	var material = new StormMaterial();
	material.idNum = this.materials.length;
	material.name = 'material '+this.idxMaterials++;
	this.materials.push(material);
	return material;
};

/**
* Create StormGroupNodes object
* @returns {StormGroupNodes}
*/
StormEngineC.prototype.createGroup = function() {
	var group = new StormGroupNodes();
	group.idNum = this.groups.length;
	group.name = 'group '+this.idxGroups++;
	this.groups.push(group);
	return group;
};
 
/**
* Create camera. If distance is given the type of controller is 'targetcam' else 'freecam'.
* @returns {StormCamera}
* @param {StormV3} [position=$V3([0.0,0.0,0.0])] The position
* @param {Float} [distance=undefined] Distance to camera target
*/
StormEngineC.prototype.createCamera = function(vec, distance) {
	var nodeCam = new StormCamera();
	nodeCam.idNum = this.nodesCam.length;
	nodeCam.name = 'camera '+this.idxNodesCam++;
	this.nodesCam.push(nodeCam);
	
	nodeCam.nodePivot = new StormNode();
	nodeCam.nodePivot.setPosition((vec == undefined)?$V3([0.0, 0.0, 0.0]):vec);
	nodeCam.nodeGoal = new StormNode();	 
	
	nodeCam.nodePivot.nodeFocus = stormEngineC.createNode();
	nodeCam.nodePivot.nodeFocus.systemVisible = false; 
	nodeCam.nodePivot.nodeFocus.name = nodeCam.name+' focus';
	nodeCam.nodePivot.nodeFocus.visibleOnContext = false; 
	nodeCam.nodePivot.nodeFocus.visibleOnRender = false; 
	nodeCam.nodePivot.nodeFocus.loadBox($V3([0.12,0.12,0.12]));
	nodeCam.nodePivot.nodeFocus.setAlbedo($V3([0.3,0.8,0.3])); 
	
	if(distance != undefined) {
		var posGoal = nodeCam.nodePivot.getPosition().add($V3([0.0,0.0,distance]));  
		nodeCam.nodeGoal.setPosition(posGoal);
		nodeCam.setController({'mode':'targetcam', 'distance':distance});      
	} else {
		nodeCam.setController({'mode':'freecam'});      
	}
	
	nodeCam.setProjectionType('p');
	
	return nodeCam;
};

/**
* Create line
* @returns {StormLine}
* @param {StormV3} vecOrigin Origin point
* @param {StormV3} vecEnd End point
* @param {StormV3} [vecOriginColor=$V3([1.0,1.0,1.0])] Color of origin point
* @param {StormV3} [vecEndColor=$V3([0.0,0.0,0.0])] Color of end point
*/
StormEngineC.prototype.createLine = function(vecOrigin, vecEnd, vecOriginColor, vecEndColor) {
	var cutLine = new StormLine();
	cutLine.idNum = this.lines.length;
	cutLine.name = 'line '+this.idxLines++;
	var material = stormEngineC.createMaterial();
	cutLine.materialUnits[0] = material; 
	this.lines.push(cutLine);
	
	cutLine.origin = vecOrigin;
	cutLine.end = vecEnd;
	
	var linesVertexArray = [];
	var linesVertexLocArray = [];
	var linesIndexArray = [];
	linesVertexArray.push(cutLine.origin.e[0], cutLine.origin.e[1], cutLine.origin.e[2], cutLine.end.e[0], cutLine.end.e[1], cutLine.end.e[2]);
	var v3OriginColor = (vecOriginColor != undefined) ? vecOriginColor : $V3([1.0,1.0,1.0]);
	var v3EndColor = (vecEndColor != undefined) ? vecEndColor : $V3([0.0,0.0,0.0]);
	linesVertexLocArray.push(v3OriginColor.e[0],v3OriginColor.e[1],v3OriginColor.e[2], v3EndColor.e[0],v3EndColor.e[1],v3EndColor.e[2]);
	linesIndexArray.push(0, 1);
		
	cutLine.vertexBuffer = this.stormGLContext.gl.createBuffer();
	this.stormGLContext.gl.bindBuffer(this.stormGLContext.gl.ARRAY_BUFFER, cutLine.vertexBuffer);
	this.stormGLContext.gl.bufferData(this.stormGLContext.gl.ARRAY_BUFFER, new Float32Array(linesVertexArray), this.stormGLContext.gl.STATIC_DRAW);
	
	cutLine.vertexLocBuffer = this.stormGLContext.gl.createBuffer();
	this.stormGLContext.gl.bindBuffer(this.stormGLContext.gl.ARRAY_BUFFER, cutLine.vertexLocBuffer);
	this.stormGLContext.gl.bufferData(this.stormGLContext.gl.ARRAY_BUFFER, new Float32Array(linesVertexLocArray), this.stormGLContext.gl.STATIC_DRAW);
	
	cutLine.indexBuffer = this.stormGLContext.gl.createBuffer();
	this.stormGLContext.gl.bindBuffer(this.stormGLContext.gl.ELEMENT_ARRAY_BUFFER, cutLine.indexBuffer);
	this.stormGLContext.gl.bufferData(this.stormGLContext.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(linesIndexArray), this.stormGLContext.gl.STATIC_DRAW);
	
	return cutLine;
};

/**
* Create light
* @returns {StormLight}
* @param	{Object} jsonIn
* 	@param {String} jsonIn.type 'sun' or 'spot' (Max 10 spots lights)
* 	@param {StormV3} jsonIn.position The position. (Only for spot lights)
* 	@param {Int} [jsonIn.color=5770] Color in kelvins(1000K-15000K)
* 	@param {StormV3} [jsonIn.color=5770] Color through vector
* 	@param {StormV3} [jsonIn.direction=$V3([0.01,-0.5,0.01])] The direction vector. (If type is 'sun' only direction option).
*/
StormEngineC.prototype.createLight = function(jsonIn) {
	var create = false;
	if(jsonIn.type == 'sun') {
		if(this.lights.length == 0) {
			create = true;
		} else {
			light = this.lights[0];
			light.visibleOnContext = true;
			light.visibleOnRender = true;
			light.nodeCtxWebGL.visibleOnContext = true;
			light.setProjectionType('o');  
			//light.mPMatrix = $M16().setOrthographicProjection(-150, 150, -150, 150, 0.0, 200.0); 
			light.setFov(45);
		}
	} else {
		create = true;
	}
	
	if(create) {
		var light = new StormLight();
		light.idNum = this.lights.length;
		light.name = 'light '+jsonIn.type+' '+this.idxLights++;
		var material = stormEngineC.createMaterial();
		light.materialUnits[0] = material; 
		this.lights.push(light); 
		
		light.nodeCtxWebGL = stormEngineC.createNode();//malla nodeCtxWebGL para luz 
		light.nodeCtxWebGL.visibleOnContext = true; 
		light.nodeCtxWebGL.visibleOnRender = false; 
		var meshCtxWebGL = new StormMesh();
		meshCtxWebGL.loadBox(light.nodeCtxWebGL, $V3([0.1,0.1,0.1])); 
		
		var mesh = new StormMesh();
		mesh.loadBox(light, $V3([0.03,0.03,0.03])); 
		
		light.type = jsonIn.type; // sun | spot
		light.setProjectionType('p');
	}
	 
	
										 
	if(jsonIn.color != undefined) {
		light.setLightColor(jsonIn.color);
	} else {
		light.setLightColor(5770);
	}
	light.nodeCtxWebGL.setAlbedo(light.color);  
	
	if(jsonIn.direction != undefined) {
		light.setDirection($V3([jsonIn.direction.e[0], jsonIn.direction.e[1], jsonIn.direction.e[2]]));
	}
	
	if(jsonIn.position != undefined) {
		light.setPosition($V3([jsonIn.position.e[0], jsonIn.position.e[1], jsonIn.position.e[2]]));
	}

	
			
	return light;
};

/**
* Create particles
* @returns {StormParticles}
*/
StormEngineC.prototype.createParticles = function() {
	var particle = new StormParticles();
	particle.idNum = this.particles.length;
	particle.name = 'particles '+this.idxParticles++;
	var material = stormEngineC.createMaterial();
	particle.materialUnits[0] = material; 
	this.particles.push(particle); 
	return particle;
};
/**
* Create polarity point
* @returns {StormPolarityPoint}
* @param	{Object} jsonIn
* 	@param {Int} [jsonIn.polarity=1] 1=positive 0=negative
* 	@param {Int} [jsonIn.orbit=0] Orbit mode (0 or 1)
* 	@param {Float} [jsonIn.force=0.5] The force.
*/
StormEngineC.prototype.createPolarityPoint = function(jsonIn) {
	var polarityPoint = new StormPolarityPoint(jsonIn);
	polarityPoint.idNum = this.polarityPoints.length;
	polarityPoint.name = 'polarityPoint '+this.idxPolarityPoint++;
	var material = stormEngineC.createMaterial();  
	polarityPoint.materialUnits[0] = material; 
	polarityPoint.loadSphere({color: polarityPoint.color, radius: 0.5});   
	this.polarityPoints.push(polarityPoint); 
	return polarityPoint;
};
/**
* Create force field
* @returns {StormForceField}
* @param	{Object} jsonIn
* 	@param {StormV3} [jsonIn.direction=$V3([0.0,-9.8,0.0])] The direction.
*/
StormEngineC.prototype.createForceField = function(jsonIn) {
	var forceField = new StormForceField(jsonIn);
	forceField.idNum = this.forceFields.length;
	forceField.name = 'forceField '+this.idxForceField++;
	var material = stormEngineC.createMaterial();
	forceField.materialUnits[0] = material; 
	this.forceFields.push(forceField); 
	return forceField;
};
/**
* Create gravity force 
* @returns {StormForceField}
*/
StormEngineC.prototype.createGravityForce = function() {   
	var forceField = new StormForceField();
	forceField.idNum = this.forceFields.length;
	forceField.name = 'gravityForce '+this.idxForceField++;  
	var material = stormEngineC.createMaterial();
	forceField.materialUnits[0] = material; 
	forceField.forceFieldType = 'gravity';
	forceField.updateJigLib();
	this.forceFields.push(forceField); 
	return forceField;
};
/**
* Create voxelizator
* @returns {StormVoxelizator}
*/
StormEngineC.prototype.createVoxelizator = function() {   
	var vox = new StormVoxelizator();
	vox.idNum = this.voxelizators.length;
	vox.name = 'voxelizator '+this.idxVoxelizators++; 
	this.voxelizators.push(vox); 
	return vox;
};
/**
* Mostrar progreso de una peticion XMLHttpRequest acompañado de un texto pasado en string.
* Una vez que req se encuentre en readyState == 4 hay que volver a llamar a esta funcion pasando solo string vacio para borrar lo que haya
* @private 
* @type Void
* @param	{Object} JSON
* 			<b>'id' : {String}</b> id <br>
* 			<b>'str' : {String}</b> direction <i>Optional, Default: ''</i> <br>
* 			<b>'req' : {XMLHttpRequest}</b> Show XHR progress 
*/
StormEngineC.prototype.setStatus = function(jsonIn) {
	var exist = false;
	for(var n = 0, f = this.statusValues.length; n < f; n++) {
		if(this.statusValues[n].id == jsonIn.id) {  
			this.statusValues[n] = jsonIn;
			exist = true; break;
		}
	} 
	if(jsonIn.str == "") { // update the array
		var tmpArr = [];
		for(var n = 0, f = this.statusValues.length; n < f; n++) {
			if(this.statusValues[n].str != '') tmpArr.push(this.statusValues[n]);
		}
		this.statusValues = tmpArr;
	} else if(exist == false) { // add the new value to the array
		this.statusValues.push({id:jsonIn.id, str:jsonIn.str});
	}
	
	var bars = 0, barsAcum = 0; 
	var ctx = stormEngineC.stormGLContext.ctx2DStatus; 
	ctx.clearRect(0, 0, this.stormGLContext.viewportWidth, this.stormGLContext.viewportHeight);
	for(var n = 0, f = this.statusValues.length; n < f; n++) { // messages
		ctx.fillStyle="#333";
		ctx.fillRect(0,0,stormEngineC.stormGLContext.viewportWidth,20);
		ctx.fillStyle = "#CCC";
		ctx.strokeStyle = "#FFF";
		ctx.font = 'italic bold 12px sans-serif';
		ctx.textBaseline = 'bottom';
		ctx.fillText(this.statusValues[n].str, 5, 18); 
		
		if(this.statusValues[n].reqProgress != undefined || this.statusValues[n].req != undefined) {
			bars++;
			if(this.statusValues[n].reqProgress == undefined) this.statusValues[n].reqProgress = 0.1;
		}
	}
	for(var n = 0, f = this.statusValues.length; n < f; n++) { // progress bars
		if(this.statusValues[n].reqProgress != undefined)
			barsAcum += (this.statusValues[n].reqProgress/bars);
	}
	ctx.fillStyle="#22ACAC";
	ctx.fillRect(0,0,barsAcum*stormEngineC.stormGLContext.viewportWidth,2);
	
	
	if(jsonIn.req != undefined) {
		jsonIn.req.onprogress = function(evt) {
			if(evt.lengthComputable) {
				var current = evt.loaded/evt.total;
				stormEngineC.setStatus({id:jsonIn.id, str: jsonIn.str, reqProgress:current});
			}
		};
	}
};

/**
* Add debug information for displaying values
* @type Void
* @param {Int} idx
* @param {StormM16|StormV3|Int|Float} value
* @param {String} [text=""]
*/
StormEngineC.prototype.setDebugValue = function(idx, value, string) {
	this.typeVector = value instanceof StormV3;
	this.typeMatrix = value instanceof StormM16;
	
	if(this.typeVector == true) {
		var v1 = value.e[0].toString().substr(0, 5);
		var v2 = value.e[1].toString().substr(0, 5);
		var v3 = value.e[2].toString().substr(0, 5);
		this.debugValues[idx] = '<b>'+string+':</b>	$V3(['+v1+',	'+v2+',	'+v3+'])<br />';
	} else if(this.typeMatrix == true) {
		var m00 = value.e[0].toString().substr(0, 5);
		var m01 = value.e[1].toString().substr(0, 5);
		var m02 = value.e[2].toString().substr(0, 5);
		var m03 = value.e[3].toString().substr(0, 5);
		
		var m10 = value.e[4].toString().substr(0, 5);
		var m11 = value.e[5].toString().substr(0, 5);
		var m12 = value.e[6].toString().substr(0, 5);
		var m13 = value.e[7].toString().substr(0, 5);
		
		var m20 = value.e[8].toString().substr(0, 5);
		var m21 = value.e[9].toString().substr(0, 5);
		var m22 = value.e[10].toString().substr(0, 5);
		var m23 = value.e[11].toString().substr(0, 5);
		
		var m30 = value.e[12].toString().substr(0, 5);
		var m31 = value.e[13].toString().substr(0, 5);
		var m32 = value.e[14].toString().substr(0, 5);
		var m33 = value.e[15].toString().substr(0, 5);
		
		this.debugValues[idx] = '<b>'+string+':</b>	<div align="right">$M16(['+m00+',	'+m01+',	'+m02+',	'+m03+',<br />'+m10+',	'+m11+',	'+m12+',	'+m13+',<br />'+m20+',	'+m21+',	'+m22+',	'+m23+',<br />'+m30+',	'+m31+',	'+m32+',	'+m33+'])</div>';
	} else {
		this.debugValues[idx] = '<b>'+string+':</b>	'+value.toString().substr(0, 5)+'<br />';
	}
};

/**
* Muestra los valores de debug almacenados
* @private
* @type Void
*/
StormEngineC.prototype.showDebugValues = function() {
	if(this.editMode) {
		this.debugResult = '';
		for(var n = 0; n < this.debugValues.length; n++) this.debugResult += this.debugValues[n];
		this.stormGLContext.divDebug.innerHTML  = this.debugResult;
	}
};

/**
* Clear the actual scene
* @type Void
*/
StormEngineC.prototype.clearScene = function() {
	stormEngineC.setWebGLpause(true);
	this.nodes = [];
	this.nodesCam = [];
	this.lines = [];
	this.lights = [];
	
	//TODO Borrar buffers contexto WebGL
	this.stormGLContext = new StormGLContext(this.target);
	this.loadManager();
	
	//this.go();
	stormEngineC.setWebGLpause(false);
};

/**
* Realiza un render (stormRender) basado en path tracing o EMR
* jsonIn{target, callback, mode}
* @private 
* @type Void
* @param	{Object} JSON
*			<b>'mode': {Int}</b> 0=PathTracing, 1=EMR Render <br>
*			<b>'target': {String}</b> ID target canvas. <i>Optional, Default: $V3([-0.5,-0.3,-0.5])</i> <br>
*			<b>'callback': function(){}</b> <br>
*			<b>'width': {Int}</b> <br>
*			<b>'height': {Int}</b> <br>
*			<b>'frameStart': {Int}</b> <br>
*			<b>'frameEnd': {Int}</b> <br>
*/
StormEngineC.prototype.renderFrame = function(jsonIn) {
	var modeRender = 0;
	if(jsonIn.mode == 1) {modeRender = 1;}
					
	if(window.WebCL == undefined) {
		alert('Your browser does not support experimental-nokia-webcl. See http://webcl.nokiaresearch.com/');
	} else {
		this.renderStop = false;
		
		this.pauseRender = false;
		switch(modeRender) {
			case 0:
				this.PanelAnimationTimeline.setFrame(jsonIn.frameStart);
				this.stormRender = new StormRender({'target':jsonIn.target,
													'callback':jsonIn.callback,
													'width':jsonIn.width,
													'height':jsonIn.height,
													'frameStart':jsonIn.frameStart,
													'frameEnd':jsonIn.frameEnd});
				break;
			case 1:
				this.PanelAnimationTimeline.setFrame(jsonIn.frameStart);
				this.stormRender = new StormRenderEMR({	'target':jsonIn.target,
														'callback':jsonIn.callback,
														'width':jsonIn.width,
														'height':jsonIn.height,
														'frameStart':jsonIn.frameStart,
														'frameEnd':jsonIn.frameEnd});
				break;
		}
		this.stormRender.setCam(this.defaultCamera);
		this.stormRender.makeRender();
		
		this.pause = true;
	}
	
};

/**
* Detiene el render stormRender
* @private 
* @type Void
*/
StormEngineC.prototype.renderFrameStop = function() {
	this.renderStop = true;
	
	this.pauseRender = true;
	clearTimeout(this.stormRender.timerRender);
	$('#DIVID_StormPanelCanvas_proc').html('STOPPED');
	//clCmdQueue.releaseCLResources();
	
	this.pause = false;
};

/**
* Get the WebGL context
* @returns {WebGLRenderingContext} WebGLRenderingContext
*/
StormEngineC.prototype.getWebGL = function() {
	return this.stormGLContext.gl;
};

/**
* Get the 2D context
* @returns {CanvasRenderingContext2D} CanvasRenderingContext2D
*/
StormEngineC.prototype.get2DContext = function() {
	return this.stormGLContext.ctx2D;
};
/**
* Update the 2D context
* @type Void
*/
StormEngineC.prototype.update2DContext = function() {
	this.stormGLContext.gl.pixelStorei(this.stormGLContext.gl.UNPACK_FLIP_Y_WEBGL, true);
	this.stormGLContext.gl.pixelStorei(this.stormGLContext.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	this.stormGLContext.gl.bindTexture(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.textureObject_Ctx2D);   
	this.stormGLContext.gl.texImage2D(this.stormGLContext.gl.TEXTURE_2D, 0, this.stormGLContext.gl.RGBA, this.stormGLContext.gl.RGBA, this.stormGLContext.gl.UNSIGNED_BYTE, this.stormGLContext.ctx2D.getImageData(0, 0, this.stormGLContext.viewportWidth, this.stormGLContext.viewportHeight));
	//this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_MAG_FILTER, this.stormGLContext.gl.LINEAR);
	this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_MIN_FILTER, this.stormGLContext.gl.LINEAR); //  not a power of 2
	this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_WRAP_S, this.stormGLContext.gl.CLAMP_TO_EDGE);
	this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_WRAP_T, this.stormGLContext.gl.CLAMP_TO_EDGE);
};
/**
* Define a hit region in the canvas area
* @returns {Int} id The id of the region object
* @param {Object} jsonIn
* 	@param {Int} jsonIn.x X pos.
* 	@param {Int} jsonIn.y Y pos.
* 	@param {Int} jsonIn.width Width.
* 	@param {Int} jsonIn.height Height.
* 	@param {Hex} jsonIn.fillStyle Fill color.
* 	@param {Hex} jsonIn.strokeStyle Stroke color.
* 	@param {Int} jsonIn.lineWidth Line width.
* 	@param {Function} jsonIn.onclick On click function.
* 	@param {Function} jsonIn.onmouseover On mouse over function.
* 	@param {Function} jsonIn.onmouseout On mouse out function.
*/
StormEngineC.prototype.addHitRectRegion = function(jsonIn) {
	var idx = this.idxHitsRectRegions;
	this.idxHitsRectRegions++;
	this.arrHitsRectRegions.push({	_id: idx,
									_over: false,
									x: jsonIn.x, y: jsonIn.y,
									width: jsonIn.width, height: jsonIn.height,
									onclick: jsonIn.onclick,
									onmouseover: jsonIn.onmouseover,
									onmouseout: jsonIn.onmouseout});
	
	var ctx;
	if(jsonIn.fillStyle != undefined || jsonIn.strokeStyle != undefined) {
		ctx = this.get2DContext();
		ctx.beginPath();
		ctx.rect(jsonIn.x,jsonIn.y,jsonIn.width,jsonIn.height);
		if(jsonIn.fillStyle != undefined) {
			ctx.fillStyle = jsonIn.fillStyle;
			ctx.fill();
		}
		if(jsonIn.strokeStyle != undefined) {
			if(jsonIn.lineWidth != undefined) ctx.lineWidth = jsonIn.lineWidth;
			ctx.strokeStyle = jsonIn.strokeStyle;
			ctx.stroke();
		}
		this.update2DContext();
	}
	
	return idx;
};
/**
* Remove a hit region in the canvas area
* @type Void
* @param {Int} id The id of the region object
*/
StormEngineC.prototype.removeHitRectRegion = function(idx) {
	var tmpArr = [];
	for(var n=0; n < this.arrHitsRectRegions.length; n++) if(this.arrHitsRectRegions[n]._id != idx) tmpArr.push(this.arrHitsRectRegions[n]);

	this.arrHitsRectRegions = tmpArr;
};

/**
* Set the visibility of the WebGL shadows
* @type Void
* @param {Bool} active
*/
StormEngineC.prototype.shadows = function(active) {
	this.stormGLContext.shadowsEnable = active;
};

/**
* Pause or unpause the execution.
* @type Void
* @param {Bool} pause Pause or unpause
*/
StormEngineC.prototype.setWebGLpause = function(pau) {
	if(stormEngineC.pause == false || (pau != undefined && pau == true)) {
		stormEngineC.pause = true;
		stormEngineC.setStatus({id:'paused', str:'PAUSED'});
	} else if(stormEngineC.pause == true || (pau != undefined && pau == false)) {
		stormEngineC.pause = false;
		stormEngineC.setStatus({id:'paused', str:''});
		//stormEngineC.stormRender.makeRender();
	}
};

/**
* Enable AO
* @type Void
* @param {Bool} enable Enable or disable AO
* @param {Float} level The level of AO
*/
StormEngineC.prototype.setWebGLSSAO = function(enable, level) {
	this.stormGLContext.SSAOenable = enable;
	if(level != undefined) {
		this.stormGLContext.SSAOlevel = 5-level;
	}
};

/**
* Enable GI
* @type Void
* @param {StormGI} gi The global illumination object
* @private
*/
StormEngineC.prototype.setWebGLGI = function(gi) {
	this.giv2 = gi;
	this.stormGLContext.stormVoxelizatorObject = this.giv2.svo;
	stormEngineC.stormGLContext.initShader_GIv2();
	stormEngineC.stormGLContext.initShader_GIv2Exec();  
}; 

/**
* WebGL environment map
* @type Void
* @param {String} fileURL File URL
*/
StormEngineC.prototype.setWebGLEnvironmentMap = function(fileURL) {
	this.stormGLContext.setWebGLEnvironmentMap(fileURL); 
};

/**
* Set the WebGL background. Disable by default.
* @type Void
* @param {String|StormV3} value 'transparent','environmentMap','ambientColor' or StormV3 color. <i>Default: 'ambientColor'</i>
*/
StormEngineC.prototype.setWebGLBackground = function(value) {
	this.stormGLContext.useBGTrans = false;
	this.stormGLContext.useBGSolid = false;
	this.stormGLContext.useBGAmbient = false; 
	
	if(value == 'transparent') {
		this.stormGLContext.useBGTrans = true;
	} else if(value == 'environmentMap') {
		this.stormGLContext.useEnvironment = true; 
	} else if(value == 'ambientColor') {
		this.stormGLContext.useBGAmbient = true; 
	} else {
		this.stormGLContext.useBGSolid = true;
		this.stormGLContext.useBGSolidColor = $V3([value.e[0],value.e[1],value.e[2]]);
	}
};

/**
* WebGL resize
* @type Void
* @param {Int} width The width
* @param {Int} height The height
*/
StormEngineC.prototype.setWebGLResize = function(width,height) {
	this.$.css('width','auto');
	this.$.css('height','auto');
	this.$.attr('width',width);
	this.$.attr('height',height);
	var dim = (this.$.width() > this.$.height()) ? this.$.width() : this.$.height();
	this.stormGLContext.viewportWidth = dim;
	this.stormGLContext.viewportHeight = dim;
	this.stormGLContext.updateInfoElements();
	$("#TABLEID_STORMMENU td").css({'width':parseInt(this.stormGLContext.viewportWidth/6)+'px', 
									'padding':'0px'});
	this.updateDivPosition();
	this.stormGLContext.updateTexturesFB(); 
};

/**
* Set the ambient color
* @type Void
* @param {StormV3} color Set the ambient color through a normalized vector
*/
StormEngineC.prototype.setAmbientColor = function(vec) {
	this.stormGLContext.ambientColor = vec;
};

/**
* Making a camera takes the view
* @type Void
* @param {StormCamera} cameraNode
*/
StormEngineC.prototype.setWebGLCam = function(nodeCam) {
	if(stormEngineC.defaultCamera != undefined) stormEngineC.defaultCamera.usedByGLContext = false;
	
	this.defaultCamera = nodeCam;
	this.defaultCamera.usedByGLContext = true;
};

/**
* Get the current active camera
* @returns {StormCamera} cameraNode Active camera node
*/
StormEngineC.prototype.getWebGLCam = function() {
	return this.defaultCamera;
};

var stormEngineC = new StormEngineC();
var $SEC = stormEngineC;

} else alert('Your browser does not support WebGL. Download <a href="http://www.mozilla.com/">Firefox</a> o <a href="http://www.google.es/chrome">Chrome</a>');

