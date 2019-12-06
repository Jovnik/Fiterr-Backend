const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String
        // going to be required on the front end
    },
    gender: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    dateCreated: {
        type: String,
        default: Date.now
    },
    isProfessional: {
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
    }
})

module.exports = mongoose.model('user', UserSchema);