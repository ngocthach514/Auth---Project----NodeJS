const mongoose = require('mongoose');

const postScheme = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'description is required'],
        trim: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Posts', postScheme);