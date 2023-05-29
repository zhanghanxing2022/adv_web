import { Injectable } from '@angular/core';
import { SocketIoService } from './socket-io.service';
import { io } from "socket.io-client";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChatInRoomService {
  socket;
  constructor(private socketServer:SocketIoService) { 
    this.socket = io("localhost:3000");
    this.socket.connect();
  }
  join_room(roomName:string)
  {
    this.socket.emit("join room",roomName);
  }
  
  

}
