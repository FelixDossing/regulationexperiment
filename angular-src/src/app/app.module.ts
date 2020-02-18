import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { FlashMessagesModule } from 'angular2-flash-messages';

// import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import {MatPaginatorModule, MatPaginator} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatNativeDateModule } from "@angular/material/core";
import {MatTabsModule} from '@angular/material/tabs';
import {MatChipsModule} from '@angular/material/chips';
import {MatRadioModule} from '@angular/material/radio';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDialogModule} from '@angular/material/dialog';

import { ValidateService } from './services/validate.service';
import { AdminService } from './services/admin.service';
import { AuthService } from './services/auth.service';
import { InteractionService } from './services/interaction.service';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { NewpasswordComponent } from './components/newpassword/newpassword.component';
import { InstructionsComponent } from './components/instructions/instructions.component';
import { SessionComponent } from './components/session/session.component';
import { AllocationComponent } from './components/allocation/allocation.component';
import { RegulationComponent } from './components/regulation/regulation.component';
import { WorkComponent } from './components/work/work.component';
import { WorkoneComponent } from './components/workone/workone.component';
import { WorktwoComponent } from './components/worktwo/worktwo.component';
import { SurveyoneComponent } from './components/surveyone/surveyone.component';
import { SurveytwoComponent } from './components/surveytwo/surveytwo.component';
import { AllocationInfoComponent } from './components/allocation-info/allocation-info.component';
import { DataComponent } from './components/data/data.component';

const appRoutes: Routes = [
  {path:'login', component:LoginComponent},
  {path:'newpassword/:resetcode', component:NewpasswordComponent},
  {path:'register', component:RegisterComponent},
  {path:'', redirectTo: 'dashboard', pathMatch:'full'},
  {path:'dashboard', component:DashboardComponent, canActivate:[AuthGuard]},
  {path:'instructions', component:InstructionsComponent, canActivate:[AuthGuard]},
  {path:'admin', component:AdminComponent, canActivate:[AdminGuard]},
  {path:'session', component:SessionComponent, canActivate:[AdminGuard]},
  {path:'allocation', component:AllocationComponent, canActivate:[AuthGuard]},
  {path:'regulation', component:RegulationComponent, canActivate:[AuthGuard]},
  {path:'workweek2', component:WorkoneComponent, canActivate:[AuthGuard]},
  {path:'workweek3', component:WorktwoComponent, canActivate:[AuthGuard]},
  {path:'surveyone',component:SurveyoneComponent, canActivate:[AuthGuard]},
  {path:'surveytwo',component:SurveytwoComponent, canActivate:[AuthGuard]},
  {path:'data',component:DataComponent, canActivate:[AdminGuard]}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    DashboardComponent,
    AdminComponent,
    NewpasswordComponent,
    InstructionsComponent,
    SessionComponent,
    AllocationComponent,
    RegulationComponent,
    WorkComponent,
    WorkoneComponent,
    WorktwoComponent,
    SurveyoneComponent,
    SurveytwoComponent,
    AllocationInfoComponent,
    DataComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    FlashMessagesModule.forRoot(),

    MatButtonModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatGridListModule,
    MatNativeDateModule,
    MatTabsModule,
    MatChipsModule,
    MatRadioModule,
    MatStepperModule,
    MatButtonToggleModule,
    MatDialogModule,
  ],
  providers: [
    ValidateService,
    AuthService,
    AdminService,
    InteractionService,
    AuthGuard,
    AdminGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
