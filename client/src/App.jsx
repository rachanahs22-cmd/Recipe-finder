import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeSearch from './pages/RecipeSearch';
import RecipeDetail from './pages/RecipeDetail';
import MyRecipes from './pages/MyRecipes';
import AddRecipe from './pages/AddRecipe';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/search" element={<RecipeSearch />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/my-recipes" element={<MyRecipes />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-recipe" element={<AddRecipe />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
