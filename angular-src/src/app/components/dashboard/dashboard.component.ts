import { Component, ɵConsole } from '@angular/core';
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
    { tag: 'instructions', title: 'Instructions', week:1, text:'Read the instructions and answer the control questions correctly.' },
    { tag: 'survey1', title: 'Survey 1', week:1, text:'Answer survey questions' },
    { tag: 'allocation1', title: 'Allocation task 1', week:1, text:'Choose an allocation of work' },
    { tag: 'allocation2', title: 'Allocation task 2', week:2, text:'Choose an allocation of work' },
    { tag: 'work1', title: 'Work 1', week:2, text:'Complete work by moving sliders to 50' },
    { tag: 'work2', title: 'Work 2', week:3, text:'Complete work by moving sliders to 50' },
    { tag: 'survey2', title: 'Survey 2', week:3, text:'Answer survey questions' },
  ];
  regulator_cards = [
    { tag: 'instructions', title: 'Instructions', week:1, text:'Read the instructions and answer the control questions correctly.' },
    { tag: 'allocation1', title: 'Allocation task 1', week:1, text:'Choose an allocation of work' },
    { tag: 'regulation1', title: 'Regulation task 1', week:1, text:"Choose your prefered regulation of the worker's choices" },
    { tag: 'allocation2', title: 'Allocation task 2', week:2, text:'Choose an allocation of work' },
    { tag: 'regulation2', title: 'Regulation task 2', week:2, text:"Choose your prefered regulation of the worker's choices" },
    { tag: 'work1', title: 'Work 1', week:2, text:'Complete work by moving sliders to 50' },
    { tag: 'work2', title: 'Work 2', week:3, text:'Complete work by moving sliders to 50' },
    { tag: 'survey1', title: 'Survey 1', week:3, text:'Answer survey questions' },
    { tag: 'survey2', title: 'Survey 2', week:3, text:'Answer survey questions' },
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

      if (this.user.work_assignment && (this.user.role != 'regulator' || this.user.tasks.find(e => e.task_tag === 'regulation2').completed)) {
        this.work_assignment = this.user.work_assignment;
      }
      this.setCards();
      this.checkWork();
    },
    err => {
      this.user = JSON.parse(localStorage.getItem('user'))
      console.log(err);
    });
  }

  checkWork() {
    // this.work1_active = this.cards.find(e => e.tag == 'work1').active;
    this.work1_active = this.cards.find(e => e.tag === 'work1').active;
    this.work2_active = this.cards.find(e => e.tag === 'work2').active;
    // this.work_completed = this.cards[this.cards.map(e=>e.tag).indexOf('work1')].active;
    this.work_to_do = this.cards.find(e => e.tag === 'work1').active || this.cards.find(e=> e.tag === 'work2').active ? true : false;
    this.work_completed.week1 = this.user.tasks.find(e => e.task_tag === "work1").work_completed;
    this.work_completed.week1 = this.work_completed.week1 ? this.work_completed.week1 : 0;
    this.work_completed.week2 = this.user.tasks.find(e => e.task_tag === "work2").work_completed;
    this.work_completed.week2 = this.work_completed.week2 ? this.work_completed.week2 : 0;
  }

  doWorkClick() {
    if (this.cards.find(e => e.tag === 'work1').active) {
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
      let task = this.user.tasks.find(e => e.task_tag == card.tag)
      card.completed = task.completed ? true : false;
      card.begin = completion_dates[task.completion_week-1];
      card.end = moment(completion_dates[task.completion_week-1]).add(1,'days');

      card.link = task.link;
      card.active = this.current_date.isBetween(card.begin, card.end) ? true : false;

      card.active = task.completed ? false : card.active;

      if (this.user.role == 'regulator') {
        card.active = card.tag == 'work1' && !tasks.find(e => e.task_tag === 'regulation2').completed ? false : card.active;
        card.active = card.tag == 'survey' && !tasks.find(e => e.task_tag === 'work2').completed ? false : card.active;
        card.active = card.tag == 'allocation1' && !tasks.find(e => e.task_tag === 'instructions').completed ? false : card.active;
        card.active = card.tag == 'regulation1' && !tasks.find(e => e.task_tag === 'allocation1').completed ? false : card.active;
        card.active = card.tag == 'regulation2' && !tasks.find(e => e.task_tag ==='allocation2').completed ? false : card.active;
        card.active = card.tag == 'survey1' && !tasks.find(e => e.task_tag === 'work2').completed ? false : card.active;
        card.active = card.tag == 'survey2' && !tasks.find(e => e.task_tag === 'survey1').completed ? false : card.active;
      } else if (this.user.role == 'worker') {
        card.active = card.tag == 'work1' && !tasks.find(e => e.task_tag === 'allocation2').completed ? false : card.active;
        card.active = card.tag == 'survey1' && !tasks.find(e => e.task_tag === 'instructions').completed ? false : card.active;
        card.active = card.tag == 'allocation1' && !tasks.find(e => e.task_tag === 'survey1').completed ? false : card.active;
        card.active = card.tag == 'survey2' && !tasks.find(e => e.task_tag === 'work2').completed ? false : card.active;
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
