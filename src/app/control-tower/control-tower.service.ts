import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControlTowerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/control-tower';

  getLiveRadarStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/status`);
  }

  resolveLeakageAlert(payload: { buyer_id: number; reassigned_rep_id: number; action_taken?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/resolve-leakage`, payload);
  }
}
