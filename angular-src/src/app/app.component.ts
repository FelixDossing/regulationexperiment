import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-src';

  onActivate(event) {
    document.querySelector('.mat-sidenav-content').scrollTo(0,0);
  }
}
