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

const sessionFields = [
    { name: "serviceID" },
    { name: "time" },
    { name: "date" },
    { name: "location" },
    { name: "trainer" },
    { name: "id" }
]
const sessionUpload = multer({ storage: storage }).fields(sessionFields)
router.post('/session-create', sessionUpload, async (req, res) => {
    try {
        const { time, date, location, trainer, serviceID } = req.body
        let session = new Session({
            serviceID: serviceID,
            trainer: trainer,
            time: time,
            date: date,
            location: location
        })
        await session.save()
        const subtractQuantityService = await Service.findOne({ _id: serviceID })
        subtractQuantityService.quantityRemaining -= 1
        await subtractQuantityService.save()
        const serviceUpdated = await Service.findOneAndUpdate({ _id: serviceID }, { $push: { sessions: session._id } })
        const services = await Service.find({ enthusiastID: req.user.id }).populate('packageID').populate({ path: 'sessions', populate: { path: 'trainer', model: 'user' } })
        res.status(200).send(services)
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }

})

router.get('/trainer-pending-sessions', async (req, res) => {
    try {
        const sessions = await Session.find({ trainer: req.user._id, trainerApproval: false })
        console.log(sessions)
        res.status(200).send(sessions)
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

router.get('/trainer-upcoming-sessions', async (req, res) => {
    try {
        const sessions = await Session.find({ trainer: req.user._id, trainerApproval: true })
        res.status(200).send(sessions)
    } catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

<<<<<<< HEAD
router.put('/trainer-approval', sessionUpload, async (req, res) => {
=======
router.put('/trainer-approval', serviceUpload, async (req, res) => {
>>>>>>> master
    try {
        const { id } = req.body
        let updateSession = await Session.findOneAndUpdate({ _id: id }, { trainerApproval: true })
        res.status(200).send(updateSession)
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }
})

module.exports = router;