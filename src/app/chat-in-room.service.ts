import { Injectable } from '@angular/core';
import { io, Socket } from "socket.io-client";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
class ChatInRoomService {
  private url = 'ws://localhost:3000';  // 后台服务端口
  private socket: Socket;
  constructor() {
    this.socket = io(this.url, {
      transports: ["websocket"]
    });
    console.log(this.socket);
    this.socket.on("connect", () => {
      console.log(this.socket.disconnected); // false
    });

    this.socket.on("disconnect", () => {
      console.log(this.socket.disconnected); // true
    });
  }
  join_room(roomName: string) {
    this.socket.connect();
    this.socket.emit("join room", roomName);
    
  }
  create_room(newRoom: string) {
    this.socket.connect();
    console.log("emit new room");
    this.socket.emit('new room', newRoom);
  }
  getRooms(): Observable<Map<string,Set<string>>> {
    return new Observable(observer => {
      if (!this.socket.connected) {
        this.socket.connect();
        console.log("try connect");
      }
      this.socket.on('rooms', (data: Map<string,Set<string>>) => {
        console.log(data);
        observer.next(data);
        
      });
      return () => {
        this.socket.disconnect();
      }
    })
  }
  setId(): Observable<any> {
    return new Observable(observer => {
      if (!this.socket.connected) {
        this.socket.connect();
        console.log("try connect");
      }
      this.socket.on('setId', (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    })
  }



}
