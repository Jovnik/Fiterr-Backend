const express = require("express");
const router = express.Router();
const Profile = require('../models/Profile')
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Reply = require('../models/Reply');
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

// @route       /api/posts/newsfeed-posts
// @desc        Get the posts (from those you are following) that will make up the newsfeed
router.get('/newsfeed', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });  // this is your profile
    const following = profile.following;  // following field contains USER ids
    following.push(req.user._id);
    let newsfeedPosts = [];
    for (const user of following) {
      let posts = await Post.find({ postOwnerUser: user }).sort({ date: -1 })
        .populate([
          {
            path: 'comments',
            populate: [
              { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } },
              { path: 'replies', populate: { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } } }
            ]
          },
          { path: 'postOwnerUser', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } }
        ]);
      newsfeedPosts = [...newsfeedPosts, ...posts];
    }
    const sortedPosts = newsfeedPosts.sort((post1, post2) => new Date(post2.date) - new Date(post1.date));
    res.status(200).json(newsfeedPosts);
  } catch (err) {
    res.status(500).send(err)
  }
})

// @route     /api/posts/:id
// @desc      finds all the posts for a user and populates it with all the components
router.get('/:id', async (req, res) => {
  try {
    const posts = await Post.find({ postOwnerUser: req.params.id })
      .sort({ date: -1 })
      .populate([
        {
          path: 'comments',
          populate: [
            { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } },
            { path: 'replies', populate: { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } } }
          ]
        },
        { path: 'postOwnerUser', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } }
      ])
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send(err);
  }
})

// @route       /api/posts/create-post
// @desc        deletes a single post
router.post('/create-post', upload, async (req, res) => {
  try {
    const { postDescription } = req.body;
    const { image } = req.files

    let imageUrl = null;

    if (image) {
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
    }

    const newPost = new Post({
      postOwnerUser: req.user._id,
      content: postDescription,
      image: imageUrl
    });
    const { _id } = await newPost.save();
    const savedPost = await Post.findById(_id).populate({ path: 'postOwnerUser', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } })

    res.status(200).send(savedPost);
  } catch (err) {
    res.status(500).send(err)
  };
});


// @route       /api/posts/delete-post/:id
// @desc        Delete a single post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check you are the owning user
    if (!post.postOwnerUser.equals(req.user._id)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await post.remove();
    res.status(200).json({ msg: 'Post removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
})



// @route    PUT api/posts/like/:id
// @desc     Likes a post
router.put('/like/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.status(200).json(post.likes);

  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Like a post
// @access   Private

router.put('/unlike/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // Get remove index
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.status(200).json(post.likes);

  } catch (err) {

    res.status(500).send('Server Error');
  }
});


// @route    POST api/posts/comment/:id
// @desc     Comment on a post
router.post('/comment/:id', async (req, res) => {
  try {
    // send back the populated comment
    const newComment = new Comment({
      user: req.user._id,
      post: req.params.id,
      text: req.body.text,
    });
    const { _id: commentId } = await newComment.save(); //commentId is a mongoose id object
    const comment = await Comment.findById(commentId).populate({
      path: 'user', select: 'firstname lastname',
      populate: { path: 'profile', model: 'profile', select: 'displayImage' }
    });

    const post = await Post.findById(req.params.id);
    post.comments.unshift(commentId);
    await post.save()

    res.status(200).json(comment);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route     /api/posts/remove-comment/:postId/:commentId
// @desc      deletes a comment on a specific post
router.delete('/remove-comment/:postId/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    await comment.remove();

    const post = await Post.findById(postId);
    const removeIndex = post.comments.findIndex(comment => comment._id.equals(commentId));
    post.comments.splice(removeIndex, 1);
    await post.save();

    res.status(200).json({ msg: 'post successfully removed' });
  } catch (err) {
    res.send(err)
  }
})

// @route    POST /api/posts/like-comment/:postId/:commentId
// @desc     Comment on a post
// @access   Private
router.put('/like-comment/:postId/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    comment.likes.push(req.user._id);
    await comment.save();

    const comments = await Comment.find({ post: postId }).populate([
      {
        path: 'user', select: 'firstname lastname',
        populate: { path: 'profile', model: 'profile', select: 'displayImage' }
      },
      { path: 'replies', populate: { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } } }
    ]);

    res.status(200).send(comments);
  } catch (err) {
    res.status(500).send('Server Error')
  }
})



// @route    POST api/posts/like-comment/:postId/:commentId
// @desc     Comment on a post
// @access   Private
router.put('/unlike-comment/:postId/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    const index = comment.likes.findIndex(like => like.equals(req.user._id));
    comment.likes.splice(index, 1);
    await comment.save();

    const comments = await Comment.find({ post: postId }).populate([
      {
        path: 'user', select: 'firstname lastname',
        populate: { path: 'profile', model: 'profile', select: 'displayImage' }
      },
      { path: 'replies', populate: { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } } }
    ]);

    res.status(200).json(comments);

  } catch (err) {
    res.status(500).send('Server Error')
  }
})


// @route:    /api/posts/add-reply/:postId/:commentId
// @desc:     add's reply to a comment on a post
router.post('/add-reply/:postId/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const newReply = new Reply({
      text: req.body.text,
      user: req.user.id,
      comment: commentId
    });
    const { _id: replyId } = await newReply.save();
    console.log('The id is', replyId);

    const comment = await Comment.findById(commentId);
    comment.replies.push(replyId);
    console.log('the comment replies is', comment.replies);
    await comment.save();

    const comments = await Comment.find({ post: postId }).populate([
      { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } },
      { path: 'replies', populate: { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } } }
    ]);

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).send(err)
  }
})

// @route:    /api/posts/remove-reply/:postId/:commentId/:replyId
// @desc:     removes a reply from a comment on a post
router.delete(`/remove-reply/:postId/:commentId/:replyId`, async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const reply = await Reply.findById(replyId);
    await reply.remove();

    const comment = await Comment.findById(commentId);
    const removeIndex = comment.replies.findIndex(reply => reply._id.equals(replyId));
    comment.replies.splice(removeIndex, 1);
    await comment.save();

    const comments = await Comment.find({ post: postId }).populate([
      { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } },
      { path: 'replies', populate: { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } } }
    ]);

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).send(err)
  }
})

// @route:   /api/posts/like-reply/:postId/:commentId/:replyId
// @desc     adds a like to a reply on a comment
router.put('/like-reply/:postId/:commentId/:replyId', async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const reply = await Reply.findById(replyId);
    reply.likes.push(req.user._id);
    await reply.save();

    const comments = await Comment.find({ post: postId }).populate([
      { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } },
      { path: 'replies', populate: { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } } }
    ]);

    res.json(comments);
  } catch (err) {
    res.status(500).send(err)
  }
});

// @route:    /api/posts/unlike-reply/:postId/:commentId/:replyId
// @desc      unlikes a comment of a reply on a post
router.put('/unlike-reply/:postId/:commentId/:replyId', async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const reply = await Reply.findById(replyId);
    const removeIndex = reply.likes.findIndex(like => like.equals(req.user._id));
    reply.likes.splice(removeIndex, 1);
    await reply.save();

    const comments = await Comment.find({ post: postId }).populate([
      { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } },
      { path: 'replies', populate: { path: 'user', select: 'firstname lastname', populate: { path: 'profile', select: 'displayImage' } } }
    ]);

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).send(err)
  }
});


module.exports = router;