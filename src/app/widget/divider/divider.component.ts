import {Component, Input} from '@angular/core';

@Component({
  selector: 'trip-divider',
  standalone: true,
  imports: [],
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.sass'
})
export class DividerComponent {
  @Input('dividerHeight') dividerHeight: string = '1.5px';
}
