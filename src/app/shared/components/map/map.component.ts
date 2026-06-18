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
      attribution: 'Â© OpenStreetMap contributors',
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
      const isFocused = !!focusId && marker.id?.toString() === focusId;
      const customIcon = this.customIconForType(type, isFocused);

      // Custom marker icon by category
      const leafletMarker = L.marker([lat, lng], {
        icon: customIcon
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
      const layer = focusedLayer as L.Marker;
      if (layer?.openPopup) {
        layer.openPopup();
      }
      this.startPulse(focusedLayer);
    }
  }

  private startPulse(layer: L.Layer | null): void {
    // Pulse animation is handled via CSS map-marker-focused animation applied to divIcon
  }

  private customIconForType(type?: string | null, isFocused: boolean = false): L.DivIcon {
    const t = (type ?? '').toLowerCase();
    let fillColor = '#ef4444'; // Red (Default)
    let glowColor = 'rgba(239, 68, 68, 0.4)';
    let svgPath = '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>'; // Triangle Warning

    if (t.includes('road')) {
      fillColor = '#f97316'; // Orange
      glowColor = 'rgba(249, 115, 22, 0.4)';
      svgPath = '<path d="M19 20H5v2h14v-2zm-2-7h-2.1L13.1 3H10.9L9.1 13H7v2h10v-2z" fill="currentColor"/>'; // Traffic Cone
    } else if (t.includes('power') || t.includes('electrical')) {
      fillColor = '#eab308'; // Yellow
      glowColor = 'rgba(234, 179, 8, 0.4)';
      svgPath = '<path d="M13 10V2L4 14h7v8l9-12h-7z" fill="currentColor"/>'; // Bolt
    } else if (t.includes('water')) {
      fillColor = '#3b82f6'; // Blue
      glowColor = 'rgba(59, 130, 246, 0.4)';
      svgPath = '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor"/>'; // Droplet
    } else if (t.includes('sanitation')) {
      fillColor = '#10b981'; // Green
      glowColor = 'rgba(16, 185, 129, 0.4)';
      svgPath = '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>'; // Trash can
    }

    if (isFocused) {
      fillColor = '#dc2626'; // Deep red
      glowColor = 'rgba(220, 38, 38, 0.6)';
    }

    const size = isFocused ? 38 : 32;
    const padding = isFocused ? 7 : 6;
    const focusedClass = isFocused ? 'map-marker-focused' : '';

    const htmlContent = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${fillColor};
        border: 2px solid #ffffff;
        color: #ffffff;
        --pulse-color: ${glowColor};
        box-shadow: 0 0 10px ${glowColor}, 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      " class="map-custom-marker ${focusedClass}">
        <svg viewBox="0 0 24 24" style="width: ${size - padding * 2}px; height: ${size - padding * 2}px;" xmlns="http://www.w3.org/2000/svg">
          ${svgPath}
        </svg>
      </div>
    `;

    return L.divIcon({
      html: htmlContent,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
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
      // ignore â€” map still works without admin layer
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