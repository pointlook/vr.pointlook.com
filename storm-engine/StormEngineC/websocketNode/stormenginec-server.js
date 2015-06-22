var sys = require('sys');
var net = require('net');
var io = require('socket.io').listen(3400);

var nodesLength = 0;
var arrNetNodesIds = [];

io.sockets.on('connection', function (socket) {
  socket.on('getNetNodes', function (data) {
	for(var n = 0; n < arrNetNodesIds.length; n++) {
		if(arrNetNodesIds[n] == 1) {
			socket.emit('getNetNodesResponse', { // emite a propio cliente
				netID: n
			});
		}
	}
	
  });
  
  socket.on('newNetNode', function (data) {
	arrNetNodesIds.push(1);
	socket.set('netID', (arrNetNodesIds.length-1), function () { // store data associated with a client
		socket.emit('newNetNodeConnectionResponse', { // emite a propio cliente
			netID: (arrNetNodesIds.length-1)
		});
    });
	io.sockets.emit('newconnection', { // emite a todos los clientes
		netID: (arrNetNodesIds.length-1)
	});
	
  });
  
  socket.on('dataclient', function (data) {
	io.sockets.emit('serverNodeData', { // este emite a todos los clientes
		netID: data.netID,
		WM0: data.WM0,
		WM1: data.WM1,
		WM2: data.WM2,
		WM3: data.WM3,
		WM4: data.WM4,
		WM5: data.WM5,
		WM6: data.WM6,
		WM7: data.WM7,
		WM8: data.WM8,
		WM9: data.WM9,
		WM10: data.WM10,
		WM11: data.WM11,
		WM12: data.WM12,
		WM13: data.WM13,
		WM14: data.WM14,
		WM15: data.WM15,
		RM0: data.RM0,
		RM1: data.RM1,
		RM2: data.RM2,
		RM3: data.RM3,
		RM4: data.RM4,
		RM5: data.RM5,
		RM6: data.RM6,
		RM7: data.RM7,
		RM8: data.RM8,
		RM9: data.RM9,
		RM10: data.RM10,
		RM11: data.RM11,
		RM12: data.RM12,
		RM13: data.RM13,
		RM14: data.RM14,
		RM15: data.RM15
	});
    //sys.puts(data.nodeId) // escribir en la consola
  });
  
  
  
  socket.on('disconnect', function () {
    socket.get('netID', function (err, netID) {
		arrNetNodesIds[netID] = 0;
		io.sockets.emit('disconnectNetNode', { // este emite a todos los clientes
			netID: netID
		});
    });
  });
  
  
  socket.on('setPrincipalNetNode', function () {
    socket.get('netID', function (err, netID) {
		io.sockets.emit('setPrincipalNetNodeResponse', { // este emite a todos los clientes
			netID: netID
		});
    });
  });
  
  websocket = socket;
});
