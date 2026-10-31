import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  completeTask(id: number, payload: any = {}): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/complete`, payload);
  }

  createTask(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateTask(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
