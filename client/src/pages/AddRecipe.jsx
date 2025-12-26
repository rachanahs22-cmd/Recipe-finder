import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AddRecipe = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        image: '',
        instructions: '',
        readyInMinutes: '',
        servings: '',
    });
    const [ingredients, setIngredients] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Parse ingredients string into array
        const ingredientsArray = ingredients.split('\n').map(item => {
            const parts = item.trim().split(' ');
            return {
                name: item,
                amount: 1, // simplified parsing
                unit: 'serving'
            };
        });

        try {
            await api.post('/recipes', {
                ...formData,
                ingredients: ingredientsArray,
                calories: 0, // Placeholder
                protein: '0g' // Placeholder
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add recipe');
        }
        setLoading(false);
    };

    return (
        <div className="add-recipe-page" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>Add Your Recipe</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label>Recipe Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                    <label>Image URL</label>
                    <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label>Ready In (Min)</label>
                        <input type="number" name="readyInMinutes" value={formData.readyInMinutes} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label>Servings</label>
                        <input type="number" name="servings" value={formData.servings} onChange={handleChange} required style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                    </div>
                </div>
                <div>
                    <label>Ingredients (one per line)</label>
                    <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows="5" placeholder="1 cup Flour&#10;2 Eggs" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}></textarea>
                </div>
                <div>
                    <label>Instructions</label>
                    <textarea name="instructions" value={formData.instructions} onChange={handleChange} rows="5" required style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}></textarea>
                </div>
                <button type="submit" disabled={loading} style={{ padding: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Publishing...' : 'Publish Recipe'}
                </button>
            </form>
        </div>
    );
};

export default AddRecipe;
