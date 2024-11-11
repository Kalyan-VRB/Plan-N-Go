import {Component, Input} from '@angular/core';

@Component({
  selector: 'trip-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.sass'
})
export class LoadingComponent {
  @Input('isLoading') isLoading: boolean = false;
  @Input('spinnerSize') spinnerSize: number = 50;
}
