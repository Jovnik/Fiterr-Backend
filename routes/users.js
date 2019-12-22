const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Post = require('../models/Post')

router.post('/register', async (req, res) => {

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        
        if(user){
            return res.status(400).send('This user already exists');
        }
        
        const hash = await bcrypt.hash(password, 10);
        user = new User(req.body);
        user.password = hash;
        await user.save()

        req.login(user, (err) => {
          if (err) {
            return res.status(404).send('error')
          } else {
            return res.send(user)
          }
        })

    } catch (err) {
        console.error(err.message);
        res.status(400).send('Server error');
    }
});


router.post('/login', (req, res) => {
    console.log('asdfasdfasdf');
    passport.authenticate('local', (err, user, info) => {
      if (err) { res.status(500).send(err) } // server error (eg. cant fetch data)
      else if (info) { return res.send(info) }   // login error messages from the local strategy (email not registered or password invalid)
      else {   
        // console.log('at this point a user has been found in the local strategy');
        req.login(user, (err) => {
          if(err) { return res.status(500).send(err) } // is this a different error to the 500 above?
        });    
        // now have access to req.user after logging in
        return res.status(200).json(req.user); 
      }
    })(req, res);
  }
)

router.get('/test', (req, res) => {
  console.log(req.user);
  res.json({ msg: 'Testing for req.user'})
})  


router.get('/logout', (req, res) => {
  console.log('logged out');
  console.log('1', req.user);
  req.logout();
  console.log('2', req.user);
  res.status(200).send('logged out')
});

// this needs to be an authenticated route
router.post('/search-users', async(req, res) => {
  const { search } = req.body
  console.log('The search term is:', search);
  // this query checks whether the firstname or lastname contains the search term
  const searchRegex = {"$regex": search, "$options": "i" };
  let searchResults = await User.find({$or: [{"firstname": searchRegex}, {"lastname": searchRegex}]});
  console.log(searchResults);
  res.json({ searchedUsers: searchResults });
})

router.post('/get-user', async(req, res) => {
  const ObjectId = require('mongoose').Types.ObjectId;
  const { id } = req.body;
  console.log('The id is', id);

  let searchResult;
  if(ObjectId.isValid(id)){
    console.log('we have a mongoose id');
    searchResult = await User.findOne({_id: id});
  } else {
    console.log('we dont have a mongoose id');
    searchResult = await User.findOne({username: id});
  }

  console.log(searchResult);
  res.json(searchResult);
  
})  
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

module.exports = router;