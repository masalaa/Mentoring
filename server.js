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
    // Verify collection name
    console.log('Available collections:', mongoose.connection.collections);
})
.catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');

// Add these lines at the top with other requires
const Mentor = require('./models/Mentor');
const Mentee = require('./models/Mentee');

// Add this function to check email uniqueness across both collections
async function isEmailUnique(email) {
    const mentor = await Mentor.findOne({ email });
    const mentee = await Mentee.findOne({ email });
    return !mentor && !mentee;
}

// Update signup route
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, role, expertise } = req.body;
        
        // Check email uniqueness across both collections
        const isUnique = await isEmailUnique(email);
        if (!isUnique) {
            return res.status(400).json({ 
                success: false,
                message: `User with email ${email} already exists` 
            });
        }

        let user;
        if (role === 'mentor') {
            user = new Mentor({
                name,
                email,
                password,
                expertise,
                courses: []
            });
        } else {
            user = new Mentee({
                name,
                email,
                password,
                enrolledCourses: []
            });
        }

        await user.save();
        res.status(201).json({ 
            success: true,
            message: `Welcome ${name}! Your account has been created successfully`,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: role,
                ...(role === 'mentor' ? { expertise } : {})
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

// Update publish course route
app.post('/api/publish-course', async (req, res) => {
    try {
        const { mentorId, courseData } = req.body;
        const mentor = await Mentor.findById(mentorId);

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Create new course with proper structure
        const newCourse = new Course({
            mentorId: mentorId,
            mentor: {
                id: mentorId,
                email: mentor.email,
                name: mentor.name
            },
            overview: courseData.overview,
            pricing: courseData.pricing,
            gallery: courseData.gallery,
            status: 'active'
        });

        // Save to course collection
        const savedCourse = await newCourse.save();

        // Update mentor's courses array
        await Mentor.findByIdAndUpdate(
            mentorId,
            { $push: { courses: savedCourse._id } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Course published successfully',
            courseId: savedCourse._id
        });

    } catch (error) {
        console.error('Error publishing course:', error);
        res.status(500).json({
            success: false,
            message: 'There was an error saving your course. Please try again.',
            error: error.message
        });
    }
});

// Signin route
app.post('/api/signin', async (req, res) => {
    try {
        const { email, password, selectedRole } = req.body;  // Get selectedRole from login form
        console.log('Login attempt:', { email, selectedRole });

        let user;
        let role;

        // Check based on selected role
        if (selectedRole === 'mentor') {
            user = await Mentor.findOne({ email });
            role = 'mentor';
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'No mentor account found with this email'
                });
            }
        } else {
            user = await Mentee.findOne({ email });
            role = 'mentee';
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'No mentee account found with this email'
                });
            }
        }

        if (user.password !== password) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid password' 
            });
        }

        // Send response with redirect URL based on role
        res.json({
            success: true,
            message: `Welcome back ${user.name}!`,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: role,
                courses: role === 'mentor' ? (user.courses || []) : (user.enrolledCourses || []),
                ...(role === 'mentor' ? { expertise: user.expertise } : {}),
                redirectUrl: role === 'mentor' ? '/business.html' : '/index.html'
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

// Publish course route
app.post('/api/publish-course', async (req, res) => {
    try {
        const { userId, courseData } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!Array.isArray(user.courses)) {
            user.courses = [];
        }
        
        user.courses.push(courseData);
        await user.save();

        res.json({
            success: true,
            message: 'Course published successfully',
            course: courseData
        });

    } catch (error) {
        console.error('Error publishing course:', error);
        res.status(500).json({
            success: false,
            message: 'Error publishing course',
            error: error.message
        });
    }
});

// Add this new route to check authentication
// Update check-auth route
app.get('/api/check-auth', async (req, res) => {
    try {
        const userId = req.headers.authorization;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token found'
            });
        }

        // Check in Mentor collection first
        let user = await Mentor.findById(userId);
        let role = 'mentor';

        // If not found in Mentor collection, check Mentee collection
        if (!user) {
            user = await Mentee.findById(userId);
            role = 'mentee';
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: role,
                courses: role === 'mentor' ? (user.courses || []) : (user.enrolledCourses || []),
                ...(role === 'mentor' ? { expertise: user.expertise } : {})
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking authentication'
        });
    }
});

// Add these new routes after existing routes

// Search public courses
app.get('/api/courses/search', async (req, res) => {
    try {
        const { query } = req.query;
        const searchRegex = new RegExp(query, 'i');

        const users = await User.find({ role: 'mentor' });
        let allCourses = [];

        users.forEach(user => {
            const userCourses = (user.courses || []).map(course => ({
                ...course.toObject(),
                mentor: {
                    name: user.name,
                    email: user.email,
                    expertise: user.expertise
                }
            }));
            allCourses = [...allCourses, ...userCourses];
        });

        const filteredCourses = allCourses.filter(course => 
            course.overview.title.match(searchRegex) ||
            course.overview.description.match(searchRegex) ||
            course.overview.tags?.some(tag => tag.match(searchRegex))
        );

        res.json({
            success: true,
            courses: filteredCourses
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching courses'
        });
    }
});

// Get chat messages
app.get('/api/chat/:courseId/:mentorId', async (req, res) => {
    try {
        const { courseId, mentorId } = req.params;
        const userId = req.headers.authorization;

        const messages = await Message.find({
            courseId,
            $or: [
                { senderId: userId, receiverId: mentorId },
                { senderId: mentorId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chat messages'
        });
    }
});

// Send message
app.post('/api/chat/send', async (req, res) => {
    try {
        const { receiverId, courseId, message } = req.body;
        const senderId = req.headers.authorization;

        const newMessage = new Message({
            senderId,
            receiverId,
            courseId,
            message
        });

        await newMessage.save();

        res.json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error('Message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
});

// Update Course Schema and model name
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

const Course = mongoose.model('courses', courseSchema);  // Changed to 'courses' to match collection name

// Remove this line since Course is already defined above
// const Course = require('./models/Course');

// Update the sample data route
app.post('/api/add-sample-data', async (req, res) => {
    try {
        // Clear existing data first (optional)
        await Mentor.deleteMany({});
        await Course.deleteMany({});

        const sampleData = [
            {
                mentor: {
                    name: "Dr. Sarah Johnson",
                    email: "sarah.johnson@example.com",
                    password: "password123",
                    expertise: "Web Development",
                    courses: [] // Initialize empty courses array
                },
                course: {
                    overview: {
                        title: "Advanced Web Development",
                        category: "Programming",
                        description: "Master modern web technologies and frameworks"
                    },
                    pricing: {
                        basic: { days: 30, price: 49.99 },
                        normal: { days: 60, price: 89.99 },
                        premium: { days: 90, price: 149.99 }
                    },
                    gallery: { image: "https://example.com/webdev.jpg" },
                    status: 'active'
                }
            },  // Added missing comma here
            {
                mentor: {
                    name: "Prof. Michael Chen",
                    email: "michael.chen@example.com",
                    password: "password123",
                    expertise: "Data Science"
                },
                course: {
                    overview: {
                        title: "Data Science Fundamentals",
                        category: "Data Science",
                        description: "Learn data analysis and machine learning"
                    },
                    pricing: {
                        basic: { days: 30, price: 59.99 },
                        normal: { days: 60, price: 99.99 },
                        premium: { days: 90, price: 159.99 }
                    },
                    gallery: { image: "https://example.com/datascience.jpg" }
                }
            }
        ];

        const createdData = [];

        for (const data of sampleData) {
            // Create and save mentor
            const mentor = new Mentor(data.mentor);
            const savedMentor = await mentor.save();
            console.log('Saved mentor:', savedMentor);

            // Create and save course
            const courseData = {
                ...data.course,
                mentorId: savedMentor._id,
                mentor: {
                    id: savedMentor._id,
                    email: savedMentor.email,
                    name: savedMentor.name
                }
            };
            
            const course = new Course(courseData);
            const savedCourse = await course.save();
            console.log('Saved course:', savedCourse);

            // Update mentor's courses array
            savedMentor.courses.push(savedCourse._id);
            await savedMentor.save();

            createdData.push({
                mentor: savedMentor,
                course: savedCourse
            });
        }

        res.status(200).json({
            success: true,
            message: 'Sample mentors and courses added successfully',
            data: createdData
        });

    } catch (error) {
        console.error('Error adding sample data:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding sample data',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});