const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile')
const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');
const Post = require('../models/Post')

const storage = multer.memoryStorage();

const fields = [
    {name: 'image'},
    {name: 'postTitle'},
    {name: 'postDescription'} 
]

const upload = multer({ storage: storage }).fields(fields);

const s3credentials = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY
});


/* findPost will be a function that finds all the posts created by the user */
const findPost = async (req,res) => {

}

/* findFollowingPost will be a function that finds 50 posts that the user is following */
const findFollowingPost = async (req, res) => {

}

// @route       /api/posts/my-posts
// @desc        Get posts that have been created by you
router.get('/my-posts', async(req, res) => {
    try {
        const myPosts = await Post.find({owningUser: req.user._id});
        // console.log(myPosts);
        res.send(myPosts);

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
})

// @route       /api/posts/create-post
// @desc        Delete a single post
router.post('/create-post', upload, async (req, res) => {
    try {
        const {postTitle, postDescription} = req.body;
        const { image } = req.files

        console.log(postTitle, postDescription);
        console.log(image);

        let imageUrl = null;

        if(image){
            const uniqueTimeValue = (Date.now()).toString();
            const name = image[0].originalname + image[0].size + req.user._id + uniqueTimeValue;

            const fileParams = {
                Bucket: process.env.BUCKET,
                Body: image[0].buffer,
                Key: name,
                ACL: 'public-read',
                ContentType: image[0].mimetype
            }

            const data = await s3credentials.upload(fileParams).promise();
            imageUrl = data.Location;
            console.log(imageUrl);
        }

        const newPost = new Post({
            owningUser: req.user._id,
            title: postTitle,
            content: postDescription,
            image: imageUrl
        });
        await newPost.save();
        res.send(newPost);

    } catch (err) {
        console.error(err.message);
        res.status(500).send(err)
    };
});

// @route       /api/posts/delete-post/:id
// @desc        Delete a single post
router.delete('/delete-post/:id', async(req, res) => {
    const id = req.params.id;
    // console.log(id);

    const post = await Post.findById(req.params.id);
    // console.log('We found the post: ', post);

    await Post.findByIdAndRemove(req.params.id);

    res.send('removed the post');
})

// @route       /api/posts/viewing-users-posts/:id
// @desc        Delete a single post
router.get('/viewing-users-posts/:id', async(req, res) => {
    // console.log('User id to get posts:', req.params.id);
    const viewingPosts = await Post.find({ owningUser: req.params.id });
    // console.log(viewingPosts);
    res.json(viewingPosts);
  })

// @route       /api/posts/newsfeed-posts
// @desc        Get the posts (from those you are following) that will make up the newsfeed
router.get('/newsfeed-posts', async(req, res) => {
    const profile = await Profile.findOne({user: req.user._id});
    // console.log(profile);
    const following = profile.following;  // following field contains PROFILE ids
    console.log(following);
  
    let newsfeedPosts = [];
    let userIds = [];
  
  
    for (const id of following) {
      let profile = await Profile.findById(id);
      // console.log('--', profile.user);
      userIds.push(profile.user)
    }
    // NOTE: if we use profile IDS to link to posts, then all code up to here is not needed
    // we just need the user ids to be able to loop through them and fetch their individual posts
  
  
    for (const user of userIds) {
      let posts = await Post.find({owningUser: user});
      newsfeedPosts = [...newsfeedPosts, ...posts];
      // console.log(posts);
    }
  
    // console.log('these are the newsfeed posts', newsfeedPosts);
  
    res.json(newsfeedPosts);
})

//------------------------------------------------------------------------------------
// jords
//experimental until matty posts backend routes/Post model fixed
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
//------------------------------------------------------------------------------------

module.exports = router;

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

