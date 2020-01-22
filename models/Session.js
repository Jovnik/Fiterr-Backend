const mongoose = require('mongoose');

const SessionSchema = mongoose.Schema({
    serviceID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service'
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    time: String,
    date: Date,
    location: String,
    complete: {
        type: Boolean,
        default: false
    },
    trainerApproval: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('session', SessionSchema);