const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: String,
    enrollments: [{
        userId: String,
        enrollmentDate: Date
    }]
});

module.exports = mongoose.model('Course', courseSchema);