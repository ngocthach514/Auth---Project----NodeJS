const { verify } = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:{
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: [true, 'Email must be unique'],
        minLength: [5, 'Email must be at least 5 characters'],
        lowercase: true,
    },
    password:{
        type: String,
        require: [true, 'Password is required'],
        trim: true,
        select: false
    },
    verified:{
        type: Boolean,
        default: false,
    },
    verificationCode:{
        type: String,
        select: false
    },
    verificationCodeValidation:{
        type: Number,
        select: false
    },
    fogotPasswordCode:{
        type: String,
        select: false
    },
    fogotPasswordCodeValidation:{
        type: Number,
        select: false
    }
},{
    timestamps:true
});

module.exports = mongoose.model("User", userSchema);