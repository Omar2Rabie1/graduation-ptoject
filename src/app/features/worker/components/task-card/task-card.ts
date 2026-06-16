import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkerTask } from '../../../../core/services/worker/worker-task.model';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, TranslatePipe],
  templateUrl: './task-card.html',
})
export class TaskCard {
  @Input({ required: true }) task!: WorkerTask;
  @Input() busy = false;
  @Output() accept = new EventEmitter<void>();
  @Output() reject = new EventEmitter<void>();

  get taskId(): string {
    return String(this.task?.id ?? this.task?.reportId ?? '—');
  }

  get statusLabel(): string {
    return String(this.task?.status ?? 'PENDING').toUpperCase();
  }
}
