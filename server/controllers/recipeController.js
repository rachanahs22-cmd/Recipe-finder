const Recipe = require('../models/Recipe');
const User = require('../models/User');

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
    try {
        const { title, image, ingredients, instructions, readyInMinutes, servings, calories, protein } = req.body;

        const recipe = new Recipe({
            user: req.user._id,
            title,
            image,
            ingredients, // Expecting array of objects { name, amount, unit }
            instructions,
            readyInMinutes,
            servings,
            calories,
            protein,
        });

        const createdRecipe = await recipe.save();
        res.status(201).json(createdRecipe);
    } catch (error) {
        res.status(400).json({ message: 'Invalid recipe data', error: error.message });
    }
};

// @desc    Get all recipes (or filter/search)
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            // Use MongoDB Text Search if keyword string provided
            query = { $text: { $search: search } };
        }

        // If search exists, sort by text score relevance, else by date
        let recipes;
        if (search) {
            recipes = await Recipe.find(query, { score: { $meta: "textScore" } })
                .sort({ score: { $meta: "textScore" } })
                .populate('user', 'name');
        } else {
            recipes = await Recipe.find(query)
                .sort({ createdAt: -1 })
                .populate('user', 'name');
        }

        res.json(recipes);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('user', 'name').populate('reviews');

        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Recipe not found' });
    }
};

// @desc    Get logged in user's recipes
// @route   GET /api/recipes/myrecipes
// @access  Private
const getMyRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check user ownership
        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await recipe.deleteOne();
        res.json({ message: 'Recipe removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createRecipe,
    getRecipes,
    getRecipeById,
    getMyRecipes,
    deleteRecipe,
};

// TEMPORARY DEBUG
const debugDump = async (req, res) => {
    const users = await User.find({}, 'name email _id');
    const recipes = await Recipe.find({}, 'title user');
    res.json({ users, recipes });
};
module.exports.debugDump = debugDump;
