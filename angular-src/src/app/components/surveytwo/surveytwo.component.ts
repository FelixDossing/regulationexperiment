import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import * as moment from 'moment';

@Component({
  selector: 'app-surveytwo',
  templateUrl: './surveytwo.component.html',
  styleUrls: ['./surveytwo.component.css']
})
export class SurveytwoComponent implements OnInit {

  user:any;
  survey_completed:boolean = false;
  selected_tab:number = 0;
  current_date = moment();

  payment_method:string;

  party_options = [{txt:"Socialdemokratiet (A)",val:"A"},{txt:"Radikale Venstre (B)",val:'B'}, {txt:"Det Konservative Folkeparti (C)",val:"C"},{txt:"Nye Borgerlige (D)",val:"D"}, {txt:"Klaus Riskær Pedersen (E)",val:"E"},{txt:"SF- Socialistisk Folkeparti (F)",val:"F"},{txt:"Liberal Alliance (I)",val:"I"}, {txt:"Kristendemokraterne (K)",val:"K"}, {txt:"Dansk Folkeparti (O)",val:"O"}, {txt:"Stramp Kurs (P)",val:"P"},{txt:"Venstre (V)",val:"V"},{txt:"Enhedslisten (Ø)",val:"Ø"},{txt:"Alternativeet (Å)",val:"Å"},{txt:"None of the above",val:"none"},{txt:'I am allowed to vote in Denmark, but chose not to',val:'abstained'},{txt:"I am not allowed to vote in Denmark",val:"nonvoter"}]

  five_scale = ['Very good', 'Good', 'Neither good nor bad', 'Bad', 'Very bad']
  numbers = [...Array(8).keys()].map(e => { return { val:(e+2).toString(), txt:(e+2).toString()} })
  regulation_options = [...Array(5).keys()].map(e => {return { val:(e+1).toString(), txt:`${e+1} ${this.five_scale[e]}` }});

  questions = [
    { name:"gender", text:"What is your gender?", values:['female','male','other'], options:['Female','Male','Other'], answer:null, check:null },
    { name:"faculty", text:"Which faculty do you study at?", label:"Select faculty" , options:[{val:'hum',txt:'Humanities'},
                                                                               {val:'jur',txt:'Law'},
                                                                               {val:'science',txt:'Science'},
                                                                               {val:'social',txt:'Social sciences'},
                                                                               {val:'health',txt:'Health'},
                                                                               {val:'theol', txt:'Theology'},
                                                                               {val:'nonstudent',txt:'I am not a student'}], answer:null, check:null },
    { name:"field", text:"What is your field of study?", label:"Field", answer:null, check:null},
    { name:"leftright", text:"In political matters, people talk of 'the left' and 'the right'. How would you place your views on this scale, generally speaking?",
        options:[{val:'1',txt:"Left"}].concat(this.numbers).concat([{val:'10',txt:'Right'}]), answer:null, check:null},
    { name:"equalincomes" ,text:"How would you place your views on this scale?",options:[{val:'1',txt:'Incomes should be made more equal'}].concat(this.numbers).concat({val:'10',txt:'We need larger income differences as incentives for individual effort'}), answer:null, check:null},
    { name:"publicownership", text:"How would you place your views on this scale?",options:[{val:'1',txt:'Private ownership of business and industry should be increased'}].concat(this.numbers).concat({val:'10',txt:'Government ownership of business and industry should be increased'}), answer:null, check:null},
    { name:"responsibility", text:"How would you place your views on this scale?",options:[{val:'1',txt:'Governement should take more responsibility to ensure that everyone is provided for'}].concat(this.numbers).concat({val:'10',txt:'People should take more responsibility to provide for themselves'}), answer:null, check:null},
    { name: "competition", text:"How would you place your views on this scale?",options:[{val:'1',txt:'Competition is good. It stimulates people to work hard and develop new ideas'}].concat(this.numbers).concat({val:'10',txt:'Compitition is harmful. It brings out the worst in people'}), answer:null, check:null},
    { name: "hardwork", text:"How would you place your views on this scale?",options:[{val:'1',txt:'In the long run, hard work usually brings a better life'}].concat(this.numbers).concat({val:'10',txt:"Hard work doesn't generally bring success-it's more a matter of luck and connections"}), answer:null, check:null},
    { name: "zerosum", text:"How would you place your views on this scale?",options:[{val:'1',txt:"People can only get rich at the expense of others"}].concat(this.numbers).concat({val:'10',txt:"Wealth can grow so there's enough for everyone"}), answer:null, check:null},
    { name: "regsugar", title:"Regulation of high-sugar beverages", tag:"high-sugar beverages", options: this.regulation_options, prohibit_answer:null, prohibit_check:null, tax_answer:null, tax_check:null, hide_answer:null, hide_check:null, text:"Several countries around the world levy taxes on beverages with high sugar content (which is associated with obsesity).",tax_question:" What is your attitude towards a tax that would increase the price of sugary beverages in Norway by 20%?"},
    { name: "regalcohol", title:"Regulation of alcoholic beverages", tag:"alcoholic beverages", options: this.regulation_options, prohibit_answer:null, prohibit_check:null, tax_answer:null, tax_check:null, hide_answer:null, hide_check:null, tax_question:"What is your attitude towards a tax that would increase the price of alcoholic beverages in Norway by 50%?"},
    { name: "regtobacco", title:"Regulation of tobacco", tag:"tobacco", options: this.regulation_options, prohibt_answer:null, prohibit_check:null, tax_answer:null, tax_check:null, hide_answer:null, hide_check:null, tax_queston:"What is your attitude towards a tax that would increase the price of cigarettes by 50% in Norway?"},
    { name: "reginterests", title:"Regulation of high-interest loans", tag:"high-interest loans", options: this.regulation_options, answer:null, check:null, text:'There is a political discussion about the regulation of short-term, high-interest loans also known as "payday loans" or "kviklån". Setting a cap on interest rates may help some people not take out loans, which it is in their best interest not to take out. On the other hand, setting a cap may hinder some individuals in taking out a loan which they need.', question:"What is your attitude towards setting a maximum of 20% interest on a loan in Norway?"},
    { name: "vote", title:"Vote", options:this.party_options, answer:null, check:null},
    { name: "jobsector", text:"Imagine that you have attained your academic degree and are free to choose between jobs.", answer:null, check:null, options:[{val:"private",txt:"Private sector"}, {val:"public",txt:"Public sector"}], question:"Where would you prefer to get a job?"},
    { name:"paymentmethod", answer:null, check:null, regnum:null, accnum:null,phonenum:null}
  ]

  constructor(
    private authService:AuthService,
    private router:Router,
    private flashMessage:FlashMessagesService,
  ) { }

  ngOnInit() {
    this.authService.getProfile().subscribe(profile => {
      this.user = profile.user;
      let tasks = this.user.tasks;
      this.survey_completed = tasks[tasks.map(e => e.task_tag).indexOf('survey2')].completed ? true : false;

      let register_date = moment(this.user.register_date)
      // if (!moment(this.current_date).isSame(register_date.add({weeks:2}), 'day')) this.router.navigate(['/dashboard']);

    })
  }
  nextTab() { this.selected_tab += 1; }
  tabClicked(val:number) { this.selected_tab=val; }

  validateChoices(callback) {
    let choices_check = [];
    this.questions.forEach((question, index) => {
      if (index >= this.questions.map(e=>e.name).indexOf("regsugar") && index < this.questions.map(e => e.name).indexOf("reginterests")) {
        choices_check.push(question.prohibit_answer == null ? false : { name:question.name, answer:question.prohibit_answer });
        this.questions[index].prohibit_check = question.prohibit_answer == null ? 'Please answer this question' : true;
        choices_check.push(question.tax_answer == null ? false : { name:question.name, answer:question.tax_answer });
        this.questions[index].tax_check = question.tax_answer == null ? 'Please answer this question' : true;
        choices_check.push(question.hide_answer == null ? false : { name:question.name, answer:question.hide_answer });
        this.questions[index].hide_check = question.hide_answer == null ? 'Please answer this question' : true;
      } else {
        choices_check.push(question.answer == null ? false : { name:question.name, answer:question.answer });
        this.questions[index].check = question.answer == null ? 'Please answer this question' : true;
      }
    });

    let payment = this.questions[this.questions.length-1]
    if (payment.answer == 'transfer' && (!payment.regnum || !payment.accnum)) {
      payment.check = "Please input credit card information";
      choices_check[choices_check.length-1] = false;
    } else if (payment.answer == "mobilepay" && (!payment.phonenum)) {
      payment.check = "Please input your phone number";
      choices_check[choices_check.length-1] = false;
    } else {
      choices_check[choices_check.length-1] = { name:payment.name, answer:payment.answer, regnum:payment.regnum, accnum:payment.accnum, phonenum:payment.phonenum }
    }

    let validated = choices_check.every(e=>{return e!=null && e!=false});
    callback(validated, choices_check);
  }

  completeSurvey() {
    this.validateChoices((validated:boolean, choices_check:any[]) => {
      if (validated) {
        this.authService.completeSurvey(this.user, '2', choices_check).subscribe(response => {
          if(response.success) {
            this.flashMessage.show('Survey completed',{ cssClass:'my-flash-message success-flash', timeout:3000});
            this.router.navigate(['/dashboard']);
          }
        })
      } else {
        let problem_index = choices_check.findIndex(e => e == false);
        if (problem_index < this.questions.map(e => e.name).indexOf("regsugar")) {
          this.selected_tab = 0;
        } else if (problem_index < 20) {
          this.selected_tab = 1;
        } else if (problem_index < 22) {
          this.selected_tab = 2;
        }
        document.getElementsByClassName('mat-sidenav-content')[0].scrollTo(0,0)
        this.flashMessage.show('Some of your answers are invalid', { cssClass:'my-flash-message alert-flash', timeout:3000});
      }
    })
  }

}