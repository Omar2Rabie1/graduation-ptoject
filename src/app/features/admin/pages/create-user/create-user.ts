import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // مهم عشان الـ ngModel
import { AdminUsersService, CreateUserDto } from '../../../../core/services/admin/users.service';
import { AuditLogsService } from '../../../../core/services/admin/audit-logs.service';
import { HttpClientModule } from '@angular/common/http';
import { TranslatePipe } from '../../../../i18n/translate.pipe';
import { LanguageService } from '../../../../i18n/language.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, FormsModule, TranslatePipe],
  template: `
    <!-- Container رئيسي بيملى الشاشة وفيه Padding -->
    <div class="min-h-full w-full bg-brand-bg text-brand-text p-6 md:p-10 flex flex-col items-center animate-fade-in">
      
      <!-- Card الكارت اللي فيه الفورم -->
      <!-- max-w-4xl: بيحدد عرض الكارت عشان ميبقاش واسع جداً على الشاشات الكبيرة -->
      <div class="w-full max-w-4xl glass-panel rounded-xl overflow-hidden animate-slide-up">
        
        <!-- Header بتاع الكارت -->
        <div class="border-b border-brand-border p-6 bg-brand-surface">
          <h2 class="text-lg font-semibold text-white">{{ 'userInfo' | translate }}</h2>
          <p class="text-xs text-brand-muted mt-1">{{ 'createUserDetails' | translate }}</p>
        </div>

        <!-- Form Body -->
        <div class="p-6">
          <form class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <!-- Full Name -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] text-brand-muted uppercase tracking-wider font-medium">{{ 'fullName' | translate }}</label>
              <input type="text" 
                     class="h-[42px] bg-brand-bg border border-brand-border rounded-lg px-3 text-sm text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary w-full transition-all"
                     [placeholder]="'enterFullName' | translate" 
                     [(ngModel)]="user.fullName" name="fullName">
            </div>

            <!-- Email Address -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] text-brand-muted uppercase tracking-wider font-medium">{{ 'emailAddress' | translate }}</label>
              <input type="email" 
                     class="h-[42px] bg-brand-bg border border-brand-border rounded-lg px-3 text-sm text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary w-full transition-all"
                     [placeholder]="'enterEmailAddress' | translate" 
                     [(ngModel)]="user.email" name="email">
            </div>

            <!-- Phone Number -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] text-brand-muted uppercase tracking-wider font-medium">{{ 'mobileNumber' | translate }}</label>
              <input type="text" 
                     class="h-[42px] bg-brand-bg border border-brand-border rounded-lg px-3 text-sm text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary w-full transition-all"
                     [placeholder]="'enterPhoneNumber' | translate" 
                     [(ngModel)]="user.phone" name="phone">
              <span class="text-[10px] text-brand-muted/70 italic">{{ 'phoneRequirement' | translate }}</span>
            </div>

            <!-- User Role -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] text-brand-muted uppercase tracking-wider font-medium">{{ 'selectRole' | translate }}</label>
              <select class="h-[42px] bg-brand-bg border border-brand-border rounded-lg px-3 text-sm text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary w-full transition-all"
                      [(ngModel)]="user.role" name="role">
                <option value="Worker">{{ 'maintenanceCrew' | translate }}</option>
                <option value="Authority">{{ 'municipalAuthority' | translate }}</option>
                <option value="Admin">{{ 'adminRole' | translate }}</option>
                <option value="Public User">{{ 'publicUser' | translate }}</option>
              </select>
            </div>

            <!-- Specialty -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] text-brand-muted uppercase tracking-wider font-medium">{{ 'specialty' | translate }}</label>
              <select class="h-[42px] bg-brand-bg border border-brand-border rounded-lg px-3 text-sm text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary w-full transition-all"
                      [(ngModel)]="user.specialty" name="specialty">
                <option value="Road Work">{{ 'roadWork' | translate }}</option>
                <option value="Electrical">{{ 'electricalMaintenance' | translate }}</option>
                <option value="Plumbing">{{ 'plumbing' | translate }}</option>
                <option value="General">{{ 'generalMaintenance' | translate }}</option>
              </select>
            </div>

          </form>
        </div>

        <!-- Footer / Actions -->
        <div class="border-t border-brand-border px-6 py-4 flex flex-col sm:flex-row justify-end gap-4 bg-brand-surface items-center">
          <div *ngIf="message" class="text-xs mr-auto font-medium" [ngClass]="{'text-green-400': !hasError, 'text-red-400': hasError}">{{ message }}</div>
          
          <button type="button" (click)="resetForm()" class="px-5 py-2 text-xs text-brand-muted border border-brand-border rounded-lg hover:bg-brand-surface-light hover:text-white transition-all h-[38px] font-medium">
            {{ 'reset' | translate }}
          </button>
          <button type="button" (click)="createUser()" [disabled]="isLoading" class="px-5 py-2 text-xs bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-all shadow-lg shadow-brand-primary/20 h-[38px] font-semibold disabled:opacity-50">
            {{ (isLoading ? 'creating' : 'createSendActivation') | translate }}
          </button>
        </div>

      </div>
    </div>
  `
})
export class CreateUserPageComponent {
  user = {
    fullName: '',
    email: '',
    phone: '',
    role: 'Worker',
    specialty: 'Road Work'
  };

  isLoading = false;
  message = '';
  hasError = false;

  langService = inject(LanguageService);

  constructor(
    private adminUsersService: AdminUsersService,
    private auditLogsService: AuditLogsService
  ) {}

  resetForm() {
    this.user = {
      fullName: '',
      email: '',
      phone: '',
      role: 'Worker',
      specialty: 'Road Work'
    };
    this.message = '';
    this.hasError = false;
  }

  createUser() {
    // Basic frontend validation
    if (!this.user.fullName || !this.user.email || !this.user.phone) {
      this.hasError = true;
      this.message = this.langService.t('fillAllFields');
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.hasError = false;
    
    // Mapping payload to match generic backend expectations if needed
    const payload: CreateUserDto = {
      name: this.user.fullName,
      fullName: this.user.fullName,
      email: this.user.email,
      phoneNumber: this.user.phone,
      role: this.user.role,
      specialization: this.user.specialty
    };

    this.adminUsersService.createUser(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.hasError = false;
        
        // Add audit log for the new user
        this.auditLogsService.addLocalLog({
          action: 'Create User',
          target: `User: ${this.user.fullName} (${this.user.role})`,
          result: 'Success'
        });

        this.message = this.langService.t('userCreatedSuccess');
        this.resetForm();
        this.message = this.langService.t('userCreatedSuccess'); // keep message after reset
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        
        // Handle ASP.NET Core validation errors
        if (err.error?.errors) {
          const firstErrorKey = Object.keys(err.error.errors)[0];
          this.message = err.error.errors[firstErrorKey][0];
        } else if (typeof err.error === 'string') {
          this.message = err.error;
        } else {
          this.message = err.error?.message || err.message || this.langService.t('userCreationFailed');
        }
        console.error('Create User Error:', err);
      }
    });
  }
}