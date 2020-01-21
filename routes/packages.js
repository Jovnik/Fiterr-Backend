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

// @old_route       /api/professional/package-register
// @new_route       /api/packages/package-register
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

// @old_route       /api/professional/:id/:id   (:id = pageId)/(:id = packageId)
// @new_route       /api/packages/:pageHandle/:packageId
// @desc            will display one of the packages from a page
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

// @old_route       /api/professional/update/:title
// @new_route       /api/packages/package-price-update
// @desc        will update the price of a package
const packageUpdateFields = [
    { name: 'title' },
    { name: 'description' },
    { name: 'numberOfSessions' },
    { name: 'price' },
    { name: 'id' }
]
const packageUpdateUpload = multer({ storage: storage }).fields(packageUpdateFields)
router.put("/package-update", packageUpdateUpload, async (req, res) => {
    try {
        const { title, description, numberOfSessions, price, id } = req.body
        const updatedPackage = await Packages.findOne({ _id: id })
        updatedPackage.title = title
        updatedPackage.description = description
        updatedPackage.numberOfSessions = numberOfSessions
        updatedPackage.price = price
        await updatedPackage.save()
        console.log('updatedpackage', updatedPackage)
        res.status(200).send(updatedPackage)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// @old_route       /api/professional/:pageId/:packageId
// @new_route       /api/packages/:pageHandle/:packageId
// @desc        will purchase a package for an enthusiast 
const packagePurchaseFields = [
    {name: 'price'},
    {name: 'id'},
    {name: 'receipt_email'},
    {name: 'amount'},
    {name: 'source'}
]
const packagePurchaseUpload = multer({ storage: storage }).fields(packagePurchaseFields)
router.post('/:pageHandle/:packageId', packagePurchaseUpload,async (req, res) => {
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


const packageDeleteFields = [
    { name: 'id' }
]
const packageDeleteUpload = multer({ storage: storage }).fields(packageDeleteFields)
router.delete('/package-delete', packageDeleteUpload, async (req, res) => {
    try {
        const { id } = req.body
        const selectedPackage = await Packages.findOneAndDelete({ _id: id })
        selectedPackage.save()
        res.status(200).end()
    } catch (err) {
        console.log('Error', err);
        res.status(500).send(err)
    }
})

module.exports = router;