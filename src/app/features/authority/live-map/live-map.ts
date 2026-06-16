import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MapReportsApiService } from '../../../core/services/authority/map-reports-api.service';
import { MapComponent } from '../../../shared/components/map/map.component';
import { MapMarker } from '../../../shared/models/map-marker.model';

import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-live-map',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, MapComponent, RouterLink, TranslatePipe],
  templateUrl: './live-map.html',
  styleUrl: './live-map.css',
  host: {
    class: 'flex min-h-0 flex-1 flex-col',
  },
})
export class LiveMap implements OnInit {
  private readonly mapApi = inject(MapReportsApiService);
  private readonly route = inject(ActivatedRoute);

  readonly markers = signal<MapMarker[]>([]);
  readonly loadError = signal(false);
  readonly focusReportId = signal<string | null>(null);

  /** Filter by marker.type (case-insensitive). Empty set means "all". */
  readonly typeFilter = signal<Set<string>>(new Set());

  readonly filteredMarkers = computed(() => {
    const filter = this.typeFilter();
    const list = this.markers();
    if (!filter || filter.size === 0) return list;
    return list.filter((m) => !!m.type && filter.has(m.type.toLowerCase()));
  });

  readonly mapContainerClass =
    'h-full w-full min-h-[360px] overflow-hidden rounded-2xl md:min-h-[420px]';

  readonly primaryReportId = computed(() => {
    const withId = this.markers().find((m) => m.id);
    return withId?.id ?? '4092';
  });

  toggleType(type: string): void {
    const key = type.toLowerCase();
    const next = new Set(this.typeFilter());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.typeFilter.set(next);
  }

  clearFilters(): void {
    this.typeFilter.set(new Set());
  }

  isTypeSelected(type: string): boolean {
    return this.typeFilter().has(type.toLowerCase());
  }

  private isStatusResolved(status: string | undefined): boolean {
    if (!status) return false;
    const s = status.toUpperCase();
    return s === 'FIXED' || s === 'RESOLVED' || s === 'COMPLETED' || s === 'CONFIRMED';
  }

  ngOnInit(): void {
    const reportId = this.route.snapshot.queryParamMap.get('reportId')?.trim() || null;
    this.focusReportId.set(reportId);

    // Always load all markers so the map keeps showing all issues.
    this.mapApi.getMapMarkers().subscribe({
      next: (apiList) => {
        const apiMarkers = apiList.filter(m => !this.isStatusResolved(m.status));
        this.markers.set(apiMarkers);
        this.loadError.set(false);

        if (reportId) {
          // Ensure the focused marker exists in the list, then MapComponent will zoom to it.
          this.mapApi.getReportLocation(reportId).subscribe({
            next: (one) => {
              if (!one?.length) return;
              const existingIds = new Set((this.markers() ?? []).map((m) => m.id));
              const merged = [...this.markers()];
              for (const m of one) {
                if (m.id && existingIds.has(m.id)) continue;
                merged.unshift(m);
              }
              this.markers.set(merged);
            },
          });
        }
      },
      error: () => {
        this.markers.set([]);
        this.loadError.set(true);
      },
    });
  }



}
