import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class SearchComponent {
  searchQuery: string = '';
  categories: string[] = ['Bakverk & Desserter', 'Bröd & Degar', 'Fisk & Skaldjur', 'Middag'];
  selectedCategory: string | null = null;

  constructor(private router: Router) {}

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/recipes'], { 
        queryParams: { 
          search: this.searchQuery,
          category: this.selectedCategory 
        }
      });
    } else {
      // If search is empty, just navigate to recipes without search params
      this.router.navigate(['/recipes']);
    }
  }

  onCategorySelect(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    if (this.selectedCategory) {
      this.router.navigate(['/recipes'], { 
        queryParams: { category: this.selectedCategory }
      });
    } else {
      this.router.navigate(['/recipes']);
    }
  }

  getCategoryEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'Bakverk & Desserter': '🍰',
      'Bröd & Degar': '🍞',
      'Fisk & Skaldjur': '🐟',
      'Middag': '🍽️'
    };
    return emojiMap[category] || '🍴';
  }
}
