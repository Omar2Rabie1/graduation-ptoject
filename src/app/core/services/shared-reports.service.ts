import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SharedReport {
  id: string;
  title: string;
  desc: string;
  location: string;
  category: string;
  images: string[];
  lat: number;
  lng: number;
  status: string;
  statusBg: string;
  reporterName: string;
  reporterAvatarColor: string;
  updatedAgo: string;
  priority: 'normal' | 'high';
}

@Injectable({ providedIn: 'root' })
export class SharedReportsService {
  private reportsSource = new BehaviorSubject<SharedReport[]>(this.loadReports());
  reports$ = this.reportsSource.asObservable();

  private supportCountsSource = new BehaviorSubject<Record<string, number>>(this.loadSupportCounts());
  supportCounts$ = this.supportCountsSource.asObservable();

  constructor() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'smartCity_localReports') {
        const saved = event.newValue;
        this.reportsSource.next(saved ? JSON.parse(saved) : []);
      }
      if (event.key === 'smartCity_supportCounts') {
        const saved = event.newValue;
        this.supportCountsSource.next(saved ? JSON.parse(saved) : {});
      }
    });
  }

  private loadReports(): SharedReport[] {
    const saved = localStorage.getItem('smartCity_localReports');
    return saved ? JSON.parse(saved) : [];
  }

  private loadSupportCounts(): Record<string, number> {
    const saved = localStorage.getItem('smartCity_supportCounts');
    return saved ? JSON.parse(saved) : {};
  }

  addReport(report: SharedReport) {
    const current = this.reportsSource.value;
    const updated = [report, ...current];
    this.reportsSource.next(updated);
    localStorage.setItem('smartCity_localReports', JSON.stringify(updated));
  }

  getCurrentReports(): SharedReport[] {
    return this.reportsSource.value;
  }

  updateReportStatus(reportId: string, status: string) {
    const current = this.reportsSource.value;
    const updated = current.map(r => r.id === reportId ? { ...r, status } : r);
    this.reportsSource.next(updated);
    localStorage.setItem('smartCity_localReports', JSON.stringify(updated));
  }

  incrementSupport(reportId: string) {
    const current = { ...this.supportCountsSource.value };
    current[reportId] = (current[reportId] || 0) + 1;
    this.supportCountsSource.next(current);
    localStorage.setItem('smartCity_supportCounts', JSON.stringify(current));
  }
}
