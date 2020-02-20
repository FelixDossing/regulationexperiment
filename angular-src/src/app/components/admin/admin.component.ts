import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FlashMessagesService } from 'angular2-flash-messages';

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
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  displayedColumns: string[];

  dataSource:participantInfo[] = [];

  today = moment();
  picker_date = new Date();

  actionspassword:string;

  users:any;
  participation_code:string;
  participation_codes:any;

  dataview:string = "all";

  constructor(private adminService:AdminService, private router:Router, private flashMessage:FlashMessagesService) { }


  ngOnInit() {
    this.getAdminData()
    setInterval(() => {
      this.getAdminData();
    }, 5000);
  }
  toData() {
    this.router.navigate(['/data']);
  }
  changeView() {
    this.getAdminData()
  }
  setDate() {
    this.today = moment(this.picker_date.toISOString())
    this.today.minutes(1);
    this.getAdminData();
  }
  sendReminder() {
    let sendData = this.dataSource.map(e => {
      return { name: e.first_name, email:e.email }
    })
    if (sendData.length > 0) {
      this.adminService.sendReminder(sendData).subscribe(response => {
        if (response.success) {
          this.flashMessage.show(response.msg,{ cssClass:'my-flash-message success-flash', timeout:3000})
        } else {
          this.flashMessage.show(response.msg,{ cssClass:'my-flash-message alert-flash', timeout:3000})
        }
      })
    }
  };
  getAdminData() {
    this.adminService.getData().subscribe(data => {
      console.log(data)
      this.displayedColumns = ['session','first_name', 'last_name', 'email','role','register_date','instructions',
      'allocation1','regulation1','allocation2','regulation2','survey1','survey2'];
      this.dataSource = data.map(p => {
        let info = { 
                      _id:p._id,
                      first_name : p.first_name,
                      last_name: p.last_name,
                      email:p.email,
                      session:p.session,
                      role:p.role,
                      register_date:p.register_date.substr(0,10),
                      instructions:p.tasks[0].completed ? 'Completed' : '-',
                      allocation1:p.tasks.find(e => e.task_tag == 'allocation1').completed ? 'Completed' : '-',
                      allocation2:p.tasks.find(e => e.task_tag == 'allocation2').completed ? 'Completed' : '-',
                      regulation1:p.role=="worker" ? '-' : p.tasks[p.tasks.map(e => e.task_tag).indexOf('regulation1')].completed ? 'Completed' : '-',
                      regulation2:p.role=="worker" ? '-' : p.tasks[p.tasks.map(e => e.task_tag).indexOf('regulation2')].completed ? 'Completed' : '-',
                      survey1:p.tasks.find(e => e.task_tag == 'survey1').completed ? 'Completed' : '-',
                      survey2:p.tasks.find(e => e.task_tag == 'survey2').completed ? 'Completed' : '-',
                    }
        return info;
        });
      if (this.dataview == 'reminder') {
        this.dataSource = this.dataSource.filter(p => {
          let signup_date = moment(p.register_date, 'YYYY-MM-DD');
          let second_date = moment(signup_date).add({weeks:1, days:p.role == 'worker' ? 1 : 0});
          let third_date = moment(second_date).add(1, 'weeks');
          return this.today.isBetween(second_date, moment(second_date).add(1,'days')) || this.today.isBetween(third_date, moment(third_date).add(1,'days'))
        });
      }
    })    
  }

}
