import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  host: {
    class: 'fixed inset-y-0 left-0 flex w-64 flex-col border-r border-brand-border bg-brand-surface text-brand-text transition-transform duration-300 z-[1100] glass-panel p-4 gap-4'
  },
  template: `
    <!-- Profile Section -->
    <div class="flex items-center gap-[10px] shrink-0">
      <div class="w-[30px] h-[30px] rounded-full border border-brand-border bg-gradient-to-b from-brand-surface-light to-brand-surface"></div>
      <div>
        <div class="text-xs font-semibold text-brand-text">{{ 'adminUser' | translate }}</div>
        <div class="text-[10px] text-brand-muted">{{ 'systemAdministrator' | translate }}</div>
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex flex-col gap-1 flex-1 overflow-y-auto">
      <a routerLink="/admin/dashboard" routerLinkActive="active"
         class="h-[34px] flex items-center text-brand-muted no-underline border border-transparent rounded-md px-[10px] text-xs hover:bg-brand-surface-light hover:text-brand-text transition-colors">
        {{ 'dashboard' | translate }}
      </a>
      <a routerLink="/admin/users" routerLinkActive="active"
         class="h-[34px] flex items-center text-brand-muted no-underline border border-transparent rounded-md px-[10px] text-xs hover:bg-brand-surface-light hover:text-brand-text transition-colors">
        {{ 'users' | translate }}
      </a>
      <a routerLink="/admin/create-user" routerLinkActive="active"
         class="h-[34px] flex items-center text-brand-muted no-underline border border-transparent rounded-md px-[10px] text-xs hover:bg-brand-surface-light hover:text-brand-text transition-colors">
        {{ 'createUser' | translate }}
      </a>
      <a routerLink="/admin/audit-logs" routerLinkActive="active"
         class="h-[34px] flex items-center text-brand-muted no-underline border border-transparent rounded-md px-[10px] text-xs hover:bg-brand-surface-light hover:text-brand-text transition-colors">
        {{ 'auditLogs' | translate }}
      </a>
    </nav>

    <!-- Logout & Theme Toggle -->
    <div class="mt-auto flex flex-col gap-2 shrink-0">
      <button (click)="logout()" class="h-[34px] bg-brand-surface border border-brand-border rounded-[7px] text-brand-muted text-[11px] hover:bg-brand-surface-light hover:text-brand-text transition-colors">
        {{ 'logout' | translate }}
      </button>
    </div>
  `,
  styles: [`
    :host { display: flex !important; }
    .active {
      background: var(--color-primary-tint);
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  `]
})
export class AdminSidebar {
  private authService = inject(AuthService);

  constructor() {}

  logout(): void {
    this.authService.logout();
  }
}