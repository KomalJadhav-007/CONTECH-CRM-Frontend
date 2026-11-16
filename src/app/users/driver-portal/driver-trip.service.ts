import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverTripService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/driver-trips`;

  getMyTrips(projectId?: string | number): Observable<any> {
    let params = new HttpParams();
    if (projectId && projectId !== 'all') {
      params = params.set('project_id', projectId.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/my-trips`, { params });
  }

  updateTripStatus(tripId: number, status: string, notes?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${tripId}/status`, { status, driver_notes: notes });
  }
}
