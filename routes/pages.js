const express = require('express');
const router = express.Router();
const Page = require('../models/Page')
const multer = require('multer');
const storage = multer.memoryStorage();
const User = require('../models/User')
const AWS = require('aws-sdk');
require('dotenv').config()

// @route       /api/pages/get-page/:handle
// @desc        finds all the packages and psots related to one page and populates the page
router.get('/get-page/:handle', async (req, res) => {
    try {
        const handle = req.params.handle
        const page = await Page.findOne({ pageHandle: handle }).populate('packages').populate('posts')
        res.status(200).send(page)
    } catch (err) {
        res.status(500).send(err)
    }
})

// @route       /api/pages/find-role/:handle
// desc:        when a user hits the page, sorts whether they're a Owner, Trainer, Content-Creator or Visitor
router.get('/find-role/:handle', async (req, res) => {
    try {
        const { handle } = req.params

        const page = await Page.findOne({ pageHandle: handle })

        if (req.user.id == page.pageOwner) {
            res.status(200).send('Owner')
        } else if (page.trainers.includes(req.user._id)) {
            res.status(200).send('Trainer')
        } else if (page.contentCreators.includes(req.user._id)) {
            res.status(200).send('Content-Creator')
        } else {
            res.status(200).send('Visitor')
        }
    } catch (err) {
        res.status(500).send(err)
    }
})

// @route       /api/pages/create
// @desc        Creates a Page (includes uploading photos)
const fields = [
    { name: 'pageOwner' },
    { name: 'pageHandle' },
    { name: 'pageTitle' },
    { name: 'pageAbout' },
    { name: 'image' },
    { name: 'title' },
    { name: 'pageID' },
    { name: 'description' },
    { name: 'numberOfSessions' },
    { name: 'price' }
]
const upload = multer({ storage: storage }).fields(fields)
let s3credentials = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY
});
router.post('/create', upload, async (req, res) => {
    try {
        const { image } = req.files
        let imageUrl = null;
        if (image != null) {
            const uniqueValue = req.user.id;
            const uniqueTimeValue = (Date.now()).toString();
            const name = image[0].originalname + image[0].size + uniqueValue + uniqueTimeValue;
            let fileParams = {
                Bucket: process.env.BUCKET,
                Body: image[0].buffer,
                Key: name,
                ACL: 'public-read',
                ContentType: image[0].mimetype
            }
            const data = await s3credentials.upload(fileParams).promise();  //because this is in a trycatch, error thrown if detected with the upload
            imageUrl = data.Location;
            imagesArr = [imageUrl];
        }
        const pageHandle = req.body.pageHandle
        const newPageHandle = pageHandle.replace(/\s/g, '');
        const professionalUser = req.user.isProfessional;
        const currentUser = await User.findOne({ _id: req.user.id })
        if (professionalUser) {
            const { pageOwner, pageTitle, pageAbout } = req.body
            let page = await Page.findOne({ newPageHandle });
            if (page) {
                return res.status(400).send('This Handle is Already Taken')
            }
            page = new Page(req.body)
            page.pageHandle = newPageHandle
            page.displayImage = imageUrl
            page.pageOwner = req.user.id
            await page.save()
            currentUser.pageOwned = page._id
            await currentUser.save()
            res.status(200).send('page created')
        } else {
            res.status(400).send("Not a professional user")
        }
    } catch (err) {
        res.status(500).send(err)
    }
})

// @route:      /api/pages/delete
// @desc:       Deletes a page and removes the pageOwned id from the User's model
router.delete('/delete', async (req, res) => {
    try {
        await Page.findOneAndDelete({ _id: req.user.pageOwned })
        const updateUser = await User.findOneAndUpdate({ _id: req.user.id }, {
            pageOwned: null
        })
        updateUser.save()
        res.status(200).end()
    } catch (err) {
        res.status(400).send(err)
    }
})

// @route:      /api/pages/about
// @desc:       returns the "about" section of a Page
router.put('/about', upload, async (req, res) => {
    try {
        const { pageAbout, pageHandle } = req.body
        const page = await Page.findOne({ pageHandle: pageHandle })
        page.pageAbout = pageAbout
        await page.save()
        res.status(200).send(page)
    } catch (err) {
        res.status(500).send(err)
    }
})

// @route:      /api/pages/trainers/:pageID
// @desc        returns all the trainers related to a page
router.get('/trainers/:pageID', async (req, res) => {
    try {
        const id = req.params.pageID
        const page = await Page.findOne({ _id: id }).populate('trainers')
        const trainers = page.trainers
        res.status(200).send(trainers)
    }
    catch (err) {
        res.status(500).send(err)
    }
})
module.exports = router;