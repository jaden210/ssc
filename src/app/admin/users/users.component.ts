import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { UsersService } from "./users.service";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTable } from "@angular/material/table";
import { User } from "src/app/app.service";
import { combineLatest } from "rxjs";
import { Router } from "@angular/router";
import { Session } from "src/app/session/session.service";

@Component({
  selector: "users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.css"],
  providers: [UsersService],
})
export class UsersComponent implements OnInit {
  public loading: boolean;
  public users: User[] = [];
  public sessions: Session[] = [];
  public displayedColumns: string[] = ["select", "createdAt", "name", "phone", "sessions"];
  selection = new SelectionModel<User>(true, []);
  filterDate: Date = new Date();
  filterValue: string = "all";
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(
    private usersService: UsersService,
     private dialog: MatDialog,
     private _router: Router
     ) {}

  ngOnInit() {
   this.getUsers();
  }

  public getUsers() {
    this.loading = true;
    combineLatest([
      this.usersService.getUsers(),
      this.usersService.getSessions()
    ]).subscribe(([users, sessions]) => {
      this.sessions = sessions;
      this.users = users.map(u => {
        u['sessions'] = sessions.filter(s => s.users.find(us => us == u.id));
        return u;
      });
      if (users.length > 0) this.users = users.sort((a, b) => (a.sessions.length || 0) > (b.sessions.length || 0) ? -1 : 1);
      this.loading = false;
    });
  }

  public analytics(): void {
    window.open("https://analytics.google.com/analytics/web/#/p320450424/reports/intelligenthome", "_blank");
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.users ? this.users.length : 0;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.users.forEach((row) => this.selection.select(row));
  }

  private generateCSV(columns: string[] = []): void {
    if (!columns.length) {
      alert(
        "No columns were selected! Please select one or more columns for download."
      );
      return;
    }
    if (this.selection.selected.length) {
      let csv: string = "";
      columns
        .filter((c) => c)
        .forEach((column) => {
          csv += `${column},`;
        });
      csv += "\r\n";
      this.selection.selected.forEach((user) => {
        columns.forEach((col) => {
          csv += `${user[col]},`;
        });
        csv += "\r\n";
      });
      let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      this.downloadCSV(blob);
    } else
      alert(
        "No users were selected! Please select one or more users to download."
      );
  }

  private downloadCSV(blob): void {
    var blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl);
  }
}