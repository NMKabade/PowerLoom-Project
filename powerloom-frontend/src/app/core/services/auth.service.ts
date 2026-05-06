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
        localStorage.setItem('token', response.access);
        localStorage.setItem('role', response.role);
        localStorage.setItem('username', response.username);
        this.currentUser.set({ id: 0, username: response.username, role: response.role });
      })
    );
  }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRole() {
    return this.currentUser()?.role || localStorage.getItem('role');
  }
}
