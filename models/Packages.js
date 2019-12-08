const mongoose = require('mongoose');

const PackageSchema = mongoose.Schema({
    pageID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'page'
    },
    description: String,
    numberOfSessions: Number,
    price: Number
})

module.exports = mongoose.model('package', PackageSchema);