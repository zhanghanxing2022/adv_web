const express = require('express');
const app = express();
const http = require('http').Server(app,
	{
		cors: {
			origin: "http://localhost:4200"
		}
	});
const io = require('socket.io')(http);
const util = require('util');
http.listen(3000, function () {
	console.log('listening on *:3000');
});

var roomList = [];
var packList = [];
var a = 0;
io.on('connection', function (socket) {
	console.log(a);
	a+=1;
	socket.username = "";
	socket.userData = { x: 0, y: 0, z: 0, heading: 0 };//Default values;
	socket.emit("getRooms", roomList)
	socket.emit('setId', { id: socket.id });
	console.log('a user connected ');

	io.emit('rooms', getRooms('connected'));


	socket.on('disconnect', function () {
		socket.broadcast.emit('deletePlayer', { id: socket.id });
	});

	socket.on('new room', function (room) {
		console.log(`A new room is created ${room}`);
		roomList.push(room);
		socket.room = room;
		socket.join(room);
		io.emit('rooms', getRooms('new room'));
		io.emit("getRooms", roomList)
	});

	socket.on('join room', function (room) {
		console.log(`A new user joined room ${room}`);
		socket.room = room;
		socket.join(room);
		io.emit('rooms', getRooms('joined room'));
		io.emit("getRooms", roomList)
	});

	socket.on('chat message', function (data) {
		console.log(`chat message:${data.id} ${data.message}`);
		io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
	});

	socket.on('set username', function (name) {
		console.log(`username set to ${name}(${socket.id})`);
		socket.username = name;
	});

	socket.on('init', function (data) {
		console.log(`socket.init ${data.model}`);
		socket.userData.model = data.model;
		socket.userData.colour = data.colour;
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
			socket.userData.action = "Idle";
	});

	socket.on('update', function (data) {
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
			socket.userData.action = data.action;
	});
});



function arrayDiff(arr1, arr2) {
	var set2 = new Set(arr2);
	var subset = [];
	arr1.forEach(function (val, index) {
		if (!set2.has(val)) {
			subset.push(val);
		}
	});
	return subset;
};

setInterval(function () {
	const nsp = io.of('/');
	const rooms = nsp.adapter.rooms;
	/*Returns data in this form
	{
		'roomid1': { 'socketid1', socketid2', ...},
		...
	}
	
	*/
	// console.log('getRooms rooms>>' + util.inspect(rooms));
	console.log('getRooms roomList>>' + util.inspect(roomList));
	let to_delete = []

	for (let roomId in roomList) {
		let pack = [];
		let data_room = "";

		const room = rooms[roomList[roomId]];

		console.log(roomList[roomId]);
		if (room == undefined) {

			to_delete.push(roomList[roomId]);
		} else if (room.sockets.length == 0) {
			to_delete.push(roomList[roomId]);
		} else {
			for (let socketId in room.sockets) {

				const socket = nsp.connected[socketId];
				data_room = socket.room;
				//Only push sockets that have been initialised
				if (socket.userData !== undefined && socket.userData.model !== undefined) {
					pack.push({
						id: socket.id,
						name: socket.username,
						model: socket.userData.model,
						colour: socket.userData.colour,
						x: socket.userData.x,
						y: socket.userData.y,
						z: socket.userData.z,
						heading: socket.userData.heading,
						pb: socket.userData.pb,
						action: socket.userData.action
					});
				}
			}
			io.in(data_room).emit('remoteData', pack);
		}
	}
	console.log("to_delete", to_delete);
	roomList = arrayDiff(roomList, to_delete)
	if (to_delete.length > 0) {
		io.emit("getRooms", roomList)
	}
}, 40);

function getRooms(msg) {
	const nsp = io.of('/');
	const rooms = nsp.adapter.rooms;
	/*Returns data in this form
	{
		'roomid1': { 'socketid1', socketid2', ...},
		...
	}
	*/
	//console.log('getRooms rooms>>' + util.inspect(rooms));
	const list = {};
	for (let roomId in rooms) {
		const room = rooms[roomId];
		if (room === undefined) continue;
		const sockets = [];
		let roomName = "";
		//console.log('getRooms room>>' + util.inspect(room));
		for (let socketId in room.sockets) {
			const socket = nsp.connected[socketId];
			if (socket === undefined || socket.username === undefined || socket.room === undefined) continue;
			//console.log(`getRooms socket(${socketId})>>${socket.username}:${socket.room}`);
			sockets.push(socket.username);
			if (roomName == "") roomName = socket.room;
		}
		if (roomName != "") list[roomName] = sockets;
	}

	console.log(`getRooms: ${msg} >>` + util.inspect(list));

	return list;
}