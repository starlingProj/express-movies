const express = require('express');
const router = express.Router();
const userRoutes = require('./user-routes');
const sessionRoutes = require('./session-routes');
const movieRoutes = require('./movie-routes');

router.use(userRoutes);
router.use(sessionRoutes);
router.use(movieRoutes);

module.exports = router;