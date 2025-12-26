const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkRecipes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find user Vinutha (or closely matching)
        const users = await User.find({});
        console.log('Users found:', users.map(u => ({ id: u._id, name: u.name, email: u.email })));

        const recipes = await Recipe.find({});
        console.log('Total Recipes found:', recipes.length);

        recipes.forEach(r => {
            console.log(`RECIPE_FOUND: "${r.title}" (User: ${r.user})`);
        });

        users.forEach(u => {
            console.log(`USER_FOUND: Name: ${u.name}, ID: ${u._id}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkRecipes();
