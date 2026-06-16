import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// src/app/features/admin/pages/users/users.page.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersService, AdminUser } from '../../../../core/services/admin/users.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

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
                 <span class="px-2 py-1 rounded text-xs" 
                      [ngClass]="{'text-green-400 bg-green-400/10': user.status === 'Active', 'text-red-400 bg-red-400/10': user.status !== 'Active'}">
                  {{ user.status | translate }}
                </span>
              </td>
              <td class="px-6 py-4">
                <a href="#" class="text-brand-primary hover:underline hover:text-brand-primary-hover">{{ 'viewProfile' | translate }}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class Users implements OnInit {
  users: (AdminUser & { phone?: string })[] = [];
  isLoading = false;
  message = '';

  constructor(
    private adminUsersService: AdminUsersService,
    private cdr: ChangeDetectorRef
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
}