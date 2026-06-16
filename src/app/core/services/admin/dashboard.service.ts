import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DashboardStatsDto {
  totalUsers: number;
  activeWorkers: number;
  pendingIssues: number;
  resolvedIssues: number;
}

export interface WeeklyTrafficDto {
  dayOfWeek: string;
  reportedCount: number;
  resolvedCount: number;
}

export interface CategoryStatDto {
  categoryName: string;
  totalReported: number;
  resolvedCount: number;
}

export interface LiveIssueDto {
  reportId: number;
  categoryName: string;
  reporterName: string;
  status: string;
  submittedAt: string;
  priority: string;
}

export interface RecentActionDto {
  workerName: string;
  actionType: string;
  targetEntity: string;
  timestamp: string;
}

export interface DashboardResponseDto {
  stats: DashboardStatsDto;
  weeklyTraffic: WeeklyTrafficDto[] | null;
  categoryStats: CategoryStatDto[] | null;
  liveIssues: LiveIssueDto[] | null;
  recentActions: RecentActionDto[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardResponseDto> {
    return this.http.get<DashboardResponseDto>(`${environment.apiUrl}/admin/dashboard`);
  }

  getDashboardStats(): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${environment.apiUrl}/admin/dashboard/stats`);
  }

  getWeeklyTraffic(): Observable<WeeklyTrafficDto[]> {
    return this.http.get<WeeklyTrafficDto[]>(`${environment.apiUrl}/admin/dashboard/weekly-traffic`);
  }

  getCategoryStats(): Observable<CategoryStatDto[]> {
    return this.http.get<CategoryStatDto[]>(`${environment.apiUrl}/admin/dashboard/category-stats`);
  }

  getLiveIssues(): Observable<LiveIssueDto[]> {
    return this.http.get<LiveIssueDto[]>(`${environment.apiUrl}/admin/dashboard/live-issues`);
  }

  getRecentActions(): Observable<RecentActionDto[]> {
    return this.http.get<RecentActionDto[]>(`${environment.apiUrl}/admin/dashboard/recent-actions`);
  }
}
