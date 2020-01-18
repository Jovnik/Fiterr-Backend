const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const Page = require('../models/Page')
const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config()
const mongoose = require('mongoose')

// @route       /api/pages/register
// @desc        when hit the router will create a new page for the professional
router.post('/register', async (req, res) => {
    const professionalUser = req.user.isProfessional;
    const currentUser = await User.findOne({ _id: req.user.id })
    if (professionalUser == true) {
        try {
            const { pageTitle, pageAbout } = req.body
            const { pageOwner } = req.user.id

            const newPage = new Page({
                pageOwner: pageOwner,
                pageTitle: pageTitle,
                pageAbout: pageAbout
            });
            await newPage.save()
                .then(doc => {
                    currentUser.pageOwned = doc._id
                    currentUser.save()
                })
            res.status(200).send(newPage);

        } catch (err) {
            console.log('Error', err.message);
            res.status(500).send(err)
        }
    } else {
        res.status(500).send("Not a professional user")
    }
})

module.exports = router;