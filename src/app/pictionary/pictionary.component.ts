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
  eraserCtx: CanvasRenderingContext2D | null = null;
  canvasWidth: number = 100;
  canvasHeight: number = 100;

  @ViewChild('myCanvas') canvasRef?: ElementRef;

  players: string[] = [];
  ready: boolean[] = [];
  artist: number = 0; //index of artist
  eraser: number = 1;
  word: string = "";

  drawing: boolean = false;

  artistCursorX: string = "0px";
  artistCursorY: string = "0px";
  eraserCursorX: string = "0px";
  eraserCursorY: string = "0px";

  artistX: number = 0;
  artistY: number = 0;
  eraserX: number = 0;
  eraserY: number = 0;

  gameStarted: boolean = false;

  words: string[] = ["horse", "school", "house", "monkey", "calvin", "ocean", "television"]

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
      if (e.data.split(":").length === 2 && e.data.split(":")[1] === "OPEN") {
        this.players.push(e.data.split(":")[0]);
        this.ready.push(false);
        if (this.gameStarted) {
          this.ws.send("m:artist=" + this.players[this.artist]);
          //this.ws.send("m:eraser=" + this.players[this.eraser]);
          this.ws.send("m:word=" + this.word);
          this.ws.send("m:start");
        }
      }
      if (e.data.split(":").length === 3 && e.data.split(":")[2] === "answered") {
        this.word = this.words[getRandomInt(this.words.length)];
        this.artist = this.artist + 1 % this.players.length;
        this.eraser = this.eraser + 1 % this.players.length;
        this.ws.send("m:artist=" + this.players[this.artist]);
        //this.ws.send("m:eraser=" + this.players[this.eraser]);
        this.ws.send("m:word=" + this.word);
        this.ws.send("m:start");
      }
      if (e.data.split(":").length == 3 && e.data.split(":")[2].startsWith("ready")) {
        let nickname = e.data.split(":")[0];

        this.ready[this.players.indexOf(nickname)] = e.data.split(":")[2].split("=")[1] === "true";
        console.log(this.ready);
        if (!this.gameStarted && this.ready.every(r => r)) {
          console.log("Starting Game");
          this.gameStarted = true;
          this.word = this.words[getRandomInt(this.words.length)];
          this.ws.send("m:artist=" + this.players[this.artist]);
          //this.ws.send("m:eraser=" + this.players[this.eraser]);
          this.ws.send("m:word=" + this.word);
          this.ws.send("m:start");
          console.log("Hello there")
        }

      }
      else if (e.data.split(":").length === 4) {
        let playerNum = this.players.indexOf(e.data.split(":")[0]);

        if (this.ctx && (this.artist === playerNum || this.eraser === playerNum)) {
          let x: number = e.data.split(":")[2].split(",")[0] * this.canvasWidth;
          let y: number = e.data.split(":")[2].split(",")[1] * this.canvasHeight

          this.ctx.beginPath();

          if (this.artist === playerNum) {
            this.artistCursorX = (x + 10) + "px";
            this.artistCursorY = (y + 10) + "px";
            this.ctx.moveTo(this.artistX, this.artistY);
            this.ctx.strokeStyle = "#000000";
          }
          else {
            this.eraserCursorX = (x + 10) + "px";
            this.eraserCursorY = (y + 10) + "px";
            this.ctx.moveTo(this.eraserX, this.eraserY);
            this.ctx.strokeStyle = "#FFFFFF";
          }

          if (e.data.split(":")[3] === "true") {
            if (this.drawing) {
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

          if (this.artist === playerNum) {
            this.artistX = x;
            this.artistY = y;
          }
          else {
            this.eraserX = x;
            this.eraserY = y;
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

    if (this.canvas) {
      console.log("Hello")
      this.ctx = this.canvas.getContext("2d");
      if (this.ctx) {
        this.ctx.canvas.width = this.canvasWidth;
        this.ctx.canvas.height = this.canvasHeight;
        this.ctx.lineWidth = 10;
        this.ctx.stroke();
      }

      if (this.ctx) {
        this.ctx.moveTo(10, 10);
        this.ctx.lineTo(60, 60);
        this.ctx.stroke();
      }
      if (this.ctx) {
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.beginPath();
        this.ctx.moveTo(10, 60);
        this.ctx.lineTo(60, 10);
        this.ctx.stroke();
      }
    }
  }

  sendMessage() {
    this.ws.send("p:h:" + this.roomId + ":host:Bongo:word=horse")
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}