/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SessionboxComponent } from './sessionbox.component';

describe('SessionboxComponent', () => {
  let component: SessionboxComponent;
  let fixture: ComponentFixture<SessionboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
