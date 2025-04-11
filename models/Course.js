const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mentors',
        required: true
    },
    mentor: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'mentors'
        },
        email: String,
        name: String
    },
    overview: {
        title: String,
        category: String,
        description: String
    },
    pricing: {
        basic: {
            days: Number,
            price: Number
        },
        normal: {
            days: Number,
            price: Number
        },
        premium: {
            days: Number,
            price: Number
        }
    },
    gallery: {
        image: String
    },
    status: {
        type: String,
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('course', courseSchema);  // Changed to 'course'