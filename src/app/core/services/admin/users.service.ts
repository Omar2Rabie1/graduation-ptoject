import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';

export interface AdminUser {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phoneNumber: string;
  password?: string;
  role: string;
  specialization?: string;
}

export interface CreateUserResponse {
  userId: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<PaginatedResponse<AdminUser>> {
    return this.http.get<PaginatedResponse<AdminUser>>(`${environment.apiUrl}/admin/users`);
  }

  createUser(userData: CreateUserDto): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${environment.apiUrl}/admin/UserCreation`, userData);
  }
}
