const mongoose = require('mongoose');

const ProfileSchema = mongoose.Schema({
    isProfessionalActive: {
        type: Boolean,
        default: false
    },
    following: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'users'
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'users'
    },
    images: [
        {
            imageLink: String,
            displayPhoto: {type: Boolean, default: false}
        }
    ], 
    aboutMe: String,
    fitnessInterests: String
})

module.exports = mongoose.model('profile', ProfileSchema);