import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'JOBER';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.APIUrl.endsWith('/') ? environment.APIUrl.slice(0, -1) : environment.APIUrl;

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as 'ADMIN' | 'JOBER';
    const username = localStorage.getItem('username');
    if (token && role && username) {
      this.currentUser.set({ id: 0, username, role });
    }
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login/`, credentials).pipe(
      tap(response => {
        this.saveTokens(response);
        this.currentUser.set({ id: 0, username: response.username, role: response.role });
      })
    );
  }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  logout() {
    this.clearTokens();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getProfile() {
    return this.http.get<any>(`${this.apiUrl}/profile/`);
  }

  updateProfile(data: any) {
    return this.http.patch<any>(`${this.apiUrl}/profile/`, data);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  refreshToken() {
    const refresh = this.getRefreshToken();
    return this.http.post<any>(`${this.apiUrl}/token/refresh/`, { refresh }).pipe(
      tap(response => {
        localStorage.setItem('token', response.access);
      })
    );
  }

  private saveTokens(response: any) {
    localStorage.setItem('token', response.access);
    if (response.refresh) {
      localStorage.setItem('refresh_token', response.refresh);
    }
    localStorage.setItem('role', response.role);
    localStorage.setItem('username', response.username);
  }

  private clearTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  }

  getRole() {
    return this.currentUser()?.role || localStorage.getItem('role');
  }
}
