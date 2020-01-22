const express = require('express');
const router = express.Router();
const Service = require('../models/Service')
require('dotenv').config()

// @route:       /api/services/view-services
// @desc         View all the services that the enthusiast has
router.get('/view-services', async (req, res) => {
    try {
        const userService = await Service.find({ enthusiastID: req.user._id })
        res.status(200).send(userService)
    } catch (err) {
        console.log('Error', err.message);
        res.status(500).send(err)
    }
})

module.exports = router;