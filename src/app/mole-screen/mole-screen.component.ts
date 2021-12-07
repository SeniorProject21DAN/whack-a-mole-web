import { Component, OnInit } from '@angular/core';
import { getFirestore, collection, query, getDocs, onSnapshot, doc, Unsubscribe } from "firebase/firestore";
import { initializeApp } from "firebase/app"

@Component({
  selector: 'app-mole-screen',
  templateUrl: './mole-screen.component.html',
  styleUrls: ['./mole-screen.component.scss']
})
export class MoleScreenComponent implements OnInit {

  unsubscribe: Unsubscribe[] = [];
  xcoord: number = 0;
  ycoord: number = 0;
  x: string = "0px";
  y: string = "0px";
  whack: boolean = false;
  moles: boolean[] = [false, false, false, false, false, false];
  score: number = 0;
  ws: WebSocket;

  players: Player[] = [];
  playerNames: string[] = [];

  colors: string[] = ['red', 'lime', 'cyan', 'yellow', 'magenta', 'orange']

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyALU4G_DAjzU8oEzNbMg6YIpDelv_BnWCM",
      authDomain: "whack-a-mole-motion.firebaseapp.com",
      projectId: "whack-a-mole-motion",
      storageBucket: "whack-a-mole-motion.appspot.com",
      messagingSenderId: "878118269458",
      appId: "1:878118269458:web:077ba628e86d65da101ecb",
      measurementId: "G-29HV2MWXB5"
    };

    this.ws = new WebSocket('ws:153.106.226.103:8080');   //This needs to altered to the IP of the server when attempting to get this to run. Double check each time. 


    const serverMessagesList = [];
    this.ws.onopen = () => {
      this.ws.send("s:h:buist");
      console.log("Connected to the server!")
      // setServerState('Connected to the server')
      // setDisableButton(false);
    };
    this.ws.onclose = (e) => {
      // setServerState('Disconnected. Check internet or server.')
      // setDisableButton(true);
      console.error("Disconnected from server!")
    };
    this.ws.onerror = (e) => {
      // setServerState(e.message);
    };
    this.ws.onmessage = (e) => {
      console.log(e);
      // serverMessagesList.push(e.data);
      // setServerMessages([...serverMessagesList])
    };
    const submitMessage = () => {
      this.ws.send("Dab on the haters");
      // setMessageText('')
      // setInputFieldEmpty(true)
    }

    const send = () => {
      console.log("placeholder");
    }

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);

    this.unsubscribe.push(onSnapshot(collection(db, "MoleGames"), (querySnapshot) => {
      querySnapshot.docChanges().forEach(change => {
        let doc = change.doc.data() as Player;
        let playerIndex: number = this.playerNames.indexOf(doc.name)
        if (playerIndex === -1) {
          doc.score = 0;
          this.players.push(doc);
          this.playerNames.push(doc.name);
          playerIndex = this.playerNames.length - 1;
        }

        console.log(doc)

        let xcoord = doc.x * 800;
        let ycoord = doc.y * 800;

        console.log(xcoord);
        console.log(ycoord)

        // xcoord = playerIndex * 3;
        // ycoord = playerIndex * 3

        this.players[playerIndex].xpx = xcoord + 'px'
        this.players[playerIndex].ypx = ycoord + 'px'

        if (doc.whack) {
          console.log("X: " + this.x + ", Y: " + this.y);
          if (xcoord >= 100 && ycoord >= 50 && xcoord < 200 && ycoord < 200) {
            if (this.moles[0]) {
              this.moles[0] = false;
              ++this.players[playerIndex].score;
            }
          }
          if (xcoord >= 350 && ycoord >= 50 && xcoord < 450 && ycoord < 200) {
            if (this.moles[1]) {
              this.moles[1] = false;
              ++this.players[playerIndex].score;
            }
          }
          if (xcoord >= 600 && ycoord >= 50 && xcoord < 700 && ycoord < 200) {
            if (this.moles[2]) {
              this.moles[2] = false;
              ++this.players[playerIndex].score;
            }
          }
          if (xcoord >= 100 && ycoord >= 300 && xcoord < 200 && ycoord < 450) {
            if (this.moles[3]) {
              this.moles[3] = false;
              ++this.players[playerIndex].score;
            }
          }
          if (xcoord >= 350 && ycoord >= 300 && xcoord < 450 && ycoord < 450) {
            if (this.moles[4]) {
              this.moles[4] = false;
              ++this.players[playerIndex].score;
            }
          }
          if (xcoord >= 600 && ycoord >= 300 && xcoord < 700 && ycoord < 450) {
            if (this.moles[5]) {
              this.moles[5] = false;
              ++this.players[playerIndex].score;
            }
          }
        }

        //10% chance for mole to spawn
        if (Math.random() < (0.1/this.players.length)) {
          this.moles[Math.floor(Math.random() * this.moles.length)] = true;
        }
      })
    }))

    // this.unsubscribe.push(onSnapshot(doc(db, "MoleGames", "Bongo"), (doc) => {
    //   console.log(doc.data());
    //   let data = doc.data() as Player;
    //   this.xcoord = data.x * 800;
    //   this.ycoord = data.y * 500;

    //   this.x = data.x * 800 + "px";
    //   this.y = data.y * 500 + "px";
    //   this.whack = data.whack;

    //   if (this.whack) {
    //     console.log("X: " + this.x + ", Y: " + this.y);
    //     if (this.xcoord >= 100 && this.ycoord >= 50 && this.xcoord < 200 && this.ycoord < 200) {
    //       if (this.moles[0]) {
    //         this.moles[0] = false;
    //         ++this.score;
    //       }
    //     }
    //     if (this.xcoord >= 350 && this.ycoord >= 50 && this.xcoord < 450 && this.ycoord < 200) {
    //       if (this.moles[1]) {
    //         this.moles[1] = false;
    //         ++this.score;
    //       }
    //     }
    //     if (this.xcoord >= 600 && this.ycoord >= 50 && this.xcoord < 700 && this.ycoord < 200) {
    //       if (this.moles[2]) {
    //         this.moles[2] = false;
    //         ++this.score;
    //       }
    //     }
    //     if (this.xcoord >= 100 && this.ycoord >= 300 && this.xcoord < 200 && this.ycoord < 450) {
    //       if (this.moles[3]) {
    //         this.moles[3] = false;
    //         ++this.score;
    //       }
    //     }
    //     if (this.xcoord >= 350 && this.ycoord >= 300 && this.xcoord < 450 && this.ycoord < 450) {
    //       if (this.moles[4]) {
    //         this.moles[4] = false;
    //         ++this.score;
    //       }
    //     }
    //     if (this.xcoord >= 600 && this.ycoord >= 300 && this.xcoord < 700 && this.ycoord < 450) {
    //       if (this.moles[5]) {
    //         this.moles[5] = false;
    //         ++this.score;
    //       }
    //     }
    //   }

    //   //10% chance for mole to spawn
    //   if (Math.random() < 0.1) {
    //     this.moles[Math.floor(Math.random() * this.moles.length)] = true;
    //   }
    // }))
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(unsub => {
      unsub();
    })
  }

}

interface Player {
  name: string,
  score: number,
  x: number,
  xpx: string,
  y: number,
  ypx: string,
  whack: boolean
}