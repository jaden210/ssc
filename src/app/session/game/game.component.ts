import { Component, OnInit, AfterViewInit, Renderer2, ViewEncapsulation, ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { trigger, transition, style, animate, state } from "@angular/animations";
import { Router, ActivatedRoute } from "@angular/router";
import { combineLatest, skip, skipWhile } from "rxjs";
import * as moment from "moment";
import { AppService, User } from "src/app/app.service";
import { Place, Session, SessionService, Vote } from "../session.service";

@Component({
  selector: "game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.scss"],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("250ms 500ms ease-out", style({ opacity: 1 })),
      ]),
      transition(":leave", [
        style({ opacity: 1 }),
        animate("250ms ease-in", style({ opacity: 0 })),
      ]),
    ]),
    trigger("swipe", [
      state("void", style({ transform: "translateX(-150%)" })),
      transition("* <=> void", animate("250ms ease-in-out")),
    ]),
  ],
})
export class GameComponent implements OnInit, AfterViewInit {
  
  public view: string = 'splash';

  public user: User = new User();
  public location: Location;
  public session: Session;
  public votes: Vote[] = [];
  public sessionUser: User;
  public joined: boolean = false;
  public dragPosition;
  private deals;
  public tu: boolean = null;
  public showMatchCard: boolean = false;

  places: any[] = [];
  filteredPlaces: any[] = [];
  
  constructor(
    private _dialog: MatDialog,
    public router: Router,
    private _route: ActivatedRoute,
    private _as: AppService,
    private _ss: SessionService,
    private _renderer: Renderer2,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._ss.dataObservable.pipe(skipWhile(o => o[2] == null)).subscribe(([session, votes, deals, user]) => {
      this.deals = deals;
      this.session = session;
      this.votes = votes;
      this.user = user;
      
      if (!session) {
        this.view = 'bad';
        return;
      }
      if (moment(session.createdAt.toDate()).diff(moment(), "d") < 0) {
        this.view = "over";
        return;
      }
      if (!this.user || !this.user.name || !session.users.find(uId => uId == this.user.id)) {
        this.joinView();
      } else {
        if (this.places.length == 0) {
          this.places = this._ss.places; 
          if (this.Matches > 0) this.showMatchCard = true;
        }
        this.sortAlgorithm();
        setTimeout(() => {
          this.view = 'game';
        }, 500);
      }
    });
  }

  private joinView(): void {
    this._as.getUserById(this.session.userId).subscribe(sessionUser => {
      this.sessionUser = sessionUser;
      this.view = 'start';
    });
  }

  public start(): void {
    if (this.user && this.user.name) {
      this.joinGame();
    } else {
      this.user = new User();
      this.view = 'name';
    }
  }

  public get Matches(): number {
    return this.places.filter(p => this.votes.filter(v => (v.placeId == p.id) && v.vote).length == this.session.users.length).length;
  }

  public createUserAndJoinGame(): void {
    this._as.createUser(this.user).then((doc) => {
      localStorage.setItem("s4UserId", doc.id);
      this.user.id = doc.id;
      this.joinGame();
    });
  }

  private joinGame(): void {
    this.session.users.push(this.user.id);
    this._ss.updateSession(this.session).then(() => {
      this.places = this._ss.places;
      this.sortAlgorithm();
      setTimeout(() => {
        this.view = 'game';
      }, 500);
    });
  }

  dragStart(event, index) {
    let card = document.getElementById(`card${index}`);
    card.classList.add('rotate');
  }

  public rotate(event, index): void {
    let rotate = <HTMLElement> document.getElementsByClassName('rotate')[0];
    let deg = 20 / ((window.innerWidth / 2) / event.distance.x);
    rotate.style.transform = `rotateZ(${deg}deg)`;
    this.tu = (event.distance.x > (window.innerWidth / 3) || event.distance.x < -(window.innerWidth / 3)) ? deg > 0 : null;
  }

  public drop(event, index, place) {
    if (event.distance.x > (window.innerWidth / 3) || event.distance.x < -(window.innerWidth / 3)) {
      const card = document.getElementById(`card${index}`);
      card.style.transform = `translateX(${event.distance.x * 2}px)`;
      setTimeout(() => {
        card.classList.remove("rotate");
        card.style.transform = 'none';
        this.dragPosition = {x:0, y:0};
        const like = event.distance.x > 0;
        if (place == null) {
          !like ? this.showMatchCard = false : this.dashboard();
        } else {
          this.swipePlace(like, place);
        }
        this.tu = null;
      }, 100);
    } else {
      this.dragPosition = {x: 0, y: 0};
      const card = document.getElementById(`card${index}`);
      card.classList.remove("rotate");
      card.style.transform = 'none';
      this.tu = null;
    }
  }

  public swipePlace(like: boolean, place: Place = this.filteredPlaces[this.filteredPlaces.length - 1]): void {
    // const oldMatchCount = this.Matches;
    this._ss.addVote(this.session.id, this.user.id, like, place.id).then(() => {
      // if (this.Matches > oldMatchCount) this.showMatchCard = true;
    });
  }

  public dashboard(): void {
    this.router.navigate(['matches'], {relativeTo: this._route});
  }

  public share(): void {
    this.router.navigate(['share'], {relativeTo: this._route});
  }

  public expand(): void {
    this.session.distance = this.session.distance + 5;
    this._ss.updateSession(this.session).then(() => {
      console.log('expanded');
    })
  }

  private sortAlgorithm(): void { //magic man
    this.filteredPlaces = this.places.filter(p => {
      console.log(p.wins);
      
      return !this.votes.find(v => v.placeId == p.id && v.userId == this.user.id) &&
      this._as.categories.find(c => c.id == this.session.categoryId).categoryIds.find(c => c == p.categoryId) &&
      p.locations.some(l => this.getDistanceFromLatLonInKm(this.session.lat, this.session.long, l.lat, l.long) <= 40)
    })
    .sort((a,b) => b.wins - a.wins || (a.name.localeCompare(b.name)))
    .splice(0,2)
    .sort((a,b) => a.wins - b.wins || (b.name.localeCompare(a.name)))
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




  ngAfterViewInit(): void {
   
  }


}
