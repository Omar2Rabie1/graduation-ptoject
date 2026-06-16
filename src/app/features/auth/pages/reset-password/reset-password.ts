import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// src/app/features/auth/pages/reset-password/reset-password.component.ts
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="icon"><fa-icon [icon]="['fas', 'lock']"></fa-icon></div>
        <h2 class="title">Create New Password</h2>
        <p class="subtitle">Enter your email, OTP code, and new password</p>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="Enter your email"
              [disabled]="loading()"
              required
            />
          </div>

          <div class="form-group">
            <label>OTP Code</label>
            <input 
              type="text" 
              [(ngModel)]="otpCode" 
              name="otpCode" 
              placeholder="Enter OTP code"
              [disabled]="loading()"
              required
            />
          </div>

          <div class="form-group">
            <label>New Password</label>
            <div class="input-wrapper">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                [(ngModel)]="newPassword" 
                name="newPassword" 
                placeholder="Enter new password"
                [disabled]="loading()"
                required
              />
              <button type="button" class="toggle-btn" (click)="togglePassword()">
                <fa-icon [icon]="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"></fa-icon>
              </button>
            </div>
            
            <div class="strength-meter">
              <div class="strength-bar" [style.width.%]="strength * 25" [class]="'strength-' + strength"></div>
            </div>
            <div class="strength-label">
              Strength: <span [class]="'strength-text-' + strength">{{ strengthLabel }}</span>
            </div>
            
            <ul class="requirements">
              <li [class.met]="hasMinLength"><fa-icon [icon]="['fas', 'check']" class="me-1"></fa-icon> At least 8 characters</li>
              <li [class.met]="hasNumber"><fa-icon [icon]="['fas', 'check']" class="me-1"></fa-icon> Contains a number</li>
              <li [class.met]="hasSpecial"><fa-icon [icon]="['fas', 'check']" class="me-1"></fa-icon> Contains a special character</li>
            </ul>
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <input 
              [type]="showPassword ? 'text' : 'password'" 
              [(ngModel)]="confirmPassword" 
              name="confirmPassword" 
              placeholder="Confirm new password"
              [disabled]="loading()"
              required
            />
          </div>

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loading() || !isValid()">
            @if (loading()) {
              Resetting...
            } @else {
              Reset Password
            }
          </button>
        </form>

        <a routerLink="/auth/login" class="back-link"><fa-icon [icon]="['fas', 'arrow-left']" class="me-1"></fa-icon> Back to login</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0A0F12;
      padding: 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
    }

    .icon { font-size: 2rem; text-align: center; margin-bottom: 1rem; }

    .title {
      color: #fff;
      font-size: 1.5rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: rgba(255,255,255,0.5);
      font-size: 0.875rem;
      text-align: center;
      margin-bottom: 2rem;
    }

    .form-group { margin-bottom: 1.25rem; }
    .form-group label {
      display: block;
      color: rgba(255,255,255,0.6);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #FF6A3D;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrapper input {
      padding-right: 2.5rem;
    }

    .toggle-btn {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: rgba(255,255,255,0.4);
      cursor: pointer;
      font-size: 1rem;
    }

    .strength-meter {
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      margin-top: 0.5rem;
      overflow: hidden;
    }

    .strength-bar {
      height: 100%;
      border-radius: 2px;
      transition: all 0.3s;
    }

    .strength-0 { background: #ff4444; }
    .strength-1 { background: #ff8800; }
    .strength-2 { background: #ffcc00; }
    .strength-3 { background: #00cc66; }
    .strength-4 { background: #00cc66; }

    .strength-label {
      color: rgba(255,255,255,0.5);
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }

    .strength-text-0 { color: #ff4444; }
    .strength-text-1 { color: #ff8800; }
    .strength-text-2 { color: #ffcc00; }
    .strength-text-3, .strength-text-4 { color: #00cc66; }

    .requirements {
      list-style: none;
      padding: 0;
      margin: 0.75rem 0 0;
    }

    .requirements li {
      color: rgba(255,255,255,0.4);
      font-size: 0.75rem;
      margin-bottom: 0.25rem;
      transition: color 0.2s;
    }

    .requirements li.met { color: #00cc66; }

    .error-msg {
      color: #FF6A3D;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: rgba(255, 106, 61, 0.1);
      border-radius: 6px;
    }

    .btn-primary {
      width: 100%;
      padding: 0.875rem;
      background: #FF6A3D;
      color: #0A0F12;
      border: none;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) { background: #ff855d; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .back-link {
      display: block;
      text-align: center;
      margin-top: 1.5rem;
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .back-link:hover { color: #FF6A3D; }
  `]
})
export  class ResetPasswordComponent implements OnDestroy, OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  email = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.email = sessionStorage.getItem('resetEmail') || '';
    if (!this.email) {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get hasMinLength(): boolean {
    return this.newPassword.length >= 8;
  }

  get hasNumber(): boolean {
    return /\d/.test(this.newPassword);
  }

  get hasSpecial(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword);
  }

  get strength(): number {
    let s = 0;
    if (this.hasMinLength) s++;
    if (this.hasNumber) s++;
    if (this.hasSpecial) s++;
    if (this.newPassword.length >= 12) s++;
    return s;
  }

  get strengthLabel(): string {
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    return labels[this.strength] || 'Weak';
  }

  isValid(): boolean {
    return this.email.trim().length > 0 &&
           this.otpCode.length > 0 &&
           this.hasMinLength &&
           this.hasNumber &&
           this.hasSpecial &&
           this.newPassword === this.confirmPassword;
  }

  onSubmit(): void {
    this.error.set('');

    if (!this.isValid()) {
      this.error.set('Please meet all password requirements and ensure passwords match.');
      return;
    }

    this.loading.set(true);

    this.authService.resetPassword({
      email: this.email,
      otpCode: this.otpCode,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          sessionStorage.removeItem('resetEmail');
          this.router.navigate(['/auth/login']);
        },
        error: (err: any) => { // تم إضافة النوع any هنا لتجنب خطأ الـ Build
          this.loading.set(false);
          this.error.set(err.message);
        },
      });
  }
}