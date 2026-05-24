import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = false;
  errorMsg = '';
  successMsg = '';
  showNewPassword = false;
  showConfirmPassword = false;

  uid: string | null = null;
  token: string | null = null;

  resetForm: FormGroup = this.fb.group({
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    this.uid = this.route.snapshot.queryParamMap.get('uid');
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.uid || !this.token) {
      this.errorMsg = 'Invalid password reset link. Please request a new one.';
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('new_password')?.value === g.get('confirm_password')?.value
      ? null : { mismatch: true };
  }

  toggleNewPassword() { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit() {
    if (this.resetForm.invalid || !this.uid || !this.token) return;

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload = {
      uid: this.uid,
      token: this.token,
      new_password: this.resetForm.value.new_password
    };

    this.http.post('http://localhost:8000/api/password-reset/confirm/', payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMsg = 'Password reset successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMsg = err.error?.error || 'Failed to reset password. The link may be expired.';
      }
    });
  }
}
