const Course = require('../models/Course');
const Mentor = require('../models/Mentor');
const mongoose = require('mongoose'); // Add this import

async function createCourse(req, res) {
    try {
        const { mentorId, courseData } = req.body;

        // Log incoming data
        console.log('Received course data:', JSON.stringify(courseData, null, 2));

        // Detailed validation of mentorId
        if (!mongoose.Types.ObjectId.isValid(mentorId)) {
            console.error('Invalid mentorId format:', mentorId);
            return res.status(400).json({
                success: false,
                message: 'Invalid mentor ID format'
            });
        }

        // Find mentor with explicit error handling
        const mentor = await Mentor.findById(mentorId).exec();
        console.log('Found mentor:', mentor ? 'Yes' : 'No');

        if (!mentor) {
            console.error('Mentor not found for ID:', mentorId);
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Prepare course data with proper type casting and validation
        const preparedCourse = {
            courseId: new mongoose.Types.ObjectId().toString(),
            overview: {
                title: String(courseData.overview.title).trim(),
                category: String(courseData.overview.category),
                description: String(courseData.overview.description).trim(),
                tags: Array.isArray(courseData.overview.tags) ? courseData.overview.tags : []
            },
            pricing: {
                basic: {
                    days: parseInt(courseData.pricing.basic.days),
                    price: parseFloat(courseData.pricing.basic.price)
                },
                normal: {
                    days: parseInt(courseData.pricing.normal.days),
                    price: parseFloat(courseData.pricing.normal.price)
                },
                premium: {
                    days: parseInt(courseData.pricing.premium.days),
                    price: parseFloat(courseData.pricing.premium.price)
                }
            },
            gallery: {
                image: String(courseData.gallery.image)
            },
            status: courseData.status || 'draft',
            createdAt: new Date()
        };

        console.log('Prepared course data:', JSON.stringify(preparedCourse, null, 2));

        // Use updateOne for atomic operation
        const result = await Mentor.updateOne(
            { _id: mentorId },
            { $push: { courses: preparedCourse } }
        );

        console.log('Update result:', result);

        if (result.modifiedCount === 0) {
            throw new Error('Failed to save course');
        }

        // Fetch updated mentor to get the saved course
        const updatedMentor = await Mentor.findById(mentorId);
        const savedCourse = updatedMentor.courses[updatedMentor.courses.length - 1];

        res.json({
            success: true,
            course: savedCourse
        });

    } catch (error) {
        console.error('Course creation error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Error saving course',
            error: {
                message: error.message,
                type: error.name,
                details: error.errors || {}
            }
        });
    }
}

// Enhanced validation function
function validateCourseData(courseData) {
    try {
        // Validate overview
        if (!courseData?.overview?.title?.trim() || 
            !courseData?.overview?.category?.trim() || 
            !courseData?.overview?.description?.trim()) {
            return { 
                valid: false, 
                error: 'Missing required overview fields' 
            };
        }

        // Validate pricing structure
        if (!courseData?.pricing?.basic?.days || 
            !courseData?.pricing?.normal?.days || 
            !courseData?.pricing?.premium?.days ||
            !courseData?.pricing?.basic?.price || 
            !courseData?.pricing?.normal?.price || 
            !courseData?.pricing?.premium?.price) {
            return { 
                valid: false, 
                error: 'Missing required pricing fields' 
            };
        }

        // Validate numeric values
        const prices = [
            courseData.pricing.basic.price,
            courseData.pricing.normal.price,
            courseData.pricing.premium.price
        ];

        const days = [
            courseData.pricing.basic.days,
            courseData.pricing.normal.days,
            courseData.pricing.premium.days
        ];

        if (prices.some(price => isNaN(Number(price)) || Number(price) < 0)) {
            return { 
                valid: false, 
                error: 'Invalid price values' 
            };
        }

        if (days.some(day => !Number.isInteger(Number(day)) || Number(day) < 1)) {
            return { 
                valid: false, 
                error: 'Invalid days values' 
            };
        }

        // Validate gallery
        if (!courseData?.gallery?.image?.trim()) {
            return { 
                valid: false, 
                error: 'Course image is required' 
            };
        }

        return { valid: true };
    } catch (error) {
        return { 
            valid: false, 
            error: 'Invalid course data structure' 
        };
    }
}

// Get mentor's courses with additional error handling
async function getMentorCourses(req, res) {
    try {
        const { mentorId } = req.params;

        const mentor = await Mentor.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Sort courses by creation date
        const courses = mentor.courses.sort((a, b) => 
            b.createdAt - a.createdAt
        );

        res.json({
            success: true,
            courses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching courses'
        });
    }
}