import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MapMarker } from '../../shared/models/map-marker.model';

export interface PublicMapReportMarker {
  reportId: number;
  latitude: number;
  longitude: number;
  categoryName: string;
  status: string;
}

export interface ReportPhoto {
  imageUrl: string;
}

export interface ReportUser {
  userId: string;
  fullName: string;
}

export interface PublicMapPopup {
  reportId: number;
  title: string;
  description: string;
  address: string | null;
  latitude: number;
  longitude: number;
  categoryName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  photos: ReportPhoto[];
  reportedBy: ReportUser;
  assignedWorker: ReportUser | null;
}

export interface PublicMapReport {
  reportId: number;
  title: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;

  assignedByName?: string;
  assignedToName?: string;

  updatedAt?: string;
  blockageReason?: string | null;

  photoUrls?: string[];
}

export interface PublicMapReportsResponse {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: PublicMapReport[];
}

@Injectable({
  providedIn: 'root'
})
export class PublicMapReportsService {
  private readonly http = inject(HttpClient);

  private get base(): string {
    return environment.apiUrl.replace(/\/$/, '');
  }

  getPublicMapReports(categoryId?: number, status?: string): Observable<MapMarker[]> {
    let params = new HttpParams();
    if (categoryId !== undefined && categoryId !== null) {
      params = params.set('categoryId', categoryId.toString());
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PublicMapReportMarker[]>(`${this.base}/public/map-reports`, { params }).pipe(
      map(reports => reports.map(report => ({
        id: report.reportId.toString(),
        lat: report.latitude,
        lng: report.longitude,
        title: report.categoryName,
        description: `Status: ${report.status}`,
        type: report.categoryName,
        status: report.status
      })))
    );
  }

  getMapPopupDetails(reportId: string | number): Observable<PublicMapPopup> {
    return this.http.get<PublicMapPopup>(`${this.base}/public/map-popup/${reportId}`);
  }

  getReportLocation(reportId: string | number): Observable<MapMarker[]> {
    return this.getPublicMapReports().pipe(
      map(markers => {
        const marker = markers.find(m => m.id === reportId.toString());
        return marker ? [marker] : [];
      })
    );
  }

  getNearbyReports(latitude: number, longitude: number, radiusInKm: number = 3): Observable<PublicMapReportsResponse> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radiusInKm', radiusInKm.toString());

    return this.http.get<PublicMapReportsResponse>(`${this.base}/public/nearby-reports`, { params });
  }

  getUserReports(userId: string, pageNumber: number = 1, pageSize: number = 50): Observable<PublicMapReportsResponse> {
    let params = new HttpParams()
      .set('PageNumber', pageNumber.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<PublicMapReportsResponse>(`${this.base}/public/users/${userId}/reports`, { params });
  }

  confirmReportFix(userId: string, reportId: string | number): Observable<unknown> {
    return this.http.post<unknown>(`${this.base}/public/users/${userId}/reports/${reportId}/confirm-fix`, {});
  }

  rejectReportFix(userId: string, reportId: string | number): Observable<unknown> {
    return this.http.post<unknown>(`${this.base}/public/users/${userId}/reports/${reportId}/reject-fix`, {});
  }

  alsoSuffer(reportId: string | number): Observable<unknown> {
    return this.http.post<unknown>(`${this.base}/public/reports/${reportId}/also-suffer`, {});
  }

  submitReport(categoryId: number, description: string, latitude: number, longitude: number, files: File[]): Observable<unknown> {
    const formData = new FormData();
    formData.append('CategoryId', categoryId.toString());
    formData.append('Description', description);
    formData.append('Latitude', latitude.toString());
    formData.append('Longitude', longitude.toString());

    files.forEach(file => {
      if (file) {
        formData.append('Images', file);
      }
    });

    return this.http.post<unknown>(`${this.base}/public/report/submit`, formData);
  }
}