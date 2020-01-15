const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    owningUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
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
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            },
            text: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            }
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