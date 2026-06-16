import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FontAwesomeModule, RouterOutlet],
  template: `
    <div class="relative min-h-screen bg-brand-bg transition-colors duration-200">
      <!-- Floating Theme Toggle -->
      <div class="absolute top-4 right-4 z-50">
        <button type="button" (click)="toggleTheme()" class="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-brand-surface/80 text-brand-muted hover:text-brand-text-primary transition-all duration-150 ease-out hover:-translate-y-px shadow-lg cursor-pointer" aria-label="Toggle theme">
          <fa-icon [icon]="(isDarkMode) ? ['fas', 'sun'] : ['fas', 'moon']"></fa-icon>
        </button>
      </div>
      <router-outlet></router-outlet>
    </div>
  `,
})
export default class AuthComponent {
  private themeService = inject(ThemeService);

  get isDarkMode(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}