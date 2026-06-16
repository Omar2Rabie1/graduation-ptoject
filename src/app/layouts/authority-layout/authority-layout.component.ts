import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';


import { NavbarComponent } from '../../features/authority/navbar/navbar.component';
import { AuthService } from '../../core/services/auth/auth.service';
import { SidebarComponent } from '../../features/authority/sidebar/sidebar.component';
import { ThemeService } from '../../core/services/theme.service';


@Component({
  selector: 'app-authority-layout',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './authority-layout.component.html',
  styleUrl: './authority-layout.component.css',
})
export class AuthorityLayoutComponent implements OnInit {
  isSidebarOpen = false;
  navbarTitle = 'Live Map';
  
  private themeService = inject(ThemeService);

  get isDarkMode(): boolean {
    return this.themeService.theme() === 'dark';
  }
  
  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.isSidebarOpen = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
    this.updateNavbarTitle(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        this.updateNavbarTitle(url);
      });
  }

  private updateNavbarTitle(url: string): void {
    if (url.startsWith('/authority/reports')) {
      this.navbarTitle = 'Incoming Reports';
    } else if (url.startsWith('/authority/report/')) {
      this.navbarTitle = 'Live Map';
    } else if (url.startsWith('/authority/dashboard')) {
      this.navbarTitle = 'Dashboard';
    } else if (url.startsWith('/authority/live-map') || url === '/authority') {
      this.navbarTitle = 'Live Map';
    } else {
      this.navbarTitle = 'Authority';
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.auth.logout();
  }
}
