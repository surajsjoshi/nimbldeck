import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { PageTitleModule } from './shared/page-title/pagetitle.module';
import { SinglesessionComponent } from './singlesession/singlesession.component';
import { OrderbyPipe } from './shared/pipes/orderby.pipe';
import { UserdropdownComponent } from './userdropdown/userdropdown.component';
import { ContactusComponent } from './contactus/contactus.component';
import { MysessionsComponent } from './mysessions/mysessions.component';
import {routing} from './app.routes';
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
import { SessionboxComponent } from './sessionbox/sessionbox.component';
import { CurrentUser } from './shared/models/currentuser';
import { EditsessionComponent } from './editsession/editsession.component';
import { DuplicatesessionComponent } from './duplicatesession/duplicatesession.component';
import { QueriesService } from './services/queries.service';
import { SessionAnalyticsService } from './services/sessionanalytics.service';
import { ChoosecardtypeComponent } from './singlesession/choosecardtype/choosecardtype.component';
import { McqCardComponent } from './singlesession/mcqcard/mcqcard';
import { RatingCardComponent } from './singlesession/ratingcard/ratingcard';
import { ShortAnswerCardComponent } from './singlesession/shortanswercard/shortanswercard';
import { TextcardComponent } from './singlesession/textcard/textcard.component';
import { YesNoCardComponent } from './singlesession/yesnocard/yesnocard';
import {Ng2PaginationModule} from 'ng2-pagination'
import { RatingModule, CarouselModule, DropdownModule } from 'ng2-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { RatingComponent } from './dashboard/rating/rating.component';
import { WordcloudComponent } from './dashboard/wordcloud/wordcloud.component';
import { ClipboardModule } from 'angular2-clipboard';

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
    WordcloudComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    routing,
    PageTitleModule,
    Ng2PaginationModule,
    ChartsModule,
    RatingModule,
    CarouselModule,
    DropdownModule,
    ClipboardModule
  ],
  providers: [ ShortAnswerService, SessionAnalyticsService,
               ApiService, QueriesService, ConfigurationService,
               CurrentUser, SessionService, CardService, EditService],
  bootstrap: [AppComponent],
  entryComponents: [
    EditsessionComponent,
    DuplicatesessionComponent,
    ChoosecardtypeComponent,
    TextcardComponent,
    ShortAnswerCardComponent,
    YesNoCardComponent,
    RatingCardComponent,
    McqCardComponent
  ]
})
export class AppModule { }
