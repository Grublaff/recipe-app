import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class SearchComponent {
  searchQuery: string = '';

  constructor(private router: Router) {}

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/recipes'], { queryParams: { search: this.searchQuery.trim() } });
    } else {
      // If search is empty, just navigate to recipes without search params
      this.router.navigate(['/recipes']);
    }
  }
}
