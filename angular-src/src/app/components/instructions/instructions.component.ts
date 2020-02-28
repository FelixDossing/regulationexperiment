import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import * as moment from 'moment';
import { Chart } from 'chart.js';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.css']
})
export class InstructionsComponent implements OnInit {

  user:any;
  current_date = moment();
  complete_dates:any[];

  control_completed:boolean = false;
  selected_tab:number = 0;

  correct_answers = [];

  work_completed:number = 0;
  pages_to_complete:number = 1;
  range_number:number = 3;

  exchange_rates = [2, 1.25, 1, 0.75, 0.5];

  regchoice:number = null;

  regulator_payment:any = {
    base:'450 DKK',
    min:'450 DKK',
    max:'599 DKK'
  }
  worker_payment:any = {
    base:'400 DKK',
    Min:'370 DKK',
    Max:'529 DKK'
  }

  answers = [null,null,null,null,null,null,null,null,null,null, null, null];
  answers_check = [null,null,null,null,null,null,null,null,null,null, null, null];

  constructor(
    private authService:AuthService,
    private router:Router,
    private flashMessage:FlashMessagesService,
    private interactionService:InteractionService,
  ) { }

  ngOnInit() {
    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
      let tasks = this.user.tasks;
      this.control_completed = tasks[tasks.map(e => e.task_tag).indexOf('instructions')].completed ? true : false;
      let w1 = moment(this.user.register_date, 'YYYY-MM-DD')
      let w2 = moment(w1.format()).add({weeks:1,days:this.user.role == 'worker' ? 1 : 0})
      let w3 = moment(w2).add(1, 'weeks')
      this.complete_dates = [w1.format("dddd, MMMM Do"), w2.format("dddd, MMMM Do"), w3.format("dddd, MMMM Do")];
      this.correct_answers = ['3','1 day',this.user.role=='regulator' ? '1 week' : '1 week and 1 day', 'regoneother','regbyoneother',
                                   this.user.role,"week12","week2", "25", "50", "50", "0"];
    })

  }
  choiceClick() {
    this.regchoice = this.regchoice===null ? 25 : this.regchoice;
  }

  addWork() {
    this.work_completed++;
  }

  nextTab() {
    this.selected_tab += 1;
  }
  tabClicked(val:number) {
    this.selected_tab=val;
  }
  checkAnswers(callback) {
    this.answers.forEach((answer,index) => {
      this.answers_check[index] = answer === this.correct_answers[index];
    })
    let failed = this.answers_check.includes(false);
    callback(failed);
  }
  completeControl() {
    this.checkAnswers((failed:boolean) => {
      if (failed) {
        this.interactionService.instructionsReport(this.user, this.answers_check).subscribe(res => {
          if (res.success) {
            document.getElementsByClassName('mat-sidenav-content')[0].scrollTo(0,0)
            this.flashMessage.show('You have incorrect answers', { cssClass:'my-flash-message alert-flash', timeout:3000});
          }
        })
      } else {
    this.authService.completeControl(this.user).subscribe(response => {
      if(response.success) {
        this.flashMessage.show('Instructions completed',{ cssClass:'my-flash-message success-flash', timeout:3000});
        this.router.navigate(['/dashboard']);
      }
    })
      }
    })
  }
}
