import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import "firebase/auth";
import { BehaviorSubject, Observable } from "rxjs";
import * as firebase from 'firebase/compat/app';
import { map } from "rxjs/operators";

@Injectable()
export class SessionService {

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

  user: User = new User();
  public dataObservable = new BehaviorSubject<[Session, Vote[], Deal[], User]>([null, null, null, null]);
  public dataObject: [Session, Vote[], Deal[], User];
  public places: Place[] = [];


  constructor(
    private _db: AngularFirestore,
    public storage: AngularFireStorage,
    public router: Router,
  ) {}


  public getUserById(id: string): Observable<User> {
    return this._db.doc<User>(`users/${id}`).valueChanges();
  }

  public createUser(user: User): Promise<any> {
    return this._db.collection("users").add({...user});
  }

  public createSession(session: Session) {
    return this._db.collection("sessions").add({...session});
  }

  public getSessionById(id: string): Observable<Session> {
    return this._db.doc<Session>(`sessions/${id}`).valueChanges();
  }

  public getVotesBySessionId(id: string): Observable<Vote[]> {
    return this._db.collection<Vote>(`sessions/${id}/votes`).valueChanges({idField: "id"});
  }

  public updateSession(session: Session): Promise<any> {
    return this._db.doc(`sessions/${session.id}`).update({...session});
  }

  public getPlaces(): Observable<Deal[]> {
    return this._db.collection<Deal>('deals').valueChanges({idField: "id"});
  }

  public getSessionUsers(userIds: string[]): Observable<User[]> {
    return this._db.collection<User>(`users`, ref => ref.where(firebase.default.firestore.FieldPath.documentId(), "in", userIds)).valueChanges({idField: "id"});
  }

  public joinSession(sessionId: string, userIds: string[]): Promise<any> {
    return this._db.doc(`sessions/${sessionId}`).update({users: userIds});
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

  public addVote(sessionId: string, userId: string, like: boolean, placeId: string): Promise<any> {
    let body: Vote = new Vote();
    body.userId = userId;
    body.vote = like;
    body.placeId = placeId;
    return this._db.collection(`sessions/${sessionId}/votes`).add({...body});
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

export class Location {
  id?: string;
  name: string;
  imageUrl: string;
  createdAt: Date;
}

export class Vote {
  id?: string;
  userId: string;
  vote: boolean;
  placeId: string;
}

export class Place {
  id?: string;
  name: string;
  logoUrl: string;
  address: string;
  hourse: string;
  latitude: number;
  longitude: number;
  locations: any;

  yes?: number;
  no?: number;
}

export class Deal {
  id;
  businessName;
  businessId;
  maxUses;
  extraDetails;
  deal;
  imageUrl;
  categoryId;
  locations;
  sscId;
}