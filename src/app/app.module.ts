import { routing } from './app.routes';
import {ToastOptions} from 'ng2-toastr';
import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ClipboardModule } from 'ngx-clipboard';
import { HttpModule, Http } from '@angular/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import {ToastModule} from 'ng2-toastr/ng2-toastr';
import { ApiService } from './services/api.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CardService } from './services/card.service';
import { EditService } from './services/edit.service';
import { AppSharedService } from './app-shared.service';
import { LoginComponent } from './login/login.component';
import { OrderbyPipe } from './shared/pipes/orderby.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { CurrentUser } from './shared/models/currentuser';
import { DashboardComponent } from './dashboard/dashboard';
import { SignupComponent } from './signup/signup.component';
import { QueriesService } from './services/queries.service';
import { SessionService } from './services/session.service';
import { TabComponent } from './dashboard/tabs/tabcomponent';
import { TabsComponent } from './dashboard/tabs/tabscomponent';
import { RatingModule, BsDropdownModule } from 'ngx-bootstrap';
import { AnalyticsService } from './services/analytics.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PieChartComponent } from './dashboard/piechart/piechart';
import { BarChartComponent } from './dashboard/barchart/barchart';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RoundNumberPipe } from './shared/pipes/roundnumber.pipe';
import { CarouselComponent } from './carousel/carousel.component';
import { McqCardComponent } from './singlesession/mcqcard/mcqcard';
import { ShortAnswerService } from './services/shortanswer.service';
import { ContactusComponent } from './contactus/contactus.component';
import {DragulaService, DragulaModule} from 'ng2-dragula/ng2-dragula';
import { RatingComponent } from './dashboard/rating/rating.component';
import {TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { PageTitleModule } from './shared/page-title/pagetitle.module';
import { ConfigurationService } from './services/configuration.service';
import { SessionboxComponent } from './sessionbox/sessionbox.component';
import { MysessionsComponent } from './mysessions/mysessions.component';
import { YesNoCardComponent } from './singlesession/yesnocard/yesnocard';
import { EditsessionComponent } from './editsession/editsession.component';
import { RatingCardComponent } from './singlesession/ratingcard/ratingcard';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { SessionAnalyticsService } from './services/sessionanalytics.service';
import { UserdropdownComponent } from './userdropdown/userdropdown.component';
import { PlayerComponent } from './shared/components/player/player.component';
import { WordcloudComponent } from './dashboard/wordcloud/wordcloud.component';
import { TextcardComponent } from './singlesession/textcard/textcard.component';
import { CreatesessionComponent } from './createsession/createsession.component';
import { SinglesessionComponent } from './singlesession/singlesession.component';
import { DuplicatesessionComponent } from './duplicatesession/duplicatesession.component';
import { QuestionChartBoxComponent } from './dashboard/questionchartbox/questionchartbox';
import { ShortAnswerCardComponent } from './singlesession/shortanswercard/shortanswercard';
import { OnboardingComponent } from './shared/components/help/onboarding/onboarding.component';
import { ChoosecardtypeComponent } from './singlesession/choosecardtype/choosecardtype.component';
import { WelcomeUserComponent } from './shared/components/modals/welcome-user/welcome-user.component';











export class CustomOption extends ToastOptions {
  animate = 'flyRight'; // you can override any options available
  newestOnTop = false;
  positionClass: 'toast-top-center';
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

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
    DragulaModule,
    BrowserAnimationsModule,
    ToastModule.forRoot(),
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [Http]}})
  ],

  providers: [OrderbyPipe, ShortAnswerService, SessionAnalyticsService,
    AnalyticsService, ApiService, QueriesService,
    ConfigurationService, CurrentUser, SessionService, CardService,
    EditService, AppSharedService, {provide: ToastOptions, useClass: CustomOption}],

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
