import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  step: 1 | 2 | 3 = 1;
  isLoading = false;
  errorMsg = '';
  successMsg = '';
  showNewPassword = false;
  showConfirmPassword = false;

  // Resend OTP timer
  resendCountdown = 0;
  canResend = false;
  isResending = false;
  private timerInterval: any = null;

  toggleNewPassword() { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  startResendTimer() {
    this.canResend = false;
    this.resendCountdown = 30;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.canResend = true;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }, 1000);
  }

  resendOTP() {
    if (!this.canResend || this.isResending) return;
    this.isResending = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.http.post('http://localhost:8000/api/password-reset/send-otp/', { email: this.currentEmail }).subscribe({
      next: (res: any) => {
        this.isResending = false;
        this.successMsg = 'OTP resent successfully. Please check your email.';
        this.startResendTimer();
      },
      error: (err: any) => {
        this.isResending = false;
        this.errorMsg = err.error?.error || 'Failed to resend OTP. Please try again.';
      }
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // Forms
  emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  passwordForm: FormGroup = this.fb.group({
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Combined form used as the single [formGroup] binding on the reset form element
  resetForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(g: FormGroup) {
    return g.get('new_password')?.value === g.get('confirm_password')?.value
      ? null : { mismatch: true };
  }

  get currentEmail() {
    return this.emailForm.get('email')?.value;
  }

  sendOTP() {
    if (this.emailForm.invalid) return;
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.post('http://localhost:8000/api/password-reset/send-otp/', { email: this.currentEmail }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMsg = res.message;
        this.step = 2; // Move to OTP step
        this.startResendTimer();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMsg = err.error?.error || 'Failed to send OTP. Please try again.';
      }
    });
  }

  verifyOTPandReset() {
    if (this.resetForm.invalid) return;
    
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload = {
      email: this.currentEmail,
      otp: this.resetForm.get('otp')?.value,
      new_password: this.resetForm.get('new_password')?.value
    };

    this.http.post('http://localhost:8000/api/password-reset/reset/', payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMsg = res.message;
        this.resetForm.reset();
        
        // Wait 2 seconds then redirect to login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMsg = err.error?.error || 'Failed to reset password. Check your OTP.';
      }
    });
  }
}
