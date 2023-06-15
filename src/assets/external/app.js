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

<<<<<<< Updated upstream
=======
function loadScene1() {
	let valList = [1, 2, 3, 4, 5, 6, 7, 8];
	valList.sort(function () { return Math.random() > 0.5 ? -1 : 1; });
	let state = {};
	state.valList = valList.concat();
	state.cur_ins = 0;
	state.state = "free";
	state.instruction = undefined;
	state.finish_num = 0;
	return state;
}
>>>>>>> Stashed changes

io.sockets.on('connection', function (socket) {
	socket.userData = { x: 0, y: 0, z: 0, heading: 0 };//Default values;

	console.log(`${socket.id} connected`);
	socket.emit('setId', { id: socket.id });

	socket.on('join room', function (data) {
		socket.userData.roomId = data.roomId;
		console.log(`${socket.id} join room ${data.roomId}`);
		// 检查房间是否存在，如果不存在则创建
		if (!rooms[data.roomId]) {
			rooms[data.roomId] = {
				// 初始化第一个玩家
				players: [socket.id],
				// 初始化场景状态
				scene1: {}

			};

			rooms[data.roomId]["scene1"] = loadScene1();
		} else {
			rooms[data.roomId].players.push(socket.id);
		}
		socket.join(data.roomId);
	});
	socket.on("scene1 getCurrent",function()
	{

	})
	socket.on('disconnect', function () {
		socket.broadcast.emit('deletePlayer', { id: socket.id });
		
			console.log(`${socket.id} disconnected`);
		
		// 将玩家从房间中移除
		rooms[socket.userData.roomId].players = rooms[socket.userData.roomId].players.filter((player) => {
			return player !== socket.id;
		});

		// 如果房间中没有其他玩家，则清除该房间
		if (rooms[socket.userData.roomId].players.length === 0) {
			delete rooms[socket.userData.roomId];
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
		socket.userData.name = data.name;
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

	socket.on('scene1 getCurrent', function (data) {
		console.log(`${socket.id} scene1 getCurrent`);
		io.to(socket.id).emit('scene1 sendCurrent', rooms[data.roomId]["scene1"]);
	})

	socket.on('scene1 request', function (data) {
		rooms[data.roomId]["scene1"]["finish_num"] = 0;
		rooms[data.roomId]["scene1"]["state"] = "busy";
		rooms[data.roomId]["scene1"]["instruction"] = data.instruction;

		if (data.instruction == "shuffle") {
			rooms[data.roomId]["scene1"] = loadScene1();
		}

		io.in(data.roomId).emit('scene1 sendCurrent', rooms[data.roomId]["scene1"]);
	});

	socket.on('scene1 i finish', function(data) {
			console.log(`scene i finish ${socket.id}`);
		rooms[data.roomId]["scene1"]["finish_num"]++;
		if (rooms[data.roomId]["scene1"]["finish_num"] == rooms[data.roomId]["players"].length) {

				console.log(`scene all finish`);
			rooms[data.roomId]["scene1"]["finish_num"] = 0;
			rooms[data.roomId]["scene1"]["state"] = "free";
			if (rooms[data.roomId]["scene1"]["instruction"] == "next") {
				rooms[data.roomId]["scene1"]["cur_ins"]++;
			} else {
				rooms[data.roomId]["scene1"]["cur_ins"] = 0;
			}
			rooms[data.roomId]["scene1"]["instruction"] = undefined;
			io.in(data.roomId).emit('scene1 sendCurrent', rooms[data.roomId]["scene1"]);
		}
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
					name:socket.userData.name,
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
					name:socket.userData.name,
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