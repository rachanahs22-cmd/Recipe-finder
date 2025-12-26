const User = require('../models/User');

// @desc    Add or Remove recipe from favorites
// @route   PUT /api/users/favorites
// @access  Private
const toggleFavorite = async (req, res) => {
    try {
        const { recipeId, title, image, isCustom } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFavorited = user.favorites.find(fav => fav.recipeId.toString() === recipeId.toString());

        if (isFavorited) {
            // Remove
            user.favorites = user.favorites.filter(fav => fav.recipeId.toString() !== recipeId.toString());
        } else {
            // Add
            user.favorites.push({ recipeId, title, image, isCustom });
        }

        await user.save();

        // Return updated favorites
        res.json(user.favorites);
    } catch (error) {
        console.error('Error in toggleFavorite:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update User Profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.bio = req.body.bio || user.bio;
            user.profilePicture = req.body.profilePicture || user.profilePicture;
            user.dietaryPreferences = req.body.dietaryPreferences || user.dietaryPreferences;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                cookingMode: updatedUser.cookingMode,
                favorites: updatedUser.favorites,
                bio: updatedUser.bio,
                profilePicture: updatedUser.profilePicture,
                dietaryPreferences: updatedUser.dietaryPreferences,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(400).json({ message: error.message || 'Invalid user data' });
    }
};

module.exports = { toggleFavorite, getFavorites, updateUserProfile };
