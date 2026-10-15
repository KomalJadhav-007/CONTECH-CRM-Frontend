import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = `${environment.apiUrl}/alerts`;

  constructor(private http: HttpClient) {}

  getAlerts(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  acknowledgeAlert(alertId: number | string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${alertId}/acknowledge`, {});
  }

  resolveAlert(alertId: number | string, notes: string = 'Resolved'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${alertId}/resolve`, { resolution_notes: notes });
  }

  broadcastAlert(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/broadcast`, data);
  }
}
