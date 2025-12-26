const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    favorites: [{
        recipeId: { type: String, required: true }, // Can be ObjectID or Spoonacular ID
        title: String,
        image: String,
        isCustom: { type: Boolean, default: false }
    }],
    cookingMode: {
        type: String,
        enum: ['beginner', 'expert'],
        default: 'beginner',
    },
    bio: {
        type: String,
        default: '',
    },
    profilePicture: {
        type: String,
        default: '',
    },
    dietaryPreferences: [String],
}, {
    timestamps: true,
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
