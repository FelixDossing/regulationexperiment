import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  authToken:any;

  constructor(private http:HttpClient) { }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  registerWork(task_tag:string, work_completed:number) {
    let user = JSON.parse(localStorage.getItem('user'))
    let task_info = { tag: task_tag, completed: work_completed };
    this.loadToken();
    // let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/registerwork', {task_info, user});
  }
  registerSentiment(task_tag:string, type:string, sentiment:number) {
    this.loadToken();
    let user = JSON.parse(localStorage.getItem('user'))
    // let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/sentiment', {task_tag, type, sentiment, user});
  }
  registerMinWork(task_tag:string, work_completed:number) {
    let user = JSON.parse(localStorage.getItem('user'))
    let task_info = { tag: task_tag, completed: work_completed };
    this.loadToken();
    // let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/registerminwork', {task_info,user});
  }

  registerChoice(allocation_tag:string, choices:any) {
    let user = JSON.parse(localStorage.getItem('user'))
    let choice_info = { tag: allocation_tag, choices: choices }
    this.loadToken();
    // let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/registerChoice', {choice_info, user});
  }
  registerAllocationText(allocation_tag:string, text) {
    let user = JSON.parse(localStorage.getItem('user'))
    let choice_info = { tag: allocation_tag, text:text }
    this.loadToken();
    // let headers = new HttpHeaders().append('Content-Type', 'application/json').append('Authorization', this.authToken);
    return this.http.post<any>('users/registerAllocationText', {choice_info, user});
  }

  registerRegChoice(submit:any) {
    let user = JSON.parse(localStorage.getItem('user'))
    this.loadToken();
    // let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/registerregchoice', {submit, user});
  }

  setAllocation(user:any) {
    this.loadToken()
    // let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/setallocation', user);
  }

  getSuggestion(user:any, week:number) {
    this.loadToken()
    let info = { user, week}
    // let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/getsuggestion', info);
  }
  timestamp(user:any, time:string, task:string, part:string) {
    this.loadToken()
    let info = {user, time, task, part};
    // let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/timestamp', info)
  }
  instructionsReport(user:any, report:any) {
    this.loadToken()
    // let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/instructionsreport', {user, report})
  }
}
