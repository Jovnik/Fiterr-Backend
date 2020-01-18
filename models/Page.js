const mongoose = require('mongoose');

const PageSchema = mongoose.Schema({
    pageHandle: String,
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
            ref: 'user'
        }
    ],
    contentCreators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'post'
    }]

})

module.exports = mongoose.model('page', PageSchema);