import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, ViewChild, ElementRef, NgZone, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MapComponent } from '../../../shared/components/map/map.component';
import { MapMarker } from '../../../shared/models/map-marker.model';
import { SharedReportsService, SharedReport } from '../../../core/services/shared-reports.service';

import { CookieService } from '../../../core/services/cookie.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { combineLatest, of, BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PublicMapReportsService, PublicMapReport } from '../../../core/services/public-map-reports.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../i18n/language.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { AiClassificationService, AiClassifyResponse } from '../../../core/services/ai/ai-classification.service';
import { AI_CATEGORY_MAPPING } from '../../../core/services/ai/category-mapping.constant';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { UserProfileService } from '../../../core/services/user/user-profile.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, FormsModule, MapComponent, TranslatePipe],
  templateUrl: './user-dashboard.html',
  styles: [`
    .animate-slide-in { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    :host { display: block; width: 100%; height: 100vh; }
  `]
})
export class UserDashboard implements OnInit {
  @ViewChild('descInput') descInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('categorySelect') categorySelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  currentView: 'map' | 'reports' = 'map';
  showReportPanel: boolean = false;
  isSidebarOpen = false;
  profilePicPreview: string | null = null;
  userName: string = 'Public User';
  userInitial: string = 'P';
  locationInput: string = '';
  selectedLat?: number;
  selectedLng?: number;
  focusMarkerId?: string;

  imagePreviews: string[] = ['', '', ''];
  selectedFiles: (File | null)[] = [null, null, null];

  // إعدادات الـ Pagination
  currentPage: number = 1;
  itemsPerPage: number = 3;

  reportsList: SharedReport[] = [];
  mapMarkers: MapMarker[] = [];
  typeFilter = new Set<string>();

  userId: string = '';
  private analysisTimeout: any = null;
  private nearbyMarkersSource = new BehaviorSubject<MapMarker[]>([]);
  nearbyMarkers$ = this.nearbyMarkersSource.asObservable();

  private apiReportsSource = new BehaviorSubject<SharedReport[]>([]);
  apiReports$ = this.apiReportsSource.asObservable();

  private reportsService = inject(SharedReportsService);
  private publicMapApi = inject(PublicMapReportsService);
  private cookieService = inject(CookieService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private profileService = inject(UserProfileService);
  langService = inject(LanguageService);

  isAnalyzing = false;
  get isAiLoading(): boolean {
    return this.isAnalyzing;
  }
  set isAiLoading(value: boolean) {
    this.isAnalyzing = value;
  }
  aiConfidence: number | null = null;
  private aiService = inject(AiClassificationService);
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  get isDarkMode(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  constructor(private zone: NgZone, private router: Router) { }

  // دالة لحساب البلاغات التي ستظهر في الصفحة الحالية فقط
  get pagedReports() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.reportsList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // حساب إجمالي الصفحات
  get totalPages() {
    return Math.ceil(this.reportsList.length / this.itemsPerPage);
  }

  // تغيير الصفحة
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onProfilePicSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // Local preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicPreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);

      // Upload to server
      this.notification.success('Uploading profile photo...');
      this.profileService.updateProfilePhoto(file).subscribe({
        next: () => {
          this.notification.success('Profile photo updated successfully!');
          this.loadUserProfile();
        },
        error: (err) => {
          this.notification.error(err?.error?.message || 'Failed to upload profile photo');
          console.error('Failed to upload profile photo in dashboard', err);
        }
      });
    }
  }

  onFilesSelected(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.selectedFiles[index] = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews[index] = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);

      // Debounce to allow selection of multiple files before triggering classification
      if (this.analysisTimeout) {
        clearTimeout(this.analysisTimeout);
      }
      this.analysisTimeout = setTimeout(() => {
        this.classifyAllSelectedImages();
      }, 1000);
    }
  }

  removeSelectedFile(event: Event, index: number) {
    event.stopPropagation();
    this.selectedFiles[index] = null;
    this.imagePreviews[index] = '';
    this.cdr.detectChanges();
  }


  private classifyAllSelectedImages(): void {
    const activeFiles = this.selectedFiles.filter((f): f is File => f !== null);
    if (activeFiles.length === 0) return;

    if (this.isAnalyzing) return;
    this.isAnalyzing = true;
    this.cdr.detectChanges();

    this.aiService.classifyImages(activeFiles).pipe(
      finalize(() => {
        this.isAnalyzing = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (result) => {
        // Auto-fill description
        if (result.description?.trim().length > 0) {
          if (this.descInput?.nativeElement) {
            this.descInput.nativeElement.value = result.description.trim();
          }
        }

        // Auto-select category
        const mappedCategory = AI_CATEGORY_MAPPING[result.classification];
        if (mappedCategory) {
          if (this.categorySelect?.nativeElement) {
            this.categorySelect.nativeElement.value = mappedCategory;
          }
          this.notification.success(
            `AI detected: ${mappedCategory} — description auto-filled.`
          );
        } else {
          this.notification.warning(
            'AI could not detect category. Please choose manually.'
          );
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.notification.error(
          'Image analysis failed. Please fill details manually.'
        );
        this.cdr.detectChanges();
      }
    });
  }

  triggerFileInput(index: number) {
    this.fileInput.nativeElement.onchange = (e) => this.onFilesSelected(e, index);
    this.fileInput.nativeElement.click();
  }

  onLocationSelected(coords: { lat: number, lng: number }) {
    this.selectedLat = coords.lat;
    this.selectedLng = coords.lng;
    this.showReportPanel = true;
    this.cdr.detectChanges();

    // Optional: Reverse geocoding to fill locationInput
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.display_name) {
          this.zone.run(() => {
            this.locationInput = data.display_name.split(',').slice(0, 3).join(',');
            this.cdr.detectChanges();
          });
        }
      })
      .catch(err => console.error('Reverse geocoding failed', err));
  }

  onSupportReport(reportId: string) {
    this.reportsService.incrementSupport(reportId);
    this.focusMarkerId = reportId;

    this.publicMapApi.alsoSuffer(reportId).subscribe({
      next: () => {
        console.log('Successfully registered also-suffer on backend for report:', reportId);
      },
      error: (err) => {
        console.error('Failed to register also-suffer on backend', err);
      }
    });
  }

  updateMapLocation(desc: string, category: string) {
    // If user types location manually, we could forward geocode here and update map,
    // but since we rely on map clicks, we can just let them use the search string.
  }

  submitForm(descElem: HTMLTextAreaElement, categoryElem: HTMLSelectElement) {
    if (!descElem.value || !this.locationInput) return;

    const firstFile = this.selectedFiles.find(f => f !== null);
    if (!firstFile) {
      this.notification.warning('Please upload at least one evidence photo.');
      return;
    }

    const catId = this.getCategoryId(categoryElem.value);
    const lat = this.selectedLat ?? 30.0444;
    const lng = this.selectedLng ?? 31.2357;

    this.publicMapApi.submitReport(catId, descElem.value, lat, lng, firstFile).subscribe({
      next: () => {
        this.notification.success('Report submitted successfully!');
        if (this.mapComponent) {
          this.mapComponent.clearUserPin();
        }
        this.selectedLat = undefined;
        this.selectedLng = undefined;
        this.currentPage = 1;
        this.showReportPanel = false;
        this.imagePreviews = ['', '', ''];
        this.selectedFiles = [null, null, null];
        this.locationInput = '';
        descElem.value = '';
        this.aiConfidence = null;
        this.isAiLoading = false;
        this.setView('map');
        this.fetchNearbyReports();
        this.loadUserReports();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to submit report', err);
        let errorMsg = 'Failed to submit report.';
        if (err?.error?.errors) {
          const validationErrors = err.error.errors;
          const messages: string[] = [];
          for (const key in validationErrors) {
            if (Object.prototype.hasOwnProperty.call(validationErrors, key)) {
              const errorsList = validationErrors[key];
              if (Array.isArray(errorsList)) {
                messages.push(`${key}: ${errorsList.join(', ')}`);
              } else {
                messages.push(`${key}: ${errorsList}`);
              }
            }
          }
          if (messages.length > 0) {
            errorMsg = `Validation errors:\n` + messages.join('\n');
          }
        } else if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        this.notification.error(errorMsg);
        this.cdr.detectChanges();
      }
    });
  }

  private getCategoryId(categoryName: string): number {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('road')) return 1;
    if (name.includes('elect') || name.includes('light')) return 2;
    if (name.includes('water') || name.includes('sewage') || name.includes('sanit')) return 3;
    return 1; // Fallback to Roads
  }

  ngOnInit() {
    this.isSidebarOpen = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
    this.extractUserData();
    this.loadUserProfile();
    this.fetchNearbyReports();
    this.loadUserReports();

    combineLatest([
      this.reportsService.supportCounts$,
      this.nearbyMarkers$.pipe(catchError(() => of([]))),
      this.apiReports$.pipe(catchError(() => of([]))),
    ]).subscribe(([supportCounts, nearbyMarkers, apiReports]) => {
      const reportsById = new Map<string, SharedReport>();
      for (const r of apiReports) {
        if (r.id != null) reportsById.set(r.id, r);
      }
      this.reportsList = [...reportsById.values()];

      const filteredNearbyMarkers = nearbyMarkers.filter(m => {
        const s = (m.status || '').toUpperCase();
        return s !== 'FIXED' && s !== 'RESOLVED' && s !== 'COMPLETED' && s !== 'CONFIRMED';
      });

      const markersById = new Map<string, MapMarker>();
      for (const m of filteredNearbyMarkers) {
        if (m.id != null) markersById.set(String(m.id), m);
      }

      this.mapMarkers = [...markersById.values()].map((m) => ({
        ...m,
        supportCount: supportCounts[m.id!] || 0,
      }));
    });
  }

  get filteredMarkers(): MapMarker[] {
    if (this.typeFilter.size === 0) return this.mapMarkers;
    return this.mapMarkers.filter((m) => !!m.type && this.typeFilter.has(m.type.toLowerCase()));
  }

  toggleType(type: string): void {
    const key = type.toLowerCase();
    if (this.typeFilter.has(key)) {
      this.typeFilter.delete(key);
    } else {
      this.typeFilter.add(key);
    }
  }

  clearFilters(): void {
    this.typeFilter.clear();
  }

  isTypeSelected(type: string): boolean {
    return this.typeFilter.has(type.toLowerCase());
  }

  onLogout(): void {
    this.authService.logout();
  }
  setView(view: 'map' | 'reports') {
    this.currentView = view;
  }
  goToProfile() {
    this.router.navigate(['/profile']);
  }
  toggleReportPanel() {
    this.showReportPanel = !this.showReportPanel;
    this.cdr.detectChanges();
  }

  private extractUserData() {
    const user = this.authService.currentUser();
    if (user?.name) {
      this.userName = user.name;
      this.userInitial = user.name.charAt(0).toUpperCase();
      this.userId = user.id || '';
      return;
    }

    const token = this.authService.getToken() ?? this.cookieService.getToken();
    if (token) {
      try {
        const payloadStr = atob(token.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        
        const nameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
        const givenNameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname';
        const idClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

        this.userId = payload[idClaim] || payload.nameid || payload.sub || '';
        this.userName = payload[nameClaim] || payload.name || payload.unique_name || payload.given_name || payload[givenNameClaim];

        if (!this.userName) {
          const nameKey = Object.keys(payload).find(k => 
            k.toLowerCase().includes('name') && 
            !k.toLowerCase().includes('role') &&
            !k.toLowerCase().includes('nameidentifier')
          );
          if (nameKey) {
            this.userName = payload[nameKey];
          }
        }

        if (!this.userName || this.userName.trim() === '') {
          this.userName = 'Public User';
        }

        this.userInitial = this.userName.charAt(0).toUpperCase();
      } catch (e) {
        console.error('Error decoding token', e);
      }
    }
  }

  private fetchNearbyReports() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.loadNearby(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation failed, falling back to Cairo:', err);
          this.loadNearby(30.0444, 31.2357);
        }
      );
    } else {
      this.loadNearby(30.0444, 31.2357);
    }
  }

  private loadNearby(lat: number, lng: number) {
    this.publicMapApi.getNearbyReports(lat, lng).subscribe({
      next: (res) => {
        const raw = this.extractArray(res);
        const mapped: MapMarker[] = raw.map((r: PublicMapReport) => ({
          id: String(r.reportId),
          title: r.title || 'Nearby Issue',
          description: r.description || `Status: ${r.status}`,
          lat: Number(r.latitude || lat),
          lng: Number(r.longitude || lng),
          type: r.title,
          status: r.status
        }));
        this.nearbyMarkersSource.next(mapped);
      },
      error: (err) => {
        console.error('Failed to load nearby reports API', err);
      }
    });
  }

  private loadUserProfile() {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res?.success && res.profile) {
          const photo = res.profile.profilePictureUrl;
          if (photo) {
            this.profilePicPreview = this.formatPhotoUrl(photo);
          }
          if (res.profile.name) {
            this.userName = res.profile.name;
            this.userInitial = res.profile.name.charAt(0).toUpperCase();
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load user profile in dashboard', err);
      }
    });
  }

  private formatPhotoUrl(path: any): string {
    if (!path) return '';
    let url = '';
    if (typeof path === 'string') {
      url = path;
    } else if (path && typeof path === 'object') {
      url = path.imageUrl || path.url || path.photoUrl || '';
    }
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    if (cleanUrl.startsWith('wwwroot/')) {
      cleanUrl = cleanUrl.substring(8);
    }
    return `https://irs-main.runasp.net/${cleanUrl}`;
  }

  private loadUserReports() {
    if (!this.userId) return;
    this.publicMapApi.getUserReports(this.userId, 1, 100).subscribe({
      next: (res) => {
        const raw = this.extractArray(res);
        const mapped: SharedReport[] = raw.map((r: PublicMapReport) => ({
          id: String(r.reportId),
          title: r.title || 'Untitled Report',
          desc: r.description || 'No description provided.',
          location: r.latitude && r.longitude ? `${Number(r.latitude).toFixed(4)}, ${Number(r.longitude).toFixed(4)}` : 'Unknown Location',
          category: r.title || 'General',
          images: (() => {
            const rawPhotos = r.photoUrls || (r as any).photos || (r as any).images || (r as any).photosPreview || [];
            return Array.isArray(rawPhotos)
              ? rawPhotos.map(p => this.formatPhotoUrl(p)).filter(url => !!url)
              : [];
          })(),
          lat: Number(r.latitude || 30.0444),
          lng: Number(r.longitude || 31.2357),
          status: r.status || 'SUBMITTED',
          statusBg: this.getStatusBg(r.status),
          reporterName: this.userName,
          reporterAvatarColor: '#FF6B00',
          updatedAgo: r.updatedAt ? this.formatRelativeTime(r.updatedAt) : 'Just now',
          priority: 'normal'
        }));
        this.apiReportsSource.next(mapped);
      },
      error: (err) => {
        console.error('Failed to load user reports from API', err);
      }
    });
  }

  private extractArray(body: unknown): PublicMapReport[] {
    if (Array.isArray(body)) return body as PublicMapReport[];
    if (body && typeof body === 'object') {
      const obj = body as Record<string, unknown>;
      if ('items' in obj && Array.isArray(obj['items'])) {
        return obj['items'] as PublicMapReport[];
      }
      if ('data' in obj) {
        const data = obj['data'];
        if (Array.isArray(data)) {
          return data as PublicMapReport[];
        }
        if (data && typeof data === 'object') {
          const dataObj = data as Record<string, unknown>;
          if ('items' in dataObj && Array.isArray(dataObj['items'])) {
            return dataObj['items'] as PublicMapReport[];
          }
          if ('data' in dataObj && Array.isArray(dataObj['data'])) {
            return dataObj['data'] as PublicMapReport[];
          }
        }
      }
    }
    return [];
  }

  private getStatusBg(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'IN PROGRESS') {
      return 'bg-blue-500/10 text-blue-500';
    }
    if (s === 'FIXED' || s === 'RESOLVED' || s === 'COMPLETED') {
      return 'bg-green-500/10 text-green-500';
    }
    if (s === 'REJECTED' || s === 'CANCELLED') {
      return 'bg-red-500/10 text-red-500';
    }
    return 'bg-orange-500/10 text-orange-500';
  }

  private formatRelativeTime(dateStr: string): string {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return dateStr;
    }
  }

  isResolved(status: string): boolean {
    const s = (status || '').toUpperCase();
    return s === 'FIXED' || s === 'RESOLVED' || s === 'COMPLETED';
  }

  confirmFix(reportId: string): void {
    if (!this.userId) {
      this.notification.error('You must be logged in to confirm a fix.');
      return;
    }

    this.publicMapApi.confirmReportFix(this.userId, reportId).subscribe({
      next: () => {
        this.notification.success('Fix confirmed successfully!');
        this.loadUserReports();
      },
      error: (err) => {
        console.error('Backend confirm-fix failed', err);
        this.notification.error('Failed to confirm fix on the server.');
      }
    });
  }

  rejectFix(reportId: string): void {
    if (!this.userId) {
      this.notification.error('You must be logged in to reject a fix.');
      return;
    }

    this.publicMapApi.rejectReportFix(this.userId, reportId).subscribe({
      next: () => {
        this.notification.warning('Fix rejected successfully!');
        this.loadUserReports();
      },
      error: (err) => {
        console.error('Backend reject-fix failed', err);
        this.notification.error('Failed to reject fix on the server.');
      }
    });
  }
}