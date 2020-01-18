const mongoose = require('mongoose');

const PageSchema = mongoose.Schema({
    pageOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    pageTitle: String,
    pageAbout: String,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    packages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'package'
        }
    ],
    trainers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'professional'
        }
    ],
    contentCreators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]

})

module.exports = mongoose.model('page', PageSchema);