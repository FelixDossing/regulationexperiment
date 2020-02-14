import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-allocation-info',
  templateUrl: './allocation-info.component.html',
  styleUrls: ['./allocation-info.component.css']
})
export class AllocationInfoComponent implements OnInit {

  @Input() work_assignment:any;
  @Input() user:any;

  constructor() { }

  ngOnInit() {
  }

}
