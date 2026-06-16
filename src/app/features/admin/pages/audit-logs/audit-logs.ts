import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogsService, AuditLog, BackendAuditLog } from '../../../../core/services/admin/audit-logs.service';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, FormsModule, TranslatePipe],
  template: `
    <!--ROOT: h-screen عشان يملى الطول، w-full عشان يملى العرض، overflow-hidden عشان نتحكم في السكرول جوه -->
    <div class="h-full w-full flex flex-col text-brand-text overflow-hidden bg-brand-bg animate-fade-in">
      
      <!-- Topbar -->
      <header class="flex-shrink-0 h-[42px] border-b border-brand-border bg-brand-surface flex items-center justify-between px-6">
        <h2 class="text-[15px] font-medium">{{ 'auditLogs' | translate }}</h2>
        <div class="text-brand-muted text-[11px]">CFG | ALR</div>
      </header>

      <!-- Main Content Area -->
      <div class="flex-1 p-4 md:p-6 overflow-hidden flex flex-col gap-4 animate-slide-up">
        
        <!-- Card Container -->
        <section class="flex-1 flex flex-col glass-panel rounded-xl overflow-hidden">
          
          <!-- Filters (Responsive Grid) -->
          <!-- على الموبايل (sm): عمود واحد، على التابلت (md): عمودين، على الشاشات الكبيرة (lg): 4 أعمدة -->
          <div class="flex-shrink-0 p-4 border-b border-brand-border bg-brand-surface grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            
            <!-- Search Input -->
            <input type="text" [placeholder]="'searchActorEmail' | translate" 
                   class="w-full h-[38px] border border-brand-border rounded-lg bg-brand-bg text-brand-text text-xs px-3 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                   [(ngModel)]="search" />

            <!-- Date -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] text-brand-muted uppercase tracking-wider font-medium">{{ 'dateRange' | translate }}</label>
              <input type="text" class="w-full h-[38px] border border-brand-border rounded-lg bg-brand-bg text-brand-text text-xs px-3 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" [(ngModel)]="dateRange" />
            </div>

            <!-- Role -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] text-brand-muted uppercase tracking-wider font-medium">{{ 'roleLabel' | translate }}</label>
              <select class="w-full h-[38px] border border-brand-border rounded-lg bg-brand-bg text-brand-text text-xs px-3 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" [(ngModel)]="selectedRole">
                <option *ngFor="let role of roles" [value]="role">{{ role | translate }}</option>
              </select>
            </div>

            <!-- Result -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] text-brand-muted uppercase tracking-wider font-medium">{{ 'resultLabel' | translate }}</label>
              <select class="w-full h-[38px] border border-brand-border rounded-lg bg-brand-bg text-brand-text text-xs px-3 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all" [(ngModel)]="selectedResult">
                <option *ngFor="let result of results" [value]="result">{{ result | translate }}</option>
              </select>
            </div>
          </div>

          <!-- Table Wrapper (Scrollable Area) -->
          <div class="flex-1 overflow-auto custom-scrollbar">
            <table class="w-full min-w-[900px] border-collapse"> <!-- min-width عشان نضمن ان التيبل مبيتكسرش على الموبايل وبيعمل سكرول افقي -->
              <thead class="sticky top-0 z-10 bg-brand-surface">
                <tr class="text-[11px] text-brand-muted uppercase tracking-wider border-b border-brand-border">
                  <th class="p-3 text-left font-semibold">{{ 'timestampLabel' | translate }}</th>
                  <th class="p-3 text-left font-semibold">{{ 'actorLabel' | translate }}</th>
                  <th class="p-3 text-left font-semibold">{{ 'email' | translate }}</th>
                  <th class="p-3 text-left font-semibold">{{ 'actorRoleLabel' | translate }}</th>
                  <th class="p-3 text-left font-semibold">{{ 'actionLabel' | translate }}</th>
                  <th class="p-3 text-left font-semibold">{{ 'targetLabel' | translate }}</th>
                  <th class="p-3 text-left font-semibold">{{ 'resultLabel' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of pagedLogs" class="hover:bg-brand-surface-light transition-colors border-b border-brand-border">
                  <td class="p-3 text-xs whitespace-nowrap">{{ log.timestamp }}</td>
                  <td class="p-3 text-xs whitespace-nowrap font-medium text-white">{{ log.actor }}</td>
                  <td class="p-3 text-xs whitespace-nowrap text-brand-muted">{{ log.email }}</td>
                  <td class="p-3 text-xs whitespace-nowrap">
                    <span class="px-2 py-1 rounded text-[10px] font-bold" [ngClass]="roleClass(log.actorRole)">{{ log.actorRole | translate }}</span>
                  </td>
                  <td class="p-3 text-xs whitespace-nowrap">{{ log.action | translate }}</td>
                  <td class="p-3 text-xs whitespace-nowrap text-brand-muted">{{ log.target | translate }}</td>
                  <td class="p-3 text-xs whitespace-nowrap">
                    <span class="px-2 py-1 rounded text-[10px] font-bold" [ngClass]="resultClass(log.result)">{{ log.result | translate }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <footer class="flex-shrink-0 h-[48px] border-t border-brand-border px-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-brand-muted bg-brand-surface">
            <span class="mb-2 sm:mb-0">
              {{ 'showing' | translate }} {{ shownFrom }} {{ 'to' | translate }} {{ shownTo }} {{ 'of' | translate }} {{ filteredLogs.length }} {{ 'events' | translate }}
            </span>
            
            <div class="flex gap-2">
              <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1"
                      class="h-[28px] rounded-lg border border-brand-border bg-brand-surface-light px-3 disabled:opacity-40 hover:border-brand-primary hover:text-brand-primary transition-all text-xs">
                {{ 'prevBtn' | translate }}
              </button>
              <button *ngFor="let page of visiblePages" 
                      (click)="goToPage(page)"
                      class="h-[28px] w-[28px] rounded-lg border border-brand-border bg-brand-surface-light text-xs hover:border-brand-primary hover:text-brand-primary transition-all"
                      [ngClass]="{'bg-brand-primary border-brand-primary text-white font-bold hover:text-white': page === currentPage}">
                {{ page }}
              </button>
              <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages"
                      class="h-[28px] rounded-lg border border-brand-border bg-brand-surface-light px-3 disabled:opacity-40 hover:border-brand-primary hover:text-brand-primary transition-all text-xs">
                {{ 'nextBtn' | translate }}
              </button>
            </div>
          </footer>

        </section>
      </div>
    </div>
  `,
  styles: [`
    /* Optional: Custom Scrollbar Styling */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #050d19; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #2B3544; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f27a42; }
  `]
})
export class AuditLogsPageComponent implements OnInit {
  private auditLogsService = inject(AuditLogsService);
  private cdr = inject(ChangeDetectorRef);

  search = '';
  dateRange = '2023-10-01 to 2023-10-12';
  selectedRole = 'All';
  selectedResult = 'All';
  roles = ['All', 'Admin', 'Authority', 'Worker', 'Public User', 'System'];
  results = ['All', 'Success', 'Pending Review', 'Warning', 'Rejected'];

  logs: AuditLog[] = [];
  isLoading = true;

  ngOnInit() {
    this.auditLogsService.getAuditLogs().subscribe({
      next: (res) => {
        let rawLogs: BackendAuditLog[] = [];
        if (res && res.items && Array.isArray(res.items)) {
          rawLogs = res.items;
        } else if (Array.isArray(res)) {
          rawLogs = res as BackendAuditLog[];
        }

        const apiLogs: AuditLog[] = rawLogs.map(log => ({
          timestamp: log.timestamp,
          actor: log.actorName,
          email: log.actorEmail,
          actorRole: log.actorRole,
          action: log.actionType,
          target: log.target,
          result: 'Success'
        }));

        const rawLocal = this.auditLogsService.getLocalLogs();
        const localLogs = Array.isArray(rawLocal) ? rawLocal : [];
        this.logs = [...localLogs, ...apiLogs];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error fetching audit logs', err);
        const rawLocal = this.auditLogsService.getLocalLogs();
        const localLogs = Array.isArray(rawLocal) ? rawLocal : [];
        // Fallback to dummy data so the UI still renders
        const dummyLogs = [
          { timestamp: '2023-10-05 14:32:01', actor: 'System Administrator', email: 'admin@infracare.eg', actorRole: 'Admin', action: 'Update Config', target: 'System Settings', result: 'Success' },
          { timestamp: '2023-10-06 09:15:22', actor: 'John Doe', email: 'john.doe@example.com', actorRole: 'Authority', action: 'Delete Report', target: 'Report #1234', result: 'Warning' },
          { timestamp: '2023-10-07 11:45:10', actor: 'Jane Smith', email: 'jane.smith@example.com', actorRole: 'Worker', action: 'Resolve Issue', target: 'Issue #5678', result: 'Pending Review' },
          { timestamp: '2023-10-08 16:20:05', actor: 'System Auto', email: 'system@example.com', actorRole: 'System', action: 'Daily Backup', target: 'Database', result: 'Success' },
          { timestamp: '2023-10-09 08:05:44', actor: 'Guest User', email: 'guest@example.com', actorRole: 'Public User', action: 'Submit Feedback', target: 'Feedback Form', result: 'Rejected' },
        ];
        this.logs = [...localLogs, ...dummyLogs];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredLogs() {
    return this.logs.filter(log => {
      const matchSearch = log.actor?.toLowerCase().includes(this.search.toLowerCase()) ||
        log.email?.toLowerCase().includes(this.search.toLowerCase());
      const matchRole = this.selectedRole === 'All' || log.actorRole === this.selectedRole;
      const matchResult = this.selectedResult === 'All' || log.result === this.selectedResult;
      return matchSearch && matchRole && matchResult;
    });
  }
  pageSize = 10;
  currentPage = 1;
  get totalPages(): number { return Math.ceil(this.filteredLogs.length / this.pageSize); }
  get pagedLogs() { return this.filteredLogs.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  get shownFrom() { return (this.currentPage - 1) * this.pageSize + 1; }
  get shownTo() { return Math.min(this.currentPage * this.pageSize, this.filteredLogs.length); }
  get visiblePages(): number[] { return [1]; } // Simple logic for demo
  goToPage(page: number) { this.currentPage = page; }

  roleClass(role: string): string {
    const map: { [key: string]: string } = {
      'Admin': 'text-[#ff70a0] bg-[#ff70a0]/10',
      'Authority': 'text-[#66b8ff] bg-[#66b8ff]/10',
      'Worker': 'text-[#9b8dff] bg-[#9b8dff]/10',
      'Public User': 'text-[#ffb362] bg-[#ffb362]/10',
      'System': 'text-[#98aec8] bg-[#98aec8]/10'
    };
    return map[role] || '';
  }

  resultClass(result: string): string {
    const map: { [key: string]: string } = {
      'Success': 'text-[#1fe08d] bg-[#1fe08d]/10',
      'Pending Review': 'text-[#efb84f] bg-[#efb84f]/10',
      'Warning': 'text-[#ffd26d] bg-[#ffd26d]/10',
      'Rejected': 'text-[#ff5a72] bg-[#ff5a72]/10'
    };
    return map[result] || '';
  }
}