const mongoose = require('mongoose');

const ProfessionalSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    myPageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'page'
    },
    associatedPagesId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'page'
    }],
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'session'
    }],
    clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],

})

module.exports = mongoose.model('professional', ProfessionalSchema);