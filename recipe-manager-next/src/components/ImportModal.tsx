import { useState } from 'react';
import { Recipe } from '@/types/recipe';
import { X, Link, FileText, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ImportModal.module.css';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: Partial<Recipe>) => void;
}

type ImportType = 'url' | 'text' | 'image';

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [activeTab, setActiveTab] = useState<ImportType>('url');
    const [inputContent, setInputContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = (e.target?.result as string).split(',')[1];
                setInputContent(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImport = async () => {
        if (!inputContent) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: activeTab, content: inputContent }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to import');
            }

            const data = await res.json();
            onImport(data);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
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
                            <h2 className={styles.title}>Import Recipe</h2>
                            <button onClick={onClose} className={styles.closeButton}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.tabs}>
                            <button
                                onClick={() => { setActiveTab('url'); setInputContent(''); setError(null); }}
                                className={`${styles.tabBtn} ${activeTab === 'url' ? styles.tabActive : ''}`}
                            >
                                <Link size={16} /> URL
                            </button>
                            <button
                                onClick={() => { setActiveTab('text'); setInputContent(''); setError(null); }}
                                className={`${styles.tabBtn} ${activeTab === 'text' ? styles.tabActive : ''}`}
                            >
                                <FileText size={16} /> Text
                            </button>
                            <button
                                onClick={() => { setActiveTab('image'); setInputContent(''); setError(null); }}
                                className={`${styles.tabBtn} ${activeTab === 'image' ? styles.tabActive : ''}`}
                            >
                                <ImageIcon size={16} /> Photo
                            </button>
                        </div>

                        <div className={styles.content}>
                            {activeTab === 'url' && (
                                <div className="space-y-4">
                                    <p className={styles.description}>Paste a URL from any recipe website.</p>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/recipe"
                                        className="input"
                                        value={inputContent}
                                        onChange={(e) => setInputContent(e.target.value)}
                                    />
                                </div>
                            )}

                            {activeTab === 'text' && (
                                <div className="space-y-4">
                                    <p className={styles.description}>Paste the full recipe text here.</p>
                                    <textarea
                                        placeholder="Recipe Title&#10;Ingredients...&#10;Instructions..."
                                        className={`input ${styles.textarea}`}
                                        value={inputContent}
                                        onChange={(e) => setInputContent(e.target.value)}
                                    />
                                </div>
                            )}

                            {activeTab === 'image' && (
                                <div className="space-y-4">
                                    <p className={styles.description}>Upload a photo of a recipe card or book.</p>
                                    <div className={styles.uploadArea}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className={styles.fileInput}
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className={styles.uploadLabel}>
                                            <ImageIcon size={32} className={styles.uploadIcon} />
                                            <span className={styles.uploadText}>Click to upload</span>
                                        </label>
                                    </div>
                                    {inputContent && (
                                        <div className={styles.successMsg}>
                                            <div className={styles.dot} />
                                            Image selected
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className={styles.errorMsg}>
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleImport}
                                disabled={isLoading || !inputContent}
                                className={`btn btn-primary ${styles.submitBtn}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className={styles.spin} size={18} /> Analyzing...
                                    </>
                                ) : (
                                    'Import Recipe'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
