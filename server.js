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
const Feedback = require('./models/feedback'); // Import the Feedback model

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

// Update the publish course route
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

        const course = new Course({
            mentorId: mentor._id,
            mentor: {
                id: mentor._id,
                name: mentor.name,
                email: mentor.email
            },
            overview: courseData.overview,
            pricing: courseData.pricing,
            gallery: courseData.gallery,
            status: 'active',
            createdAt: new Date()
        });

        const savedCourse = await course.save();
        
        if (!mentor.courses) {
            mentor.courses = [];
        }
        mentor.courses.push(savedCourse._id);
        await mentor.save();

        res.json({ 
            success: true, 
            message: 'Course published successfully',
            courseId: savedCourse._id 
        });

    } catch (err) {
        console.error('Course publish error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error publishing course', 
            error: err.message 
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

//Publish course route
app.post('/api/publish-course', async (req, res) => {
    try {
        const { userId, courseData } = req.body;
        console.log(req.body,"request body")
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
// Ensure the API endpoint for fetching courses is correctly set up
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find(); // Assuming Course is your model
        res.json({ courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send('Server error');
    }
});

// Handle search queries
app.get('/api/courses/search', async (req, res) => {
    try {
        const searchTerm = req.query.term;
        const courses = await Course.find({
            $or: [
                { 'overview.title': { $regex: searchTerm, $options: 'i' } },
                { 'overview.description': { $regex: searchTerm, $options: 'i' } },
                { 'overview.category': { $regex: searchTerm, $options: 'i' } }
            ]
        });
        res.json(courses);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
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

app.post('/api/courses/create', async (req, res) => {
    try {
        const courseData = req.body;
        
        // Find mentor first to verify and get details
        const mentor = await Mentor.findById(courseData.mentorId);
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Create course with actual data
        const course = new Course({
            mentorId: mentor._id,
            mentor: {
                id: mentor._id,
                email: mentor.email,
                name: mentor.name
            },
            overview: courseData.overview,
            pricing: courseData.pricing,
            gallery: courseData.gallery,
            status: courseData.status,
            createdAt: new Date()
        });

        const savedCourse = await course.save();

        // Update mentor's courses array
        await Mentor.findByIdAndUpdate(
            mentor._id,
            { $push: { courses: savedCourse._id } }
        );

        res.status(201).json({
            success: true,
            courseId: savedCourse._id,
            message: 'Course created successfully'
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
});

// Add this route after your other routes
app.get('/api/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            course
        });
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching course details'
        });
    }
});

// Add EnrollmentRequest Schema if not already defined
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

const EnrollmentRequest = mongoose.model('EnrollmentRequest', enrollmentRequestSchema);

// Update the enrollment route
app.post('/api/courses/enroll', async (req, res) => {
    try {
        const { courseId, plan, userId } = req.body;
        const authUserId = req.headers.authorization;

        if (!authUserId || authUserId !== userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized request'
            });
        }

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Create enrollment request
        const enrollmentRequest = new EnrollmentRequest({
            courseId,
            userId,
            plan
        });

        await enrollmentRequest.save();

        // Update mentee's enrolledCourses array
        await Mentee.findByIdAndUpdate(userId, {
            $push: {
                enrolledCourses: {
                    courseId: courseId,
                    plan: plan,
                    status: 'pending',
                    enrolledAt: new Date()
                }
            }
        });

        res.json({
            success: true,
            message: 'Enrollment request sent successfully',
            requestId: enrollmentRequest._id
        });

    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing enrollment request'
        });
    }
});

// Route to get enrollment requests for a mentor
app.get('/api/mentor/enrollment-requests/:mentorId', async (req, res) => {
    try {
        const mentorId = req.params.mentorId;
        console.log(`Fetching enrollment requests for mentorId: ${mentorId}`);

        // Fetch requests from the database
        const requests = await EnrollmentRequest.find({ status: 'pending' })
            .populate({
                path: 'courseId',
                match: { mentorId: mentorId },
                select: 'overview.title'
            })
            .populate('userId', 'name');

        // Filter out requests where courseId is null (i.e., not matching mentorId)
        const filteredRequests = requests.filter(request => request.courseId !== null);

        console.log(`Found ${filteredRequests.length} requests`);

        res.json({
            success: true,
            requests: filteredRequests
        });
    } catch (error) {
        console.error('Error fetching enrollment requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enrollment requests'
        });
    }
});

// Commented out the route to accept an enrollment request
/*
app.post('/api/mentor/accept-request', async (req, res) => {
    try {
        const { requestId } = req.body;
        
        const request = await EnrollmentRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        request.status = 'approved';
        await request.save();

        // Update mentee's enrolledCourses status
        await Mentee.updateOne(
            { _id: request.userId, 'enrolledCourses.courseId': request.courseId },
            { $set: { 'enrolledCourses.$.status': 'approved' } }
        );

        res.json({
            success: true,
            message: 'Request accepted successfully'
        });
    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).json({
            success: false,
            message: 'Error accepting request'
        });
    }
});
*/

// Connect to feedback.db
mongoose.connect('mongodb://localhost/feedback.db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to feedback.db'))
.catch(err => console.error('Database connection error:', err));

// Feedback storage endpoint
app.post('/api/feedback', async (req, res) => {
    try {
        const { userId, feedback } = req.body;
        const newFeedback = new Feedback({ userId, message: feedback });
        await newFeedback.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error storing feedback:', error);
        res.status(500).json({ success: false, message: 'Error storing feedback' });
    }
});

// Feedback retrieval endpoint
app.get('/api/feedback', async (req, res) => {
    try {
        const feedbackList = await Feedback.find().populate('userId', 'name email');
        res.json(feedbackList);
    } catch (error) {
        console.error('Error retrieving feedback:', error);
        res.status(500).json({ success: false, message: 'Error retrieving feedback' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
