import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE = `${environment.APIUrl.endsWith('/') ? environment.APIUrl.slice(0, -1) : environment.APIUrl}/production`;

@Injectable({ providedIn: 'root' })
export class ProductionService {
  private http = inject(HttpClient);

  // ─── Machine Master ───────────────────────────────────────────────────────

  /** Get all currencies */
  getCurrencies(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/currencies/`);
  }

  /** Owner: list all machines */
  getMachines(page: number = 1): Observable<any> {
    return this.http.get<any>(`${BASE}/machines/`, { params: { page: page.toString() } });
  }

  /** Jober: active machines for dropdown */
  getMachinesDropdown(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/machines/dropdown/`);
  }

  /** Owner: create a machine (multipart/form-data for image upload) */
  createMachine(data: FormData): Observable<any> {
    return this.http.post(`${BASE}/machines/`, data);
  }

  /** Owner: update a machine (multipart/form-data for image upload) */
  updateMachine(id: string, data: FormData | any): Observable<any> {
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

  /** Jober: get own production list with optional filtering */
  getMyProductions(page: number = 1, status?: string): Observable<any> {
    let params: any = { page: page.toString() };
    if (status && status !== 'ALL') params.status = status;
    return this.http.get<any>(`${BASE}/my-list/`, { params });
  }

  /** Jober: salary & stats summary */
  getSalarySummary(): Observable<any> {
    return this.http.get(`${BASE}/salary/summary/`);
  }

  /** Owner: get all productions with optional filtering */
  getAllProductions(status?: string, search?: string, page: number = 1): Observable<any> {
    let params: any = { page: page.toString() };
    if (status && status !== 'ALL') params.status = status;
    if (search) params.search = search;
    return this.http.get<any>(`${BASE}/all/`, { params });
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
