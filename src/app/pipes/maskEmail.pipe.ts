import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskEmail',
  standalone: true
})
export class MaskEmailPipe implements PipeTransform {
  transform(mail: string): string {
    if (!mail) return '';
    const [username, domain] = mail.split('@');
    if (username.length > 1) {
      return `${username.charAt(0)}*****@${domain}`;
    } else {
      return `*${username.charAt(0)}@${domain}`; // Handles single character usernames
    }
  }
}