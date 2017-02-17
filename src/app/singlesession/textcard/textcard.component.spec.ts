/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TextcardComponent } from './textcard.component';

describe('TextcardComponent', () => {
  let component: TextcardComponent;
  let fixture: ComponentFixture<TextcardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextcardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
