import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-newpassword',
  templateUrl: './newpassword.component.html',
  styleUrls: ['./newpassword.component.css']
})
export class NewpasswordComponent implements OnInit {

  newpassword1:String;
  newpassword2:String;

  resetcode:String;

  constructor(
    private router:Router,
    private flashMessage:FlashMessagesService,
    private authService:AuthService
  ) { }

  ngOnInit() {
    this.resetcode = this.router.url.replace('/newpassword/','');
  }

  resetpassword() {
    if (!this.newpassword1 || !this.newpassword2 || this.newpassword1.length == 0 || this.newpassword2.length == 0) {
      this.flashMessage.show('Please input a new password', {cssClass: 'my-flash-message alert-flash', timeout:3000});
    }
    else if (this.newpassword1 != this.newpassword2) {
      this.flashMessage.show('Passwords do not match', {cssClass: 'my-flash-message alert-flash', timeout:3000});
    }
    else {
      this.authService.newPassword(this.newpassword1, this.resetcode).subscribe(data => {
        if (data.success) {
          this.flashMessage.show(data.msg, {cssClass: 'my-flash-message success-flash', timeout:3000});
          this.router.navigate(['/login']);
        } else if (data) {
          this.flashMessage.show(data.msg, {cssClass: 'my-flash-message alert-flash', timeout:3000});
        }
      })
    }
  }

}
