import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { Observable , Operator} from 'rxjs/Rx';

@Injectable()
export class EditService {

  currentEditType = '';
  currentObject: any = null;

  private updateSource: Subject<boolean>;
  private update: Observable<boolean>;

  constructor() {
      this.updateSource = new Subject<boolean>();
      this.update = this.updateSource.asObservable();
  }

  announceUpdate() {
    console.log('Announce update');
    this.updateSource.next(true);
  }

  updateSubscription(): Observable<boolean> {
    return this.update;
  }

  isEditing(): boolean {
    return this.currentObject !== null;
  }

  getCurrent(): any {
    return this.currentObject;
  }

  setCurrentEdit(type, object) {
    this.currentObject = object;
    this.currentEditType = type;
  }

  resetEdits() {
    this.currentObject = null;
    this.currentEditType = '';
  }

}
