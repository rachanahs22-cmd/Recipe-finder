import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, ChefHat, User, Bookmark, Heart, Globe, Plus } from 'lucide-react';
import './navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="navbar">
            {/* Left: Brand */}
            <Link to="/" className="navbar-brand">
                <span style={{ background: '#FF7043', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <ChefHat size={20} />
                </span>
                RecipeVerse
            </Link>

            {/* Center: Navigation Links */}
            <div className="navbar-center">
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Discover</Link>
                <Link to="/feed" className={`nav-link ${isActive('/feed') ? 'active' : ''}`}>Social Feed</Link>
                {user && (
                    <Link to="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}>Favourites</Link>
                )}
            </div>

            {/* Right: Actions */}
            <div className="navbar-right">


                {user ? (
                    <>
                        <Link to="/add-recipe" className="btn-new-recipe">
                            <Plus size={16} /> New Recipe
                        </Link>

                        <div className="profile-container" ref={dropdownRef}>
                            <div className="profile-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                {user.name ? user.name[0].toUpperCase() : 'U'}
                            </div>

                            {dropdownOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <div className="user-email">{user.email || 'user@example.com'}</div>
                                    </div>

                                    <Link to="/my-recipes" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <ChefHat size={16} /> My Recipes
                                    </Link>
                                    <Link to="/favorites" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <Heart size={16} /> My Favorites
                                    </Link>
                                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <User size={16} /> My Profile
                                    </Link>

                                    <div className="dropdown-divider"></div>

                                    <button onClick={handleLogout} className="dropdown-item text-red">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="nav-btn-login">Login</Link>
                        <Link to="/register" className="nav-btn-register">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
