import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ActivateComponent } from './features/auth/activate/activate.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { DashboardComponent as OwnerDashboardComponent } from './features/owner/dashboard/dashboard.component';
import { ApprovalPanelComponent } from './features/owner/approval-panel/approval-panel.component';
import { ManageJobersComponent } from './features/owner/manage-jobers/manage-jobers.component';
import { ManageMachinesComponent } from './features/owner/manage-machines/manage-machines.component';
import { DashboardComponent as JoberDashboardComponent } from './features/jober/dashboard/dashboard.component';
import { SubmitProductionComponent } from './features/jober/submit-production/submit-production.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'activate', component: ActivateComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  
  // Owner Routes
  { 
    path: 'owner', 
    canActivate: [roleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'dashboard', component: OwnerDashboardComponent },
      { path: 'approvals', component: ApprovalPanelComponent },
      { path: 'manage-jobers', component: ManageJobersComponent },
      { path: 'manage-machines', component: ManageMachinesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // Jober Routes
  { 
    path: 'jober', 
    canActivate: [roleGuard],
    data: { role: 'JOBER' },
    children: [
      { path: 'dashboard', component: JoberDashboardComponent },
      { path: 'submit', component: SubmitProductionComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  { path: 'profile', component: ProfileComponent, canActivate: [roleGuard], data: { role: ['ADMIN', 'JOBER'] } },
  
  { path: '**', redirectTo: 'login' }
];
