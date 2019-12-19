const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false);

// we say that we're using in memory storage for multer
const storage = multer.memoryStorage()

const fields = [
    {name: 'image'},
    {name: 'aboutMe'},
    {name: 'fitnessInterests'} 
]

const upload = multer({ storage: storage }).fields(fields);

let s3credentials = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY
});


router.post('/create', upload, async (req,res) => {
    try{
        const {aboutMe, fitnessInterests} = req.body
    
        const {image} = req.files
        const uniqueValue = req.user.id
        const randomNum = Math.floor((Math.random()*10000000000))

        const name = `${image[0].originalname + image[0].size + uniqueValue + randomNum}`
        console.log(name)
        let fileParams = {
            Bucket: process.env.BUCKET,
            Body: image[0].buffer,
            Key: name,
            ACL: 'public-read',
            ContentType: image[0].mimetype
        }
        s3credentials.upload(fileParams, async(err, data) => {
            if (err) {
                console.log('eeeee')
                return res.send(err)
            } else {
                const imageUrl= data.Location
                const newProfile = new Profile({
                    images: [{
                        imageLink: imageUrl,
                        displayPhoto: true
                    }],
                    aboutMe: aboutMe,
                    fitnessInterests: fitnessInterests
                })
                await newProfile.save()
                const updateUser = await User.findByIdAndUpdate({_id: req.user.id}, {profile: newProfile.id})
                return res.send(newProfile)
                //at this point redirect to the users dashboard
            }
        })
    } catch(err){
        console.log(err)
    }
    
})

module.exports = router;