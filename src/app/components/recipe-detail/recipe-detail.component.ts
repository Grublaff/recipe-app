import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { Recipe } from '../../models/recipe.model';

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

interface ParsedIngredient {
  qty: string;
  name: string;
}

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private breadcrumb = inject(BreadcrumbService);

  recipe: Recipe | null = null;
  parsedIngredients: ParsedIngredient[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.error = 'Ogiltigt recept-id';
      this.loading = false;
      return;
    }

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe: Recipe | undefined) => {
        this.recipe = recipe || null;
        if (this.recipe) {
          this.breadcrumb.set(this.recipe.name);
          this.parsedIngredients = this.recipe.ingredients.map(parseIngredient);
        }
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = `Kunde inte ladda recept: ${err.message}`;
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.breadcrumb.reset();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  categoryColor(category: string): string {
    return CATEGORY_COLORS[category] || 'var(--ink-300)';
  }

  formatTime(min: number): string {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
  }
}

const QTY_PATTERN =
  /^\s*((?:ca\.?\s+)?(?:\d+[\.,]?\d*(?:\s*[–-]\s*\d+[\.,]?\d*)?)(?:\s*(?:g|kg|ml|cl|dl|l|st|tsk|msk|krm|nypa|burk|pkt|påse|knippe|klyfta|klyftor|förpackning|portioner|portion)\.?)?)\s+(.+)$/i;

function parseIngredient(raw: string): ParsedIngredient {
  const trimmed = raw.trim();
  const match = trimmed.match(QTY_PATTERN);
  if (match) {
    return { qty: match[1].trim(), name: match[2].trim() };
  }
  return { qty: '', name: trimmed };
}
