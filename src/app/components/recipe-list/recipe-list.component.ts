import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  searchQuery: string = '';
  loading: boolean = true;
  error: string | null = null;
  private searchSubject = new Subject<string>();
  selectedCategories: string[] = [];
  categories: string[] = ['Bakverk & Desserter', 'Bröd & Degar', 'Fisk & Skaldjur', 'Middag'];

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { 
          search: query || null,
          categories: this.selectedCategories.length ? this.selectedCategories : null
        },
        queryParamsHandling: 'merge'
      });
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.selectedCategories = params['categories'] ? 
        (Array.isArray(params['categories']) ? params['categories'] : [params['categories']]) : 
        [];
      this.loadRecipes();
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.loadRecipes();
      return;
    }

    this.loading = true;
    this.error = null;
    this.recipeService.getRecipes(this.searchQuery, this.selectedCategories)
      .subscribe({
        next: (recipes: Recipe[]) => {
          this.recipes = recipes;
          this.loading = false;
        },
        error: (error: Error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  onCategorySelect(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        categories: this.selectedCategories.length ? this.selectedCategories : null
      },
      queryParamsHandling: 'merge'
    });
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  viewRecipe(recipeId: number): void {
    this.router.navigate(['/recipe', recipeId]);
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

  private loadRecipes(): void {
    this.loading = true;
    this.error = null;

    this.recipeService.getRecipes(this.searchQuery, this.selectedCategories)
      .subscribe({
        next: (recipes: Recipe[]) => {
          this.recipes = recipes;
          this.loading = false;
        },
        error: (error: Error) => {
          this.error = `Failed to load recipes: ${error.message}. Please try again later.`;
          this.loading = false;
        }
      });
  }
}
