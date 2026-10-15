import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/settings`;

  getSettings(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateSetting(key: string, value: string): Observable<any> {
    return this.http.put<any>(this.apiUrl, { key, value });
  }

  createProject(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/projects`, data);
  }

  updateProject(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/projects/${id}`, data);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/projects/${id}`);
  }

  getAuditLogs(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit-logs`, { params });
  }
}
