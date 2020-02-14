import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { EventEmitter } from 'protractor';
import { InteractionService } from '../../services/interaction.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.css']
})
export class WorkComponent implements OnInit {

  @Input() target:any;
  @Input() completed:number;
  @Output() pageDoneEvent = new EventEmitter();
  // @Input() ranges_per_page:number;
  @Input() set ranges_per_page(ranges_per_page:number) {
    this.range_num = ranges_per_page;
    this.setRanges();
  }

  // ranges_per_page = 20;
  ranges:any[]=[];
  maxOffset = 20;
  range_num:number;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );
  constructor(
    private breakpointObserver:BreakpointObserver,
    private interactionService:InteractionService,
  ) { }

  ngOnInit() {
    this.setRanges();
  }
  spacePress(event) {
    event.preventDefault();
    // Focus first non-completed range
    let first = this.ranges.map(e=>e.value==50).indexOf(false);
    let element = document.getElementById('range'+first);
    element.focus();
  }
  checkComplete() {
    if (this.ranges.every(range => range.value === 50)) {
      this.setRanges();
      this.pageDoneEvent.emit();
    }
  }
  setRanges() {
    this.ranges = [];
    for (let i = 0; i < this.range_num; i++) {
      this.ranges.push({value:0, margin:Math.random()*this.maxOffset, id:i})
    }
  }
  cheat() {
    this.ranges.forEach(range => range.value=50)
    this.pageDoneEvent.emit();
    this.ranges.forEach(range => range.value=0)
  }
}
