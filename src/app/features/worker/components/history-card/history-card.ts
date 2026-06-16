import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

export interface HistoryTask {
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
  selector: 'app-history-card',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, TranslatePipe],
  template: `
    <div class="bg-brand-surface border border-brand-border rounded-xl p-6 flex gap-6 mb-6 hover:border-brand-primary/50 transition-colors glass-panel">

      <!-- Left Side: Details -->
      <div class="flex-1 flex flex-col">
        
        <!-- Header: ID & Status -->
        <div class="flex justify-between items-center mb-3">
          <div class="flex gap-3 items-center">
            <span class="text-xs px-2 py-1 bg-brand-bg border border-brand-border text-brand-muted rounded font-mono">
              #{{ task.id }}
            </span>
            
            <!-- Status Badge -->
            <span class="text-xs px-3 py-1 rounded-full font-semibold uppercase"
                  [ngClass]="{
                    'bg-green-500/20 text-green-400': task.status === 'FIXED',
                    'bg-red-500/20 text-red-400': task.status === 'BLOCKED' || task.status === 'REJECTED'
                  }">
              {{ task.status | translate }}
            </span>
          </div>
          <span class="text-xs text-brand-muted">{{ task.date }}</span>
        </div>

        <!-- Title -->
        <h2 class="text-xl font-bold text-white mb-2">{{ task.title | translate }}</h2>

        <!-- Description -->
        <p class="text-brand-muted text-sm mb-6 line-clamp-2">
          {{ task.description | translate }}
        </p>

        <!-- Meta Data Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-brand-border pt-4 mt-auto">
          <!-- Location -->
          <div class="flex items-center gap-2">
            <fa-icon [icon]="['fas', 'location-dot']" class="text-brand-muted w-4"></fa-icon>
            <div>
              <span class="block text-[10px] text-brand-muted font-bold uppercase tracking-wider">{{ 'location' | translate }}</span>
              <a *ngIf="task.mapUrl" [href]="task.mapUrl" target="_blank" class="text-xs text-brand-primary hover:underline">
                {{ 'openMap' | translate }}
              </a>
              <span *ngIf="!task.mapUrl" class="text-xs text-brand-muted">
                {{ task.location | translate }}
              </span>
            </div>
          </div>
          
          <!-- Reporter Details -->
          <div class="flex items-center gap-2">
            <fa-icon [icon]="['fas', 'user']" class="text-brand-muted w-4"></fa-icon>
            <div>
              <span class="block text-[10px] text-brand-muted font-bold uppercase tracking-wider">{{ 'reportedBy' | translate }}</span>
              <span class="text-xs text-brand-text-primary font-semibold">{{ task.reporter }}</span>
              <span *ngIf="task.submittedAt" class="block text-[9px] text-brand-muted mt-0.5">{{ task.submittedAt }}</span>
            </div>
          </div>

          <!-- Assignment Details -->
          <div *ngIf="task.assignedByName" class="flex items-center gap-2">
            <fa-icon [icon]="['fas', 'user']" class="text-brand-muted w-4"></fa-icon>
            <div>
              <span class="block text-[10px] text-brand-muted font-bold uppercase tracking-wider">{{ 'assignedBy' | translate }}</span>
              <span class="text-xs text-brand-text-primary font-semibold">{{ task.assignedByName }}</span>
              <span *ngIf="task.assignedAt" class="block text-[9px] text-brand-muted mt-0.5">{{ task.assignedAt }}</span>
            </div>
          </div>
        </div>
        
        <!-- Blockage Note -->
        <div *ngIf="task.status === 'BLOCKED' || task.status === 'REJECTED'" 
             class="mt-4 bg-red-900/10 border border-red-500/20 rounded-lg p-3 flex gap-2 items-start">
          <fa-icon [icon]="['fas', 'triangle-exclamation']" class="text-red-500 mt-1"></fa-icon>
          <div>
            <h4 class="text-red-400 text-xs font-bold mb-1">
              {{ (task.status === 'BLOCKED' ? 'blockageReport' : 'rejectionReason') | translate }}
            </h4>
            <p class="text-red-300 text-xs">{{ task.blockageReason }}</p>
          </div>
        </div>

      </div>

      <!-- Right Side: Photos -->
      <div class="w-[200px] flex-shrink-0">
        <p class="text-xs mb-2 text-brand-muted">{{ 'attachedPhotos' | translate }} ({{ task.photos.length }})</p>
        <div class="grid grid-cols-2 gap-2">
          <div *ngFor="let photo of task.photos.slice(0, 4)" 
               class="h-[70px] rounded bg-brand-bg overflow-hidden border border-brand-border">
            <img [src]="photo" class="w-full h-full object-cover" alt="">
          </div>
        </div>
      </div>

    </div>
  `
})
export class HistoryCardComponent {
  @Input() task: HistoryTask = {
    id: '',
    title: '',
    status: 'FIXED',
    description: '',
    location: '',
    reporter: '',
    date: '',
    photos: [],
    blockageReason: ''
  };
}