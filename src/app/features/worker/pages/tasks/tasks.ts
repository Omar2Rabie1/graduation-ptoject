import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../../components/search-bar/search-bar';
import { Filters } from '../../components/filters/filters';
import { TaskCard } from '../../components/task-card/task-card';
import { WorkerMyTasksService } from '../../../../core/services/worker/worker-my-tasks.service';
import { WorkerTaskActionsService } from '../../../../core/services/worker/worker-task-actions.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import {
  WorkerTask,
  reportIdFromTask,
  mapWorkerTask,
} from '../../../../core/services/worker/worker-task.model';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, SearchBar, Filters, TaskCard, TranslatePipe],
  templateUrl: './tasks.html',
})
export class TasksComponent implements OnInit {
  private readonly myTasksApi = inject(WorkerMyTasksService);
  private readonly taskActionsApi = inject(WorkerTaskActionsService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  readonly reportIdFromTask = reportIdFromTask;

  tasks = signal<WorkerTask[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  actionLoadingId = signal<string | null>(null);

  get workerId(): string {
    return this.authService.currentUser()?.id || '—';
  }

  get workerName(): string {
    return this.authService.currentUser()?.name || '—';
  }

  copyWorkerId(): void {
    if (this.workerId && this.workerId !== '—') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.workerId).then(() => {
          this.notification.success('Worker ID copied to clipboard!');
        });
      } else {
        const el = document.createElement('textarea');
        el.value = this.workerId;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        this.notification.success('Worker ID copied to clipboard!');
      }
    }
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.myTasksApi.getMyTasks({ page: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        this.tasks.set((res?.items ?? []).map(mapWorkerTask));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load backend tasks', err);
        this.error.set(err?.error?.message || 'Failed to load tasks');
        this.tasks.set([]);
        this.loading.set(false);
      },
    });
  }

  onAccept(task: WorkerTask): void {
    const reportId = reportIdFromTask(task);
    if (!reportId) return;
    this.actionLoadingId.set(reportId);

    this.taskActionsApi.accept(reportId).subscribe({
      next: () => {
        this.actionLoadingId.set(null);
        this.loadTasks();
      },
      error: (err) => {
        this.actionLoadingId.set(null);
        this.error.set(err?.error?.message || 'Failed to accept task');
      },
    });
  }

  onReject(task: WorkerTask): void {
    const reportId = reportIdFromTask(task);
    if (!reportId) return;
    const reason = window.prompt('Reason for rejecting this task (optional):') ?? '';
    this.actionLoadingId.set(reportId);

    this.taskActionsApi.reject(reportId, { reason }).subscribe({
      next: () => {
        this.actionLoadingId.set(null);
        this.loadTasks();
      },
      error: (err) => {
        this.actionLoadingId.set(null);
        this.error.set(err?.error?.message || 'Failed to reject task');
      },
    });
  }
}
