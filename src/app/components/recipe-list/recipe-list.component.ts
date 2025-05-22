import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  searchQuery: string = '';
  loading: boolean = true;
  error: string | null = null;
  private searchSubject = new Subject<string>();

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
        queryParams: { search: query || null },
        queryParamsHandling: 'merge'
      });
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
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
    this.recipeService.searchRecipes(this.searchQuery).subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  viewRecipe(recipeId: number): void {
    this.router.navigate(['/recipe', recipeId]);
  }

  private loadRecipes(): void {
    this.loading = true;
    this.error = null;

    const searchObservable = this.searchQuery
      ? this.recipeService.searchRecipes(this.searchQuery)
      : this.recipeService.getRecipes();

    searchObservable.subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.loading = false;
        console.log('Recipes loaded successfully:', recipes);
      },
      error: (error) => {
        this.error = `Failed to load recipes: ${error.message}. Please try again later.`;
        this.loading = false;
        console.error('Error loading recipes:', error);
      }
    });
  }
}
