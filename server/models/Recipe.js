const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    ingredients: [{
        name: String,
        amount: Number,
        unit: String
    }],
    instructions: {
        type: String,
        required: true,
    },
    readyInMinutes: {
        type: Number,
    },
    servings: {
        type: Number,
    },
    calories: {
        type: Number,
    },
    protein: {
        type: String,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    }],
}, {
    timestamps: true,
});

// Add text index for smart search capability
recipeSchema.index({ title: 'text', ingredients: 'text', instructions: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
