import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyoneComponent } from './surveyone.component';

describe('SurveyoneComponent', () => {
  let component: SurveyoneComponent;
  let fixture: ComponentFixture<SurveyoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
