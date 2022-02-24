import { Component, OnInit } from '@angular/core';

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

  constructor() {
    //Create a grid of white tiles based on the screen size
    let temparray: string[] = [];
    for (let i = 0; i < Math.floor(window.innerWidth / 40); ++i) {
      temparray.push("white");
    }

    for (let i = 0; i < Math.floor((window.innerHeight - 75) / 40); ++i) {
      this.squares.push([...temparray]);
    }

    this.players.push({ xlast: 0, ylast: 0, name: "Bongo" });
    this.players.push({ xlast: 0, ylast: this.squares.length - 1, name: "Banjo" });
    this.players.push({ xlast: this.squares[0].length - 1, ylast: 0, name: "Banjo" });
    this.players.push({ xlast: this.squares[0].length - 1, ylast: this.squares.length - 1, name: "Banjo" });


    let t = setInterval(() => {
      this.moveCursor(Math.random(), Math.random(), 0);
      this.moveCursor(Math.random(), Math.random(), 1);
      this.moveCursor(Math.random(), Math.random(), 2);
      this.moveCursor(Math.random(), Math.random(), 3);
    }, 100);
  }

  ngOnInit(): void {
  }

  //Calculates where to move the player's cursor to
  moveCursor(x: number, y: number, playernum: number): void {
    let xcoord: number = Math.floor(this.squares[0].length * x);
    let ycoord: number = Math.floor(this.squares.length * y);

    let xdest = this.players[playernum].xlast;
    let ydest = this.players[playernum].ylast;

    if (xcoord > this.players[playernum].xlast) {
      xdest = this.players[playernum].xlast + 1;
    }
    else if (xcoord < this.players[playernum].xlast) {
      xdest = this.players[playernum].xlast - 1;
    }

    if (ycoord > this.players[playernum].ylast) {
      ydest = this.players[playernum].ylast + 1;
    }
    else if (ycoord < this.players[playernum].ylast) {
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
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}