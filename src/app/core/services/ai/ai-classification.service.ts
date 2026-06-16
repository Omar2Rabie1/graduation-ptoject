import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

export interface AiClassifyResponse {
  classification: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class AiClassificationService {
  private readonly apiUrl =
    'https://mostafa-abuhamed-irs-ai.hf.space/classify-image';
  private readonly TIMEOUT_MS = 45_000;

  constructor(private readonly http: HttpClient) {}

  classifyImage(file: File): Observable<AiClassifyResponse> {
    const form = new FormData();
    form.append('files', file);
    return this.http
      .post<AiClassifyResponse>(this.apiUrl, form)
      .pipe(
        timeout(this.TIMEOUT_MS),
        catchError((err) => throwError(() => err))
      );
  }
}
