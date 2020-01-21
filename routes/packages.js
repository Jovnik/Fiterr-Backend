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
const fields = [
    { name: 'price' },
    { name: 'id' }
]
const upload = multer({ storage: storage }).fields(fields)
router.put("/package-price-update", upload, async (req, res) => {
    try {
        const { price, id } = req.body
        console.log(price, id)
        const package = await Packages.findOne({ _id: id })
        package.price = price
        await package.save()
        console.log('updatedpackage', package)
        res.status(200).send(package)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// @old_route       /api/professional/:pageId/:packageId
// @new_route       /api/packages/:pageHandle/:packageId
// @desc        will purchase a package for an enthusiast 

router.post('/:pageHandle/:packageId', async (req, res) => {
    console.log(req.user);
    try {
        const selectedPage = await Page.findOne({ pageHandle: req.params.pageHandle })
        const packagePurchased = await Packages.findOne({ _id: req.params.packageId })
        const amount = packagePurchased.price
        console.log('package purchased', packagePurchased);
        console.log('selected page', selectedPage);
        // const customer = await stripe.customers.create({
        //     email: req.body.stripeEmail,
        //     source: req.body.stripeToken
        // })
        // stripe.charges.create({
        //     amount,
        //     description: packagePurchased.description,
        //     currency: 'aud',
        //     customer: customer.id
        // })
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
        res.status(200).send(newService)
    } catch (err) {
        console.log('Error', err);
        res.status(500).send(err)
    }
})

module.exports = router;