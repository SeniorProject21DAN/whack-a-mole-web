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

    /*
 * Written by: Andrew Baker
 * Date: 11.18.21
 * Websocket server for cast and control
 * messages sent in in the following format
 * <type>:<role>:<roomID>:<OPTIONALmessage>
 *      Example s:h
 *      m:c:54;12;T
 * <type> m=message, s=startup
 * <role> h=host, c=client
 */

    // const express = require("express");
    // const app = express();
    // const http = require("http");
    // const WebSocket = require("ws");

    // 'use strict';
    //https://devcenter.heroku.com/articles/node-websockets
    const express = require('express');
    const { Server } = require('ws');

    const PORT = process.env.PORT || 8080;
    const INDEX = '/index.html';

    const server = express()
      .use((req: any, res: any) => res.sendFile(INDEX, { root: __dirname }))
      .listen(PORT, () => console.log(`Listening on ${PORT}`));

    const wss = new Server({ server });


    // Single dimension array storing name of host, used for host setup and client setup 
    const hostList = new Array();
    // Two dimensional array storing websocket address of host in [0] and of connected client n in [n]
    const connections = new Array();

    // const server = http.createServer(app);
    // const wss = new WebSocket.Server({ server });

    // WORK TO BE DONE:
    // Add row and column data to the connections, rather than roomColumn, 
    //      for ease of understanding and to send messages from clients
    //      to the host with client id in the message


    wss.on("connection", function connection(ws: any) {
      // roomColumn is the slot of the both arrays the host or client exist within
      let roomColumn: number;
      // roomRow is the client number, hosts are default to 0, being the first in the row, with all clients starting at 1
      let roomRow;
      // roomID is the entered id, the "Host/Connection Code" of the host that the client connects to. The host's name
      let roomID;
      // string identifier for the host to view
      let nickName: string;
      // boolean data, true for host, false for client
      let isHost = false;
      // boolean data, true for screen
      let isScreen = false;
      // boolean data, true once the connection has been set up, created to prevent sending messages without first doing setup
      let isValid = false;
      ws.on("message", function incoming(message: any, isBinary: boolean) {
        // console.log(message.toString(), isBinary);

        if (messageType(message, "s", 0)) {                                         //s is startup signifier
          roomID = message.toString().substring(4, 9);
          nickName = message.toString().substring(10, 20);
          if (messageType(message, "h", 2)) {                                     //Host set up
            if (hostExists(roomID) === -1) {
              roomColumn = hostHole();                                        // Tests for a hole in connections, fills the hole
              if (roomColumn !== -1) {
                hostList[roomColumn] = roomID;
                connections[roomColumn][0] = ws;
              } else {                                                        // Creates new slot in the hostList
                hostList.push(roomID);
                connections.push(new Array());
                roomColumn = connections.length - 1;
                connections[roomColumn].push(ws);
              }
              roomRow = 0;
              isHost = true;
              connections[roomColumn][1] = null;
              nickName = "HOST";
              // console.log("Host Created!");
              ws.send("Host Created!");

            } else {                                                            //Return Error, host already exists
              // console.log("Error in host connection: host already exists");
              ws.send("Error in host connection: host already exists");
              ws.close();
            }
          } else if (messageType(message, "c", 2)) {                              //Client or player set up 

            let host = hostExists(roomID);
            // console.log("Host Number: " + host);
            if (host !== -1) {                                                  //Need to send confirmation message
              connections[host].push(ws);
              roomRow = connections.length;                                   //roomRow set to the length of connections, given that connections has just been incremented
              roomColumn = host;
              isHost = false;
              // console.log("Client Created!");
              connections[roomColumn][0].send(`${nickName}:OPEN`);
              ws.send("Client Created!");
            } else {                                                            //Send error message, host does not exist
              // console.log("Error in client connection: host does not exist");
              ws.send("Error in client connection: host does not exist");
              ws.close();
            }
          } else if (messageType(message, "s", 2)) {                              //Chromecast set up
            // console.log("Casting screen set up");
            let host = hostExists(roomID);
            if (host !== -1) {                                                  //Need to send confirmation message

              connections[host][1] = ws;

              // console.log(connections[host][1]);

              // connections[host].push(ws);

              roomRow = connections.length;                                   //roomRow set to the length of connections, given that connections has just been incremented
              roomColumn = host;
              isHost = false;
              isScreen = true;
              // console.log("Client Created!");
              connections[roomColumn][0].send(`SCREEN:OPEN`);
              connections[roomColumn][1].send(`SCREEN:OPEN`);
              ws.send("SCREEN Created!");
            } else {                                                            //Send error message, host does not exist
              // console.log("Error in client connection: host does not exist");
              ws.send("Error in client connection: host does not exist");
              ws.close();
            }
          } else {                                                                //Send error message, invalid input
            // console.log("Error in connection: invalid input");
            ws.send("Error in Connection: Invalid Input");
            ws.close();
          }
          isValid = true;
        } else if (messageType(message, "m", 0)) {                                  //If message
          if (isValid) {
            if (isHost) {                                                           //If message sender is a host
              connections[roomColumn].forEach(function each(client: any) {
                if (client && client.readyState === WebSocket.OPEN) {
                  client.send(nickName + ":" + message.toString());
                  // console.log("Sending Message");
                }
              });
            } else if (isScreen) {

            } else {                                                                //If sender is a client, send messages exclusively to the host
              // connections[roomColumn][0].send(roomRow + ":" + message.toString());            //Sends the number of the client
              connections[roomColumn][0].send(nickName + ":" + message.toString());        //Version to be used when nickname is fully implemented

              if (connections[roomColumn][1] === null) {
                console.log("Screen is null object");
              } else {
                // console.log(connections[roomColumn][1]);
                // console.log(undefined);
                // console.log(roomColumn[1])
                connections[roomColumn][1].send(nickName + ":" + message.toString());        //Send to screen
              }
            }
          } else {
            ws.send("Error: Invalid Connection");
            ws.close();
          }
        } else {                                                                    //Send error message, invalid input message
          // console.log("Error: invalid Input");
          ws.send("Error in Connection: Invalid Input");
          ws.close();
        }

        // CODE TO MAKE SERVER ECHO ALL INPUT MESSAGES
        // wss.clients.forEach(function each(client) {
        //     if (client.readyState === WebSocket.OPEN) {
        //         client.send(message.toString());
        //     }
        // });


      });
      ws.on("close", function () {
        // console.log("Closed connection");
        if (isHost) {
          // delete hostList[roomColumn];
          deleteClients(connections[roomColumn]);
          hostList[roomColumn] = -1;                 //additional change to reuse former room numbers, prevent server overflow
          // connections[roomColumn][0] = -1;
          // console.log("Host Closed. Size of hostList: " + hostList.length);
        } else {
          // connections[roomColumn][0].send(nickName + ":CLOSED");
        }
        // Currently when a connection closes only the host deletes values
        // When a client closes nothing happens, leaving its value within the connections array
        // It would be wise to add additional code to delete values from the connections array, however it get cleared when the host closes
        // Adding client deletion from connections array would require a y-value variable for client connections for the connections array
      });
    });

    // server.get("/", (req, res) => {
    //     res.send("Hello World!");
    // });

    // wss.listen(PORT, () => {
    //     console.log("Listening to port PORT");
    // });
    let hostExists = (name: string) => {
      for (let i = 0; i < hostList.length; i += 1) {
        if (hostList[i] === name) {
          return (i);
        }
      }
      return (-1);
    }

    function messageType(message: any, role: string, position: number) {
      return (message.toString().substring(position, position + 1) === role);
    }

    function hostHole() {
      for (let i = 0; i < hostList.length; i += 1) {
        if (hostList[i] === -1) {
          return i;
        }
      }
      return -1;
    }

    function deleteClients(clientArray: any[]) {
      // for(let i = 1; i < clientArray.length; i += 1){
      //     clientArray[i].close();
      // }


      clientArray.forEach(function each(client: any) {
        // client.close();
        //delete client;
      });
    }

    this.roomId = generateID();

    this.canvasWidth = Math.floor(screen.availWidth / 1.5);
    this.canvasHeight = Math.floor(screen.availWidth / 3);

    this.ws = new WebSocket('wss://lit-eyrie-58570.herokuapp.com/');

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
          if (this.players.length >= 2) {
            this.ws.send("m:eraser=" + this.players[this.eraser]);
          }
          this.ws.send("m:word=" + this.word);
          this.ws.send("m:start");
        }
      }
      if (e.data.split(":").length === 3 && e.data.split(":")[2] === "answered" && this.ctx && this.canvas) {
        this.word = this.words[getRandomInt(this.words.length)];
        console.log((this.artist + 1) % this.players.length)
        this.artist = (this.artist + 1) % this.players.length;
        console.log(this.players);
        console.log(this.players[this.artist]);
        this.eraser = (this.eraser + 1) % this.players.length;
        this.ws.send("m:artist=" + this.players[this.artist]);
        if (this.players.length >= 2) {
          this.ws.send("m:eraser=" + this.players[this.eraser]);
        }
        this.ws.send("m:word=" + this.word);
        this.ws.send("m:start");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
          if (this.players.length >= 2) {
            this.ws.send("m:eraser=" + this.players[this.eraser]);
          }
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
            this.ctx.lineWidth = 10;
          }
          else {
            this.eraserCursorX = (x + 10) + "px";
            this.eraserCursorY = (y + 10) + "px";
            this.ctx.moveTo(this.eraserX, this.eraserY);
            this.ctx.strokeStyle = "#FFFFFF";
            this.ctx.lineWidth = 20;
          }

          if (e.data.split(":")[3] === "true") {
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            // else {
            //   this.drawing = true;
            //   this.ctx.moveTo(x, y);
            // }
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
        //this.ctx.moveTo(10, 10);
        //this.ctx.lineTo(60, 60);
        //this.ctx.stroke();
      }
      if (this.ctx) {
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.lineCap = 'round'
        //this.ctx.beginPath();
        // this.ctx.moveTo(10, 60);
        // this.ctx.lineTo(60, 10);
        //this.ctx.stroke();
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