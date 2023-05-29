import { Injectable } from '@angular/core';
import { SocketIoService } from './socket-io.service';
import { io } from "socket.io-client";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatInRoomService {
  private url = 'http://localhost:3000';  // 后台服务端口
  private socket: any;
  constructor()
  {
    this.socket = null;
  }
  join_room(roomName: string) {
    this.socket.emit("join room", roomName);
  }
  create_room(newRoom:string)
  {
    this.socket.emit('new room', newRoom);
  }
  getRooms():Observable<any>
  {
    return new Observable(observer => {
      if(this.socket)
      {
      }else
      {
        this.socket = io(this.url);
      }
      this.socket.on('getRooms', (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    })
  }
  setId():Observable<any>
  {
    return new Observable(observer => {
      if(this.socket)
      {
      }else
      {
        this.socket = io(this.url);
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
