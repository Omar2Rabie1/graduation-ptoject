import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, Input, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

/** Parses a legacy CSS class string like 'fas fa-chart-bar' into an FA tuple. */
function parseIconClass(cls: string): [IconPrefix, IconName] {
  const parts = cls.trim().split(/\s+/);
  let prefix: IconPrefix = 'fas';
  let name: IconName = 'chart-bar';

  for (const part of parts) {
    if (part === 'fas' || part === 'far' || part === 'fab') {
      prefix = part as IconPrefix;
    } else if (part.startsWith('fa-')) {
      name = part.replace('fa-', '') as IconName;
    }
  }
  return [prefix, name];
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  template: `
    <div class="bg-[#11171C] border border-[#2B3544] rounded-xl p-6 flex items-center gap-4 hover:border-gray-600 transition-all">
      <div class="w-12 h-12 rounded-full flex items-center justify-center" [ngStyle]="{'background-color': iconBg}">
        <fa-icon [icon]="parsedIcon" class="text-xl" [ngStyle]="{'color': iconColor}"></fa-icon>
      </div>
      <div>
        <p class="text-3xl font-bold text-white">{{ count }}</p>
        <p class="text-sm text-gray-500">{{ label }}</p>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() label: string = 'Label';
  @Input() count: number = 0;
  @Input() icon: string = 'fas fa-chart-bar';
  @Input() iconColor: string = '#fff';
  @Input() iconBg: string = '#2B3544';

  get parsedIcon(): [IconPrefix, IconName] {
    return parseIconClass(this.icon);
  }
}