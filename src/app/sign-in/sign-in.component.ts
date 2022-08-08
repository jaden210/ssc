import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppService } from "../app.service";
import { SignInService } from "./sign-in.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"],
})
export class SignInComponent implements OnInit {
  public error: string;
  public hide = true; // For password input.

  public form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private _router: Router,
    private _appService: AppService,
    private _signInService: SignInService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit() {}

  public signIn(): void {
    this.error = null;
    if (this.form.valid) {
      let sbr = this._snackBar.open(`Logging into your account`);
      this._signInService
        .signIn(this.form.value.email.trim(), this.form.value.password)
        .then(
          () => {
            sbr.dismiss();
          },
          (error) => {
            sbr.dismiss();
            console.error(error);
            if (
              error ==
              "* There is no user record corresponding to this identifier. The user may have been deleted."
            ) {
              this.error = "* This email does not exist in our database";
            } else if (
              (this.error =
                "* Password is invalid or the user does not have a password.")
            ) {
              this.error = "Password is invalid.";
            } else this.error = error;
          }
        );
    }
  }

  public trim(key: string): void {
    if (this.form.value[key])
      this.form.get(key).setValue(this.form.value[key].trim());
  }

  public togglePassword(event): void {
    event.preventDefault();
    this.hide = !this.hide;
  }

  public routeTo(url: string): void {
    window.open(url);
  }
}
