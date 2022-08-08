import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { AdminService } from "./admin.service";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { AppService } from "../app.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements AfterViewInit {

  constructor(
    public adminService: AdminService,
    public appService: AppService,
    public router: Router,
    public dialog: MatDialog
  ) {}

  ngAfterViewInit() {
  }
}
