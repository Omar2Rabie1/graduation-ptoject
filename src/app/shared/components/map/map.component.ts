import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  createComponent,
  EnvironmentInjector,
  ApplicationRef,
  ComponentRef
} from '@angular/core';
import * as L from 'leaflet';
import type * as GeoJSON from 'geojson';
import { Router } from '@angular/router';
import { MapMarker } from '../../models/map-marker.model';
import { MapPopupComponent } from './map-popup/map-popup.component';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div #mapEl [class]="mapContainerClass"></div>`,
  styles: [`:host { display: block; height: 100%; }`],
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() markers: MapMarker[] = [];
  @Input() mapContainerClass: string = '';
  @Input() focusMarkerId?: string | null;
  @Input() isUserMode: boolean = false;
  @Output() locationSelected = new EventEmitter<{ lat: number, lng: number }>();
  @Output() supportReport = new EventEmitter<string>();

  private map!: L.Map;
  private markersLayer?: L.LayerGroup;
  private governoratesLayer?: L.GeoJSON;
  private pulseTimer?: number;
  private userPinMarker?: L.Marker;

  @ViewChild('mapEl', { static: true }) private readonly mapEl?: ElementRef<HTMLDivElement>;

  constructor(
    private readonly router: Router,
    private readonly environmentInjector: EnvironmentInjector,
    private readonly appRef: ApplicationRef
  ) {}

  ngAfterViewInit() {
    this.initMap();
    this.addMarkersToMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['markers'] || changes['focusMarkerId']) && this.map) {
      this.addMarkersToMap();
    }
  }

  private initMap(): void {
    const hostEl = this.mapEl?.nativeElement;
    if (!hostEl) return;

    this.map = L.map(hostEl, { zoomControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    if (this.isUserMode) {
      // User mode: try GPS, setup click to drop pin
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
          },
          () => {
            this.map.setView([30.0444, 31.2357], 13); // Default to Cairo
          }
        );
      } else {
        this.map.setView([30.0444, 31.2357], 13);
      }

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.updateUserPin(e.latlng);
        this.locationSelected.emit(e.latlng);
      });
    } else {
      // Authority mode: Default view Egypt
      this.map.setView([26.8206, 30.8025], 6);
      void this.loadEgyptGovernoratesLayer();
    }
  }

  private updateUserPin(latlng: L.LatLng): void {
    if (this.userPinMarker) {
      this.userPinMarker.setLatLng(latlng);
    } else {
      const icon = L.divIcon({
        html: `<div style="background:#FF6B00;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 15px rgba(255,107,0,0.5);"></div>`,
        className: '',
        iconAnchor: [7, 7]
      });
      this.userPinMarker = L.marker(latlng, { icon, draggable: true }).addTo(this.map);

      this.userPinMarker.on('dragend', () => {
        if (this.userPinMarker) {
          this.locationSelected.emit(this.userPinMarker.getLatLng());
        }
      });
    }
  }

  public clearUserPin(): void {
    if (this.userPinMarker) {
      this.userPinMarker.remove();
      this.userPinMarker = undefined;
    }
  }

  private addMarkersToMap(): void {
    if (!this.map) return;
    if (!this.markersLayer) {
      this.markersLayer = L.layerGroup().addTo(this.map);
    }

    this.markersLayer.clearLayers();

    const bounds: L.LatLngExpression[] = [];
    let anyInsideEgypt = false;
    let focusedLatLng: L.LatLngExpression | null = null;
    let focusedLayer: L.Layer | null = null;
    const focusId = this.focusMarkerId?.toString().trim();

    for (const marker of this.markers ?? []) {
      const lat = Number(marker.lat);
      const lng = Number(marker.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

      const type = marker.type?.trim();
      const palette = this.paletteForType(type);

      // Colored marker by type (focused marker stays deep red)
      const leafletMarker = L.circleMarker([lat, lng], {
        radius: 8,
        color: palette.stroke,
        weight: 2,
        fillColor: palette.fill,
        fillOpacity: 0.95,
      }).addTo(this.markersLayer);

      if (marker.id) {
        leafletMarker.bindPopup(() => {
          const popupRef = createComponent(MapPopupComponent, {
            environmentInjector: this.environmentInjector
          });
          
          popupRef.instance.reportId = marker.id!;
          popupRef.instance.isUserMode = this.isUserMode;
          popupRef.instance.supportCount = marker.supportCount;
          
          // Subscriptions for outputs
          popupRef.instance.supportReport.subscribe((id) => {
            this.supportReport.emit(id);
            leafletMarker.closePopup();
          });
          
          this.appRef.attachView(popupRef.hostView);
          
          leafletMarker.once('popupclose', () => {
            this.appRef.detachView(popupRef.hostView);
            popupRef.destroy();
          });

          return popupRef.location.nativeElement;
        });
      } else {
        // Fallback for markers without ID
        leafletMarker.bindPopup(`<b>${this.escapeHtml(marker.title || 'Unknown')}</b>`);
      }

      bounds.push([lat, lng]);
      if (this.isInsideEgypt(lat, lng)) anyInsideEgypt = true;

      if (focusId && marker.id?.toString() === focusId) {
        focusedLatLng = [lat, lng];
        focusedLayer = leafletMarker;
        // Make the focused marker slightly larger/darker
        (leafletMarker as L.CircleMarker).setStyle({
          radius: 11,
          color: '#7f1d1d',
          weight: 3,
          fillColor: '#dc2626',
          fillOpacity: 1,
        });
      }
    }


    // Keep Egypt-focused map if the demo API returns world-wide points.
    // Only auto-fit when we have at least one marker inside Egypt.
    if (!this.isUserMode && bounds.length > 0 && anyInsideEgypt) {
      const b = L.latLngBounds(bounds);
      this.map.fitBounds(b, { padding: [24, 24] });
    }

    // Focus specific report when coming from "Open Map"
    if (focusedLatLng) {
      this.map.setView(focusedLatLng, 13, { animate: true });
      const layer = focusedLayer as L.CircleMarker;
      if (layer?.openPopup) {
        layer.openPopup();
      }
      this.startPulse(focusedLayer);
    }
  }

  private startPulse(layer: L.Layer | null): void {
    if (this.pulseTimer) {
      window.clearInterval(this.pulseTimer);
      this.pulseTimer = undefined;
    }

    const cm = layer as unknown as L.CircleMarker | null;
    if (!cm || typeof cm.setStyle !== 'function') return;

    const start = Date.now();
    const baseRadius = 11;
    const maxRadius = 15;

    this.pulseTimer = window.setInterval(() => {
      const t = Date.now() - start;
      if (t > 2600) {
        cm.setStyle({ radius: baseRadius });
        if (this.pulseTimer) window.clearInterval(this.pulseTimer);
        this.pulseTimer = undefined;
        return;
      }

      const phase = (t % 600) / 600; // 0..1
      const pulse = Math.sin(phase * Math.PI); // 0..1..0
      const r = baseRadius + (maxRadius - baseRadius) * pulse;
      cm.setStyle({ radius: r });
    }, 50);
  }

  private isInsideEgypt(lat: number, lng: number): boolean {
    // Rough bbox for Egypt
    return lat >= 21.5 && lat <= 32.5 && lng >= 24.5 && lng <= 36.9;
  }

  private paletteForType(type?: string | null): { stroke: string; fill: string } {
    const t = (type ?? '').toLowerCase();
    
    if (t.includes('road')) {
      return { stroke: '#c2410c', fill: '#f97316' };
    } else if (t.includes('power') || t.includes('electrical')) {
      return { stroke: '#a16207', fill: '#eab308' };
    } else if (t.includes('water')) {
      return { stroke: '#0369a1', fill: '#38bdf8' };
    } else if (t.includes('sanitation')) {
      return { stroke: '#15803d', fill: '#22c55e' };
    } else {
      // default red (issue)
      return { stroke: '#b91c1c', fill: '#ef4444' };
    }
  }

  private async loadEgyptGovernoratesLayer(): Promise<void> {
    if (!this.map) return;
    if (this.governoratesLayer) return;

    try {
      const res = await fetch('/egypt-governorates.geojson');
      if (!res.ok) return;
      const geojson = (await res.json()) as GeoJSON.GeoJsonObject;

      this.governoratesLayer = L.geoJSON(geojson, {
        style: () => ({
          color: '#94a3b8',
          weight: 1,
          opacity: 0.6,
          fillColor: '#0f172a',
          fillOpacity: 0.08,
        }),
        onEachFeature: (feature: GeoJSON.Feature, layer: L.Layer) => {
          const name = (feature.properties as Record<string, unknown> | null)?.['name_en'];
          if (name) layer.bindTooltip(String(name), { sticky: true });
        },
      }).addTo(this.map);
    } catch {
      // ignore — map still works without admin layer
    }

  }

  private escapeHtml(v: string): string {
    return v
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}