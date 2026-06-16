import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';

export interface Worker {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  activeTaskCount: number;
}

@Injectable({ providedIn: 'root' })
export class WorkersService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl.replace(/\/$/, '')}/authority/workers`;

  getWorkers(pageNumber = 1, pageSize = 50, search = ''): Observable<PaginatedResponse<Worker>> {
    let params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<Worker>>(this.url, { params });
  }
}
