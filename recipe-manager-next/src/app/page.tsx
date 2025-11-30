'use client';

import { useState, useEffect, useMemo } from 'react';
import { Recipe } from '@/types/recipe';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetailModal from '@/components/RecipeDetailModal';
import RecipeFormModal from '@/components/RecipeFormModal';
import ImportModal from '@/components/ImportModal';
import { Search, Plus, Loader2, Download } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');

  // Modal states
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe> | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes');
      const data = await res.json();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to fetch recipes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory ? recipe.categories.includes(selectedCategory) : true;
      const matchesSeason = selectedSeason ? recipe.seasons.includes(selectedSeason) : true;

      return matchesSearch && matchesCategory && matchesSeason;
    });
  }, [recipes, searchQuery, selectedCategory, selectedSeason]);

  const handleSaveRecipe = async (recipeData: Partial<Recipe>) => {
    try {
      if (editingRecipe && 'id' in editingRecipe && editingRecipe.id) {
        // Update existing
        const res = await fetch(`/api/recipes/${editingRecipe.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipeData),
        });
        if (res.ok) {
          const updated = await res.json();
          setRecipes(recipes.map(r => r.id === updated.id ? updated : r));
          if (selectedRecipe?.id === updated.id) setSelectedRecipe(updated);
        }
      } else {
        // Create new
        const res = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipeData),
        });
        if (res.ok) {
          const newRecipe = await res.json();
          setRecipes([newRecipe, ...recipes]);
        }
      }
    } catch (error) {
      console.error('Failed to save recipe', error);
    }
  };

  const handleImportedData = (data: Partial<Recipe>) => {
    setEditingRecipe(data);
    setIsFormOpen(true);
  };

  const openDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailOpen(true);
  };

  const openEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const openNew = () => {
    setEditingRecipe(null);
    setIsFormOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Recipe Manager
          </h1>
          <p className={styles.subtitle}>Manage your culinary collection with ease.</p>
        </div>
        <div className={styles.actions}>
          <button onClick={() => setIsImportOpen(true)} className="btn btn-outline">
            <Download size={18} /> Import
          </button>
          <button onClick={openNew} className="btn btn-primary">
            <Plus size={18} /> New Recipe
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlsInner}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`input ${styles.searchInput}`}
            />
          </div>
          <div className={styles.filters}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`input ${styles.select}`}
            >
              <option value="">All Categories</option>
              <option value="和食">Japanese</option>
              <option value="洋食">Western</option>
              <option value="中華">Chinese</option>
              <option value="デザート">Dessert</option>
              <option value="その他">Other</option>
            </select>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className={`input ${styles.select}`}
            >
              <option value="">All Seasons</option>
              <option value="春">Spring</option>
              <option value="夏">Summer</option>
              <option value="秋">Fall</option>
              <option value="冬">Winter</option>
              <option value="通年">Year-round</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className={styles.loaderContainer}>
          <Loader2 className={styles.loader} size={40} />
        </div>
      ) : (
        <>
          {filteredRecipes.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No recipes found matching your criteria.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSelectedSeason('') }} className={styles.clearBtn}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              <AnimatePresence>
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={openDetail}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={openEdit}
      />

      <RecipeFormModal
        recipe={editingRecipe as Recipe}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRecipe}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportedData}
      />
    </div>
  );
}
