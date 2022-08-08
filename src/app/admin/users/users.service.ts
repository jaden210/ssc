import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { Session } from "src/app/session/session.service";

@Injectable()
export class UsersService {
  constructor(private db: AngularFirestore) {}

  transactions;

  public getUsers() {
    return this.db
      .collection("users")
      .snapshotChanges()
      .pipe(
        map((users: any) =>
          users
            .map((user) => {
              const us = user.payload.doc.data();
              return {
                email: us.email,
                name: us.name,
                createdAt: us.createdAt ? us.createdAt.toDate() : new Date(),
                id: user.payload.doc.id,
              };
            })
        )
      );
  }


  public getSessions(): Observable<Session[]> {
    return this.db.collection<Session>("sessions").valueChanges();
  }
}
