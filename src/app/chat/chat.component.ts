import { Component, OnInit, ViewChild, ViewRef } from '@angular/core';
import { io, Socket } from 'socket.io-client';
export interface ChatMessage {
  name: string;
  mess: string;
}
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild("bubble") bubble: any;
  @ViewChild("drawer") drawer: any;
  @ViewChild("game") game: any;
  @ViewChild("room") room: any;
  roomList: string[] = ["123", "1233"];
  player_id = 0;
  newRoom: string = "";
  new_mess_author = "";
  new_mess_text = "";
  gameSrc = '../../assets/external/index.html';
  messList: ChatMessage[] = [];
  mess = "";
  timeout!: NodeJS.Timeout;
  bubbleOpen = true;
  private url = 'http://localhost:3000';  // 后台服务端口
  private socket: Socket;
  constructor() {
    this.socket = io(this.url, {
      transports: ["websocket"]
    });
    console.log(this.socket);

  }
  ngOnInit(): void {
    this.socket.on("connect", () => {
      console.log(this.socket.disconnected); // false
    });

    this.socket.on("disconnect", () => {
      console.log(this.socket.disconnected); // true
    });
    this.socket.on('rooms', (data) => {
      this.roomList = data;
    });
    this.socket.on('setId', (data: any) => {
      this.player_id = data.id;
    });
    this.socket.on('chat message', (data) => {
      this.messList.push(
        {
          name: data.id,
          mess: data.message
        }
      )
      this.new_mess_author = data.id;
      this.new_mess_text = data.message;
      this.showBubble();
    })


  }
  ngAfterViewInit(): void {
    // let box1=document.getElementById('box1');
    // console.log(box1?.innerHTML);
    // let box2=document.getElementById('box2');
    // console.log(box2?.innerText);
    console.log(this.drawer);
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    // 在Angular组件中的ngOnInit或其他适当的生命周期钩子中添加以下代码
    window.addEventListener('message', this.handleMessage.bind(this));
    this.closeBubble();
  }

  handleMessage(event: MessageEvent) {
    if (event.data === 'keydown:esc') {
      this.drawer.toggle(); // 调用显示/隐藏弹窗的函数
    }
  }
  handleKeyDown(event: KeyboardEvent) {
    // 检查按下的按键是否为 Esc 键，keyCode 27 表示 Esc 键
    if (event.code === "Escape") {
      this.drawer.toggle(); // 调用显示/隐藏弹窗的函数
    }
  }
  join_room(roomName: string) {
    console.log(roomName);
    this.socket.emit('join room', roomName);
  }
  create_room() {
    if (this.newRoom)
      this.socket.emit('new room', this.newRoom);
    this.room.nativeElement.style.display = "none";
    this.game.nativeElement.style.display = "";
    this.game.nativeElement.src = this.gameSrc;
  }
  send_message() {
    if (this.mess) {
      this.socket.emit('chat message',
        { id: "zhx", message: this.mess });
      this.mess = "";
    }
    this.showBubble();
  }
  showBubble() {
    console.log(this.drawer._opened)

    if (this.drawer._opened) {

    }
    else {
      this.bubble.nativeElement.style.transform = "translateY(-50px)";
      // this.bubble.nativeElement.style.animation="tada 1.5s";
      // this.bubble.nativeElement.style['animation-play-state']="running";
      if (this.timeout)
        clearTimeout(this.timeout);
      this.timeout = setTimeout(
        () => {
          this.closeBubble(),
          console.log("close")
        }
        , 1000
      );
      this.bubbleOpen = true;
    }


  }
  closeBubble() {
    if (this.bubbleOpen) {
      this.bubble.nativeElement.style.transform = "translateY(50px)";
    }
    this.bubbleOpen = false;

  }




}
