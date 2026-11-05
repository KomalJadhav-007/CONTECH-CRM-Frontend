import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/site-visits`;

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

  notifyDriverWhatsApp(visitId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${visitId}/notify-driver-whatsapp`, {});
  }

  getVehicles(params?: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/vehicles`, { params });
  }

  getRecoveries(params?: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/recoveries`, { params });
  }

  logRecoveryAttempt(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/recoveries/${id}/attempt`, data);
  }
}

