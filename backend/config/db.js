const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 30000, // Increased timeout
            socketTimeoutMS: 45000,
            keepAlive: true,
            ssl: true,
            tlsAllowInvalidCertificates: false
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Log more detailed error information
        if (error.reason) {
            console.error('Connection details:', error.reason);
        }
        throw error;
    }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = connectDB;