import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-welcome-user',
  templateUrl: './welcome-user.component.html',
  styleUrls: ['./welcome-user.component.css']
})
export class WelcomeUserComponent implements OnInit {
  @ViewChild('childModal') public childModal: ModalDirective;
  @Output() closed = new EventEmitter();
  @Output() finish = new EventEmitter();
  @Output() query = new EventEmitter();
  public isModalShown: boolean = false;
  public logoPath = environment.logoPath;
  public isGetStartedActive: boolean = false;
  constructor() { }

  ngOnInit() {

  }

  public showChildModal(): void {
    this.childModal.show();
  }

  public hideModal(): void {
    this.closed.emit();
    this.childModal.hide();
  }

  public getStarted(): void {
    this.isGetStartedActive = true;
  }

  public onFinish(): void {
    this.finish.emit();
    this.hideModal();
  }

  public onAskQuery(): void {
    this.query.emit();
    this.hideModal();
  }
}
