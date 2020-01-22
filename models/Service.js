const mongoose = require('mongoose');

const ServiceSchema = mongoose.Schema({
    enthusiastID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    professionalID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'professional'
    },
    packageID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'package'
    },
    DatePurchased: Date,
    quantityRemaining: Number,
    sessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'session'
    }],
    complete: {
        type: Boolean,
        default: false
    },
    pageID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'page'
    },
    receiptUrl: String
})

module.exports = mongoose.model('service', ServiceSchema);