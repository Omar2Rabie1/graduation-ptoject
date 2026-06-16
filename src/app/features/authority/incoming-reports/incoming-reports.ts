import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MapReportsApiService } from '../../../core/services/authority/map-reports-api.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IncomingReportsService, ApiReport } from '../../../core/services/authority/incoming-reports.service';
import { MapMarker } from '../../../shared/models/map-marker.model';
import { SelectedWorkerComponent, SelectedWorkerIssue } from '../selected-worker/selected-worker.component';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { NotificationService } from '../../../core/services/notification/notification.service';

interface IncomingIssue {
  id: string;
  title: string;
  description: string;
  location: string;
  reporterName: string;
  reporterAvatarColor: string;
  priority: 'normal' | 'high';
  status: string;
  updatedAgo: string;
  images: string[];
}

import { TranslatePipe } from '../../../i18n/translate.pipe';
import { LanguageService } from '../../../i18n/language.service';

@Component({
  selector: 'app-incoming-reports',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, FormsModule, RouterLink, SelectedWorkerComponent, TranslatePipe],
  templateUrl: './incoming-reports.html',
  styleUrl: './incoming-reports.css',
})
export class IncomingReportsComponent implements OnInit {
  private readonly mapApi = inject(MapReportsApiService);
  private readonly incomingReportsService = inject(IncomingReportsService);
  private readonly notification = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  langService = inject(LanguageService);

  search = '';
  selectedIssue: SelectedWorkerIssue | null = null;
  private readonly markerCache = new Map<string, MapMarker[]>();

  issues: IncomingIssue[] = [];
  assignedReportIds = new Set<string>();

  private getAvatarColor(name: string): string {
    if (!name || typeof name !== 'string' || name === 'Unknown User') return '#a855f7';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
      '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
      '#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  private formatRelativeTime(dateStr: string): string {
    if (!dateStr) return this.langService.t('justNow');
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return this.langService.t('justNow');
      if (diffMins < 60) return `${diffMins} ${this.langService.t('updatedMinsAgo')}`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ${this.langService.t('updatedHoursAgo')}`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ${this.langService.t('daysAgo')}`;
    } catch {
      return dateStr;
    }
  }

  private extractArray(body: any): ApiReport[] {
    if (Array.isArray(body)) {
      return body;
    }
    if (body && Array.isArray(body.items)) {
      return body.items;
    }
    if (body && typeof body === 'object') {
      for (const key of Object.keys(body)) {
        if (Array.isArray(body[key])) {
          return body[key];
        }
      }
    }
    return [];
  }

  private getMockImages(title: string): string[] {
    const t = (title || '').toLowerCase();
    if (t.includes('transformer') || t.includes('electricity') || t.includes('power')) {
      return [
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&fit=crop&q=80'
      ];
    }
    if (t.includes('water') || t.includes('leakage') || t.includes('sewage') || t.includes('pipe') || t.includes('leak')) {
      return [
        'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542013936693-8848e574047a?w=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584267326895-d88985f71812?w=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&fit=crop&q=80'
      ];
    }
    return [];
  }

  ngOnInit(): void {
    this.loadIssues();
  }

  private loadIssues(): void {
    this.incomingReportsService.getIncomingReports(1, 50).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Failed to fetch incoming reports API', err);
        this.notification.error(err?.error?.message || err?.message || 'Failed to load incoming reports.');
        return of([] as any);
      })
    ).subscribe((apiReports) => {
      console.log('Incoming Reports API response:', apiReports);

      const rawApiArray = this.extractArray(apiReports);
      const mappedApi: IncomingIssue[] = rawApiArray.map((r: ApiReport) => {
        const reportId = r.id || (r as any).reportId;
        const idStr = reportId ? '#' + reportId : '#----';

        let reporter = 'Unknown User';
        const repObj = r.reportedBy || r.reporterName || r.author || r.user || (r as any).reportedBy;
        if (repObj) {
          if (typeof repObj === 'string') {
            reporter = repObj;
          } else if (typeof repObj === 'object') {
            reporter = repObj.name || repObj.fullName || repObj.username || repObj.email || (repObj as any).name || 'Unknown User';
          }
        }

        const lat = r.latitude ?? (r as any).lat ?? (r as any).latitude;
        const lng = r.longitude ?? (r as any).lng ?? (r as any).longitude;

        const formattedLoc = r.location || r.address || (r as any).address ||
          (lat && lng ? `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : 'Unknown Location');

        let priorityVal = 'normal';
        const rawPriority = r.priority ?? (r as any).priority;
        if (typeof rawPriority === 'string') {
          priorityVal = rawPriority.toLowerCase();
        } else if (typeof rawPriority === 'number') {
          priorityVal = rawPriority === 1 ? 'high' : 'normal';
        }
        const priority = (priorityVal === 'high' ? 'high' : 'normal') as 'normal' | 'high';

        let status = 'submitted';
        const rawStatus = r.status ?? (r as any).status;
        if (typeof rawStatus === 'string') {
          status = rawStatus.toLowerCase();
        } else if (typeof rawStatus === 'number') {
          status = rawStatus === 1 ? 'pending' : 'submitted';
        }

        const title = r.title || r.name || (r as any).categoryName || (r as any).category || 'Untitled Report';

        let imagesList: string[] = [];
        const rawPhotos = r.photos || r.images || (r as any).photoUrls || (r as any).photosPreview;
        if (Array.isArray(rawPhotos)) {
          imagesList = rawPhotos.map((item: any) => {
            let path = '';
            if (typeof item === 'string') path = item;
            else if (item && typeof item === 'object') {
              path = item.imageUrl || item.url || item.photoUrl || '';
            }
            if (!path) return '';
            
            if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
              return path;
            }
            let cleanUrl = path.startsWith('/') ? path.substring(1) : path;
            if (cleanUrl.startsWith('wwwroot/')) {
              cleanUrl = cleanUrl.substring(8);
            }
            return `https://irs-main.runasp.net/${cleanUrl}`;
          }).filter(url => !!url);
        }
        if (imagesList.length === 0) {
          imagesList = this.getMockImages(title);
        }

        return {
          id: idStr,
          title: title,
          description: r.description || r.desc || r.summary || (r as any).desc || 'No description provided.',
          location: formattedLoc,
          reporterName: reporter,
          reporterAvatarColor: this.getAvatarColor(reporter),
          priority,
          status,
          updatedAgo: r.updatedAgo ? r.updatedAgo : (r.createdAt ? this.formatRelativeTime(r.createdAt) : 'Just now'),
          images: imagesList
        };
      });

      this.issues = mappedApi;
      this.cdr.detectChanges();

      // Preload marker locations for API issues from coordinates or fallback API call
      for (const r of rawApiArray) {
        const reportId = r.id || (r as any).reportId;
        if (reportId) {
          const idStr = String(reportId);
          const lat = r.latitude ?? (r as any).lat ?? (r as any).latitude;
          const lng = r.longitude ?? (r as any).lng ?? (r as any).longitude;
          if (lat && lng) {
            this.markerCache.set(idStr, [{
              id: idStr,
              lat: Number(lat),
              lng: Number(lng),
              title: r.title || r.name || (r as any).categoryName || 'Untitled Report',
              description: r.description || r.desc || r.summary || 'No description provided.'
            }]);
          } else if (!this.markerCache.has(idStr)) {
            this.mapApi.getReportLocation(idStr).subscribe({
              next: (markers) => {
                this.markerCache.set(idStr, markers ?? []);
              },
              error: () => this.markerCache.set(idStr, []),
            });
          }
        }
      }
    });
  }

  get filteredIssues(): IncomingIssue[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.issues;
    return this.issues.filter(
      (i) =>
        i.id.toLowerCase().includes(term) ||
        i.title.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term) ||
        i.location.toLowerCase().includes(term) ||
        i.reporterName.toLowerCase().includes(term),
    );
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'pending' || s === 'in_progress' || s === 'inprogress') {
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/25';
    }
    if (s === 'fixed' || s === 'resolved' || s === 'completed') {
      return 'bg-green-500/10 text-green-400 border border-green-500/25';
    }
    if (s === 'rejected' || s === 'cancelled') {
      return 'bg-red-500/10 text-red-400 border border-red-500/25';
    }
    return 'bg-orange-500/10 text-orange-400 border border-orange-500/25';
  }

  getStatusLabel(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'inprogress' || s === 'in_progress') return 'inProgress';
    if (s === 'waitingconfirmation' || s === 'waiting_confirmation') return 'waitingConfirmation';
    if (s === 'resolved' || s === 'completed' || s === 'fixed') return 'fixed';
    return s;
  }

  openAssignWorker(issue: IncomingIssue): void {
    this.selectedIssue = { id: issue.id, title: issue.title };
  }

  closeSelectedWorker(): void {
    this.selectedIssue = null;
  }

  handleAssigned(payload: { issueId: string; workerId: string }): void {
    const reportId = this.reportIdForMap(payload.issueId);
    this.incomingReportsService.assignWorker(reportId, payload.workerId).subscribe({
      next: () => {
        this.assignedReportIds.add(reportId);
        this.selectedIssue = null;
        this.loadIssues();
        this.notification.success(this.langService.t('workerAssignedSuccess'));
      },
      error: (err: HttpErrorResponse) => {
        console.error('Assign worker failed', err);
        this.notification.error(err?.error?.message || this.langService.t('workerAssignmentFailed'));
      },
    });
  }

  reportIdForMap(issueId: string): string {
    // Incoming IDs are like "#0065" — map route expects plain id.
    return String(issueId ?? '').replace('#', '').trim();
  }

  issueMarkers(issue: IncomingIssue): MapMarker[] {
    const id = this.reportIdForMap(issue.id);
    return this.markerCache.get(id) ?? [];
  }
}

