import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import api from '../api/axios';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyRecipes = async () => {
            try {
                const { data } = await api.get('/recipes/myrecipes');
                setRecipes(data);
            } catch (error) {
                console.error("Failed to fetch my recipes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyRecipes();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/recipes/${id}`);
            // Remove from state immediately
            setRecipes(recipes.filter(r => r._id !== id));
        } catch (error) {
            console.error("Failed to delete recipe", error);
            alert("Failed to delete recipe");
        }
    };

    return (
        <div className="favorites-page"> {/* Reusing favorites page styling for consistency */}
            <h1>My Recipes</h1>

            {loading ? (
                <p>Loading your culinary creations...</p>
            ) : (
                <>
                    {recipes.length > 0 ? (
                        <div className="favorites-grid">
                            {recipes.map(recipe => (
                                <RecipeCard
                                    key={recipe._id}
                                    recipe={{ ...recipe, id: recipe._id, onDelete: handleDelete }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>You haven't added any recipes yet. Your submitted recipes will appear here.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyRecipes;
