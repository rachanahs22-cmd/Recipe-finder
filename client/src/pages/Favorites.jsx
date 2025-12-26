import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import FeedCard from '../components/FeedCard';
import { Bookmark, Loader } from 'lucide-react';

const Favorites = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get('/users/favorites');
                // Map DB structure to FeedCard expected structure
                // DB stores: { recipeId, title, image, isCustom }
                // FeedCard expects: { id, title, image, ... }
                const formatted = data.map(f => ({
                    id: f.recipeId,
                    title: f.title,
                    image: f.image,
                    isCustom: f.isCustom,
                    // Add dummy data for visuals if missing from DB
                    readyInMinutes: 30,
                    servings: 2
                }));
                setFavorites(formatted);
            } catch (error) {
                console.error("Error fetching favorites", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    if (loading) return <div className="feed-loader"><Loader size={30} className="spin" color="#ff6b6b" /></div>;

    if (!user) return <div className="no-results">Please login to view favorites.</div>;

    return (
        <div className="feed-bg" style={{ minHeight: '90vh', padding: '2rem 0' }}>
            <div className="feed-container">
                <div style={{
                    marginBottom: '2rem',
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#2d3436' }}>
                        <Bookmark fill="#ff6b6b" color="#ff6b6b" /> Your Collection
                    </h1>
                    <p style={{ color: '#636e72' }}>You have {favorites.length} saved recipes.</p>
                </div>

                <div className="social-feed">
                    {favorites.length === 0 ? (
                        <div className="no-results"></div>
                    ) : (
                        favorites.map((recipe, index) => (
                            <FeedCard key={index} recipe={recipe} hideSaveButton={true} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Favorites;
