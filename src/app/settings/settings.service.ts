import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/settings';

  getSettings(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateSetting(key: string, value: string): Observable<any> {
    return this.http.put<any>(this.apiUrl, { key, value });
  }
}
