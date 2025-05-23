import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesUrl = 'assets/recipes.json';

  constructor(private http: HttpClient) {}

  getRecipes(searchQuery?: string, categories?: string[]): Observable<Recipe[]> {
    return this.http.get<{ recipes: Recipe[] }>(this.recipesUrl).pipe(
      map(response => {
        let recipes = response.recipes;
        
        // Apply category filter if provided
        if (categories && categories.length > 0) {
          recipes = recipes.filter(recipe => 
            categories.some(category => recipe.categories.includes(category))
          );
        }
        
        // Apply search filter if provided
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          recipes = recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(query) ||
            recipe.description.toLowerCase().includes(query) ||
            recipe.ingredients.some(ingredient => 
              ingredient.toLowerCase().includes(query)
            )
          );
        }
        
        return recipes;
      }),
      catchError(error => {
        console.error('Error fetching recipes:', error);
        return of([]);
      })
    );
  }

  getRecipeById(id: number): Observable<Recipe | undefined> {
    return this.http.get<{ recipes: Recipe[] }>(this.recipesUrl).pipe(
      map(response => response.recipes.find(recipe => recipe.id === id)),
      catchError(error => {
        console.error('Error fetching recipe:', error);
        return of(undefined);
      })
    );
  }

  private filterByCategory(recipes: Recipe[], category: string): Recipe[] {
    const categoryMap: { [key: string]: string[] } = {
      'Bakverk & Desserter': ['chokladkaka', 'kaka', 'dessert'],
      'Bröd & Degar': ['bröd', 'deg', 'pizza', 'bullar'],
      'Fisk & Skaldjur': ['fisk', 'skaldjur', 'sill', 'lax'],
      'Middag': ['paj', 'middag']
    };

    const keywords = categoryMap[category] || [];
    return recipes.filter(recipe => 
      keywords.some(keyword => 
        recipe.name.toLowerCase().includes(keyword) ||
        recipe.description.toLowerCase().includes(keyword)
      )
    );
  }
}
