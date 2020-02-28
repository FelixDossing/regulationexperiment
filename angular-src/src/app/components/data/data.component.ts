import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {

  data_show = "userdata";

  datahead:string = "";
  data:any[] = [];
  constructor(private adminService:AdminService) { }

  ngOnInit() {
    this.displayUserData();
  }
  changeView() {
    if (this.data_show == 'userdata') {
      this.displayUserData();
    } else if (this.data_show == 'timedata') {
      this.displayTimeData();
    } else if (this.data_show == 'instructions') {
      this.displayInstructionsData();
    } else if (this.data_show == 'payment') {
      this.displayPaymentData();
    }
  }
  displayInstructionsData() {
    this.adminService.getData().subscribe(data => {
      this.datahead = "userid; time; question1; question2; question3; question4; question5; question6; question7; question8; question9; question10";
      this.data = [];
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].instructionreports.length; j++) {
          this.data.push(`${data[i]._id}; ${data[i].instructionreports[j].time}; ${data[i].instructionreports[j].report[0]}; ${data[i].instructionreports[j].report[1]}; ${data[i].instructionreports[j].report[2]}`+
                         `; ${data[i].instructionreports[j].report[3]}; ${data[i].instructionreports[j].report[4]}; ${data[i].instructionreports[j].report[5]}; ${data[i].instructionreports[j].report[6]}`+
                         `; ${data[i].instructionreports[j].report[7]}; ${data[i].instructionreports[j].report[8]}; ${data[i].instructionreports[j].report[9]}`)
        }
      }
    })
  }

  displayTimeData() {
    this.adminService.getData().subscribe(data => {
      this.datahead = "userid; name; timestamp";
      this.data = [];
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].timestamps.length; j++) {
          this.data.push(`${data[i]._id}; ${data[i].timestamps[j].stamp_tag}; ${data[i].timestamps[j].time}`);
        }
      }
    })
  }
  displayPaymentData() {
    this.adminService.getData().subscribe(data => {
      this.datahead = "userid; groupid; session; firstname; lastname; email; role; payoffweek; payment_method; regnum; accnum; phonenum; instr_completed; allo1_completed; allo2_copmleted; work1_completed; work2_completed; survey1_completed; survey2_completed; reg1_completed; reg2_completed; bombchoice; bombplacement; payoffchoice";

      for (let i = 1; i<3; i++) {
        this.datahead += `; reg${i}.choice1; reg${i}.choice2; reg${i}.choice3; reg${i}.choice4; reg${i}.choice5`+
                                      `; reg${i}.c1.below0; reg${i}.c1.below10; reg${i}.c1.below20; reg${i}.c1.below30; reg${i}.c1.below40; reg${i}.c1.below50`+
                                      `; reg${i}.c2.below0; reg${i}.c2.below10; reg${i}.c2.below20; reg${i}.c2.below30; reg${i}.c2.below40; reg${i}.c2.below50`;
      }
      this.data = [];
      for (let i = 0; i < data.length; i++) {
        this.data.push(`${data[i]._id}; ${data[i].group_id}; ${data[i].session}; ${data[i].first_name}; ${data[i].last_name}; ${data[i].email}; ${data[i].role}; ${data[i].payoffweek}`);
        let survey2 = data[i].tasks.find(e => e.task_tag == 'survey2');
        if (survey2.completed) {
          let payment = survey2.answers.find(e => e.name == 'paymentmethod');
          this.data[i] += `; ${payment.answer}; ${payment.regnum}; ${payment.accnum}; ${payment.phonenum}`
        } else {
          this.data[i] += `; .; .; .; .`;
        }
        this.data[i] += `; ${data[i].tasks.find(e => e.task_tag =='instructions').completed ? 'true' : 'false'}; ${data[i].tasks.find(e => e.task_tag =='allocation1').completed ? 'true' : 'false'}`+
                        `; ${data[i].tasks.find(e => e.task_tag =='allocation2').completed ? 'true' : 'false'}; ${data[i].tasks.find(e => e.task_tag =='work1').completed ? 'true' : 'false'}`+
                        `; ${data[i].tasks.find(e => e.task_tag =='work2').completed ? 'true' : 'false'}; ${data[i].tasks.find(e => e.task_tag =='survey1').completed ? 'true' : 'false'}`+
                        `; ${data[i].tasks.find(e => e.task_tag =='survey2').completed ? 'true' : 'false'}`;
        if (this.data[i].role == 'regulator') {
          this.data[i] += `; ${data[i].tasks.find(e => e.task_tag == 'regulation1').completed ? 'true' : 'false'}; ${data[i].tasks.find(e => e.task_tag == 'regulation2').completed ? 'true' : 'false'}`
        } else {
          this.data[i] += "; .; ."
        }
        let survey1 = data[i].tasks.find(e => e.task_tag == "survey1");
        if (survey1.completed) {
          this.data[i] += `; ${survey1.answers.find(e => e.name === 'risk').answer}; ${survey1.bombplacement}`;
        } else {
          this.data[i] += '; .; .';
        }
        // Regulation 1 & 2
        let reg_payoffweek = data[i].tasks.find(e => e.task_tag === 'regulation'+data[i].payoffweek);
        if (reg_payoffweek && reg_payoffweek.completed) {
          this.data[i] += `; ${reg_payoffweek.payoffchoice}`;
        } else {
          this.data[i] += "; .";
        }

        for (let j = 1; j < 3; j++) {
          let regulation = data[i].tasks[data[i].tasks.map(e=>e.task_tag).indexOf('regulation'+j)];
          if(regulation && regulation.completed == true) {

            let part1 = regulation.parts[0];
            this.data[i] += `; ${part1.choices[0]}; ${part1.choices[1]}; ${part1.choices[2]}; ${part1.choices[3]}; ${part1.choices[4]}; ${part1.suggestions.min[0]}; ${part1.suggestions.min[1]}; ${part1.suggestions.min[2]}; ${part1.suggestions.min[3]}; ${part1.suggestions.min[4]}`;
            let part3 = regulation.parts[2];
            this.data[i] += `; ${part3.choices[0][0].input}; ${part3.choices[0][1].input}; ${part3.choices[0][2].input}; ${part3.choices[0][3].input}; ${part3.choices[0][4].input}; ${part3.choices[0][5].input}`+
                                        `; ${part3.choices[1][0].input}; ${part3.choices[1][1].input}; ${part3.choices[1][2].input}; ${part3.choices[1][3].input}; ${part3.choices[1][4].input}; ${part3.choices[1][5].input}`;
          } else {
            let add = ""
            for (let k = 0; k < 17; k++) {
              add += "; ."
            }
            this.data[i] += add;
          }
        }

      }
    })
  }

  displayUserData() {
    this.adminService.getData().subscribe(data => {
      console.log(data);
      this.datahead = "";
      this.data = [];
      // User data
      this.datahead = "id; first_name; last_name; kuid; email; register_date; session; role; group_id; extra_allocation_info"
      // Survey 1
      this.datahead += "; birthyear; country; hometype; interestrate; highinteretexp; highinterestpayment; height; weight; smoking; drinking; risk"
      // Survey 2
      this.datahead += "; gender; faculty; field; leftright; equalincomes; publicownership; responsibility; compitition; hardwork; zerosum; prohibitsugar; taxsugar; hidesugar"+
                                    "; prohibitalcohol; taxalcohol; hidealcohol; prohibittobacco; taxtobacco; hidetobacco; reginterests; vote"
      // Assignment
      this.datahead += "; assignedweek; assignedchoice; regfound; regset";
      // Allocation 1+2
      for (let i = 1; i<3; i++) {
        this.datahead += `; allocation${i}.choice1; allocation${i}.choice2; allocation${i}.choice3; allocation${i}.choice4; allocation${i}.choice5; allocation${i}.freetext`;
      }
      // Regulation 1+2
      for (let i = 1; i<3; i++) {
        this.datahead += `; reg${i}.choice1; reg${i}.choice2; reg${i}.choice3; reg${i}.choice4; reg${i}.choice5`+
                                      `; reg${i}.suggest1; reg${i}.suggest2; reg${i}.suggest3; reg${i}.suggest4; reg${i}.suggest5`+
                                      `; reg${i}.c1.optimala; reg${i}.c1.optimalb; reg${i}.c1.optimalc; reg${i}.c1.optimald; reg${i}.c1.optimale; reg${i}.c1.optimalf`+
                                      `; reg${i}.c2.optimala; reg${i}.c2.optimalb; reg${i}.c2.optimalc; reg${i}.c2.optimald; reg${i}.c2.optimale; reg${i}.c2.optimalf`+
                                      `; reg${i}.c1.below0; reg${i}.c1.below10; reg${i}.c1.below20; reg${i}.c1.below30; reg${i}.c1.below40; reg${i}.c1.below50`+
                                      `; reg${i}.c2.below0; reg${i}.c2.below10; reg${i}.c2.below20; reg${i}.c2.below30; reg${i}.c2.below40; reg${i}.c2.below50`+
                                      `; reg${i}.sentiment; reg${i}.free_text; reg${i}.help; reg${i}.harm; reg${i}.rank_spread; reg${i}.rank_impatiance; reg${i}.rank_practical`+
                                      `; reg${i}.rank_confused; reg${i}.rank_mistake; reg${i}.rank_lovework; reg${i}.rank_other`;
      }
      // work 1 & 2
      for (let i = 1; i < 3; i++) {
        this.datahead += `; work${i}.sentiment_before; work${i}.sentiment_after`
      }

      for (let i = 0; i < data.length; i++) {
        let par = data[i];

        // User data
        this.data.push(`${par._id}; ${par.first_name}; ${par.last_name}; ${par.ku_id}; ${par.email}; ${par.register_date}; ${par.session}; ${par.role}; `+
                       `${par.group_id}; ${par.extra_allocation_info}`)
        // Survey 1 data
        let survey1 = par.tasks[par.tasks.map(e=>e.task_tag).indexOf('survey1')];
        if (survey1 && survey1.completed==true) {
          survey1 = survey1.answers;
          this.data[i] += `; ${survey1[0].answer}; ${survey1[1].answer}; ${survey1[2].answer}; ${survey1[3].answer}; ${survey1[4].answer}; ${survey1[5].answer}`+
          `; ${survey1[6].answer}; ${survey1[7].answer}; ${survey1[8].answer}; ${survey1[9].answer}; ${survey1[10].answer}`;
        } else {
          this.data[i] += '; .; .; .; .; .; .; .; .; .; .; .';
        }
        // Survey 2 data
        let survey2 = par.tasks[par.tasks.map(e=>e.task_tag).indexOf('survey2')];
        if (survey2 && survey2.completed == true) {
          survey2 = survey2.answers;
          this.data[i] += `; ${survey2[0].answer}; ${survey2[1].answer}; ${survey2[2].answer}; ${survey2[3].answer}; ${survey2[4].answer}; ${survey2[5].answer}`+
                                      `; ${survey2[6].answer}; ${survey2[7].answer}; ${survey2[8].answer}; ${survey2[9].answer}; ${survey2[10].answer}; ${survey2[11].answer}`+
                                      `; ${survey2[12].answer}; ${survey2[13].answer}; ${survey2[14].answer}; ${survey2[15].answer}; ${survey2[16].answer}; ${survey2[17].answer}`+
                                      `; ${survey2[18].answer}; ${survey2[19].answer}; ${survey2[20].answer}`
        } else {
          this.data[i] += "; .; .; .; .; .; .; .; .; .; .; .; .; .; .; .; .; .; .; .; .; .";
        }
        // Assignment
        let assignment = par.work_assignment;
        if (assignment) {
          this.data[i] += `; ${assignment.week}; ${assignment.choice_number}; ${assignment.regulator_found}; ${assignment.regulation_set}`;
        } else {
          this.data[i] += '; .; .; .; .';
        }

        // Allocation 1 & 2
        for (let j = 1; j < 3; j++) {
          let allocation = par.tasks[par.tasks.map(e=>e.task_tag).indexOf('allocation'+j)];
          if (allocation && allocation.completed == true) {
            this.data[i] += `; ${allocation.allocation[0].choice}; ${allocation.allocation[1].choice}; ${allocation.allocation[2].choice}; ${allocation.allocation[3].choice}; ${allocation.allocation[4].choice}`
          } else {
            this.data[i] += "; .; .; .; .; .";
          }
          this.data[i] = allocation.free_text ? this.data[i]+`; ${allocation.free_text}` : this.data[i]+"; .";
        }
        // Regulation 1 & 2
        for (let j = 1; j < 3; j++) {
          let regulation = par.tasks[par.tasks.map(e=>e.task_tag).indexOf('regulation'+j)];
          if(regulation && regulation.completed == true) {
            let part1 = regulation.parts[0];
            this.data[i] += `; ${part1.choices[0]}; ${part1.choices[1]}; ${part1.choices[2]}; ${part1.choices[3]}; ${part1.choices[4]}; ${part1.suggestions.min[0]}; ${part1.suggestions.min[1]}; ${part1.suggestions.min[2]}; ${part1.suggestions.min[3]}; ${part1.suggestions.min[4]}`;
            let part2 = regulation.parts[1];
            this.data[i] += `; ${part2.choices[0][0].input}; ${part2.choices[0][1].input}; ${part2.choices[0][2].input}; ${part2.choices[0][3].input}; ${part2.choices[0][4].input}; ${part2.choices[0][5].input}`+
                                        `; ${part2.choices[1][0].input}; ${part2.choices[1][1].input}; ${part2.choices[1][2].input}; ${part2.choices[1][3].input}; ${part2.choices[1][4].input}; ${part2.choices[1][5].input}`;
            let part3 = regulation.parts[2];
            this.data[i] += `; ${part3.choices[0][0].input}; ${part3.choices[0][1].input}; ${part3.choices[0][2].input}; ${part3.choices[0][3].input}; ${part3.choices[0][4].input}; ${part3.choices[0][5].input}`+
                                        `; ${part3.choices[1][0].input}; ${part3.choices[1][1].input}; ${part3.choices[1][2].input}; ${part3.choices[1][3].input}; ${part3.choices[1][4].input}; ${part3.choices[1][5].input}`;
            let part4 = regulation.parts[3];
            this.data[i] += `; ${part4.choices[0].sentiment}; ${part4.choices[0].free_text}; ${part4.choices[0].help}; ${part4.choices[0].harm}`;
            if (part4.choices[0].explain_ranking) {
              this.data[i] += `; ${part4.choices[0].explain_ranking.indexOf('It is nicer to spread it out, than to do everything at once')}; ${part4.choices[0].explain_ranking.indexOf('Being too impatient')}` +
              `; ${part4.choices[0].explain_ranking.indexOf('Having better time on the later date')}; ${part4.choices[0].explain_ranking.indexOf('Being confused or inattentive')};` +
              `; ${part4.choices[0].explain_ranking.indexOf('Implementing the wrong choice by mistake')}; ${part4.choices[0].explain_ranking.indexOf('Wanting to complete more work in total')};` +
              `; ${part4.choices[0].explain_ranking.indexOf('Other reasons')}`;
            } else {
              this.data[i] += '; .; .; .; .; .; .; .'
            }
          } else {
            let add = ""
            for (let k = 0; k < 45; k++) {
              add += "; ."
            }
            this.data[i] += add;
          }
      }
      // Work 1 & 2
      for (let j = 1; j < 3; j++) {
        let work = par.tasks[par.tasks.map(e=>e.task_tag).indexOf('work'+j)];
        if (work && work.completed == true) {
          this.data[i] += `; ${work.sentiment_before}; ${work.sentiment_after}`;
        } else {
          this.data[i] += '; .; .'
        }
      }
      }
    })
  }

}
