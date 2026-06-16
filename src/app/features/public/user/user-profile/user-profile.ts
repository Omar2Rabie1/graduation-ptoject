import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// src/app/features/public/user/user-profile/user-profile.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CookieService } from '../../../../core/services/cookie.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserProfileService, UserProfile } from '../../../../core/services/user/user-profile.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../i18n/translate.pipe';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { PublicMapReportsService } from '../../../../core/services/public-map-reports.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './user-profile.html',
  styles: [`
    .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
    .delay-100 { animation-delay: 100ms; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class UserProfileComponent implements OnInit {
  // Services
  private cookieService = inject(CookieService);
  private authService = inject(AuthService);
  private profileService = inject(UserProfileService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private publicMapReportsService = inject(PublicMapReportsService);

  // Reactive forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // UI state
  isEditing = false;
  isSaving = false;
  isChangingPassword = false;

  // User data
  userId = '';
  userName = 'Public User';
  userEmail = 'user@example.com';
  userInitial = 'P';
  mobile = '';
  address = 'Cairo, Egypt';
  joinDate = new Date().toLocaleDateString();
  profilePictureUrl: string | null = null;

  reportsCount = 0;
  resolvedCount = 0;

  ngOnInit(): void {
    this.initForm();
    this.extractUserData();
    setTimeout(() => {
      this.loadProfile();
      if (this.userId) {
        this.loadUserReports();
      }
    });
  }

  get isDarkMode(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      mobile: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required]
    });
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.patchValue({
        name: this.userName,
        mobile: this.mobile
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const { name, mobile } = this.profileForm.value;
    const sanitizedPhone = mobile ? String(mobile).replace(/[\s\-\(\)]/g, '') : null;
    this.profileService.updateProfileInfo({ name, phoneNumber: sanitizedPhone }).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditing = false;
        this.userName = name;
        this.mobile = sanitizedPhone ?? '';
        this.userInitial = this.userName.charAt(0).toUpperCase();
        this.authService.updateCurrentUser({ name });
        this.cdr.detectChanges();
        this.notification.success('Profile info updated successfully!');
      },
      error: err => {
        this.isSaving = false;
        this.notification.error(err?.error?.message || 'Failed to update profile info');
      }
    });
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: res => {
        if (res?.success && res.profile) {
          const p = res.profile as UserProfile & { address?: string };
          this.userId = p.id || this.userId;
          this.userName = p.name || this.userName;
          this.userEmail = p.email || this.userEmail;
          this.mobile = p.phoneNumber ?? '';
          this.address = p.address || this.address;
          this.profilePictureUrl = p.profilePictureUrl ? this.formatPhotoUrl(p.profilePictureUrl) : null;
          if (p.createdAt) {
            this.joinDate = new Date(p.createdAt).toLocaleDateString();
          }
          this.userInitial = this.userName.charAt(0).toUpperCase();
          this.profileForm.patchValue({ name: this.userName, mobile: this.mobile });
          this.loadUserReports();
          this.cdr.detectChanges();
        }
      },
      error: err => {
        this.notification.error('Failed to load profile');
        console.error('Failed to fetch profile', err);
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.isSaving = true;
    this.profileService.updateProfilePhoto(file).subscribe({
      next: () => {
        this.isSaving = false;
        this.cdr.detectChanges();
        this.notification.success('Profile photo updated successfully!');
        this.loadProfile();
      },
      error: err => {
        this.isSaving = false;
        this.notification.error(err?.error?.message || 'Failed to upload profile photo');
      }
    });
  }

  // Removed report image upload & AI integration methods

  // ---------- Password Management ----------
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;
    if (newPassword !== confirmNewPassword) {
      this.notification.error('Passwords do not match');
      return;
    }
    this.isChangingPassword = true;
    this.profileService.changePassword(currentPassword, newPassword, confirmNewPassword).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.cdr.detectChanges();
        this.notification.success('Password changed successfully!');
      },
      error: err => {
        this.isChangingPassword = false;
        this.notification.error(err?.error?.message || 'Failed to change password');
      }
    });
  }

  private extractUserData(): void {
    const sessionUser = this.authService.currentUser();
    if (sessionUser) {
      this.userId = sessionUser.id || '';
      this.userName = sessionUser.name;
      this.userEmail = sessionUser.email;
      this.userInitial = sessionUser.name.charAt(0).toUpperCase();
      this.profileForm.patchValue({ name: this.userName, mobile: this.mobile });
      return;
    }
    const token = this.authService.getToken() ?? this.cookieService.getToken();
    if (!token) return;
    try {
      const payloadStr = atob(token.split('.')[1]);
      const payload = JSON.parse(payloadStr);
      const nameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
      const givenNameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname';
      const emailClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
      const idClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      this.userId = payload[idClaim] || payload.nameid || payload.sub || '';
      this.userName = payload[nameClaim] || payload.name || payload.unique_name || payload.given_name || payload[givenNameClaim];
      this.userEmail = payload[emailClaim] || payload.email || 'user@example.com';
      if (!this.userName) {
        const nameKey = Object.keys(payload).find(k => k.toLowerCase().includes('name') && !k.toLowerCase().includes('role') && !k.toLowerCase().includes('nameidentifier'));
        if (nameKey) this.userName = payload[nameKey];
      }
      if (!this.userName?.trim()) this.userName = 'Public User';
      this.userInitial = this.userName.charAt(0).toUpperCase();
      this.profileForm.patchValue({ name: this.userName, mobile: this.mobile });
    } catch (e) {
      console.error('Error decoding token', e);
    }
  }

  loadUserReports(): void {
    if (!this.userId) return;
    this.publicMapReportsService.getUserReports(this.userId, 1, 100).subscribe({
      next: (res) => {
        const items = res?.items || [];
        this.reportsCount = items.length;
        this.resolvedCount = items.filter(r => {
          const s = (r.status || '').toUpperCase();
          return s === 'FIXED' || s === 'RESOLVED' || s === 'COMPLETED' || s === 'CONFIRMED';
        }).length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user reports count', err);
      }
    });
  }

  private formatPhotoUrl(path: any): string {
    if (!path) return '';
    let url = '';
    if (typeof path === 'string') {
      url = path;
    } else if (path && typeof path === 'object') {
      url = path.imageUrl || path.url || path.photoUrl || '';
    }
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    if (cleanUrl.startsWith('wwwroot/')) {
      cleanUrl = cleanUrl.substring(8);
    }
    return `https://irs-main.runasp.net/${cleanUrl}`;
  }

  goBack(): void {
    this.router.navigate(['/user-dashboard']);
  }
}
