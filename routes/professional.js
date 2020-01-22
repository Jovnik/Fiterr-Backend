const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const Packages = require('../models/Packages')
const Page = require('../models/Page')
const Service = require('../models/Service')
const passport = require('passport')
const Session = require('../models/Session')
const multer = require('multer');
const storage = multer.memoryStorage();
const AWS = require('aws-sdk');
const stripe = require('stripe')(process.env.SECRETSTRIPE);
require('dotenv').config()
const mongoose = require('mongoose')
const { check, validationResult } = require('express-validator');

// @route       /api/professional/:id   (:id = pageId)
// @desc        will display all the packages from one page
router.get('/:pageId', async (req, res) => {
    try {
        const myPackages = await Packages.find({ pageTitle: req.params.pageTitle })
        console.log(myPackages);
        res.status(200).send(myPackages)
    } catch (err) {
        console.log('Error', err.message);
        res.status(500).send(err)
    }
})

module.exports = router;