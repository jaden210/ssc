import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AngularFireStorage } from "@angular/fire/compat/storage";

@Injectable({ providedIn: "root" })
export class AdminService {


  constructor(
    public db: AngularFirestore,
    public storage: AngularFireStorage,
    public dialog: MatDialog,
    public router: Router,
    public snackbar: MatSnackBar
  ) {}

}
