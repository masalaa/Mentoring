const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
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
    token: String,
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'  // Changed from 'courses' to 'course'
    }],
    credibility: {
        type: Number,
        default: 0
    }
});

mentorSchema.index({ email: 1 });

module.exports = mongoose.model('mentors', mentorSchema);