import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { WORKER_API_BASE } from './worker-api.config';
import {
  MarkBlockedRequest,
  MarkFixedRequest,
  WorkerTask,
} from './worker-task.model';

/**
 * GET  /api/worker/current-task
 * POST /api/worker/current-task/actions/mark-fixed
 * POST /api/worker/current-task/actions/mark-blocked
 */
@Injectable({ providedIn: 'root' })
export class WorkerCurrentTaskService {
  private readonly http = inject(HttpClient);
  private readonly base = `${WORKER_API_BASE}/worker/current-task`;

  getCurrentTask(): Observable<PaginatedResponse<WorkerTask>> {
    return this.http.get<PaginatedResponse<WorkerTask>>(this.base);
  }

  markFixed(body: MarkFixedRequest = {}): Observable<unknown> {
    return this.http.post(`${this.base}/actions/mark-fixed`, {
      comment: body.comment?.trim() || null,
    });
  }

  markBlocked(body: MarkBlockedRequest): Observable<unknown> {
    return this.http.post(`${this.base}/actions/mark-blocked`, {
      reason: body.reason.trim(),
    });
  }
}
