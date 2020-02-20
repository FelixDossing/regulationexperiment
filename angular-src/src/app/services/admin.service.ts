import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  authToken:any;

  constructor(
    private http:HttpClient
  ) { }

  // Create session
  createSession(session) {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken);
    return this.http.post<any>('admin/session', session, {headers:headers});
  }

  beginSession(session_number) {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken);
    return this.http.post<any>('admin/sessionbegin', { session_number:session_number}, {headers:headers});
  }

  getSessions() {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken);
    return this.http.get<any>('admin/session', { headers: headers });
  }

  // Load token
  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }

  // Deleteparticipant
  deleteSession(password, sessionnum) {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken);
    if (JSON.parse(localStorage.getItem('user')).admin) {
      return this.http.post<any>('admin/deletesession', {password, sessionnum}, {headers:headers});
    }
  }

  // Get all data
  getData(): Observable<User[]> {
    this.loadToken();
    if (JSON.parse(localStorage.getItem('user')).admin) {
      let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
      return this.http.get<User[]>('admin/data', { headers:headers });
    }
  }
  sendReminder(info:any) {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken);
    return this.http.post<any>('admin/sendreminder', info, {headers:headers});
  }

}
