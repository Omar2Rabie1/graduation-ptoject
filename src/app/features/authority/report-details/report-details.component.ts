import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicMapReportsService, PublicMapPopup } from '../../../core/services/public-map-reports.service';
import { MapComponent } from '../../../shared/components/map/map.component';
import { MapMarker } from '../../../shared/models/map-marker.model';

import { WorkersService, Worker } from '../../../core/services/authority/selected-worker.service';
import { IncomingReportsService } from '../../../core/services/authority/incoming-reports.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { LanguageService } from '../../../i18n/language.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

export interface ReportDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  reporterName: string;
  reporterInitials: string;
  reporterTime: string;
  status: string;
  images: string[];
  lat?: number;
  lng?: number;
}

interface MapWorker {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy';
  busyNote?: string;
}

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, MapComponent, TranslatePipe],
  templateUrl: './report-details.component.html',
  styleUrl: './report-details.component.css',
  host: {
    class: 'flex min-h-0 flex-1 flex-col',
  },
})
export class ReportDetailsComponent implements OnInit {
  private readonly publicMapReportsApi = inject(PublicMapReportsService);
  private readonly workersService = inject(WorkersService);
  private readonly incomingReportsService = inject(IncomingReportsService);
  langService = inject(LanguageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly notification = inject(NotificationService);

  reportId = '4092';

  readonly markers = signal<MapMarker[]>([]);

  readonly mapContainerClass = 'h-[240px] w-full overflow-hidden rounded-xl';

  workers: MapWorker[] = [];

  report: ReportDetails = {
    id: '',
    title: 'loading',
    description: 'loading',
    location: 'loading',
    reporterName: 'loading',
    reporterInitials: 'L',
    reporterTime: '',
    status: 'SUBMITTED',
    images: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  private extractArray(body: unknown): Worker[] {
    if (Array.isArray(body)) return body as Worker[];
    if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      if ('items' in obj && Array.isArray(obj['items'])) return obj['items'] as Worker[];
      if ('data' in obj) {
        const data = obj['data'];
        if (Array.isArray(data)) return data as Worker[];
        if (data && typeof data === 'object') {
          const dataObj = data as Record<string, unknown>;
          if ('items' in dataObj && Array.isArray(dataObj['items'])) return dataObj['items'] as Worker[];
          if ('data' in dataObj && Array.isArray(dataObj['data'])) return dataObj['data'] as Worker[];
        }
      }
    }
    return [];
  }

  private loadReportOnMap(id: string): void {
    this.publicMapReportsApi.getReportLocation(id).subscribe({
      next: (list) => {
        if (list && list.length > 0) {
          this.markers.set(list);
        } else {
          this.updateMarkerFromReport();
        }
      },
      error: () => this.updateMarkerFromReport(),
    });
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

  private getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private loadReportDetails(id: string): void {
    this.incomingReportsService.getAuthorityReportPopup(id).subscribe({
      next: (data: any) => {
        const reporterName = data.reporterName || data.reportedBy?.fullName || 'Unknown User';
        const rawPhotos = data.photos || data.photoUrls || data.images || data.photosPreview || [];
        const imagesList = Array.isArray(rawPhotos)
          ? rawPhotos.map((p: any) => {
              let path = '';
              if (typeof p === 'string') path = p;
              else if (p && typeof p === 'object') {
                path = p.imageUrl || p.url || p.photoUrl || '';
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
            }).filter(url => !!url)
          : [];

        this.report = {
          id: String(data.reportId || id),
          title: data.title || data.categoryName || 'Untitled Report',
          description: data.description || 'No description provided.',
          location: data.address || (data.latitude && data.longitude ? `${Number(data.latitude).toFixed(4)}, ${Number(data.longitude).toFixed(4)}` : 'Unknown Location'),
          reporterName: reporterName,
          reporterInitials: this.getInitials(reporterName),
          reporterTime: data.createdAt ? this.formatRelativeTime(data.createdAt) : 'Just now',
          status: (data.status || 'SUBMITTED').toUpperCase(),
          images: imagesList,
          lat: data.latitude,
          lng: data.longitude
        };
        if (!this.markers() || this.markers().length === 0) {
          this.updateMarkerFromReport();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load report details from API', err);
        this.report = {
          id,
          title: 'Error Loading Details',
          description: 'Failed to retrieve details from server.',
          location: '',
          reporterName: '',
          reporterInitials: '',
          reporterTime: '',
          status: 'ERROR',
          images: []
        };
        this.cdr.detectChanges();
      }
    });
  }

  private updateMarkerFromReport(): void {
    if (this.report && this.report.lat && this.report.lng) {
      this.markers.set([{
        id: String(this.report.id),
        lat: Number(this.report.lat),
        lng: Number(this.report.lng),
        title: this.report.title,
        description: this.report.description
      }]);
    }
  }

  private loadWorkers(): void {
    this.workersService.getWorkers().subscribe({
      next: (res) => {
        const data = this.extractArray(res);
        if (data.length > 0) {
          this.workers = data.map((w: Worker) => {
            const isBusy = w.activeTaskCount > 0;
            return {
              id: w.id,
              name: w.name || 'Unknown',
              role: w.specialization || 'General Support',
              status: isBusy ? 'busy' as const : 'available' as const,
              busyNote: isBusy ? 'Busy' : undefined
            };
          });
        } else {
          this.loadFallbackWorkers();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load workers from API, falling back', err);
        this.loadFallbackWorkers();
        this.cdr.detectChanges();
      }
    });
  }

  private loadFallbackWorkers(): void {
    this.workers = [
      { id: 'KA', name: 'Khalid Al-Mansour', role: 'Electrical', status: 'available' },
      {
        id: 'FS',
        name: 'Fahad Salem',
        role: 'Maintenance Tech',
        status: 'busy',
        busyNote: 'Busy (Rep #4089)',
      },
      { id: 'YA', name: 'Yousef Al-Zahrani', role: 'Junior Tech', status: 'available' },
    ];
  }

  assignWorker(workerId: string): void {
    if (!this.reportId) return;
    this.incomingReportsService.assignWorker(this.reportId, workerId).subscribe({
      next: () => {
        this.notification.success(this.langService.t('workerAssignedSuccess'));
        this.report.status = 'PENDING';
        this.loadWorkers();
      },
      error: (err) => {
        console.error('Assign worker failed', err);
        this.notification.error(err?.error?.message || this.langService.t('workerAssignmentFailed'));
      }
    });
  }

  close(): void {
    void this.router.navigate(['/authority/live-map']);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportId = id;
      this.loadReportOnMap(id);
      this.loadReportDetails(id);
    }
    this.loadWorkers();
  }

  workerListCount(): number {
    return this.workers.length;
  }
}
