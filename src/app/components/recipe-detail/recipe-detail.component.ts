import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadRecipe(id);
    });
  }

  private loadRecipe(id: number): void {
    this.loading = true;
    this.error = null;

    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.loading = false;
      },
      error: (error) => {
        this.error = `Failed to load recipe: ${error.message}. Please try again later.`;
        this.loading = false;
        console.error('Error loading recipe:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
