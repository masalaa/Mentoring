const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    mentor: {
        id: mongoose.Schema.Types.ObjectId,
        name: String,
        email: String
    },
    title: String,
    category: String,
    description: String,
    pricing: {
        basic: { days: Number, price: Number },
        normal: { days: Number, price: Number },
        premium: { days: Number, price: Number }
    },
    image: String,
    status: { type: String, default: 'inactive' }
});

module.exports = mongoose.model('Course', courseSchema);
