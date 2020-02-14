import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { InteractionService } from '../../services/interaction.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import * as nouislider from 'nouislider';
import * as moment from 'moment';
import { DataRowOutlet } from '@angular/cdk/table';

@Component({
  selector: 'app-regulation',
  templateUrl: './regulation.component.html',
  styleUrls: ['./regulation.component.css']
})
export class RegulationComponent implements OnInit {

  user:any;
  totally_completed = false;

  free_text:String;
  help:String;
  harm:String;
  satisfaction:number = null;

  current_date = moment();
  picker_date = new Date();
  week:number;
  click_value = null;

  parts = [
    {completed:false, rendered:false},
    {completed:false, rendered:false},
    {completed:false, rendered:false},
    {completed:false, rendered:false},
  ];
  belief_colors = ['#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'];
  // belief_colors = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2']
  beliefs = ['0', '0 - 10', '0 - 20', '0 - 30', '0 - 40', '0 - 49'];
  calc_beliefs = ['0','1-10','11-21','21-30','31-40','41-49','50'];

  sub_names = ['A','B','C','D','E','F'];
  main_tab:number = 0;
  regulation_tab:number = 0;
  optimal_tab:number = 1;
  belief_tab:number = 1;

  regulation_choices = [
    {name:'Choice 1', exchange_rate:0.5, w2_options:[], w3_options:[], selected:false, choiceChart:<any>{}, chartId:"choiceOptions1",choice:null, suggestion_min:null,suggestion_text:""},
    {name:'Choice 2', exchange_rate:0.75, w2_options:[], w3_options:[], selected:false, choiceChart:<any>{}, chartId:"choiceOptions2",choice:null, suggestion_min:null,suggestion_text:""},
    {name:'Choice 3', exchange_rate:1, w2_options:[], w3_options:[], selected:false, choiceChart:<any>{}, chartId:"choiceOptions3",choice:null, suggestion_min:null,suggestion_text:""},
    {name:'Choice 4', exchange_rate:1.25, w2_options:[], w3_options:[], selected:false, choiceChart:<any>{}, chartId:"choiceOptions4",choice:null, suggestion_min:null,suggestion_text:""},
    {name:'Choice 5', exchange_rate:1.5, w2_options:[], w3_options:[], selected:false, choiceChart:<any>{}, chartId:"choiceOptions5",choice:null, suggestion_min:null,suggestion_text:""},
  ];
  optimal_choices = [
    {name:'Choice 1', exchange_rate:0.5, w2_options:[], w3_options:[], choiceCharts:[<any>{},<any>{},<any>{},<any>{},<any>{},<any>{}], choices:[],chartId:["optimal00","optimal01","optimal02","optimal03","optimal04","optimal05"]},
    {name:'Choice 2', exchange_rate:0.75, w2_options:[], w3_options:[], choiceCharts:[<any>{},<any>{},<any>{},<any>{},<any>{},<any>{}], choices:[],chartId:["optimal10","optimal11","optimal12","optimal13","optimal14","optimal15"]},
  ];
  distribution_choices = [
    {name:'Choice 1', exchange_rate:0.5, w2_options:[], w3_options:[], choiceCharts:[<any>{},<any>{},<any>{},<any>{},<any>{},<any>{}], distribution_beliefs:[], beliefs_calculated:[],chartId:["d01","d02","d03","d04","d05","d06"]},
    {name:'Choice 2', exchange_rate:0.75, w2_options:[], w3_options:[], choiceCharts:[<any>{},<any>{},<any>{},<any>{},<any>{},<any>{}], distribution_beliefs:[], beliefs_calculated:[],chartId:["d11","d12","d13","d14","d15","d16"]},
  ];
  belief_done:any[] = [false,false];

  constructor(
    private authService:AuthService,
    private interactionService:InteractionService,
    private flashMessage:FlashMessagesService,
    private router:Router,
  ) { }

  ngOnInit() {
    let namedChartAnnotation = ChartAnnotation;
    namedChartAnnotation["id"]="annotation";
    Chart.pluginService.register(namedChartAnnotation);

    // Check if we are in week 2 or week 3 or not at any valid date
    this.authService.getProfile().subscribe(response => {

      this.user = response.user;
      let register_date = moment(this.user.register_date)
      if (moment(this.current_date).isSame(register_date, 'day')) {
        this.week = 1;
      } else if (this.current_date.isSame(register_date.add({ weeks:1 }), 'day' )) {
        this.week = 2;
      } else {
        this.week = null;
      }
  
      // If not this.week then we just want to render at screen that says when they can complete the assignment
      if (this.week) {
        let task = this.user.tasks[this.user.tasks.map(e => e.task_tag).indexOf('regulation'+this.week)]

        if (task.parts && task.parts[3]) {
          this.totally_completed = true;
          // this.router.navigate(['/dashboard'])
        }
        else if (task.parts && task.parts[2]) {
          this.main_tab = 3;
          this.parts[0].completed = true;
          this.parts[1].completed = true;
          this.parts[2].completed = true;
        }
        else if (task.parts && task.parts[1]) {
          this.main_tab = 2;
          this.parts[0].completed = true;
          this.parts[1].completed = true;
        }
        else if (task.parts && task.parts[0]) {
          this.main_tab = 1;
          this.parts[0].completed = true;
        }


        this.regulation_choices.forEach((choice, index) => {
          for (let i = 0; i <= 50; i++) {
            choice.w2_options.push(i);
            choice.w3_options.push( Math.round( 10*(50-i)/choice.exchange_rate)/10 );
          }
        });
        this.optimal_choices.forEach((choice,i) => {
          for (let i = 0; i <= 50; i++) {
            choice.w2_options.push(i);
            choice.w3_options.push( Math.round( 10*(50-i)/choice.exchange_rate)/10 );
          }
          for (let i = 0; i < this.sub_names.length; i++) {
            choice.choices.push({ name:this.sub_names[i], input:null, worker_w2_choice:i*10, worker_w3_choice:Math.round(10*(50-i*10)/choice.exchange_rate)/10, selected:false });
          }
        })
        this.distribution_choices.forEach((choice,i) => {
          for (let i = 0; i <= 50; i++) {
            choice.w2_options.push(i);
            choice.w3_options.push( Math.round( 10*(50-i)/choice.exchange_rate)/10 );
          }
          for (let i = 0; i < this.beliefs.length; i++) {
            choice.distribution_beliefs.push( { name:this.beliefs[i], input:null, min:0 } )
          }
          for (let i = 0; i < this.calc_beliefs.length; i++) {
            choice.beliefs_calculated.push( { name:this.calc_beliefs[i], value:0 } )
          }
        })
    
      }

    });
  }


  setDate() {
    // This function is just for the picker
    this.current_date = moment(this.picker_date.toISOString());
    let register_date = moment(this.user.register_date).hours(0);
    if (moment(this.current_date).isSame(register_date, 'day')) {
      this.week = 1;
    } else if (this.current_date.isSame(register_date.add({ weeks:1 }), 'day' )) {
      this.week = 2;
    } else {
      this.week = null;
    }
    let task = this.user.tasks[this.user.tasks.map(e => e.task_tag).indexOf('regulation'+this.week)]

    this.totally_completed = false;
    if (task.parts && task.parts[2]) {
      this.totally_completed = true;
      // this.router.navigate(['/dashboard'])
    }
    else if (task.parts && task.parts[1]) {
      this.main_tab = 2;
      this.parts[0].completed = true;
      this.parts[1].completed = true;
    }
    else if (task.parts && task.parts[0]) {
      this.main_tab = 1;
      this.parts[0].completed = true;
    }
}


  mainTab() {
    if (this.main_tab == 0) {
      this.regCharts()
    }
    else if (this.main_tab == 1) {
      this.optimalCharts()
    }
    else if (this.main_tab == 2) {
      this.beliefCharts()
    }
  }

  regCharts() {
    if (!this.parts[0].rendered) {
      this.regulation_choices.forEach((choice, index) => {
        let canvas = <HTMLCanvasElement> document.getElementById(choice.chartId);
        let ctx = canvas.getContext('2d');
        choice.choiceChart = new Chart(ctx, {type:'bar',
          data: {labels: choice.w2_options,
            datasets: [
              {label:"Week 2",data:[...choice.w2_options].reverse(),backgroundColor:'rgba(102,107,104,1)'},
              {label:"Week 3",data:[...choice.w3_options].reverse(),backgroundColor:'rgba(196,199,209,1)'}
            ]
          },
          options: {
            legend: {
              labels: {
                generateLabels: function() {
                  return [
                    {text:'Week 2', fillStyle:'rgba(102,107,104,1)'},
                    {text:'Week 3', fillStyle:'rgba(196,199,209,1)'},
                    {text:'Removed choices', fillStyle:'#fafafa'}
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
            scales: { xAxes: [{display:false,stacked:true,gridLines: { display: false },}], yAxes: [{stacked:true,gridLines: {display: false}}]
            },
            annotation: {
              annotations: [{
                type:'line',
                model:'vertical',
                scaleID:'x-axis-0',
                value:null,
                borderColor:'rgba(255,0,0,0.5)',
                borderWidth:10,
                drawTime:'afterDraw',
                label: {
                  backgroundColor:"rgba(255,255,255,0.7)",
                  fontColor:"black",
                  yAdjust:-120,
                  xAdjust:-80,
                  content:"SUGGESTED MINIMUM",
                  enabled:true
                }
              }],
            }
          }
        })
      })
      this.parts[0].rendered = true;
    }
  }
  optimalCharts() {
    if(this.main_tab == 1 && !this.parts[1].rendered) {
      this.optimal_choices.forEach((choice, index) => {
        choice.choiceCharts.forEach((chart,chart_index) => {
          let colors_w2 = [];
          let colors_w3 = [];
          this.optimal_choices[index].w2_options.forEach(x => colors_w2.push('rgba(102,107,104,1)'));
          this.optimal_choices[index].w3_options.forEach(x => colors_w3.push('rgba(196,199,209,1)'));
      
          colors_w2[this.optimal_choices[index].choices[chart_index].worker_w2_choice] = '#04ef82';
          colors_w3[this.optimal_choices[index].choices[chart_index].worker_w2_choice] = '#04ef82';
          colors_w2.reverse();
          colors_w3.reverse();      
      
          let canvas = <HTMLCanvasElement> document.getElementById(choice.chartId[chart_index]);
          let ctx = canvas.getContext('2d');
          choice.choiceCharts[chart_index] = new Chart(ctx, {type:'bar',
            data: {labels: choice.w2_options,
              datasets: [
                {label:"Week 2",data:[...choice.w2_options].reverse(),backgroundColor:colors_w2,borderColor:'black'},
                {label:"Week 3",data:[...choice.w3_options].reverse(),backgroundColor:colors_w3,borderColor:'black'}
              ]
            },
            options: {
              legend: {
                labels: {
                  generateLabels: function() {
                    return [
                      {text:'Week 2', fillStyle:'rgba(102,107,104,1)'},
                      {text:'Week 3', fillStyle:'rgba(196,199,209,1)'},
                      {text:'Workers choice', fillStyle:'#04ef82'},
                      {text:'Your choice', fillStyle:'#ff6600'},
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
              scales: { xAxes: [{display:false,stacked:true,gridLines: { display: false },}], yAxes: [{stacked:true,gridLines: {display: false}}]
              }
            }
          })
        })
      })
      this.parts[1].rendered = true;        
    }
  }
  beliefCharts() {
    if(this.main_tab == 2 && !this.parts[2].rendered[this.belief_tab]) {
      this.distribution_choices.forEach((choice, index) => {
        choice.choiceCharts.forEach((chart, chart_index) => {
          // W2 : 102, 107, 104 - W3: 196, 199, 209
          let interval_min = 50 - chart_index*10;
          interval_min = interval_min == 0 ? 1 : interval_min;          

          let colorsW2 = new Array(interval_min).fill('rgba(102,107,104,0.3)');
          colorsW2 = colorsW2.concat(new Array(51-interval_min).fill('rgba(102,107,104,1)'));
          let colorsW3 = new Array(interval_min).fill('rgba(196,199,209,0.3)');
          colorsW3 = colorsW3.concat(new Array(51-interval_min).fill('rgba(196, 199, 209, 1)'));
          let border = new Array(interval_min).fill(0);
          border = border.concat(new Array(51-interval_min).fill(1));

          let canvas = <HTMLCanvasElement> document.getElementById(choice.chartId[chart_index]);
          let ctx = canvas.getContext('2d');
          chart = new Chart(ctx, {type:'bar',
            data: {labels: choice.w2_options,
              datasets: [
                {label:"Week 2",data:[...choice.w2_options].reverse(),backgroundColor:colorsW2, borderWidth:border, borderColor:"black"},
                {label:"Week 3",data:[...choice.w3_options].reverse(),backgroundColor:colorsW3, borderWidth:border, borderColor:"black"}
              ]
            },
            options: {
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
              scales: { xAxes: [{display:false,stacked:true,gridLines: { display: false },}], yAxes: [{stacked:true,gridLines: {display: false}}]
              }
            }
          })
        })
      })
      this.parts[2].rendered = true;        
    }
  }
  regulationChange(choice_num) {
    this.regulation_choices[choice_num].selected = true;

    let newColorsW2 = [];
    let newColorsW3 = [];

    this.regulation_choices[choice_num].w2_options.forEach(x => (x < this.regulation_choices[choice_num].choice) ? newColorsW2.push('#fafafa') : newColorsW2.push('rgba(102,107,104,1)'));
    this.regulation_choices[choice_num].w2_options.forEach(x => (x < this.regulation_choices[choice_num].choice) ? newColorsW3.push('#fafafa') : newColorsW3.push('rgba(196,199,209,1)'));
    newColorsW2.reverse();
    newColorsW3.reverse();

    this.regulation_choices[choice_num].choiceChart.data.datasets[0].backgroundColor = newColorsW2;
    this.regulation_choices[choice_num].choiceChart.data.datasets[1].backgroundColor = newColorsW3;
    this.regulation_choices[choice_num].choiceChart.update();
  }
  suggestionChange(choice_num) {
    this.regulation_choices[choice_num].choiceChart.options.annotation.annotations[0].value = 50-this.regulation_choices[choice_num].suggestion_min;
    this.regulation_choices[choice_num].choiceChart.options.annotation.annotations[0].label.xAdjust = this.regulation_choices[choice_num].suggestion_min > 39 ? 80 : -80;
    if (this.regulation_choices[choice_num].suggestion_min == 0) this.regulation_choices[choice_num].choiceChart.options.annotation.annotations[0].value = null;
    this.regulation_choices[choice_num].choiceChart.update();
  }
  optimalChange(choice_num, sub_choice_num) {
    // let element = <HTMLElement> document.getElementsByClassName('card'+choice_num+'_'+sub_choice_num)[0];
    // let top = element.offsetTop;
    // document.getElementById(this.optimal_choices[choice_num].chartId).style.marginTop = top +'px';

    this.optimal_choices[choice_num].choices[sub_choice_num].selected = true;

    let newColorsW2 = [];
    let newColorsW3 = [];
    let newBorders = [];
    this.optimal_choices[choice_num].w2_options.forEach(x => (x == this.optimal_choices[choice_num].choices[sub_choice_num].input) ? newColorsW2.push('#ff6600') : newColorsW2.push('rgba(102,107,104,0.5)'));
    this.optimal_choices[choice_num].w2_options.forEach(x => (x == this.optimal_choices[choice_num].choices[sub_choice_num].input) ? newColorsW3.push('#ff6600') : newColorsW3.push('rgba(196,199,209,0.5)'));
    this.optimal_choices[choice_num].w2_options.forEach(x => (x == this.optimal_choices[choice_num].choices[sub_choice_num].input) ? newBorders.push(1) : newBorders.push(0));

    newColorsW2[this.optimal_choices[choice_num].choices[sub_choice_num].worker_w2_choice] = '#04ef82';
    newColorsW3[this.optimal_choices[choice_num].choices[sub_choice_num].worker_w2_choice] = '#04ef82';
    newBorders[this.optimal_choices[choice_num].choices[sub_choice_num].worker_w2_choice] = 1;
    newColorsW2.reverse();
    newColorsW3.reverse();
    newBorders.reverse();

    this.optimal_choices[choice_num].choiceCharts[sub_choice_num].data.datasets[0].backgroundColor = newColorsW2;
    this.optimal_choices[choice_num].choiceCharts[sub_choice_num].data.datasets[1].backgroundColor = newColorsW3;
    this.optimal_choices[choice_num].choiceCharts[sub_choice_num].data.datasets[0].borderWidth = newBorders;
    this.optimal_choices[choice_num].choiceCharts[sub_choice_num].data.datasets[1].borderWidth = newBorders;

    this.optimal_choices[choice_num].choiceCharts[sub_choice_num].update();
  }
  updateDistribution(input_no) {
    let week = this.belief_tab;
    let distribution = this.distribution_choices[input_no].distribution_beliefs
    for (let i=1; i<distribution.length; i++) {
      distribution[i].min = Math.max(...distribution.slice(0,i).map(e=>e.input)) ;
      if (distribution[i].input) {
        distribution[i].input = distribution[i].input > distribution[i-1].input ? distribution[i].input : distribution[i-1].input;
      }
    }

    this.distribution_choices[input_no].beliefs_calculated.forEach((belief,index) => {
      if (index == 0) belief.value = distribution[0].input != null ? distribution[0].input : 0;
      else if (index == 6) belief.value = 100 - Math.max(...distribution.map(e=>e.input));
      else if (distribution[index].input != null) {
        belief.value = distribution[index].input - distribution[index-1].input
      }
    })

    this.belief_done[input_no] = this.distribution_choices[input_no].distribution_beliefs.filter(belief => {
      return belief.input == null;
    }).length == 0;
  }
  distrClick(choice_index, belief_index, amount) {
    let beliefs = this.distribution_choices[choice_index].beliefs_calculated;
    if (beliefs[belief_index].value + amount >= 0 && beliefs[belief_index].value + amount <= 100) {
      beliefs[belief_index].value += amount;
      let sum = beliefs.map(e=>e.value).reduce((t, n) => t+n);
      if (sum>100) {
        // Get index of nearest lower non_zero
        let this_index = beliefs.map(e=>e.value).slice(belief_index+1,).findIndex(e=>e>0);
        if (this_index != -1) {
          this_index++;
          beliefs[belief_index + this_index].value--;
        } else {
          let other_index = beliefs.map(e=>e.value).slice(0,belief_index).reverse().findIndex(e=>e>0)+1;
          beliefs[belief_index - other_index].value--;
        }
      }
      if (sum==99 && amount<0) {
        let this_index = beliefs.map(e=>e.value).slice(belief_index+1,).findIndex(e=>e<100);
        if (this_index != -1) {
          this_index++;
          beliefs[belief_index + this_index].value++;
        } else {
          let other_index = beliefs.map(e=>e.value).slice(0,belief_index).reverse().findIndex(e=>e<100)+1;
          beliefs[belief_index - other_index].value++;
        }

      }
      if (beliefs.map(e=>e.value).reduce((t,n) => t+n)==100) {
        let dist_beliefs = this.distribution_choices[choice_index].distribution_beliefs;
        dist_beliefs.forEach((dist, index) => {
          if (index==0) dist.input = beliefs[0].value
          else {
            dist.input = beliefs.slice(0,index+1).map(e=>e.value).reduce((t,n) => t+n)
            // Update minimums
            dist.min = dist_beliefs[index-1].input;
          } 
        })
      }

    }
  }

  submit(index) {
    // Send to server
    let submit_choices = { name:'part'+(index+1), week: this.week, choices:[], suggestions:{ min:[], text:[] } }
    if (index == 0) {
      this.regulation_choices.forEach((choice,i) => {
        submit_choices.choices.push(choice.choice);
        submit_choices.suggestions.min.push(choice.suggestion_min);
        submit_choices.suggestions.text.push(choice.suggestion_text);
      })
    }
    else if (index == 1) {
      this.optimal_choices.forEach((optimal,i) => {
        submit_choices.choices.push(optimal.choices)
      });
    }
    else if (index == 2) {
      this.distribution_choices.forEach((choice,i) => {
        submit_choices.choices.push(choice.distribution_beliefs);
      })
    }
    else if (index == 3) {
      submit_choices.choices.push({satisfaction:this.satisfaction,free_text:this.free_text,help:this.help,harm:this.harm})
      console.log(submit_choices)
    }
    this.interactionService.registerRegChoice(submit_choices).subscribe(res => {
      if (res.success) {
        this.flashMessage.show(res.msg, {cssClass: 'my-flash-message success-flash', timeout: 5000})
        if (index < 3) {
          this.parts[index].completed = true;
          this.main_tab = index+1;
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.flashMessage.show(res.msg, {cssClass: 'my-flash-message alert-flash', timeout: 5000})
      }
    })
  }
}
