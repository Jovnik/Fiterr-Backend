const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config()
const mongoose = require('mongoose')
const Service = require('../models/Service')

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


// @route       /api/profiles/create
// @desc        Create a profile
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

            const data = await s3credentials.upload(fileParams).promise();  //because this is in a trycatch, error thrown if detected with the upload

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
        console.log(err)
    } 
})

// @route       /api/profiles/me
// @desc        Get my profile thats linked to the logged in user
router.get('/me', async(req, res) => {
    const myProfile = await Profile.findOne({ user: req.user._id }).populate('user', ['firstname', 'lastname']);
    console.log('myProfile is', myProfile);
    res.send(myProfile);
})

//to return services to dashboard for rendering
router.get('/services', async(req,res)=>{
    try{
        const services = await Service.find({enthusiastID: req.user.id})
        console.log('enthusiast services', services)
        res.status(200).send(services)
    }catch(err){
        res.status(400).send(err)
        console.log(err)
    }
    
})

// USE THIS SHIT!!!!
router.get('/other-profile/:username', async(req, res) => {
    const { username } = req.params;
    const otherUser = await User.findOne({ username });
    const otherProfile = await Profile.findOne({ user: otherUser._id }).populate('user', ['firstname', 'lastname', 'username']);
    console.log(otherProfile);
    res.json(otherProfile);
})

// THIS IS CURRENTLY USED ON THE FRONTEND TO GET YOUR OWN PROFILE
// @route       /api/profiles
// @desc        Get a profile
router.get('/', async (req,res)=> {
    const id = req.query.id;
    const findProfile = await Profile.findOne({user: id}).populate('user', ['firstname', 'lastname']);
    // console.log('Profile found', findProfile);
    res.send(findProfile)
})

// @route       /api/profiles/follow/:id
// @desc        Put our profile id in the following profiles follower field, and put the following id in our profiles following field
router.get('/follow/:id', async(req, res) => {
    const followId = req.params.id;     // this is the 'viewingUser's' profile id
    // console.log('followid', followId); 

    const myProfile = await Profile.findOneAndUpdate({ user: req.user._id }, {$push: {following: followId}}, {new: true});
    // console.log('MINE', myProfile);

    const followingProfile = await Profile.findByIdAndUpdate(followId, {$push: {followers: myProfile._id}}, {new: true});
    // console.log('FOLLOWING', followingProfile);

    res.send('Following field updated');
})

// @route       /api/profiles/unfollow/:id
// @desc        Remove our profile id from the following profiles follower field and remove the following id from our profiles following field
router.get('/unfollow/:id', async(req, res) => {
    const followId = req.params.id;
    
    // cant log this, need to check update in atlas
    await Profile.updateOne({ user: req.user._id }, {$pullAll: {following: [followId]}});
    // can use $pullAll or $pull - i think $pull only removes one entry where as $pullAll removes all of them
    
    await Profile.updateOne({ _id: followId }, {$pullAll: {followers: [req.user.profile]}});

    res.send('Unfollowing updated')
}) 

// POSTMAN ROUTE ONLY
// @route       /api/profiles/clear/:id
// @desc        clear all following and follower ids from the profile
router.get('/clear/:id', async(req, res) => {
    console.log('We have the Profile ID: ', req.params.id);

    const profile = await Profile.findOneAndUpdate({_id: req.params.id}, { following: [], followers: [] }, { new: true });
    console.log('Profile is now:', profile);

    res.send('success');
})


module.exports = router;