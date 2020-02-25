import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-allocation-info',
  templateUrl: './allocation-info.component.html',
  styleUrls: ['./allocation-info.component.css']
})
export class AllocationInfoComponent implements OnInit {

  @Input() work_assignment:any;
  @Input() user:any;

  reg_binding = false;

  constructor() { }

  ngOnInit() {
    if (this.work_assignment && this.work_assignment.regulation_min > this.work_assignment.choice) {
      this.reg_binding = true;
    }
  }

}
