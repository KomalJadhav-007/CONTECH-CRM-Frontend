import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private apiUrl = `${environment.apiUrl}/alerts`;

  constructor(private http: HttpClient) {}

  getAlerts(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  acknowledgeAlert(alertId: number | string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${alertId}/acknowledge`, {});
  }

  acknowledgeAll(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/acknowledge-all`, {});
  }

  resolveAlert(alertId: number | string, notes: string = 'Resolved'): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${alertId}/resolve`, { resolution_notes: notes });
  }

  scheduleFollowUp(payload: {
    buyer_id: number;
    title: string;
    due_at?: string;
    countdown_hours?: number;
    priority?: string;
    assigned_to_id?: number;
    description?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/schedule-follow-up`, payload);
  }

  completeFollowUp(payload: {
    task_id: number;
    outcome_status?: string;
    outcome_notes?: string;
    manual_intent_score?: number;
    manual_intent_delta?: number;
    manual_intent_band?: string;
    next_follow_up_date?: string;
    next_follow_up_title?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/complete-follow-up`, payload);
  }

  reassignBuyer(payload: {
    buyer_id: number;
    reassigned_rep_id: number;
    notes?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reassign-buyer`, payload);
  }

  broadcastAlert(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/broadcast`, data);
  }
}

