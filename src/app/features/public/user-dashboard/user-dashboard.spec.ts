import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import * as L from 'leaflet';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, ReactiveFormsModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard implements OnInit, AfterViewInit, OnDestroy {
  // بنقول للأنجولار: "هات لي العنصر اللي في الـ HTML اللي واخد علامة #mapContainer"
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  map!: L.Map;
  showReportPanel = false;

  ngOnInit(): void {
    this.fixLeafletIcons();
  }

  ngAfterViewInit(): void {
    // بنستنى لحظة عشان الـ HTML يترسم
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  private initMap(): void {
    // لو العنصر موجود فعلاً
    if (this.mapContainer && this.mapContainer.nativeElement) {
      
      if (this.map) { this.map.remove(); }

      // بنشغل الخريطة على العنصر اللي مسكناه بالـ ViewChild
      this.map = L.map(this.mapContainer.nativeElement, {
        zoomControl: false,
      }).setView([30.0444, 31.2357], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(this.map);

      setTimeout(() => {
        this.map.invalidateSize();
        console.log("الخريطة نورت أخيراً يا يمنى!");
      }, 500);

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.showReportPanel = true;
        L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map);
      });
    } else {
      console.error("لسه مش شايف العنصر.. هحاول تاني كمان ثانية");
      setTimeout(() => this.initMap(), 1000);
    }
  }

  private fixLeafletIcons(): void {
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
  }
}