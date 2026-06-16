import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FontAwesomeModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() isSidebarOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  private readonly asideBaseClass =
    'flex w-[260px] min-h-screen flex-col border-r border-brand-border bg-brand-surface px-4 py-5 text-brand-text transition-[transform] duration-[250ms] ease-out max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-[1100] max-lg:max-w-[260px] glass-panel';

  get asideHostClass(): string {
    return this.isSidebarOpen
      ? `${this.asideBaseClass} translate-x-0`
      : `${this.asideBaseClass} -translate-x-full lg:translate-x-0`;
  }
}
