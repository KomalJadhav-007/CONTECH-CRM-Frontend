import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/tasks';

  getTasks(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  completeTask(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/complete`, {});
  }

  createTask(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
