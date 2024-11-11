import {Component, Input} from '@angular/core';
import {IconComponent} from '../icon/icon.component';

@Component({
  selector: 'trip-tile',
  standalone: true,
  imports: [
    IconComponent
  ],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.sass'
})
export class TileComponent {
  @Input('tileTitle') tileTitle: string = '';
  @Input('tileIcon') tileIcon: string = 'flight_takeoff';
}
