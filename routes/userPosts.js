const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');
const Post = require('../models/Post')

const createPost = async (req, res) => {
    const { title, content } = req.body;

    /* Intake for owningUser can be either req.user.id or req.params.id* the second option is preferred */
    try {
        const newPost = new Post({
            owningUser: req.params.id,
            title: title,
            content: content,
        });
        await newPost.save();
        res.send(newPost);
    } catch (err) {
        res.status(500).send(err)
    };
    };

// /* findPost will be a function that finds all the posts created by the user */
// const findPost = async (req,res) => {

// }

router.get('/get-user-posts', async(req,res) => {
    const myPosts = await Post.find({owningUser: req.query.userID})
    res.json(myPosts)
})

/* findFollowingPost will be a function that finds 50 posts that the user is following */
router.get('/following-posts', async(req,res)=>{ //this will go in newsfeed router when matty uploads, needs testing 
    console.log(req.query)
    const following = JSON.parse(req.query.following)
    const posts = []
    following.forEach(async (followID) => {
      response = await Post.find({owningUser: followID}).limit(10) //find 10 most recent posts from each user they follow
      posts.push(response)
    })
    console.log(posts)
    // console.log('follow proms', followingPostsPromises)
    // let followingPosts = Promise.all(followingPostsPromises) // resolve promises of each user's posts
    // console.log('following', followingPosts)
    followingPosts.flat() // b/c each Post.find returns an array of objects need to flatten 1 level deep
    const sortedPosts = followingPosts.sort((post1,post2) => {
      return post2.postedAt - post1.postedAt
    })
    res.json(sortedPosts)
})

router.post('/create-post', createPost);

module.exports = router
/************************************************** user Register FITERR ***************************************************************/ 
// router.post('/register', async (req, res) => {

//     const { email, password } = req.body;

//     try {
//         let user = await User.findOne({ email });
        
//         if(user){
//             return res.status(400).send('This user already exists');
//         }
        
//         const hash = await bcrypt.hash(password, 10);
//         user = new User(req.body);
//         user.password = hash;
//         await user.save()

//         req.login(user, (err) => {
//           if (err) {
//             return res.status(404).send('error')
//           } else {
//             return res.send(user)
//           }
//         })

//     } catch (err) {
//         console.error(err.message);
//         res.status(400).send('Server error');
//     }
// });
/***********************************************************************************************************************************/ 


/************************************************** USER YOURBLOG ***************************************************************/ 
// User.findOne({ email: email })
// .then(user => {
//     if(user) {
//         errors.push({ msg: "Email is already Registered"})
//         res.render('register', {
//             errors,
//             email,
//             password,
//             password2
//         });
//     } else {
//         const newUser = new User({ 
//             profileId: null,
//             email,
//             password});
//             bcrypt.genSalt(15, (err, salt) => 
//                 bcrypt.hash(newUser.password, salt, (err, hash) => {
//             if (err) throw err;
//             newUser.password = hash
//             newUser.save()
//                 .then(user => {
//                     req.flash('success_msg', 'You are now registered and can login')
//                     res.redirect('/login')
//                 })
//                 .catch(err => console.log(err));
//         }))
//     }
// });
/***********************************************************************************************************************************/ 

/************************************************** PROFILE YOURBLOG ***************************************************************/ 
// Profile.findOne({ name: name })
//             .then(user => {
//                 if(user) {
//                     errors.push({ msg: "Name is already being used, try again!"})
//                     res.render('profile-signup', {
//                         user: req.user,
//                         errors,
//                         name,
//                         bio
//                     });
//                 } else {
//                     const newProfile = new Profile({ 
//                         userId: req.user._id,
//                         name,
//                         bio});
//                         newProfile.save()
//                             .then(doc => {                   
//                                  // Update the Users ProfileId
//                                 console.log();
//                                 currentUser.profileId = doc._id
//                                 currentUser.save((err, result) => {
//                                     req.flash('success_msg', "Your Profile is now setup!")
//                                     res.redirect(`/u/${newProfile.name}`)
//                                 })
//                             })
//                             .catch(err => console.log(err));
//                 }
/***********************************************************************************************************************************/ 

