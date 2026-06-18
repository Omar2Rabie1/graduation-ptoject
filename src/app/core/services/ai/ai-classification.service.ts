import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface AiClassifyResponse {
  classification: string;
  description: string;
}

interface AISuggestionDto {
  suggestedCategory: string;
  suggestedDescription: string;
}

@Injectable({ providedIn: 'root' })
export class AiClassificationService {
  private readonly apiUrl = `${environment.apiUrl.replace(/\/$/, '')}/public/report/analyze-image`;
  private readonly TIMEOUT_MS = 60_000;

  constructor(private readonly http: HttpClient) {}

  classifyImages(files: File[]): Observable<AiClassifyResponse> {
    const form = new FormData();
    files.forEach(file => {
      form.append('images', file);
    });
    return this.http
      .post<AISuggestionDto>(this.apiUrl, form)
      .pipe(
        timeout(this.TIMEOUT_MS),
        map(response => ({
          classification: response.suggestedCategory,
          description: response.suggestedDescription
        })),
        catchError((err) => throwError(() => err))
      );
  }
}