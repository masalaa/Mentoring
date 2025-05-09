const router = express.Router();
const { checkRole } = require('../middleware/auth');

// Apply mentee role check to all mentee routes
router.use(checkRole('mentee'));

// ... rest of your route handlers