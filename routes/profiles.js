const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config()
const mongoose = require('mongoose')
const Service = require('../models/Service')
const Session = require('../models/Session')

mongoose.set('useFindAndModify', false);

// we say that we're using in memory storage for multer
const storage = multer.memoryStorage()

const fields = [
    { name: 'image' },
    { name: 'aboutMe' },
    { name: 'fitnessInterests' },
    { name: 'time' },
    { name: 'date' },
    { name: 'location' },
    { name: 'trainer' },
    { name: 'serviceID' },
    { name: 'id' }
]

const upload = multer({ storage: storage }).fields(fields);

let s3credentials = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY
});


// @route       /api/profiles/create
// @desc        Create a profile
router.post('/create', upload, async (req, res) => {
    try {
        const { aboutMe, fitnessInterests } = req.body

        const { image } = req.files

        let imageUrl = null;
        let imagesArr = [];

        // check to see if an image was uploaded or not
        if (image) {

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
        await User.findByIdAndUpdate({ _id: req.user.id }, { profile: profile.id })  //update the user so that they now have the profile field
        return res.send(profile);

    } catch (err) {
        console.log(err)
    }
})

// @route       /api/profiles/me
// @desc        Get my profile thats linked to the logged in user
router.get('/me', async (req, res) => {
    const myProfile = await Profile.findOne({ user: req.user.id }).populate('user', ['firstname', 'lastname']);
    console.log('myProfile is', myProfile);
    res.send(myProfile);
})

//to return services to dashboard for rendering
router.get('/services', async(req,res)=>{
    try{
        const services = await Service.find({enthusiastID: req.user.id}).populate([{path: 'packageID'}, {path: 'sessions', populate: {path: 'trainer', model: 'user'}}])
        res.status(200).send(services)
    } catch (err) {
        res.status(400).send(err)
        console.log(err)
    }

})



// USE THIS SHIT!!!!

router.get('/other-profile/:username', async (req, res) => {
    const { username } = req.params;
    const otherUser = await User.findOne({ username });
    const otherProfile = await Profile.findOne({ user: otherUser._id }).populate('user', ['firstname', 'lastname', 'username']);
    console.log(otherProfile);
    res.json(otherProfile);
})

// @route       /api/profiles
// @desc        Get a profile
router.get('/', async (req, res) => {
    const id = req.query.id;
    const findProfile = await Profile.findOne({ user: id }).populate('user', ['firstname', 'lastname']);
    // console.log('Profile found', findProfile);
    res.send(findProfile)
})

// @route       /api/profiles/follow/:id
// @desc        Put our profile id in the following profiles follower field, and put the following id in our profiles following field
router.get('/follow/:id', async (req, res) => {
    const followId = req.params.id;     // this is the otherUser's profile id

    // put their id in our following array
    const myProfile = await Profile.findById(req.user.profile);
    myProfile.following.push(followId);
    const mySavedProfile = await myProfile.save();
    console.log('*', mySavedProfile.following);

    // put our id in their followers array
    const otherProfile = await Profile.findOne({ user: followId });
    otherProfile.followers.push(req.user._id);
    const savedOtherProfile = await otherProfile.save();
    console.log('**the other profile', savedOtherProfile.followers);

    res.json(mySavedProfile.following);
})

// @route       /api/profiles/unfollow/:id
// @desc        Remove our profile id from the following profiles follower field and remove the following id from our profiles following field
router.get('/unfollow/:id', async (req, res) => {
    const followId = req.params.id;

    // find my profile and remove the followId from the following array
    const profile = await Profile.findById(req.user.profile);   // this is our profile- we are going to remove the followId from following
    const removeIndex = profile.following.findIndex(followingUser => followingUser === followId);
    profile.following.splice(removeIndex, 1);
    const savedProfile = await profile.save();
    console.log('----savedproffollw', savedProfile.following);


    // remove my user id from their followers array 
    const followingProfile = await Profile.findOne({ user: followId });  //isnt follow id a user id
    // console.log('the following profile kuz', followingProfile); 
    const removeIndexFollower = followingProfile.followers.findIndex(follower => follower === req.user._id);
    followingProfile.followers.splice(removeIndexFollower, 1);
    const savedFollowingProfile = await followingProfile.save();
    console.log('savedfollowingProfile', savedFollowingProfile.followers);


    res.json(savedProfile.following);
})

router.get('/clients', async (req, res) => {
    try {
        const clients = []
        const sessions = await Session.find({ trainer: req.user.id }).populate({ path: 'serviceID', populate: { path: 'enthusiastID' } })
        sessions.forEach((sesh) => {
            clients.push(sesh.serviceID.enthusiastID)
        })
        res.status(200).send(clients)
    }
    catch (err) {
        console.log(err)
        res.status(400).send(err)
    }

})

module.exports = router;