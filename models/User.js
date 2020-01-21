const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
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
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'professional'
    },
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profile'
    },
    phoneNumber: {
        type: String,
        default: null,
        required: false
    },
    pageOwned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'page'
    }
    
})

module.exports = mongoose.model("user", UserSchema);
