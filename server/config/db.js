const mongoose = require('mongoose');

// This function handles the connection to the MongoDB database
const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI from environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
