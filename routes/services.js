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


router.get('/view-services', async (req, res) => {
    try {
        const userService = await Service.find({ enthusiastID: req.user._id })
        res.status(200).send(userService)
    } catch (err) {
        console.log('Error', err.message);
        res.status(500).send(err)
    }
})


const serviceFields = [
    { name: "serviceID" },
    { name: "quantityRemaining" }
]
const serviceUpload = multer({ storage: storage }).fields(serviceFields)
router.put('/update-service', serviceUpload, async (req, res) => {

})



module.exports = router;