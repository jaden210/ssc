import { Component, OnInit, AfterViewInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { trigger, transition, style, animate } from "@angular/animations";
import { Router, ActivatedRoute } from "@angular/router";
import { AppService, User } from "../app.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Session } from "../session/session.service";

@Component({
  selector: "start",
  templateUrl: "./start.component.html",
  styleUrls: ["./start.component.scss"],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("500ms 1000ms ease-out", style({ opacity: 1 })),
      ]),
      transition(":leave", [
        style({ opacity: 1 }),
        animate("250ms ease-in", style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class StartComponent implements OnInit, AfterViewInit {
  
  public view: string = 'splash';
  public joinCode: string;
  public joinCodeError: string;
  private userId: string;
  public user: User = new User();
  public session: Session = new Session();
  public loading: boolean = false;




  
  constructor(
    private _dialog: MatDialog,
    public router: Router,
    private _route: ActivatedRoute,
    private _as: AppService,
    private _snackbar: MatSnackBar
  ) {}

  /* Close login dialog on navigation to this component */
  ngOnInit() {
    setTimeout(() => {
      this.view = 'start';
    }, 2000);
    this.userId = localStorage.getItem("s4UserId");
    if (this.userId) this._as.getUserById(this.userId).subscribe(user => {
      user ? this.user = user : localStorage.removeItem("s4UserId");
    });
  }

  public scrollUp(): void {
    document.getElementById("scrollwindow").scrollTo(0, 0);
    this._as.chatByte.play();
  }

  public getName(): void {
    this.view = this.user.name && this.userId ? 'location' : 'name';
    this.scrollUp();
  }

  public setArea(event): void {
    this.session.lat = event.value.lat;
    this.session.long = event.value.long;
  }

  public get Categories() {
    return this._as.categories;
  }

  public get Areas() {
    return this._as.areas;
  }

  public get SessionUrl(): string {
    return `https://swipe-for.web.app/session/${this.session.id}`;
  }

  public setName(): void {
    this._as.createUser(this.user).then((user) => {
      localStorage.setItem("s4UserId", user.id);
      this.user.id = user.id;
      this.userId = user.id;
      this.view = 'location';
      this.scrollUp();
    });
  }

  public navByJoinCode(): void {
    this.scrollUp();
    this._as.findSessionByJoinCode(this.joinCode).subscribe(sessions => {
      if (sessions && sessions.length > 0) {
        this.router.navigate([`session/${sessions[0].id}`]);
      } else {
        this.joinCodeError = "No games found using that code!"
        setTimeout(() => {
          this.joinCodeError = null;
        }, 3000);
      }
    })
  }

  public setCategory(categoryId: number): void {
    this.session.categoryId = categoryId;
    this.view = 'loading';
    this.createSession();
    this.scrollUp();
  } 

  public createSession(): void {
    this.session.userId = this.userId;
    this.session.users.push(this.userId);
    this.session.shareCode = Math.floor(1000 + Math.random() * 9000).toString();
    this._as.createSession(this.session).then((doc) => {
      this.session.id = doc.id;
      setTimeout(() => {
        this.view = 'share';
      }, 2000);
    });
  }

  public share(): void {
    this._as.share(this.session, this.user);
  }

  public start(): void {
    this.scrollUp();
    this.router.navigate([`session/${this.session.id}`]);
  }

  public getCurrentLocation(): void {
    this.loading = true;
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.session.lat = position.coords.latitude;
        this.session.long = position.coords.longitude;
        this.loading = false;
      }, e => {
        this.loading = false;
        this._snackbar.open("location is blocked..", "", {duration: 3000});
      });
    } else {
      this.loading = false;
      alert("Geolocation is not supported by this browser.");
    }
  }

  formatLabel(value: number) {
    return (value >= 50) ? Math.round(value / 50) + ' mi' : value + ' mi';
  }








  ngAfterViewInit(): void {
   
  }


}
