// src/app/features/auth/pages/register/register.component.ts
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslatePipe } from '../../../../i18n/translate.pipe';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="icon">
          <fa-icon [icon]="['fas', 'user-plus']" class="text-brand-primary text-[64px]"></fa-icon>
        </div>
        
        <h2 class="title">Registration</h2>

        <form (ngSubmit)="onRegister()">
          <div class="form-group">
            <input 
              type="email" 
              [(ngModel)]="data.email" 
              name="email" 
              placeholder="Email Address"
              [disabled]="loading()"
              required
            />
          </div>

          <div class="form-group">
            <input 
              type="text" 
              [(ngModel)]="data.name" 
              name="name" 
              placeholder="Name"
              [disabled]="loading()"
              required
            />
          </div>

          <div class="form-group">
            <input 
              type="tel" 
              [(ngModel)]="data.phone" 
              name="phone" 
              placeholder="Your Mobile Number"
              [disabled]="loading()"
              required
            />
          </div>

          <div class="form-group">
            <input 
              [type]="showPassword ? 'text' : 'password'" 
              [(ngModel)]="data.password" 
              name="password" 
              placeholder="Password"
              [disabled]="loading()"
              required
            />
          </div>

          <div class="form-group">
            <input 
              [type]="showPassword ? 'text' : 'password'" 
              [(ngModel)]="data.rePassword" 
              name="rePassword" 
              placeholder="RePassword"
              [disabled]="loading()"
              required
            />
          </div>

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span> Creating account...
            } @else {
              Sign up
            }
          </button>
        </form>

        <p class="footer-text">
          *Already have an account? <a routerLink="/auth/login" class="link">Login</a>
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
      text-align: center;
    }

    .icon {
      margin-bottom: 1rem;
      display: flex;
      justify-content: center;
    }

    .title {
      color: #fff;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.9375rem;
      text-align: center;
      transition: all 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #FF6A3D;
      background: rgba(255,255,255,0.08);
    }

    .form-group input::placeholder {
      color: rgba(255,255,255,0.3);
      text-align: center;
    }

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
      margin-top: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      background: #ff855d;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #0A0F12;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 0.5rem;
      vertical-align: middle;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .footer-text {
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
export default class RegisterComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  data = {
    name: '',
    email: '',
    phone: '',
    password: '',
    rePassword: ''
  };
  showPassword = false;
  loading = signal(false);
  error = signal('');

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRegister(): void {
    this.error.set('');

    if (!this.data.email || !this.data.name || !this.data.phone || !this.data.password) {
      this.error.set('Please fill in all fields.');
      return;
    }

    if (this.data.password !== this.data.rePassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    if (this.data.password.length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }

    this.loading.set(true);

    this.authService.register(this.data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          // خزن الـ email ووديه للـ OTP
          sessionStorage.setItem('registerEmail', this.data.email);
          this.router.navigate(['/auth/verify-otp']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.message);
        },
      });
  }
}