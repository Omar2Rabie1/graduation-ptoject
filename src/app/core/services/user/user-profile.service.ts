import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string | null;
  status: string;
  createdAt: string;
  roles: string[];
  specialization: string | null;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  profile: UserProfile;
}

export interface UpdateProfileDto {
  name: string;
  phoneNumber: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  
  private get base(): string {
    return environment.apiUrl.replace(/\/$/, '');
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.base}/Profile`);
  }

  updateProfileInfo(dto: UpdateProfileDto): Observable<unknown> {
    return this.http.put<unknown>(`${this.base}/profile-management/info`, dto);
  }

  updateProfilePhoto(file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<unknown>(`${this.base}/profile-management/photo`, formData);
  }

  changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.base}/Profile/change-password`, {
      currentPassword,
      newPassword,
      confirmNewPassword
    });
  }
}
