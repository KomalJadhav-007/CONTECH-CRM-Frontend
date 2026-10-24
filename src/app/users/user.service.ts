import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUsers(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  getUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createUser(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: number, data?: any): Observable<any> {
    return this.http.request<any>('delete', `${this.apiUrl}/${id}`, { body: data });
  }

  getOpenAssignments(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/open-assignments`);
  }

  assignUserProjects(id: number, data: { project_ids?: number[]; all_projects?: boolean }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/projects`, data);
  }
}

