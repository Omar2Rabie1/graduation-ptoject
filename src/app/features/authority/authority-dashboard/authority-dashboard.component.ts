import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-authority-dashboard',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <h2 class="text-xl font-semibold"><fa-icon [icon]="['fas', 'landmark']" class="me-2"></fa-icon> Authority Dashboard</h2>
    <p class="mt-1 text-gray-600">Monitor city-wide issue reports and worker assignments.</p>
    <div class="mt-4 flex flex-wrap gap-4">
      <div
        class="min-w-[150px] rounded-[10px] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        <h3 class="text-sm font-medium text-gray-700">Total Issues</h3>
        <p class="text-[2rem] font-bold text-[#4a148c]">0</p>
      </div>
      <div
        class="min-w-[150px] rounded-[10px] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        <h3 class="text-sm font-medium text-gray-700">Pending</h3>
        <p class="text-[2rem] font-bold text-[#4a148c]">0</p>
      </div>
      <div
        class="min-w-[150px] rounded-[10px] bg-white px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
      >
        <h3 class="text-sm font-medium text-gray-700">Resolved</h3>
        <p class="text-[2rem] font-bold text-[#4a148c]">0</p>
      </div>
    </div>
  `,
})
export class AuthorityDashboardComponent {}
