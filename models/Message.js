const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    text: {
        type: String
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('message', MessageSchema);