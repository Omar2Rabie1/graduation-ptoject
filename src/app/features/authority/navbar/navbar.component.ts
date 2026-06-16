import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { LanguageService } from '../../../i18n/language.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  @Input() isDarkMode = false;
  @Input() title = '';
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleDarkMode = new EventEmitter<void>();

  langService = inject(LanguageService);
}
