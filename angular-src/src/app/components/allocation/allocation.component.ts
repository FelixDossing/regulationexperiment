import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { InteractionService } from '../../services/interaction.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { NONE_TYPE } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-allocation',
  templateUrl: './allocation.component.html',
  styleUrls: ['./allocation.component.css']
})
export class AllocationComponent implements OnInit {

  totally_done = false;

  suggestions:any = null;

  range_number:number = 16;

  waitscreen:boolean = false;
  user:any;
  selected_tab:number = 0;
  work_done:boolean = false;
  pages_to_complete:number;
  work_completed:number = 0;

  exchange_rates = [2, 1.25, 1, 0.75, 0.5];

  picker_date = new Date();

  current_date = moment();
  allocation_number = null;
  allocation_done = false;

  free_text:String;

  allocation_choices = [
    {name:'Choice 1', exchange_rate:2, w2_options:[], w3_options:[], choice:null, selected:false, choiceChart:<any>{}, chartId:"choiceOptions1"},
    {name:'Choice 2', exchange_rate:1.25, w2_options:[], w3_options:[], choice:null, selected:false, choiceChart:<any>{}, chartId:"choiceOptions2"},
    {name:'Choice 3', exchange_rate:1, w2_options:[], w3_options:[], choice:null, selected:false, choiceChart:<any>{}, chartId:"choiceOptions3"},
    {name:'Choice 4', exchange_rate:0.75, w2_options:[], w3_options:[], choice:null, selected:false, choiceChart:<any>{}, chartId:"choiceOptions4"},
    {name:'Choice 5', exchange_rate:0.5, w2_options:[], w3_options:[], choice:null, selected:false, choiceChart:<any>{}, chartId:"choiceOptions5"}
  ]

  constructor(
    private authService:AuthService,
    private interactionService:InteractionService,
    private flashMessage:FlashMessagesService,
    private router:Router,
  ) { }

  ngOnInit() {
    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
      this.userReady()
    },
    err => {
      this.user = JSON.parse(localStorage.getItem('user'))
      this.userReady()
    });
    for (let i = 0; i < this.allocation_choices.length; i++) {
      for (let j = 0; j <= 50; j++) {
        this.allocation_choices[i].w2_options.push(j);
        this.allocation_choices[i].w3_options.push((50-j)*this.allocation_choices[i].exchange_rate );
        // this.allocation_choices[i].w3_options.push(Math.round( 10*(50-j)/this.allocation_choices[i].exchange_rate)/10 );
      }
    }
  }
  ngAfterViewInit():void {
    if (this.selected_tab == 1) {
      this.drawChoice()   
    }
  }

  userReady() {
    this.waitscreen = this.user.role == 'worker';
    this.pages_to_complete = this.user.minimal_work;
    let tasks = this.user.tasks;

    // Get allocation number
    let register_date = moment(this.user.register_date)
    if (moment(this.current_date).isSame(register_date, 'day')) this.allocation_number = 1;
    else if (this.user.role == 'regulator' && moment(this.current_date).isSame(register_date.add(1, 'week'), 'day')) this.allocation_number = 2;
    else if (this.user.role == 'worker' && moment(this.current_date).isSame(register_date.add(8, 'days'),'day')) this.allocation_number = 2;

    if (this.allocation_number === null) { this.router.navigate(['/dahsboard']); }

    // Get suggestions for workers
    this.getSuggestions()

    // Check if open text has been submitted
    if (this.user.tasks.find(e => e.task_tag === 'allocation'+this.allocation_number).completed) this.totally_done = true;
    // Check if allocation has already been chosen
    else if (this.user.tasks.find(e => e.task_tag === 'allocation'+this.allocation_number).allocation) {
      this.work_done = true;
      this.allocation_done = true;
      this.selected_tab = 2;
    }
    else if (this.allocation_number && tasks.find(e => e.task_tag === 'allocation'+this.allocation_number).work_completed) {
      this.work_completed = tasks.find(e => e.task_tag === 'allocation'+this.allocation_number).work_completed;
      this.checkIfDone();
    }
  }
  
  getSuggestions() {
    if (this.user.role=="worker") {
      this.interactionService.getSuggestion(this.user, this.allocation_number).subscribe(res => {
        if (res.success && res.suggestions != null) {
          this.waitscreen = false;
          this.suggestions = res.suggestions;
        } else if (this.allocation_number === 2) {
          this.waitscreen = false;
          this.suggestions = [null, null, null, null, null];
        } else {
          let interval = setInterval(() => {
            this.interactionService.getSuggestion(this.user, this.allocation_number).subscribe(res => {
              if (res.success && res.suggestions != null) {
                this.waitscreen = false;
                this.suggestions = res.suggestions;
                clearInterval(interval);
              } else {
              }
            })
          }, 3000)
        }
      })
    }    
  }
  


  drawChoice() {
    this.getUser(() => {
      if (this.user && this.user.extra_allocation_info) {
        this.allocation_choices.forEach(choice => {
          let canvas = <HTMLCanvasElement> document.getElementById(choice.chartId);
          let ctx = canvas.getContext('2d');
          choice.choiceChart = new Chart(ctx, {
            type:'bar',
            data: {
              labels: choice.w2_options,
              datasets: [
                {
                  label:" Week 2 ",
                  data:[...choice.w2_options].reverse(),
                  backgroundColor:'rgba(102,107,104,1)',
                  borderColor:'black',
                },
                {
                  label:" Week 3 ",
                  data:[...choice.w3_options].reverse(),
                  backgroundColor:'rgba(196,199,209,1)',
                  borderColor:'black',
                }
              ]
            },
            options: {
              animation:{
                duration:0
              },
              hover:{animationDuration:0},
              responsiveAnimationDuration:0,
              legend: {
                labels: {
                  generateLabels: function() {
                    return [
                      {text:'Week 2', fillStyle:'rgba(102,107,104,1)'},
                      {text:'Week 3', fillStyle:'rgba(196,199,209,1)'},
                    ]
                  }
                }
              },
              tooltips: {
                callbacks: {
                  title:function() {}
                },
                position:'average',
                mode: 'index',
                intersect: false,
                bodyFontSize:20,
                bodySpacing:10,
                xPadding:10,
                yPadding:10,
              },
              scales: {
                xAxes: [{ 
                  display:false,
                  stacked:true,
                  gridLines: { display: false },
                }],
                yAxes: [{ 
                  stacked:true,
                  gridLines: { display: false },
                }]
              }
            }
          });
        })    
      }
    }) 
  }
  getUser(callback) {
    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
      callback();
    });
  }
  nextTab() {
    this.selected_tab += 1;
  }
  addWork() {
    this.work_completed++;
    this.interactionService.registerMinWork('allocation'+this.allocation_number, this.work_completed).subscribe();
    this.checkIfDone();
  }
  checkIfDone() {
    if (this.work_completed == this.pages_to_complete) {
      this.flashMessage.show('Work completed', {cssClass: 'my-flash-message success-flash', timeout:5000});
      this.selected_tab = 1;
      this.work_done = true;
      this.drawChoice();
    }
  }
  choiceClick(choice, index) {
    if (choice == null) {
      this.allocation_choices[index].choice = 25;
      this.allocationChange(index);
    }
  }
  allocationChange(choice_num) {
    this.allocation_choices[choice_num].selected = true;
    if (this.user && this.user.extra_allocation_info) {
    // console.log(document.getElementById('allocation'+choice_num).getAttribute('aria-valuenow'))
    let newColorsW2 = [];
    let newColorsW3 = [];
    
    let newBorders = [];

    this.allocation_choices[choice_num].w2_options.forEach(x => (x == this.allocation_choices[choice_num].choice) ? newColorsW2.push('rgba(102,107,104,1)') : newColorsW2.push('rgba(102,107,104,0.2)'));
    this.allocation_choices[choice_num].w2_options.forEach(x => (x == this.allocation_choices[choice_num].choice) ? newColorsW3.push('rgba(196,199,209,1)') : newColorsW3.push('rgba(196,199,209,0.2)'));
    this.allocation_choices[choice_num].w2_options.forEach(x => (x == this.allocation_choices[choice_num].choice) ? newBorders.push(1) : newBorders.push(0));
    newColorsW2.reverse();
    newColorsW3.reverse();
    newBorders.reverse();

    this.allocation_choices[choice_num].choiceChart.data.datasets[0].backgroundColor = newColorsW2;
    this.allocation_choices[choice_num].choiceChart.data.datasets[1].backgroundColor = newColorsW3;
    this.allocation_choices[choice_num].choiceChart.data.datasets[0].borderWidth = newBorders;
    this.allocation_choices[choice_num].choiceChart.data.datasets[1].borderWidth = newBorders;

    this.allocation_choices[choice_num].choiceChart.update();
    }
  }
  submitAllocation() {
    let submit_choices = []
    this.allocation_choices.forEach(choice => {
      submit_choices.push({
        exchange_rate:choice.exchange_rate,
        choice:choice.choice,
      });
    });
    // Send to server
    this.interactionService.registerChoice('allocation'+this.allocation_number, submit_choices).subscribe(res => {
      if (res.success) {
        this.flashMessage.show(res.msg, {cssClass: 'my-flash-message success-flash', timeout: 5000 });
        this.selected_tab = 2;
        this.allocation_done = true;
      } else {
        this.flashMessage.show(res.msg, {cssClass: 'my-flash-message alert-flash', timeout: 5000 });
      }
    });
  }
  submitText() {
    this.interactionService.registerAllocationText('allocation'+this.allocation_number, this.free_text).subscribe(res => {
      if (res.success) {
        this.flashMessage.show(res.msg, {cssClass: 'my-flash-message success-flash', timeout: 5000 });
        this.router.navigate(['/dashboard']);
      } else {
        this.flashMessage.show(res.msg, {cssClass: 'my-flash-message alert-flash', timeout: 5000 });
      }
    })
  }

}
