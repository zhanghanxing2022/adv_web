import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Server, Socket } from "socket.io";
import { SocketId, Room } from "socket.io-adapter";
export class ChatPackage {
	name = "";
	message = "";
};
export class PlayerPackage {
	model = "";
	colour = "";
	x = 0;
	y = 0;
	z = 0;
	heading = 0;
	pb = 0;
	action = "";
}
@Injectable({
	providedIn: 'root'
})

export class SocketIoService {

	private io!: Server;
	private roomList: Array<string> = [];
	constructor() {
		this.io = new Server();
		this.io.listen(3000);
		const that = this;
		this.io.on('connection', function (socket) {
			socket.data["chat"] = new ChatPackage();
			socket.data["player"] = new PlayerPackage();//Default values;
			socket.emit("getRooms", that.roomList);

			socket.emit('setId', { id: socket.id });
			console.log('a user connected ');
			that.io.emit('rooms', that.getRooms('connected'));
			socket.on('disconnect', function () {
				socket.broadcast.emit('deletePlayer', { id: socket.id });
			});

			socket.on('new room', function (room: string) {
				console.log(`A new room is created ${room}`);
				that.roomList.push(room);
				socket.data["room"] = room;
				socket.join(room);
				that.io.emit('rooms', that.getRooms('new room'));
				that.io.emit("getRooms", that.roomList)
			});

			socket.on('join room', function (room) {
				console.log(`A new user joined room ${room}`);
				socket.data["room"] = room;
				socket.join(room);
				that.io.emit('rooms', that.getRooms('joined room'));
				that.io.emit("getRooms", that.roomList)
			});

			socket.on('chat message', function (data) {
				console.log(`chat message:${data.id} ${data.message}`);
				that.io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
			});

			socket.on('set username', function (name) {
				console.log(`username set to ${name}(${socket.id})`);
				socket.data['chat'].name = name;
			});

			socket.on('init', function (data) {
				console.log(`socket.init ${data.model}`);
				socket.data['player'].model = data.model;
				socket.data['player'].colour = data.colour;
				socket.data['player'].x = data.x;
				socket.data['player'].y = data.y;
				socket.data['player'].z = data.z;
				socket.data['player'].heading = data.h;
				socket.data['player'].pb = data.pb,
					socket.data['player'].action = "Idle";
			});

			socket.on('update', function (data) {
				socket.data['player'].x = data.x;
				socket.data['player'].y = data.y;
				socket.data['player'].z = data.z;
				socket.data['player'].heading = data.h;
				socket.data['player'].pb = data.pb,
					socket.data['player'].action = data.action;
			});
		});
	}
	getRooms(msg: string) {
		const nsp = this.io.of('/');
		const rooms: Map<Room, Set<SocketId>> = nsp.adapter.rooms;
		return rooms;
	}
	arrayDiff<T>(arr1:Array<T>, arr2:Array<T>) {
		var set2 = new Set(arr2);
		var subset=new Array<T>();
		arr1.forEach(function(val, index) {
			if (!set2.has(val)) {
				subset.push(val);
			}
		});
		return subset;
	};
	boardcast()
	{
		const that = this;
		setInterval(function(){
			const nsp = that.io.of('/');
			const rooms = nsp.adapter.rooms;
			let to_delete =[]
		
			for(let roomId in  that.roomList)
			{
				let pack = [];
				let data_room="";
		
				const room = rooms.get( that.roomList[roomId]);
				
				if(room==undefined)
				{
					to_delete.push( that.roomList[roomId]);
				}else if( room.size==0)
				{
					to_delete.push( that.roomList[roomId]);
				}else { 
					for(let socketId in room){
					
						const socket = nsp.sockets.get(socketId);
						data_room = socket?.data['room'];
					//Only push sockets that have been initialised
						if (socket?.data['player']!==undefined&& socket.data['player'].model!==undefined){
							pack.push({
								id: socket.id,
								name:socket.data['chat'].name,
								model: socket.data['player'].model,
								colour: socket.data['player'].colour,
								x: socket.data['player'].x,
								y: socket.data['player'].y,
								z: socket.data['player'].z,
								heading: socket.data['player'].heading,
								pb: socket.data['player'].pb,
								action: socket.data['player'].action
							});    
						}
					}
					that.io.in(data_room).emit('remoteData', pack);
				}
			  }
			  console.log("to_delete",to_delete);
			  that.roomList = that.arrayDiff<string>(that.roomList,to_delete)
			  if(to_delete.length>0)
			  {
				that.io.emit("getRooms",that.roomList)
			  }
		  }, 40);
	}

}
