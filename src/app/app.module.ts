import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "./shared-module";
import { APP_INITIALIZER, ErrorHandler, NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireFunctionsModule } from "@angular/fire/compat/functions";
import { environment } from "../environments/environment";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from "./app.component";
import { MaterialModule } from "./material/material.module";
import { AppRoutingModule } from "./app-routing.module";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { Router } from "@angular/router";
import { StartComponent } from "./start/start.component";
import { SignInComponent } from "./sign-in/sign-in.component";

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    StartComponent,
    SignInComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    HttpClientModule,
    SharedModule.forRoot(),
  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent],
  providers: [],
})
export class AppModule {}
