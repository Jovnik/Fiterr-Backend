const express = require('express');
const router = express.Router();
const Page = require('../models/Page')
const Package = require('../models/Packages')
const multer = require('multer');
const storage = multer.memoryStorage();
const User = require('../models/User')
const AWS = require('aws-sdk');
require('dotenv').config()
const mongoose = require('mongoose')


router.get('/get-page/:handle', async(req,res)=> {
    try{
        console.log(req.user)
        const handle = req.params.handle
        console.log(handle)
        const page = await Page.findOne({pageHandle: handle}).populate('packages').populate('posts')
        console.log(page)
        res.status(200).send(page)
    }catch(err){
        console.log(err)
        res.status(400).send(err)
    }
    

})

router.get('/find-role/:handle', async(req,res) => {
    const { handle } = req.params

    const page = await Page.findOne({pageHandle: handle})
    
    if(req.user.id == page.pageOwner){
        res.send('Owner')
    }else if(page.trainers.includes(req.user._id)){
        res.send('Trainer')
    }else if(page.contentCreators.includes(req.user._id)){
        res.send('Content-Creator')
    }else{
        res.send('Visitor')
    }
})

const fields = [
    {name: 'pageOwner'},
    {name: 'pageHandle'},
    {name: 'pageTitle'},
    {name: 'pageAbout'},
    {name: 'image'},
    {name: 'title'},
    {name: 'pageID'},
    {name: 'description'},
    {name: 'numberOfSessions'},
    {name: 'price'}
  ]
const upload = multer({storage: storage}).fields(fields)
let s3credentials = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY
});

router.post('/create', upload, async(req,res)=> {
    try{
        let imageUrl = null;
        if(image){
        
            // if there is an image then we generate a unique name 
            // console.log('here', image);
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
        console.log(req.body)
        const professionalUser = req.user.isProfessional;
        const currentUser = await User.findOne({ _id: req.user.id })
        if(professionalUser){
            const {pageOwner, pageHandle, pageTitle, pageAbout} = req.body
            const {image} = req.files
            let page = await Page.findOne({ pageHandle });
            if(page){
                return res.status(400).send('This Handle is Already Taken')
            }
            page = new Page(req.body)
            page.displayImage = imageUrl
            await page.save()
            currentUser.pageOwned = page._id
            await currentUser.save()
            res.status(200).send('page created')
        }else {
            res.status(400).send("Not a professional user")
        }
        
    }catch(err){
        res.status(400).send(err)
    }
})

router.put('/about', upload, async(req,res) => {
    try{
        const {pageAbout, pageHandle} = req.body
        const page = await Page.findOne({pageHandle: pageHandle})
        page.pageAbout = pageAbout
        await page.save()
        res.status(200).send(page)
    }catch(err){
        res.status(400).send(err)
        console.log(err)
    }
})
router.post('/package-create', upload, async(req,res)=> {
    try{
        const {pageID, title, description, numberOfSessions, price} = req.body
        console.log('eherreef')
        console.log('req.bod', req.body)
        console.log('pageID', pageID)
        const package = new Package(req.body)
        console.log('package', package)
        await package.save()
        let page = await Page.findOneAndUpdate({_id: pageID}, {$push: {packages: package}})
        await page.save()
        page = await Page.findOne({_id: pageID}).populate('packages')
        console.log('page', page)

        // let updatedPage = await Page.findOne({pageID: pageID}).populate('packages')
        // console.log('updated', updatedPage)
        res.send(page)
    }catch(err){
        res.status(400).send(err)
        console.log(err)
    }
})
module.exports = router;