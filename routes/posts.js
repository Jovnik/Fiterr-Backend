const express = require("express");
const router = express.Router();

const Profile = require('../models/Profile')
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Reply = require('../models/Reply');

const passport = require('passport')
const multer = require('multer');
const AWS = require('aws-sdk');

const storage = multer.memoryStorage();

const fields = [
  { name: "image" },
  { name: "postTitle" },
  { name: "postDescription" }
];

const upload = multer({ storage: storage }).fields(fields);

const s3credentials = new AWS.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY
});


router.get('/page-posts/:id', async(req, res) => {

  const { id } = req.params;

  const posts = await Post.find({ postOwnerPage: id}).sort({ date: -1 })
  .populate([
    {path: 'comments', 
      populate: [
       { path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'} }, 
       { path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'} } }
      ] 
    },
    {path: 'postOwnerUser', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}}
  ])

  res.json(posts);

})


// @route       /api/posts/newsfeed-posts
// @desc        Get the posts (from those you are following) that will make up the newsfeed
router.get('/newsfeed', async(req, res) => {

  const profile = await Profile.findOne({user: req.user._id});  // this is your profile
  const following = profile.following;  // following field contains USER ids
  following.push(req.user._id);

  let newsfeedPosts = [];

  for (const user of following) {
    let posts = await Post.find({postOwnerUser: user}).sort({ date: -1 })
    .populate([
      {path: 'comments', 
        populate: [
         { path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'} }, 
         { path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'} } }
        ] 
      },
      {path: 'postOwnerUser', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}}
    ]) ;
    newsfeedPosts = [...newsfeedPosts, ...posts];

  }
  
  const sortedPosts = newsfeedPosts.sort((post1, post2) => new Date(post2.date) - new Date(post1.date));
  console.log('these are the newsfeed posts', sortedPosts);

  res.json(newsfeedPosts);
})


router.get('/:id', async(req, res) => {
  console.log('THE PARAM', req.params.id);
  try {
    const posts = await Post.find({ postOwnerUser: req.params.id })
                            .sort({ date: -1 })
                            .populate([
                              {path: 'comments', 
                                populate: [
                                 { path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'} }, 
                                 { path: 'replies', populate: {path: 'user', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'} } }
                                ] 
                              },
                              {path: 'postOwnerUser', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}}
                            ])          


    // console.log('Posts for getposts', posts);

    res.json(posts);
    
  } catch (err) {
    console.log('ERROR', err);
    res.status(500).send('Server Error');
  }
})



// @route       /api/posts/create-post
// @desc        Delete a single post
router.post('/create-post', upload, async (req, res) => {
    try {
        const { postDescription, postOwnerPage } = req.body;
        const { image } = req.files

        console.log('HERE', postDescription, image, postOwnerPage);

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
            postOwnerUser: req.user._id,
            postOwnerPage: postOwnerPage,
            content: postDescription,
            image: imageUrl
        });
        const { _id } = await newPost.save();
        const savedPost = await Post.findById(_id).populate({path: 'postOwnerUser', select: 'firstname lastname', populate: {path: 'profile', select: 'displayImage'}})

        console.log('savedPost', savedPost)

        res.send(savedPost);

    } catch (err) {
        console.error('ERROR', err.message);
        res.status(500).send(err)
    };
});


// @route       /api/posts/delete-post/:id
// @desc        Delete a single post
router.delete('/:id', async(req, res) => {

    try {
      
      const post = await Post.findById(req.params.id);

      // Check you are the owning user
      if (!post.postOwnerUser.equals(req.user._id)) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      await post.remove();

      res.json({ msg: 'Post removed' });
      
    } catch (err) {
      console.error('ERROR', err.message);
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
      console.error('ERROR', err.message);
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
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

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

    const comment = await Comment.findById(commentId);
    await comment.remove();

    const post = await Post.findById(postId);
    const removeIndex = post.comments.findIndex(comment => comment._id.equals(commentId));
    post.comments.splice(removeIndex, 1);
    await post.save();

    res.json({ msg: 'post successfully removed'});

  } catch (err) {
    console.log('ERROR', err);
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