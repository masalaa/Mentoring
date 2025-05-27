// routes/courses.js
const express  = require('express');
const mongoose = require('mongoose');
const router   = express.Router();

const Course  = require('../models/Course');
const Mentor  = require('../models/Mentor');

// POST   /api/courses
router.post('/', async (req, res) => {
  try {
    // 1) Verify mentor exists
    const mentor = await Mentor.findById(req.body.mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // 2) Create course document
    const courseData = {
      mentorId: mentor._id,
      mentor: {
        id:    mentor._id,
        email: mentor.email,
        name:  mentor.name
      },
      overview: req.body.overview,
      pricing:  req.body.pricing,
      gallery:  req.body.gallery,
      status:   'active'
    };

    const course = new Course(courseData);
    const savedCourse = await course.save();

    // 3) Push course reference into mentor.courses[]
    mentor.courses = mentor.courses || [];
    mentor.courses.push(savedCourse._id);
    await mentor.save();

    res.status(201).json(savedCourse);

  } catch (error) {
    console.error('Course creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET    /api/courses/mentor/:mentorId
router.get('/mentor/:mentorId', async (req, res) => {
  try {
    const courses = await Course.find({ mentorId: req.params.mentorId })
      .populate('mentorId', 'email name')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
