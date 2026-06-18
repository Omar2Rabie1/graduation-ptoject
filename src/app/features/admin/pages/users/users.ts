import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// src/app/features/admin/pages/users/users.page.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersService, AdminUser, AdminUserProfile } from '../../../../core/services/admin/user.services';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../i18n/translate.pipe';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { AuditLogsService } from '../../../../core/services/admin/audit-logs.service';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="p-8 animate-fade-in">
      <div class="flex justify-between items-center mb-6 animate-slide-up">
        <h1 class="text-3xl font-bold text-brand-text">{{ 'usersManagement' | translate }}</h1>
        <button routerLink="/admin/create-user" class="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 transition-all">
          + {{ 'createUser' | translate }}
        </button>
      </div>

      <!-- Table Container -->
      <div class="glass-panel rounded-xl overflow-x-auto animate-slide-up" style="animation-delay: 0.1s;">
        <table class="w-full min-w-[700px] text-left text-sm text-brand-muted">
          <thead class="bg-brand-surface border-b border-brand-border uppercase text-xs tracking-wider">
            <tr>
              <th class="px-6 py-4">{{ 'usernameLabel' | translate }}</th>
              <th class="px-6 py-4">{{ 'phoneLabel' | translate }}</th>
              <th class="px-6 py-4">{{ 'email' | translate }}</th>
              <th class="px-6 py-4">{{ 'roleLabel' | translate }}</th>
              <th class="px-6 py-4">{{ 'statusLabel' | translate }}</th>
              <th class="px-6 py-4">{{ 'actionTitle' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users" class="border-b border-brand-border hover:bg-brand-surface-light transition-all">
              <td class="px-6 py-4 font-medium text-brand-text">{{ user.name }}</td>
              <td class="px-6 py-4">{{ user.phone }}</td>
              <td class="px-6 py-4">{{ user.email }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs" 
                      [ngClass]="{'bg-blue-500/20 text-blue-400': user.role === 'Authority', 
                                  'bg-green-500/20 text-green-400': user.role === 'Worker',
                                  'bg-gray-500/20 text-gray-400': user.role === 'Public User'}">
                  {{ user.role | translate }}
                </span>
              </td>
              <td class="px-6 py-4">
                <select [value]="user.status" 
                        (change)="onStatusChange(user, $any($event.target).value)"
                        class="bg-brand-surface border border-brand-border rounded-lg text-xs px-2 py-1 outline-none font-medium transition-all cursor-pointer"
                        [ngClass]="{
                          'text-green-400 border-green-500/20 bg-green-500/5': user.status === 'Active', 
                          'text-yellow-400 border-yellow-500/20 bg-yellow-500/5': user.status === 'Suspended',
                          'text-red-400 border-red-500/20 bg-red-500/5': user.status === 'Locked',
                          'text-gray-400 border-gray-500/20 bg-gray-500/5': user.status === 'Inactive' || user.status === 'Disabled'
                        }">
                  <option value="Active" class="bg-brand-surface text-brand-text">{{ 'Active' | translate }}</option>
                  <option value="Inactive" class="bg-brand-surface text-brand-text">{{ 'Inactive' | translate }}</option>
                  <option value="Suspended" class="bg-brand-surface text-brand-text">{{ 'Suspended' | translate }}</option>
                  <option value="Locked" class="bg-brand-surface text-brand-text">{{ 'Locked' | translate }}</option>
                </select>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <button (click)="onViewProfile(user.id)" class="text-brand-primary hover:underline hover:text-brand-primary-hover cursor-pointer bg-transparent border-0 text-sm">{{ 'viewProfile' | translate }}</button>
                  <button (click)="onDeleteUser(user)" 
                          class="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border border-transparent hover:border-red-500/20">
                    {{ 'deleteUser' | translate }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Profile Modal -->
    <div *ngIf="showProfileModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div (click)="closeProfileModal()" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl shadow-2xl animate-fade-in overflow-hidden z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-surface">
          <h2 class="text-lg font-bold text-brand-text-primary">{{ 'userProfile' | translate }}</h2>
          <button (click)="closeProfileModal()" class="text-brand-muted hover:text-brand-text-primary transition-colors cursor-pointer bg-transparent border-0 text-xl leading-none">&times;</button>
        </div>

        <!-- Loading -->
        <div *ngIf="isProfileLoading" class="flex items-center justify-center py-16">
          <fa-icon [icon]="['fas', 'spinner']" [animation]="'spin'" class="text-3xl text-brand-primary"></fa-icon>
        </div>

        <!-- Profile Body -->
        <div *ngIf="!isProfileLoading && selectedProfile" class="p-6 space-y-5">
          <!-- Avatar + Name -->
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-orange-300 flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-2 border-brand-border shadow-lg shrink-0">
              <img *ngIf="selectedProfile.profilePictureUrl" [src]="formatPhotoUrl(selectedProfile.profilePictureUrl)" class="w-full h-full object-cover">
              <span *ngIf="!selectedProfile.profilePictureUrl">{{ selectedProfile.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <div class="text-xl font-bold text-brand-text-primary">{{ selectedProfile.name }}</div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    [ngClass]="{'bg-blue-500/20 text-blue-400': selectedProfile.role === 'Authority',
                                'bg-green-500/20 text-green-400': selectedProfile.role === 'Worker',
                                'bg-gray-500/20 text-gray-400': selectedProfile.role === 'PublicUser' || selectedProfile.role === 'Public User',
                                'bg-brand-primary/20 text-brand-primary': selectedProfile.role === 'Admin'}">
                {{ selectedProfile.role | translate }}
              </span>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-brand-bg rounded-xl p-4 border border-brand-border">
              <div class="text-[10px] text-brand-muted uppercase tracking-wider font-medium mb-1">{{ 'email' | translate }}</div>
              <div class="text-sm text-brand-text-primary font-medium break-all">{{ selectedProfile.email || '—' }}</div>
            </div>
            <div class="bg-brand-bg rounded-xl p-4 border border-brand-border">
              <div class="text-[10px] text-brand-muted uppercase tracking-wider font-medium mb-1">{{ 'phoneLabel' | translate }}</div>
              <div class="text-sm text-brand-text-primary font-medium">{{ selectedProfile.phoneNumber || '—' }}</div>
            </div>
            <div class="bg-brand-bg rounded-xl p-4 border border-brand-border">
              <div class="text-[10px] text-brand-muted uppercase tracking-wider font-medium mb-1">{{ 'statusLabel' | translate }}</div>
              <div class="text-sm font-medium"
                   [ngClass]="{'text-green-400': selectedProfile.status === 'Active',
                               'text-yellow-400': selectedProfile.status === 'Suspended',
                               'text-red-400': selectedProfile.status === 'Locked' || selectedProfile.status === 'Deleted',
                               'text-gray-400': selectedProfile.status === 'Inactive' || selectedProfile.status === 'Disabled'}">
                {{ selectedProfile.status | translate }}
              </div>
            </div>
            <div class="bg-brand-bg rounded-xl p-4 border border-brand-border">
              <div class="text-[10px] text-brand-muted uppercase tracking-wider font-medium mb-1">{{ 'joined' | translate }}</div>
              <div class="text-sm text-brand-text-primary font-medium">{{ formatDate(selectedProfile.joinDate) }}</div>
            </div>
          </div>

          <!-- Specialization (if worker) -->
          <div *ngIf="selectedProfile.specialization" class="bg-brand-bg rounded-xl p-4 border border-brand-border">
            <div class="text-[10px] text-brand-muted uppercase tracking-wider font-medium mb-1">{{ 'specialty' | translate }}</div>
            <div class="text-sm text-brand-text-primary font-medium">{{ selectedProfile.specialization | translate }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div *ngIf="!isProfileLoading" class="px-6 py-4 border-t border-brand-border flex justify-end">
          <button (click)="closeProfileModal()" class="px-5 py-2 text-xs bg-brand-surface-light text-brand-muted border border-brand-border rounded-lg hover:text-white hover:bg-brand-border transition-all cursor-pointer font-medium">
            {{ 'close' | translate }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class Users implements OnInit {
  users: (AdminUser & { phone?: string })[] = [];
  isLoading = false;
  message = '';

  // Profile modal state
  showProfileModal = false;
  isProfileLoading = false;
  selectedProfile: AdminUserProfile | null = null;

  constructor(
    private adminUsersService: AdminUsersService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService,
    private auditLogsService: AuditLogsService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminUsersService.getUsers().subscribe({
      next: (res) => {
        this.isLoading = false;
        let rawUsers: AdminUser[] = [];
        if (res && res.items && Array.isArray(res.items)) {
          rawUsers = res.items;
        } else if (Array.isArray(res)) {
          rawUsers = res as AdminUser[];
        } else if (res && typeof res === 'object') {
          const foundArray = Object.values(res).find(val => Array.isArray(val));
          rawUsers = foundArray ? (foundArray as AdminUser[]) : [];
        }

        this.users = rawUsers.map(u => ({
          ...u,
          phone: u.phoneNumber
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.message = 'Failed to load users.';
        this.users = [];
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  onStatusChange(user: any, newStatus: string) {
    const oldStatus = user.status;
    user.status = newStatus;
    this.cdr.detectChanges();

    this.adminUsersService.changeUserStatus(user.id, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.notification.success(`Status for ${user.name} updated to ${newStatus} successfully.`);
          this.auditLogsService.addLocalLog({
            action: 'Update User Status',
            target: `User: ${user.name} status changed to ${newStatus}`,
            result: 'Success'
          });
        } else {
          this.notification.error(res.message || 'Failed to update user status.');
          user.status = oldStatus;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        user.status = oldStatus;
        this.cdr.detectChanges();
        console.error('Failed to update user status:', err);
        const errMsg = err.error?.message || err.message || 'Failed to update user status.';
        this.notification.error(errMsg);
      }
    });
  }

  onDeleteUser(user: any) {
    if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    this.adminUsersService.deleteUser(user.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.notification.success(res.message || `User "${user.name}" deleted successfully.`);
          this.auditLogsService.addLocalLog({
            action: 'Delete User',
            target: `User: ${user.name} (${user.email})`,
            result: 'Success'
          });
          this.users = this.users.filter(u => u.id !== user.id);
          this.cdr.detectChanges();
        } else {
          this.notification.error(res.message || 'Failed to delete user.');
        }
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        const errMsg = err.error?.message || err.message || 'Failed to delete user.';
        this.notification.error(errMsg);
      }
    });
  }

  onViewProfile(userId: string) {
    this.showProfileModal = true;
    this.isProfileLoading = true;
    this.selectedProfile = null;
    this.cdr.detectChanges();

    this.adminUsersService.getUserById(userId).subscribe({
      next: (res) => {
        this.isProfileLoading = false;
        if (res.success && res.profile) {
          this.selectedProfile = res.profile;
        } else {
          this.notification.error(res.message || 'Failed to load user profile.');
          this.showProfileModal = false;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProfileLoading = false;
        this.showProfileModal = false;
        console.error('Failed to load user profile:', err);
        const errMsg = err.error?.message || err.message || 'Failed to load user profile.';
        this.notification.error(errMsg);
        this.cdr.detectChanges();
      }
    });
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.selectedProfile = null;
    this.cdr.detectChanges();
  }

  formatPhotoUrl(path: string | null): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    let cleanUrl = path.startsWith('/') ? path.substring(1) : path;
    if (cleanUrl.startsWith('wwwroot/')) {
      cleanUrl = cleanUrl.substring(8);
    }
    return `https://irs-main.runasp.net/${cleanUrl}`;
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }
}