import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE = `${environment.APIUrl.endsWith('/') ? environment.APIUrl.slice(0, -1) : environment.APIUrl}/production`;

@Injectable({ providedIn: 'root' })
export class ProductionService {
  private http = inject(HttpClient);

  // ─── Machine Master ───────────────────────────────────────────────────────

  /** Owner: list all machines */
  getMachines(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/machines/`);
  }

  /** Jober: active machines for dropdown */
  getMachinesDropdown(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/machines/dropdown/`);
  }

  /** Owner: create a machine */
  createMachine(data: any): Observable<any> {
    return this.http.post(`${BASE}/machines/`, data);
  }

  /** Owner: update a machine */
  updateMachine(id: string, data: any): Observable<any> {
    return this.http.patch(`${BASE}/machines/${id}/`, data);
  }

  /** Owner: delete a machine */
  deleteMachine(id: string): Observable<any> {
    return this.http.delete(`${BASE}/machines/${id}/`);
  }

  // ─── Production Logs ──────────────────────────────────────────────────────

  /** Jober: submit a new production log */
  submitProduction(formData: FormData): Observable<any> {
    return this.http.post(`${BASE}/create/`, formData);
  }

  /** Jober: get own production list */
  getMyProductions(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/my-list/`);
  }

  /** Jober: salary & stats summary */
  getSalarySummary(): Observable<any> {
    return this.http.get(`${BASE}/salary/summary/`);
  }

  /** Owner: get all productions */
  getAllProductions(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/all/`);
  }

  /** Owner: approve or reject a production */
  approveProduction(id: string, status: string, remarks: string = ''): Observable<any> {
    return this.http.patch(`${BASE}/approve/${id}/`, { status, remarks });
  }

  /** Owner: dashboard summary stats */
  getOwnerDashboard(): Observable<any> {
    return this.http.get(`${BASE}/dashboard/owner/`);
  }
}
