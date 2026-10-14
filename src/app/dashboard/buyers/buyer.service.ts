import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/buyers';

  getBuyers(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  getBuyer360(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/360`);
  }

  createBuyer(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateBuyer(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteBuyer(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  checkDuplicate(phone?: string, email?: string, exclude_id?: number): Observable<any> {
    const params: any = {};
    if (phone) params.phone = phone;
    if (email) params.email = email;
    if (exclude_id) params.exclude_id = exclude_id;
    return this.http.get<any>(`${this.apiUrl}/check-duplicate`, { params });
  }

  getCsvTemplate(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/csv-template`);
  }

  importBuyersFromCsv(rows: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/import-csv`, { rows });
  }

  recordBooking(data: any): Observable<any> {
    return this.http.post<any>('http://localhost:5000/api/bookings', data);
  }

  getBookings(params?: any): Observable<any> {
    return this.http.get<any>('http://localhost:5000/api/bookings', { params });
  }
}

