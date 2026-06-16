import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

export interface TaskDetail {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
  description: string;
  location: string;
  reporter: string;
  assignedTo: string;
  photos: string[];
}

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, TranslatePipe],
  templateUrl: './task-detail.html', // ربطنا الملف ده بملف HTML منفصل
  styleUrls: ['./task-detail.css']   // وملف CSS منفصل
})
export class TaskDetailComponent {
  @Input() task: TaskDetail = {
    id: '4092',
    title: 'Transformer Maintenance',
    priority: 'High',
    status: 'IN PROGRESS',
    description: 'Severe voltage fluctuations reported...',
    location: 'Borg El Arab, Alexandria',
    reporter: 'Alex Driller',
    assignedTo: 'Marcus Lead',
    photos: [
      '/p-1.webp', // تأكد إن المسار ده موجود فعلاً
      '/p-1.webp',
      '/p-1.webp'
    ]
  };
}