import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverTripService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/driver-trips';

  getMyTrips(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-trips`);
  }

  updateTripStatus(tripId: number, status: string, notes?: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${tripId}/status`, { status, driver_notes: notes });
  }
}
