import { Injectable } from '@angular/core';
import { io, Socket } from "socket.io-client";
import { Observable } from 'rxjs';
import { ChatMessage } from './chat/chat.component';
@Injectable({
  providedIn: 'root'
})
class ChatInRoomService {
  private url = 'http://localhost:3000';  // 后台服务端口
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
  create_room(newRoom: string):boolean {
    this.socket.emit('new room', newRoom);
    return true;
  }
  getRooms(): Observable<string[]> {
    return new Observable(observer => {

      this.socket.on('rooms', (data: string[]) => {
        console.log(data);
        observer.next(data);

      });
    })
  }
  getMessage(): Observable<ChatMessage> {
    return new Observable(observer => {
      this.socket.on('chat message', (data: ChatMessage) {
        observer.next(data);
      },)
    })
  }
  send_message(data:ChatMessage){
    this.socket.emit('chat message',data);
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
