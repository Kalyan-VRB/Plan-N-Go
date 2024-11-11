import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkify',
  standalone: true
})
export class LinkifyPipe implements PipeTransform {

  transform(text: string, linkText: string = "Visit Link", cssClass: string = "custom-link"): string {
    const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(
      urlPattern,
      `<a href="$1" target="_blank" class="${cssClass}">${linkText}</a>`
    );
  }

}
