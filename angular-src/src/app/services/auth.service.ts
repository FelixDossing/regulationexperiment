import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authToken:any;
  user:any;

  constructor( private http:HttpClient ) { }

  loadToken() {
    const token = localStorage.getItem('id_token');
    this.authToken = token;
  }
  storeUserData(token:string, user:any) {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }
  loggedIn() {
    const helper = new JwtHelperService();
    if (!localStorage.id_token) return false;
    return !helper.isTokenExpired(localStorage.id_token);
  }
  userAdmin() {
    if (localStorage.user && JSON.parse(localStorage.user).admin) return true;
    return false;
  }

  isAdmin() {
    if (JSON.parse(localStorage.user).admin) return true;
    else return false;
  }
  registerUser(user: any) {
    return this.http.post<any>('users/register', user);
  }
  authenticateUser(user: any) {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json')
    return this.http.post<any>('users/authenticate', user, {headers:headers});
  }
  getProfile() {
    this.loadToken();
    let email = JSON.parse(localStorage.getItem('user')).email
    console.log(email)
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    console.log(headers)
    return this.http.post<any>('users/profile', email, { headers:headers });
  }
  signOut() {
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
  completeControl(user:any) {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/completeinstructions', user, {headers:headers});
  }
  completeSurvey(user:any, num:String, choices:any[]) {
    this.loadToken();
    let headers = new HttpHeaders().append('Content-Type','application/json').append('Authorization',this.authToken)
    return this.http.post<any>('users/completesurvey', {user:user, surveynum:num, choices}, {headers:headers});
  }
  resetPassword(email) {
    return this.http.post<any>('users/resetpassword', {email});
  }
  newPassword(password, resetcode) {
    return this.http.post<any>('users/newpassword', {password, resetcode});
  }
  setNewPassword(info) {
    return this.http.post<any>('users/setnewpassword', info);
  }

}
