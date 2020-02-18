import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { InteractionService } from '../../services/interaction.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-workone',
  templateUrl: './workone.component.html',
  styleUrls: ['./workone.component.css']
})
export class WorkoneComponent implements OnInit {

  @ViewChild(MatStepper, {static:true}) 'stepper':MatStepper;

  user:any;
  work_assignment:any;
  right_date:boolean = true;
  selected_tab:number = 0;

  current_date = moment();
  // allocation_done:boolean = false;
  // min_work_done:boolean = false;
  work_done:boolean = false;
  // min_pages_to_complete:number;
  pages_to_complete:number;

  range_number:number = 16;

  // min_work_completed:number = 0;
  work_completed:number = 0;

  regulation_binds:boolean = false;

  sentiment_before:number = null;
  sentiment_after:number = null;

  constructor(
    private authService:AuthService,
    private interactionService:InteractionService,
    private flashMessage:FlashMessagesService,
    private router:Router,
  ) { }

  ngOnInit() {
    this.getUser(() => {
      // this.min_pages_to_complete = this.user.minimal_work;
      let register_date = moment(this.user.register_date)
      if (moment(this.current_date).isSame(register_date.add({weeks:1, days:this.user.role=='worker' ? 1 : 0}), 'day')) this.right_date = true;
      else { this.right_date=false; this.router.navigate(['/dashboard']); }

      let tasks = this.user.tasks;
      if (this.user.work_assignment) {
        this.work_assignment = this.user.work_assignment;
        this.assignWork();
        this.checkIfDone();
      } else {
        this.router.navigate(['/dashboard']);
      }
    })
  }

  addWork() {
    this.work_completed++;
    this.interactionService.registerWork('work1', this.work_completed).subscribe();
    this.checkIfDone();
  }
  checkIfDone() {
    if (this.user.tasks[this.user.tasks.map(e=>e.task_tag).indexOf('work1')].completed) {
      this.router.navigate(['dashboard']);
    } else if (this.work_completed >= this.pages_to_complete) {
      this.flashMessage.show('Work completed', {cssClass: 'my-flash-message success-flash', timeout:5000});
      this.work_done = true;
      if (this.stepper.selectedIndex==0) {
        this.moveStep();
        this.moveStep();
      } else {
        this.moveStep();
      }
    } else if (this.user.tasks[this.user.tasks.map(e=>e.task_tag).indexOf('work1')].sentiment_before && this.stepper.selectedIndex==0) {
      this.moveStep();
    }
  }

  getUser(callback) {
    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
      this.work_completed = this.user.tasks[this.user.tasks.map(e => e.task_tag).indexOf('work1')].work_completed;
      this.work_completed = this.work_completed ? this.work_completed : 0;
      callback();
    });
  }
  assignWork() {
    this.pages_to_complete = this.work_assignment.week2;
  }
  submit(step) {
    // Register satisfaction;
    if(step==0) {
      this.interactionService.registerSentiment('work1','before', this.sentiment_before).subscribe((res) => {
        if (res.success) {
          this.moveStep();
        }
      });
    } else if (step==2) {
      this.interactionService.registerSentiment('work1','after', this.sentiment_after).subscribe((res) => {
        if (res.success) {
          this.router.navigate(['dashboard'])
        }
      })
    }
  }
  moveStep() {
    this.stepper.selected.completed = true;
    this.stepper.selectedIndex++;
  }
}
