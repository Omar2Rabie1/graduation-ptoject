import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component } from '@angular/core';
import { TranslatePipe } from '../../../../i18n/translate.pipe';

@Component({
  selector: 'app-search-bar',
  imports: [FontAwesomeModule, TranslatePipe],
  templateUrl: './search-bar.html',
})
export class SearchBar {}
