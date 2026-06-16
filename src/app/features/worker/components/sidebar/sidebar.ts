import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-sidebar',
  imports: [FontAwesomeModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.html',
  host: {
    class: 'fixed inset-y-0 left-0 flex w-64 flex-col border-r border-brand-border bg-brand-surface text-brand-text transition-all duration-300 z-[1100] glass-panel'
  }
})
export class Sidebar {
  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
