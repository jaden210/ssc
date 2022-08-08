import { Location } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, Inject } from "@angular/core";
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { Router } from "@angular/router";
import { Place, Session, SessionService, Vote } from "../session.service";

@Component({
  selector: "dashboard",
  templateUrl: "dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  providers: []
})
export class DashboardComponent {

  public places: Place[];
  public session: Session;
  public votes: Vote[] = [];

  constructor(
    private _ss: SessionService,
    private _router: Router,
    private _location: Location
  ) {
    this._ss.dataObservable.subscribe(([session, votes, deals, user]) => {
      this.votes = votes;
      this.session = session;
      this.places = this._ss.places;
      this.places.forEach(p => {
        p.yes = this.votes.filter(v => (v.placeId == p.id) && v.vote).length || 0;
        p.no = this.votes.filter(v => (v.placeId == p.id) && !v.vote).length || 0;
      });
      this.places = this.places.filter(p => p.yes == this.session.users.length).sort((a, b) => +(b.id == this.WinningPlaceId) - +(a.id == this.WinningPlaceId) || (a.yes > b.yes ? -1 : 1));
    })
  }

  public get Votes(): Vote[] {
    return this._ss.dataObject[1];
  }

  public getWidth(place: Place, key: string): string {
    return `${(place[key] / this.session.users.length)*100}%`;
  }

  public get WinningPlaceId(): string {
    return this.session.winningPlaceId;
  }

  close(): void {
    this._location.back();
  }

  public nav(place: Place) {
    console.log(place);
    let dist = 1000;
    let loc = null;
    place.locations.forEach(l => {
      let d = this.getDistanceFromLatLonInKm(this.session.lat, this.session.long, l.lat, l.long)
      if (d < dist) {
        dist = d;
        loc = l;
      }
    })
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.long}`, '_blank');
  }

  public setWinner(place: Place): void {
    this.session.winningPlaceId = place.id;
    this._ss.updateSession(this.session);
  }

  public launch(place: Place) {
    window.open("https://app.starvingstudentcard.com");
  }

  private getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  private deg2rad(deg) {
    return deg * (Math.PI/180)
  }


}