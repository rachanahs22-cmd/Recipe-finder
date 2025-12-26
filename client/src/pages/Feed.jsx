import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import FeedCard from '../components/FeedCard';
import { searchRecipes, getRecipeAIAnalysis } from '../api/recipeApi';
import { Loader, Search, Sparkles } from 'lucide-react';

const Feed = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('query') || '';

    const [feedRecipes, setFeedRecipes] = useState([]);
    const [query, setQuery] = useState(initialQuery);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [aiInsight, setAiInsight] = useState(null); // State for AI Data
    const observer = useRef();

    // Reset and load when query changes via URL or manual input submission
    useEffect(() => {
        setFeedRecipes([]);
        setPage(0);
        setHasMore(true);
        setAiInsight(null); // Reset AI insight
        loadMoreRecipes(0, query); // Load first page immediately
    }, [query]);

    // Separate function to fetch data
    // Separate function to fetch data
    const loadMoreRecipes = async (pageNum, searchQuery) => {
        if (loading) return;
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Artificial delay for nice UX

            let aiResults = null;
            // AI Analysis on first page load of a search
            if (pageNum === 0 && searchQuery && searchQuery.trim().length > 3) {
                try {
                    const data = await getRecipeAIAnalysis(searchQuery);
                    if (data && data.success) {
                        setAiInsight(data.interpretation);
                        if (data.results && data.results.length > 0) {
                            aiResults = data.results;
                        }
                    }
                } catch (e) {
                    console.log("AI fetch failed, falling back", e);
                }
            }

            if (aiResults) {
                setFeedRecipes(aiResults);
                setHasMore(false); // Assume AI handled pagination or returned best matches
            } else {
                // Fallback to Standard
                const result = await searchRecipes(searchQuery, { offset: pageNum * 10 });
                const newRecipes = result.results || [];

                if (newRecipes.length === 0) {
                    setHasMore(false);
                } else {
                    setFeedRecipes(prev => pageNum === 0 ? newRecipes : [...prev, ...newRecipes]);
                    setPage(prev => pageNum + 1);
                }
            }
        } catch (error) {
            console.error("Feed load error", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger load more via scroll
    const handleScrollLoad = () => {
        if (!loading && hasMore) {
            loadMoreRecipes(page, query);
        }
    }

    const lastRecipeElementRef = (node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                handleScrollLoad();
            }
        });
        if (node) observer.current.observe(node);
    };

    const handleManualSearch = (e) => {
        e.preventDefault();
        // Update URL to reflect search
        if (query) {
            setSearchParams({ query });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className="home-page feed-bg">
            <div className="feed-container">
                <form onSubmit={handleManualSearch} className="feed-search-bar">
                    <Search size={18} color="#888" style={{ marginLeft: '15px' }} />
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </form>



                {/* AI Insight Card */}
                {aiInsight && (
                    <div className="ai-insight-card fade-in" style={{
                        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        marginBottom: '2rem',
                        border: '1px solid #eee',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <Sparkles size={20} color="#9C27B0" fill="#9C27B0" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2d3436' }}>AI Smart Search Analysis</h3>
                        </div>
                        <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                            We understood you're looking for a <strong>{aiInsight.type || 'Meal'}</strong>
                            {aiInsight.diet && <span> that is <strong>{aiInsight.diet}</strong></span>}
                            {aiInsight.cuisine && <span> with <strong>{aiInsight.cuisine}</strong> flair</span>}.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {aiInsight.maxTime && <span className="rd-tag outline">⏱️ Max {aiInsight.maxTime}m</span>}
                            {aiInsight.minProtein > 0 && <span className="rd-tag outline">💪 High Protein</span>}
                            {aiInsight.keywords.map(k => <span key={k} className="rd-tag yellow">{k}</span>)}
                        </div>
                        {aiInsight.mood && <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#888', fontSize: '0.9rem' }}>✨ {aiInsight.mood}</p>}
                    </div>
                )}

                <div className="social-feed">
                    {feedRecipes.length === 0 && !loading && (
                        <div className="no-results">No recipes found. Try searching for 'pizza' or 'sushi'.</div>
                    )}

                    {feedRecipes.map((recipe, index) => {
                        if (feedRecipes.length === index + 1) {
                            return (
                                <div ref={lastRecipeElementRef} key={`${recipe.id}-${index}`}>
                                    <FeedCard recipe={recipe} />
                                </div>
                            );
                        } else {
                            return <FeedCard key={`${recipe.id}-${index}`} recipe={recipe} />;
                        }
                    })}
                </div>

                {loading && (
                    <div className="feed-loader">
                        <Loader className="spin" size={28} color="#888" />
                    </div>
                )}

                {!hasMore && feedRecipes.length > 0 && (
                    <div className="end-of-feed">
                        <p>You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
