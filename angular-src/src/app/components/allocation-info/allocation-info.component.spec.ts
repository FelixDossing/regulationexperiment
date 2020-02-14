import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationInfoComponent } from './allocation-info.component';

describe('AllocationInfoComponent', () => {
  let component: AllocationInfoComponent;
  let fixture: ComponentFixture<AllocationInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocationInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
