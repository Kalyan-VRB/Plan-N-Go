import {Component, Input} from '@angular/core';

@Component({
  selector: 'trip-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.sass'
})
export class HeaderComponent {
  @Input('header') header: string = '';
  @Input('headerTag') headerTag: string = '';
}
