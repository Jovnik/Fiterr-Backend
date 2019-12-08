const mongoose = require('mongoose');

const SessionSchema = mongoose.Schema({
    serviceID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service'
    },
    time: String,
    date: Date,
    location: String,
    complete: Boolean
})

module.exports = mongoose.model('session', SessionSchema);