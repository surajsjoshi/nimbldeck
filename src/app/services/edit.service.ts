import { Injectable } from '@angular/core';

@Injectable()
export class EditService {

  currentEditType = '';
  currentObject: any = null;

  constructor() {

  }

  isEditing(): boolean {
    return this.currentObject !== null;
  }

  getCurrent(): any {
    console.log(this.currentObject);
    return this.currentObject;
  }

  setCurrentEdit(type, object) {
    this.currentObject = object;
    this.currentEditType = type;
    console.log(this.currentObject);
  }

  resetEdits() {
    this.currentObject = null;
    this.currentEditType = '';
  }

}
