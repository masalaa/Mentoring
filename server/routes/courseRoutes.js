const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Mentor = require('../models/Mentor');

router.post('/', async (req, res) => {
    try {
        // Verify mentor exists
        const mentor = await mongoose.model('mentors').findById(req.body.mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Create course
        const courseData = {
            mentorId: mentor._id,
            mentor: {
                id: mentor._id,
                email: mentor.email,
                name: mentor.name
            },
            overview: req.body.overview,
            pricing: req.body.pricing,
            gallery: req.body.gallery,
            status: 'active'
        };

        const course = new mongoose.model('course')(courseData);
        const savedCourse = await course.save();

        // Update mentor's courses array
        await mentor.updateOne({ $push: { courses: savedCourse._id } });

        res.status(201).json(savedCourse);
    } catch (error) {
        console.error('Course creation error:', error);
        res.status(400).json({ message: error.message });
    }
});

router.get('/mentor/:mentorId', async (req, res) => {
    try {
        const courses = await Course.find({ mentorId: req.params.mentorId })
            .populate('mentorId', 'email name')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ... other routes ...

module.exports = router;