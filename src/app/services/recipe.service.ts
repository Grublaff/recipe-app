import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';

interface RecipesResponse {
  recipes: Recipe[];
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesUrl = 'assets/recipes.json';
  private recipesCache$: Observable<Recipe[]>;

  constructor(private http: HttpClient) {
    this.recipesCache$ = this.http.get<RecipesResponse>(this.recipesUrl).pipe(
      map(response => {
        console.log('Recipes response:', response);
        return response.recipes || [];
      }),
      catchError(error => {
        console.error('Error loading recipes:', error);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  getRecipes(): Observable<Recipe[]> {
    return this.recipesCache$;
  }

  getRecipeById(id: number): Observable<Recipe | null> {
    return this.recipesCache$.pipe(
      map(recipes => {
        console.log('Recipes in getRecipeById:', recipes);
        const recipe = recipes.find(r => r.id === id);
        return recipe || null;
      })
    );
  }

  searchRecipes(query: string): Observable<Recipe[]> {
    return this.recipesCache$.pipe(
      map(recipes => {
        const searchTerm = query.toLowerCase();
        return recipes.filter(recipe => 
          recipe.name.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm)
        );
      })
    );
  }
}
