const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const Packages = require('../models/Packages')
const Page = require('../models/Page')
const Service = require('../models/Service')
const passport = require('passport')
const multer = require('multer');
const storage = multer.memoryStorage();
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
const fields = [
    {name: 'price'},
    {name: 'id'},
    {name: 'receipt_email'},
    {name: 'amount'},
    {name: 'source'}
]
const upload = multer({storage: storage}).fields(fields)
router.put("/package-price-update", upload, async (req, res) => {
    try {
        const {price, id} = req.body
        console.log(price, id)
        const package = await Packages.findOne({ _id: id })
        package.price = price 
        await package.save()
        console.log('updatedpackage', package)
        res.status(200).send(package    )
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// @route       /api/professional/:id/:id   (:id = pageId)/(:id = packageId)
// @desc        will display one of the packages from a page
router.get('/:pageHandle/:packageId', async (req, res) => {
    try {
        const selectedPage = await Page.findOne({ pageHandle: req.params.pageHandle })
        const selectedPackage = await Packages.findOne({ _id: req.params.packageId })
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

router.post('/:pageHandle/:packageId', upload,async (req, res) => {
    console.log(req.user);
    try {
        const selectedPage = await Page.findOne({ pageHandle: req.params.pageHandle })
        const packagePurchased = await Packages.findOne({ _id: req.params.packageId })
        const amount = packagePurchased.price
        console.log('package purchased', packagePurchased);
        console.log('selected page', selectedPage);
        const customer = await stripe.customers.create({
            email: req.body.receipt_email,
            source: req.body.source
        })
        const newCharge = await stripe.charges.create({
            amount,
            description: packagePurchased.description,
            currency: 'aud',
            customer: customer.id
        })
        console.log('newCHarge', newCharge)
        const newService = new Service({
            enthusiastID: req.user.id,
            professionalID: selectedPage.pageOwner,
            pageID: packagePurchased.pageID,
            packageID: packagePurchased._id,
            DatePurchased: Date.now(),
            quantityRemaining: packagePurchased.numberOfSessions,
            Sessions: null,

        })
        console.log('service created', newService)
        await newService.save()
        res.status(200).send(newCharge)
    } catch (err) {
        console.log('Error', err);
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