const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Like a recipe
// @route   PUT /api/recipes/:id/like
// @access  Private
const likeRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if recipe has already been liked
        const uId = req.user._id;
        if (recipe.likes.includes(uId)) {
            // Unlike
            recipe.likes = recipe.likes.filter(id => id.toString() !== uId.toString());
        } else {
            // Like
            recipe.likes.push(uId);
        }

        await recipe.save();
        res.json(recipe.likes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reviews for a recipe
// @route   GET /api/recipes/:id/reviews
// @access  Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ recipe: req.params.id })
            .populate('user', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a review
// @route   POST /api/recipes/:id/reviews
// @access  Private
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const recipeId = req.params.id;

        // Check if user already reviewed
        const alreadyReviewed = await Review.findOne({
            user: req.user._id,
            recipe: recipeId
        });

        if (alreadyReviewed) {
            console.log('DEBUG: Already reviewed');
            return res.status(400).json({ message: 'Product already reviewed' });
        }

        console.log('DEBUG: Creating review...');
        const review = await Review.create({
            user: req.user._id,
            recipe: recipeId,
            rating: Number(rating),
            comment,
        });

        console.log('DEBUG: Review created:', review);

        res.status(201).json(review);
    } catch (error) {
        console.error('DEBUG: Error in addReview:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { likeRecipe, addReview, getReviews };
