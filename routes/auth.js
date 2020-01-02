const express = require('express');
const router = express.Router();
const passport = require('passport');

const ensureAuthenticated = require('../middleware/auth');

const User = require('../models/User');

// @route       /api/auth
// @desc        Get the user logged in on the backend
router.get('/', ensureAuthenticated, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        // console.log('The user is authentiated so we are going to send them to the frontend');
        res.json(user);
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

module.exports = router;