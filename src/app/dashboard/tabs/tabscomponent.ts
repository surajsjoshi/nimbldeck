import { TabComponent } from './tabcomponent';
import { Session } from '../../shared/models/session';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { ConfigurationService } from '../../services/configuration.service';
import { Component, AfterContentInit, QueryList, ContentChildren,  OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

declare var ga: any;
declare var mixpanel: any;

@Component({
  selector: 'tabs',
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.css']
})
export class TabsComponent implements AfterContentInit , OnInit , OnDestroy {

  session: Session;
  private subscription: Subscription;

  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  constructor(private conf: ConfigurationService, 
      private toastr: ToastsManager,
      private route: ActivatedRoute,
      private sessionService: SessionService) {

  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
         this.sessionService.getSession(params['id'])
        .subscribe(sess => this.mapSession(sess),
            (error => console.log(error)));
        });
 }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private mapSession(response) {
    this.session = response;
  }

  // contentChildren are set
  ngAfterContentInit() {
    // get all active tabs
     let activeTabs = this.tabs.filter(tab => tab.active);
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
      ga('send', 'pageview', '/sessions/dashboard/' + this.tabs.first.title);
    }

  }

  selectTab(selectedTab: TabComponent) {
    // deactivate all tabs
    mixpanel.time_event(selectedTab.title);
    this.tabs.forEach(tab => tab.active = false);

    selectedTab.active = true;
    mixpanel.track(selectedTab.title, {'user': this.conf.getUser().emailId});
    ga('set', 'userId', this.conf.getUser().userId);
    ga('send', 'pageview', '/sessions/dashboard/' + selectedTab.title);
  }

   sessionExport(event) {
    this.sessionService.exportSession(this.session.session_id).subscribe(
      (resp => this.exportSuccess(resp)),
        (error => console.log(error)));
  }

  exportSuccess(response: any){
       this.toastr.success('You will soon receive the export at your registered emailId');
  }

}
