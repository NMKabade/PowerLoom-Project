import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE = environment.APIUrl.endsWith('/') ? environment.APIUrl.slice(0, -1) : environment.APIUrl;

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  // ─── Jobers (Owner) ───────────────────────────────────────────────────────

  /** Owner: list all jobers */
  getJobers(page: number = 1): Observable<any> {
    return this.http.get<any>(`${BASE}/jobers/`, { params: { page: page.toString() } });
  }

  /** Owner: create a new jober */
  createJober(formData: FormData): Observable<any> {
    return this.http.post(`${BASE}/register/`, formData);
  }

  /** Owner: update a jober */
  updateJober(id: number, formData: FormData): Observable<any> {
    return this.http.patch(`${BASE}/jobers/${id}/`, formData);
  }

  /** Owner: delete a jober */
  deleteJober(id: number): Observable<any> {
    return this.http.delete(`${BASE}/jobers/${id}/`);
  }

  // ─── Account Activation ───────────────────────────────────────────────────

  /** Activate account with uid + token from email link */
  activateAccount(uid: string, token: string): Observable<any> {
    return this.http.post(`${BASE}/activate/`, { uid, token });
  }

  // ─── Password Reset ───────────────────────────────────────────────────────

  /** Send OTP to email */
  sendOtp(email: string): Observable<any> {
    return this.http.post(`${BASE}/password-reset/send-otp/`, { email });
  }

  /** Reset password with OTP + new password */
  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post(`${BASE}/password-reset/reset/`, {
      email,
      otp,
      new_password: newPassword
    });
  }
}
