const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Check specific user
    const users = await User.find({}, 'name _id');
    console.log('--- USERS ---');
    users.forEach(u => console.log(`${u.name}: ${u._id}`));

    const recipes = await Recipe.find({}, 'title user');
    console.log('--- RECIPES ---');
    recipes.forEach(r => console.log(`${r.title}: ${r.user}`));

    process.exit();
};
run();
