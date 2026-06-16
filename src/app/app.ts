import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { appIcons } from './core/icons/icon-library';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FontAwesomeModule, RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  constructor(library: FaIconLibrary) {
    library.addIcons(...appIcons);
  }
}
