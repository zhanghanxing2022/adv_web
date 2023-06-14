const express = require('express');
const app = express();
const http = require('http').Server(app,
	{
		cors: {
			origin: "*"
		}
	});
const io = require('socket.io')(http);
const util = require('util');
http.listen(3000, function () {
	console.log('listening on *:3000');
});

var packList = [];
var a = 0;
io.on('connection', function (socket) {
	console.log(socket.id);
	a+=1;
	socket.username = "";
	socket.userData = { x: 0, y: 0, z: 0, heading: 0 };//Default values;
	socket.emit('setId', { id: socket.id });
	console.log('a user connected ');

	io.emit('rooms', getRooms());

	socket.on('rooms',function()
	{
		io.emit('rooms',getRooms())
	})
	socket.on('disconnect', function () {
		socket.broadcast.emit('deletePlayer', { id: socket.id });
	});

	socket.on('new room', function (room) {
		console.log(`A new room is created ${room}`);
		socket.room = room;
		socket.join(room);
		io.emit('rooms', getRooms());
	});

	socket.on('join room', function (room) {
		console.log(`A new user joined room ${room}`);
		socket.room = room;
		socket.join(room);
		io.emit('rooms', getRooms());
	});

	socket.on('chat message', function (data) {
		console.log(`chat message:${data.id} ${data.message}`);
		io.in(socket.room).emit('chat message', { id: data.id, message: data.message ,type:data.type});
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


setInterval(function () {
	const nsp = io.of('/');
	const rooms = nsp.adapter.rooms;
	io.emit("rooms", getRooms());
	console.log(util.inspect(rooms));

	rooms.forEach((key,val)=>{
		if(key.has(val)&&key.size==1)
		{
			return
		}else
		{
			let pack = [];

			key.forEach((socketId)=>
			{
				const socket = nsp.sockets.get(socketId);
				if (socket?.userData!==undefined&& socket.userData.model!==undefined){
					pack.push({
						id: socket.id,
						name:socket.username,
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
			});
			io.in(val).emit('remoteData', pack);
		}
	})
},40);

function getRooms() {
	const nsp = io.of('/');
	const rooms= nsp.adapter.rooms;
	res=[];
	rooms.forEach((key,val)=>{
		
		if(key.has(val)&&key.size==1)
		{
			return
		}else
		{
			res.push(val);
		}
	})
	return res;
}