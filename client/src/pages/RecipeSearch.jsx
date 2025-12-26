import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { searchRecipes } from '../api/recipeApi';
import RecipeCard from '../components/RecipeCard';
import VoiceSearch from '../components/VoiceSearch';

const RecipeSearch = () => {
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial load
    useEffect(() => {
        handleSearch(null, 'pasta'); // Default search
    }, []);

    const handleSearch = async (e, initialQuery = null) => {
        if (e) e.preventDefault();
        const q = initialQuery || query;
        if (!q) return;

        // If it came from voice (initialQuery), update the input state too
        if (initialQuery) setQuery(initialQuery);

        setLoading(true);
        try {
            const data = await searchRecipes(q);
            setRecipes(data.results);
        } catch (error) {
            console.error("Failed to search", error);
        }
        setLoading(false);
    };

    return (
        <div className="search-page">
            <form onSubmit={handleSearch} className="search-bar">
                <input
                    type="text"
                    placeholder="Search for recipes (e.g., 'pasta', 'chicken')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit"><Search /></button>
                <VoiceSearch onSearch={(text) => handleSearch(null, text)} />
            </form>

            {loading ? <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading tasty recipes...</p> : (
                <>
                    {recipes.length > 0 ? (
                        <div className="recipe-grid">
                            {recipes.map(recipe => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>
                            <p>No recipes found or API limit reached. Try a different search!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RecipeSearch;
