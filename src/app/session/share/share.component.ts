import { Location } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { Router } from "@angular/router";
import { skip, skipWhile } from "rxjs";
import { AppService, User } from "src/app/app.service";
import { Session, SessionService } from "../session.service";

@Component({
  selector: "share-sheet",
  templateUrl: "share.component.html",
  styleUrls: ["./share.component.scss"],
})
export class ShareComponent {

  public users: User[] = [];
  public session: Session;

  constructor(
    private _as: AppService,
    private _ss: SessionService,
    private _router: Router,
    private _location: Location
  ) {
    this._ss.dataObservable.pipe(skipWhile(o => o[2] == null)).subscribe(([session, votes, deals, user]) => {
      this.session = session;
      this._ss.getSessionUsers(session.users).subscribe(users => {
        this.users = users;
      });
    });
  }

  public get SessionUrl(): string {
    return `https://swipe-for.web.app/session/${this.session?.id}`;
  }

  public share(): void {
    this._as.share(this.session, this.users.find(u => u.id == this.session.userId));
  }

  close(): void {
    this._location.back();
  }
}