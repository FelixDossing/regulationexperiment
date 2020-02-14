import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ValidateService } from '../../services/validate.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  password:string;
  email:string;

  constructor(
    private authService:AuthService,
    private validateService:ValidateService,
    private router:Router,
    private flashMessage:FlashMessagesService
  ) { }

  ngOnInit() {
  }

  keyUp(event) {
    if (event.key=='Enter') {
      this.loginSubmit();
    }
  }
  loginSubmit() {
    if (!this.email || this.email.length == 0) {
      this.flashMessage.show('Please put in a valid email adress', {cssClass: 'my-flash-message alert-flash', timeout:5000});      
    }
    else if (!this.password || this.password.length == 0) {
      this.flashMessage.show('Please put in a password', {cssClass: 'my-flash-message alert-flash', timeout:5000});      
    }
    else {
      const user = {
        email: this.email,
        password: this.password
      }
      this.authService.authenticateUser(user).subscribe(data => {
        if (data.success) {
          this.authService.storeUserData(data.token, data.user);
          if (data.user.admin) {
            this.router.navigate(['admin']);
          } else {
            this.router.navigate(['dashboard']);
          }
        }
        else {
          this.flashMessage.show(data.msg, {cssClass: 'my-flash-message alert-flash', timeout:5000});
        }
      });
    }
  }
  resetPassword() {
    if (!this.email || this.email.length == 0) {
      this.flashMessage.show('Please write in your email address', {cssClass: 'my-flash-message alert-flash', timeout:3000});
    }
    else if (!this.validateService.validateEmail(this.email)) {
      this.flashMessage.show('Please input a valid email', { cssClass: 'my-flash-message alert-flash', timeout:3000 });
      return false;
    }
    else {
      this.authService.resetPassword(this.email).subscribe(data => {
        if (data.success) {
          this.flashMessage.show(data.msg, { cssClass: 'my-flash-message success-flash', timeout:3000});
        }
        else if (data && data.msg) {
          console.log(data)
          this.flashMessage.show(data.msg, { cssClass: 'my-flash-message alert-flash', timeout:3000});
        }
        else {
          this.flashMessage.show('Something went wrong', {cssClass: 'my-flash-message alert-flash', timeout:3000});
        }
      })
    }
   }
}
