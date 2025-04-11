const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['mentor', 'student'],
        required: true
    },
    token: {
        type: String
    },
    // Simplified courses array to store references
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    credibility: {
        type: Number,
        default: 0
    }
});

// Add index for better query performance
userSchema.index({ email: 1 });

module.exports = mongoose.model('Users', userSchema, 'Users');