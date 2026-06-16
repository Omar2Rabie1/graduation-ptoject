import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { WORKER_API_BASE } from './worker-api.config';
import { WorkerListQuery, WorkerTask } from './worker-task.model';

/** GET /api/WorkerTasks/my-tasks */
@Injectable({ providedIn: 'root' })
export class WorkerMyTasksService {
  private readonly http = inject(HttpClient);
  private readonly url = `${WORKER_API_BASE}/WorkerTasks/my-tasks`;

  getMyTasks(query: WorkerListQuery = {}): Observable<PaginatedResponse<WorkerTask>> {
    return this.http.get<PaginatedResponse<WorkerTask>>(this.url, {
      params: this.toParams(query),
    });
  }

  private toParams(query: WorkerListQuery): HttpParams {
    let params = new HttpParams()
      .set('pageNumber', String(query.page ?? 1))
      .set('pageSize', String(query.pageSize ?? 10));
    if (query.searchTerm?.trim()) {
      params = params.set('searchTerm', query.searchTerm.trim());
    }
    if (query.status?.trim()) {
      params = params.set('status', query.status.trim());
    }
    return params;
  }
}
