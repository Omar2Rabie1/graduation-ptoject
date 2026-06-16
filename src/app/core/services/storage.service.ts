import { Injectable } from '@angular/core';

const KEYS = {
    TOKEN: 'sc_token',
    USER: 'sc_user',
};

@Injectable({ providedIn: 'root' })
export class StorageService {
    getToken(): string | null {
        return localStorage.getItem(KEYS.TOKEN);
    }

    setToken(token: string): void {
        localStorage.setItem(KEYS.TOKEN, token);
    }

    removeToken(): void {
        localStorage.removeItem(KEYS.TOKEN);
    }

    getUser<T>(): T | null {
        const raw = localStorage.getItem(KEYS.USER);
        return raw ? (JSON.parse(raw) as T) : null;
    }

    setUser<T>(user: T): void {
        localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }

    removeUser(): void {
        localStorage.removeItem(KEYS.USER);
    }

    clear(): void {
        localStorage.removeItem(KEYS.TOKEN);
        localStorage.removeItem(KEYS.USER);
    }
}