import { Injectable, signal, effect } from '@angular/core';
import { Lang, translations } from './translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _lang = signal<Lang>(
    (localStorage.getItem('lang') as Lang) || 'en'
  );

  readonly lang = this._lang.asReadonly();

  constructor() {
    effect(() => {
      const current = this._lang();
      localStorage.setItem('lang', current);
      document.documentElement.setAttribute('dir', current === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', current);
    });
  }

  toggle(): void {
    this._lang.set(this._lang() === 'en' ? 'ar' : 'en');
  }

  t(key: string): string {
    if (!key) return '';
    
    const currentLang = this._lang();
    const currentDict = translations[currentLang] || {};

    // 1. Check if key is a direct translation key (exact match)
    if (currentDict[key] !== undefined) {
      return currentDict[key];
    }

    // 2. Check if key matches a translation key case-insensitively
    const lowerKey = key.toLowerCase();
    if (currentDict[lowerKey] !== undefined) {
      return currentDict[lowerKey];
    }

    const matchedKey = Object.keys(currentDict).find(
      (k) => k.toLowerCase() === lowerKey
    );
    if (matchedKey && currentDict[matchedKey] !== undefined) {
      return currentDict[matchedKey];
    }

    // 3. Check if it matches an English dictionary value case-insensitively
    const enDict = translations['en'] || {};
    const foundKey = Object.keys(enDict).find(
      (k) =>
        enDict[k].toLowerCase() === lowerKey || k.toLowerCase() === lowerKey
    );
    if (foundKey && translations[currentLang]?.[foundKey] !== undefined) {
      return translations[currentLang][foundKey];
    }

    // 4. Fallback to the key/value itself
    return key;
  }
}
