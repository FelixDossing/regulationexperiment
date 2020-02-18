import { Component, OnInit } from '@angular/core';
import { AdminService} from '../../services/admin.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { partition } from 'rxjs/operators';

export interface participantInfo {
  first_name: string;
  last_name: string;
  email: string;
  session:number;
  role:string;
  register_date:string;
  instructions:string;
  allocation1:string;
  allocation2:string;
  regulation1:string;
  regulation2:string;
  survey1:string;
  survey2:string;
}

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit {
  displayedColumns: string[] = ['session','first_name', 'last_name', 'email','role','register_date','instructions',
                                'allocation1','regulation1','allocation2','regulation2','survey1','survey2'];
  dataSource:participantInfo[] = [];

  user_data:any[];

  deletepassword:string = null;

  sessions:any[] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  session_number:number;

  participants_count:number;
  ku_students:number;

  session_participants:any[];

  constructor(
    private adminService:AdminService,
    private flashMessage:FlashMessagesService,
  ) { }

  ngOnInit() {
    setInterval(() => this.sessionChange(), 5000)
  }

  deleteSession() {
    if (this.deletepassword === null) this.deletepassword = '';
    else {
      this.adminService.deleteSession(this.deletepassword, this.session_number).subscribe(res => {
        this.flashMessage.show(res.msg,{ cssClass:`my-flash-message ${res.success ? 'success' : 'alert'}-flash`, timeout:3000});
      })
    }
  }

  sessionChange() {
    // userData() retrives data for those who have registered.
    this.userData()
    // getSessionData() retrieves the participation codes
    this.getSessionData()
  }
  getSessionData() {
    this.adminService.getSessions().subscribe(response => {
      if (response.success) {
        let index = response.data.map(e => e.session_number).indexOf(this.session_number);

        if (response.data[index]) {
          let participants = response.data[index].logins;
          participants = participants.filter(participant => this.user_data.map(user => user.participation_code).indexOf(participant.participation_code) == -1);
          this.session_participants = participants;
        }
        else {
          this.session_participants = undefined;
        }
      } else {
        console.log('failure')
      }
    })
  }
  userData() {
    let angular = this;
    this.adminService.getData().subscribe(data => {
      if (data) {
        data = data.filter(function(item) { return item.session == angular.session_number })
        this.user_data = data;
        this.dataSource = this.user_data.map(p => {
          let info = { first_name : p.first_name,
                       last_name: p.last_name,
                       email:p.email,
                       session:p.session,
                       role:p.role,
                       register_date:p.register_date.substr(0,10),
                       instructions:p.tasks[0].completed ? 'Completed' : '-',
                       allocation1:p.tasks[p.tasks.map(e=>e.task_tag).indexOf('allocation1')].completed ? 'Completed' : '-',
                       allocation2:p.tasks[p.tasks.map(e=>e.task_tag).indexOf('allocation2')].completed ? 'Completed' : '-',
                       regulation1:p.role=="worker" ? '-' : p.tasks[p.tasks.map(e => e.task_tag).indexOf('regulation1')].completed ? 'Completed' : '-',
                       regulation2:p.role=="worker" ? '-' : p.tasks[p.tasks.map(e => e.task_tag).indexOf('regulation2')].completed ? 'Completed' : '-',
                       survey1:p.tasks[p.tasks.map(e=>e.task_tag).indexOf('survey1')].completed ? 'Completed' : '-',
                       survey2:p.tasks[p.tasks.map(e=>e.task_tag).indexOf('survey2')].completed ? 'Completed' : '-',
                      }
          return info;
          });
      }
    })
  }
  createSession() {
    // Make sure we don't create if there is already one
    if (confirm('Are you ready to start the session?')) {
      const session = {
        session_number: this.session_number,
        participants:this.participants_count,
        ku_students:this.ku_students
      }
  
      // Validation
      if (this.participants_count == undefined) {
        this.flashMessage.show('Please fill in the amount of participants', { cssClass: 'my-flash-message alert-flash', timeout:3000 });
        return false;
      }
      if (+this.participants_count < +this.ku_students) {
        this.flashMessage.show('The number of KU students exceeds the number of participants', { cssClass: 'my-flash-message alert-flash', timeout:3000 });
        return false;
      } 
      if (this.participants_count % 2 != 0) {
        this.flashMessage.show('There must be an even number of participants', { cssClass: 'my-flash-message alert-flash', timeout:3000 });
        return false;
      }
  
      // Register session
      this.adminService.createSession(session).subscribe(response => {
        if (response.success)  {
          this.getSessionData()
          this.flashMessage.show('Session created', {cssClass: 'my-flash-message success-flash', timeout:3000})
        } else {
          this.flashMessage.show(response.msg, { cssClass: 'my-flash-message alert-flash', timeout: 3000})
        }
      })
    }
  }
}
