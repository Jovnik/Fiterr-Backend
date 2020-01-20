const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const Packages = require('../models/Packages')
const Page = require('../models/Page')
const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');
const stripe = require('stripe')(process.env.SECRETSTRIPE);
require('dotenv').config()
const mongoose = require('mongoose')
const { check, validationResult } = require('express-validator');

// @route       /api/professional/package-register
// @desc        when hit the router will create a new package for the page
router.post('/package-register', async (req, res) => {
    const { title, description, numSessions, price } = req.body
    console.log(req.user.pageOwned);

    try {
        const newPackage = new Packages({
            pageID: req.user.pageOwned,
            title: title,
            description: description,
            numberOfSessions: numSessions,
            price: price
        })
        await newPackage.save()
        res.status(200).send(newPackage)
    } catch (err) {
        console.log('Error', err.message);
        res.status(500).send(err)
    }
})

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


// @route       /api/professional/update/:title
// @desc        will update the price of a package
router.put("/update/:title", async (req, res) => {
    try {
        const newPrice = req.body.price;
        const updatedPackage = await Packages.findOneAndUpdate({ title: req.params.title }, {
            price: newPrice
        })
        res.status(200).send(updatedPackage)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// @route       /api/professional/:id/:id   (:id = pageId)/(:id = packageId)
// @desc        will display one of the packages from a page
router.get('/:pageId/:packageId', async (req, res) => {
    try {
        const selectedPage = await Page.findOne({ pageTitle: req.params.pageId })
        const selectedPackage = await Packages.findOne({ title: req.params.packageId })
        console.log(selectedPage);
        console.log(selectedPackage);
        res.status(200).send(selectedPackage)
    } catch (err) {
        console.log('Error', err.message);
        res.status(500).send(err)
    }
})

// @route       /api/professional/:pageId/:packageId
// @desc        will purchase a package for an enthusiast 
router.post('/:pageId/:packageId', async (req, res) => {
    try {
        const packagePurchased = await Packages.findOne({ title: req.params.packageId })
        const amount = packagePurchased.price
        stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken
        })
            .then(customer => {
                console.log(customer);
                stripe.charges.create({
                    amount,
                    description: `${packagePurchased.description}`,
                    currency: 'aud',
                    customer: customer.id
                })
                res.status(200).end()
            })
            .catch((err) => {
                console.log(err)
            })
    } catch (err) {
        console.log('Error', err.message);
        res.status(500).send(err)
    }
})



/* --------- CANT COMPLETE BELOW UNTIL PACKAGES ARE COMPLETE ---------*/
// @route       /api/professional/service-register
// @desc        when hit router will create a new service for a group of packages
router.post('/service-register', async (req, res) => {
    try {
        console.log(req.params);
        res.status(200).send("all good brudda")
    } catch (err) {
        console.log('Error', err.message);
        res.status(500).send(err)
    }
})


module.exports = router;