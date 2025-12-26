const express = require('express');
const router = express.Router();
const { createRecipe, getRecipes, getRecipeById, getMyRecipes } = require('../controllers/recipeController');
const { likeRecipe, addReview, getReviews } = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getRecipes)
    .post(protect, createRecipe);

router.route('/myrecipes')
    .get(protect, getMyRecipes);

router.route('/:id')
    .get(getRecipeById)
    .delete(protect, require('../controllers/recipeController').deleteRecipe);

router.route('/:id/like').put(protect, likeRecipe);
router.route('/:id/reviews')
    .post(protect, addReview)
    .get(getReviews);

router.route('/debug/dump').get(require('../controllers/recipeController').debugDump);

module.exports = router;
