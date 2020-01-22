const express = require('express');
const router = express.Router();
const Service = require('../models/Service')
const Session = require('../models/Session')
const multer = require('multer');
const storage = multer.memoryStorage();
require('dotenv').config()


// @route:      /api/sessions/session-create
// @desc        creates a session for the service of a user
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
        res.status(500).send(err)
    }
});

// @route       /api/sessions/trainer-pending-sessions  
// @desc        Any sessions that the user has created gets sent to the trainer to approve
router.get('/trainer-pending-sessions', async (req, res) => {
    try {
        const sessions = await Session.find({ trainer: req.user._id, trainerApproval: false })
        res.status(200).send(sessions)
    }
    catch (err) {
        res.status(500).send(err)
    }
})

// @route       /api/sessions/trainer-upcoming-sessions
// @desc        Once approved sessions will GET here
router.get('/trainer-upcoming-sessions', async (req, res) => {
    try {
        const sessions = await Session.find({ trainer: req.user._id, trainerApproval: true })
        res.status(200).send(sessions)
    } catch (err) {
        res.status(500).send(err)
    }
});

// @route       /api/sessions/trainer-approval
// @desc        Trainer approves the session and it changes the data in the document
router.put('/trainer-approval', sessionUpload, async (req, res) => {
    try {
        const { id } = req.body
        let updateSession = await Session.findOneAndUpdate({ _id: id }, { trainerApproval: true })
        res.status(200).send(updateSession)
    }
    catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router;