import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/site-visits';

  getSiteVisits(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  getSiteVisitById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  bookSiteVisit(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/book`, data);
  }

  updateSiteVisit(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  updateConfirmations(id: number, confirmations: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/confirmations`, confirmations);
  }

  recordDiscovery(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/discovery`, data);
  }

  getVehicles(params?: any): Observable<any> {
    return this.http.get<any>('http://localhost:5000/api/vehicles', { params });
  }

  getRecoveries(params?: any): Observable<any> {
    return this.http.get<any>('http://localhost:5000/api/recoveries', { params });
  }

  logRecoveryAttempt(id: number, data: any): Observable<any> {
    return this.http.post<any>(`http://localhost:5000/api/recoveries/${id}/attempt`, data);
  }
}

