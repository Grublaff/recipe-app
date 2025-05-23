import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.error = 'Invalid recipe ID';
      this.loading = false;
      return;
    }

    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe: Recipe | undefined) => {
        this.recipe = recipe || null;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = `Failed to load recipe: ${error.message}`;
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/recipes']);
  }
}
