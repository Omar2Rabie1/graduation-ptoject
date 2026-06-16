import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// src/app/features/auth/pages/login/login.component.ts
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Role } from '../../../../shared/enums/role.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h2 class="title">Welcome Back</h2>
        <p class="subtitle">Please enter your details to access your reports.</p>

        @if (error()) {
          <div class="alert">
            <fa-icon [icon]="['fas', 'triangle-exclamation']" class="alert-icon text-amber-500"></fa-icon>
            <div class="alert-content">
              <strong>Error</strong>
              <p>{{ error() }}</p>
            </div>
          </div>
        }

        @if (showResend()) {
          <div class="resend-banner">
            <p>Email not confirmed?</p>
            <button class="resend-btn" (click)="onResend()" [disabled]="resendLoading()">
              @if (resendLoading()) {
                Sending...
              } @else {
                Resend confirmation email
              }
            </button>
          </div>
        }

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Email</label>
            <div class="input-wrapper">
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                placeholder="user@example.com"
                [disabled]="loading()"
                required
              />
              <fa-icon [icon]="['fas', 'envelope']" class="input-icon"></fa-icon>
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-wrapper">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="••••••••"
                [disabled]="loading()"
                required
              />
              <button type="button" class="toggle-btn" (click)="togglePassword()">
                <fa-icon [icon]="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"></fa-icon>
              </button>
            </div>
          </div>

          <div class="form-options">
            <a routerLink="/auth/forgot-password" class="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading() || !isValid()">
            @if (loading()) {
              <span class="spinner"></span> Signing in...
            } @else {
              Log In
            }
          </button>
        </form>

        <p class="footer-text">
          Don't have an account? <a routerLink="/auth/register" class="link">Sign Up</a>
        </p>
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

    .title {
      color: #fff;
      font-size: 1.75rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: rgba(255,255,255,0.5);
      text-align: center;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .alert {
      background: rgba(255, 106, 61, 0.1);
      border: 1px solid rgba(255, 106, 61, 0.3);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .alert-icon { font-size: 1.25rem; }
    .alert-content { flex: 1; }
    .alert-content strong { color: #FF6A3D; display: block; margin-bottom: 0.25rem; }
    .alert-content p { color: rgba(255,255,255,0.7); font-size: 0.875rem; margin: 0; }

    .resend-banner {
      background: rgba(255, 106, 61, 0.05);
      border: 1px dashed rgba(255, 106, 61, 0.3);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .resend-banner p {
      color: rgba(255,255,255,0.6);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .resend-btn {
      background: transparent;
      border: 1px solid #FF6A3D;
      color: #FF6A3D;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .resend-btn:hover:not(:disabled) {
      background: #FF6A3D;
      color: #0A0F12;
    }

    .resend-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .form-group { margin-bottom: 1.25rem; }
    .form-group label {
      display: block;
      color: rgba(255,255,255,0.7);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrapper input {
      width: 100%;
      padding: 0.875rem 2.5rem 0.875rem 1rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .input-wrapper input:focus {
      outline: none;
      border-color: #FF6A3D;
      background: rgba(255,255,255,0.08);
    }

    .input-wrapper input::placeholder {
      color: rgba(255,255,255,0.3);
    }

    .input-icon {
      position: absolute;
      right: 1rem;
      color: rgba(255,255,255,0.4);
      font-size: 1rem;
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

    .form-options {
      text-align: right;
      margin-bottom: 1.5rem;
    }

    .forgot-link {
      color: #FF6A3D;
      font-size: 0.875rem;
      text-decoration: none;
      transition: opacity 0.2s;
    }

    .forgot-link:hover { opacity: 0.8; }

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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      background: #ff855d;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #0A0F12;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .footer-text {
      text-align: center;
      color: rgba(255,255,255,0.5);
      font-size: 0.875rem;
      margin-top: 1.5rem;
    }

    .link {
      color: #FF6A3D;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover { text-decoration: underline; }
  `]
})
export default class LoginComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  email = '';
  password = '';
  showPassword = false;
  loading = signal(false);
  error = signal('');
  showResend = signal(false);
  resendLoading = signal(false);

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  isValid(): boolean {
    return this.email.trim().length > 0 && this.password.length > 0;
  }

  onLogin(): void {
    this.error.set('');
    this.showResend.set(false);
    const trimmedEmail = this.email.trim().toLowerCase();

    if (!trimmedEmail || !this.password) {
      this.error.set('Please fill in all fields.');
      return;
    }

    this.loading.set(true);

    this.authService.login(trimmedEmail, this.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          const role = this.authService.getRole();
          const redirectMap: Record<Role, string> = {
            [Role.Admin]: '/admin/dashboard',
            [Role.Worker]: '/worker/current-task',
            [Role.Authority]: '/authority/live-map',
            [Role.PublicUser]: '/user-dashboard',
          };
          this.router.navigate([role ? redirectMap[role] : '/user-dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          const msg = err.message.toLowerCase();
          this.error.set(err.message);
          
          // لو الـ error بيقول إن الـ email مش confirmed
          if (msg.includes('not confirmed') || msg.includes('confirm')) {
            this.showResend.set(true);
            sessionStorage.setItem('pendingEmail', trimmedEmail);
          }
        },
      });
  }

  onResend(): void {
    const pendingEmail = sessionStorage.getItem('pendingEmail') || this.email.trim().toLowerCase();
    if (!pendingEmail) return;

    this.resendLoading.set(true);

    this.authService.resendConfirmation(pendingEmail)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.resendLoading.set(false);
          sessionStorage.setItem('registerEmail', pendingEmail);
          this.router.navigate(['/auth/verify-otp']);
        },
        error: (err) => {
          this.resendLoading.set(false);
          this.error.set(err.message);
        },
      });
  }
}