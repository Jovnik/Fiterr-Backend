const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema({
    owningUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    postedAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('comment', CommentSchema);