import { PageTitleComponent } from './pagetitle';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


@NgModule({
    imports: [CommonModule],
    declarations: [PageTitleComponent],
    exports: [PageTitleComponent]
})

export class PageTitleModule {
}
