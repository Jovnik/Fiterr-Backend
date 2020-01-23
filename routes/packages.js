const express = require('express');
const router = express.Router();
const Packages = require('../models/Packages')
const Page = require('../models/Page')
const Service = require('../models/Service')
const multer = require('multer');
const storage = multer.memoryStorage();
const stripe = require('stripe')(process.env.SECRETSTRIPE);
require('dotenv').config()



// @route       /api/packages/package-register
// @desc        creates a package for the Professional Page
const packageCreateFields = [
    { name: "pageID" },
    { name: "title" },
    { name: "description" },
    { name: "numberOfSessions" },
    { name: "price" }
]
const packageCreateUpload = multer({ storage: storage }).fields(packageCreateFields)
router.post('/package-register', packageCreateUpload, async (req, res) => {
    const { pageID, title, description, numberOfSessions, price } = req.body
    try {
        const newPackage = new Packages({
            pageID: pageID,
            title: title,
            description: description,
            numberOfSessions: numberOfSessions,
            price: price
        })
        await newPackage.save()
        let updatedPage = await Page.findOneAndUpdate({ _id: req.user.pageOwned }, { $push: { packages: newPackage } })
        await updatedPage.save()
        updatedPage = await Page.findOne({ _id: req.user.pageOwned }).populate('packages')
        res.status(200).send(updatedPage)
    } catch (err) {
        res.status(500).send(err)
    }
})


// @route       /api/packages/:pageHandle/:packageId
// @desc        displays a SINGLE package from from a selected Page
router.get('/:pageHandle/:packageId', async (req, res) => {
    try {
        const selectedPage = await Page.findOne({ pageHandle: req.params.pageHandle })
        const selectedPackage = await Packages.findOne({ title: req.params.packageId })
        if (selectedPage.id != selectedPackage.pageID) {
            res.status(500).send("package isn't owned by this page")
        } else {
            res.status(200).send(selectedPackage)
        }
    } catch (err) {
        console.log('Error', err.message);
        res.status(500).send(err)
    }
})

// @route       /api/packages/package-update
// @desc        updates the package details
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
        res.status(200).send(updatedPackage)
    } catch (err) {
        res.status(500).send(err)
    }
})

// @route       /api/packages/update-package-price
// @desc        update the price of a package
router.put("/update-package-price", async (req, res) => {
    try {
        const { price, id } = req.body;
        const updatedPackage = await Packages.findOneAndUpdate({ _id: id }, {
            price: price
        })
        res.status(200).send(updatedPackage)
    } catch (err) {
        res.status(500).send(err)
    }
})

// @route       /api/packages/:pageHandle/:packageId
// @desc        purchases a package from the Page and then creates a Service. Uses Stripe.
const packagePurchaseFields = [
    { name: 'id' },
    { name: 'receipt_email' },
    { name: 'amount' },
    { name: 'source' }
]
const packagePurchaseUpload = multer({ storage: storage }).fields(packagePurchaseFields)
router.post('/:pageHandle/:packageId', packagePurchaseUpload, async (req, res) => {
    try {
        console.log(req.body)
        const selectedPage = await Page.findOne({ pageHandle: req.params.pageHandle })
        const packagePurchased = await Packages.findOne({ _id: req.params.packageId })
        const amount = req.body.amount
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
        const newService = new Service({
            enthusiastID: req.user.id,
            professionalID: selectedPage.pageOwner,
            pageID: packagePurchased.pageID,
            packageID: packagePurchased._id,
            DatePurchased: Date.now(),
            quantityRemaining: packagePurchased.numberOfSessions,
            receiptUrl: newCharge.receipt_url

        })
        await newService.save()
        res.status(200).send(newCharge)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
})

// @route       api/packages/package-delete
// @desc        deletes a package from the package model and then the Page
const packageDeleteFields = [
    { name: 'id' }
]
const packageDeleteUpload = multer({ storage: storage }).fields(packageDeleteFields)
router.delete('/package-delete', packageDeleteUpload, async (req, res) => {
    try {
        const { id } = req.body
        const selectedPackage = await Packages.findOneAndDelete({ _id: id })
        const selectedPageID = selectedPackage.pageID
        const selectedPage = await Page.findOne({ _id: selectedPageID })
        const stringIds = selectedPage.packages.map((pak) => String(pak))
        const filteredPackages = stringIds.filter(packageDelete => packageDelete !== id)
        selectedPage.packages = filteredPackages
        selectedPage.save()
        res.status(200).end()
    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router;