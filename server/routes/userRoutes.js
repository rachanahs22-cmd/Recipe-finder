const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/favorites')
    .get(protect, getFavorites)
    .put(protect, toggleFavorite);

router.route('/profile')
    .put(protect, updateUserProfile);

module.exports = router;
