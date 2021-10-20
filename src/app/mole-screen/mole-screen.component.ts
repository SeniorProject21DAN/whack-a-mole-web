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

    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);

    this.unsubscribe.push(onSnapshot(doc(db, "MoleGames", "Bongo"), (doc) => {
      console.log(doc.data());
      let data = doc.data() as {x: number, y: number, whack: boolean};
      this.xcoord = data.x * 800;
      this.ycoord = data.y * 500;

      this.x = data.x * 800 + "px";
      this.y = data.y * 500 + "px";
      this.whack = data.whack;

      if(this.whack) {
        console.log("X: " + this.x + ", Y: " + this.y);
        if(this.xcoord >= 100 && this.ycoord >= 50 && this.xcoord < 200 && this.ycoord < 200) {
          if(this.moles[0]) {
            this.moles[0] = false;
            ++this.score;
          }
        }
        if(this.xcoord >= 350 && this.ycoord >= 50 && this.xcoord < 450 && this.ycoord < 200) {
          if(this.moles[1]) {
            this.moles[1] = false;
            ++this.score;
          }
        }
        if(this.xcoord >= 600 && this.ycoord >= 50 && this.xcoord < 700 && this.ycoord < 200) {
          if(this.moles[2]) {
            this.moles[2] = false;
            ++this.score;
          }
        }
        if(this.xcoord >= 100 && this.ycoord >= 300 && this.xcoord < 200 && this.ycoord < 450) {
          if(this.moles[3]) {
            this.moles[3] = false;
            ++this.score;
          }
        }
        if(this.xcoord >= 350 && this.ycoord >= 300 && this.xcoord < 450 && this.ycoord < 450) {
          if(this.moles[4]) {
            this.moles[4] = false;
            ++this.score;
          }
        }
        if(this.xcoord >= 600 && this.ycoord >= 300 && this.xcoord < 700 && this.ycoord < 450) {
          if(this.moles[5]) {
            this.moles[5] = false;
            ++this.score;
          }
        }
      }

      //25% chance for mole to spawn
      if(Math.random() < 0.25) {
        this.moles[Math.floor(Math.random() * this.moles.length)] = true;
      }
    }))
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach(unsub => {
      unsub();
    })
  }

}
