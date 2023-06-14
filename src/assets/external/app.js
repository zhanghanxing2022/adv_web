const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http,
	{
		cors: {
			origin: "*"
		}
	});
// 用于存储房间和相关数据的对象
const rooms = {};

// 关于app.use(express.static(path));
// https://www.cnblogs.com/slovey/p/9213631.html#:~:text=app.use%20%28express.static%28_dirname%20%2B%20%27%2Fpublic%27%29%29%3B%20%2F%2F%E8%AE%BE%E7%BD%AE%E9%9D%99%E6%80%81%E6%96%87%E4%BB%B6%E7%9B%AE%E5%BD%95%20%E6%B3%A8%EF%BC%9A,%E5%B0%86%E9%9D%99%E6%80%81%E6%96%87%E4%BB%B6%E7%9B%AE%E5%BD%95%E8%AE%BE%E7%BD%AE%E4%B8%BA%E9%A1%B9%E7%9B%AE%E6%A0%B9%E7%9B%AE%E5%BD%95%20%2B%20%E2%80%98%2Fpublic%E2%80%99%EF%BC%8C%E5%8F%AF%E4%BB%A5%E8%BF%99%E6%A0%B7%E5%86%99%20app.use%20%28express.static%28path.join%20%28_dirname%2C%20%27public%27%29%29%29%3B
app.use(express.static('./'));
app.use(express.static('libs/'));

io.sockets.on('connection', function (socket) {
	socket.userData = { x: 0, y: 0, z: 0, heading: 0 };//Default values;

	console.log(`${socket.id} connected`);
	socket.emit('setId', { id: socket.id });

	socket.on('join room', function (data) {
		socket.userData.roomId = data.roomId;
		console.log(`${socket.id} join room ${data.roomId}`);
		// 检查房间是否存在，如果不存在则创建
		if (!rooms[roomId]) {
			rooms[roomId] = {
				// 初始化房间数据
				players: [],
				// 其他房间相关数据...
			};
		}
		socket.join(data.roomId);
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('deletePlayer', { id: socket.id });
		const currentRoom = Object.keys(rooms).find((roomId) => {
			return rooms[roomId].players.includes(socket);
		});

		// 如果找到了房间
		if (currentRoom) {
			// 将玩家从房间中移除
			rooms[currentRoom].players = rooms[currentRoom].players.filter((player) => {
				return player !== socket;
			});

			// 如果房间中没有其他玩家，则清除该房间
			if (rooms[currentRoom].players.length === 0) {
				delete rooms[currentRoom];
			}
		}
	});

	// 同步公共物体状态
	socket.on('commonObjectState', (state) => {
		// 查找玩家所在的房间
		const currentRoom = Object.keys(rooms).find((roomId) => {
			return rooms[roomId].players.includes(socket);
		});

		if (currentRoom) {
			// 在房间中处理公共物体状态数据
			// ...
		}
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

	socket.on('chat message', function (data) {
		console.log(`chat message:${data.id} ${data.message}`);
		io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
	})
});

http.listen(2002, function () {
	console.log('listening on *:2002');
});

// var socket_list;

setInterval(function () {
	// io.sockets.sockets在原来的文件夹中是json对象。
	// 我把代码移到另一个文件夹之后，io.sockets.sockets就变成Map了，得不到合理的解释。
	const nsp = io.of('/');
	let pack = {};
	let roomId_list = [];

	// socket_list = io.sockets.sockets;
	// console.log(socket_list);
	if (io.sockets.sockets instanceof Map) {
		io.sockets.sockets.forEach(function (socket, id, map) {
			//Only push sockets that have been initialised
			if (socket.userData.model !== undefined) {
				if (!pack.hasOwnProperty(socket.userData.roomId)) {
					pack[socket.userData.roomId] = [];
				}

				pack[socket.userData.roomId].push({
					id: socket.id,
					model: socket.userData.model,
					colour: socket.userData.colour,
					x: socket.userData.x,
					y: socket.userData.y,
					z: socket.userData.z,
					heading: socket.userData.heading,
					pb: socket.userData.pb,
					action: socket.userData.action
				});

				roomId_list.push(socket.userData.roomId);
			}
		});
	} else {
		for (let id in io.sockets.sockets) {
			const socket = nsp.connected[id];
			// console.log(id);
			//Only push sockets that have been initialised
			if (socket.userData.model !== undefined) {
				if (!pack.hasOwnProperty(socket.userData.roomId)) {
					pack[socket.userData.roomId] = [];
				}

				pack[socket.userData.roomId].push({
					id: socket.id,
					model: socket.userData.model,
					colour: socket.userData.colour,
					x: socket.userData.x,
					y: socket.userData.y,
					z: socket.userData.z,
					heading: socket.userData.heading,
					pb: socket.userData.pb,
					action: socket.userData.action
				});

				roomId_list.push(socket.userData.roomId);
			}
		}
	}

	let roomId_set = new Set(roomId_list);
	for (let roomId of roomId_set) {
		// console.log(`broadcast pack ${roomId}`);
		io.in(roomId).emit('remoteData', pack[roomId]);
	}

	// if (pack.length>0) io.emit('remoteData', pack);
	// console.log(pack.length);

}, 40);

// setInterval(function(){
// 	socket_list.forEach(function (socket, id, socket_list) {
// 		console.log(id);
// 		console.log(socket.userData);
// 		console.log('========');
// 	})
// }, 4000);