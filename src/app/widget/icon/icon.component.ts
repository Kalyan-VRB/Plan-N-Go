import {Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'trip-icon',
  standalone: true,
  imports: [
    MatIcon
  ],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.sass'
})
export class IconComponent {
  @Input('icon') icon: string = '';
}
