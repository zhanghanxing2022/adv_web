import { Component, OnInit, ViewChild, ViewRef } from '@angular/core';
import { io, Socket } from 'socket.io-client';
export interface ChatMessage {
  name: string;
  mess: string;
  type:string;
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
  my_room ="";
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
          mess: data.message,
          type:data.type
        }
      )
      this.new_mess_author = data.id;
      this.new_mess_text =data.type==="img"?"//img":  data.message;
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
    this.my_room = roomName;
    this.socket.emit('join room', roomName);
    this.begin_game();
  }
  begin_game()
  {
    sessionStorage.setItem("roomId",this.my_room);
    this.room.nativeElement.style.display = "none";
    this.game.nativeElement.style.display = "";
    this.game.nativeElement.src = this.gameSrc;
  }
  create_room() {
    if (this.newRoom)
    {
      this.my_room = this.newRoom;
      this.socket.emit('new room', this.newRoom);
    }
      
    
  }
  send_message() {
    if (this.mess) {
      this.socket.emit('chat message',
        { id: "zhx", message: this.mess ,type:"text"});
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
  
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
  
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // 在这里处理提取到的 base64 编码
        this.socket.emit('chat message',
        { id: "zhx", message: base64data ,type:"img"});
      };
  
      reader.readAsDataURL(file);
    } else {
      // 处理非图片类型的文件
      window.alert("无法上传非图片数据");
    }
  }
  

  onImageLoad(event: Event) {
    const imgElement = event.target as HTMLImageElement;
  
    // 获取图片的原始宽度和高度
    const originalWidth = imgElement.naturalWidth;
    const originalHeight = imgElement.naturalHeight;
  
    // 根据需要调整的尺寸限制，计算合适的宽度和高度
    const maxWidth = 200; // 限制图片的最大宽度为 200px
    const maxHeight = 200; // 限制图片的最大高度为 200px
  
    let width, height;
  
    if (originalWidth > maxWidth || originalHeight > maxHeight) {
      // 计算调整后的宽度和高度
      const widthRatio = maxWidth / originalWidth;
      const heightRatio = maxHeight / originalHeight;
      const scaleFactor = Math.min(widthRatio, heightRatio);
  
      width = originalWidth * scaleFactor;
      height = originalHeight * scaleFactor;
    } else {
      // 如果图片尺寸未超过限制，则使用原始尺寸
      width = originalWidth;
      height = originalHeight;
    }
  
    // 设置图片元素的宽度和高度
    imgElement.style.width = `${width}px`;
    imgElement.style.height = `${height}px`;
  }
  


}
