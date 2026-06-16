import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  setToken(token: string) {
    document.cookie = `sc_token=${token}; path=/; max-age=86400; SameSite=Strict`;
  }

  getToken(): string | null {
    const match = document.cookie.match(new RegExp('(^| )sc_token=([^;]+)'));
    if (match) return match[2];
    return null;
  }

  removeToken() {
    document.cookie = 'sc_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}
