import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { Recipe } from '../../models/recipe.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

const CATEGORY_COLORS: Record<string, string> = {
  'Bakverk & Desserter': 'var(--sun-700)',
  'Bakverk': 'var(--sun-700)',
  'Efterrätt': 'var(--sun-500)',
  'Bröd & Degar': 'var(--sun-500)',
  'Fisk & Skaldjur': 'var(--tide-700)',
  'Fisk': 'var(--tide-700)',
  'Middag': 'var(--ink-500)',
  'Kött': 'var(--sun-800)',
  'Korv': 'var(--tide-500)',
  'Kyckling': 'var(--sun-600)',
  'Tacorätter': 'var(--sun-600)',
  'Vilt': 'var(--ink-500)',
  'Vegetariskt': 'var(--success)',
  'Soppa': 'var(--tide-300)'
};

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RecipeListComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private breadcrumb = inject(BreadcrumbService);

  recipes: Recipe[] = [];
  allRecipes: Recipe[] = [];
  searchQuery = '';
  loading = true;
  error: string | null = null;
  selectedCategories: string[] = [];
  categories: string[] = [];

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => this.applyFilters());
  }

  ngOnInit(): void {
    this.breadcrumb.reset();

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.selectedCategories = params['categories']
        ? (Array.isArray(params['categories']) ? params['categories'] : [params['categories']])
        : [];
      this.loadRecipes();
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
    this.syncQueryParams();
  }

  toggleCategory(category: string): void {
    const idx = this.selectedCategories.indexOf(category);
    if (idx === -1) {
      this.selectedCategories = [...this.selectedCategories, category];
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    }
    this.applyFilters();
    this.syncQueryParams();
  }

  clearCategories(): void {
    this.selectedCategories = [];
    this.applyFilters();
    this.syncQueryParams();
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  categoryColor(category: string): string {
    return CATEGORY_COLORS[category] || 'var(--ink-300)';
  }

  cardNumber(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  formatTime(min: number): string {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
  }

  viewRecipe(recipeId: number): void {
    this.router.navigate(['/recipe', recipeId]);
  }

  trackById(_: number, r: Recipe) {
    return r.id;
  }

  private applyFilters(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.recipes = this.allRecipes.filter(r => {
      const matchQ =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.toLowerCase().includes(q));
      const matchC =
        this.selectedCategories.length === 0 ||
        this.selectedCategories.every(c => r.categories.includes(c));
      return matchQ && matchC;
    });
  }

  private syncQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery || null,
        categories: this.selectedCategories.length ? this.selectedCategories : null
      },
      queryParamsHandling: 'merge'
    });
  }

  private loadRecipes(): void {
    this.loading = true;
    this.error = null;
    this.recipeService.getRecipes().subscribe({
      next: (recipes: Recipe[]) => {
        this.allRecipes = recipes;
        this.categories = this.collectCategories(recipes);
        this.applyFilters();
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = `Kunde inte ladda recept: ${err.message}`;
        this.loading = false;
      }
    });
  }

  private collectCategories(recipes: Recipe[]): string[] {
    const set = new Set<string>();
    for (const r of recipes) for (const c of r.categories) set.add(c);
    const known = Object.keys(CATEGORY_COLORS);
    return [...set].sort((a, b) => {
      const ai = known.indexOf(a);
      const bi = known.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b, 'sv');
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }
}
