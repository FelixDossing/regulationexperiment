import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  current_date = moment();
  picker_date = new Date();

  work_assignment:Array<any>;
  work_to_do:boolean = false;
  work1_active:boolean = false;
  work2_active:boolean = false;

  worker_cards = [
    { tag: 'instructions', title: 'Instructions', week:1, text:'In order to complete this part you must read the instructions and answer the control questions correctly.' },
    { tag: 'survey1', title: 'Survey 1', week:1 },
    { tag: 'allocation1', title: 'Allocation 1', week:1 },
    { tag: 'allocation2', title: 'Allocation 2', week:2 },
    { tag: 'work1', title: 'Work 1', week:2 },
    { tag: 'work2', title: 'Work 2', week:3 },
    { tag: 'survey2', title: 'Survey 2', week:3 },
  ];
  regulator_cards = [
    { tag: 'instructions', title: 'Instructions', week:1, text:'In order to complete this part you must read the instructions and answer the control questions correctly.' },
    { tag: 'allocation1', title: 'Allocation 1', week:1 },
    { tag: 'regulation1', title: 'Regulation 1', week:1 },
    { tag: 'allocation2', title: 'Allocation 2', week:2 },
    { tag: 'regulation2', title: 'Regulation 2', week:2 },
    { tag: 'work1', title: 'Work 1', week:2 },
    { tag: 'work2', title: 'Work 2', week:3 },
    { tag: 'survey1', title: 'Survey 1', week:3 },
    { tag: 'survey2', title: 'Survey 2', week:3 },
  ]

  user:any;
  columns = 2;
  alignment = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        this.columns = 1;
        if (this.user.role == 'regulator') {
          return [
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
          ];
        } else {
          return [
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
            { cols: 1, rows: 1 },
          ];
        }
      }
      this.columns = 2;
      if (this.user.role == 'regulator') {
        return [
          { cols: 2, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
      ];
      } else {
        return [
          { cols: 2, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
          { cols: 1, rows: 1 },
        ]
      }
    })
  );
  work_completed:any = {
    week1:0,
    week2:0
  };
  cards = [
      ]
  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService:AuthService,
    private router:Router,
    private interactionsService:InteractionService,
    ) {}

  ngOnInit(): void {
    // this.user$ = this.authService.getProfile();
    // console.log(this.user$)

    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
      if (this.user.work_assignment && (this.user.role != 'regulator' || this.user.tasks[this.user.tasks.map(e => e.task_tag).indexOf('regulation2')].completed)) {
        this.work_assignment = this.user.work_assignment;
      }
      this.setCards();
      this.checkWork();
    },
    err => {
      return false;
    });
  }

  setDate() {
    // This function is just for the picker
    this.current_date = moment(this.picker_date.toISOString())
    this.current_date.minutes(1);
  }

  checkWork() {
    this.work1_active = this.cards[this.cards.map(e=>e.tag).indexOf('work1')].active;
    this.work2_active = this.cards[this.cards.map(e=>e.tag).indexOf('work2')].active;
    // this.work_completed = this.cards[this.cards.map(e=>e.tag).indexOf('work1')].active;
    this.work_to_do = this.cards[this.cards.map(e=>e.tag).indexOf('work1')].active || this.cards[this.cards.map(e=>e.tag).indexOf('work2')].active ? true : false;
    this.work_completed.week1 = this.user.tasks[this.user.tasks.map(e=>e.task_tag).indexOf("work1")].work_completed
    this.work_completed.week1 = this.work_completed.week1 ? this.work_completed.week1 : 0;
    this.work_completed.week2 = this.user.tasks[this.user.tasks.map(e=>e.task_tag).indexOf("work2")].work_completed
    this.work_completed.week2 = this.work_completed.week2 ? this.work_completed.week2 : 0;
  }

  doWorkClick() {
    if (this.cards[this.cards.map(e=>e.tag).indexOf('work1')].active) {
      this.router.navigate(['/workweek2']);
    } else {
      this.router.navigate(['/workweek3']);
    }
  }

  setCards() {
    let w1_begin = moment(this.user.register_date, 'YYYY-MM-DD')
    let w2_begin = moment(w1_begin.format()).add({weeks:1,days:this.user.role == 'worker' ? 1 : 0})
    let w3_begin = moment(w2_begin).add(1, 'weeks')
    let completion_dates = [w1_begin, w2_begin, w3_begin];

    if (this.user.role == 'regulator') {
      this.cards = this.regulator_cards;
    } else if (this.user.role == 'worker') {
      this.cards = this.worker_cards;
    }
    let tasks = this.user.tasks;
    this.cards.forEach(card => {
      let task = this.user.tasks[this.user.tasks.map(e=>e.task_tag).indexOf(card.tag)];
      card.completed = task.completed ? true : false;
      card.begin = completion_dates[task.completion_week-1];
      card.end = moment(completion_dates[task.completion_week-1]).add(1,'days');

      card.link = task.link;
      card.active = this.current_date.isBetween(card.begin, card.end) ? true : false;

      card.active = task.completed ? false : card.active;

      if (this.user.role == 'regulator') {
        card.active = card.tag == 'work1' && !tasks[tasks.map(e => e.task_tag).indexOf('regulation2')].completed ? false : card.active;
        card.active = card.tag == 'survey' && !tasks[tasks.map(e => e.task_tag).indexOf('work2')].completed ? false : card.active;
        card.active = card.tag == 'allocation1' && !tasks[tasks.map(e => e.task_tag).indexOf('instructions')].completed ? false : card.active;
        card.active = card.tag == 'regulation1' && !tasks[tasks.map(e => e.task_tag).indexOf('allocation1')].completed ? false : card.active;
        card.active = card.tag == 'regulation2' && !tasks[tasks.map(e => e.task_tag).indexOf('allocation2')].completed ? false : card.active;
        card.active = card.tag == 'survey1' && !tasks[tasks.map(e => e.task_tag).indexOf('work2')].completed ? false : card.active;
        card.active = card.tag == 'survey2' && !tasks[tasks.map(e => e.task_tag).indexOf('survey1')].completed ? false : card.active;
      } else if (this.user.role == 'worker') {
        card.active = card.tag == 'work1' && !tasks[tasks.map(e => e.task_tag).indexOf('allocation2')].completed ? false : card.active;
        card.active = card.tag == 'survey1' && !tasks[tasks.map(e => e.task_tag).indexOf('instructions')].completed ? false : card.active;
        card.active = card.tag == 'allocation1' && !tasks[tasks.map(e => e.task_tag).indexOf('survey1')].completed ? false : card.active;
        card.active = card.tag == 'survey2' && !tasks[tasks.map(e => e.task_tag).indexOf('work2')].completed ? false : card.active;
      }
    })

  }
  cardClick(link, task) {
    let time = new Date()
    this.interactionsService.timestamp(this.user, time.toString(), task, 'begin').subscribe(res => {
      console.log(res);
    });

    this.router.navigate([link])
  }
}
