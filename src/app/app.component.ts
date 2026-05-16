import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BreadcrumbService } from './services/breadcrumb.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private router = inject(Router);
  breadcrumb = inject(BreadcrumbService);

  goHome(event: Event) {
    event.preventDefault();
    this.breadcrumb.reset();
    this.router.navigate(['/']);
  }
}
