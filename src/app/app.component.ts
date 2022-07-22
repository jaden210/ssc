import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { AppService } from "./app.service";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { environment } from "../environments/environment";
import {
  MatBottomSheetRef,
  MatBottomSheet,
  MAT_BOTTOM_SHEET_DATA,
} from "@angular/material/bottom-sheet";
import { Meta } from "@angular/platform-browser";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("250ms 250ms ease-out", style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  public fillNav: boolean;
  public loaded: boolean = false;

  constructor(
    public router: Router,
    public appService: AppService,
    public auth: AngularFireAuth,
    private sheet: MatBottomSheet,
    private _metaTagService: Meta
  ) {
    router.events.subscribe((event) => {
      this.fillNav = true; //block till we figure it out
      if (event instanceof NavigationEnd) {
        this.loaded = true;
      }
      if (!(event instanceof NavigationEnd)) {
        return;
      }
    });
    if (!environment.production) console.log("IN DEVELOPMENT MODE!");
    window.addEventListener("scroll", (event) => {
      this.fillNav = window.scrollY > 10;
    });
  }

  ngOnInit() {
    this._metaTagService.addTags([
      {
        name: "keywords",
        content:
          "Audiobiography, your story, your voice, audio, audio books, memorials, my life memorial",
      },
      { name: "robots", content: "index, follow" },
      { name: "author", content: "Audiobiography" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "date", content: "2021-01-03", scheme: "YYYY-MM-DD" },
      { charset: "UTF-8" },
    ]);
  }

  // ngOnInit() {
  //   this.route.paramMap.subscribe(params => {
  //     const bookId = params.get("bookId") || null;
  //     const pageId = params.get("pageId");
  //     if (pageId) this.buildView(pageId, bookId);
  //   });
  // }






  ngOnDestroy(): void {
    console.log("APP COMP DESTROYED!");
  }
}
