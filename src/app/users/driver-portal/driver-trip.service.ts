import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverTripService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/driver-trips`;

  getMyTrips(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-trips`);
  }

  updateTripStatus(tripId: number, status: string, notes?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${tripId}/status`, { status, driver_notes: notes });
  }
}
