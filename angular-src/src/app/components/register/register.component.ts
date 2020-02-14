import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  first_name:string;
  last_name:string;
  email:string;
  email2:string;
  password:string;
  password2:string;
  participation_code:string;
  ku_id:string;

  constructor(private validateService:ValidateService,
    private authService:AuthService,
    private adminService:AdminService,
    private flashMessage:FlashMessagesService,
    private router:Router) { }

  ngOnInit() {
  }

  keyUp(event) {
    if (event.key == 'Enter') {
      this.register()
    }
  }
  register() {
    let user = {
      first_name:this.first_name,
      last_name:this.last_name,
      email:this.email,
      password:this.password,
      participation_code:this.participation_code,
      ku_id:this.ku_id,
    }
    // Validate
    if (!this.validateService.validateRegister(user)) {
      this.flashMessage.show('Please fill in all fields', { cssClass: 'my-flash-message alert-flash', timeout:3000 });
      return false;
    }
    if (!this.validateService.validateEmail(user.email)) {
      this.flashMessage.show('Please input a valid email', { cssClass: 'my-flash-message alert-flash', timeout:3000 });
      return false;
    }
    if (this.email != this.email2) {
      this.flashMessage.show('The email adresses do not match', { cssClass: 'my-flash-message alert-flash', timeout:3000 });
      return false;
    }
    if (this.password != this.password2) {
      this.flashMessage.show('The passwords do not match', {cssClass: 'my-flash-message alert-flash', timeout: 3000 });
      return false;
    }
    // Create user
    this.authService.registerUser(user).subscribe(response => {
      if (response.success) {
        this.flashMessage.show('You have now been registered', {cssClass: 'my-flash-message success-flash', timeout: 3000 });
        this.router.navigate(['/login']);
      } else {
        this.flashMessage.show(response.msg, {cssClass: 'my-flash-message alert-flash', timeout: 3000 });
        this.router.navigate(['/register']);
      }
    });
  }
}
