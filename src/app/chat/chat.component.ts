import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { ChatInRoomService } from '../chat-in-room.service';
import { SocketIoService } from '../socket-io.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit{
  roomList:Array<string>=[];
  player_id=0;
  newRoom:string="";
  constructor(private chatInRoomService:ChatInRoomService) {
  }
  ngOnInit(): void {

    const that = this;
    this.chatInRoomService.getRooms().subscribe(
      (roomList)=>this.roomList = roomList
    )
    this.chatInRoomService.setId().subscribe
    (
      (id)=>this.player_id = id
    )
    // this.socket.on('setId', function(data){
    //   that.player_id = data.id;
    //   console.log("aaa")
    //   console.log(data)
    // });
    // this.socket.emit('set username',
    // // sessionStorage.getItem('userID')
    // "zhx"
    // );
    
  }
  join_room(roomName: string) {
    
  }
  create_room()
  {
    this.chatInRoomService.create_room(this.newRoom);
  }
  
  


}
