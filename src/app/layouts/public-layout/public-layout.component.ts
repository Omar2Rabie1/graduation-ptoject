import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [FontAwesomeModule, RouterOutlet],
    template: `<router-outlet />`
})
export class PublicLayoutComponent { }
