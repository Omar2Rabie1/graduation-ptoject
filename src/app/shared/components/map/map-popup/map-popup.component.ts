import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, Input, OnInit, Output, EventEmitter, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicMapReportsService, PublicMapPopup } from '../../../../core/services/public-map-reports.service';
import { SharedReportsService } from '../../../../core/services/shared-reports.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-map-popup',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, TranslatePipe],
  templateUrl: './map-popup.component.html',
  styles: [`
    :host { display: block; width: 260px; }
  `]
})
export class MapPopupComponent implements OnInit {
  @Input() reportId!: string | number;
  @Input() isUserMode: boolean = false;
  @Input() supportCount?: number;
  
  @Output() supportReport = new EventEmitter<string>();
  
  private reportsService = inject(PublicMapReportsService);
  private sharedReports = inject(SharedReportsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  isLoading = true;
  hasError = false;
  errorMessage = 'Failed to load details';
  details?: Partial<PublicMapPopup> & { id?: string | number };

  ngOnInit() {
    this.fetchDetails();
  }

  fetchDetails() {
    this.isLoading = true;
    this.hasError = false;

    // 1. Check if the report exists in local reports first
    const localReport = this.sharedReports.getCurrentReports().find(r => r.id === this.reportId.toString());
    if (localReport) {
      setTimeout(() => {
        this.details = {
          id: localReport.id,
          reportId: Number(localReport.id) || 0,
          categoryName: localReport.category,
          address: localReport.location,
          status: localReport.status || 'SUBMITTED',
          description: localReport.desc || '',
          createdAt: new Date().toISOString()
        };
        this.isLoading = false;
        this.cdr.markForCheck();
      });
      return;
    }

    // 2. Otherwise, fetch from the API
    this.reportsService.getMapPopupDetails(this.reportId).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.details = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        setTimeout(() => {
          console.error('Failed to load popup details', err);
          this.hasError = true;
          
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.status === 404) {
            this.errorMessage = 'Report not found.';
          } else {
            this.errorMessage = 'Failed to load details';
          }
          
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  get displayId() { return this.details?.id || this.details?.reportId || this.reportId; }

  getStatusClass(status?: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'IN PROGRESS') {
      return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    }
    if (s === 'FIXED' || s === 'RESOLVED' || s === 'COMPLETED') {
      return 'bg-green-500/10 text-green-500 border border-green-500/20';
    }
    if (s === 'REJECTED' || s === 'CANCELLED') {
      return 'bg-red-500/10 text-red-500 border border-red-500/20';
    }
    return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
  }

  onSupportClick() {
    this.supportReport.emit(this.reportId.toString());
  }

  onViewDetails() {
    this.router.navigate(['/authority/report', this.reportId]);
  }
}
