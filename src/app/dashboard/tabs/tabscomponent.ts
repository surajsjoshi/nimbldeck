
import { ConfigurationService } from '../../services/configuration.service';
import { TabComponent } from './tabcomponent';
import { Component, AfterContentInit, QueryList, ContentChildren } from '@angular/core';
declare var ga: any;
declare var mixpanel: any;

@Component({
  selector: 'tabs',
  templateUrl: './tabs.html',
  styleUrls: ['./tabs.css']
})
export class TabsComponent implements AfterContentInit {

  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

  constructor(private conf: ConfigurationService) {}

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

}
