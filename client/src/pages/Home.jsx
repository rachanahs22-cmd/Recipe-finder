import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Utensils, Coffee, Pizza, ArrowRight, Clock, Dumbbell, Sprout, Flame } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/feed?query=${encodeURIComponent(query)}`);
        } else {
            navigate('/feed');
        }
    };

    const handleStart = () => {
        navigate('/feed');
    };

    return (
        <div className="landing-page">
            <div className="landing-content">
                <div className="landing-hero">
                    <div className="waving-icons">
                        <span className="wave-icon" style={{ animationDelay: '0s' }}>🍳</span>
                        <span className="wave-icon" style={{ animationDelay: '0.2s' }}>🥗</span>
                        <span className="wave-icon" style={{ animationDelay: '0.4s' }}>🍜</span>
                        <span className="wave-icon" style={{ animationDelay: '0.6s' }}>🥘</span>
                    </div>

                    <h1 className="landing-title">
                        Discover Your Next <br />
                        <span className="highlight">Favorite Recipe</span>
                    </h1>
                    <p className="landing-subtitle">
                        AI-powered recipe discovery tailored to your taste, fitness goals, and
                        cooking skills. Join our community of food lovers! 🍽️
                    </p>

                    {/* Functional Search Bar */}
                    <form onSubmit={handleSearch} className="landing-search-mock search-form">
                        <Search size={22} color="#ff6b6b" />
                        <input
                            type="text"
                            placeholder="What are you craving today? Try 'sweet and spicy high protein'..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="landing-search-input"
                            autoFocus
                        />
                        <button type="submit" className="search-btn-home">
                            <Utensils size={18} /> Search
                        </button>
                    </form>

                    <div className="quick-tags">
                        {['Spicy', 'Sweet', 'High Protein', 'Quick 10 min', 'Healthy'].map(tag => (
                            <span key={tag} className="quick-tag" onClick={() => navigate(`/feed?query=${tag}`)}>
                                {tag === 'Spicy' ? '🌶️' : tag === 'Sweet' ? '🧁' : tag === 'Healthy' ? '🥗' : tag.includes('Protein') ? '🏋️' : '⏱️'} {tag}
                            </span>
                        ))}
                    </div>

                    <div className="preview-banner">
                        <div className="preview-banner-content">
                            <div className="banner-badges">
                                <div className="banner-badge">✨ AI-Powered Search</div>
                                <div className="banner-badge">📈 10K+ Recipes</div>
                                <div className="banner-badge">❤️ 50K+ Community</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mood Section */}
                <div className="mood-section">
                    <h2 className="mood-title">What's Your Mood? ✨</h2>
                    <div className="mood-grid">
                        <div className="mood-card" onClick={() => navigate('/feed?query=quick')}>
                            <div className="mood-icon mock-icon" style={{ color: '#00695c' }}>
                                <Clock size={40} />
                            </div>
                            <h3>Quick & Easy</h3>
                            <p>Under 15 min</p>
                        </div>
                        <div className="mood-card" onClick={() => navigate('/feed?query=high protein')}>
                            <div className="mood-icon mock-icon" style={{ color: '#827717' }}>
                                <Dumbbell size={40} />
                            </div>
                            <h3>Gym Fuel</h3>
                            <p>High Protein</p>
                        </div>
                        <div className="mood-card" onClick={() => navigate('/feed?query=vegan')}>
                            <div className="mood-icon mock-icon" style={{ color: '#004d40' }}>
                                <Sprout size={40} />
                            </div>
                            <h3>Plant Based</h3>
                            <p>Vegan Delights</p>
                        </div>
                        <div className="mood-card" onClick={() => navigate('/feed?query=spicy')}>
                            <div className="mood-icon mock-icon" style={{ color: '#d84315' }}>
                                <Flame size={40} />
                            </div>
                            <h3>Spicy Kick</h3>
                            <p>Turn Up Heat</p>
                        </div>
                    </div>
                </div>

                {/* CTA Footer */}
                <div className="cta-section">
                    <div className="cta-content">
                        <h2>Ready to Start Your Culinary Journey? 🚀</h2>
                        <p>Join thousands of food enthusiasts sharing recipes, tips, and inspiration. Create your profile and get personalized recommendations!</p>
                        <div className="cta-buttons">
                            <button className="cta-btn primary" onClick={() => navigate('/register')}>Get Started Free ✨</button>
                            <button className="cta-btn secondary" onClick={() => navigate('/feed')}>Browse Recipes</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="landing-visuals">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>
        </div>
    );
};

export default Home;
