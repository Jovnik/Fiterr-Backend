const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config()
const mongoose = require('mongoose')
const { check, validationResult } = require('express-validator');

// @route       /api/professional/package-register
// @desc        when hit the router will create a new package for the page
router.post('/package-register', async (req, res) => {
    const user = req.params.id
    console.log(req.user);
    console.log(req.page);
    console.log(user);
    res.status(200).send("all good")
})

module.exports = router;