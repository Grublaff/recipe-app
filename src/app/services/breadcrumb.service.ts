import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  readonly current = signal<string>('Recept');

  set(label: string) {
    this.current.set(label);
  }

  reset() {
    this.current.set('Recept');
  }
}
