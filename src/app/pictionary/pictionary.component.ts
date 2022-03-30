import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

const LENGTH = 5; // Length of the Room ID

const generateID = () => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < LENGTH; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

@Component({
  selector: 'app-pictionary',
  templateUrl: './pictionary.component.html',
  styleUrls: ['./pictionary.component.scss']
})
export class PictionaryComponent implements AfterViewInit {

  ws: WebSocket;
  roomId: string;

  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  canvasWidth: number = 100;
  canvasHeight: number = 100;

  @ViewChild('myCanvas') canvasRef?: ElementRef;

  players: string[] = [];
  artist: string = "";

  drawing: boolean = false;

  cursorX: string = "0px";
  cursorY: string = "0px";

  constructor() {

    this.roomId = generateID();

    this.canvasWidth = Math.floor(screen.availWidth / 1.5);
    this.canvasHeight = Math.floor(screen.availWidth / 3);

    this.ws = new WebSocket('ws://192.168.1.15:8080');

    this.ws.onopen = () => {
      console.log("Test");
      this.ws.send("s:h:" + this.roomId + ":screen");
      // setServerState('Connected to the server')
      // setDisableButton(false);
    };
    this.ws.onclose = (e: CloseEvent) => {
      // setServerState('Disconnected. Check internet or server.')
      // setDisableButton(true);
      console.log(e);
    };
    this.ws.onerror = (e: Event) => {
      console.log(e);
      // setServerState(e.message);
    };
    this.ws.onmessage = (e: MessageEvent<any>) => {
      console.log(e);
      if (e.data.split(":").length > 1) {
        console.log(e.data)
        let playerNum = this.players.indexOf(e.data.split(":")[0]);
        if(playerNum !== -1) {
          //this.players[playerNum].xcusor = Number.parseFloat(e.data.split(":")[2].split(",")[0])
          //this.players[playerNum].ycursor = Number.parseFloat(e.data.split(":")[2].split(",")[1]);
          //this.moveCursor(Number.parseFloat(e.data.split(":")[2].split(",")[0]), Number.parseFloat(e.data.split(":")[2].split(",")[1]), playerNum);
        }
        else {
          this.players.push(e.data.split(":")[0])
        //this.moveCursor(this.players[this.players.length - 1].xlast, this.players[this.players.length - 1].ylast, this.players.length - 1);
        }

        if(this.ctx) {
          let x: number = e.data.split(":")[2].split(",")[0] * this.canvasWidth;
          let y: number = e.data.split(":")[2].split(",")[1] * this.canvasHeight
          this.cursorX = (x + 10) + "px";
          this.cursorY = (y + 10) + "px";

          if(e.data.split(":")[3] === "true") {
            if(this.drawing) {
              this.ctx.lineTo(x, y);
            }
            else {
              this.drawing = true;
              this.ctx.moveTo(x, y);
            }
            this.ctx.stroke();
          }
          else {
            this.drawing = false;
          }
        }
      }
    };

    // setInterval(() => {
    //   for (let i = 0; i < this.players.length; ++i) {
    //     this.moveCursor(this.players[i].xcusor, this.players[i].ycursor, i);
    //   }
    // }, 100);
  }

  ngAfterViewInit(): void {
    this.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

    if(this.canvas) {
      console.log("Hello")
      this.ctx = this.canvas.getContext("2d");
      if(this.ctx) {
        this.ctx.canvas.width = this.canvasWidth;
        this.ctx.canvas.height = this.canvasHeight;
        this.ctx.lineWidth = 10;
        this.ctx.stroke();
      }
    }
  }

}
