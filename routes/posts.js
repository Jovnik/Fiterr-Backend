const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Profile = require('../models/Profile')
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Reply = require('../models/Reply');

const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');

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


router.get('/:id', async(req, res) => {
  try {
    console.log('get the posts');
    const posts = await Post.find({ owningUser: req.params.id })
                            .sort({ date: -1 })
                            .populate(
                              {path: 'comments', 
                                populate: [
                                 { path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'} }, 
                                 { path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'} } }
                                ] 
                              })                           

    console.log(posts);

    res.json(posts);
    
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
})


// @route       /api/posts/newsfeed-posts
// @desc        Get the posts (from those you are following) that will make up the newsfeed
router.get('/newsfeed-posts', async(req, res) => {
  const profile = await Profile.findOne({user: req.user._id});  // this is your profile
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



// @route       /api/posts/create-post
// @desc        Delete a single post
// WORKS
router.post('/create-post', upload, async (req, res) => {
    try {
        const { postDescription } = req.body;
        const { image } = req.files

        console.log(postDescription, image);

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
            content: postDescription,
            image: imageUrl
        });
        // console.log(newPost);
        await newPost.save();
        res.send(newPost);

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send(err)
    };
});


// @route       /api/posts/delete-post/:id
// @desc        Delete a single post
router.delete('/:id', async(req, res) => {

    try {
      
      const post = await Post.findById(req.params.id);
      // console.log('This is the post', post);

      // Check you are the owning user
      if (!post.owningUser.equals(req.user._id)) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      await post.remove();

      res.json({ msg: 'Post removed' });
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
})


// @route    PUT api/posts/like/:id   // its a put request because technically we are updating the post
// @desc     Like a post
router.put('/like/:id', async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check if the post has already been liked - is there a better way to do this?
      if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
        return res.status(400).json({ msg: 'Post already liked' });
      }
  
      post.likes.unshift({ user: req.user.id });
  
      await post.save();

      console.log('The likes are now', post.likes);
  
      res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route    PUT api/posts/unlike/:id
// @desc     Like a post
// @access   Private
router.put('/unlike/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // Get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    console.log('The likes are now', post.likes);

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// 
router.post('/comment/:id', async (req, res) => {

    // express validation:
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    try {
      
      // send back the populated comment
      
      const newComment = new Comment({
        user: req.user._id,
        post: req.params.id,
        text: req.body.text,

      });
      const { _id: commentId} = await newComment.save(); //commentId is a mongoose id object
      const comment = await Comment.findById(commentId).populate({path: 'user', select: 'firstname lastname', 
                                                                    populate: {path: 'profile', model: 'profile', select: 'displayImage'}});

      // console.log('comment', comment);
      
      const post = await Post.findById(req.params.id);
      post.comments.unshift(commentId);
      await post.save()

      // as a result of not having big ass populate statements, we need to update the posts on the reducer with a bit of logic

      // not sending the updated posts comments anymore
      // going to directly send the comment and shift it into tthe current posts state 

      res.json(comment);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);


// delete a comment
router.delete('/remove-comment/:postId/:commentId', async(req, res) => {

  try {
    const { postId, commentId } = req.params;

    // const comment = await Comment.deleteOne(commentId);
    const comment = await Comment.findById(commentId);
    await comment.remove();
    // console.log(comment);

    const post = await Post.findById(postId);
    const removeIndex = post.comments.findIndex(comment => comment._id.equals(commentId));
    post.comments.splice(removeIndex, 1);
    await post.save();

    res.json({ msg: 'post successfully removed'});

  } catch (err) {
    console.log('THE ERROR HAS ARRIVED');
    console.log(err);
  }
})

// @route    POST api/posts/like-comment/:postId/:commentId
// @desc     Comment on a post
// @access   Private
router.put('/like-comment/:postId/:commentId', async(req, res) => {
  try {
    // just find the comment, update it with the like
    // then find all the comments attached to that post
    
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    comment.likes.push(req.user._id);
    await comment.save();

    const comments = await Comment.find({ post: postId }).populate([
                                                                {path: 'user', select: 'firstname lastname', 
                                                                  populate: {path: 'profile', model: 'profile', select: 'displayImage'}},
                                                                {path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}}}
                                                              ]);

    res.send(comments);

  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error') 
  }
})



// @route    POST api/posts/like-comment/:postId/:commentId
// @desc     Comment on a post
// @access   Private
router.put('/unlike-comment/:postId/:commentId', async(req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    const index = comment.likes.findIndex(like => like.equals(req.user._id));
    comment.likes.splice(index, 1);
    await comment.save();

    const comments = await Comment.find({ post: postId }).populate([
      {path: 'user', select: 'firstname lastname', 
        populate: {path: 'profile', model: 'profile', select: 'displayImage'}},
      {path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}}}
    ]);
    
    // console.log(comments);
    res.json(comments);

  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error') 
  }
})


// make a reply
router.post('/add-reply/:postId/:commentId', async(req, res) => {

  const { postId, commentId } = req.params;

  const newReply = new Reply({
    text: req.body.text,
    user: req.user.id,
    comment: commentId
  });
  const { _id: replyId} = await newReply.save();
  console.log('The id is', replyId);

  const comment = await Comment.findById(commentId);
  comment.replies.push(replyId);
  console.log('the comment replies is', comment.replies);
  await comment.save();

  const comments = await Comment.find({ post: postId }).populate([
    {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}},
    {path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}}}
  ]);

  res.json(comments);
})


router.delete(`/remove-reply/:postId/:commentId/:replyId`, async(req, res) => {

  const { postId, commentId, replyId } = req.params;

  const reply = await Reply.findById(replyId);
  await reply.remove();

  const comment = await Comment.findById(commentId);
  const removeIndex = comment.replies.findIndex(reply => reply._id.equals(replyId));
  comment.replies.splice(removeIndex, 1);
  await comment.save();

  const comments = await Comment.find({ post: postId }).populate([
    {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}},
    {path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}}}
  ]);

  res.json(comments);
})


router.put('/like-reply/:postId/:commentId/:replyId', async(req, res) => {

    const { postId, commentId, replyId } = req.params;

    const reply = await Reply.findById(replyId);
    reply.likes.push(req.user._id);
    await reply.save();

    const comments = await Comment.find({ post: postId }).populate([
      {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}},
      {path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}}}
    ]);

    res.json(comments);
});


router.put('/unlike-reply/:postId/:commentId/:replyId', async(req, res) => {

  const { postId, commentId, replyId } = req.params;

  const reply = await Reply.findById(replyId);
  const removeIndex = reply.likes.findIndex(like => like.equals(req.user._id));
  reply.likes.splice(removeIndex, 1);
  await reply.save();

  const comments = await Comment.find({ post: postId }).populate([
    {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}},
    {path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}}}
  ]);

  res.json(comments);
  
})


module.exports = router;