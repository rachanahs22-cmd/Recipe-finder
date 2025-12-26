const express = require('express');
const router = express.Router();
const { searchRecipesAI } = require('../controllers/aiController');

router.get('/search', searchRecipesAI);

module.exports = router;
