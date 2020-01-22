const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    postOwnerUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    postOwnerPage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'page'
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    content: {
        type: String
    },
    image: {
        type: String
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    ],
    comments: [
        { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment'
        }
    ],
    shared: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('post', PostSchema);