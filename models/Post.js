const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    owningUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment'
        }
    ],
    isPrivate: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
    },
    content: {
        type: String
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    shared: [
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

module.exports = mongoose.model('post', PostSchema);