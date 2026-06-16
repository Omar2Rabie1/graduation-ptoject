import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';

export interface AuditLog {
  _id?: string;
  timestamp: string;
  actor: string;
  email: string;
  actorRole: string;
  action: string;
  target: string;
  result: string;
}

export interface BackendAuditLog {
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  actionType: string;
  target: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/audit-logs`;

  getAuditLogs(): Observable<PaginatedResponse<BackendAuditLog>> {
    return this.http.get<PaginatedResponse<BackendAuditLog>>(this.apiUrl);
  }

  // Fallback for local logging until backend implements full auditing
  addLocalLog(log: Partial<AuditLog>) {
    const localLogs = this.getLocalLogs();
    const newLog: AuditLog = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: log.actor || 'System Administrator',
      email: log.email || 'admin@infracare.eg',
      actorRole: log.actorRole || 'Admin',
      action: log.action || 'Unknown Action',
      target: log.target || 'System',
      result: log.result || 'Success',
      ...log
    };
    localLogs.unshift(newLog); // Add to top
    localStorage.setItem('smartCity_auditLogs', JSON.stringify(localLogs));
  }

  getLocalLogs(): AuditLog[] {
    const saved = localStorage.getItem('smartCity_auditLogs');
    return saved ? JSON.parse(saved) : [];
  }
}
