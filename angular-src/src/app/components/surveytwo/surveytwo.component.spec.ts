import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveytwoComponent } from './surveytwo.component';

describe('SurveytwoComponent', () => {
  let component: SurveytwoComponent;
  let fixture: ComponentFixture<SurveytwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveytwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveytwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
