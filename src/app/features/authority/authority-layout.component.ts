import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth/auth.service';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-authority-layout',
  standalone: true,
  imports: [FontAwesomeModule, RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './authority-layout.component.html',
  styleUrl: './authority-layout.component.css',
})
export class AuthorityLayoutComponent implements OnInit {
  isSidebarOpen = true;
  isDarkMode = false;
  navbarTitle = 'Live Map';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
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
    this.isDarkMode = !this.isDarkMode;
  }

  logout(): void {
    this.auth.logout();
  }
}
