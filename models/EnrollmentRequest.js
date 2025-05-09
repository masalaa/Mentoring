const mongoose = require('mongoose');

const enrollmentRequestSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mentees',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mentors',
        required: true
    },
    plan: {
        type: String,
        required: true,
        enum: ['basic', 'normal', 'premium']
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EnrollmentRequest', enrollmentRequestSchema);