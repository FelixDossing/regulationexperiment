import { Injectable } from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

@Injectable()
export class AdminGuard implements CanActivate{
    constructor(private authService:AuthService, private router:Router, private adminService:AdminService) {
    }

    canActivate() {
        if (this.authService.loggedIn() && this.authService.isAdmin()) {
            return true;
        } else {
            this.authService.signOut();
            this.router.navigate(['/login']);
            return false;
        }
    }
}
