import {Component, Input} from '@angular/core';

@Component({
  selector: 'pagetitle',
  template: `<h4 class="truncate">{{ pageTitle }}</h4>`,
  styles: ['./pagetitle.css']
})
export class PageTitleComponent {
  @Input() pageTitle: string;
}
