const mongoose = require('mongoose');

const ProfileSchema = mongoose.Schema({
    isProfessionalActive: {
        type: Boolean,
        default: false
    },
    following: [{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user'
    }],
    followers: [{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user'
    }],
    images: [String],
    displayImage: String, 
    aboutMe: String,
    fitnessInterests: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
})

module.exports = mongoose.model('profile', ProfileSchema);