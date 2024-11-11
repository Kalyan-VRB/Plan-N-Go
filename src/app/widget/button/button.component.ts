import {Component, Input} from '@angular/core';

@Component({
  selector: 'trip-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.sass'
})
export class ButtonComponent {
  @Input('buttonLabel') buttonLabel: string = 'Click';
  @Input('buttonWidth') buttonWidth: number = 20;
  @Input('buttonHeight') buttonHeight: number = 20;
}
