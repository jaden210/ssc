import { NgModule } from "@angular/core";
import {
  Routes,
  RouterModule,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { StartComponent } from "./start/start.component";

const routes: Routes = [
  { path: "", redirectTo: "start", pathMatch: "full" },
  { path: "start", component: StartComponent },
  {
    path: "session/:sessionId",
    loadChildren: () =>
    import("./session/session.module").then((m) => m.SessionModule),
  },
  { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: "enabled",
      scrollPositionRestoration: "enabled",
    }),
  ],
  exports: [RouterModule],
  providers: [
    {
      provide: "externalUrlRedirectResolver",
      useValue: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        window.location.href = (route.data as any).externalUrl;
      },
    },
  ],
})
export class AppRoutingModule {}
