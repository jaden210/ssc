import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, Observer, of } from "rxjs";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import {
  map,
  catchError,
  distinctUntilChanged,
  mergeMap,
  tap,
  take,
} from "rxjs/operators";
import firebase from "firebase/compat/app";
import { AppService } from "../app.service";
var provider = new firebase.auth.GoogleAuthProvider();
var facebookProvider = new firebase.auth.FacebookAuthProvider();
declare let gtag: Function;

@Injectable({ providedIn: "root" })
export class SignInService {
  public adminObservable: BehaviorSubject<Admin> = new BehaviorSubject(null);
  public admin: Admin;

  public firebaseUser: firebase.User;

  constructor(
    private _firebaseAuth: AngularFireAuth,
    private _router: Router,
    private _db: AngularFirestore,
    private firebaseAuth: AngularFireAuth,
    private _appService: AppService
  ) {
    // Converting teardown to an observable to operate on.
    new Observable((observer: Observer<firebase.User>) => {
      this._firebaseAuth.onAuthStateChanged(
        (user?: firebase.User) => observer.next(user),
        (error: firebase.auth.Error) => observer.error(error),
        () => observer.complete()
      );
    })
      .pipe(
        tap((user: firebase.User) => {
          console.log("Firebase user auth state change:", user?.uid);
          this.firebaseUser = user;
        }),
        map((user: firebase.User) => user?.uid),
        distinctUntilChanged(),
        mergeMap((uid) => (uid ? this.getUser(uid) : of(undefined)))
      )
      .subscribe((admin: Admin) => {
        console.log("Setting admin...", admin);
        this.admin = admin;
        this.adminObservable.next(admin);
        this._router.navigate(['admin']);
        if (admin && admin.id) {
          gtag("set", "user_properties", {
            is_logged_in: "true",
            user_id: `${admin.id}`,
            user_email: `${admin.email}`,
          });
        }
      });
  }

  // Only get's the user once!
  public getUser(id: string): Observable<Admin> {
    return this._db
      .collection("admins")
      .doc(id)
      .valueChanges()
      .pipe(
        take(1),
        map((user: Admin) => {
          return { ...user, id };
        }),
        catchError((e) => {
          console.error(e);
          this.logout();
          throw e;
        })
      );
  }

  /**
   * @description Authenticates a user.
   * @param email
   * @param password
   * @returns The authenticated user's ID.
   */
  public async signIn(email: string, password: string): Promise<any> {
    try {
      const user = await this._firebaseAuth.signInWithEmailAndPassword(
        email,
        password
      );
      if (user && user.user) {
        return user.user.getIdToken();
      } else {
        throw "An error occured, please try again later";
      }
    } catch (error) {
      return Promise.reject(`* ${error.message}`);
    }
  }


  public logout(): void {
    this._firebaseAuth.signOut().then(() => {
      this._router.navigate(["/sign-in"]);
      window.location.reload();
    });
  }
}

export class Admin {
  email: string;
  id: string;
  name: string;
}
