import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-filters',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './filters.html',
})
export class Filters {}
