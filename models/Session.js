const mongoose = require('mongoose');

const SessionSchema = mongoose.Schema({
    serviceID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service'
    },
    trainerApproval: {type: Boolean, default: false},
    time: String,
    date: Date,
    location: String,
    complete: Boolean
})

module.exports = mongoose.model('session', SessionSchema);