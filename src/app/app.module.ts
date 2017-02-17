import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginModule } from './login/login.module';
import { SignupModule } from './signup/signup.module';
import { PageTitleModule } from './shared/page-title/pagetitle.module';
import {TimeAgoPipe} from 'time-ago-pipe';
import { SinglesessionComponent } from './singlesession/singlesession.component';
import { OrderbyPipe } from './shared/pipes/orderby.pipe';
import { UserdropdownComponent } from './userdropdown/userdropdown.component';
import { ContactusComponent } from './contactus/contactus.component';
import { MysessionsComponent } from './mysessions/mysessions.component';
import {routing} from './app.routes';
import { CreatesessionComponent } from './createsession/createsession.component';
import { ApiService } from './services/api.service';
import { CardService } from './services/card.service';
import { ConfigurationService } from './services/configuration.service';
import { EditService } from './services/edit.service';
import { SessionService } from './services/session.service';
import { SessionboxComponent } from './sessionbox/sessionbox.component';
import { CurrentUser } from './shared/models/currentuser';
import { EditsessionComponent } from './editsession/editsession.component';
import { DuplicatesessionComponent } from './duplicatesession/duplicatesession.component';
import { ChoosecardtypeComponent } from './singlesession/choosecardtype/choosecardtype.component';
import { TextcardComponent } from './singlesession/textcard/textcard.component';

@NgModule({
  declarations: [
    AppComponent,
    TimeAgoPipe,
    OrderbyPipe,
    UserdropdownComponent,
    ContactusComponent,
    MysessionsComponent,
    SessionboxComponent,
    SinglesessionComponent,
    CreatesessionComponent,
    EditsessionComponent,
    DuplicatesessionComponent,
    ChoosecardtypeComponent,
    TextcardComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    routing,
    LoginModule,
    SignupModule,
    PageTitleModule
  ],
  providers: [ApiService, ConfigurationService, CurrentUser, SessionService, CardService, EditService],
  bootstrap: [AppComponent],
  entryComponents: [
    EditsessionComponent,
    DuplicatesessionComponent,
    ChoosecardtypeComponent,
    TextcardComponent
  ]
})
export class AppModule { }
