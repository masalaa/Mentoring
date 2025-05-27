const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Define a root route
app.get('/', (req, res) => {
  res.send('Welcome to the Mentoring API');
});

// Import and use the course routes
const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

// Connect to MongoDB (ensure your connection string is correct)
mongoose.connect('your_mongodb_connection_string', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});