import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="icon"><fa-icon [icon]="['fas', 'key']"></fa-icon></div>
        <h2 class="title">{{ 'verifyResetOtpTitle' | translate }}</h2>
        <p class="subtitle">{{ 'verifyEmailSub' | translate }}</p>

        <div class="otp-inputs">
          @for (i of [0,1,2,3,4,5]; track i) {
            <input 
              type="text" 
              maxlength="1"
              [value]="otpDigits[i] || ''"
              (input)="onOtpInput($event, i)"
              (keydown)="onKeydown($event, i)"
              [id]="'otp-' + i"
              class="otp-digit"
              [disabled]="loading()"
            />
          }
        </div>

        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }

        <button class="btn-primary" (click)="onVerify()" [disabled]="loading() || !isComplete()">
          @if (loading()) {
            {{ 'verifying' | translate }}
          } @else {
            {{ 'verifyBtn' | translate }}
          }
        </button>

        <div class="resend">
          @if (timer() > 0) {
            <span>{{ 'resendIn' | translate }} {{ timer() }}s</span>
          } @else {
            <button class="resend-btn" (click)="onResend()" [disabled]="resendLoading()">
              @if (resendLoading()) {
                {{ 'sending' | translate }}
              } @else {
                {{ 'resendCode' | translate }}
              }
            </button>
          }
        </div>

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

    .otp-inputs {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .otp-digit {
      width: 48px;
      height: 56px;
      background: var(--btn-outline-bg);
      border: 1px solid var(--border-default);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 600;
      text-align: center;
      transition: all 0.2s;
    }

    .otp-digit:focus {
      outline: none;
      border-color: var(--color-primary);
      background: var(--bg-sidebar-active);
      box-shadow: 0 0 0 3px var(--color-primary-tint);
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
      margin-bottom: 1rem;
    }

    .btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .resend {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .resend-btn {
      background: none;
      border: none;
      color: var(--color-primary);
      cursor: pointer;
      font-size: 0.875rem;
      text-decoration: underline;
    }

    .resend-btn:hover { opacity: 0.8; }
    .resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .back-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .back-link:hover { color: var(--color-primary); }
  `]
})
export default class VerifyOtpComponent implements OnDestroy, OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  otpDigits: string[] = new Array(6).fill('');
  email = '';
  loading = signal(false);
  error = signal('');
  timer = signal(30);
  resendLoading = signal(false);

  private timerInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.email = sessionStorage.getItem('registerEmail') || sessionStorage.getItem('resetEmail') || '';
    
    if (!this.email) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearInterval(this.timerInterval);
  }

  startTimer(): void {
    this.timer.set(30);
    this.timerInterval = setInterval(() => {
      this.timer.update(v => {
        if (v <= 1) {
          clearInterval(this.timerInterval);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  get otpCode(): string {
    return this.otpDigits.join('');
  }

  isComplete(): boolean {
    return this.otpDigits.every(d => d !== '') && this.otpDigits.length === 6;
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');

    if (value) {
      this.otpDigits[index] = value;
      
      if (index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        nextInput?.focus();
      }
    } else {
      this.otpDigits[index] = '';
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      this.otpDigits[index - 1] = '';
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  onVerify(): void {
    if (!this.isComplete()) return;

    this.loading.set(true);
    this.error.set('');

    this.authService.confirmEmail({ userEmail: this.email, otpCode: this.otpCode })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          // OTP صح → روح للـ Login
          sessionStorage.removeItem('registerEmail');
          sessionStorage.removeItem('resetEmail');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message);
        },
      });
  }

  onResend(): void {
    this.resendLoading.set(true);

    this.authService.resendConfirmation(this.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.resendLoading.set(false);
          this.startTimer();
        },
        error: (err) => {
          this.resendLoading.set(false);
          this.error.set(err.message);
        },
      });
  }
}