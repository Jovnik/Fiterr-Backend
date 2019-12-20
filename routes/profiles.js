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
    try {
        const {aboutMe, fitnessInterests} = req.body

        const { image } = req.files

        let imageUrl = null;
        let imagesArr = [];
        
        // check to see if an image was uploaded or not
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

            const data = await s3credentials.upload(fileParams).promise();  //because this is in a trycatch, it will throw an error if detected with the upload - right?

            imageUrl = data.Location;
            imagesArr = [imageUrl];

        } else {
            console.log('There was no image uploaded');
        }

        // we create the new profile here - it will have the correct link if an image was detected in the upload
        const profile = new Profile({
            images: imagesArr,
            displayImage: imageUrl,
            aboutMe: aboutMe,
            fitnessInterests: fitnessInterests,
            user: req.user.id
        });

        await profile.save();
        console.log('Profile:', profile);
        await User.findByIdAndUpdate({_id: req.user.id}, {profile: profile.id})  //update the user so that they now have the profile field
        return res.send(profile);

    } catch(err) {
        console.log('An error was thrown at some point in the process');
        console.log(err)
    }
    
})

router.get('/', async (req,res)=> {
    const id = req.query.id;
    const findProfile = await Profile.findOne({user: id});
    // console.log('found the profile', findProfile);
    res.send(findProfile)
})

module.exports = router;