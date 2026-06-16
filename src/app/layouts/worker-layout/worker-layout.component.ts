import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "../../features/worker/components/sidebar/sidebar";
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../i18n/language.service';

@Component({
  selector: 'app-worker-layout',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, RouterOutlet, Sidebar],
  templateUrl: './worker-layout.component.html'
})
export class WorkerLayoutComponent implements OnInit {
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