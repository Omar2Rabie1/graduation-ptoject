import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly baseUrl = 'http://localhost:8080/api';

    constructor(private http: HttpClient) { }

    get<T>(endpoint: string): Observable<ApiResponse<T>> {
        return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
    }

    post<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
        return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
    }

    put<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
        return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
    }

    delete<T>(endpoint: string): Observable<ApiResponse<T>> {
        return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`);
    }

    patch<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
        return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body);
    }
}
