import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './RecipeFormModal.module.css';

interface RecipeFormModalProps {
    recipe?: Partial<Recipe> | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (recipe: Partial<Recipe>) => Promise<void>;
}

const CATEGORIES = ['和食', '洋食', '中華', 'デザート', 'その他'];
const SEASONS = ['春', '夏', '秋', '冬', '通年'];
const EVENTS = ['お正月', 'バレンタイン', 'ひな祭り', 'ハロウィン', 'クリスマス', '誕生日', 'パーティー', '普段'];

export default function RecipeFormModal({ recipe, isOpen, onClose, onSave }: RecipeFormModalProps) {
    const [formData, setFormData] = useState<Partial<Recipe>>({
        title: '',
        yield: '',
        cookingTime: 30,
        categories: [],
        seasons: ['通年'],
        events: ['普段'],
        ingredients: [''],
        instructions: [],
        imageUrl: '',
        notes: '',
    });
    const [instructionsText, setInstructionsText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (recipe) {
                setFormData({ ...recipe });
                setInstructionsText(recipe.instructions ? recipe.instructions.join('\n') : '');
            } else {
                setFormData({
                    title: '',
                    yield: '',
                    cookingTime: 30,
                    categories: [],
                    seasons: ['通年'],
                    events: ['普段'],
                    ingredients: [''],
                    instructions: [],
                    imageUrl: '',
                    notes: '',
                });
                setInstructionsText('');
            }
        }
    }, [isOpen, recipe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const instructions = instructionsText.split('\n').filter(line => line.trim());
        const ingredients = (formData.ingredients || []).filter(line => line.trim());

        await onSave({
            ...formData,
            ingredients,
            instructions,
        });

        setIsSaving(false);
        onClose();
    };

    const handleIngredientChange = (index: number, value: string) => {
        const newIngredients = [...(formData.ingredients || [])];
        newIngredients[index] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setFormData({ ...formData, ingredients: [...(formData.ingredients || []), ''] });
    };

    const removeIngredient = (index: number) => {
        const newIngredients = [...(formData.ingredients || [])];
        newIngredients.splice(index, 1);
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const toggleSelection = (field: 'categories' | 'seasons' | 'events', value: string) => {
        const current = formData[field] || [];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        setFormData({ ...formData, [field]: updated });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.modalContainer}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={styles.overlay}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={styles.modal}
                    >
                        <div className={styles.header}>
                            <h2 className={styles.title}>
                                {recipe ? 'Edit Recipe' : 'New Recipe'}
                            </h2>
                            <button onClick={onClose} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.formContent}>
                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="input"
                                        placeholder="Recipe Title"
                                    />
                                </div>
                                <div className={styles.gridCols2}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Time (min)</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={formData.cookingTime}
                                            onChange={e => setFormData({ ...formData, cookingTime: parseInt(e.target.value) || 0 })}
                                            className="input"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Yield</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.yield}
                                            onChange={e => setFormData({ ...formData, yield: e.target.value })}
                                            className="input"
                                            placeholder="e.g. 4 servings"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Image URL</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="input"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <div>
                                    <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Categories</label>
                                    <div className={styles.badgeGroup}>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleSelection('categories', cat)}
                                                className={`${styles.badgeBtn} ${formData.categories?.includes(cat)
                                                        ? `${styles.badgeActive} ${styles.bgIndigo}`
                                                        : styles.badgeInactive
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Seasons</label>
                                    <div className={styles.badgeGroup}>
                                        {SEASONS.map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => toggleSelection('seasons', s)}
                                                className={`${styles.badgeBtn} ${formData.seasons?.includes(s)
                                                        ? `${styles.badgeActive} ${styles.bgPink}`
                                                        : styles.badgeInactive
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Events</label>
                                    <div className={styles.badgeGroup}>
                                        {EVENTS.map(e => (
                                            <button
                                                key={e}
                                                type="button"
                                                onClick={() => toggleSelection('events', e)}
                                                className={`${styles.badgeBtn} ${formData.events?.includes(e)
                                                        ? `${styles.badgeActive} ${styles.bgPurple}`
                                                        : styles.badgeInactive
                                                    }`}
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <div className={styles.sectionHeader}>
                                    <label className={styles.label}>Ingredients</label>
                                    <button type="button" onClick={addIngredient} className={styles.addBtn}>
                                        <Plus size={16} /> Add Item
                                    </button>
                                </div>
                                <div className={styles.formGroup}>
                                    {formData.ingredients?.map((ing, i) => (
                                        <div key={i} className={styles.ingredientRow}>
                                            <input
                                                type="text"
                                                value={ing}
                                                onChange={e => handleIngredientChange(i, e.target.value)}
                                                className="input"
                                                placeholder="e.g. 2 cups flour"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeIngredient(i)}
                                                className={styles.removeBtn}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Instructions (one step per line)</label>
                                <textarea
                                    value={instructionsText}
                                    onChange={e => setInstructionsText(e.target.value)}
                                    className={`input ${styles.textarea}`}
                                    placeholder="1. Preheat oven...&#10;2. Mix ingredients..."
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className={`input ${styles.notesArea}`}
                                    placeholder="Any extra tips or notes..."
                                />
                            </div>
                        </form>

                        <div className={styles.footer}>
                            <button type="button" onClick={onClose} className="btn btn-ghost">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className={`btn btn-primary ${styles.saveBtn}`}
                            >
                                {isSaving ? <Loader2 className={styles.spin} size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saving...' : 'Save Recipe'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
