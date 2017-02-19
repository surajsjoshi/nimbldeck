/*tab.ts*/

import { Component, Input } from '@angular/core';

@Component({
  selector: 'tab',
  styleUrls: ['./tabs.css'],
  template: `
    <div [hidden]="!active" class="pane">
      <ng-content></ng-content>
    </div>
  `
})
export class TabComponent {
  @Input() title: string;
  @Input() active = false;
}

