import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MapMarker } from '../../../shared/models/map-marker.model';
import { PublicMapReportsService } from '../public-map-reports.service';

@Injectable({ providedIn: 'root' })
export class MapReportsApiService {
  private readonly publicMap = inject(PublicMapReportsService);

  /** All markers — backed by `GET /api/public/map-reports`. */
  getMapMarkers(): Observable<MapMarker[]> {
    return this.publicMap.getPublicMapReports().pipe(catchError(() => of([])));
  }

  /** Single report marker from public map data or popup metadata. */
  getReportLocation(reportId: string): Observable<MapMarker[]> {
    return this.publicMap.getReportLocation(reportId).pipe(
      catchError(() =>
        this.publicMap.getMapPopupDetails(reportId).pipe(
          map((details) => {
            const lat = Number(
              (details as { latitude?: number }).latitude ??
                (details as { lat?: number }).lat,
            );
            const lng = Number(
              (details as { longitude?: number }).longitude ??
                (details as { lng?: number }).lng,
            );
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              return [];
            }
            return [
              {
                id: String(reportId),
                lat,
                lng,
                title:
                  details.categoryName ?? `Report #${reportId}`,
                description:
                  details.address ?? 'Report location',
                type: details.categoryName,
              },
            ];
          }),
          catchError(() => of([])),
        ),
      ),
    );
  }
}
