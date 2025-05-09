const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');

router.use(checkRole('mentor'));

// Mentor-specific routes here