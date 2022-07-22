import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SessionComponent } from "./session.component";
import { GameComponent } from "./game/game.component";
import { SessionService } from "./session.service";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ShareComponent } from "./share/share.component";
import { SharedModule } from "../shared-module";

const routes: Routes = [
  {
    path: "",
    component: SessionComponent,
    children: [
      {path: "", component: GameComponent},
      {path: "matches", component: DashboardComponent},
      {path: "share", component: ShareComponent},
    ]
  }
];

@NgModule({
  declarations: [SessionComponent, GameComponent, ShareComponent, DashboardComponent],
  imports: [RouterModule.forChild(routes), SharedModule],
  providers: [SessionService],
})
export class SessionModule {}
