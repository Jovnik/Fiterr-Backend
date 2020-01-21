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


const serviceFields = [
    { name: "serviceID" },
    { name: "time" },
    { name: "date" },
    { name: "location" }
]
const serviceUpload = multer({ storage: storage }).fields(serviceFields)
router.post('/session-create', serviceUpload, async (req, res) => {
    try {
        console.log(req.body);
        const { time, date, location, serviceID } = req.body;
        const newSession = new Session({
            serviceID: serviceID,
            time: time,
            date: date,
            location: location
        })
        const currentService = await Service.findOne({ _id: req.body.serviceID })
        currentService.Sessions = newSession
        await currentService.save()
        console.log(currentService.Sessions);
        await newSession.save()
        res.status(200).send(newSession);
    } catch (err) {
        console.log('error', err);
        res.status(500).send(err)
    }
})

module.exports = router;