import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WORKER_API_BASE } from './worker-api.config';
import { RejectTaskRequest } from './worker-task.model';

/**
 * POST /api/WorkerTaskActions/{reportId}/accept
 * POST /api/WorkerTaskActions/{reportId}/reject
 */
@Injectable({ providedIn: 'root' })
export class WorkerTaskActionsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${WORKER_API_BASE}/WorkerTaskActions`;

  accept(reportId: string): Observable<unknown> {
    const id = this.normalizeReportId(reportId);
    return this.http.post(`${this.base}/${encodeURIComponent(id)}/accept`, {});
  }

  reject(reportId: string, body: RejectTaskRequest = {}): Observable<unknown> {
    const id = this.normalizeReportId(reportId);
    return this.http.post(`${this.base}/${encodeURIComponent(id)}/reject`, {
      reason: body.reason?.trim() || null,
    });
  }

  private normalizeReportId(reportId: string): string {
    return String(reportId).replace(/^#/, '').trim();
  }
}
