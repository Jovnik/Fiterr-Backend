const mongoose = require('mongoose');

const ReplySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    },
    text: {
        type: String,
        required: true
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('reply', ReplySchema);