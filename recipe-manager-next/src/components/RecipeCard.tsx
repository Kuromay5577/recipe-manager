import { Recipe } from '@/types/recipe';
import { Clock, Users, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
    recipe: Recipe;
    onClick: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onClick }: RecipeCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            className={styles.card}
            onClick={() => onClick(recipe)}
        >
            <div className={styles.imageContainer}>
                {recipe.imageUrl ? (
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <ChefHat size={48} />
                    </div>
                )}
                <div className={styles.badges}>
                    {recipe.categories.slice(0, 2).map((cat) => (
                        <span key={cat} className={styles.badge}>
                            {cat}
                        </span>
                    ))}
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{recipe.title}</h3>

                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <Clock size={14} />
                        <span>{recipe.cookingTime} min</span>
                    </div>
                    <div className={styles.metaItem}>
                        <Users size={14} />
                        <span>{recipe.yield}</span>
                    </div>
                </div>

                <div className={styles.tags}>
                    {recipe.seasons.map((season) => (
                        <span key={season} className={styles.tag}>
                            {season}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
