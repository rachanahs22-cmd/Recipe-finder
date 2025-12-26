import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeInformation } from '../api/recipeApi';
import api from '../api/axios'; // Import auth-aware axios for reviews
import { Clock, Users, Flame, Star, Send, Check, Dumbbell, Heart, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './recipe-detail.css';

const RecipeDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkedIngredients, setCheckedIngredients] = useState([]);
    const [activeTab, setActiveTab] = useState('instructions');

    // Review State
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const toggleIngredient = (index) => {
        if (checkedIngredients.includes(index)) {
            setCheckedIngredients(checkedIngredients.filter(i => i !== index));
        } else {
            setCheckedIngredients([...checkedIngredients, index]);
        }
    };

    const fetchRecipe = async () => {
        try {
            const data = await getRecipeInformation(id);
            setRecipe(data);
        } catch (error) {
            console.error("Error", error);
        }
        setLoading(false);
    };

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/recipes/${id}/reviews`);
            setReviews(data);
        } catch (error) {
            console.error("Error fetching reviews", error);
        }
    };

    useEffect(() => {
        fetchRecipe();
        fetchReviews();
    }, [id]);

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            setReviewError('You must be logged in to review.');
            return;
        }
        setSubmitting(true);
        setReviewError('');
        try {
            await api.post(`/recipes/${id}/reviews`, { rating, comment });
            setComment('');
            setRating(5);
            fetchReviews(); // Refresh reviews list
        } catch (error) {
            setReviewError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="feed-loader"><div className="spin"></div></div>;
    if (!recipe) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Recipe not found</div>;

    const activeTabClass = (tabName) => `rd-tab ${activeTab === tabName ? 'active' : ''}`;

    return (
        <div className="recipe-detail-page">
            {/* Hero Background */}
            <img src={recipe.image} alt={recipe.title} className="rd-hero" />

            {/* Overlapping Content Card */}
            <div className="rd-container">
                {/* Header Section */}
                <div className="rd-tags">
                    <span className="rd-tag green"><Flame size={14} /> Gym Friendly</span>
                    <span className="rd-tag yellow"><Star size={14} /> Intermediate</span>
                    <span className="rd-tag outline">High Protein</span>
                </div>

                <h1 className="rd-title">{recipe.title}</h1>
                <p className="rd-description">
                    {recipe.summary ? recipe.summary.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : 'A delicious and nutritious meal perfect for any occasion.'}
                </p>

                <div className="rd-author-row">
                    <div className="rd-avatar">
                        {recipe.user?.name ? recipe.user.name[0].toUpperCase() : (recipe.sourceName ? recipe.sourceName[0] : 'C')}
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#2d3436' }}>
                            {recipe.user?.name || recipe.sourceName || 'Chef Maria'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>Recipe Creator</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', color: '#636e72', fontSize: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Star size={16} fill="#Fbc02d" color="#Fbc02d" /> 4.8 (156 reviews)</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Heart size={16} /> {recipe.likes || 2340} likes</span>
                    </div>
                </div>

                {/* Stats Strip */}
                <div className="rd-stats-strip">
                    <div className="rd-stat-item">
                        <Clock size={24} color="#ff6b6b" />
                        <span className="rd-stat-value">{recipe.readyInMinutes}</span>
                        <span className="rd-stat-label">Total Minutes</span>
                    </div>
                    <div className="rd-stat-item">
                        <Flame size={24} color="#ff6b6b" />
                        <span className="rd-stat-value">420</span> {/* Mock data if API doesn't provide */}
                        <span className="rd-stat-label">Calories</span>
                    </div>
                    <div className="rd-stat-item">
                        <Dumbbell size={24} color="#ff6b6b" />
                        <span className="rd-stat-value">45g</span>
                        <span className="rd-stat-label">Protein</span>
                    </div>
                    <div className="rd-stat-item">
                        <Users size={24} color="#ff6b6b" />
                        <span className="rd-stat-value">{recipe.servings}</span>
                        <span className="rd-stat-label">Servings</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="rd-tabs">
                    <div className={activeTabClass('instructions')} onClick={() => setActiveTab('instructions')}>Instructions</div>
                    <div className={activeTabClass('nutrition')} onClick={() => setActiveTab('nutrition')}>Nutrition</div>
                    <div className={activeTabClass('reviews')} onClick={() => setActiveTab('reviews')}>Reviews ({reviews.length})</div>
                </div>

                {/* Tab Content */}
                {activeTab === 'instructions' && (
                    <div className="recipe-content-grid"> {/* Grid handled in CSS or just block */}
                        <div className="ingredients-section" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ color: '#2d3436', fontFamily: 'DM Serif Display', fontSize: '1.5rem', marginBottom: '1rem' }}>
                                Ingredients
                            </h2>
                            <div className="ingredients-grid">
                                {recipe.extendedIngredients ? recipe.extendedIngredients.map((ing, i) => (
                                    <div
                                        key={ing.id || i}
                                        className={`ingredient-card ${checkedIngredients.includes(i) ? 'checked' : ''}`}
                                        onClick={() => toggleIngredient(i)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className={`checkbox-circle ${checkedIngredients.includes(i) ? 'checked' : ''}`}>
                                            {checkedIngredients.includes(i) && <Check size={14} color="white" />}
                                        </div>
                                        <div className="ing-text">
                                            <span className="ingredient-name">{ing.name}</span>
                                            {/* <span className="ingredient-amount">{ing.amount} {ing.unit}</span> */}
                                        </div>
                                    </div>
                                )) : (
                                    recipe.ingredients?.map((ing, i) => (
                                        <div
                                            key={i}
                                            className={`ingredient-card ${checkedIngredients.includes(i) ? 'checked' : ''}`}
                                            onClick={() => toggleIngredient(i)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className={`checkbox-circle ${checkedIngredients.includes(i) ? 'checked' : ''}`}>
                                                {checkedIngredients.includes(i) && <Check size={14} color="white" />}
                                            </div>
                                            <div className="ing-text">
                                                <span className="ingredient-name">{ing.name}</span>
                                                {/* <span className="ingredient-amount">{ing.amount} {ing.unit}</span> */}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="instructions-section">
                            <h2 style={{ color: '#2d3436', fontFamily: 'DM Serif Display', fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span role="img" aria-label="chef">👩‍🍳</span> Cooking Steps
                            </h2>
                            {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
                                <div className="instruction-steps">
                                    {recipe.analyzedInstructions[0].steps.map((step, index) => (
                                        <div key={step.number} className="step-item">
                                            <div className="step-badge">{step.number}</div>
                                            <div className="step-content">
                                                <p className="step-text">{step.step}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: recipe.instructions?.replace(/\n/g, '<br />') || '<p>No instructions provided.</p>' }} style={{ lineHeight: '1.6' }} />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'nutrition' && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                        <p>Detailed nutrition facts would be displayed here.</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '2rem' }}>
                            <div className="rd-stat-item"><span className="rd-stat-value">22g</span><span className="rd-stat-label">Fat</span></div>
                            <div className="rd-stat-item"><span className="rd-stat-value">12g</span><span className="rd-stat-label">Carbs</span></div>
                            <div className="rd-stat-item"><span className="rd-stat-value">2g</span><span className="rd-stat-label">Sugar</span></div>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="reviews-section" style={{ marginTop: '0', background: 'transparent' }}>
                        {/* Reusing existing review logic but styled cleaner */}
                        <div className="reviews-list" style={{ marginBottom: '2rem' }}>
                            {reviews.length > 0 ? (
                                reviews.map(review => (
                                    <div key={review._id} style={{ borderBottom: '1px solid #eee', padding: '1.5rem 0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div className="rd-avatar" style={{ width: '35px', height: '35px', fontSize: '0.8rem' }}>{review.user?.name[0]}</div>
                                                <strong>{review.user?.name || 'User'}</strong>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', color: '#f1c40f' }}>
                                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="#f1c40f" />)}
                                            </div>
                                        </div>
                                        <p style={{ margin: '10px 0 0 45px', color: '#666', lineHeight: '1.6' }}>{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No reviews yet. Be the first!</p>
                            )}
                        </div>
                        {/* Review Form (Conditional) */}
                        {user && (
                            <form onSubmit={submitReview} style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '20px' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'DM Serif Display' }}>Write a Review</h3>
                                {reviewError && <p style={{ color: 'red', marginBottom: '10px' }}>{reviewError}</p>}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Rating</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={28} fill={star <= rating ? "#f1c40f" : "none"} color={star <= rating ? "#f1c40f" : "#ddd"} style={{ cursor: 'pointer' }} onClick={() => setRating(star)} />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', fontFamily: 'inherit' }} rows={3} required placeholder="Share your experience..." />
                                </div>
                                <button type="submit" disabled={submitting} className="primary-cta" style={{ background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '30px', padding: '12px 30px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {submitting ? 'Posting...' : <><Send size={18} /> Post Review</>}
                                </button>
                            </form>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default RecipeDetail;
