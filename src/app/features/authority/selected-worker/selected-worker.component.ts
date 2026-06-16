import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { WorkersService, Worker } from '../../../core/services/authority/selected-worker.service';

export interface SelectedWorkerIssue {
  id: string;
  title: string;
}

interface WorkerOption {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'offline';
}

import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-selected-worker',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, TranslatePipe, FormsModule],
  templateUrl: './selected-worker.component.html',
  styleUrl: './selected-worker.component.css',
})
export class SelectedWorkerComponent implements OnChanges, OnInit {
  @Input() issue: SelectedWorkerIssue | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() assigned = new EventEmitter<{ issueId: string; workerId: string }>();

  customWorkerId = '';

  onAssignCustom(): void {
    if (!this.issue || !this.customWorkerId.trim()) return;
    this.assigned.emit({ issueId: this.issue.id, workerId: this.customWorkerId.trim() });
    this.close.emit();
  }

  private readonly workersService = inject(WorkersService);

  workers: WorkerOption[] = [];
  demoWorkers: WorkerOption[] = [
    { id: 'KM', name: 'Khalid M.', role: 'Field Specialist', status: 'available' },
    { id: 'FS', name: 'Fahad S.', role: 'Road Maintenance', status: 'busy' },
    { id: 'YA', name: 'Yousef A.', role: 'Water Technician', status: 'busy' },
    { id: 'AA', name: 'Amir A.', role: 'General Support', status: 'offline' },
    { id: 'MA', name: 'Mohammed A.', role: 'General Support', status: 'offline' },
  ];

  selectedWorkerId: string | null = null;

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

  ngOnInit(): void {
    this.workersService.getWorkers().subscribe({
      next: (res) => {
        const data = this.extractArray(res);
        if (data.length > 0) {
          this.workers = data.map((w: Worker) => ({
            id: w.id,
            name: w.name || 'Unknown',
            role: w.specialization || 'General Support',
            status: w.activeTaskCount > 0 ? 'busy' as const : 'available' as const
          }));
        } else {
          this.workers = this.demoWorkers;
        }
        this.selectFirstAvailableWorker();
      },
      error: (err) => {
        console.error('Failed to load workers', err);
        this.workers = this.demoWorkers;
        this.selectFirstAvailableWorker();
      }
    });
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.selectFirstAvailableWorker();
  }

  private selectFirstAvailableWorker(): void {
    if (this.issue) {
      this.selectedWorkerId = this.workers.find((w) => w.status === 'available')?.id ?? null;
    } else {
      this.selectedWorkerId = null;
    }
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  onAssign(): void {
    if (!this.issue || !this.selectedWorkerId) return;
    this.assigned.emit({ issueId: this.issue.id, workerId: this.selectedWorkerId });
    this.close.emit();
  }

  workerRowClass(worker: WorkerOption): string {
    const base = 'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all duration-150';
    if (worker.id === this.selectedWorkerId) {
      return `${base} border-brand-primary bg-brand-primary/5 shadow-[0_0_15px_rgba(242,122,66,0.15)]`;
    }
    return `${base} border-brand-border bg-brand-bg/40 hover:border-brand-muted/40 hover:bg-brand-bg/60`;
  }
}

