const mongoose = require('mongoose');

const ConversationSchema = mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    // might need an array of users if we also do group messaging? but this should work for now ^
    messages: [{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'message'
    }]
})

module.exports = mongoose.model('conversation', ConversationSchema);