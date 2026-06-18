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
  fullName: string;
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

export interface AdminUserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  profilePictureUrl: string | null;
  joinDate: string;
  specialization: string | null;
}

export interface AdminUserProfileResponse {
  success: boolean;
  message: string;
  profile: AdminUserProfile;
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

  changeUserStatus(userId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/admin/users/status`, {
      userId,
      status
    });
  }

  deleteUser(userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${environment.apiUrl}/admin/users/${userId}`);
  }

  getUserById(userId: string): Observable<AdminUserProfileResponse> {
    return this.http.get<AdminUserProfileResponse>(`${environment.apiUrl}/admin/users/${userId}`);
  }
}