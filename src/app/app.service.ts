import { Injectable, Inject } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { MatDialog } from "@angular/material/dialog";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { DOCUMENT } from "@angular/common";
import { AngularFireFunctions } from "@angular/fire/compat/functions";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AppService {
 
  public chatByte: HTMLAudioElement;

  public categories = [
    {id: 1, name: "Food & Dining", imageUrl: "./assets/categories/dinner.jpeg", categoryIds: [3,4,5]},
    {id: 2, name: "Treats & Hangouts", imageUrl: "./assets/categories/treat.jpeg", categoryIds: [2]},
    {id: 3, name: "Fun Activities", imageUrl: "./assets/categories/activity.jpeg", categoryIds: [6]},
    {id: 4, name: "Get Pampered", imageUrl: "./assets/categories/spa.jpeg", categoryIds: [8]},
  ]

  public areas = [
    {name: "Cache Valley", lat: 41.787502, long: -111.832644},
    {name: "Davis/Weber", lat: 41.201955, long: -111.985238},
    {name: "Salt Lake", lat: 40.745977, long: -111.920503},
    {name: "Southern Utah", lat: 37.104487, long: -113.551282},
    {name: "Tooele", lat: 40.536387, long: -112.298879},
    {name: "Utah County", lat: 40.277829, long: -111.673444},
  ]

  constructor(
    private _db: AngularFirestore,
    public dialog: MatDialog,
    public auth: AngularFireAuth,
    private fns: AngularFireFunctions,
    @Inject(DOCUMENT) private dom
  ) {
    let className = "button";
    this.chatByte = <HTMLAudioElement>document.getElementById(className);
    if (!this.chatByte) {
      this.chatByte = new Audio("/assets/button.mp3");
      this.chatByte.id = className;
      document.body.appendChild(this.chatByte);
    }
  }


  public getUserById(id: string): Observable<User> {
    return this._db.doc<User>(`users/${id}`).valueChanges();
  }

  public createUser(user: User): Promise<any> {
    return this._db.collection("users").add({...user});
  }

  public createSession(session: Session) {
    return this._db.collection("sessions").add({...session});
  }

  public findSessionByJoinCode(joinCode: string): Observable<Session[]> {
    return this._db.collection<Session>(`sessions`, ref => ref.where("shareCode", "==", joinCode)).valueChanges({idField: "id"})
  }

  public share(session: Session, user: User): void {
    let url = `https://swipe-for.web.app/session/${session.id}`;
    let nav = window.navigator as any;
    if (nav.share) {
      window.navigator["share"]({
        title: "Let's get together!",
        text: `Join ${user.name} in deciding where to go to`,
        url: url,
      })
        .then(() => {})
        .catch((error) => console.error("Error sharing", error));
    } else {
      const selBox = document.createElement("textarea");
      selBox.style.position = "fixed";
      selBox.style.left = "0";
      selBox.style.top = "0";
      selBox.style.opacity = "0";
      selBox.value = url;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand("copy");
      document.body.removeChild(selBox);
      if (window.screen.width < 900) {
        // help mobile out
        // this.snackbar.open("link copied to clipboard", "done", {
        //   duration: 3000,
        // });
      } else {
        
      }
    }
  }

}


export class User {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

export class Session {
  id?: string;
  userId: string;
  categoryId: number;
  createdAt: any = new Date();
  shareCode: string;
  users: string[] = [];
  places: any[] = [];
  lat;
  long;
  distance: number = 25;
}