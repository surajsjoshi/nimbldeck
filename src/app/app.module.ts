import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AppComponent } from './app.component';
import { PageTitleModule } from './shared/page-title/pagetitle.module';
import { SinglesessionComponent } from './singlesession/singlesession.component';
import { OrderbyPipe } from './shared/pipes/orderby.pipe';
import { UserdropdownComponent } from './userdropdown/userdropdown.component';
import { ContactusComponent } from './contactus/contactus.component';
import { MysessionsComponent } from './mysessions/mysessions.component';
import { routing } from './app.routes';
import { CreatesessionComponent } from './createsession/createsession.component';
import { BarChartComponent } from './dashboard/barchart/barchart';
import { DashboardComponent } from './dashboard/dashboard';
import { PieChartComponent } from './dashboard/piechart/piechart';
import { QuestionChartBoxComponent } from './dashboard/questionchartbox/questionchartbox';
import { TabComponent } from './dashboard/tabs/tabcomponent';
import { TabsComponent } from './dashboard/tabs/tabscomponent';
import { ApiService } from './services/api.service';
import { CardService } from './services/card.service';
import { ConfigurationService } from './services/configuration.service';
import { EditService } from './services/edit.service';
import { SessionService } from './services/session.service';
import { ShortAnswerService } from './services/shortanswer.service';
import { AuthService } from './services/auth.service';
import { SessionboxComponent } from './sessionbox/sessionbox.component';
import { CurrentUser } from './shared/models/currentuser';
import { EditsessionComponent } from './editsession/editsession.component';
import { DuplicatesessionComponent } from './duplicatesession/duplicatesession.component';
import { QueriesService } from './services/queries.service';
import { SessionAnalyticsService } from './services/sessionanalytics.service';
import { AnalyticsService } from './services/analytics.service';
import { ChoosecardtypeComponent } from './singlesession/choosecardtype/choosecardtype.component';
import { McqCardComponent } from './singlesession/mcqcard/mcqcard';
import { RatingCardComponent } from './singlesession/ratingcard/ratingcard';
import { ShortAnswerCardComponent } from './singlesession/shortanswercard/shortanswercard';
import { TextcardComponent } from './singlesession/textcard/textcard.component';
import { YesNoCardComponent } from './singlesession/yesnocard/yesnocard';
import { NgxPaginationModule } from 'ngx-pagination';
import { RatingModule, BsDropdownModule } from 'ngx-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { RatingComponent } from './dashboard/rating/rating.component';
import { WordcloudComponent } from './dashboard/wordcloud/wordcloud.component';
import { ClipboardModule } from 'ngx-clipboard';
import { RoundNumberPipe } from './shared/pipes/roundnumber.pipe';
import { CarouselComponent } from './carousel/carousel.component';
import { WelcomeUserComponent } from './shared/components/modals/welcome-user/welcome-user.component';
import { OnboardingComponent } from './shared/components/help/onboarding/onboarding.component';
import { PlayerComponent } from './shared/components/player/player.component';
import { AppSharedService } from './app-shared.service';
import {DragulaService, DragulaModule} from 'ng2-dragula/ng2-dragula';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './shared/guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
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
    TextcardComponent,
    ShortAnswerCardComponent,
    YesNoCardComponent,
    RatingCardComponent,
    McqCardComponent,
    DashboardComponent,
    TabsComponent,
    TabComponent,
    QuestionChartBoxComponent,
    PieChartComponent,
    BarChartComponent,
    RatingComponent,
    WordcloudComponent,
    RoundNumberPipe,
    CarouselComponent,
    WelcomeUserComponent,
    OnboardingComponent,
    PlayerComponent,
    LoginComponent,
    SignupComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    routing,
    PageTitleModule,
    NgxPaginationModule,
    ChartsModule,
    RatingModule.forRoot(),
    BsDropdownModule.forRoot(),
    ClipboardModule,
    ModalModule,
    ClipboardModule,
    DragulaModule
  ],

  providers: [OrderbyPipe, ShortAnswerService, SessionAnalyticsService,
              AnalyticsService, ApiService, QueriesService,
              ConfigurationService, SessionService, CardService,
              EditService, AppSharedService, AuthService, AuthGuard],
  bootstrap: [AppComponent],

  entryComponents: [
    EditsessionComponent,
    DuplicatesessionComponent,
    ChoosecardtypeComponent,
    TextcardComponent,
    ShortAnswerCardComponent,
    YesNoCardComponent,
    RatingCardComponent,
    McqCardComponent,
    CarouselComponent
  ]
})
export class AppModule { }
