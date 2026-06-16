import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../../features/admin/components/admin-sidebar/admin-sidebar';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../i18n/language.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, AdminSidebar, RouterOutlet],
  template: `
    <div class="flex min-h-screen bg-brand-bg animate-fade-in relative">
      <div
        *ngIf="isSidebarOpen"
        (click)="toggleSidebar()"
        class="fixed inset-0 z-[1050] bg-black/45 lg:hidden"
      ></div>

      <!-- Sidebar: ثابت علي الشمال -->
      <app-admin-sidebar 
        class="transition-transform duration-300"
        [class.-translate-x-full]="!isSidebarOpen"
        [class.translate-x-0]="isSidebarOpen"
      ></app-admin-sidebar>
      
      <!-- Content Wrapper -->
      <div class="flex-1 flex flex-col min-h-screen transition-all duration-300"
           [class.lg:ml-64]="isSidebarOpen"
           [class.ml-0]="!isSidebarOpen">
        <!-- Top Navbar -->
        <header class="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-brand-border bg-brand-surface px-8 text-brand-text">
          <div class="flex items-center gap-3">
            <button
              (click)="toggleSidebar()"
              class="lg:hidden flex flex-col items-center justify-center w-8 h-8 rounded-full border-0 bg-transparent text-inherit hover:bg-brand-surface-light cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              <span class="block h-[1.8px] w-4 rounded-full bg-brand-muted"></span>
              <span class="mt-[3px] block h-[1.8px] w-4 rounded-full bg-brand-muted"></span>
              <span class="mt-[3px] block h-[1.8px] w-4 rounded-full bg-brand-muted"></span>
            </button>
            <div class="text-base font-semibold text-brand-text-primary">
              Admin Dashboard
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Language Switcher -->
            <button (click)="langService.toggle()" class="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-surface-light text-brand-muted hover:text-brand-text-primary transition-all cursor-pointer" [attr.aria-label]="langService.lang() === 'en' ? 'Switch to Arabic' : 'Switch to English'">
              <span class="text-xs font-bold">{{ langService.lang() === 'en' ? 'ع' : 'EN' }}</span>
            </button>
            <!-- Theme Switcher -->
            <button (click)="toggleTheme()" class="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-surface-light text-brand-muted hover:text-brand-text-primary transition-all cursor-pointer" aria-label="Toggle Theme">
              <fa-icon [icon]="(isDarkMode) ? ['fas', 'sun'] : ['fas', 'moon']"></fa-icon>
            </button>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-hidden p-8 bg-brand-bg"> 
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  private themeService = inject(ThemeService);
  langService = inject(LanguageService);

  isSidebarOpen = false;

  ngOnInit(): void {
    this.isSidebarOpen = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  get isDarkMode(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}