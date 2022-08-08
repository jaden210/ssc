import { NgModule } from "@angular/core";
import { AdminRoutingModule } from "./admin-routing.module";
import { AdminComponent } from "./admin.component";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { SharedModule } from "../shared-module";
import { UsersComponent } from "./users/users.component";

@NgModule({
  imports: [
    AdminRoutingModule,
    FormsModule,
    SharedModule
  ],
  declarations: [AdminComponent, UsersComponent],
  exports: [],
  providers: [DatePipe],
})
export class AdminModule {}
