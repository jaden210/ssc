import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, combineLatest, skip } from "rxjs";
import { Location } from "@angular/common";
import { environment } from "src/environments/environment";
import { ActivatedRoute, Router } from "@angular/router";
import { AppService } from "../app.service";
import { SessionService } from "./session.service";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.scss"],
})
export class SessionComponent implements OnInit {
  constructor(
    private _accountService: SessionService,
    private _ss: SessionService,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _location: Location,
    private _route: ActivatedRoute,
    private _router: Router,
    private _appService: AppService
  ) {}

  ngOnInit() {
    this._route.paramMap.subscribe(params => {
      const sessionId: string = params.get("sessionId");
      const userId = localStorage.getItem("s4UserId");
      combineLatest([
        this._ss.getSessionById(sessionId),
        this._ss.getVotesBySessionId(sessionId),
        this._ss.getPlaces(),
        this._ss.getUserById(this._ss.user.id || userId)
      ]).subscribe(([session, votes, deals, user]) => {
        user.id = this._ss.user.id || userId;
        this._ss.dataObject = [session, votes, deals, user];
        this._ss.dataObservable.next([session, votes, deals, user]);
        if (this._ss.places.length == 0) {
          this.buildPlaces();
        }
      });
    });
  }

  private buildPlaces(): void {
    this._ss.places = this._ss.dataObject[2].reduce((acc, d) => {
      let key = d['businessId'];
      if (!acc.find(a => a.id == key)) {
        acc.push({
          id: d.businessId,
          name: d.businessName,
          logoUrl: d.imageUrl,
          locations: d.locations,
          sscId: d.id,
          categoryId: d.categoryId,
          deals: []
        });
      }
      acc.find(a => a.id == key).deals.push({id: d.id, name: d.deal, extraDetails: d.extraDetails, maxUses: d.maxUses})
      return acc;
    }, []);
  }

  
}
