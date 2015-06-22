var sys = require('sys');
var net = require('net');
var io = require('socket.io').listen(3400,{
	//'heartbeats': false,
	'heartbeat timeout': 900,
	'heartbeat interval': 400,
	//'polling duration': 300,
	'close timeout': 900
});


var nodesLength = 0;
var arrNetNodesIds = [];
var hostHold = 0;
var checkNodeIdNum = 1;
io.sockets.on('connection', function (socket) {
	//socket.broadcast.emit('xxx', { // emite a todos los clientes excepto yo
	//io.sockets.emit('xxx', { // emite a todos los clientes
	//socket.emit('xxx', { // emite a propio cliente
		
	socket.on('newNetNode', function (data) {
		arrNetNodesIds.push(1);
		socket.set('netID', (arrNetNodesIds.length-1), function () { // store data associated with a client
			socket.emit('newNetNodeConnectionResponse', {
				netID: (arrNetNodesIds.length-1)
			});
		});
		io.sockets.emit('newconnection', {
			netID: (arrNetNodesIds.length-1)
		});
		
	});

	socket.on('getNetNodes', function (data) {
		for(var n = 0; n < arrNetNodesIds.length; n++) {
			if(arrNetNodesIds[n] == 1) {
				socket.emit('getNetNodesResponse', {
					netID: n
				});
			}
		}
		
	});
	socket.on('loop', function (data) {
		loopp();
	});
  
  
  
	socket.on('setFrameTotalColorX', function (data) {
		socket.broadcast.emit('setFrameTotalColorXResponse', {
			netID: data.netID,
			frameNumber: data.frameNumber,
			arrayTotalColorX: data.arrayTotalColorX,
			width: data.width,
			height: data.height,
			offset: data.offset
		});
	});
	socket.on('setFrameTotalColorY', function (data) {
		socket.broadcast.emit('setFrameTotalColorYResponse', {
			netID: data.netID,
			frameNumber: data.frameNumber,
			arrayTotalColorY: data.arrayTotalColorY,
			offset: data.offset
		});
	});
	socket.on('setFrameTotalColorZ', function (data) {
		socket.broadcast.emit('setFrameTotalColorZResponse', {
			netID: data.netID,
			frameNumber: data.frameNumber,
			arrayTotalColorZ: data.arrayTotalColorZ,
			offset: data.offset
		});
	});
	socket.on('setFrameTotalShadow', function (data) {
		socket.broadcast.emit('setFrameTotalShadowResponse', {
			netID: data.netID,
			frameNumber: data.frameNumber,
			arrayTotalShadow: data.arrayTotalShadow,
			offset: data.offset
		});
	});
	socket.on('setFrameSample', function (data) {
		socket.broadcast.emit('setFrameSampleResponse', {
			netID: data.netID,
			frameNumber: data.frameNumber,
			arraySample: data.arraySample
		});
	});
  
  
  
	socket.on('disconnect', function () {
		socket.get('netID', function (err, netID) {
			arrNetNodesIds[netID] = 0;
			io.sockets.emit('disconnectNetNode', {
				netID: netID
			});
		});
	});
  
	socket.on('hostUnhold', function (data) {
		hostHold = 0;
		if(data.nextFrame == 1) {
			io.sockets.emit('nextFrame', {
				netID: checkNodeIdNum
			});
		}
		checkNodeIdNum++
		loopp(); 
	});
	
	socket.on('getRenderDimensions', function (data) {
		io.sockets.emit('getRenderDimensionsResponse', {
			netID: data.netID
		});
	});
	socket.on('sendRenderDimensions', function (data) {
		io.sockets.emit('sendRenderDimensionsResponse', {
			netID: data.netID,
			width: data.width,
			height: data.height,
			camMatrixFrames: data.camMatrixFrames
		}); 
	});
	
	loopp = function() {
		if(checkNodeIdNum >= arrNetNodesIds.length) checkNodeIdNum = 1; 
		if(arrNetNodesIds[checkNodeIdNum] == 1) {
			hostHold = 1;
			io.sockets.emit('getFrame', {
				netID: checkNodeIdNum
			});
		}
	}
	
	
	websocket = socket;
});
