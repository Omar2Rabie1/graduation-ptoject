import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// src/app/features/worker/pages/worker-current-task/worker-current-task.component.ts

import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';



import { Role } from '../../../../shared/enums/role.enum';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { WorkerCurrentTaskService } from '../../../../core/services/worker/worker-current-task.service';
import { WorkerTask, mapWorkerTask } from '../../../../core/services/worker/worker-task.model';
import { TranslatePipe } from '../../../../i18n/translate.pipe';


@Component({
  selector: 'app-worker-current-task',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, FormsModule, TranslatePipe],
  templateUrl: './current-task.html',
})
export class WorkerCurrentTaskComponent implements OnInit {

  private currentTaskApi = inject(WorkerCurrentTaskService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // ==================== Signals ====================

  loading = signal<boolean>(false);

  error = signal<string | null>(null);

  currentTask = signal<WorkerTask | null>(null);

  message = signal<string>('');

  isSubmitting = signal<boolean>(false);

  // ==================== UI State ====================

  showReturnModal = signal<boolean>(false);

  returnNotes = signal<string>('');

  // ==================== Lifecycle ====================

  ngOnInit(): void {

    // Check role
    if (!this.authService.hasRole(Role.Worker)) {

      this.router.navigate(['/not-found']);
      return;
    }

    this.loadCurrentTask();
  }

  // ==================== Load Current Task ====================

  loadCurrentTask(): void {
    this.loading.set(true);
    this.error.set(null);

    this.currentTaskApi.getCurrentTask().subscribe({
      next: (res) => {
        const firstTask =
          res?.items && res.items.length > 0
            ? res.items[0]
            : null;

        this.currentTask.set(firstTask ? mapWorkerTask(firstTask) : null);
        this.message.set(
          res?.message || (firstTask ? 'Task in progress' : 'No current task in progress')
        );
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load backend current task', err);
        this.loading.set(false);
        this.error.set(err.message || 'Failed to load current task');
      }
    });
  }

  // ==================== Actions ====================

  markAsFixed(): void {
    const task = this.currentTask();
    if (!task) {
      return;
    }

    this.isSubmitting.set(true);

    this.currentTaskApi.markFixed({ comment: 'Task completed successfully' }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.loadCurrentTask();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(
          err.message || 'Failed to mark task as fixed'
        );
      }
    });
  }

  // ==================== Return Task ====================

  openReturnModal(): void {

    this.showReturnModal.set(true);

    this.returnNotes.set('');
  }

  closeReturnModal(): void {

    this.showReturnModal.set(false);
  }

  returnTask(): void {
    const task = this.currentTask();
    const notes = this.returnNotes();

    if (!task || !notes.trim()) {
      this.error.set(
        'Please provide a reason for returning the task'
      );
      return;
    }

    this.isSubmitting.set(true);

    this.currentTaskApi.markBlocked({ reason: notes.trim() }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showReturnModal.set(false);
        this.loadCurrentTask();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(
          err.message || 'Failed to return task'
        );
      }
    });
  }

  // ==================== Refresh ====================

  refresh(): void {

    this.loadCurrentTask();
  }
}