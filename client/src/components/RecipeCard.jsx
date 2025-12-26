import React, { useState, useEffect } from 'react';
import { Clock, Utensils, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Toast from './Toast';
import { useAuth } from '../context/AuthContext';

const RecipeCard = ({ recipe, hideFavoriteButton }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [toast, setToast] = useState(null);
    const { user, updateUser } = useAuth();
    const [imgSrc, setImgSrc] = useState(recipe.image);

    useEffect(() => {
        if (user && user.favorites) {
            const hasFav = user.favorites.some(f => {
                if (recipe.id == 53220) {
                    // Debug log only for Kabse
                    // console.log(`Checking Kabse: ${f.recipeId} (${typeof f.recipeId}) === ${recipe.id} (${typeof recipe.id})`);
                }
                return f.recipeId && f.recipeId.toString() === recipe.id.toString();
            });
            setIsFavorite(hasFav);
        } else {
            setIsFavorite(false);
        }
    }, [user, recipe.id]);

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            setToast({ message: 'Please login to save recipes', type: 'error' });
            return;
        }

        try {
            // Optimistic
            setIsFavorite(!isFavorite);

            const { data } = await api.put('/users/favorites', {
                recipeId: recipe.id.toString(),
                title: recipe.title,
                image: recipe.image,
                isCustom: !!recipe.user
            });

            // Sync with context so other cards/navbar update immediately
            updateUser({ ...user, favorites: data });

            setToast({ message: !isFavorite ? 'Saved to Favorites' : 'Removed from Favorites' });
        } catch (error) {
            setIsFavorite(!isFavorite); // Revert
            setToast({ message: 'Failed to update favorites', type: 'error' });
        }
    };

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="recipe-card">
                <div className="recipe-image-container">
                    <img
                        src={imgSrc || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=500&q=80'}
                        alt={recipe.title}
                        loading="lazy"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=500&q=80'
                        }}
                    />
                    {!hideFavoriteButton && (
                        <button
                            onClick={toggleFavorite}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'rgba(255,255,255,0.95)',
                                border: 'none',
                                borderRadius: '50%',
                                padding: '10px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                zIndex: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Heart size={22} fill={isFavorite ? "#ff6b6b" : "none"} color={isFavorite ? "#ff6b6b" : "#cbd5e0"} />
                        </button>
                    )}
                    <div className="recipe-overlay">
                        <Link to={`/recipe/${recipe.id}`} className="view-btn-overlay">View Recipe</Link>
                        {/* Show delete button only if onDelete prop is provided (implies ownership context) */}
                        {recipe.onDelete && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this recipe?')) {
                                        recipe.onDelete(recipe.id);
                                    }
                                }}
                                className="delete-btn-overlay"
                                style={{
                                    marginTop: '10px',
                                    background: '#ff6b6b',
                                    color: 'white',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '50px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transform: 'translateY(20px)',
                                    transition: 'transform 0.3s'
                                }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
                <div className="recipe-info">
                    <h3 title={recipe.title}>{recipe.title.length > 40 ? recipe.title.substring(0, 40) + '...' : recipe.title}</h3>
                    <div className="recipe-meta">
                        <span><Clock size={16} color="#ff6b6b" /> {recipe.readyInMinutes || 30} min</span>
                        <span><Utensils size={16} color="#ff6b6b" /> {recipe.servings || 2} serves</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecipeCard;
