const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'Mentoring'
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

const User = require('./models/User');

// Signup route
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: `User with email ${email} already exists` 
            });
        }

        // Create new user using the User model
        const user = new User({
            name,
            email,
            password
        });

        await user.save();
        console.log('User saved:', user);
        res.status(201).json({ 
            success: true,
            message: `Welcome ${name}! Your account has been created successfully`,
            user: {
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating user', 
            error: error.message 
        });
    }
});

// Signin route
app.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user using the User model instead of direct collection access
        const user = await User.findOne({ email: email });
        
        // First check if user exists
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'User not found with this email' 
            });
        }

        // Then check password
        if (user.password !== password) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid password' 
            });
        }

        // If both email and password match
        res.json({
            success: true,
            message: `Welcome back ${user.name}!`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error signing in', 
            error: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});