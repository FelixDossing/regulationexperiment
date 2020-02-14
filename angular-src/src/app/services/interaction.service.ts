import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  authToken:any;

  url:string = 'http://localhost:3000/'

  constructor(private http:HttpClient) { }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  registerWork(task_tag:string, work_completed:number) {
    let task_info = { tag: task_tag, completed: work_completed };
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('http://localhost:3000/users/registerwork', task_info, { headers:headers });
  }
  registerSentiment(task_tag:string, type:string, sentiment:number) {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('http://localhost:3000/users/sentiment', {task_tag, type, sentiment}, { headers:headers });
  }
  registerMinWork(task_tag:string, work_completed:number) {
    let task_info = { tag: task_tag, completed: work_completed };
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('http://localhost:3000/users/registerminwork', task_info, { headers:headers });
  }

  registerChoice(allocation_tag:string, choices:any) {
    let choice_info = { tag: allocation_tag, choices: choices }
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('http://localhost:3000/users/registerChoice', choice_info, { headers:headers });
  }
  registerAllocationText(allocation_tag:string, text) {
    let choice_info = { tag: allocation_tag, text:text }
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type', 'application/json').append('Authorization', this.authToken);
    return this.http.post<any>('http://localhost:3000/users/registerAllocationText', choice_info, { headers:headers});
  }

  registerRegChoice(submit:any) {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('http://localhost:3000/users/registerregchoice', submit, { headers:headers });
  }

  setAllocation(user:any) {
    this.loadToken()
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('http://localhost:3000/users/setallocation', user, { headers:headers });
  }

  getSuggestion(user:any, week:number) {
    this.loadToken()
    let info = { user, week}
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>(this.url+'users/getsuggestion', info, { headers:headers });
  }
  timestamp(user:any, time:string, task:string, part:string) {
    this.loadToken()
    let info = {user, time, task, part};
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>(this.url+'users/timestamp', info, { headers:headers })
  }
  instructionsReport(user:any, report:any) {
    this.loadToken()
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>(this.url+'users/instructionsreport', {user, report}, { headers:headers })
  }
}
