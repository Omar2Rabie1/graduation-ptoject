import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { TranslatePipe } from '../../../../i18n/translate.pipe';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="icon"><fa-icon [icon]="['fas', 'lock']"></fa-icon></div>
        <h2 class="title">{{ 'forgotPassword' | translate }}</h2>
        <p class="subtitle">{{ 'forgotPasswordSub' | translate }}</p>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>{{ 'emailAddress' | translate }}</label>
            <div class="input-wrapper">
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                [placeholder]="'emailAddress' | translate"
                [disabled]="loading()"
                required
              />
            </div>
          </div>

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loading()">
            @if (loading()) {
              {{ 'sending' | translate }}
            } @else {
              {{ 'sendOtp' | translate }}
            }
          </button>
        </form>

        <a routerLink="/auth/login" class="back-link">{{ 'backToLogin' | translate }}</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      padding: 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-default);
      border-radius: 16px;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.2);
      text-align: center;
    }

    .icon { font-size: 2rem; margin-bottom: 1rem; }

    .title {
      color: var(--text-primary);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .form-group label {
      display: block;
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .input-wrapper input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: var(--btn-outline-bg);
      border: 1px solid var(--border-default);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .input-wrapper input:focus {
      outline: none;
      border-color: var(--color-primary);
      background: var(--bg-sidebar-active);
    }

    .input-wrapper input::placeholder {
      color: var(--text-muted);
      opacity: 0.6;
    }

    .error-msg {
      color: var(--color-primary);
      font-size: 0.875rem;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: var(--color-primary-tint);
      border-radius: 6px;
    }

    .btn-primary {
      width: 100%;
      padding: 0.875rem;
      background: var(--color-primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .back-link {
      display: block;
      margin-top: 1.5rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .back-link:hover { color: var(--color-primary); }
  `]
})
export default class ForgotPasswordComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  email = '';
  loading = signal(false);
  error = signal('');

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    this.error.set('');
    const trimmedEmail = this.email.trim().toLowerCase();

    if (!trimmedEmail) {
      this.error.set('Please enter your email.');
      return;
    }

    this.loading.set(true);

    this.authService.forgotPassword(trimmedEmail)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          // خزن الـ email ووديه للـ Verify Reset OTP
          sessionStorage.setItem('resetEmail', trimmedEmail);
          this.router.navigate(['/auth/verify-reset-otp']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message);
        },
      });
  }
}