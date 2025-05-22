import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesUrl = 'assets/recipes.json';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'An error occurred while fetching recipes'));
  }

  getRecipes(): Observable<Recipe[]> {
    return this.http.get<{ recipes: Recipe[] }>(this.recipesUrl)
      .pipe(
        map(data => data.recipes),
        catchError(this.handleError)
      );
  }

  getRecipeById(id: number): Observable<Recipe> {
    return this.getRecipes().pipe(
      map(recipes => {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) {
          throw new Error('Recipe not found');
        }
        return recipe;
      }),
      catchError(this.handleError)
    );
  }

  searchRecipes(query: string): Observable<Recipe[]> {
    return this.getRecipes().pipe(
      map(recipes => {
        if (!query) return recipes;
        const searchTerm = query.toLowerCase();
        return recipes.filter(recipe => 
          recipe.title.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm) ||
          recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(searchTerm)
          )
        );
      }),
      catchError(this.handleError)
    );
  }
}
