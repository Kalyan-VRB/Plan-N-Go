import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'trip-text-area',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaComponent),
      multi: true
    }
  ],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.sass'
})
export class TextAreaComponent implements ControlValueAccessor {
  @Input('textValue') textValue: string = '';
  @Input('textPlaceholder') textPlaceholder: string = '';
  @Input('boxWidth') boxWidth: string = '100%';
  @Input('boxHeight') boxHeight: string = '100%';

  onChange = (value: any) => {
  };
  onTouched = () => {
  };

  writeValue(value: any): void {
    this.textValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.textValue = inputElement.value;
    this.onChange(this.textValue);
  }
}
