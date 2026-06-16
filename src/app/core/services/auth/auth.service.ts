// src/app/core/services/auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StorageService } from '../storage.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../shared/models/user.model';
import { Role } from '../../../shared/enums/role.enum';


// ==================== Interfaces ====================

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id?: string;
    name: string;
    email: string;
    role?: string | number;
    roles?: string[];
    roleId?: number;
  };
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  rePassword: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export interface ConfirmEmailRequest {
  userEmail: string;
  otpCode: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResendConfirmationRequest {
  email: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private router = inject(Router);

  // Signals
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  authError = signal<string | null>(null);

  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  constructor() {
    this.restoreSession();
  }

  // ==================== Session Management ====================

  private restoreSession(): void {
    const user = this.storage.getUser<User>();
    const token = this.storage.getToken();
    if (user && token) {
      this.currentUser.set(user);
    }
  }

  setSession(user: User, token: string): void {
    this.storage.setToken(token);
    this.storage.setUser(user);
    this.currentUser.set(user);
    this.authError.set(null);
  }

  updateCurrentUser(updatedFields: Partial<User>): void {
    const current = this.currentUser();
    if (current) {
      const updated = { ...current, ...updatedFields };
      this.storage.setUser(updated);
      this.currentUser.set(updated);
    }
  }

  clearSession(): void {
    this.storage.clear();
    this.currentUser.set(null);
    this.clearLegacyTokenStores();
  }

  /** Cookies / keys used outside StorageService (e.g. public dashboard). */
  private clearLegacyTokenStores(): void {
    document.cookie =
      'sc_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        this.clearSession();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.clearSession();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  // ==================== LOGIN ====================
  login(email: string, password: string): Observable<LoginResponse> {
    this.isLoading.set(true);
    this.authError.set(null);

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/Login`,
      { email: email.trim().toLowerCase(), password }
    ).pipe(
      tap((response) => {
        if (response.success && response.token) {
          const role = this.resolveRole(response);
          const user: User = {
            id: response.user.id ?? this.extractUserIdFromToken(response.token) ?? '',
            name: response.user.name,
            email: response.user.email,
            role,
          };
          this.setSession(user, response.token);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        const message = error.error?.message || 'Login failed. Please try again.';
        this.authError.set(message);
        return throwError(() => new Error(message));
      }),
      tap(() => this.isLoading.set(false))
    );
  }

  // ==================== REGISTER ====================
  register(data: RegisterRequest): Observable<RegisterResponse> {
    this.isLoading.set(true);

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/Register`,
      {
        name: data.name,
        email: data.email.trim().toLowerCase(),
        phone: data.phone,
        password: data.password,
        rePassword: data.rePassword
      }
    ).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((error) => {
        this.isLoading.set(false);
        const message = error.error?.message || 'Registration failed.';
        return throwError(() => new Error(message));
      })
    );
  }

  // ==================== CONFIRM EMAIL (OTP) ====================
  confirmEmail(data: ConfirmEmailRequest): Observable<ApiResponse> {
    this.isLoading.set(true);

    return this.http.post<ApiResponse>(
      `${this.apiUrl}/Confirm-email`,
      {
        userEmail: data.userEmail.trim().toLowerCase(),
        otpCode: data.otpCode
      }
    ).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((error) => {
        this.isLoading.set(false);
        const message = error.error?.message || 'Invalid OTP code.';
        return throwError(() => new Error(message));
      })
    );
  }

  // ==================== FORGOT PASSWORD ====================
  forgotPassword(email: string): Observable<ApiResponse> {
    this.isLoading.set(true);

    return this.http.post<ApiResponse>(
      `${this.apiUrl}/forgot-password`,
      { email: email.trim().toLowerCase() }
    ).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((error) => {
        this.isLoading.set(false);
        const message = error.error?.message || 'Failed to send reset code.';
        return throwError(() => new Error(message));
      })
    );
  }

  verifyPasswordResetOtp(email: string, otpCode: string): Observable<ApiResponse> {
    this.isLoading.set(true);

    return this.http.post<ApiResponse>(
      `${this.apiUrl}/verify-OTP-for-password-reset`,
      { email: email.trim().toLowerCase(), otpCode }
    ).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((error) => {
        this.isLoading.set(false);
        const message = error.error?.message || 'Invalid OTP code.';
        return throwError(() => new Error(message));
      })
    );
  }

  // ==================== RESET PASSWORD ====================
  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse> {
    this.isLoading.set(true);

    return this.http.post<ApiResponse>(
      `${this.apiUrl}/reset-password`,
      {
        email: data.email.trim().toLowerCase(),
        otpCode: data.otpCode,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      }
    ).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((error) => {
        this.isLoading.set(false);
        const message = error.error?.message || 'Password reset failed.';
        return throwError(() => new Error(message));
      })
    );
  }

  // ==================== RESEND CONFIRMATION ====================
  resendConfirmation(email: string): Observable<ApiResponse> {
    this.isLoading.set(true);

    return this.http.post<ApiResponse>(
      `${this.apiUrl}/resend-confirmation`,
      { email: email.trim().toLowerCase() }
    ).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((error) => {
        this.isLoading.set(false);
        const message = error.error?.message || 'Failed to resend confirmation.';
        return throwError(() => new Error(message));
      })
    );
  }

  // ==================== HELPERS ====================

  /**
   * Backend UserRole enum order:
   * Authority = 0, PublicUser = 1, Worker = 2, Admin = 3
   */
  private resolveRole(response: LoginResponse): Role {
    const { user, token } = response;
    const sources: (string | number | undefined)[] = [
      user.roleId,
      ...this.extractRoleClaimsFromToken(token),
      ...(user.roles ?? []),
    ];

    const roleField = user.role;
    if (typeof roleField === 'number' || this.isNumericRole(roleField)) {
      sources.push(roleField);
    } else if (roleField != null && roleField !== '') {
      sources.push(roleField);
    }

    for (const raw of sources) {
      if (raw == null || raw === '') {
        continue;
      }
      return this.mapRole(raw);
    }

    return Role.PublicUser;
  }

  private isNumericRole(value: string | number | undefined): boolean {
    if (value == null || value === '') {
      return false;
    }
    if (typeof value === 'number') {
      return true;
    }
    return /^\d+$/.test(String(value).trim());
  }

  private mapRole(roleInput: string | number): Role {
    if (typeof roleInput === 'number' || this.isNumericRole(roleInput)) {
      switch (Number(roleInput)) {
        case 0:
          return Role.Authority;
        case 1:
          return Role.PublicUser;
        case 2:
          return Role.Worker;
        case 3:
          return Role.Admin;
        default:
          return Role.PublicUser;
      }
    }

    const normalized = String(roleInput).toLowerCase().replace(/[\s_-]+/g, '');

    if (normalized.includes('admin')) {
      return Role.Admin;
    }
    if (normalized.includes('authority')) {
      return Role.Authority;
    }
    if (normalized.includes('worker')) {
      return Role.Worker;
    }
    if (normalized.includes('public') || normalized === 'user') {
      return Role.PublicUser;
    }

    return Role.PublicUser;
  }

  private extractRoleClaimsFromToken(token: string): string[] {
    try {
      const payload = this.decodeJwtPayload(token);
      return Object.entries(payload)
        .filter(([key]) => {
          const k = key.toLowerCase();
          return k === 'role' || k.endsWith('/role');
        })
        .flatMap(([, value]) => {
          if (Array.isArray(value)) {
            return value.map((v) => String(v));
          }
          return value != null ? [String(value)] : [];
        });
    } catch {
      return [];
    }
  }

  private extractUserIdFromToken(token: string): string | null {
    try {
      const payload = this.decodeJwtPayload(token);
      const id =
        payload['sub'] ??
        payload['nameid'] ??
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];
      return id != null ? String(id) : null;
    } catch {
      return null;
    }
  }

  private decodeJwtPayload(token: string): Record<string, unknown> {
    const base64 = token.split('.')[1];
    if (!base64) {
      throw new Error('Invalid JWT');
    }
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (padded.length % 4)) % 4;
    const json = atob(padded + '='.repeat(padLen));
    return JSON.parse(json) as Record<string, unknown>;
  }

  hasRole(role: Role): boolean {
    return this.currentUser()?.role === role;
  }

  getRole(): Role | null {
    return this.currentUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.storage.getToken() && !!this.currentUser();
  }

  getToken(): string | null {
    return this.storage.getToken();
  }

  getCurrentUserEmail(): string | null {
    return this.currentUser()?.email ?? null;
  }

  navigateByRole(): void {
    const role = this.getRole();
    const homeByRole: Record<Role, string[]> = {
      [Role.Admin]: ['/admin/dashboard'],
      [Role.Authority]: ['/authority/live-map'],
      [Role.Worker]: ['/worker/current-task'],
      [Role.PublicUser]: ['/user-dashboard'],
    };

    if (role && homeByRole[role]) {
      void this.router.navigate(homeByRole[role]);
      return;
    }

    void this.router.navigate(['/user-dashboard']);
  }
}