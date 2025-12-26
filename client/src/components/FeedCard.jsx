import React, { useState } from 'react';
import { Heart, MessageCircle, Clock, Flame, Dumbbell, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';
import './feed-card.css';

const FeedCard = ({ recipe }) => {
    const { user, updateUser } = useAuth();
    const [likeAnim, setLikeAnim] = useState(false);
    const [toast, setToast] = useState(null);

    // Check if recipe is already in favorites
    const isFavorited = user?.favorites?.some(f => f.recipeId === String(recipe.id)) || false;
    const [isLiked, setIsLiked] = useState(isFavorited);

    // Sync local state with user context if it changes from elsewhere
    React.useEffect(() => {
        setIsLiked(user?.favorites?.some(f => f.recipeId === String(recipe.id)) || false);
    }, [user, recipe.id]);

    const handleLike = async (e) => {
        e.preventDefault(); // Prevent link navigation
        if (!user) {
            setToast({ message: "Please login to save recipes!", type: "error" });
            return;
        }

        // Optimistic UI update
        const newState = !isLiked;
        setIsLiked(newState);
        setLikeAnim(true);
        setTimeout(() => setLikeAnim(false), 1000);

        try {
            const payload = {
                recipeId: recipe.id,
                title: recipe.title,
                image: recipe.image,
                isCustom: recipe.isCustom || false
            };

            const { data: updatedFavorites } = await api.put('/users/favorites', payload);

            // Update global user context so other components (and this one) stay in sync
            updateUser({ favorites: updatedFavorites });

            setToast({
                message: newState ? "Added to Favorites!" : "Removed from Favorites",
                type: "success"
            });

        } catch (error) {
            console.error("Like failed", error);
            setIsLiked(!newState); // Revert on error
            setToast({ message: "Failed to update favorite", type: "error" });
        }
    };

    // Mock data helpers (since API might be limited)
    const calories = recipe.nutrition?.calories || Math.floor(Math.random() * (600 - 300) + 300);
    const protein = recipe.nutrition?.protein || Math.floor(Math.random() * (50 - 20) + 20);
    const difficulty = recipe.readyInMinutes > 45 ? 'Intermediate' : 'Beginner';
    const dietTag = recipe.diets?.find(d => d.includes('vegetarian') || d.includes('vegan')) ? 'Plant Based' : 'Gym Friendly';

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <Link to={`/recipe/${recipe.id}`} style={{ textDecoration: 'none' }}>
                <div className="feed-card-vertical">
                    {/* Image Section */}
                    <div className="fc-image-container">
                        <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="fc-image"
                            loading="lazy"
                            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=500&q=80'}
                        />

                        {/* Overlay: Gym Friendly / Diet */}
                        <div className="fc-overlay-badge">
                            {dietTag === 'Gym Friendly' ? <Dumbbell size={12} /> : <Sprout size={12} />}
                            {dietTag}
                        </div>

                        {/* Overlay: Heart Button */}
                        <button className="fc-like-btn" onClick={handleLike}>
                            <Heart size={18} fill={isLiked ? "#ff6b6b" : "none"} color={isLiked ? "#ff6b6b" : "#2d3436"} />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="fc-content">
                        <h3 className="fc-title">{recipe.title}</h3>

                        {/* Stats Row (Pills) */}
                        <div className="fc-stats-row">
                            <span className="fc-pill grey">
                                <Clock size={12} /> {recipe.readyInMinutes || 30} min
                            </span>
                            <span className="fc-pill yellow">
                                <Flame size={12} /> {calories} cal
                            </span>
                            <span className="fc-pill pink">
                                <Dumbbell size={12} /> {protein}g
                            </span>
                            <span className={`fc-pill ${difficulty === 'Beginner' ? 'blue' : 'orange'}`}>
                                {difficulty}
                            </span>
                        </div>

                        {/* Footer */}
                        <div className="fc-footer">
                            <span className="fc-author">by {recipe.user?.name || recipe.sourceName || 'ChefMia'}</span>
                            <div className="fc-actions">
                                <div className="fc-action-item">
                                    <Heart size={14} /> {isLiked ? 235 : 234}
                                </div>
                                <div className="fc-action-item">
                                    <MessageCircle size={14} /> {recipe.aggregateLikes ? Math.floor(recipe.aggregateLikes / 10) : 45}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </>
    );
};

export default FeedCard;
