import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryCardComponent } from '../../components/history-card/history-card';
import { SearchBar } from '../../components/search-bar/search-bar';
import { WorkerHistoryService } from '../../../../core/services/worker/worker-history.service';
import { WorkerTask, mapWorkerTask } from '../../../../core/services/worker/worker-task.model';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

interface HistoryCardModel {
  id: string;
  title: string;
  status: string;
  description: string;
  location: string;
  reporter: string;
  date: string;
  photos: string[];
  blockageReason?: string;
  mapUrl?: string;
  assignedByName?: string;
  assignedAt?: string;
  submittedByName?: string;
  submittedAt?: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, HistoryCardComponent, SearchBar, TranslatePipe],
  template: `
    <div class="flex min-h-full flex-col gap-6 text-brand-text animate-fade-in">
      <header>
        <h1 class="text-3xl font-bold text-brand-text-primary">{{ 'history' | translate }}</h1>
        <p class="text-brand-muted mt-1">{{ 'historySub' | translate }}</p>
      </header>

      <app-search-bar></app-search-bar>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="size-10 animate-spin rounded-full border-2 border-brand-border border-t-brand-primary"></div>
        </div>
      }

      @if (!loading() && error()) {
        <div class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {{ error() }}
          <button type="button" class="ml-3 underline" (click)="loadHistory()">{{ 'retry' | translate }}</button>
        </div>
      }

      @if (!loading() && !error() && historyTasks().length === 0) {
        <p class="text-center text-sm text-brand-muted py-12">{{ 'noHistory' | translate }}</p>
      }

      <div class="space-y-4">
        @for (task of historyTasks(); track task.id) {
          <app-history-card [task]="task"></app-history-card>
        }
      </div>
    </div>
  `,
})
export class HistoryPage implements OnInit {
  private readonly historyApi = inject(WorkerHistoryService);

  historyTasks = signal<HistoryCardModel[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.error.set(null);
    this.historyApi.getHistory({ page: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        console.log('History Raw API Response:', res);
        const items = res?.items ?? [];
        console.log('History raw items:', items);
        
        const mapped = items.map(mapWorkerTask).map((t) => this.toCardModel(t));
        this.historyTasks.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || err?.message || 'Failed to load history');
      },
    });
  }

  private toCardModel(task: WorkerTask): HistoryCardModel {
    const rawStatus = String(task.status ?? '').toUpperCase();
    let status = 'FIXED';
    if (rawStatus.includes('BLOCK') || rawStatus.includes('RETURN') || rawStatus.includes('BLOCKED')) {
      status = 'BLOCKED';
    } else if (rawStatus.includes('REJECT') || rawStatus.includes('REJECTED')) {
      status = 'REJECTED';
    } else if (rawStatus.includes('FIXED') || rawStatus.includes('RESOLVED') || rawStatus.includes('COMPLETED')) {
      status = 'FIXED';
    }

    // Robust candidate-based parsing to traverse all possible structures
    const candidates = [
      (task as any).task?.report,
      (task as any).workerTask?.report,
      (task as any).task,
      (task as any).workerTask,
      (task as any).report,
      (task as any).issue,
      task
    ].filter(c => !!c);

    // 1. Parse Title / Category
    let titleVal = 'Untitled';
    for (const c of candidates) {
      const t = c.category || c.categoryName || c.title;
      if (t && String(t).trim()) {
        titleVal = String(t).trim();
        break;
      }
    }

    // 2. Parse Description
    let descriptionVal = '';
    for (const c of candidates) {
      const d = c.description || c.desc || c.notes;
      if (d && String(d).trim()) {
        descriptionVal = String(d).trim();
        break;
      }
    }

    // 3. Parse Location
    let locationVal = '—';
    for (const c of candidates) {
      const loc = c.location || c.address;
      if (loc) {
        if (typeof loc === 'string' && loc.trim()) {
          locationVal = loc.trim();
          break;
        } else if (typeof loc === 'object') {
          const addr = loc.address || loc.name;
          if (addr && String(addr).trim()) {
            locationVal = String(addr).trim();
            break;
          }
        }
      }
    }

    // 4. Parse Reporter Name (with extra fallback candidates)
    let reporterVal = '—';
    const repName = task.submittedByName || task.reporterName;
    if (repName) {
      reporterVal = String(repName).trim();
    } else {
      for (const c of candidates) {
        const rep = c.reporterName || c.reportedBy || c.reporter || c.user || c.author || 
                    c.reportedByUser || c.citizen || c.citizenName || c.reporterFullName;
        if (rep) {
          if (typeof rep === 'string' && rep.trim()) {
            reporterVal = rep.trim();
            break;
          } else if (typeof rep === 'object') {
            const name = rep.fullName || rep.name || rep.username || rep.email || rep.userName;
            if (name && String(name).trim()) {
              reporterVal = String(name).trim();
              break;
            }
          }
        }
      }
    }

    // 5. Parse Photos
    let rawPhotos: any[] = [];
    for (const c of candidates) {
      const p = c.images || c.photos || c.photoUrls || c.photosPreview;
      if (Array.isArray(p) && p.length > 0) {
        rawPhotos = p;
        break;
      }
    }
    
    const formatPhotoUrl = (path: any): string => {
      if (!path) return '';
      let url = '';
      if (typeof path === 'string') {
        url = path;
      } else if (path && typeof path === 'object') {
        url = path.imageUrl || path.url || path.photoUrl || '';
      }
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
      }
      let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
      if (cleanUrl.startsWith('wwwroot/')) {
        cleanUrl = cleanUrl.substring(8);
      }
      return `https://irs-main.runasp.net/${cleanUrl}`;
    };

    const photosVal = Array.isArray(rawPhotos)
      ? rawPhotos.map(p => formatPhotoUrl(p)).filter(url => !!url)
      : [];

    const rawDate = task.submittedAt || task.assignedAt || task.assignedDate;
    const dateVal = rawDate ? new Date(rawDate).toLocaleString() : '—';
    const blockageReason = task.rejectionReason || task.notes || '';

    return {
      id: String(task.id ?? task.reportId ?? ''),
      title: titleVal,
      status: status,
      description: descriptionVal,
      location: locationVal,
      reporter: reporterVal,
      date: dateVal,
      photos: photosVal,
      blockageReason: blockageReason ? String(blockageReason) : undefined,
      mapUrl: task.mapUrl ? String(task.mapUrl) : undefined,
      assignedByName: task.assignedByName ? String(task.assignedByName) : undefined,
      assignedAt: task.assignedAt ? new Date(task.assignedAt).toLocaleString() : undefined,
      submittedByName: reporterVal,
      submittedAt: task.submittedAt ? new Date(task.submittedAt).toLocaleString() : undefined
    };
  }
}
