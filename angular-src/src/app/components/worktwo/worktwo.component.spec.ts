import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorktwoComponent } from './worktwo.component';

describe('WorktwoComponent', () => {
  let component: WorktwoComponent;
  let fixture: ComponentFixture<WorktwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorktwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorktwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
