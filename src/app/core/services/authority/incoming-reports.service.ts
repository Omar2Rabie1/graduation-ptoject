import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';

export interface ApiReporter {
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
}

export interface ApiReport {
  id?: string | number;
  title?: string;
  name?: string;
  description?: string;
  desc?: string;
  summary?: string;
  location?: string;
  address?: string;
  latitude?: number | string;
  longitude?: number | string;
  reportedBy?: string | ApiReporter;
  reporterName?: string | ApiReporter;
  author?: string | ApiReporter;
  user?: string | ApiReporter;
  priority?: string | number;
  status?: string | number;
  images?: string[];
  photos?: string[];
  updatedAgo?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class IncomingReportsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl.replace(/\/$/, '')}/authority`;

  getIncomingReports(pageNumber = 1, pageSize = 50): Observable<PaginatedResponse<ApiReport>> {
    const params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    return this.http.get<PaginatedResponse<ApiReport>>(`${this.base}/reports/incoming`, { params });
  }

  assignWorker(reportId: string, workerId: string): Observable<void> {
    const id = String(reportId).replace(/^#/, '').trim();
    return this.http.post<void>(`${this.base}/reports/${encodeURIComponent(id)}/assign-worker`, {
      workerId,
    });
  }

  getAuthorityReportPopup(reportId: string | number): Observable<any> {
    const id = String(reportId).replace(/^#/, '').trim();
    return this.http.get<any>(`${this.base}/map-reports/${encodeURIComponent(id)}/popup`);
  }
}
