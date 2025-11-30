import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { extractServingsNumber, formatNumber } from '@/lib/utils';
import { X, Edit, Minus, Plus, ChefHat, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './RecipeDetailModal.module.css';

interface RecipeDetailModalProps {
    recipe: Recipe | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (recipe: Recipe) => void;
}

export default function RecipeDetailModal({ recipe, isOpen, onClose, onEdit }: RecipeDetailModalProps) {
    const [servings, setServings] = useState<number>(4);

    useEffect(() => {
        if (recipe) {
            setServings(recipe.baseServings || extractServingsNumber(recipe.yield));
        }
    }, [recipe]);

    if (!isOpen || !recipe) return null;

    const baseServings = recipe.baseServings || extractServingsNumber(recipe.yield);
    const scaleFactor = servings / (baseServings || 1);

    const parseIngredient = (line: string) => {
        const match = line.match(/^([\d\.\/\s-]+)(.*)$/);
        if (match) {
            const amountStr = match[1].trim();
            const rest = match[2].trim();

            let amount = 0;
            try {
                const parts = amountStr.split(/[\s-]+/).filter(Boolean);
                for (const part of parts) {
                    if (part.includes('/')) {
                        const [num, den] = part.split('/').map(Number);
                        amount += num / den;
                    } else {
                        amount += parseFloat(part);
                    }
                }
            } catch (e) {
                return { amount: null, text: line };
            }

            if (isNaN(amount)) return { amount: null, text: line };

            return { amount, text: rest };
        }
        return { amount: null, text: line };
    };

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
                        {/* Header Image */}
                        <div className={styles.headerImage}>
                            {recipe.imageUrl ? (
                                <img src={recipe.imageUrl} alt={recipe.title} className={styles.image} />
                            ) : (
                                <div className={styles.placeholder}>
                                    <ChefHat size={64} />
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className={styles.closeButton}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className={styles.content}>
                            <div className={styles.header}>
                                <div>
                                    <h2 className={styles.title}>{recipe.title}</h2>
                                    <div className={styles.badges}>
                                        {recipe.categories.map(cat => (
                                            <span key={cat} className="badge badge-primary">{cat}</span>
                                        ))}
                                        {recipe.seasons.map(s => (
                                            <span key={s} className="badge badge-secondary">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onEdit(recipe)}
                                    className="btn btn-outline"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                            </div>

                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <Clock className="text-indigo-500 mb-1" size={20} />
                                    <span className={styles.statLabel}>Time</span>
                                    <span className={styles.statValue}>{recipe.cookingTime} min</span>
                                </div>
                                <div className={styles.statItem}>
                                    <Users className="text-indigo-500 mb-1" size={20} />
                                    <span className={styles.statLabel}>Yield</span>
                                    <span className={styles.statValue}>{recipe.yield}</span>
                                </div>
                                <div className={`${styles.statItem} col-span-2`}>
                                    <span className={styles.statLabel}>Adjust Servings</span>
                                    <div className={styles.servingsControl}>
                                        <button
                                            onClick={() => setServings(Math.max(1, servings - 1))}
                                            className={styles.servingsBtn}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className={styles.servingsNumber}>{servings}</span>
                                        <button
                                            onClick={() => setServings(servings + 1)}
                                            className={styles.servingsBtn}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.recipeGrid}>
                                <div>
                                    <h3 className={styles.sectionTitle}>
                                        <span className={`${styles.accentBar} ${styles.accentIndigo}`}></span>
                                        Ingredients
                                    </h3>
                                    <ul className={styles.ingredientList}>
                                        {recipe.ingredients.map((line, i) => {
                                            const { amount, text } = parseIngredient(line);
                                            return (
                                                <li key={i} className={styles.ingredientItem}>
                                                    <div className={styles.bullet} />
                                                    <span>
                                                        {amount !== null ? (
                                                            <span className={styles.amount}>
                                                                {formatNumber(amount * scaleFactor)}
                                                            </span>
                                                        ) : null}
                                                        {' '}{text}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className={styles.sectionTitle}>
                                        <span className={`${styles.accentBar} ${styles.accentPink}`}></span>
                                        Instructions
                                    </h3>
                                    <ol className={styles.instructionList}>
                                        {recipe.instructions.map((step, i) => (
                                            <li key={i} className={styles.instructionItem}>
                                                <span className={styles.stepNumber}>
                                                    {i + 1}
                                                </span>
                                                <p className={styles.instructionText}>{step}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>

                            {recipe.notes && (
                                <div className={styles.notes}>
                                    <h4 className={styles.notesTitle}>
                                        <span>📝</span> Notes
                                    </h4>
                                    <p className={styles.notesText}>{recipe.notes}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
