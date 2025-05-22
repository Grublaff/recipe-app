import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesUrl = 'assets/recipes.json';

  constructor(private http: HttpClient) { }

  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.recipesUrl).pipe(
      catchError(this.handleError<Recipe[]>('getRecipes', []))
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
      catchError(this.handleError<Recipe>('getRecipeById'))
    );
  }

  searchRecipes(query: string): Observable<Recipe[]> {
    if (!query.trim()) {
      return this.getRecipes();
    }
    return this.getRecipes().pipe(
      map(recipes => recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(query.toLowerCase()) ||
        recipe.description.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      throw new Error('Kunde inte ladda recept. Försök igen senare.');
    };
  }
}
