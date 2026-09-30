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
}
