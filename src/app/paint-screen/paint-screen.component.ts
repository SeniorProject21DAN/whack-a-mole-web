import { Component, OnInit } from '@angular/core';

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
  selector: 'app-paint-screen',
  templateUrl: './paint-screen.component.html',
  styleUrls: ['./paint-screen.component.scss']
})
export class PaintScreenComponent implements OnInit {

  squares: string[][] = []; //each string tells the color of the square

  colors: string[] = ["red", "lime", "cyan", "yellow"];
  headcolors: string[] = ["darkred", "darkgreen", "darkcyan", "#999900"]

  players: Player[] = [];

  pctWhite: number = 100;

  ws: WebSocket;

  startIndexes: BoardIndex[] = [];

  roomId: string = "";

  constructor() {
    //Create a grid of white tiles based on the screen size
    let temparray: string[] = [];
    for (let i = 0; i < Math.floor(window.innerWidth / 40); ++i) {
      temparray.push("white");
    }

    for (let i = 0; i < Math.floor((window.innerHeight - 75) / 40); ++i) {
      this.squares.push([...temparray]);
    }

    this.startIndexes.push({x: 0, y: 0});
    this.startIndexes.push({x: this.squares[0].length - 1, y: this.squares.length - 1});
    this.startIndexes.push({x: this.squares[0].length - 1, y: 0});
    this.startIndexes.push({x: 0, y: this.squares.length - 1});
    

    // this.players.push({ xlast: 0, ylast: 0, name: "Bongo" });
    // this.players.push({ xlast: 0, ylast: this.squares.length - 1, name: "Banjo" });
    // this.players.push({ xlast: this.squares[0].length - 1, ylast: 0, name: "Banjo" });
    // this.players.push({ xlast: this.squares[0].length - 1, ylast: this.squares.length - 1, name: "Banjo" });


    // let t = setInterval(() => {
    //   this.moveCursor(Math.random(), Math.random(), 0);
    //   this.moveCursor(Math.random(), Math.random(), 1);
    //   this.moveCursor(Math.random(), Math.random(), 2);
    //   this.moveCursor(Math.random(), Math.random(), 3);
    //   let numWhite = 0;
    //   for (let i = 0; i < this.squares.length; ++i) {
    //     for (let j = 0; j < this.squares[i].length; ++j) {
    //       if (this.squares[i][j] == "white") {
    //         numWhite++;
    //       }
    //     }
    //   }

    //   this.pctWhite = numWhite / (this.squares.length * this.squares[0].length) * 100
    // }, 10);

    this.roomId = generateID();

    this.ws = new WebSocket('ws://153.106.80.52:8080');

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
      if(e.data.split(":").length > 1) {
        let playerNum = this.players.map(function(player) { return player.name; }).indexOf(e.data.split(":")[0]);
        if(playerNum !== -1) {
          this.players[playerNum].xcusor = Number.parseFloat(e.data.split(":")[2].split(",")[0])
          this.players[playerNum].ycursor = Number.parseFloat(e.data.split(":")[2].split(",")[1]);
          //this.moveCursor(Number.parseFloat(e.data.split(":")[2].split(",")[0]), Number.parseFloat(e.data.split(":")[2].split(",")[1]), playerNum);
        }
        else {
          this.players.push({
            xlast: this.startIndexes[this.players.length].x,
            ylast: this.startIndexes[this.players.length].y,
            name: e.data.split(":")[0],
            xcusor: this.startIndexes[this.players.length].x,
            ycursor: this.startIndexes[this.players.length].y
          })
          //this.moveCursor(this.players[this.players.length - 1].xlast, this.players[this.players.length - 1].ylast, this.players.length - 1);
        }
      }
    };

    setInterval(() => {
      for(let i = 0; i < this.players.length; ++i) {
        this.moveCursor(this.players[i].xcusor, this.players[i].ycursor, i);
      }
    }, 100)
  }

  ngOnInit(): void {
  }

  //Calculates where to move the player's cursor to
  moveCursor(x: number, y: number, playernum: number): void {
    let xcoord: number = Math.floor(this.squares[0].length * x);
    let ycoord: number = Math.floor(this.squares.length * y);

    let xdest = this.players[playernum].xlast;
    let ydest = this.players[playernum].ylast;

    if (xcoord > this.players[playernum].xlast && this.players[playernum].xlast + 1 < this.squares[0].length) {
      xdest = this.players[playernum].xlast + 1;
    }
    else if (xcoord < this.players[playernum].xlast && this.players[playernum].xlast - 1 >= 0) {
      xdest = this.players[playernum].xlast - 1;
    }

    if (ycoord > this.players[playernum].ylast && this.players[playernum].ylast + 1 < this.squares.length) {
      ydest = this.players[playernum].ylast + 1;
    }
    else if (ycoord < this.players[playernum].ylast && this.players[playernum].ylast - 1 >= 0) {
      ydest = this.players[playernum].ylast - 1;
    }

    this.paintSquare(xdest, ydest, playernum);
  }

  //Paints the square with the player's color
  paintSquare(x: number, y: number, playernum: number): void {
    this.squares[y][x] = this.headcolors[playernum];

    if (this.squares[this.players[playernum].ylast][this.players[playernum].xlast] == this.headcolors[playernum]
      || this.squares[this.players[playernum].ylast][this.players[playernum].xlast] == "white") {
      this.squares[this.players[playernum].ylast][this.players[playernum].xlast] = this.colors[playernum];
    }

    this.players[playernum].xlast = x;
    this.players[playernum].ylast = y;
  }

}

interface Player {
  xlast: number,
  ylast: number,
  name: string
  xcusor: number,
  ycursor: number
}

interface BoardIndex {
  x: number,
  y: number
}