import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

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
  displayedColumns: string[] = ['session','first_name', 'last_name', 'email','role','register_date','instructions',
                                'allocation1','regulation1','allocation2','regulation2','survey1','survey2'];

  dataSource:participantInfo[] = [];

  users:any;
  participation_code:string;
  participation_codes:any;

  constructor(private adminService:AdminService, private router:Router) { }

  // Admin page should have data on: Participant name, Role, email, progress, regiser time,
  // Button only for me to delete all data.
  // View all data - should also only be for me.

  // Admin authentication should be better.

  ngOnInit() {
    this.getAdminData()
    setInterval(() => {
      this.getAdminData();
    }, 5000);
  }
  toData() {
    this.router.navigate(['/data']);
  }
  getAdminData() {
    this.adminService.getData().subscribe(data => {
      this.dataSource = data.map(p => {
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
    })    
  }

}
